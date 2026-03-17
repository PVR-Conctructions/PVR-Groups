require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const seedAdmin = require('./utils/seedAdmin');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173', methods: ['GET', 'POST'] }
});

// Store active sockets: userId -> socketId
const activeUsers = {};

io.on('connection', (socket) => {
    // Register user by userId
    socket.on('register', (userId) => {
        if (userId) {
            activeUsers[userId] = socket.id;
            socket.userId = userId;
        }
    });

    // Admin sends reply to user
    socket.on('admin_reply', ({ toUserId, message }) => {
        const targetSocket = activeUsers[toUserId];
        if (targetSocket) {
            io.to(targetSocket).emit('new_reply', message);
        }
    });

    socket.on('disconnect', () => {
        if (socket.userId) delete activeUsers[socket.userId];
    });
});

// Make io available to routes
app.set('io', io);
app.set('activeUsers', activeUsers);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
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
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/email', require('./routes/emailRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    if (err.name === 'MulterError') {
        return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const connectDB = require('./config/db');

connectDB()
    .then(async () => {
        await seedAdmin();
        server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} with Socket.io`));
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} (no database)`));
    });
