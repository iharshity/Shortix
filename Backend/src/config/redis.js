const { createClient } = require('redis');

const REDIS_MAX_RECONNECT_RETRIES = 10;

const redisClient = createClient({
    url : process.env.REDIS_URL,
    socket : {
        // By default node-redis retries reconnection forever, so a failed
        // connect() promise never settles and the server would never start
        // listening. Bound the retries so connect() rejects within a few
        // seconds and server.js can fall back to running without the cache.
        reconnectStrategy(retries) {
            if (retries > REDIS_MAX_RECONNECT_RETRIES) {
                return new Error(`Redis reconnection aborted after ${REDIS_MAX_RECONNECT_RETRIES} attempts`);
            }
            return Math.min(retries * 100, 1000);
        },
    },
});

redisClient.on('error', (error) => {
    console.error('Redis client error:', error);
});

async function connectRedis() {
    if(!redisClient.isOpen){
        await redisClient.connect();
        console.log('Connected to Redis');
    }
}

module.exports = { redisClient, connectRedis };