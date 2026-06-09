import { uploadFileStream, getFileDownloadLink } from './pcloud.service.js';
import generateTransferCode from '../utils/generateTransferCode.js';
import Transfer from '../models/transfer.model.js';

/**
 * Generate a transfer code that doesn't already exist in the DB.
 * @returns {Promise<string>}
 */
export const generateUniqueCode = async () => {
    let code;
    do {
        code = generateTransferCode();
    } while (await Transfer.exists({ code }));
    return code;
};

/**
 * Background upload worker — called AFTER the HTTP response has been sent.
 * Mutates jobState in-place so the polling controller always sees fresh data.
 *
 * @param {object} jobState        - entry from transferJobQueue (mutated here)
 * @param {object} params
 * @param {string} params.folderId
 * @param {string} params.storedFileName   - "${code}_${originalName}"
 * @param {string} params.originalFileName
 * @param {Buffer} params.fileBuffer
 */
export const runUploadJob = async (jobState, { folderId, storedFileName, originalFileName, fileBuffer }) => {
    try {
        // Upload Buffer to pCloud using the pre-generated progressHash
        const fileId = await uploadFileStream(
            folderId,
            storedFileName,
            fileBuffer,
            jobState.progressHash,
        );

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min from now

        await Transfer.create({
            code: jobState.code,
            fileId,
            fileName: originalFileName,
            expiresAt,
        });

        // Mark job as done — the next poll will return phase:'done' with code+url
        jobState.phase = 'done';
        jobState.url = `${process.env.FRONTEND_URL}/t/receive/${jobState.code}`;
        jobState.expiresAt = expiresAt;

    } catch (error) {
        jobState.phase = 'error';
        jobState.error = error.message;
        throw error; // re-throw so the .catch() in the controller can log it
    }
};

/**
 * Redeem a transfer code and return the pCloud direct download URL.
 * Marks the transfer as received so it can't be claimed again.
 */
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