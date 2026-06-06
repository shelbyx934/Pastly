import mongoose from 'mongoose';

const transferSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    fileId: {
        type: Number,
        required: true,
        unique: true
    },
    fileName: {
        type: String,
        required: true,
        trim: true
    },
    isReceived: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true,
    }
});

transferSchema.index({ expiresAt: 1 });

const Transfer = mongoose.model('Transfer', transferSchema);

export default Transfer;