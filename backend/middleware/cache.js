/**
 * middleware/cache.js
 *
 * Redis-backed API caching middleware.
 * Drop-in replacement for the previous node-cache version.
 *
 * Usage (unchanged from before):
 *   const { cacheMiddleware, invalidateCacheMiddleware, CACHE_KEYS } = require('../middleware/cache');
 *
 *   router.get('/',     cacheMiddleware(CACHE_KEYS.PROJECTS_ALL, 60), getProjects);
 *   router.post('/',    auth, invalidateCacheMiddleware(CACHE_KEYS.PROJECTS_ALL), createProject);
 *   router.delete('/:id', auth, invalidateCacheMiddleware(
 *       CACHE_KEYS.PROJECTS_ALL,
 *       (req) => CACHE_KEYS.PROJECT_SINGLE(req.params.id)
 *   ), deleteProject);
 *
 * Graceful fallback:
 *   If Redis is unavailable, every function is a no-op — requests pass
 *   straight through to Supabase. The server never crashes.
 */

const { rGet, rSet, rDel } = require('../utils/redis');

// ── Canonical cache key constants ─────────────────────────────────────────────
const CACHE_KEYS = {
    PROJECTS_ALL: 'projects:all',
    PROJECT_SINGLE: (id) => `project:${id}`,
    FEEDBACK_PROJECT: (id) => `feedback:project:${id}`,
    FEEDBACK_ALL: 'feedback:all',
};

// ── cacheMiddleware ───────────────────────────────────────────────────────────
/**
 * Express middleware factory.
 * Checks Redis for a cached response; if found, returns it immediately.
 * Otherwise lets the request proceed, intercepts res.json(), and stores
 * the response in Redis for future requests.
 *
 * @param {string|Function} key  - cache key or a function (req) => string
 * @param {number}          ttl  - time-to-live in seconds (default 60)
 */
function cacheMiddleware(key, ttl = 60) {
    return async (req, res, next) => {
        const cacheKey = typeof key === 'function' ? key(req) : key;

        // Try to serve from Redis
        const cached = await rGet(cacheKey);
        if (cached !== null) {
            res.set('X-Cache', 'HIT');
            try {
                return res.json(JSON.parse(cached));
            } catch (_) {
                // Corrupt cache entry — fall through to fresh fetch
                await rDel(cacheKey);
            }
        }

        // Cache MISS — intercept res.json() to store the response
        const originalJson = res.json.bind(res);
        res.json = (data) => {
            // Only cache 2xx responses
            if (res.statusCode >= 200 && res.statusCode < 300) {
                // Store async; don't await — let response send immediately
                rSet(cacheKey, JSON.stringify(data), ttl).catch(() => {});
            }
            res.set('X-Cache', 'MISS');
            return originalJson(data);
        };

        next();
    };
}

// ── invalidateCacheMiddleware ─────────────────────────────────────────────────
/**
 * Express middleware factory that deletes cache keys BEFORE calling next().
 * Attach it in the route chain before any write handler.
 *
 * Accepts string keys or functions (req) => string.
 *
 * Example:
 *   router.put('/:id', auth, invalidateCacheMiddleware(
 *       CACHE_KEYS.PROJECTS_ALL,
 *       (req) => CACHE_KEYS.PROJECT_SINGLE(req.params.id)
 *   ), handler);
 */
function invalidateCacheMiddleware(...keys) {
    return async (req, res, next) => {
        const resolved = keys.map((k) => (typeof k === 'function' ? k(req) : k));
        // Fire-and-forget; don't block the request
        rDel(...resolved).catch(() => {});
        next();
    };
}

/**
 * Programmatic cache invalidation — call directly inside route handlers.
 * @param {...string} keys
 */
async function invalidateCache(...keys) {
    await rDel(...keys);
}

module.exports = {
    cacheMiddleware,
    invalidateCacheMiddleware,
    invalidateCache,
    CACHE_KEYS,
};
