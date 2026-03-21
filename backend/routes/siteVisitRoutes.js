const express = require('express');
const supabase = require('../config/supabase');
const sendEmail = require('../utils/email');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.post('/book', async (req, res) => {
    try {
        const { name, email, phone, projectId, preferredDate, message } = req.body;
        if (!name || !email || !phone || !preferredDate) {
            return res.status(400).json({ message: 'Name, email, phone, and preferred date are required' });
        }

        const insertData = {
            name, email, phone, 
            project_id: projectId, 
            preferred_date: preferredDate, 
            message
        };

        const { data: visit, error } = await supabase.from('site_visits').insert(insertData).select().single();
        if (error) throw error;

        sendEmail({
            to: process.env.EMAIL_USER || 'pvrgroupsvijayawada@gmail.com',
            subject: 'New Site Visit Booking - PVR Groups',
            html: `<h2>New Site Visit Request</h2><p>Name: ${name}</p><p>Email: ${email}</p><p>Phone: ${phone}</p><p>Date: ${preferredDate}</p><p>Message: ${message || 'N/A'}</p>`
        }).catch(emailErr => {
            console.error('Failed to send email notification:', emailErr);
        });

        res.status(201).json({ message: 'Site visit booked successfully!', visit: { ...visit, _id: visit.id } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user's site visits
router.get('/my', auth, async (req, res) => {
    try {
        const { data: visits, error } = await supabase
            .from('site_visits')
            .select('*, projects(name)')
            .eq('email', req.user.email)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        const formatted = visits.map(v => ({
            ...v,
            _id: v.id,
            projectId: v.projects ? { _id: v.project_id, name: v.projects.name } : v.project_id,
            preferredDate: v.preferred_date,
            createdAt: v.created_at
        }));
        
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Admin: Get all site visits
router.get('/admin/all', auth, adminAuth, async (req, res) => {
    try {
        const { data: visits, error } = await supabase
            .from('site_visits')
            .select('*, projects(name)')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        const formatted = visits.map(v => ({
            ...v,
            _id: v.id,
            projectId: v.projects ? { _id: v.project_id, name: v.projects.name } : v.project_id,
            preferredDate: v.preferred_date,
            createdAt: v.created_at
        }));
        
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Admin: Delete a site visit
router.delete('/admin/:id', auth, adminAuth, async (req, res) => {
    try {
        const { error } = await supabase.from('site_visits').delete().eq('id', req.params.id);
        if (error) return res.status(404).json({ message: 'Site visit not found' });
        
        res.json({ message: 'Site visit deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
