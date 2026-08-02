const { rateLimit, MemoryStore } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { redisClient } = require('../config/redis');

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

// Tunable per-IP limits. Adjust here if you need tighter/looser windows.
const REGISTER_LIMIT = 10;
const LOGIN_LIMIT = 10;
const SHORTEN_LIMIT = 50;

function createStore() {
    const redisStore = new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
    });
    const memoryStore = new MemoryStore();

    return {
        init: (options) => {
            memoryStore.init(options);
            // RedisStore.init() eagerly sends a SCRIPT LOAD command, which rejects
            // while Redis is not connected. Swallow that here — windowMs is still
            // set, and rate-limit-redis retries the EVALSHA / reloads the script
            // lazily on the first increment once Redis is back, so this self-heals.
            redisStore.init(options).catch((error) => {
                if (redisClient.isReady) {
                    console.error('Failed to init Redis rate-limit store:', error.message);
                }
            });
        },
        // Pick Redis when it is up, otherwise fall back to in-memory. Decided per
        // request so the API keeps working if Redis is down at startup, and
        // resumes using Redis automatically when it comes back. A mid-flight
        // Redis failure also degrades to memory for that request.
        increment: async (key) => {
            try {
                if (redisClient.isReady) {
                    return await redisStore.increment(key);
                }
            } catch (error) {
                console.error('Redis rate-limit store failed, using memory:', error.message);
            }
            return memoryStore.increment(key);
        },
        decrement: async (key) => (redisClient.isReady ? redisStore.decrement(key) : memoryStore.decrement(key)),
        resetKey: async (key) => (redisClient.isReady ? redisStore.resetKey(key) : memoryStore.resetKey(key)),
    };
}

function createRateLimiter({ windowMs, limit, message }) {
    return rateLimit({
        windowMs,
        limit,
        store: createStore(),
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(429).json({
                success: false,
                message,
            });
        },
    });
}

const registerLimiter = createRateLimiter({
    windowMs: FIFTEEN_MINUTES_MS,
    limit: REGISTER_LIMIT,
    message: 'Too many registration attempts. Please try again later.',
});

const loginLimiter = createRateLimiter({
    windowMs: FIFTEEN_MINUTES_MS,
    limit: LOGIN_LIMIT,
    message: 'Too many login attempts. Please try again later.',
});

const shortenLimiter = createRateLimiter({
    windowMs: FIFTEEN_MINUTES_MS,
    limit: SHORTEN_LIMIT,
    message: 'Too many URLs created. Please try again later.',
});

module.exports = { createRateLimiter, registerLimiter, loginLimiter, shortenLimiter };
