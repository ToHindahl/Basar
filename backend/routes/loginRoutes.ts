import express from 'express';
import { login, getUser } from '../controllers/loginController';
import { authenticateToken } from '../middleware/authentication';

const router = express.Router();

router.post('/', login);
router.get('/', authenticateToken, getUser);

export default router;