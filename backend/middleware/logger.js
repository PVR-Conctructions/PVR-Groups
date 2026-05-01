/**
 * middleware/logger.js
 *
 * Centralized logging setup for PVR Groups backend.
 *
 * Exports:
 *   requestLogger  — morgan HTTP access log (attach early in server.js)
 *   errorLogger    — Express error handler with stack trace logging
 *
 * Log format:
 *   [2026-05-01 20:30:00] POST /api/auth/login 200 142ms
 *
 * In development: colorized, verbose
 * In production:  structured, Render-friendly (no color codes)
 */

let morgan;
try { morgan = require('morgan'); } catch (_) { morgan = null; }

const IS_PROD = process.env.NODE_ENV === 'production';

// ── Custom token: local timestamp ─────────────────────────────────────────────
if (morgan) {
    morgan.token('localtime', () => {
        return new Date().toISOString().replace('T', ' ').slice(0, 19);
    });
}

/**
 * requestLogger — morgan middleware.
 * Falls back to a tiny hand-rolled logger if morgan is not installed.
 */
const requestLogger = morgan
    ? morgan(
        IS_PROD
            // Production: structured single-line log — readable in Render dashboard
            ? '[:localtime] :method :url :status :res[content-length]B :response-time ms'
            // Development: colorized
            : 'dev',
        {
            // Skip health check spam in logs
            skip: (req) => req.url === '/api/health' || req.url === '/health',
        }
    )
    : (req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            console.log(
                `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`
            );
        });
        next();
    };

// ── errorLogger — global Express error handler ────────────────────────────────
/**
 * Catches any error passed to next(err).
 * - Logs full stack trace to console (visible in Render logs)
 * - Returns a safe JSON response (no sensitive data exposed to client)
 * - Handles known error types (Multer, CORS, JWT, Validation)
 */
function errorLogger(err, req, res, next) {
    // Build log context
    const context = {
        method: req.method,
        url: req.originalUrl,
        status: err.status || err.statusCode || 500,
        message: err.message,
        ip: req.ip,
    };

    // Log full stack in development, condensed in production
    if (IS_PROD) {
        console.error(`[Error] ${context.method} ${context.url} → ${context.status}: ${context.message}`);
    } else {
        console.error('[Error]', context, '\n', err.stack);
    }

    // Already sent — let Express default handler clean up
    if (res.headersSent) return next(err);

    // ── Known error types → specific status codes ─────────────────────────────
    if (err.name === 'MulterError') {
        return res.status(400).json({ message: `File upload error: ${err.message}` });
    }
    if (err.message?.startsWith('CORS blocked')) {
        return res.status(403).json({ message: 'Access denied: CORS policy' });
    }
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
    }
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }
    if (err.status === 429) {
        return res.status(429).json({ message: err.message || 'Too many requests' });
    }

    // ── Generic 500 ────────────────────────────────────────────────────────────
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        message: IS_PROD
            ? 'Something went wrong. Please try again later.'
            : err.message || 'Internal Server Error',
        // Include request ID if available (useful for log correlation)
        ...(req.id && { requestId: req.id }),
    });
}

module.exports = { requestLogger, errorLogger };
