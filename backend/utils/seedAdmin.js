const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ADMIN_EMAIL = 'pvrgroupsvijayawada@gmail.com';
const ADMIN_PASSWORD = 'PVRGroups@4887';

const seedAdmin = async () => {
    try {
        // Remove any old admin accounts with different emails
        await User.deleteMany({ role: 'admin', email: { $ne: ADMIN_EMAIL } });

        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
        if (!existingAdmin) {
            await User.create({
                name: 'PVR Groups Admin',
                email: ADMIN_EMAIL,
                phone: '9876543210',
                password: ADMIN_PASSWORD,
                role: 'admin',
                verified: true,
            });
            console.log('✅ Admin account created:', ADMIN_EMAIL);
        } else {
            // Update password in case it changed
            existingAdmin.password = ADMIN_PASSWORD;
            await existingAdmin.save();
            console.log('✅ Admin credentials updated:', ADMIN_EMAIL);
        }
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
    }
};

module.exports = seedAdmin;
