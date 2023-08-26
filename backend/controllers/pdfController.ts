import { Request, Response } from 'express';
import { Item , ItemSale, itemModel } from '../models/itemModel';
import { Basar , basarModel } from '../models/basarModel';
import { v4 as uuidv4 } from 'uuid';
import PDFDocument from 'pdfkit-table';

import { EurFormatter } from '../utils';

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

        //create pdf
        const doc = new PDFDocument();
        //const stream = fs.createWriteStream(`1_sales_report.pdf`); // Name des PDFs mit dem Verkäufernamen
        //doc.pipe(stream);
        doc.fontSize(42).text(`Verkaufsübersicht für Basar: ${basarId}`, { align: 'center' });

    bModel.getSalesByBasar(basarId, (err : any, sales: SalesList) => {
        console.log(sales);


        //insert all items by seller
        for (const seller in sales){
          //create a new page
          doc.addPage();

          //prepare data
          const sellerItems = sales[seller];
          let tableRows: any[] = []
          sellerItems.items.forEach((item, index) => {
              tableRows.push([index +1, EurFormatter(item.price), EurFormatter(item.comission), EurFormatter(item.payout)])
          });

          //add stats
          doc.fontSize(13);
          doc.text(`Abrechnung für Verkäufernummer ${seller}`, {align: "justify"});
          doc.moveDown(0.5);
          doc.fontSize(10);
          doc.text(`Artikel Anzahl: ${sellerItems.stats.count}`, {align: "justify"});
          doc.moveDown(0.5);
          doc.text(`Summe: ${EurFormatter(sellerItems.stats.sum)}`, {align: "justify"});
          doc.moveDown(0.5);
          doc.text(`Basar-Anteil: ${EurFormatter(sellerItems.stats.commissionSum)}`, {align: "justify"});
          doc.moveDown(0.5);
          doc.text(`Auszahlung: ${EurFormatter(sellerItems.stats.payout)}`, {align: "justify"});
          doc.moveDown(0.5);

          //create table
          (async function createTable(){
              const table = { 
              title: `Verkaufte Artikel`,
              headers: ["Artikel Nummer", "Preis", "Basar Anteil", "Auszahlung"],
              datas: [],
              rows: tableRows,
              };
              await doc.table(table, { /** options */ });
          })();
        }
        
        const filename = `${basarId}_overview.pdf`;

        // Setze die PDF-Antwort-Header
        res.setHeader('Content-disposition', `inline; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');
    
        // Schreibe den PDF-Inhalt in den HTTP-Antwort-Stream
        doc.pipe(res);
    
        doc.end();
        
    });


  });

};

export { getAllPdfByBasar, SalesList };