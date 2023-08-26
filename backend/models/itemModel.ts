import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';

interface Item {
  id: string;
  sellerNumber: number;
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
        sellerNumber INTEGER,
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
    const query = 'INSERT INTO items (id, sellerNumber, price, creator, page, basarId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)';
    this.db.run(query, [item.id, item.sellerNumber, item.price, item.creator, item.page, item.basarId, item.createdAt], callback);
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

  getAllItemsByBasarBySeller(basarId: string, sellerNumber: number, callback: (err: Error | null, items: Item[]) => void) {
    const query = 'SELECT * FROM items WHERE sellerNumber = ? AND basarId = ?';
    this.db.all(query, [sellerNumber, basarId], (err, rows) => {
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

  getItemsCountBySellerByBasar(sellerNumber: number, basarId: string, callback: (err: Error | null, count: number) => void) {
    const query = 'SELECT COUNT(*) AS count FROM items WHERE sellerNumber = ? AND basarId = ?';
    this.db.get(query, [sellerNumber, basarId], (err, row) => {
      if (err) {
        callback(err, 0);
        return;
      }
      callback(null, (row as any).count);
    });
  }

}

export { itemModel, Item, ItemSale };
