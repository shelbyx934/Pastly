// app.js
import cors from 'cors';
import express from 'express';
import pasteRouter from './routes/paste.routes.js';
import transferRouter from './routes/transfer.routes.js';
import { testPCloudApi } from './controllers/test.controller.js';

const app = express();

app.use(cors(
    {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173'
    }
));

app.use(express.json());

app.use('/api', pasteRouter);
app.use('/api', transferRouter);
app.use('/', transferRouter);

export default app;