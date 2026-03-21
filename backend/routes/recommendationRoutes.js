const express = require('express');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const projectController = require('../controllers/projectController');
const { mapProject } = projectController;
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const favorites = req.user.favorites || [];
        let recommended = [];

        if (favorites.length > 0) {
            const { data: favProjects } = await supabase.from('projects').select('*').in('id', favorites);
            const favProjectsArr = favProjects || [];
            
            const favStatuses = favProjectsArr.map(p => p.status);
            const favLocations = favProjectsArr.map(p => p.location?.city).filter(Boolean);

            let query = supabase.from('projects').select('*');
            if (favorites.length > 0) {
                // Not in favorites
                // PostgREST unfortunately doesn't easily compose complicated OR statements with an AND filter on 'id.notin' in a single fluent chain perfectly without raw string building,
                // so we can fetch related projects and filter in js if size is small, but let's try to query.
            }
            // For simplicity, fetch top trending, we will filter out favorites
            const { data: trend } = await supabase.from('projects')
                .select('*')
                .order('view_count', { ascending: false })
                .limit(20);
                
            let matching = (trend || []).filter(p => !favorites.includes(p.id));
            
            // Boost those that match status or location
            matching.sort((a, b) => {
                let scoreA = (favStatuses.includes(a.status) ? 1 : 0) + (favLocations.includes(a.location?.city) ? 1 : 0);
                let scoreB = (favStatuses.includes(b.status) ? 1 : 0) + (favLocations.includes(b.location?.city) ? 1 : 0);
                return scoreB - scoreA;
            });
            
            recommended = matching.slice(0, 6);
        }

        if (recommended.length < 4) {
            const existingIds = [...favorites, ...recommended.map(r => r.id)];
            const { data: trending } = await supabase.from('projects')
                .select('*')
                .order('view_count', { ascending: false })
                .limit(10);
                
            const newTrending = (trending || []).filter(p => !existingIds.includes(p.id)).slice(0, 6 - recommended.length);
            recommended = [...recommended, ...newTrending];
        }

        if (recommended.length === 0) {
            const { data: defaultRecs } = await supabase.from('projects').select('*').order('view_count', { ascending: false }).limit(6);
            recommended = defaultRecs || [];
        }

        res.json(recommended.map(mapProject));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
