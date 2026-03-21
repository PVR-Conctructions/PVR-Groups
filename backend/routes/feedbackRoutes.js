const express = require('express');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

// Submit feedback (authenticated users)
router.post('/', auth, async (req, res) => {
    try {
        const { projectId, rating, comment } = req.body;
        const { data: feedback, error } = await supabase
            .from('feedbacks')
            .insert([{ user_id: req.user.id, project_id: projectId, rating, comment }])
            .select()
            .single();
            
        if (error) throw error;
        res.status(201).json({ message: 'Feedback submitted for approval', feedback: { ...feedback, _id: feedback.id } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get approved feedback for a project (public)
router.get('/project/:projectId', async (req, res) => {
    try {
        const { data: feedback, error } = await supabase
            .from('feedbacks')
            .select('*, users(name)')
            .eq('project_id', req.params.projectId)
            .eq('approved', true)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        const formatted = feedback.map(f => ({
            ...f, _id: f.id, 
            userId: f.users ? { _id: f.user_id, name: f.users.name } : f.user_id,
            projectId: f.project_id,
            createdAt: f.created_at
        }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all feedback (admin only)
router.get('/all', auth, adminAuth, async (req, res) => {
    try {
        const { data: feedback, error } = await supabase
            .from('feedbacks')
            .select('*, users(name, email), projects(name)')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        const formatted = feedback.map(f => ({
            ...f, _id: f.id,
            userId: f.users ? { _id: f.user_id, name: f.users.name, email: f.users.email } : f.user_id,
            projectId: f.projects ? { _id: f.project_id, name: f.projects.name } : f.project_id,
            createdAt: f.created_at
        }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Approve feedback (admin only)
router.put('/:id/approve', auth, adminAuth, async (req, res) => {
    try {
        const { data: feedback, error } = await supabase
            .from('feedbacks')
            .update({ approved: true })
            .eq('id', req.params.id)
            .select()
            .single();
            
        if (error || !feedback) return res.status(404).json({ message: 'Feedback not found' });
        res.json({ message: 'Feedback approved', feedback: { ...feedback, _id: feedback.id } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete feedback (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
    try {
        await supabase.from('feedbacks').delete().eq('id', req.params.id);
        res.json({ message: 'Feedback deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
