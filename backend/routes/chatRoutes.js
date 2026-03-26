const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/email');
const { askAI } = require('../utils/aiService');

// Route: POST /api/chat/send
// Works for both authenticated users (saves to DB + notifies admin) and guests (AI reply only)
router.post('/send', auth, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content?.trim()) return res.status(400).json({ message: 'Message required' });

        // Get AI reply with project context + fallback chain
        const { reply: aiReply, provider } = await askAI(content);

        // Save message to DB and notify admin (logged-in users only)
        const { data: admin } = await supabase
            .from('users').select('id, email').eq('role', 'admin').limit(1).single();

        await supabase.from('messages').insert([{
            sender_id: req.user.id,
            receiver_id: admin ? admin.id : null,
            content,
        }]);

        // Only email admin if the AI couldn't give a project-specific answer
        if (admin && provider === 'fallback') {
            const { data: user } = await supabase
                .from('users').select('name, email').eq('id', req.user.id).single();
            if (user) {
                sendEmail({
                    to: admin.email,
                    subject: `💬 New Chat Message from ${user.name} — PVR Groups`,
                    html: `
                        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#0a1628;color:#fff;border-radius:12px;overflow:hidden">
                            <div style="background:linear-gradient(135deg,#C4A44B,#d4b85c);padding:20px;text-align:center">
                                <h2 style="margin:0;color:#0a1628">New Chat Message</h2>
                            </div>
                            <div style="padding:20px">
                                <p style="color:#C4A44B;font-weight:bold">From: ${user.name} (${user.email})</p>
                                <div style="background:#1a2a4a;border-left:4px solid #C4A44B;padding:15px;border-radius:8px;margin:15px 0">
                                    <p style="color:#ccc;margin:0">"${content}"</p>
                                </div>
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/messages" style="display:inline-block;background:#C4A44B;color:#0a1628;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:10px">Reply in Admin Panel</a>
                            </div>
                        </div>
                    `
                }).catch(() => { });
            }
        }

        // Emit via Socket.io
        const io = req.app.get('io');
        const activeUsers = req.app.get('activeUsers');
        if (io && admin) {
            const adminSocket = activeUsers[admin.id];
            if (adminSocket) {
                io.to(adminSocket).emit('new_user_message', {
                    userId: req.user.id,
                    userName: req.user.name,
                    content,
                    createdAt: new Date(),
                });
            }
        }

        res.json({
            saved: true,
            autoReply: aiReply,
            hasRealReply: false,
            provider, // debug info
        });
    } catch (err) {
        console.error('Chat error:', err);
        res.status(500).json({ message: 'Failed to send message', error: err.message });
    }
});

// Route: GET /api/chat/replies  — admin replies to user
router.get('/replies', auth, async (req, res) => {
    try {
        const since = req.query.since ? new Date(req.query.since) : new Date(Date.now() - 86400000);
        const { data: admin } = await supabase.from('users').select('id').eq('role', 'admin').limit(1).single();

        let query = supabase.from('messages')
            .select('*')
            .eq('receiver_id', req.user.id)
            .gt('created_at', since.toISOString())
            .order('created_at', { ascending: true });

        if (admin) query = query.eq('sender_id', admin.id);

        const { data: replies } = await query;
        const formatted = (replies || []).map(r => ({ ...r, _id: r.id, createdAt: r.created_at }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching replies' });
    }
});

// Route: POST /api/chat/guest  — unauthenticated AI chat (no DB save)
router.post('/guest', async (req, res) => {
    try {
        const { content } = req.body;
        if (!content?.trim()) return res.status(400).json({ message: 'Message required' });
        const { reply } = await askAI(content);
        res.json({ reply });
    } catch (err) {
        res.status(500).json({ reply: "Please contact us at +91 98765 43210 for assistance." });
    }
});

module.exports = router;
