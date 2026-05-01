const express = require('express');
const supabase = require('../config/supabase');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const newsletterValidation = [
    body('email')
        .trim()
        .isEmail().withMessage('Valid email address is required')
        .normalizeEmail()
        .isLength({ max: 254 }).withMessage('Email is too long'),
];

router.post('/subscribe', newsletterValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }
    try {
        const { email } = req.body;

        const { data: existing } = await supabase
            .from('newsletters').select('id').eq('email', email).single();
        if (existing) return res.status(400).json({ message: 'Already subscribed' });

        const { error } = await supabase.from('newsletters').insert([{ email }]);
        if (error) throw error;

        res.status(201).json({ message: 'Subscribed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
