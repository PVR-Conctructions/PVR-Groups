const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

module.exports = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, phone, role, verified, language, reward_points, notifications_enabled, favorites')
            .eq('id', decoded.id)
            .single();

        if (error || !user) return res.status(401).json({ message: 'Invalid token. User not found.' });

        req.user = user;
        req.user._id = user.id; // Map id to _id for backward compatibility
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};
