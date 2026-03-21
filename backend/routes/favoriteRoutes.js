const express = require('express');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user's favorites
router.get('/', auth, async (req, res) => {
    try {
        let favorites = req.user.favorites || [];
        if (favorites.length > 0) {
            const { data: projects } = await supabase
                .from('projects')
                .select('*')
                .in('id', favorites);
            res.json(projects || []);
        } else {
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add to favorites
router.post('/:projectId', auth, async (req, res) => {
    try {
        let favorites = req.user.favorites || [];
        if (favorites.includes(req.params.projectId)) {
            return res.status(400).json({ message: 'Already in favorites' });
        }
        favorites.push(req.params.projectId);
        
        const { error } = await supabase.from('users').update({ favorites }).eq('id', req.user.id);
        if (error) throw error;
        
        res.json({ message: 'Added to favorites', favorites });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Remove from favorites
router.delete('/:projectId', auth, async (req, res) => {
    try {
        let favorites = req.user.favorites || [];
        favorites = favorites.filter(id => id !== req.params.projectId);
        
        const { error } = await supabase.from('users').update({ favorites }).eq('id', req.user.id);
        if (error) throw error;
        
        res.json({ message: 'Removed from favorites', favorites });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
