import { Request, Response } from 'express';
import { Item , ItemSale, itemModel } from '../models/itemModel';
import { Basar , basarModel } from '../models/basarModel';
import { v4 as uuidv4 } from 'uuid';
import PDFDocument from 'pdfkit-table';
import { statsModel, Stats } from '../models/statsModel';
import { LOGO_STRING, EurFormatter, calculateChecksum, generatePdf, generateQRCodeToBase64 } from '../utils';
import pug from 'pug';

import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';
import util from 'util';
import stream from 'stream';
import qrcode from 'qrcode';

const pipeline = util.promisify(stream.pipeline);

const iModel = new itemModel();
const bModel = new basarModel();
const sModel = new statsModel();

interface SalesList {
  [key: string]: {
    stats: {
      count: number,
      sum: number,
      commissionSum: number,
      payout: number
    },
    items: ItemSale[]}
}

const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>My PDF</title>
  </head>
  <body>
    <h1>Hello world!</h1>
  </body>
</html>
`

const getEmailPdf = async (req: Request, res: Response) => {

  try {
    const resp = await generatePdf(pug.renderFile('templates/label.pug', {sellerNumber: req.params.sellerNumber}));

    // Setze die PDF-Antwort-Header
    res.setHeader('Content-disposition', `inline; filename="label.pdf"`);
    res.setHeader('Content-type', 'application/pdf');

    // Pipe the PDF stream directly to the response
    await pipeline(resp, res);

      console.log('PDF generation and delivery successful');
  } catch (error) {
      console.error('PDF generation and delivery failed', error);
      res.status(500).send('Internal Server Error');
  }
}


const getAllPdfByBasar = (req: Request, res: Response) => {
  const basarId = req.params.basarId;

  sModel.getStatsByBasar(basarId, (err: any, stats: Stats)=> {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    bModel.getBasarsById(basarId, (err : any, basar: Basar) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      iModel.getAllItemsByBasar(basarId, (err : any, items : Item[]) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        //
        items = items.sort((a, b) => a.sellerId < b.sellerId ? -1 : 1);

            //create pdf
            const doc = new PDFDocument();
            //create frontpage
            doc.fontSize(42).text(`Verkäuferabrechnung`, { align: 'center' });
            doc.fontSize(42).text(basar.name, { align: 'center' });
            doc.fontSize(42).text(basar.date, { align: 'center' });
            //add image
            doc.image(LOGO_STRING, {fit: [500, 500], align: 'center'});

            //create stats page
            doc.addPage();
            doc.image(LOGO_STRING, 500, 15, {fit: [100, 100]});
            doc.fontSize(24).text(`Statistiken`, {align: "justify"});
            doc.fontSize(16).text(`Verkäufe: ${stats.soldItems}`, {align: "justify"});
            doc.fontSize(16).text(`Umsatz: ${EurFormatter(stats.totalPrice)}`, {align: "justify"});
            doc.fontSize(16).text(`Basar-Anteil: ${EurFormatter(stats.totalCommission)}`, {align: "justify"});
            doc.fontSize(16).text(`größter Schnapper: ${EurFormatter(stats.lowestPrice)}`, {align: "justify"});
            doc.fontSize(16).text(`edelste Perle: ${EurFormatter(stats.highestPrice)}`, {align: "justify"});
            doc.fontSize(16).text(`Durchschnittspreis: ${EurFormatter(stats.averagePrice)}`, {align: "justify"});
            doc.fontSize(16).text(`Artikel <5€: ${stats.countItemsVeryCheap}`, {align: "justify"});
            doc.fontSize(16).text(`Artikel 5-10€: ${stats.countItemsCheap}`, {align: "justify"});
            doc.fontSize(16).text(`Artikel 10-25€: ${stats.countItemsMedium}`, {align: "justify"});
            doc.fontSize(16).text(`Artikel >25€: ${stats.countItemsExpensive}`, {align: "justify"});
            doc.fontSize(16).text(`Verkäufer mit Verkauf: ${stats.countSellersWithSale}`, {align: "justify"});
            doc.fontSize(16).text(`Verkäufer ohne Verkauf: ${stats.countSellersNoSale}`, {align: "justify"});


        bModel.getSalesByBasar(basarId, (err : any, sales: SalesList) => {
          //insert all items by seller
          for (const seller in sales){
            //create a new page
            doc.addPage();
            doc.image(LOGO_STRING, 450, 60, {fit: [100, 100]});

            //prepare data
            const sellerItems = sales[seller];
            let tableRows: any[] = []
            sellerItems.items.forEach((item, index) => {
                tableRows.push([index +1, EurFormatter(item.price), EurFormatter(item.comission), EurFormatter(item.payout)])
            });

            //add stats
            doc.fontSize(10).text(basar.name, { align: 'left' });
            doc.fontSize(10).text(basar.date, { align: 'left' });
            doc.fontSize(13);
            doc.text(`Abrechnung für Verkäufernummer ${Number.parseInt(seller) * 10 + calculateChecksum(Number.parseInt(seller))}`, {align: "justify"});
            doc.moveDown(0.5);
            doc.fontSize(10);
            doc.text(`Verkaufte Artikel: ${sellerItems.stats.count}`, {align: "justify"});
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

            if (tableRows.length < 30){
              doc.addPage();
            }
          }
          
          const filename = `${basarId}_overview.pdf`;

          // Setze die PDF-Antwort-Header
          res.setHeader('Content-disposition', `inline; filename="${filename}"`);
          res.setHeader('Content-type', 'application/pdf');
      
          doc.end();
          // Schreibe den PDF-Inhalt in den HTTP-Antwort-Stream
          doc.pipe(res);
        });
      });
    });
  })
};

export { getAllPdfByBasar, getEmailPdf, SalesList };