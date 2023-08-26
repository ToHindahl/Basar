import express from 'express';
import { insertItem, getAllItemsByBasar, updateItem, deleteItem, getAllItemsByBasarBySeller, getAllItemsByBasarByCreator } from '../controllers/itemController';

const router = express.Router();

router.post('/', insertItem);
router.get('/:basarId', getAllItemsByBasar);
router.get('/:basarId/seller/:sellerId', getAllItemsByBasarBySeller);
router.get('/:basarId/creator/:creator', getAllItemsByBasarByCreator);
router.delete('/:itemId', deleteItem);
router.put('/', updateItem);

export default router;
