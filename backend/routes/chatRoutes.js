const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/email');

const getAutoReply = (message) => {
    const msg = message.toLowerCase();
    if (msg.match(/project|property|flat|apartment|villa|plot/))
        return 'We have premium residential and commercial projects across Vijayawada! Visit our Projects page to explore all available options with photos, amenities, and pricing.';
    if (msg.match(/price|cost|rate|budget|afford|how much/))
        return 'Pricing varies by project and unit type. Our range starts from affordable options to luxury villas. Contact our sales team at +91 98765 43210 for detailed pricing tailored to your budget.';
    if (msg.match(/visit|tour|site|appointment|schedule|book/))
        return 'Great! You can book a site visit from any project page. Our team will arrange a convenient time for you. Alternatively, call us at +91 98765 43210 to schedule immediately!';
    if (msg.match(/loan|emi|finance|bank|mortgage|home loan/))
        return 'We have tie-ups with leading banks including SBI, HDFC, and ICICI for home loans at attractive rates. Use our EMI Calculator on the website for estimates, or contact us for personalized loan assistance.';
    if (msg.match(/location|where|address|area|sector/))
        return 'Our projects are in prime locations across Vijayawada including Guntur Road, Benz Circle, Moghalrajpuram, and Vijayawada bypass. Each project page has a map view!';
    if (msg.match(/amenities|facilities|gym|pool|parking|security|club/))
        return 'Our projects feature world-class amenities: swimming pools, gyms, clubhouses, children\'s play areas, 24/7 security, power backup, and landscaped gardens!';
    if (msg.match(/ready|possession|handover|completion|when/))
        return 'Each project has different possession timelines. Ongoing projects are available for booking now with completion dates mentioned on their pages. Check the Projects section for details!';
    if (msg.match(/contact|phone|call|number|reach/))
        return 'You can reach us at:\n📞 +91 98765 43210\n📧 info@pvrgroups.com\n🕒 Mon-Sat, 9 AM - 7 PM\nOr visit our office in Vijayawada!';
    if (msg.match(/hi|hello|hey|morning|afternoon|evening|good/))
        return 'Hello! 👋 Welcome to PVR Groups! I\'m here to help you find your dream property. Feel free to ask about our projects, pricing, site visits, or anything else!';
    if (msg.match(/thank|thanks|ok|okay|great|nice|perfect|good/))
        return 'You\'re welcome! 😊 Is there anything else I can help you with? Our team is always happy to assist!';
    return null; 
};

router.post('/send', auth, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content?.trim()) return res.status(400).json({ message: 'Message required' });

        const autoReply = getAutoReply(content);

        const { data: admin } = await supabase.from('users').select('id, email').eq('role', 'admin').limit(1).single();
        
        await supabase.from('messages').insert([{
            sender_id: req.user.id,
            receiver_id: admin ? admin.id : null,
            content,
        }]);

        if (!autoReply && admin) {
            const { data: user } = await supabase.from('users').select('name, email').eq('id', req.user.id).single();
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
            autoReply: autoReply || 'Thank you for your message! Our team will reply soon. For immediate help, call +91 98765 43210.',
            hasRealReply: !autoReply,
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to send message', error: err.message });
    }
});

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

module.exports = router;
module.exports.getAutoReply = getAutoReply;
