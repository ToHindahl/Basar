import {Request, Response} from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Seller, sellerModel } from '../models/sellerModel';
import { basarModel } from '../models/basarModel';
import axios from 'axios';
import { getPretixOrderInformation, setSellerNumberPretix } from '../utils';
import { sendEmail } from '../email';
import pug from 'pug';
import { calculateChecksum } from '../utils';

const bModel : basarModel = new basarModel();
const sModel = new sellerModel();

const webhook = (req : Request, res : Response) => {
    console.log(req.body);
    
    switch (req.body.action) {
        case "pretix.event.order.placed":
            handlePretixOrderPlaced(req, res);
            break;
        case "pretix.event.order.canceled":
            handlePretixOrderCanceled(req, res);
            break;
        case "pretix.event.order.modified":
        case "pretix.event.order.changed":
            handlePretixOrderChanged(req, res);
            break;
        //case "pretix.event.checkin":
        //    handlePretixCheckIn(req, res);
        //    break;
        default:
            res.status(200).json({success: true});
            break;
    }
};

function handlePretixOrderPlaced(req : Request, res : Response) {
    getPretixOrderInformation(req.body.organizer, req.body.event, req.body.code).then((response) => {
        console.log(JSON.stringify(response.data));
        //insert new seller
        bModel.getBasarByPretixEventId(req.body.event, (err, basar) => {  
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            bModel.getNextFreeSellerNumberByBasar(basar.id, (err, sellerNumber) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }

                if(response.data.positions[0].voucher === null) {
                    const newSeller: Seller = {
                        id: uuidv4().toString(),
                        firstname: response.data.positions[0].attendee_name_parts.given_name,
                        lastname: response.data.positions[0].attendee_name_parts.family_name,
                        email: response.data.email,
                        telephone: response.data.phone,
                        commission: basar.commission,
                        basarId: basar.id,
                        sellerNumber: sellerNumber,
                        pretixOrderId: response.data.code,
                        //active: null,
                        //payout: null,
                        createdAt: new Date().toISOString(),
                    };
    
                    sModel.insertSeller(newSeller, (err) => {
                        if (err) {
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        console.log("createt dat seller");
                        //@ts-ignore
                        sendEmail(process.env.SMTP_FROM, response.data.email, "Basar", pug.renderFile('templates/email.pug', {name: "" + newSeller.firstname + " " + newSeller.lastname, sellerNumber: calculateChecksum(newSeller.sellerNumber), link: "https://crispy-halibut-r4jpprxq4rvhx44r-3000.preview.app.github.dev/pdf/email/" + basar.id + "/" + newSeller.id}))
                        setSellerNumberPretix(req.body.organizer, req.body.event, req.body.code, newSeller.sellerNumber);
                        res.status(201).json(newSeller);
                    });
                } else {
                    const newSeller: Seller = {
                        id: uuidv4().toString(),
                        firstname: response.data.positions[0].attendee_name_parts.given_name,
                        lastname: response.data.positions[0].attendee_name_parts.family_name,
                        email: response.data.email,
                        telephone: response.data.phone,
                        commission: 0,
                        basarId: basar.id,
                        sellerNumber: sellerNumber,
                        pretixOrderId: response.data.code,
                        //active: null,
                        //payout: null,
                        createdAt: new Date().toISOString(),
                    };
    
                    sModel.insertSeller(newSeller, (err) => {
                        if (err) {
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        console.log("createt dat Vorstand");
                        //@ts-ignore
                        sendEmail(process.env.SMTP_FROM, response.data.email, "Basar", pug.renderFile('templates/email.pug', {name: "" + newSeller.firstname + " " + newSeller.lastname, sellerNumber: calculateChecksum(newSeller.sellerNumber), link: "https://crispy-halibut-r4jpprxq4rvhx44r-3000.preview.app.github.dev/pdf/email/" + basar.id + "/" + newSeller.id}))
                        setSellerNumberPretix(req.body.organizer, req.body.event, req.body.code, newSeller.sellerNumber);
                        res.status(201).json(newSeller);
                    });
                }
                
            });
        });
    }).catch((err) => {
        res.status(500).json({ error: err.message });
    });
}

function handlePretixOrderCanceled(req : Request, res : Response) {
    getPretixOrderInformation(req.body.organizer, req.body.event, req.body.code).then((response) => {
        sModel.getSellerByPretixOrderId(response.data.code, (err, seller) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            sModel.deleteSellerWithItems(seller.id, (err, success) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                if (success) {
                    res.status(201).json(seller);
                }
                
            })
        })
    }).catch((err) => {
        res.status(500).json({ error: err.message });
    });
}

function handlePretixOrderChanged(req : Request, res : Response) {
    getPretixOrderInformation(req.body.organizer, req.body.event, req.body.code).then((response) => {
        console.log(JSON.stringify(response.data));


        sModel.getSellerByPretixOrderId(response.data.code, (err, seller) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            const updatedSeller: Seller = {
                id: seller.id,
                firstname: response.data.positions[0].attendee_name_parts.given_name,
                lastname: response.data.positions[0].attendee_name_parts.family_name,
                email: response.data.email,
                telephone: response.data.phone,
                commission: seller.commission,
                basarId: seller.basarId,
                sellerNumber: seller.sellerNumber,
                pretixOrderId: seller.pretixOrderId,
                //active: seller.active,
                //payout: seller.payout,
                createdAt: seller.createdAt,
            };
            
            sModel.updateSeller(updatedSeller, (err, success) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                if (success) {
                    res.status(201).json(updatedSeller);
                }
            });
            
        });
    }).catch((err) => {
        res.status(500).json({ error: err.message });
    });;
}

/*function handlePretixCheckIn(req : Request, res : Response) {
    bModel.getBasarByPretixEventId(req.body.event, (err, basar) => {
        sModel.getSellerByPretixOrderId(req.body.code, (err, seller) => {
            if(req.body.checkin_list == basar.pretixActivCheckInListId) {
                const updatedSeller: Seller = {
                    id: seller.id,
                    firstname: seller.firstname,
                    lastname: seller.lastname,
                    email: seller.email,
                    telephone: seller.telephone,
                    commission: seller.commission,
                    basarId: seller.basarId,
                    sellerNumber: seller.sellerNumber,
                    pretixOrderId: seller.pretixOrderId,
                    active: new Date().toISOString(),
                    payout: seller.payout,
                    createdAt: seller.createdAt
                };
                
                sModel.updateSeller(updatedSeller, (err, success) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    if (success) {
                        res.status(201).json(updatedSeller);
                    }
                });
            } else if(req.body.checkin_list == basar.pretixPayoutCheckInListId) {
                const updatedSeller: Seller = {
                    id: seller.id,
                    firstname: seller.firstname,
                    lastname: seller.lastname,
                    email: seller.email,
                    telephone: seller.telephone,
                    commission: seller.commission,
                    basarId: seller.basarId,
                    sellerNumber: seller.sellerNumber,
                    pretixOrderId: seller.pretixOrderId,
                    active: seller.active,
                    payout: new Date().toISOString(),
                    createdAt: seller.createdAt
                };
                
                sModel.updateSeller(updatedSeller, (err, success) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    if (success) {
                        res.status(201).json(updatedSeller);
                    }
                });
            } else {
                res.status(500).json({ error: "Not Configured Checkin" });
            }
        });
    });
}*/

export {
    webhook,
};