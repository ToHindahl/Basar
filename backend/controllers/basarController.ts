import { Request, Response } from 'express';
import { basarModel } from '../models/basarModel';
import { Basar } from '../models/basarModel';
import { v4 as uuidv4 } from 'uuid';

const bModel : basarModel= new basarModel();

const insertBasar = (req: Request, res: Response) => {
  const newBasar : Basar= {
    id: uuidv4().toString(),
    ...req.body
  }
  bModel.insertBasar(newBasar, (err : any) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json(newBasar);
  });
};

const removeBasar = (req: Request, res: Response) => {
  const basarId = req.params.basarId;
  const newBasar : Basar= {
    id: uuidv4().toString(),
    ...req.body
  }
  bModel.insertBasar(newBasar, (err : any) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json(newBasar);
  });
};

const getAllBasars = (req: Request, res: Response) => {
  bModel.getAllBasars((err : any, basars: Basar[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(basars);
  });
};

const getBasarsById = (req: Request, res: Response) => {
  const basarId = req.params.basarId;
  bModel.getBasarsById(basarId, (err : any, basar: Basar) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(basar);
  });
};

export { insertBasar, getAllBasars, getBasarsById };
