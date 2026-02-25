const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const Referral = require('../models/Referral');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

// Get/generate user's referral code
router.get('/code', auth, async (req, res) => {
    try {
        let user = await User.findById(req.user._id);
        if (!user.referralCode) {
            user.referralCode = 'PVR' + crypto.randomBytes(4).toString('hex').toUpperCase();
            await user.save();
        }
        res.json({
            referralCode: user.referralCode,
            rewardPoints: user.rewardPoints || 0,
            referralLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?ref=${user.referralCode}`
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get referral stats
router.get('/stats', auth, async (req, res) => {
    try {
        const referrals = await Referral.find({ referrerId: req.user._id })
            .populate('referredUserId', 'name email createdAt');
        const user = await User.findById(req.user._id);
        res.json({
            totalReferrals: referrals.length,
            completedReferrals: referrals.filter(r => r.status === 'completed' || r.status === 'rewarded').length,
            rewardPoints: user.rewardPoints || 0,
            referrals
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Process referral during registration (called internally)
router.post('/process', async (req, res) => {
    try {
        const { referralCode, newUserId } = req.body;
        if (!referralCode) return res.status(400).json({ message: 'No referral code' });

        const referrer = await User.findOne({ referralCode });
        if (!referrer) return res.status(404).json({ message: 'Invalid referral code' });

        const referral = await Referral.create({
            referrerId: referrer._id,
            referredUserId: newUserId,
            status: 'completed',
            rewardPoints: 100,
        });

        // Award points to referrer
        referrer.rewardPoints = (referrer.rewardPoints || 0) + 100;
        await referrer.save();

        // Mark referred user
        await User.findByIdAndUpdate(newUserId, { referredBy: referrer._id });

        res.json({ message: 'Referral processed', referral });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Admin: Get all referrals
router.get('/admin/all', auth, adminAuth, async (req, res) => {
    try {
        const referrals = await Referral.find()
            .populate('referrerId', 'name email referralCode')
            .populate('referredUserId', 'name email')
            .sort({ createdAt: -1 });
        const totalPoints = await User.aggregate([{ $group: { _id: null, total: { $sum: '$rewardPoints' } } }]);
        res.json({
            referrals,
            totalReferrals: referrals.length,
            totalPointsDistributed: totalPoints[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
