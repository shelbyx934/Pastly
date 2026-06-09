import Busboy from 'busboy';
import crypto from 'crypto';
import { generateUniqueCode, runUploadJob, receiveTransfer } from '../services/transfer.service.js';
import { getPCloudUploadProgress } from '../services/pcloud.service.js';
import { createJob, getJob } from '../jobs/transferJobQueue.js';
import Transfer from '../models/transfer.model.js';

/**
 * POST /api/transfer
 *
 * Two-phase design:
 *  1. Busboy buffers the entire file into memory.
 *  2. A unique transfer code + progressHash are generated.
 *  3. A job entry is registered in the in-memory queue.
 *  4. HTTP responds 202 immediately with { jobId, code }.
 *  5. pCloud upload runs in the background — survives browser disconnect.
 */
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
    const chunks = [];
    let fileInfo = null;

    busboy.on('file', (fieldname, fileStream, info) => {
        fileInfo = info;
        fileStream.on('data', (chunk) => chunks.push(chunk));
        fileStream.resume(); // drain in case no 'data' listeners were attached yet
    });

    busboy.on('finish', async () => {
        try {
            if (!fileInfo) {
                return res.status(400).json({ success: false, error: 'No file uploaded' });
            }

            const fileBuffer = Buffer.concat(chunks);
            const folderId = process.env.TRANSFER_FOLDER_ID;

            // Generate a collision-free code before responding
            const code = await generateUniqueCode();
            const progressHash = crypto.randomUUID();
            const storedFileName = `${code}_${fileInfo.filename}`;

            // Register the job — jobState is mutated by runUploadJob later
            const { jobId, jobState } = createJob(code, progressHash);

            // ── Respond immediately (202 Accepted) ──────────────────────────────
            // The browser HTTP connection closes here. The upload to pCloud
            // continues independently in the Node.js event loop.
            res.status(202).json({ success: true, jobId, code });

            // ── Background upload (intentionally NOT awaited) ────────────────────
            runUploadJob(jobState, {
                folderId,
                storedFileName,
                originalFileName: fileInfo.filename,
                fileBuffer,
            }).catch((err) => {
                console.error(`[Transfer Job ${jobId}] Background upload failed:`, err.message);
            });

        } catch (error) {
            if (!res.headersSent) {
                res.status(500).json({ success: false, error: error.message });
            }
        }
    });

    busboy.on('error', (error) => {
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    req.pipe(busboy);
};

/**
 * GET /api/transfer/job/:jobId/status
 *
 * Returns the current phase of a background upload job.
 * While phase === 'uploading', also proxies pCloud's /uploadprogress data
 * so the frontend can show a real cloud-upload progress bar.
 *
 * Response shape (uploading):
 *   { success, phase:'uploading', code, cloudUploaded, cloudTotal, cloudFinished, currentFile }
 *
 * Response shape (done):
 *   { success, phase:'done', code, url, expiresAt }
 *
 * Response shape (error):
 *   { success:false, phase:'error', error }
 */
export const getTransferJobStatusController = async (req, res) => {
    const { jobId } = req.params;
    const job = getJob(jobId);

    if (!job) {
        return res.status(404).json({ success: false, error: 'Job not found or already expired' });
    }

    if (job.phase === 'uploading') {
        try {
            const progress = await getPCloudUploadProgress(job.progressHash);
            return res.json({
                success: true,
                phase: 'uploading',
                code: job.code,
                cloudUploaded: progress.uploaded ?? 0,
                cloudTotal: progress.total ?? 0,
                cloudFinished: progress.finished ?? false,
                currentFile: progress.currentfile ?? '',
            });
        } catch {
            // pCloud's progress endpoint may 404 for the first second or two
            // before the upload even begins — return zeros so the UI doesn't crash.
            return res.json({
                success: true,
                phase: 'uploading',
                code: job.code,
                cloudUploaded: 0,
                cloudTotal: 0,
                cloudFinished: false,
                currentFile: '',
            });
        }
    }

    if (job.phase === 'done') {
        return res.json({
            success: true,
            phase: 'done',
            code: job.code,
            url: job.url,
            expiresAt: job.expiresAt,
        });
    }

    // phase === 'error'
    return res.status(500).json({
        success: false,
        phase: 'error',
        error: job.error ?? 'Unknown error during upload',
    });
};

/**
 * GET /api/transfer/:code
 * Returns a JSON { url } for the frontend's manual receive flow.
 */
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

/**
 * Browser-facing share link handler.
 * GET /t/receive/:code
 * On success → 302 redirect to pCloud direct download URL.
 * On error   → 302 redirect to frontend error page with ?message= query param.
 */
export const receiveTransferByUrlController = async (req, res) => {
    const { code } = req.params;
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    try {
        const downloadUrl = await receiveTransfer(code);
        return res.redirect(302, downloadUrl);
    } catch (error) {
        const msg = error.message.replace(/^Receive File Error\s*:\s*/i, '');
        const params = new URLSearchParams({ message: msg, code });
        return res.redirect(302, `${frontendUrl}/t/error?${params.toString()}`);
    }
};

/**
 * GET /api/transfer/:code/status
 * Lightweight poll — does NOT redeem the code. Used by StatusPollBadge.
 */
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
            expiresAt: transfer.expiresAt,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};