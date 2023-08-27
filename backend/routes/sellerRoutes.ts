import express from 'express';
import { insertSeller, updateSeller, deleteSeller } from '../controllers/sellerController';

const router = express.Router();

router.post('/', insertSeller);
router.delete('/:sellerId', deleteSeller);
router.put('/', updateSeller);

export default router;
