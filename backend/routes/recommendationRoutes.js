const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get recommendations for current user
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const favorites = user.favorites || [];
        let recommended = [];

        if (favorites.length > 0) {
            // Get favorite projects to understand preferences
            const favProjects = await Project.find({ _id: { $in: favorites } });

            // Extract preferences from favorites
            const favStatuses = favProjects.map(p => p.status);
            const favLocations = favProjects.map(p => p.location?.city).filter(Boolean);

            // Find similar projects (not already in favorites)
            recommended = await Project.find({
                _id: { $nin: favorites },
                $or: [
                    { status: { $in: favStatuses } },
                    { 'location.city': { $in: favLocations } },
                ]
            }).limit(6).sort({ viewCount: -1 });
        }

        // If not enough recommendations, fill with trending projects
        if (recommended.length < 4) {
            const existingIds = [...favorites, ...recommended.map(r => r._id)];
            const trending = await Project.find({
                _id: { $nin: existingIds }
            }).sort({ viewCount: -1 }).limit(6 - recommended.length);
            recommended = [...recommended, ...trending];
        }

        // If still empty, return all projects sorted by views
        if (recommended.length === 0) {
            recommended = await Project.find().sort({ viewCount: -1 }).limit(6);
        }

        res.json(recommended);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
