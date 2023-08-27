import { Request, Response } from 'express';
import { Item , itemModel } from '../models/itemModel';
import { v4 as uuidv4 } from 'uuid';
import { basarModel } from '../models/basarModel';
import { Seller, sellerModel } from '../models/sellerModel';

const bModel : basarModel = new basarModel();

const iModel = new itemModel();

const sModel = new sellerModel();

const insertSeller = (req: Request, res: Response) => {
    bModel.getNextFreeSellerNumberByBasar(req.body.basarId, (err, sellerNumber) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        const newSeller: Seller = {
            id: uuidv4().toString(),
            ...req.body,
            sellerNumber: sellerNumber,
            createdAt: new Date().toISOString(),
        };

        sModel.insertSeller(newSeller, (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json(newSeller);
    });
    });

};

const updateSeller = (req: Request, res: Response) => {
  const newSeller : Seller= {
    ...req.body
  }
  sModel.updateSeller(newSeller, (err : any, success : boolean) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json(success);
  });
};

const deleteSeller = (req: Request, res: Response) => {
  const sellerId = req.params.sellerId;
  sModel.deleteSeller(sellerId, (err : any, success : boolean) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json(success);
  });
};

export { insertSeller, updateSeller, deleteSeller };
