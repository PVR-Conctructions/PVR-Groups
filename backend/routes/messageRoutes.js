const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Send message (user reply to announcement or general message)
router.post('/send', auth, async (req, res) => {
    try {
        const { content, announcementId, receiverId } = req.body;

        // If no receiverId, send to admin
        let receiver = receiverId;
        if (!receiver) {
            const admin = await User.findOne({ role: 'admin' });
            if (!admin) return res.status(404).json({ message: 'Admin not found' });
            receiver = admin._id;
        }

        const message = new Message({
            sender: req.user._id,
            receiver,
            content,
            announcementId: announcementId || undefined,
        });

        await message.save();
        await message.populate('sender', 'name email');
        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ message: 'Failed to send message', error: err.message });
    }
});

// Get my messages (for logged-in user)
router.get('/my', auth, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [{ sender: req.user._id }, { receiver: req.user._id }]
        })
            .populate('sender', 'name email role')
            .populate('receiver', 'name email role')
            .populate('announcementId', 'title')
            .sort({ createdAt: -1 });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});

// Mark messages as read
router.put('/read', auth, async (req, res) => {
    try {
        await Message.updateMany(
            { receiver: req.user._id, read: false },
            { read: true }
        );
        res.json({ message: 'Messages marked as read' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to mark as read' });
    }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
    try {
        const count = await Message.countDocuments({ receiver: req.user._id, read: false });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: 'Failed to get count' });
    }
});

// ADMIN: Get all messages grouped by user
router.get('/admin/all', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });

        const messages = await Message.find({})
            .populate('sender', 'name email role')
            .populate('receiver', 'name email role')
            .populate('announcementId', 'title')
            .sort({ createdAt: -1 });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});

// ADMIN: Reply to user
router.post('/admin/reply', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });

        const { userId, content, announcementId } = req.body;

        const message = new Message({
            sender: req.user._id,
            receiver: userId,
            content,
            announcementId: announcementId || undefined,
        });

        await message.save();
        await message.populate('sender', 'name email role');
        await message.populate('receiver', 'name email role');
        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ message: 'Failed to send reply', error: err.message });
    }
});

module.exports = router;
