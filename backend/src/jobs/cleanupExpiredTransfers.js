import Transfer from '../models/transfer.model.js';
import { deleteFile } from '../services/pcloud.service.js';

const cleanupExpiredTransfers = async () => {
    try {
        const now = new Date();
        const expiredTransfers = await Transfer.find({
            $or: [
                { expiresAt: { $lt: now } },
                { isReceived: true }
            ]
        });

        if (expiredTransfers.length === 0) {
            return;
        }

        for (const transfer of expiredTransfers) {
            await deleteFile(transfer.fileId);
            await transfer.deleteOne();
        }
    } catch (error) {
        console.error("Error occurred while cleaning up expired transfers : ", error);
    }
};

export default cleanupExpiredTransfers;