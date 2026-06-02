import Paste from '../models/paste.model.js';
import { deleteTextFile } from '../services/pcloud.service.js';

const cleanupExpiredPastes = async () => {
    try {
        const now = new Date();
        const expiredPastes = await Paste.find({ expiresAt: { $lt: now } });

        if (expiredPastes.length === 0) {
            return;
        }
        for (const paste of expiredPastes) {
            await deleteTextFile(paste.fileId);
            await paste.deleteOne();
        }
    } catch (error) {
        console.error("Error occurred while cleaning up expired pastes:", error);
    }
};

export default cleanupExpiredPastes;