import { Router } from 'express';
import {
    createTransferController,
    getTransferJobStatusController,
    receiveTransferController,
    receiveTransferByUrlController,
    getTransferStatusController,
} from '../controllers/transfer.controller.js';

const transferRouter = Router();

// ── Upload ────────────────────────────────────────────────────────────────────
transferRouter.post('/transfer', createTransferController);

// ── Background job status (cloud-upload progress polling) ─────────────────────
// NOTE: this must come BEFORE /transfer/:code to avoid route collision
transferRouter.get('/transfer/job/:jobId/status', getTransferJobStatusController);

// ── Status poll (does NOT redeem — used by StatusPollBadge) ──────────────────
transferRouter.get('/transfer/:code/status', getTransferStatusController);

// ── Redeem (JSON API used by manual receive page) ────────────────────────────
transferRouter.get('/transfer/:code', receiveTransferController);

// ── Browser share link redirect (mounted at root level via app.use('/')) ─────
transferRouter.get('/t/receive/:code', receiveTransferByUrlController);

export default transferRouter;