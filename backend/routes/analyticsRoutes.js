const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const Payment = require('../models/Payment');
const SiteVisit = require('../models/SiteVisit');
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

// Monthly user registrations (last 12 months)
router.get('/registrations', auth, adminAuth, async (req, res) => {
    try {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const data = await User.aggregate([
            { $match: { createdAt: { $gte: twelveMonthsAgo }, role: 'user' } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const result = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const m = d.getMonth() + 1;
            const yr = d.getFullYear();
            const found = data.find(d => d._id.month === m && d._id.year === yr);
            result.push({ month: months[m - 1] + ' ' + yr, users: found ? found.count : 0 });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Most viewed projects
router.get('/project-views', auth, adminAuth, async (req, res) => {
    try {
        const projects = await Project.find()
            .sort({ viewCount: -1 })
            .limit(10)
            .select('name viewCount status');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Revenue data (from payments)
router.get('/revenue', auth, adminAuth, async (req, res) => {
    try {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const data = await Payment.aggregate([
            { $match: { createdAt: { $gte: twelveMonthsAgo }, status: 'paid' } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const result = [];
        let totalRevenue = 0;
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const m = d.getMonth() + 1;
            const yr = d.getFullYear();
            const found = data.find(d => d._id.month === m && d._id.year === yr);
            const rev = found ? found.revenue : 0;
            totalRevenue += rev;
            result.push({ month: months[m - 1], revenue: rev, transactions: found ? found.count : 0 });
        }

        res.json({ monthly: result, totalRevenue });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Visitor/inquiry stats
router.get('/visitors', auth, adminAuth, async (req, res) => {
    try {
        const [totalVisits, totalFeedback, totalInquiries, recentUsers] = await Promise.all([
            SiteVisit.countDocuments(),
            Feedback.countDocuments(),
            require('../models/Message').countDocuments(),
            User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
        ]);

        res.json({
            totalVisits,
            totalFeedback,
            totalInquiries,
            recentUsers,
            distribution: [
                { name: 'Site Visits', value: totalVisits },
                { name: 'Feedback', value: totalFeedback },
                { name: 'Inquiries', value: totalInquiries },
            ]
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
