
import express from 'express';
import { insertBasar, getAllBasars, getBasarsById } from '../controllers/basarController';

const router = express.Router();

router.post('/', insertBasar);
router.get('/', getAllBasars)
router.get('/:basarId', getBasarsById)

export default router;
