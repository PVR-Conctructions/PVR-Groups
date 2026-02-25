const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const Feedback = require('../models/Feedback');
const Announcement = require('../models/Announcement');
const Newsletter = require('../models/Newsletter');
const SiteVisit = require('../models/SiteVisit');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

// Dashboard stats
router.get('/dashboard', auth, adminAuth, async (req, res) => {
    try {
        const [totalUsers, totalProjects, ongoingProjects, completedProjects, totalFeedback, pendingFeedback, totalNewsletterSubs, totalSiteVisits] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Project.countDocuments(),
            Project.countDocuments({ status: 'ongoing' }),
            Project.countDocuments({ status: 'completed' }),
            Feedback.countDocuments(),
            Feedback.countDocuments({ approved: false }),
            Newsletter.countDocuments(),
            SiteVisit.countDocuments(),
        ]);

        res.json({
            totalUsers, totalProjects, ongoingProjects, completedProjects,
            totalFeedback, pendingFeedback, totalNewsletterSubs, totalSiteVisits
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all users
router.get('/users', auth, adminAuth, async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Announcements CRUD
router.get('/announcements', async (req, res) => {
    try {
        const announcements = await Announcement.find({ active: true }).sort({ createdAt: -1 });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/announcements', auth, adminAuth, async (req, res) => {
    try {
        const { title, content } = req.body;
        const announcement = await Announcement.create({ title, content });
        res.status(201).json(announcement);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.delete('/announcements/:id', auth, adminAuth, async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Site visits
router.get('/site-visits', auth, adminAuth, async (req, res) => {
    try {
        const visits = await SiteVisit.find().populate('projectId', 'name').sort({ createdAt: -1 });
        res.json(visits);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
