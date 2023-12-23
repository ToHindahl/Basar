import sqlite3 from 'sqlite3';
import {Item, itemModel, ItemSale} from './itemModel';
import {SalesList} from '../controllers/pdfController';
import {Seller, sellerModel} from './sellerModel';

const iModel = new itemModel();
const sModel = new sellerModel();

interface Basar {
    id: string;
    name: string;
    date: string;
    location: string;
    organizer: string;
    commission: number;
    maxItemsPerSeller: number;
    lowestSellerNumber: number;
    highestSellerNumber: number;
    pretixEventId: string;
    pretixOrganizerId: string;
    //pretixActivCheckInListId: string;
    //pretixPayoutCheckInListId: string;
    createdAt: string;
}

class basarModel {
    private db : sqlite3.Database;

    constructor() {
        this.db = new sqlite3.Database('./db.sqlite'); // Verwende hier den Pfad zu deiner SQLite-Datei
        this.createTable();
    }

    createTable() {
        const query = `
      CREATE TABLE IF NOT EXISTS basars (
        id TEXT PRIMARY KEY,
        name TEXT,
        date TEXT,
        location TEXT,
        organizer TEXT,
        commission REAL,
        maxItemsPerSeller INTEGER,
        lowestSellerNumber INTEGER,
        highestSellerNumber INTEGER,
        pretixEventId TEXT,
        pretixOrganizerId TEXT,
        createdAt TEXT
      )
    `;

    // Insert into Statement
    //pretixActivCheckInListId TEXT,
    //pretixPayoutCheckInListId TEXT,
        this.db.run(query);
    }

    insertBasar(basar : Basar, callback : (err : Error | null) => void) {

        const query = `
      INSERT INTO basars 
      (id, name, date, location, organizer, commission, maxItemsPerSeller, lowestSellerNumber, highestSellerNumber, pretixEventId, pretixOrganizerId, createdAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        this.db.run(query, [
            basar.id,
            basar.name,
            basar.date,
            basar.location,
            basar.organizer,
            basar.commission,
            basar.maxItemsPerSeller,
            basar.lowestSellerNumber,
            basar.highestSellerNumber,
            basar.pretixEventId,
            basar.pretixOrganizerId,
            //basar.pretixActivCheckInListId,
            //basar.pretixPayoutCheckInListId,
            basar.createdAt
        ], callback);
    }
    getAllBasars(callback : (err : Error | null, basars : Basar[]) => void) {
        const query = 'SELECT * FROM basars';
        this.db.all(query, (err, rows) => {
            if (err) {
                callback(err, []);
                return;
            }
            callback(null, rows as Basar[]);
        });
    }

    deleteBasar(basarId : string, callback : (err : Error | null, success : boolean) => void) {
        const query1 = 'DELETE FROM basars WHERE id = ?';
        this.db.run(query1, [basarId], (err) => {
            if (err) {
                callback(err, false);
                return;
            }
            const query2 = 'DELETE FROM items WHERE basarId = ?';
            this.db.run(query2, [basarId], (err) => {
                if (err) {
                    callback(err, false);
                    return;
                }
                callback(null, true);
            });
        });
    }

    updateBasar(basar : Basar, callback : (err : Error | null, success : boolean) => void) {
        this.getBasarsById(basar.id, (err : any, oldBasar : Basar) => {
                if (err) {
                        callback(err, false);
                        return;
                    }

                    this.getHighestSellerNumberByBasar(oldBasar.id, (err : any, sellerNumber : number) => {
                        if (err) {
                            callback(err, false);
                            return;
                        }

                        // check if we can resize the basar
                        if (basar.highestSellerNumber<sellerNumber) {
          callback(new Error("Can not resize Basar because highest Seller is higher than your input!"), false);
          return;
        } else {
          //update
          const query = 'DELETE FROM basars WHERE id = ?';
          this.db.run(query, [basar.id], (err) => {
                            if (err) {
                                callback(err, false);
                                return;
                            }
                            this.insertBasar(basar, (err) => {
                                if (err) {
                                    callback(err, false);
                                    return;
                                }
                                callback(null, true);
                            });
                        }) 
                        
                    }}
            );
        }
    );
}

getBasarsById(basarId : string, callback : (err : Error | null, basar : Basar) => void) {
    const query = 'SELECT * FROM basars WHERE id = ?';
    this.db.get(query, [basarId], (err, row) => {
        if (err) {
            callback(err, {} as Basar);
            return;
        }
        callback(null, row as Basar);
    });
}

getSalesByBasar(basarId : string, callback : (err : Error | null, sales : SalesList) => void) {
    sModel.getAllSellerByBasar(basarId, (err : any, sellersList : Seller[]) => {
        if (err) {
            callback(err, {});
            return;
        }

        let sellersIdDict: {[key:string]:{number:number, commission:number}} = {};
        let sellersNumberDict: {[key:number]:{id:string, commission:number}} = {};
        sellersList.forEach((seller) => {
            sellersIdDict[seller.id] = {number: seller.sellerNumber, commission: seller.commission};
            sellersNumberDict[seller.sellerNumber] = {id: seller.id, commission: seller.commission};
        })

        iModel.getAllItemsByBasar(basarId, (err : any, items : Item[]) => {
            if (err) {
                callback(err, {});
                return;
            }

            items = items.sort((a, b) => a.sellerId<b.sellerId ? -1 : 1);
    
        //split into lists by seller numbers
        let sellers: {[key: number]: Item[]} = {};
        items.forEach((item) => {
                let sellerNumber = sellersIdDict[item.sellerId].number 
                if (sellerNumber in sellers) {
                    sellers[sellerNumber].push(item);
                } else {
                    sellers[sellerNumber] = [item];
                }
            });

            let result: SalesList = {};

            this.getBasarsById(basarId, (err : any, basar : Basar) => {
                if (err) {
                    callback(err, {});
                    return;
                }
                for (const seller in sellers) { //
                    let sum = 0;
                    let comSum = 0;
                    let count = 0;
                    let sellerItemSales: ItemSale[] = []
                    sellers[seller].forEach((item) => {
                        count += 1;
                        sum += item.price;
                        const saleCom = (item.price * sellersNumberDict[seller].commission / 100);
                        const salePayout = item.price - saleCom;
                        comSum += saleCom;
                        sellerItemSales.push({
                            ...item,
                            comission: saleCom,
                            payout: salePayout
                        })
                    })
                    const payout = sum - comSum;

                    // extend result
                    result[seller] = {
                        stats: {
                            count: count,
                            sum: sum,
                            commissionSum: comSum,
                            payout: payout
                        },
                        items: sellerItemSales
                    };
                }
                // return SalesList result
                callback(null, result);
            });
        });
    });
}

getSalesByBasarBySeller(basarId : string, sellerNumber : number, callback : (err : Error | null, sales : any[]) => void) {
    sModel.getSellerByBasarIdBySellerNumber(basarId, sellerNumber, (err : any, seller) => {
        if (err) {
            callback(err, []);
            return;
        }

        iModel.getAllItemsBySellerId(seller.id, (err : any, items : Item[]) => {
            if (err) {
                callback(err, []);
                return;
            }
            callback(null, items as any);
        });
    });
}

getNextFreeSellerNumberByBasar(basarId : string, callback : (err : Error | null, sellerNumber : number) => void) {
    const query = 'SELECT sellerNumber FROM sellers WHERE basarId = ? ORDER BY sellerNumber ASC';
    this.getBasarsById(basarId, (err, basar) => {
        if (err) {
            callback(err, -1);
            return;
        }

        this.db.all(query, [basarId], (err, rows) => {
            if (err) {
                callback(err, -1);
                return;
            }

            if (rows.length === 0) { // If no rows found, the first available seller number is 1
                callback(null, basar.lowestSellerNumber);
            } else {
                let nextSellerNumber = basar.lowestSellerNumber;
                for (let i = 0; i < rows.length; i++) {
                    if ((rows[i] as {
                        sellerNumber : number
                    }).sellerNumber === nextSellerNumber) {
                        nextSellerNumber++;
                    } else { // Found a gap in seller numbers
                        callback(null, nextSellerNumber);
                        return;
                    }
                }
                if ((rows[rows.length - 1] as {
                    sellerNumber : number
                }).sellerNumber + 1 > basar.highestSellerNumber) {
                    callback(new Error("No new seller numbers left for this basar!"), -1);
                    return;
                }
                // If all existing seller numbers are consecutive, use the next number after the highest
                callback(null, (rows[rows.length - 1] as {
                    sellerNumber : number
                }).sellerNumber + 1);
            }
        });
    });
}

getHighestSellerNumberByBasar(basarId : string, callback : (err : Error | null, sellerNumber : number) => void) {
    const query = 'SELECT MAX(sellerNumber) AS maxSellerNumber FROM sellers WHERE basarId = ?';
    this.db.get(query, [basarId], (err, row) => {
        if (err) {
            callback(err, -1);
            return;
        }
        console.log(row)
        callback(null, (row as {
            maxSellerNumber: number
        }).maxSellerNumber);
    });
}

getBasarByPretixEventId(pretixEventId : string, callback : (err : Error | null, basar : Basar) => void) {
    const query = 'SELECT * FROM basars WHERE pretixEventId = ?';
    this.db.get(query, [pretixEventId], (err, row) => {
        if (err) {
            callback(err, {} as Basar);
            return;
        }
        callback(null, row as Basar);
    });
}

}

export { Basar, basarModel};
