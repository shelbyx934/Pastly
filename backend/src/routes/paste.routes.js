import { Router } from 'express';
import { createPasteController, getPasteController } from '../controllers/paste.controller.js';

const pasteRouter = Router();

pasteRouter.post('/paste', createPasteController);
pasteRouter.get('/paste/:slug', getPasteController);

export default pasteRouter;