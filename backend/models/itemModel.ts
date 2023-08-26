import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';

interface Item {
  id: string;
  sellerNumber: number;
  price: number;
  basarId: string;
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
        basarId TEXT,
        createdAt TEXT
      )
    `;
    this.db.run(query);
  }

  insertItem(item: Item, callback: (err: Error | null) => void) {
    const query = 'INSERT INTO items (id, sellerNumber, price, basarId, createdAt) VALUES (?, ?, ?, ?, ?)';
    this.db.run(query, [item.id, item.sellerNumber, item.price, item.basarId, item.createdAt], callback);
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
