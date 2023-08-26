import { Request, Response } from 'express';
import { Item , ItemSale, itemModel } from '../models/itemModel';
import { Basar , basarModel } from '../models/basarModel';
import { v4 as uuidv4 } from 'uuid';
import PDFDocument from 'pdfkit-table';
import fs from 'fs';

const iModel = new itemModel();
const bModel = new basarModel();

interface SalesList {
  [key: number]: {
    stats: {
      count: number,
      sum: number,
      commissionSum: number,
      payout: number
    },
    items: ItemSale[]}
}


const getAllPdfByBasar = (req: Request, res: Response) => {
  const basarId = req.params.basarId;
  iModel.getAllItemsByBasar(basarId, (err : any, items : Item[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    //
    items = items.sort((a, b) => a.sellerNumber - b.sellerNumber);


    bModel.getSalesByBasar(basarId, (err : any, sales: SalesList) => {
        console.log(sales);
        //create pdf
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(`1_sales_report.pdf`); // Name des PDFs mit dem Verkäufernamen
        doc.pipe(stream);
        doc.fontSize(42).text(`Verkaufsübersicht für Basar: ${basarId}`, { align: 'center' });

        //insert all items by seller
        for (const seller in sales){
          //create a new page
          doc.addPage();

          //prepare data
          const sellerItems = sales[seller];
          let tableRows: any[] = []
          tableRows.push(["XXX", sellerItems.stats.count, sellerItems.stats.sum, sellerItems.stats.commissionSum, sellerItems.stats.payout])
          sellerItems.items.forEach((item, index) => {
              tableRows.push([index +1, item.id, item.price, item.comission, item.payout])
          });

          //create table
          (async function createTable(){
              const table = { 
              title: `Verkaufsübersicht für Verkäufer: ${seller}`,
              headers: ["Artikel Nummer", "Artikel ID", "Preis", "Basar Anteil", "Auszahlung"],
              datas: [],
              rows: tableRows,
              };
              await doc.table(table, { /** options */ });
          })();
        }

        //close
        doc.end();
    });
    res.json(items);
  });

};

export { getAllPdfByBasar, SalesList };