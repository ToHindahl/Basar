import express from 'express';
import {
    insertBasar,
    getAllBasars,
    getBasarsById,
    deleteBasar,
    updateBasar
} from '../controllers/basarController';

const router = express.Router();

router.post('/', insertBasar);
router.get('/', getAllBasars)
router.get('/:basarId', getBasarsById)
router.delete('/:basarId', deleteBasar)
router.put('/', updateBasar)

export default router;
