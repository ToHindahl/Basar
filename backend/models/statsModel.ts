import sqlite3 from 'sqlite3';
import {basarModel} from './basarModel';
import {SalesList} from '../controllers/pdfController';

const bModel = new basarModel();


interface Stats {
    soldItems: number,
    totalPrice: number,
    totalCommission: number,
    lowestPrice: number,
    highestPrice: number,
    averagePrice: number,
    countItemsVeryCheap: number,
    countItemsCheap: number,
    countItemsMedium: number,
    countItemsExpensive: number,
    countSellersNoSale: number,
    countSellersWithSale: number
}

class statsModel {

    constructor() {}

    getStatsByBasar(basarId : string, callback : (err : Error | null, stats : Stats) => void) {
        bModel.getSalesByBasar(basarId, (err : any, sales : SalesList) => {
            if (err) {
                callback(err, {} as Stats);
                return;
            }
            bModel.getBasarsById(basarId, (err, basar) => {
                if (err) {
                    callback(err, {} as Stats);
                    return;
                }

                // initiate stats
                let stats: Stats = {
                    soldItems: 0,
                    totalPrice: 0,
                    totalCommission: 0,
                    lowestPrice: Infinity,
                    highestPrice: -Infinity,
                    averagePrice: 0,
                    countItemsVeryCheap: 0,
                    countItemsCheap: 0,
                    countItemsMedium: 0,
                    countItemsExpensive: 0,
                    countSellersNoSale: 0,
                    countSellersWithSale: 0
                };

                // calculate stats
                for (const seller in sales) {
                    const sellerItems = sales[seller];
                    stats.countSellersWithSale += 1;
                    stats.soldItems += sellerItems.stats.count;
                    stats.totalPrice += sellerItems.stats.sum;
                    stats.totalCommission += sellerItems.stats.commissionSum;
                    sellerItems.items.forEach((item) => {
                        if (item.price<stats.lowestPrice){
                                stats.lowestPrice = item.price;
                            }
                            if (item.price>stats.highestPrice) {
                            stats.highestPrice = item.price;
                        }
                        if (item.price < 5) {
                            stats.countItemsVeryCheap += 1;
                        } else if (item.price >= 5 && item.price<= 10){
                                stats.countItemsCheap += 1;
                            } else if(item.price >= 10 && item.price <= 25) {
                            stats.countItemsMedium += 1;
                        } else {
                            stats.countItemsExpensive += 1;
                        }
                    })
                }
                // calculate average price
                stats.averagePrice = stats.totalPrice / stats.soldItems;

                // calculate sellers without sale, we assume every seller number was used
                stats.countSellersNoSale = Math.floor(basar.highestSellerNumber / 10) - Math.floor(basar.lowestSellerNumber / 10) - stats.countSellersWithSale;
                callback(null, stats);
            });
        });
    }
}

export {
    statsModel,
    Stats
};
