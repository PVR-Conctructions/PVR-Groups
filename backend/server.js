require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// ── Sentry Error Tracking ─────────────────────────────────────────────────────
let Sentry;
try {
    Sentry = require('@sentry/node');
    if (process.env.SENTRY_DSN) {
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
        });
        console.log('[Sentry] initialized');
    }
} catch (_) {
    Sentry = null;
}


// ── Security & Performance ────────────────────────────────────────────────────
let helmet, rateLimit, compression;
try { helmet = require('helmet'); } catch (_) { helmet = null; }
try { rateLimit = require('express-rate-limit'); } catch (_) { rateLimit = null; }
try { compression = require('compression'); } catch (_) { compression = null; }

// ── Custom Middleware ─────────────────────────────────────────────────────────
const timeoutMiddleware = require('./middleware/timeout');
const { requestLogger, errorLogger } = require('./middleware/logger');

// ── Redis Client (imported to ensure it connects at startup) ──────────────────
const { rPing } = require('./utils/redis');

// ── App & HTTP Server ─────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────────────────────────────
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://pvr-groups.vercel.app';
const io = new Server(server, {
    cors: { origin: FRONTEND_URL, methods: ['GET', 'POST'] },
    pingTimeout: 60000,
    pingInterval: 25000,
});

const activeUsers = {};
io.on('connection', (socket) => {
    socket.on('register', (userId) => {
        if (userId) { activeUsers[userId] = socket.id; socket.userId = userId; }
    });
    socket.on('admin_reply', ({ toUserId, message }) => {
        const targetSocket = activeUsers[toUserId];
        if (targetSocket) io.to(targetSocket).emit('new_reply', message);
    });
    socket.on('disconnect', () => {
        if (socket.userId) delete activeUsers[socket.userId];
    });
});
app.set('io', io);
app.set('activeUsers', activeUsers);

// ─────────────────────────────────────────────────────────────────────────────
//  MIDDLEWARE STACK (ORDER MATTERS)
// ─────────────────────────────────────────────────────────────────────────────

// 1. Request logging — first so every request is captured
app.use(requestLogger);

// 1.5 Custom Metrics: Log response time & flag SLOW APIs (>1000ms)
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const time = Date.now() - start;
        // The standard requestLogger handles normal logging, but we explicitly
        // flag slow endpoints here.
        if (time > 1000) {
            console.warn(`[SLOW API] 🐢 ${req.method} ${req.originalUrl} - ${time}ms`);
        }
    });
    next();
});

// 2. Request timeout — before any async work
app.use(timeoutMiddleware);

// 3. Security headers (Helmet)
if (helmet) {
    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false, // Allow Bunny CDN images
    }));
}

// 4. Gzip Compression — reduces JSON response size ~60%
if (compression) {
    app.use(compression({
        level: 6,
        threshold: 1024,
        filter: (req, res) => {
            if (req.headers['x-no-compression']) return false;
            return compression.filter(req, res);
        },
    }));
}

// 5. CORS — production: Vercel URL only; dev: localhost too
const allowedOrigins = [
    FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.some((o) => origin.startsWith(o))) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked for origin: ${origin}`));
        }
    },
    credentials: true,
    maxAge: 86400, // Cache preflight requests for 24 hours to reduce OPTIONS requests
}));

// 6. Body parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 7. Rate Limiting
if (rateLimit) {
    const globalLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 1000, // Increased from 300 to prevent frontend drops
        standardHeaders: true,
        legacyHeaders: false,
        message: { message: 'Too many requests. Please try again in 15 minutes.' },
    });
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 20,
        standardHeaders: true,
        legacyHeaders: false,
        message: { message: 'Too many login attempts. Please wait 15 minutes.' },
    });
    const writeLimiter = rateLimit({
        windowMs: 10 * 60 * 1000,
        max: 30,
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req) => req.method === 'GET' || req.method === 'HEAD',
        message: { message: 'Too many upload requests. Please wait before trying again.' },
    });
    const bookingLimiter = rateLimit({
        windowMs: 10 * 60 * 1000,
        max: 10,
        standardHeaders: true,
        legacyHeaders: false,
        message: { message: 'Too many booking attempts. Please wait before trying again.' },
    });

    app.use(globalLimiter);
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/register', authLimiter);
    app.use('/api/projects', writeLimiter);
    app.use('/api/site-visit/book', bookingLimiter);
}

// ─────────────────────────────────────────────────────────────────────────────
//  HEALTH CHECK (before routes — no auth, no cache, always fast)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
    const redisAlive = await rPing();
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())}s`,
        redis: redisAlive ? 'connected' : 'unavailable',
        env: process.env.NODE_ENV || 'development',
    });
});

// Legacy path — keep for backwards compatibility
app.get('/api/health', async (req, res) => {
    const redisAlive = await rPing();
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())}s`,
        redis: redisAlive ? 'connected' : 'unavailable',
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  API ROUTES
// ─────────────────────────────────────────────────────────────────────────────
const { cacheMiddleware } = require('./middleware/cache');

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/newsletter', require('./routes/newsletterRoutes'));
app.use('/api/site-visit', require('./routes/siteVisitRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/referral', require('./routes/referralRoutes'));
app.use('/api/analytics', cacheMiddleware((req) => `analytics:${req.path}`, 300), require('./routes/analyticsRoutes')); // 5 min cache
app.use('/api/email', require('./routes/emailRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// ─────────────────────────────────────────────────────────────────────────────
//  CENTRALIZED ERROR HANDLER (must be last)
// ─────────────────────────────────────────────────────────────────────────────
// Sentry error handler should be before any other error middleware
if (Sentry && process.env.SENTRY_DSN) {
    if (Sentry.setupExpressErrorHandler) {
        Sentry.setupExpressErrorHandler(app);
    }
}

app.use(errorLogger);

// ─────────────────────────────────────────────────────────────────────────────
//  START SERVER
// ─────────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`\n🚀 PVR Groups backend running on port ${PORT}`);
    console.log(`   Mode  : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   CORS  : ${FRONTEND_URL}`);
    console.log(`   Redis : ${process.env.REDIS_URL ? 'configured' : 'NOT configured (set REDIS_URL)'}\n`);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
// Render sends SIGTERM before stopping a service. This lets in-flight
// requests complete before the process exits.
process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM received — shutting down gracefully…');
    server.close(() => {
        console.log('[Server] All connections closed. Exiting.');
        process.exit(0);
    });
    // Force-exit after 15s if connections don't close
    setTimeout(() => process.exit(1), 15000);
});

process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught exception:', err.message, err.stack);
    // Don't exit — let Render's restart policy handle truly fatal errors
});

process.on('unhandledRejection', (reason) => {
    console.error('[WARN] Unhandled promise rejection:', reason);
});
