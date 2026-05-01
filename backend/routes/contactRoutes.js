const express = require('express');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// ─── Validation rules ─────────────────────────────────────────────────────────
const contactValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).escape(),
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('phone').optional().trim()
        .matches(/^[0-9+\-\s()]{7,20}$/).withMessage('Invalid phone number'),
    body('subject').optional().trim().isLength({ max: 200 }).escape(),
    body('message').trim().notEmpty().withMessage('Message is required')
        .isLength({ min: 10, max: 2000 }).withMessage('Message must be 10–2000 characters')
        .escape(),
];

// ─── Public: Submit a contact message ────────────────────────────────────────
router.post('/', contactValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }
    try {
        const { name, email, phone, subject, message } = req.body;

        const { data: contact, error } = await supabase
            .from('contacts')
            .insert([{ name, email, phone, subject, message }])
            .select()
            .single();

        if (error) throw error;

        // Notify admin via Socket.io if online (fire-and-forget)
        try {
            const io = req.app.get('io');
            const activeUsers = req.app.get('activeUsers');
            if (io && activeUsers) {
                const { data: admin } = await supabase
                    .from('users').select('id').eq('role', 'admin').limit(1).single();
                if (admin) {
                    const adminSocket = activeUsers[admin.id];
                    if (adminSocket) io.to(adminSocket).emit('new_contact_message', contact);
                }
            }
        } catch (_) {}

        res.status(201).json({ success: true, message: 'Message sent successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to send message', error: err.message });
    }
});

// ─── Admin: Get all contact messages ─────────────────────────────────────────
router.get('/admin/all', auth, adminAuth, async (req, res) => {
    try {
        const { data: contacts, error } = await supabase
            .from('contacts').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json(contacts.map((c) => ({ ...c, _id: c.id, createdAt: c.created_at, updatedAt: c.updated_at })));
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch messages', error: err.message });
    }
});

// ─── Admin: Mark message as read ──────────────────────────────────────────────
router.put('/admin/:id/read', auth, adminAuth, async (req, res) => {
    try {
        const { data: contact, error } = await supabase
            .from('contacts').update({ read: true }).eq('id', req.params.id).select().single();
        if (error || !contact) return res.status(404).json({ success: false, message: 'Message not found' });
        res.json({ success: true, contact: { ...contact, _id: contact.id } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to mark as read', error: err.message });
    }
});

// ─── Admin: Delete a contact message ─────────────────────────────────────────
router.delete('/admin/:id', auth, adminAuth, async (req, res) => {
    try {
        await supabase.from('contacts').delete().eq('id', req.params.id);
        res.json({ success: true, message: 'Message deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete message', error: err.message });
    }
});

module.exports = router;
