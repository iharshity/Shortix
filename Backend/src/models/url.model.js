const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
    {
        originalUrl: {
            type: String,
            required: true,
            trim: true,
        },
        shortCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        clicks: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Url = mongoose.model('Url', urlSchema);

module.exports = Url;
