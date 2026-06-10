import { Router } from 'express';
import { createTransferController, receiveTransferController, getTransferStatusController, getTransferProgressController } from '../controllers/transfer.controller.js';

const transferRouter = Router();

transferRouter.post('/transfer', createTransferController);
transferRouter.get('/transfer/:code/status', getTransferStatusController);
transferRouter.get('/transfer/:code', receiveTransferController);
transferRouter.get('/transfer/progress/:progressHash', getTransferProgressController);

export default transferRouter;