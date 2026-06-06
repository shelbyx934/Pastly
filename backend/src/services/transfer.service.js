import { uploadFileStream, getFileDownloadLink } from './pcloud.service.js';
import generateTransferCode from '../utils/generateTransferCode.js';
import Transfer from '../models/transfer.model.js';

export const createTransfer = async (fileStream, originalFileName,sizeInBytes) => {
    try {
        const folderId = process.env.TRANSFER_FOLDER_ID;

        let code;
        do {
            code = generateTransferCode();
        } while (await Transfer.exists({ code }));

        const storedFileName = `${code}_${originalFileName}`;

        const fileId = await uploadFileStream(folderId, storedFileName, fileStream, sizeInBytes);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // expires after 10 minutes
        await Transfer.create({
            code,
            fileId,
            fileName: originalFileName,
            expiresAt
        });
        return {
            code,
            url: `${process.env.FRONTEND_URL}/t/receive/${code}`,
            expiresAt
        };
    } catch (error) {
        throw new Error(`Create Transfer : ${error.message}`);
    }
};

export const receiveTransfer = async (code) => {
    try {
        const transfer = await Transfer.findOne({ code });
        if (!transfer) {
            throw new Error('Code is invalid.');
        }

        if (transfer.isReceived) {
            throw new Error('File has already been received');
        }

        if (new Date() > transfer.expiresAt) {
            throw new Error('Code has expired');
        }

        const downloadLink = await getFileDownloadLink(transfer);
        transfer.isReceived = true;
        await transfer.save();

        return downloadLink;
    } catch (error) {
        throw new Error(`Receive File Error : ${error.message}`);
    }
};