import { uploadFileStream } from './pcloud.service.js';
import generateTransferCode from '../utils/generateTransferCode.js';
import Transfer from '../models/transfer.model.js';

export const createTransfer = async (fileStream, originalFileName) => {
    try {
        const folderId = process.env.TRANSFER_FOLDER_ID;

        let code;
        do {
            code = generateTransferCode();
        } while (await Transfer.exists({ code }));

        const storedFileName = `${code}_${originalFileName}`;

        const fileId = await uploadFileStream(folderId, storedFileName, fileStream);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // expires after 10 minutes
        await Transfer.create({
            code,
            fileId,
            fileName: originalFileName,
            expiresAt
        });
        return `${process.env.FRONTEND_URL}/t/receive/${code}`;
    } catch (error) {
        throw new Error(`Create Transfer : ${error.message}`);
    }
};