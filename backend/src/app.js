import express from 'express';
import pasteRouter from './routes/paste.routes.js';
import { mongoose } from 'mongoose';
import dotenv from 'dotenv';
import cleanupExpiredPastes from './jobs/cleanupExpiredPastes.js';

dotenv.config();

console.log('PCloud Auth Token:', process.env.PCLOUD_AUTH_TOKEN);

mongoose.connect('mongodb://localhost:27017/pastly')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

setInterval(cleanupExpiredPastes, 60 * 60 * 1000); // Runs every hour

const app = express();
app.use(express.json());
app.use('/api', pasteRouter);

app.listen(3000, () => {
    console.log('Server is live at : http://localhost:3000');
});