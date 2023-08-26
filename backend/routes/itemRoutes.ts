import express from 'express';
import { insertItem, getAllItemsByBasar } from '../controllers/itemController';

const router = express.Router();

router.post('/', insertItem);
router.get('/:basarId', getAllItemsByBasar);

export default router;
