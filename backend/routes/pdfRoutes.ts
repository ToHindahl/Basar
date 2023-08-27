import express from 'express';
import { getAllPdfByBasar } from '../controllers/pdfController';

const router = express.Router();

router.get('/:basarId', getAllPdfByBasar);
router.get('/:basarId/:sellerNumber', getAllPdfByBasar); // Funktion ändern

export default router;
