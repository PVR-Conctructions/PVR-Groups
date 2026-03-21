const express = require('express');
const crypto = require('crypto');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

// Get/generate user's referral code
router.get('/code', auth, async (req, res) => {
    try {
        const { data: user } = await supabase.from('users').select('referral_code, reward_points').eq('id', req.user.id).single();
        let referralCode = user.referral_code;
        
        if (!referralCode) {
            referralCode = 'PVR' + crypto.randomBytes(4).toString('hex').toUpperCase();
            await supabase.from('users').update({ referral_code: referralCode }).eq('id', req.user.id);
        }
        
        res.json({
            referralCode,
            rewardPoints: user.reward_points || 0,
            referralLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?ref=${referralCode}`
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get referral stats
router.get('/stats', auth, async (req, res) => {
    try {
        const { data: referrals, error } = await supabase
            .from('referrals')
            .select('*, referred_user:users!referrals_referred_user_id_fkey(name, email, created_at)')
            .eq('referrer_id', req.user.id);
            
        if (error) throw error;

        const { data: user } = await supabase.from('users').select('reward_points').eq('id', req.user.id).single();
        
        const formatted = referrals.map(r => ({
            ...r, _id: r.id,
            referredUserId: r.referred_user ? { _id: r.referred_user_id, name: r.referred_user.name, email: r.referred_user.email, createdAt: r.referred_user.created_at } : r.referred_user_id,
        }));

        res.json({
            totalReferrals: formatted.length,
            completedReferrals: formatted.filter(r => r.status === 'completed' || r.status === 'rewarded').length,
            rewardPoints: user.reward_points || 0,
            referrals: formatted
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Process referral during registration (called internally typically, but exposed here just in case)
router.post('/process', async (req, res) => {
    try {
        const { referralCode, newUserId } = req.body;
        if (!referralCode) return res.status(400).json({ message: 'No referral code' });

        const { data: referrer } = await supabase.from('users').select('id, reward_points').eq('referral_code', referralCode).single();
        if (!referrer) return res.status(404).json({ message: 'Invalid referral code' });

        const { data: referral, error } = await supabase.from('referrals').insert([{
            referrer_id: referrer.id,
            referred_user_id: newUserId,
            status: 'completed',
            reward_points: 100,
        }]).select().single();

        if (error) throw error;

        // Award points to referrer
        await supabase.from('users').update({ reward_points: (referrer.reward_points || 0) + 100 }).eq('id', referrer.id);

        // Mark referred user
        await supabase.from('users').update({ referred_by: referrer.id }).eq('id', newUserId);

        res.json({ message: 'Referral processed', referral: { ...referral, _id: referral.id } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Admin: Get all referrals
router.get('/admin/all', auth, adminAuth, async (req, res) => {
    try {
        const { data: referrals, error } = await supabase
            .from('referrals')
            .select('*, referrer:users!referrals_referrer_id_fkey(name, email, referral_code), referred_user:users!referrals_referred_user_id_fkey(name, email)')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        const formatted = referrals.map(r => ({
            ...r, _id: r.id,
            referrerId: r.referrer ? { _id: r.referrer_id, name: r.referrer.name, email: r.referrer.email, referralCode: r.referrer.referral_code } : r.referrer_id,
            referredUserId: r.referred_user ? { _id: r.referred_user_id, name: r.referred_user.name, email: r.referred_user.email } : r.referred_user_id,
        }));

        const { data: usersData } = await supabase.from('users').select('reward_points');
        const totalPoints = usersData ? usersData.reduce((acc, curr) => acc + (curr.reward_points || 0), 0) : 0;

        res.json({
            referrals: formatted,
            totalReferrals: formatted.length,
            totalPointsDistributed: totalPoints
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
