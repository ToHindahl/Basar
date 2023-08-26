import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { Item , itemModel, ItemSale } from '../models/itemModel';
import { calculateChecksum } from '../utils';
import { SalesList } from '../controllers/pdfController';

const iModel = new itemModel();

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
  commissionFreeSellers : number;
}

class basarModel {
  private db: sqlite3.Database;

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
        commissionFreeSellers INTEGER
      )
    `;
    this.db.run(query);
  }

  insertBasar(basar: Basar, callback: (err: Error | null) => void) {
    console.log(basar);

    const query = `
      INSERT INTO basars 
      (id, name, date, location, organizer, commission, maxItemsPerSeller, lowestSellerNumber, highestSellerNumber, commissionFreeSellers) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    this.db.run(
      query,
      [
        basar.id,
        basar.name,
        basar.date,
        basar.location,
        basar.organizer,
        basar.commission,
        basar.maxItemsPerSeller,
        basar.lowestSellerNumber,
        basar.highestSellerNumber,
        basar.commissionFreeSellers
      ],
      callback
    );
  }
  getAllBasars(callback: (err: Error | null, basars: Basar[]) => void) {
    const query = 'SELECT * FROM basars';
    this.db.all(query, (err, rows) => {
      if (err) {
        callback(err, []);
        return;
      }
      callback(null, rows as Basar[]);
    });
  }

  deleteBasar(basarId: string, callback: (err: Error | null, success: boolean) => void) {
    const query1 = 'DELETE FROM basars WHERE id = ?';
    this.db.run(query1, [basarId],(err) => {
      if (err) {
        callback(err, false);
        return;
      }
      const query2 = 'DELETE FROM items WHERE basarId = ?';
      this.db.run(query2, [basarId],(err) => {
        if (err) {
          callback(err, false);
          return;
        }
        callback(null, true);
      });
    });
  }

  updateBasar(basar: Basar, callback: (err: Error | null, success: boolean) => void) {
    const query = 'DELETE FROM basars WHERE id = ?';
    this.db.run(query, [basar.id],(err) => {
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
      } ); 
    });

  }
  
  getBasarsById(basarId: string, callback: (err: Error | null, basar: Basar) => void) {
    const query = 'SELECT * FROM basars WHERE id = ?';
    this.db.get(query, [basarId], (err, row) => {
      if (err) {
        callback(err, {} as Basar);
        return;
      }
      callback(null, row as Basar);
    });
  }

  getSalesByBasar(basarId: string, callback: (err: Error | null, sales: SalesList) => void) {
    iModel.getAllItemsByBasar(basarId, (err : any, items : Item[]) => {
      if (err) {
        callback(err, {});
        return;
      }

      items = items.sort((a, b) => a.sellerNumber - b.sellerNumber);
  
      //split into lists bs seller numbers
      let sellers: {[key: number]: Item[]} = {};
      items.forEach((item) => {
        if (item.sellerNumber in sellers) {
          sellers[item.sellerNumber].push(item);
        } else {
          sellers[item.sellerNumber] = [item];
        }
      });

      let result: SalesList = {};

      this.getBasarsById(basarId, (err : any, basar: Basar) => {
        if (err) {
          callback(err, {});
          return;
        }
        let i = Math.floor(basar.lowestSellerNumber / 10) + basar.commissionFreeSellers - 1

        for (const seller in sellers) {
          //calculate comission
          let commission = 0;
          if(Number.parseInt(seller) > (i * 10 + calculateChecksum(i))) {
            commission = basar.commission
          }

          //
          let sum = 0;
          let comSum = 0;
          let count = 0;
          let sellerItemSales: ItemSale[] = []
          sellers[seller].forEach((item) => {
            count += 1;
            sum += item.price;
            const saleCom = (item.price * commission / 100);
            const salePayout = item.price - saleCom;
            comSum += saleCom;
            sellerItemSales.push({...item, comission: saleCom, payout: salePayout})
          })
          const payout = sum - comSum;
          
          //extend result
          result[seller] = {stats: {count: count, sum: sum, commissionSum: comSum, payout: payout}, items: sellerItemSales};
        }
        //return SalesList result
        callback(null, result);
      });
    });
  }

  getSalesByBasarBySeller(basarId: string, sellerNumber: number, callback: (err: Error | null, sales: any[]) => void) {
    iModel.getAllItemsByBasarBySeller(basarId, sellerNumber, (err : any, items : Item[]) => {
      if (err) {
        callback(err, []);
        return;
      }
      callback(null, items as any);
    });
  }

}

export { Basar, basarModel };