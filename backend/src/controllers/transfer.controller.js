import Busboy from 'busboy';
import { createTransfer, receiveTransfer } from '../services/transfer.service.js';
import Transfer from '../models/transfer.model.js';

export const createTransferController = (req, res) => {
    const contentLength = req.headers['content-length'];

    if (!contentLength) {
        return res.status(411).json({ success: false, error: 'Content-Length header is required' });
    }

    const MAX_SIZE = 1024 * 1024 * 1024; // 1 GB
    if (parseInt(contentLength) > MAX_SIZE) {
        return res.status(413).json({ success: false, error: 'File size exceeds the 1 GB limit' });
    }

    const busboy = Busboy({ headers: req.headers });
    let transferPromise;
    busboy.on('file', (fieldname, fileStream, info) => {
        transferPromise =
            createTransfer(
                fileStream,
                info.filename,
                contentLength
            );
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

export const receiveTransferController = async (req, res) => {
    const { code } = req.params;
    console.log(`Received request to receive transfer with code: ${code}`);
    try {
        const url = await receiveTransfer(code);
        res.status(200).json({ success: true, url });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const getTransferStatusController = async (req, res) => {
    const { code } = req.params;
    try {
        const transfer = await Transfer.findOne({ code }).select('isReceived fileName expiresAt');
        if (!transfer) {
            return res.status(404).json({ success: false, error: 'Transfer not found' });
        }
        res.status(200).json({
            success: true,
            isReceived: transfer.isReceived,
            fileName: transfer.fileName,
            expiresAt: transfer.expiresAt
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};