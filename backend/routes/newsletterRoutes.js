const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const { data: existing } = await supabase.from('newsletters').select('id').eq('email', email).single();
        if (existing) return res.status(400).json({ message: 'Already subscribed' });

        const { error } = await supabase.from('newsletters').insert([{ email }]);
        if (error) throw error;
        
        res.status(201).json({ message: 'Subscribed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
