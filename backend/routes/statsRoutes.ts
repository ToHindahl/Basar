import express from 'express';
import { getStatsByBasar } from '../controllers/statsController';

const router = express.Router();

router.get('/:basarId', getStatsByBasar);

export default router;