const express = require('express');
const sendEmail = require('../utils/email');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

let campaignStatus = {
    running: false,
    sent: 0,
    failed: 0,
    total: 0,
    message: '',
    lastUpdated: null
};

router.get('/campaign/status', auth, adminAuth, (req, res) => {
    res.json(campaignStatus);
});

router.post('/campaign', auth, adminAuth, async (req, res) => {
    try {
        const { subject, htmlContent, targetGroup, selectedUserIds } = req.body;
        if (!subject || !htmlContent) return res.status(400).json({ message: 'Subject and content required' });

        if (campaignStatus.running) {
            return res.status(409).json({ message: 'A campaign is already in progress', ...campaignStatus });
        }

        let recipients = [];
        if (targetGroup === 'selected' && selectedUserIds && selectedUserIds.length > 0) {
            const { data } = await supabase.from('users').select('email, name').in('id', selectedUserIds);
            recipients = data || [];
        } else if (targetGroup === 'all') {
            const { data } = await supabase.from('users').select('email, name');
            recipients = data || [];
        } else if (targetGroup === 'newsletter') {
            const { data } = await supabase.from('newsletters').select('email');
            recipients = (data || []).map(s => ({ email: s.email, name: 'Subscriber' }));
        } else {
            const { data } = await supabase.from('users').select('email, name');
            recipients = data || [];
        }

        if (recipients.length === 0) {
            return res.json({ message: 'No recipients found', sent: 0, failed: 0, total: 0 });
        }

        campaignStatus = {
            running: true,
            sent: 0,
            failed: 0,
            total: recipients.length,
            message: 'Sending...',
            lastUpdated: new Date()
        };

        res.json({ message: 'Campaign started', sent: 0, failed: 0, total: recipients.length, started: true });

        (async () => {
            for (const user of recipients) {
                try {
                    const personalized = htmlContent.replace(/{{name}}/g, user.name || 'Valued Customer');
                    const result = await sendEmail({ to: user.email, subject, html: personalized });
                    if (result.success) {
                        campaignStatus.sent++;
                    } else {
                        campaignStatus.failed++;
                    }
                } catch (err) {
                    campaignStatus.failed++;
                }
                campaignStatus.lastUpdated = new Date();
            }
            campaignStatus.running = false;
            campaignStatus.message = 'Campaign completed';
        })();

    } catch (error) {
        campaignStatus.running = false;
        campaignStatus.message = 'Campaign failed';
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/welcome', async (req, res) => {
    try {
        const { email, name } = req.body;
        await sendEmail({
            to: email,
            subject: 'Welcome to PVR Groups - Premium Living Awaits!',
            html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a1628;color:#fff;border-radius:16px;overflow:hidden">
                    <div style="background:linear-gradient(135deg,#C4A44B,#d4b85c);padding:30px;text-align:center">
                        <h1 style="margin:0;font-size:28px;color:#0a1628">Welcome to PVR Groups</h1>
                        <p style="margin:5px 0 0;color:#0a1628;opacity:0.8">Building Luxury Living in Vijayawada</p>
                    </div>
                    <div style="padding:30px">
                        <h2 style="color:#C4A44B;margin-top:0">Hello ${name}! 🏠</h2>
                        <p style="color:#ccc;line-height:1.8">Thank you for joining PVR Groups. Explore our premium residential and commercial projects across Vijayawada.</p>
                        <div style="background:#1a2a4a;border-radius:12px;padding:20px;margin:20px 0;border-left:4px solid #C4A44B">
                            <p style="color:#C4A44B;font-weight:bold;margin:0 0 10px">What you can do:</p>
                            <p style="color:#ccc;margin:5px 0">✦ Browse luxury projects</p>
                            <p style="color:#ccc;margin:5px 0">✦ Book site visits</p>
                            <p style="color:#ccc;margin:5px 0">✦ Save favorite properties</p>
                            <p style="color:#ccc;margin:5px 0">✦ Compare projects side by side</p>
                            <p style="color:#ccc;margin:5px 0">✦ Earn rewards via referrals</p>
                        </div>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/projects" style="display:inline-block;background:linear-gradient(135deg,#C4A44B,#d4b85c);color:#0a1628;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;margin-top:10px">Explore Projects</a>
                    </div>
                    <div style="background:#050d1a;padding:20px;text-align:center">
                        <p style="color:#666;font-size:12px;margin:0">PVR Groups | Vijayawada, Andhra Pradesh</p>
                    </div>
                </div>
            `
        });
        res.json({ message: 'Welcome email sent' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send email', error: error.message });
    }
});

router.post('/reminder', auth, adminAuth, async (req, res) => {
    try {
        const { email, name, type, projectName, date } = req.body;
        let subject, html;

        if (type === 'visit') {
            subject = `Reminder: Your Site Visit at ${projectName} - PVR Groups`;
            html = `<h2>Hi ${name},</h2><p>This is a friendly reminder about your upcoming site visit at <strong>${projectName}</strong> on <strong>${date}</strong>.</p><p>We look forward to seeing you!</p><br><p style="color:#C4A44B;font-weight:bold">PVR Groups Team</p>`;
        } else {
            subject = `Special Offer from PVR Groups`;
            html = `<h2>Hi ${name},</h2><p>We have exciting new offers on our projects. Don't miss out!</p><br><p style="color:#C4A44B;font-weight:bold">PVR Groups Team</p>`;
        }

        await sendEmail({ to: email, subject, html });
        res.json({ message: 'Reminder sent' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send reminder', error: error.message });
    }
});

module.exports = router;
