import { createPaste, getPaste } from "../services/paste.service.js";

export const createPasteController = async (req, res) => {
    try {
        const content = req.body.content;
        const url = await createPaste(content);
        res.status(201).json({ success: true, url });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const getPasteController = async (req, res) => {
    try {
        const slug = req.params.slug;
        const content = await getPaste(slug);

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(200).send(content);
    } catch (error) {
        res.status(400).send(error.message);
    }
};