const Url = require('../models/url.model');
const Counter = require('../models/counter.model');
const { encodeBase62 } = require('../utils/base62');
const { getCachedUrl, cacheUrl, deleteCachedUrl } = require('../services/urlCache.service');

const SHORT_CODE_LENGTH = 6;
const RESERVED_SLUGS = new Set([
    'api',
    'health',
    'login',
    'register',
    'dashboard',
    'favicon.ico',
    'admin',
    'auth',
    'urls',
    'url',
]);

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
    const { url, customSlug } = req.body;

    if (typeof url !== 'string' || !isValidHttpUrl(url)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid HTTP or HTTPS URL.',
        });
    }

    let shortCode;

    if (customSlug && typeof customSlug === 'string' && customSlug.trim()) {
        const trimmedSlug = customSlug.trim();

        if (!/^[a-zA-Z0-9_-]{3,30}$/.test(trimmedSlug)) {
            return res.status(400).json({
                success: false,
                message: 'Custom alias must be 3–30 characters and can only contain letters, numbers, hyphens, and underscores.',
            });
        }

        if (RESERVED_SLUGS.has(trimmedSlug.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'This custom alias is reserved for system use. Please choose another one.',
            });
        }

        const existing = await Url.findOne({ shortCode: trimmedSlug });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'This custom alias is already taken. Please choose another one.',
            });
        }

        shortCode = trimmedSlug;
    } else {
        const sequenceValue = await getNextSequence();
        shortCode = encodeBase62(sequenceValue).padStart(SHORT_CODE_LENGTH, '0');
    }

    try {
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
                clicks: 0,
                createdAt: savedUrl.createdAt,
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'This short code or alias is already in use. Please try another.',
            });
        }
        console.error('Failed to create shortened URL:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
}

async function redirectUrl(req, res) {
    try {
        const { shortCode } = req.params;

        const cachedOriginalUrl = await getCachedUrl(shortCode);
        if (cachedOriginalUrl) {
            // Asynchronously increment click count in the background
            Url.updateOne({ shortCode }, { $inc: { clicks: 1 } }).catch((err) =>
                console.error('Failed to update clicks in background:', err)
            );
            return res.redirect(302, cachedOriginalUrl);
        }

        const url = await Url.findOneAndUpdate(
            { shortCode },
            { $inc: { clicks: 1 } },
            { new: true }
        );

        if (!url) {
            return res.status(404).json({
                success: false,
                message: 'Short Url not found',
            });
        }

        await cacheUrl(shortCode, url.originalUrl);

        return res.redirect(302, url.originalUrl);
    } catch (err) {
        console.error('Failed to redirect short Url:', err);

        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
}

async function getUserUrls(req, res) {
    try {
        const publicBaseUrl = (process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');
        const urls = await Url.find({ user: req.user.id }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: urls.map((u) => ({
                id: u._id,
                originalUrl: u.originalUrl,
                shortCode: u.shortCode,
                shortUrl: `${publicBaseUrl}/${u.shortCode}`,
                clicks: u.clicks || 0,
                createdAt: u.createdAt,
            })),
        });
    } catch (error) {
        console.error('Failed to fetch user URLs:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
}

async function deleteUrl(req, res) {
    try {
        const { id } = req.params;
        const url = await Url.findOneAndDelete({ _id: id, user: req.user.id });

        if (!url) {
            return res.status(404).json({
                success: false,
                message: 'URL not found or unauthorized.',
            });
        }

        await deleteCachedUrl(url.shortCode);

        return res.status(200).json({
            success: true,
            message: 'URL deleted successfully.',
        });
    } catch (error) {
        console.error('Failed to delete URL:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
}

async function updateUrl(req, res) {
    const { id } = req.params;
    const { originalUrl } = req.body;

    if (typeof originalUrl !== 'string' || !isValidHttpUrl(originalUrl)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid HTTP or HTTPS destination URL.',
        });
    }

    try {
        const url = await Url.findOneAndUpdate(
            { _id: id, user: req.user.id },
            { originalUrl: originalUrl.trim() },
            { new: true }
        );

        if (!url) {
            return res.status(404).json({
                success: false,
                message: 'URL not found or unauthorized.',
            });
        }

        // Refresh Redis cache with the new destination URL immediately
        await cacheUrl(url.shortCode, url.originalUrl);

        const publicBaseUrl = (process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');

        return res.status(200).json({
            success: true,
            data: {
                id: url._id,
                originalUrl: url.originalUrl,
                shortCode: url.shortCode,
                shortUrl: `${publicBaseUrl}/${url.shortCode}`,
                clicks: url.clicks || 0,
                createdAt: url.createdAt,
                updatedAt: url.updatedAt,
            },
            message: 'Destination URL updated successfully.',
        });
    } catch (error) {
        console.error('Failed to update URL destination:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
}

module.exports = { shortenUrl, redirectUrl, getUserUrls, deleteUrl, updateUrl };
