const express = require('express');
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

// Submit feedback (authenticated users)
router.post('/', auth, async (req, res) => {
    try {
        const { projectId, rating, comment } = req.body;
        const feedback = await Feedback.create({
            userId: req.user._id,
            projectId, rating, comment
        });
        res.status(201).json({ message: 'Feedback submitted for approval', feedback });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get approved feedback for a project (public)
router.get('/project/:projectId', async (req, res) => {
    try {
        const feedback = await Feedback.find({
            projectId: req.params.projectId,
            approved: true
        }).populate('userId', 'name').sort({ createdAt: -1 });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all feedback (admin only)
router.get('/all', auth, adminAuth, async (req, res) => {
    try {
        const feedback = await Feedback.find()
            .populate('userId', 'name email')
            .populate('projectId', 'name')
            .sort({ createdAt: -1 });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Approve feedback (admin only)
router.put('/:id/approve', auth, adminAuth, async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
        if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
        res.json({ message: 'Feedback approved', feedback });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete feedback (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
    try {
        await Feedback.findByIdAndDelete(req.params.id);
        res.json({ message: 'Feedback deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
