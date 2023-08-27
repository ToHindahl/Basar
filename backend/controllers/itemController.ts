import { Request, Response } from 'express';
import { Item , itemModel } from '../models/itemModel';
import { v4 as uuidv4 } from 'uuid';
import { basarModel } from '../models/basarModel';
import { Seller, sellerModel } from '../models/sellerModel';

const bModel = new basarModel();

const iModel = new itemModel();
const sModel = new sellerModel();

const insertItem = (req: Request, res: Response) => {
  sModel.getSellerByBasarIdBySellerNumber(req.body.basarId, req.body.sellerNumber, (err, seller) => {
    if (err) {

      const newSeller: Seller = {
        id: uuidv4().toString(),
        sellerNumber: req.body.sellerNumber,
        basarId: req.body.basarId,
        createdAt: new Date().toISOString(),
        firstname: '',
        lastname: '',
        email: '',
        telephone: '',
        commission: 0
      };
      sModel.insertSeller(newSeller, (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
       }
       insertItem(req, res);  
      });
    }

    const newItem: Item = {
      id: uuidv4().toString(),
      ...req.body,
      sellerId: seller.id,

      //@ts-ignore

      creator: req.user.username,
      createdAt: new Date().toISOString(),
    };

    iModel.getAllItemsBySellerId(newItem.sellerId, (err, items) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      bModel.getBasarsById(newItem.basarId, (err, basar) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        if(items.length >= basar.maxItemsPerSeller) {
          res.status(400).json({ error: 'Verkäufer hat das maximale Limit erreicht' });
          return;
        }
        if((seller.sellerNumber < basar.lowestSellerNumber) || (seller.sellerNumber > basar.highestSellerNumber)) {
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
  sModel.getSellerByBasarIdBySellerNumber(req.body.basarId, req.body.sellerNumber, (err, seller) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const basarId = req.params.basarId;
    const sellerNumber = req.params.sellerNumber as unknown as number;
    iModel.getAllItemsBySellerId(seller.id, (err : any, items : Item[]) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(items);
    });
  });
};

const getAllItemsByBasarByCreator = (req: Request, res: Response) => {
  const basarId = req.params.basarId;
  //@ts-ignore
  const creator = req.params.creator || req.user.username;
  iModel.getAllItemsByBasarByCreator(basarId, creator, (err : any, items : Item[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(items);
  });
};

export { insertItem, getAllItemsByBasar, getAllItemsByBasarBySeller, deleteItem, updateItem, getAllItemsByBasarByCreator };
