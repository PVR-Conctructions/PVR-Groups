const express = require('express');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

// Get user's payment history
router.get('/', auth, async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user._id })
            .populate('projectId', 'name')
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single payment (for invoice)
router.get('/:id', auth, async (req, res) => {
    try {
        const payment = await Payment.findOne({ _id: req.params.id, userId: req.user._id })
            .populate('projectId', 'name location')
            .populate('userId', 'name email phone');
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Admin: Get all payments
router.get('/admin/all', auth, adminAuth, async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('userId', 'name email')
            .populate('projectId', 'name')
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Admin: Create payment record
router.post('/', auth, adminAuth, async (req, res) => {
    try {
        const payment = await Payment.create(req.body);
        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Admin: Update payment status
router.put('/:id', auth, adminAuth, async (req, res) => {
    try {
        const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
