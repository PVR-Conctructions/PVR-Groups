const express = require('express');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

router.get('/registrations', auth, adminAuth, async (req, res) => {
    try {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const { data, error } = await supabase
            .from('users')
            .select('created_at')
            .eq('role', 'user')
            .gte('created_at', twelveMonthsAgo.toISOString());

        if (error) throw error;

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const result = [];
        
        const grouped = {};
        for (const row of data) {
            const d = new Date(row.created_at);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            grouped[key] = (grouped[key] || 0) + 1;
        }

        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const m = d.getMonth() + 1;
            const yr = d.getFullYear();
            const key = `${yr}-${m}`;
            result.push({ month: months[m - 1] + ' ' + yr, users: grouped[key] || 0 });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/project-views', auth, adminAuth, async (req, res) => {
    try {
        const { data: projects, error } = await supabase
            .from('projects')
            .select('id, name, view_count, status')
            .order('view_count', { ascending: false })
            .limit(10);
            
        if (error) throw error;
        
        res.json(projects.map(p => ({ ...p, _id: p.id, viewCount: p.view_count })));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/revenue', auth, adminAuth, async (req, res) => {
    try {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const { data, error } = await supabase
            .from('payments')
            .select('amount, created_at')
            .eq('status', 'paid')
            .gte('created_at', twelveMonthsAgo.toISOString());

        if (error) throw error;

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const result = [];
        let totalRevenue = 0;
        
        const grouped = {};
        for (const row of data) {
            const d = new Date(row.created_at);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            if (!grouped[key]) grouped[key] = { revenue: 0, count: 0 };
            grouped[key].revenue += Number(row.amount);
            grouped[key].count += 1;
        }

        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const m = d.getMonth() + 1;
            const yr = d.getFullYear();
            const key = `${yr}-${m}`;
            const revInfo = grouped[key] || { revenue: 0, count: 0 };
            totalRevenue += revInfo.revenue;
            result.push({ month: months[m - 1], revenue: revInfo.revenue, transactions: revInfo.count });
        }

        res.json({ monthly: result, totalRevenue });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/visitors', auth, adminAuth, async (req, res) => {
    try {
        const [visitsQ, authQ, messagesQ, usersQ] = await Promise.all([
            supabase.from('site_visits').select('*', { count: 'exact', head: true }),
            supabase.from('feedbacks').select('*', { count: 'exact', head: true }),
            supabase.from('messages').select('*', { count: 'exact', head: true }),
            supabase.from('users').select('name, email, created_at').eq('role', 'user').order('created_at', { ascending: false }).limit(5)
        ]);

        const totalVisits = visitsQ.count || 0;
        const totalFeedback = authQ.count || 0;
        const totalInquiries = messagesQ.count || 0;
        const recentUsers = usersQ.data ? usersQ.data.map(u => ({ ...u, createdAt: u.created_at })) : [];

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
