const express = require('express');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { body, validationResult } = require('express-validator');
const { cacheMiddleware, invalidateCacheMiddleware } = require('../middleware/cache');
const router = express.Router();

// ─── Validation ───────────────────────────────────────────────────────────────
const feedbackValidation = [
    body('projectId').notEmpty().withMessage('Project ID is required').isString(),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').trim().notEmpty().withMessage('Comment is required')
        .isLength({ min: 5, max: 2000 }).withMessage('Comment must be 5–2000 characters')
        .escape(),
];

// ─── Submit feedback (authenticated users) ───────────────────────────────────
router.post('/',
    auth,
    feedbackValidation,
    invalidateCacheMiddleware('feedback:all'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
        }
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
    }
);

// ─── Get approved feedback for a project (public) — cached 120s ──────────────
router.get('/project/:projectId',
    cacheMiddleware((req) => `feedback:project:${req.params.projectId}`, 120),
    async (req, res) => {
        try {
            const { data: feedback, error } = await supabase
                .from('feedbacks')
                .select('*, users(name)')
                .eq('project_id', req.params.projectId)
                .eq('approved', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            const formatted = feedback.map((f) => ({
                ...f, _id: f.id,
                userId: f.users ? { _id: f.user_id, name: f.users.name } : f.user_id,
                projectId: f.project_id,
                createdAt: f.created_at,
            }));
            res.json(formatted);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
);

// ─── Get all feedback (admin only) ───────────────────────────────────────────
router.get('/all', auth, adminAuth, async (req, res) => {
    try {
        const { data: feedback, error } = await supabase
            .from('feedbacks')
            .select('*, users(name, email), projects(name)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        const formatted = feedback.map((f) => ({
            ...f, _id: f.id,
            userId: f.users ? { _id: f.user_id, name: f.users.name, email: f.users.email } : f.user_id,
            projectId: f.projects ? { _id: f.project_id, name: f.projects.name } : f.project_id,
            createdAt: f.created_at,
        }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ─── Approve feedback (admin only) ───────────────────────────────────────────
router.put('/:id/approve', auth, adminAuth,
    (req, res, next) => {
        const cache = req.app.get('cache');
        if (cache) cache.del('feedback:all');
        next();
    },
    async (req, res) => {
        try {
            const { data: feedback, error } = await supabase
                .from('feedbacks')
                .update({ approved: true })
                .eq('id', req.params.id)
                .select()
                .single();

            if (error || !feedback) return res.status(404).json({ message: 'Feedback not found' });
            // Also clear the project-specific cache so approved review appears immediately
            const cache = req.app.get('cache');
            if (cache && feedback.project_id) {
                cache.del(`feedback:project:${feedback.project_id}`);
            }
            res.json({ message: 'Feedback approved', feedback: { ...feedback, _id: feedback.id } });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
);

// ─── Delete feedback (admin only) ────────────────────────────────────────────
router.delete('/:id', auth, adminAuth, async (req, res) => {
    try {
        await supabase.from('feedbacks').delete().eq('id', req.params.id);
        const cache = req.app.get('cache');
        if (cache) { cache.del('feedback:all'); }
        res.json({ message: 'Feedback deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
