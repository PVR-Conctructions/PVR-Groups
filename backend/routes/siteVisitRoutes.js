const express = require('express');
const SiteVisit = require('../models/SiteVisit');
const sendEmail = require('../utils/email');
const router = express.Router();

router.post('/book', async (req, res) => {
    try {
        const { name, email, phone, projectId, preferredDate, message } = req.body;
        if (!name || !email || !phone || !preferredDate) {
            return res.status(400).json({ message: 'Name, email, phone, and preferred date are required' });
        }

        const visit = await SiteVisit.create({ name, email, phone, projectId, preferredDate, message });

        // Notify admin
        await sendEmail({
            to: process.env.EMAIL_USER || 'pvrgroupsvijayawada@gmail.com',
            subject: 'New Site Visit Booking - PVR Groups',
            html: `<h2>New Site Visit Request</h2><p>Name: ${name}</p><p>Email: ${email}</p><p>Phone: ${phone}</p><p>Date: ${preferredDate}</p><p>Message: ${message || 'N/A'}</p>`
        });

        res.status(201).json({ message: 'Site visit booked successfully!', visit });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user's site visits
const auth = require('../middleware/auth');
router.get('/my', auth, async (req, res) => {
    try {
        const visits = await SiteVisit.find({ email: req.user.email }).populate('projectId', 'name').sort({ createdAt: -1 });
        res.json(visits);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
