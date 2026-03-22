const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const supabase = require('../config/supabase');
const sendEmail = require('../utils/email');
const speakeasy = require('speakeasy');
const router = express.Router();

// Register
router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { name, email, phone, password, referralCode } = req.body;

        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();
            
        if (existingUser) return res.status(400).json({ message: 'Email already registered' });

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedPassword = await bcrypt.hash(password, 12);

        let referredBy = null;
        if (referralCode) {
            const { data: referrer } = await supabase.from('users').select('id, reward_points').eq('referral_code', referralCode).single();
            if (referrer) {
                referredBy = referrer.id;
                await supabase.from('users').update({ reward_points: (referrer.reward_points || 0) + 100 }).eq('id', referrer.id);
            }
        }

        const { data: user, error: createError } = await supabase
            .from('users')
            .insert({
                name, email, phone, password: hashedPassword, verification_token: verificationToken, referred_by: referredBy
            })
            .select('id, name, email, phone, role')
            .single();

        if (createError) throw createError;

        if (referredBy) {
            await supabase.from('referrals').insert({ referrer_id: referredBy, referred_user_id: user.id, status: 'completed', reward_points: 100 });
        }

        // Send verification email in background
        sendEmail({
            to: email,
            subject: 'Welcome to PVR Groups - Verify Your Email',
            html: `<h1>Welcome to PVR Groups, ${name}!</h1><p>Click <a href="${process.env.FRONTEND_URL}/verify/${verificationToken}">here</a> to verify your email.</p>`
        }).catch(err => console.error('Verification email failed:', err.message));

        sendEmail({
            to: 'raintreepark02@gmail.com',
            subject: 'New User Registration - PVR Groups',
            html: `<h2>New User Registered</h2><p>Name: ${name}</p><p>Email: ${email}</p><p>Phone: ${phone}</p>`
        }).catch(err => console.error('Admin notification email failed:', err.message));

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: { ...user, _id: user.id }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;
        
        const { data: user, error: findError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
            
        if (findError || !user) return res.status(400).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        if (user.role === 'admin' && user.twofa_enabled) {
            return res.json({ requires2FA: true, message: 'Authenticator code required' });
        }

        await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', user.id);

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, _id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, twofa_enabled: user.twofa_enabled }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Admin 2FA Login Verify
router.post('/login-verify', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('token').notEmpty().withMessage('Authenticator code is required'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password, token: totpToken } = req.body;

        const { data: user, error: findError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (findError || !user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        if (user.role === 'admin' && user.twofa_enabled) {
            const verified = speakeasy.totp.verify({
                secret: user.twofa_secret,
                encoding: "base32",
                token: totpToken,
                window: 1 // allows 30 seconds leeway
            });

            if (!verified) {
                return res.status(401).json({ message: 'Invalid authenticator code' });
            }
        }

        await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', user.id);

        const jwtToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        res.json({
            success: true,
            message: 'Login successful',
            token: jwtToken,
            user: { id: user.id, _id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, twofa_enabled: user.twofa_enabled }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Verify Email
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        const { data: user } = await supabase.from('users').select('id').eq('verification_token', token).single();
        if (!user) return res.status(400).json({ message: 'Invalid verification token' });

        await supabase.from('users').update({ verified: true, verification_token: null }).eq('id', user.id);
        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Forgot Password
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Valid email is required'),
], async (req, res) => {
    try {
        const { email } = req.body;
        const { data: user } = await supabase.from('users').select('id').eq('email', email).single();
        if (!user) return res.status(400).json({ message: 'No account found with this email' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordExpires = new Date(Date.now() + 3600000).toISOString();
        
        await supabase.from('users').update({ 
            reset_password_token: resetToken, 
            reset_password_expires: resetPasswordExpires 
        }).eq('id', user.id);

        await sendEmail({
            to: email,
            subject: 'PVR Groups - Password Reset',
            html: `<h2>Password Reset</h2><p>Click <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}">here</a> to reset your password. This link expires in 1 hour.</p>`
        });

        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Reset Password
router.post('/reset-password', [
    body('token').notEmpty(),
    body('password').isLength({ min: 3 }),
], async (req, res) => {
    try {
        const { token, password } = req.body;
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('reset_password_token', token)
            .gte('reset_password_expires', new Date().toISOString())
            .single();
            
        if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

        const hashedPassword = await bcrypt.hash(password, 12);
        
        await supabase.from('users').update({ 
            password: hashedPassword, 
            reset_password_token: null, 
            reset_password_expires: null 
        }).eq('id', user.id);

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get current user
router.get('/me', require('../middleware/auth'), async (req, res) => {
    res.json({ user: req.user });
});

// Update profile
router.put('/profile', require('../middleware/auth'), async (req, res) => {
    try {
        const { name, phone, language } = req.body;
        const { data: user, error } = await supabase
            .from('users')
            .update({ name, phone, language })
            .eq('id', req.user.id)
            .select('id, name, email, phone, role, verified, language, reward_points, notifications_enabled, favorites')
            .single();
            
        if (error) throw error;
        user._id = user.id; // Map id to _id
        res.json({ user, message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
