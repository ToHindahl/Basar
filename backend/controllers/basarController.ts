import {Request, Response} from 'express';
import {basarModel} from '../models/basarModel';
import {Basar} from '../models/basarModel';
import {v4 as uuidv4} from 'uuid';
import { createPretixCheckInList } from '../utils';

const bModel: basarModel = new basarModel();

const insertBasar = (req : Request, res : Response) => {

    //createPretixCheckInList(req.body.pretixOrganizerId, req.body.pretixEventId, "active").then((response1) => {
        //createPretixCheckInList(req.body.pretixOrganizerId, req.body.pretixEventId, "payout").then((response2) => {    
            const newBasar: Basar = {
                id: uuidv4().toString(),
                ...req.body,
                //pretixActivCheckInListId: response1.data.id,
                //pretixPayoutCheckInListId: response2.data.id,
                createdAt: new Date().toISOString()
            };
            bModel.insertBasar(newBasar, (err : any) => {
                if (err) {
                    res.status(500).json({error: err.message});
                    return;
                }
                res.status(201).json(newBasar);
            });
       // });
   // });
};

const updateBasar = (req : Request, res : Response) => {
    const newBasar: Basar = {
        ...req.body
    }
    bModel.updateBasar(newBasar, (err : any, success : boolean) => {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        } else {
            res.status(201).json(success);
        }
    });
};

const deleteBasar = (req : Request, res : Response) => {
    const basarId = req.params.basarId;
    bModel.deleteBasar(basarId, (err : any, success : boolean) => {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        }
        res.status(201).json(success);
    });
};

const getAllBasars = (req : Request, res : Response) => {
    bModel.getAllBasars((err : any, basars : Basar[]) => {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        }
        res.json(basars);
    });
};

const getBasarsById = (req : Request, res : Response) => {
    const basarId = req.params.basarId;
    bModel.getBasarsById(basarId, (err : any, basar : Basar) => {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        }
        res.json(basar);
    });
};

export {
    insertBasar,
    getAllBasars,
    getBasarsById,
    deleteBasar,
    updateBasar
};
