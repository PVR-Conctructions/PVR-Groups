const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
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

        const { name, email, phone, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already registered' });

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const user = await User.create({ name, email, phone, password, verificationToken });

        // Process referral if code provided
        const { referralCode } = req.body;
        if (referralCode) {
            try {
                const Referral = require('../models/Referral');
                const referrer = await User.findOne({ referralCode });
                if (referrer) {
                    await Referral.create({ referrerId: referrer._id, referredUserId: user._id, status: 'completed', rewardPoints: 100 });
                    referrer.rewardPoints = (referrer.rewardPoints || 0) + 100;
                    await referrer.save();
                    user.referredBy = referrer._id;
                    await user.save();
                }
            } catch (refErr) { console.error('Referral processing error:', refErr.message); }
        }

        // Send verification email (stubbed in dev)
        await sendEmail({
            to: email,
            subject: 'Welcome to PVR Groups - Verify Your Email',
            html: `<h1>Welcome to PVR Groups, ${name}!</h1><p>Click <a href="${process.env.FRONTEND_URL}/verify/${verificationToken}">here</a> to verify your email.</p>`
        });

        // Notify admin
        await sendEmail({
            to: 'raintreepark02@gmail.com',
            subject: 'New User Registration - PVR Groups',
            html: `<h2>New User Registered</h2><p>Name: ${name}</p><p>Email: ${email}</p><p>Phone: ${phone}</p>`
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
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
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        res.json({
            message: 'Login successful',
            token,
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Verify Email
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findOne({ verificationToken: token });
        if (!user) return res.status(400).json({ message: 'Invalid verification token' });

        user.verified = true;
        user.verificationToken = undefined;
        await user.save();

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
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'No account found with this email' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

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
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

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
        const user = await require('../models/User').findByIdAndUpdate(
            req.user._id,
            { name, phone, language },
            { new: true }
        ).select('-password');
        res.json({ user, message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
