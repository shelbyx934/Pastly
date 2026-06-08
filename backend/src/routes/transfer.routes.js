import { Router } from 'express';
import { createTransferController, receiveTransferController, getTransferStatusController } from '../controllers/transfer.controller.js';

const transferRouter = Router();

transferRouter.post('/transfer', createTransferController);
transferRouter.get('/transfer/:code/status', getTransferStatusController);
transferRouter.get('/transfer/:code', receiveTransferController);

export default transferRouter;