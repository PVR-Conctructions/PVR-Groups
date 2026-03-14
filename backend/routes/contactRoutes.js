const express = require('express');
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

// Public: Submit a contact message
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        const contact = new Contact({ name, email, phone, subject, message });
        await contact.save();
        
        // Optionally emit to socket if admin is online
        try {
            const io = req.app.get('io');
            const activeUsers = req.app.get('activeUsers');
            if (io && activeUsers) {
                const User = require('../models/User');
                const admin = await User.findOne({ role: 'admin' });
                if (admin) {
                    const adminSocket = activeUsers[admin._id.toString()];
                    if (adminSocket) {
                        io.to(adminSocket).emit('new_contact_message', contact);
                    }
                }
            }
        } catch (socketErr) {
            console.error('Socket emission failed in contacts:', socketErr);
        }
        
        res.status(201).json({ success: true, message: 'Message sent successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to send message', error: err.message });
    }
});

// Admin: Get all contact messages
router.get('/admin/all', auth, adminAuth, async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch messages', error: err.message });
    }
});

// Admin: Mark message as read
router.put('/admin/:id/read', auth, adminAuth, async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
        if (!contact) return res.status(404).json({ success: false, message: 'Message not found' });
        res.json({ success: true, contact });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to mark as read', error: err.message });
    }
});

// Admin: Delete a contact message
router.delete('/admin/:id', auth, adminAuth, async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Message deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete message', error: err.message });
    }
});

module.exports = router;
