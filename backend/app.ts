import express from 'express';
import bodyParser from 'body-parser';
import basarRoutes from './routes/basarRoutes';
import itemRoutes from './routes/itemRoutes';
import pdfRoutes from './routes/pdfRoutes';
import loginRoutes from './routes/loginRoutes';
import statsRoutes from './routes/statsRoutes';
import { authenticateToken } from './middleware/authentication';
import dotenv from 'dotenv';

import morganMiddleware from './middleware/morganMiddleware'

dotenv.config(); // Load environment variables from .env file


import Logger from "./lib/Logger";
import sellerRoutes from './routes/sellerRoutes';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(morganMiddleware)
app.use('/basar', authenticateToken, basarRoutes);
app.use('/item', authenticateToken, itemRoutes);
app.use('/pdf', pdfRoutes);
app.use('/stats', authenticateToken, statsRoutes);
app.use('/seller', authenticateToken, sellerRoutes);
app.use('/login', loginRoutes)

app.listen(port, () => {
  Logger.debug(`Server is up and running @ http://localhost:${port}`);
});
