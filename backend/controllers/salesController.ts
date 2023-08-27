import { Request, Response } from 'express';
import { basarModel } from '../models/basarModel';

const bModel : basarModel= new basarModel();

const getAllSalesByBasarId = (req: Request, res: Response) => {
    const basarId = req.params.basarId;
    bModel.getSalesByBasar(basarId, (err : any, sales : any) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(sales);
    });
};

const getAllSalesByBasarIdBySellerId = (req: Request, res: Response) => {
    const basarId = req.params.basarId;
    const sellerId = req.params.sellerId as unknown as number;
    bModel.getSalesByBasarBySeller(basarId, sellerId, (err : any, sales : any) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(sales);
    });
};

export { getAllSalesByBasarId, getAllSalesByBasarIdBySellerId };
