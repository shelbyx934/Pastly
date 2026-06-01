import mongoose from 'mongoose';

const pasteSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    fileId: {
        type: Number,
        required: true
    },
    contentSize: {
        type: Number,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    lastAccessedAt: {
        type: Date,
        required: true,
    }
},);

pasteSchema.index({
    expiresAt: 1
});

export const Paste = mongoose.model('Paste', pasteSchema);