import express from 'express';
import bodyParser from 'body-parser';
import basarRoutes from './routes/basarRoutes';
import itemRoutes from './routes/itemRoutes';
import pdfRoutes from './routes/pdfRoutes';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use('/basar', basarRoutes);
app.use('/item', itemRoutes);
app.use('/pdf', pdfRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
