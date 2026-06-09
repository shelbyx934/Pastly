// app.js
import express from 'express';
import pasteRouter from './routes/paste.routes.js';
import transferRouter from './routes/transfer.routes.js';

const app = express();

app.use(express.json());

app.use('/api', pasteRouter);
app.use('/api', transferRouter);
app.use('/', transferRouter);

export default app;