import express from 'express';
import { insertSeller, updateSeller, deleteSeller, getAllSellersByBasar, gettSellerById } from '../controllers/sellerController';

const router = express.Router();

router.post('/', insertSeller);
router.delete('/:sellerId', deleteSeller);
router.put('/', updateSeller);
router.get('/basar/:basarId', getAllSellersByBasar);
router.get('/:sellerId', gettSellerById);

export default router;
