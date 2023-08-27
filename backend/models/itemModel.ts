import sqlite3 from 'sqlite3';

interface Item {
  id: string;
  sellerId: string;
  price: number;
  basarId: string;
  creator: string;
  page: number;
  createdAt: string;
}

interface ItemSale extends Item {
  comission: number;
  payout: number;
}

class itemModel {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database('./db.sqlite'); // Verwende hier den Pfad zu deiner SQLite-Datei
    this.createTable();
  }

  createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        sellerId TEXT,
        price REAL,
        creator TEXT,
        page INTEGER,
        basarId TEXT,
        createdAt TEXT
      )
    `;
    this.db.run(query);
  }

  insertItem(item: Item, callback: (err: Error | null) => void) {
    const query = 'INSERT INTO items (id, sellerId, price, creator, page, basarId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)';
    this.db.run(query, [item.id, item.sellerId, item.price, item.creator, item.page, item.basarId, item.createdAt], callback);
  }

  deleteItem(itemId: string, callback: (err: Error | null, success: boolean) => void) {
    const query = 'DELETE FROM items WHERE id = ?';
    this.db.run(query, [itemId],(err) => {
      if (err) {
        callback(err, false);
        return;
      }
      callback(null, true);
    });
  }

  updateItem(item: Item, callback: (err: Error | null, success: boolean) => void) {
    const query = 'DELETE FROM items WHERE id = ?';
    this.db.run(query, [item.id],(err) => {
      if (err) {
        callback(err, false);
        return;
      }
      this.insertItem(item, (err) => {
        if (err) {
          callback(err, false);
          return;
        }
        callback(null, true);
      } ); 
    });

  }

  getAllItemsByBasar(basarId: string, callback: (err: Error | null, items: Item[]) => void) {
    const query = 'SELECT * FROM items WHERE basarId = ?';
    this.db.all(query, [basarId], (err, rows) => {
      if (err) {
        callback(err, []);
        return;
      }
      callback(null, rows as Item[]);
    });
  }

  getAllItemsBySellerId(sellerId: string, callback: (err: Error | null, items: Item[]) => void) {
    const query = 'SELECT * FROM items WHERE sellerId = ?';
    this.db.all(query, [sellerId], (err, rows) => {
      if (err) {
        callback(err, []);
        return;
      }
      callback(null, rows as Item[]);
    });
  }

  getAllItemsByBasarByCreator(basarId: string, creator: string, callback: (err: Error | null, items: Item[]) => void) {
    const query = 'SELECT * FROM items WHERE creator = ? AND basarId = ?';
    this.db.all(query, [creator, basarId], (err, rows) => {
      if (err) {
        callback(err, []);
        return;
      }
      callback(null, rows as Item[]);
    });
  }

}

export { itemModel, Item, ItemSale };
