const { redisClient } = require('../config/redis');

const URL_CACHE_PREFIX = 'url:';
const URL_CACHE_TTL_SECONDS = 60 * 60;

function getUrlCacheKey(shortCode) {
    return `${URL_CACHE_PREFIX}${shortCode}`;
}

async function getCachedUrl(shortCode) {
    if (!redisClient.isReady) {
        return null;
    }

    try {
        return await redisClient.get(getUrlCacheKey(shortCode));
    } catch (error) {
        console.error('Failed to read URL from Redis:', error);
        return null;
    }
}

async function cacheUrl(shortCode, originalUrl) {
    if (!redisClient.isReady) {
        return;
    }

    try {
        await redisClient.set(
            getUrlCacheKey(shortCode),
            originalUrl,
            { EX: URL_CACHE_TTL_SECONDS }
        );
    } catch (error) {
        console.error('Failed to cache URL in Redis:', error);
    }
}

async function deleteCachedUrl(shortCode) {
    if (!redisClient.isReady) {
        return;
    }

    try {
        await redisClient.del(getUrlCacheKey(shortCode));
    } catch (error) {
        console.error('Failed to delete cached URL:', error);
    }
}

module.exports = {
    getCachedUrl,
    cacheUrl,
    deleteCachedUrl,
};