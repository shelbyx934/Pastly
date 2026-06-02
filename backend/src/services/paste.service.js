import { uploadTextFile, deleteTextFile, getTextFile } from "./pcloud.service.js";
import generateSlug from "../utils/generateSlug.js";
import Paste from "../models/paste.model.js";

export const createPaste = async (content) => {
    try {
        if (!content || content.trim() === "") {
            throw new Error("Content is required");
        }
        const contentSize = Buffer.byteLength(content.trim(), 'utf-8');

        if (contentSize > 10 * 1024 * 1024) { // 10 MB limit
            throw new Error("Content exceeds 10MB limit");
        }

        let slug;
        do {
            slug = generateSlug();
        } while (await Paste.exists({ slug }));

        const filename = `${slug}.txt`;
        const folderid = process.env.PASTE_FOLDER_ID;
        const fileId = await uploadTextFile(folderid, filename, content.trim());
        const lastAccessedAt = new Date();
        const expiresAt = new Date(lastAccessedAt.getTime() + 10 * 24 * 60 * 60 * 1000); // Expires in 10 days

        await Paste.create({ slug, fileId, contentSize, lastAccessedAt, expiresAt });

        return `/p/${slug}`; // url to access the paste
    }
    catch (error) {
        throw new Error(`Error : Create Paste -> ${error.message}`);
    }
};

export const getPaste = async (slug) => {
    try {
        const paste = await Paste.findOne({ slug });
        if (!paste) {
            throw new Error("Paste not found");
        }
        const content = await getTextFile(paste.fileId);
        const now = new Date();
        if (now.getTime() - paste.lastAccessedAt.getTime() > 24 * 60 * 60 * 1000) { // If not accessed for more than 24 hours
            paste.lastAccessedAt = now;
            paste.expiresAt = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // Extend expiration by 10 days
            await paste.save();
        }
        return content;
    }
    catch (error) {
        throw new Error(`Error : Get Paste -> ${error.message}`);
    }
};