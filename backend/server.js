// server.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import app from './app.js';

import cleanupExpiredPastes from './jobs/cleanupExpiredPastes.js';
import cleanupExpiredTransfers from './jobs/cleanupExpiredTransfers.js';

dotenv.config();

console.log('PCloud Auth Token:', process.env.PCLOUD_AUTH_TOKEN);

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/pastly';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    // Start cleanup jobs
    setInterval(cleanupExpiredPastes, 60 * 60 * 1000); // every hour
    setInterval(cleanupExpiredTransfers, 10 * 60 * 1000); // every 10 mins

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });