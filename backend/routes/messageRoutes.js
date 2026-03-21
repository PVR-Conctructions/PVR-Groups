const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Send message (user reply to announcement or general message)
router.post('/send', auth, async (req, res) => {
    try {
        const { content, announcementId, receiverId } = req.body;

        let receiver = receiverId;
        if (!receiver) {
            const { data: admin } = await supabase.from('users').select('id').eq('role', 'admin').limit(1).single();
            if (!admin) return res.status(404).json({ message: 'Admin not found' });
            receiver = admin.id;
        }

        const insertData = {
            sender_id: req.user.id,
            receiver_id: receiver,
            content,
            announcement_id: announcementId || null
        };

        const { data: message, error } = await supabase.from('messages').insert([insertData]).select('*, sender:users!messages_sender_id_fkey(name, email)').single();
        if (error) throw error;
        
        res.status(201).json({ ...message, _id: message.id, sender: message.sender });
    } catch (err) {
        res.status(500).json({ message: 'Failed to send message', error: err.message });
    }
});

// Get my messages (for logged-in user)
router.get('/my', auth, async (req, res) => {
    try {
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*, sender:users!messages_sender_id_fkey(name, email, role), receiver:users!messages_receiver_id_fkey(name, email, role), announcements(title)')
            .or(`sender_id.eq.${req.user.id},receiver_id.eq.${req.user.id}`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        const formatted = messages.map(m => ({
            ...m, _id: m.id,
            sender: m.sender ? { _id: m.sender_id, ...m.sender } : m.sender_id,
            receiver: m.receiver ? { _id: m.receiver_id, ...m.receiver } : m.receiver_id,
            announcementId: m.announcements ? { _id: m.announcement_id, title: m.announcements.title } : m.announcement_id,
            createdAt: m.created_at
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});

// Mark messages as read
router.put('/read', auth, async (req, res) => {
    try {
        await supabase.from('messages')
            .update({ read: true })
            .eq('receiver_id', req.user.id)
            .eq('read', false);
        res.json({ message: 'Messages marked as read' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to mark as read' });
    }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
    try {
        const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', req.user.id)
            .eq('read', false);
            
        if (error) throw error;
        res.json({ count: count || 0 });
    } catch (err) {
        res.status(500).json({ message: 'Failed to get count' });
    }
});

// ADMIN: Get all messages grouped by user
router.get('/admin/all', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });

        const { data: messages, error } = await supabase
            .from('messages')
            .select('*, sender:users!messages_sender_id_fkey(name, email, role), receiver:users!messages_receiver_id_fkey(name, email, role), announcements(title)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        const formatted = messages.map(m => ({
            ...m, _id: m.id,
            sender: m.sender ? { _id: m.sender_id, ...m.sender } : m.sender_id,
            receiver: m.receiver ? { _id: m.receiver_id, ...m.receiver } : m.receiver_id,
            announcementId: m.announcements ? { _id: m.announcement_id, title: m.announcements.title } : m.announcement_id,
            createdAt: m.created_at
        }));
        
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});

// ADMIN: Reply to user
router.post('/admin/reply', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });

        const { userId, content, announcementId } = req.body;

        const insertData = {
            sender_id: req.user.id,
            receiver_id: userId,
            content,
            announcement_id: announcementId || null
        };

        const { data: message, error } = await supabase.from('messages').insert([insertData])
            .select('*, sender:users!messages_sender_id_fkey(name, email, role), receiver:users!messages_receiver_id_fkey(name, email, role)')
            .single();
            
        if (error) throw error;
        
        const formatted = {
            ...message, _id: message.id,
            sender: message.sender ? { _id: message.sender_id, ...message.sender } : message.sender_id,
            receiver: message.receiver ? { _id: message.receiver_id, ...message.receiver } : message.receiver_id,
            createdAt: message.created_at
        };
        
        res.status(201).json(formatted);
    } catch (err) {
        res.status(500).json({ message: 'Failed to send reply', error: err.message });
    }
});

module.exports = router;
