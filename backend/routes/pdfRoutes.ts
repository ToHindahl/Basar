import express from 'express';
import { getAllPdfByBasar, getEmailPdf } from '../controllers/pdfController';

const router = express.Router();

router.get('/:basarId', getAllPdfByBasar);
router.get('/:basarId/:sellerNumber', getAllPdfByBasar); // Funktion ändern
router.get('/email/:basarId/:sellerNumber', getEmailPdf);

export default router;
