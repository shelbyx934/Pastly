import fs from 'fs';
import dotenv from 'dotenv';
import { uploadFileStream } from './src/services/pcloud.service.js';

dotenv.config();

const folderid = process.env.TRANSFER_FOLDER_ID; // Replace with your actual folder ID
console.log(`Using folder ID: ${folderid}`);

const readStream = fs.createReadStream('testv.mp4'); // Replace with your actual file path

const fileid = await uploadFileStream(folderid, 'testv.mp4', readStream);
console.log(`Uploaded file ID: ${fileid}`);