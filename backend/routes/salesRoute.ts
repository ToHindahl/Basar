import express from 'express';
import { getAllSalesByBasarId, getAllSalesByBasarIdBySellerId } from '../controllers/salesController';

const router = express.Router();

router.get('/:basarId', getAllSalesByBasarId);
router.get('/:basarId/:sellerNumber', getAllSalesByBasarIdBySellerId); // Funktion ändern

export default router;
