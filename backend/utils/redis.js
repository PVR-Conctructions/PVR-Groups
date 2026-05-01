/**
 * utils/redis.js
 *
 * Upstash Redis client using ioredis.
 * Connects via REDIS_URL (rediss:// TLS URL from Upstash dashboard).
 *
 * Design:
 *  - Single shared client exported as a module-level singleton.
 *  - On connection error → logs warning, sets client.isReady = false.
 *  - All cache helpers check isReady before calling Redis so the
 *    server NEVER crashes if Redis is unavailable.
 *  - enableOfflineQueue: false → don't buffer commands while offline,
 *    just reject immediately so cacheMiddleware falls through to DB.
 */

const Redis = (() => {
    try { return require('ioredis'); } catch (_) { return null; }
})();

let client = null;

if (Redis && process.env.REDIS_URL) {
    client = new Redis(process.env.REDIS_URL, {
        // Upstash requires TLS — the rediss:// URL handles this automatically.
        tls: process.env.REDIS_URL.startsWith('rediss://') ? {} : undefined,

        // Don't queue commands while disconnected — fail fast so the app falls
        // back to hitting Supabase instead of hanging.
        enableOfflineQueue: false,

        // Retry logic: 3 attempts, 500ms apart, then give up.
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
            if (times > 3) return null; // stop retrying
            return Math.min(times * 200, 500);
        },

        // Prevent Redis from crashing the process on unhandled errors.
        lazyConnect: false,
    });

    client.on('connect', () => {
        console.log('[Redis] ✅ Connected to Upstash Redis');
        client.isReady = true;
    });

    client.on('ready', () => {
        client.isReady = true;
    });

    client.on('error', (err) => {
        // Only log, never crash.
        console.warn('[Redis] ⚠️  Connection error — cache disabled:', err.message);
        client.isReady = false;
    });

    client.on('close', () => {
        client.isReady = false;
    });

    client.on('reconnecting', () => {
        console.log('[Redis] 🔄 Reconnecting…');
    });
} else {
    if (!Redis) {
        console.warn('[Redis] ioredis not installed — run: npm install ioredis morgan');
    } else {
        console.warn('[Redis] REDIS_URL not set — caching disabled. Set REDIS_URL in .env');
    }
}

/**
 * Safe GET — returns null on any error instead of throwing.
 * @param {string} key
 * @returns {Promise<string|null>}
 */
async function rGet(key) {
    if (!client?.isReady) return null;
    try {
        return await client.get(key);
    } catch (err) {
        console.warn(`[Redis] GET failed (${key}):`, err.message);
        return null;
    }
}

/**
 * Safe SET with EX (expiry in seconds).
 * @param {string} key
 * @param {string} value
 * @param {number} ttl - seconds
 */
async function rSet(key, value, ttl) {
    if (!client?.isReady) return;
    try {
        await client.set(key, value, 'EX', ttl);
    } catch (err) {
        console.warn(`[Redis] SET failed (${key}):`, err.message);
    }
}

/**
 * Safe DEL — deletes one or more keys.
 * @param {...string} keys
 */
async function rDel(...keys) {
    if (!client?.isReady) return;
    try {
        await client.del(...keys);
    } catch (err) {
        console.warn(`[Redis] DEL failed (${keys.join(', ')}):`, err.message);
    }
}

/**
 * Ping Redis — used by /health endpoint.
 * Returns true if Redis is reachable.
 */
async function rPing() {
    if (!client?.isReady) return false;
    try {
        const result = await client.ping();
        return result === 'PONG';
    } catch (_) {
        return false;
    }
}

module.exports = { client, rGet, rSet, rDel, rPing };
