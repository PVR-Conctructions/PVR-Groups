const express = require('express');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const router = express.Router();

// Dashboard stats
router.get('/dashboard', auth, adminAuth, async (req, res) => {
    try {
        const queries = await Promise.all([
            supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'user'),
            supabase.from('projects').select('*', { count: 'exact', head: true }),
            supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'ongoing'),
            supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
            supabase.from('feedbacks').select('*', { count: 'exact', head: true }),
            supabase.from('feedbacks').select('*', { count: 'exact', head: true }).eq('approved', false),
            supabase.from('newsletters').select('*', { count: 'exact', head: true }),
            supabase.from('site_visits').select('*', { count: 'exact', head: true })
        ]);

        const [usersQ, projectsQ, ongoingQ, completedQ, feedbackQ, pendingFeedbackQ, newsletterQ, siteVisitsQ] = queries;

        res.json({
            totalUsers: usersQ.count || 0,
            totalProjects: projectsQ.count || 0,
            ongoingProjects: ongoingQ.count || 0,
            completedProjects: completedQ.count || 0,
            totalFeedback: feedbackQ.count || 0,
            pendingFeedback: pendingFeedbackQ.count || 0,
            totalNewsletterSubs: newsletterQ.count || 0,
            totalSiteVisits: siteVisitsQ.count || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all users
router.get('/users', auth, adminAuth, async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, email, phone, role, verified, created_at, last_login')
            .eq('role', 'user')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const formatted = users.map(u => ({ ...u, _id: u.id, createdAt: u.created_at, lastLogin: u.last_login }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Announcements CRUD
router.get('/announcements', async (req, res) => {
    try {
        const { data: announcements, error } = await supabase
            .from('announcements')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        const formatted = announcements.map(a => ({ ...a, _id: a.id, createdAt: a.created_at }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/announcements', auth, adminAuth, async (req, res) => {
    try {
        const { title, content } = req.body;
        const { data: announcement, error } = await supabase
            .from('announcements')
            .insert([{ title, content }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ ...announcement, _id: announcement.id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.delete('/announcements/:id', auth, adminAuth, async (req, res) => {
    try {
        await supabase.from('announcements').delete().eq('id', req.params.id);
        res.json({ message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Site visits
router.get('/site-visits', auth, adminAuth, async (req, res) => {
    try {
        const { data: visits, error } = await supabase
            .from('site_visits')
            .select('*, projects(name)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        const formatted = visits.map(v => ({
            ...v, _id: v.id,
            projectId: v.projects ? { _id: v.project_id, name: v.projects.name } : v.project_id,
            createdAt: v.created_at
        }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Setup 2FA
router.post('/setup-2fa', auth, adminAuth, async (req, res) => {
    try {
        const secret = speakeasy.generateSecret({
            name: "PVR Group Admin Login"
        });

        const { error } = await supabase
            .from('users')
            .update({ twofa_secret: secret.base32 })
            .eq('id', req.user.id);

        if (error) throw error;

        const qrCode = await QRCode.toDataURL(secret.otpauth_url);

        res.json({
            qrCode,
            secret: secret.base32
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Verify 2FA Setup
router.post('/verify-2fa', auth, adminAuth, async (req, res) => {
    try {
        const { token } = req.body;

        const { data: user, error: findError } = await supabase
            .from('users')
            .select('id, twofa_secret')
            .eq('id', req.user.id)
            .single();

        if (findError || !user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twofa_secret,
            encoding: 'base32',
            token,
            window: 1 // allows 30 seconds leeway
        });

        if (!verified) {
            return res.status(400).json({ message: 'Invalid or expired 2FA code' });
        }

        const { error: updateError } = await supabase
            .from('users')
            .update({ twofa_enabled: true })
            .eq('id', user.id);

        if (updateError) throw updateError;

        res.json({ success: true, message: '2FA enabled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Disable 2FA
router.post('/disable-2fa', auth, adminAuth, async (req, res) => {
    try {
        const { error } = await supabase
            .from('users')
            .update({ twofa_enabled: false, twofa_secret: null })
            .eq('id', req.user.id);

        if (error) throw error;

        res.json({ success: true, message: '2FA disabled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;


//{"status":"OK","timestamp":"2026-05-03T09:17:39.121Z","uptime":"6775s","redis":"connected"}//