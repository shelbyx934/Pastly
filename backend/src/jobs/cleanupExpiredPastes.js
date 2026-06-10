import Paste from '../models/paste.model.js';
import { deleteFile } from '../services/pcloud.service.js';

const cleanupExpiredPastes = async () => {
    try {
        const now = new Date();
        const expiredPastes = await Paste.find({ expiresAt: { $lt: now } });

        if (expiredPastes.length === 0) {
            return;
        }
        for (const paste of expiredPastes) {
            try {
                await deleteFile(paste.fileId);
                await paste.deleteOne();
            } catch (err) {
                console.error(`Failed to delete paste ${paste._id} (fileId: ${paste.fileId}):`, err.message);
            }
        }
    } catch (error) {
        console.error("Error occurred while cleaning up expired pastes : ", error);
    }
};

export default cleanupExpiredPastes;