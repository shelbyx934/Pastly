import Busboy from 'busboy';
import { createTransfer } from '../services/transfer.service.js';

export const createTransferController = async (req, res) => {
    const busboy = new Busboy({ headers: req.headers });

    let transferPromise;

    busboy.on('file', (fieldname, fileStream, info) => {
        transferPromise = createTransfer(fileStream, info.filename);
    });

    busboy.on('finish', async () => {
        try {
            if (!transferPromise) {
                return res.status(400).json({ success: false, error: 'No file uploaded' });
            }

            const result = await transferPromise;
            res.status(201).json({ success: true, ...result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    busboy.on('error', (error) => {
        res.status(500).json({ success: false, error: error.message });
    });

    req.pipe(busboy);
};