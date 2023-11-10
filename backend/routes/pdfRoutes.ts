import express from 'express';
import { getAllPdfByBasar, getEmailPdf, getAllPdfByBasarNew } from '../controllers/pdfController';

const router = express.Router();

router.get('/:basarId', getAllPdfByBasarNew);
router.get('/:basarId/:sellerNumber', getAllPdfByBasar); // Funktion ändern
router.get('/email/:basarId/:sellerId', getEmailPdf);

export default router;
