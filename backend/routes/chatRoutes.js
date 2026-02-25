const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/email');

// Smart AI auto-replies based on keywords
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
    return null; // No auto-reply — save to DB for admin
};

// POST /api/chat/send — user sends message from chat widget
router.post('/send', auth, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content?.trim()) return res.status(400).json({ message: 'Message required' });

        const autoReply = getAutoReply(content);

        // Always save the user's message
        const admin = await User.findOne({ role: 'admin' });
        const userMessage = new Message({
            sender: req.user._id,
            receiver: admin?._id,
            content,
        });
        await userMessage.save();

        // If no auto-reply, notify admin via email
        if (!autoReply && admin) {
            const user = await User.findById(req.user._id).select('name email');
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
            }).catch(() => { }); // Don't fail if email fails
        }

        // Notify admin via socket.io
        const io = req.app.get('io');
        const activeUsers = req.app.get('activeUsers');
        if (io && admin) {
            const adminSocket = activeUsers[admin._id.toString()];
            if (adminSocket) {
                io.to(adminSocket).emit('new_user_message', {
                    userId: req.user._id,
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

// GET /api/chat/replies — poll for admin replies
router.get('/replies', auth, async (req, res) => {
    try {
        const since = req.query.since ? new Date(req.query.since) : new Date(Date.now() - 86400000);
        const admin = await User.findOne({ role: 'admin' });
        const replies = await Message.find({
            sender: admin?._id,
            receiver: req.user._id,
            createdAt: { $gt: since },
        }).sort({ createdAt: 1 });
        res.json(replies);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching replies' });
    }
});

module.exports = router;
module.exports.getAutoReply = getAutoReply;
