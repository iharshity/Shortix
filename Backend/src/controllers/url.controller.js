const Url = require('../models/url.model');
const Counter = require('../models/counter.model');
const { encodeBase62 } = require('../utils/base62');
const { getCachedUrl, cacheUrl } = require('../services/urlCache.service')

const SHORT_CODE_LENGTH = 6;

function isValidHttpUrl(value) {
    try {
        const parsedUrl = new URL(value);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
        return false;
    }
}

async function getNextSequence() {
    const counter = await Counter.findByIdAndUpdate(
        'url',
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
    );

    return counter.sequenceValue;
}

async function shortenUrl(req, res) {
    const { url } = req.body;

    if (typeof url !== 'string' || !isValidHttpUrl(url)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid HTTP or HTTPS URL.',
        });
    }

    try {
        const sequenceValue = await getNextSequence();
        const shortCode = encodeBase62(sequenceValue).padStart(SHORT_CODE_LENGTH, '0');
        const publicBaseUrl = (process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');
        const savedUrl = await Url.create({
            originalUrl: url,
            shortCode,
            user: req.user.id,
        });

        return res.status(201).json({
            success: true,
            data: {
                id: savedUrl._id,
                originalUrl: savedUrl.originalUrl,
                shortCode: savedUrl.shortCode,
                shortUrl: `${publicBaseUrl}/${savedUrl.shortCode}`,
                createdAt: savedUrl.createdAt,
            },
        });
    } catch (error) {
        console.error('Failed to create shortened URL:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
}

async function redirectUrl(req, res){
    try{
        const {shortCode} = req.params;

        const cachedOriginalUrl = await getCachedUrl(shortCode);
        if(cachedOriginalUrl){
            return res.redirect(302, cachedOriginalUrl);
        }

        const url = await Url.findOne({shortCode});

        if(!url){
            return res.status(404).json({
                success : false,
                message : "Short Url not found",
            })
        }

        await cacheUrl(shortCode, url.originalUrl);

        return res.redirect(302, url.originalUrl);
        
    }catch(err){
        console.log('Failed to redirect short Url:', err);

        return res.status(500).json({
            success : false,
            message : 'Internal server error.'
        })
    }
}

module.exports = { shortenUrl, redirectUrl };
