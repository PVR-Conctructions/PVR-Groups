const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user's favorites
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('favorites');
        res.json(user.favorites || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add to favorites
router.post('/:projectId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user.favorites.includes(req.params.projectId)) {
            return res.status(400).json({ message: 'Already in favorites' });
        }
        user.favorites.push(req.params.projectId);
        await user.save();
        res.json({ message: 'Added to favorites', favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Remove from favorites
router.delete('/:projectId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.favorites = user.favorites.filter(id => id.toString() !== req.params.projectId);
        await user.save();
        res.json({ message: 'Removed from favorites', favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
