import { Request, Response } from 'express';
import { Item , itemModel } from '../models/itemModel';
import { v4 as uuidv4 } from 'uuid';
import { basarModel } from '../models/basarModel';

const bModel : basarModel = new basarModel();

const iModel = new itemModel();

const insertItem = (req: Request, res: Response) => {
  const newItem: Item = {
    id: uuidv4().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };

  iModel.getItemsCountBySellerByBasar(newItem.sellerNumber, newItem.basarId, (err, count) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    bModel.getBasarsById(newItem.basarId, (err, basar) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if(count >= basar.maxItemsPerSeller) {
        res.status(400).json({ error: 'Verkäufer hat das maximale Limit erreicht' });
        return;
      }
      if((newItem.sellerNumber < basar.lowestSellerNumber) || (newItem.sellerNumber > basar.highestSellerNumber)) {
        res.status(400).json({ error: 'Verkäufernummer nicht im Nummernkreis' });
        return;
      }
      iModel.insertItem(newItem, (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.status(201).json(newItem);
      });
    });
  });
};

const updateItem = (req: Request, res: Response) => {
  const newItem : Item= {
    ...req.body
  }
  iModel.updateItem(newItem, (err : any, success : boolean) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json(success);
  });
};

const deleteItem = (req: Request, res: Response) => {
  const itemId = req.params.itemId;
  iModel.deleteItem(itemId, (err : any, success : boolean) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json(success);
  });
};

const getAllItemsByBasar = (req: Request, res: Response) => {
  const basarId = req.params.basarId;
  iModel.getAllItemsByBasar(basarId, (err : any, items : Item[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(items);
  });
};

const getAllItemsByBasarBySeller = (req: Request, res: Response) => {
  const basarId = req.params.basarId;
  const sellerNumber = req.params.sellerNumber as unknown as number;
  iModel.getAllItemsByBasarBySeller(basarId, sellerNumber, (err : any, items : Item[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(items);
  });
};

const getAllItemsByBasarByCreator = (req: Request, res: Response) => {
  const basarId = req.params.basarId;
  const creator = req.params.creator;
  iModel.getAllItemsByBasarByCreator(basarId, creator, (err : any, items : Item[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(items);
  });
};

export { insertItem, getAllItemsByBasar, getAllItemsByBasarBySeller, deleteItem, updateItem, getAllItemsByBasarByCreator };
