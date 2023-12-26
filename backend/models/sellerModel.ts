import sqlite3 from 'sqlite3';
import { itemModel, Item } from './itemModel';

const iModel = new itemModel();


interface Seller {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  telephone: string;
  sellerNumber: number;
  commission: number;
  basarId: string;
  pretixOrderId: string;
  //active?: string|null;
  //payout?: string|null;
  createdAt: string;
}

class sellerModel {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database('./db.sqlite'); // Verwende hier den Pfad zu deiner SQLite-Datei
    this.createTable();
  }

  createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS sellers (
        id TEXT PRIMARY KEY,
        firstname TEXT,
        lastname TEXT,
        email TEXT,
        telephone TEXT,
        sellerNumber INTEGER,
        commission REAL,
        basarId TEXT,
        pretixOrderId TEXT,
        createdAt TEXT
      )
    `;

    //Update QUerry
    // active TEXT,
    // payout TEXT,
    this.db.run(query);
  }

  insertSeller(seller: Seller, callback: (err: Error | null) => void) {
    const query = 'INSERT INTO sellers (id, firstname, lastname, email, telephone, sellerNumber, commission, basarId, pretixOrderId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    this.db.run(query, [seller.id, seller.firstname, seller.lastname, seller.email, seller.telephone, seller.sellerNumber, seller.commission, seller.basarId, seller.pretixOrderId, seller.createdAt], callback);
  }

  deleteSeller(sellerId: string, callback: (err: Error | null, success: boolean) => void) {

    iModel.getAllItemsBySellerId(sellerId, (err, items) => {
        if (err) {
            callback(Error(), false);
            return;
        }
        if(items.length > 0) {
            callback(Error("Verkäufer hat noch Artikel!"), false);
        } else {
            const query = 'DELETE FROM sellers WHERE id = ?';
            this.db.run(query, [sellerId],(err) => {
            if (err) {
                callback(err, false);
                return;
            }
            callback(null, true);
            });
        }
    });
  }

  deleteSellerWithItems(sellerId: string, callback: (err: Error | null, success: boolean) => void) {
    const query1 = 'DELETE FROM sellers WHERE id = ?';
    this.db.run(query1, [sellerId],(err) => {
      if (err) {
        callback(err, false);
        return;
      }
      const query2 = 'DELETE FROM items WHERE sellerId = ?';
      this.db.run(query2, [sellerId],(err) => {
        if (err) {
          callback(err, false);
          return;
        }
        callback(null, true);
      });
    });

  }

  updateSeller(seller: Seller, callback: (err: Error | null, success: boolean) => void) {
    const query = 'DELETE FROM sellers WHERE id = ?';
    this.db.run(query, [seller.id],(err) => {
      if (err) {
        callback(err, false);
        return;
      }
      this.insertSeller(seller, (err) => {
        if (err) {
          callback(err, false);
          return;
        }
        callback(null, true);
      } ); 
    });

  }

    getAllSellerByBasar(basarId: string, callback: (err: Error | null, sellers: Seller[]) => void) {
        const query = 'SELECT * FROM sellers WHERE basarId = ?';
        this.db.all(query, [basarId], (err, rows) => {
            if (err) {
                callback(err, []);
                return;
            }
            callback(null, rows as Seller[]);
        });
    }

  
    getSellerByBasarIdBySellerNumber(basarId: string, sellerNumber: number, callback: (err: Error | null, seller: Seller) => void) {
        const query = 'SELECT * FROM sellers WHERE basarId = ? AND sellerNumber = ?';
        this.db.get(query, [basarId, sellerNumber], (err, row) => {
            if (err) {
                callback(err, {} as Seller);
                return;
            }
            callback(null, row as Seller);
        });
    }

    getSellerById(sellerId: string, callback: (err: Error | null, seller: Seller) => void) {
        const query = 'SELECT * FROM sellers WHERE id = ?';
        this.db.get(query, [sellerId], (err, row) => {
            if (err) {
                callback(err, {} as Seller);
                return;
            }
            callback(null, row as Seller);
        });
    }

    getAllSellersByBasar(basarId: string, callback: (err: Error | null, sellers: Seller[]) => void) {
        const query = 'SELECT * FROM sellers WHERE basarId = ?';
        this.db.all(query, [basarId], (err, rows) => {
            if (err) {
                callback(err, []);
                return;
            }
            callback(null, rows as Seller[]);
        });
    }

    getSellerByPretixOrderId(pretixOrderId: string, callback: (err: Error | null, seller: Seller) => void) {
        const query = 'SELECT * FROM sellers WHERE pretixOrderId = ?';
        this.db.get(query, [pretixOrderId], (err, row) => {
            if (err) {
                callback(err, {} as Seller);
                return;
            }
            callback(null, row as Seller);
        });
    } 

}

export { sellerModel, Seller };
