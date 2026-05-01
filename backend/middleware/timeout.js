/**
 * middleware/timeout.js
 *
 * Global request timeout protection.
 * If any route takes longer than TIMEOUT_MS to respond, the client
 * receives a proper JSON error instead of a hanging connection.
 *
 * Usage in server.js:
 *   const timeoutMiddleware = require('./middleware/timeout');
 *   app.use(timeoutMiddleware);
 */

const TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || '10000', 10); // default 10s

/**
 * Attaches a timer to each incoming request.
 * If the response has not been sent within TIMEOUT_MS:
 *  - Sets req.timedOut = true (route handlers can check this)
 *  - Sends a 503 JSON response
 *  - Destroys the socket to free the connection
 */
function timeoutMiddleware(req, res, next) {
    // Skip timeout for Socket.io upgrade requests
    if (req.headers.upgrade === 'websocket') return next();

    req.timedOut = false;

    const timer = setTimeout(() => {
        if (res.headersSent) return; // response already sent — nothing to do

        req.timedOut = true;
        console.warn(
            `[Timeout] ⏱  ${req.method} ${req.originalUrl} exceeded ${TIMEOUT_MS}ms`
        );

        res.status(503).json({
            error: 'Request timeout',
            message: 'The server took too long to respond. Please try again.',
            path: req.originalUrl,
        });

        // Forcefully close the socket after sending the timeout response
        // to prevent memory leaks from lingering connections.
        res.on('finish', () => {
            if (req.socket && !req.socket.destroyed) req.socket.destroy();
        });
    }, TIMEOUT_MS);

    // Clear the timer as soon as the response is finished (normal or error path)
    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
}

module.exports = timeoutMiddleware;
