const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ADMIN_EMAIL = 'pvrgroupsvijayawada@gmail.com';
const ADMIN_PASSWORD = 'PVRGroups@4887';

const seedAdmin = async () => {
    try {
        // Remove any old admin accounts with different emails, but preserve the new employee one
        await User.deleteMany({
            role: 'admin',
            email: { $nin: [ADMIN_EMAIL, 'raintreepark02@gmail.com'] }
        });

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

        // Add specific employee
        const EMPLOYEE_EMAIL = 'raintreepark02@gmail.com';
        const EMPLOYEE_PASSWORD = 'Akash';
        const existingEmployee = await User.findOne({ email: EMPLOYEE_EMAIL });
        if (!existingEmployee) {
            await User.create({
                name: 'Employee',
                email: EMPLOYEE_EMAIL,
                phone: '0000000000',
                password: EMPLOYEE_PASSWORD,
                role: 'admin', // Full admin features for the employee
                verified: true,
            });
            console.log('✅ Employee account created:', EMPLOYEE_EMAIL);
        } else {
            existingEmployee.password = EMPLOYEE_PASSWORD;
            // ensure role is admin just in case
            existingEmployee.role = 'admin';
            await existingEmployee.save();
            console.log('✅ Employee credentials updated:', EMPLOYEE_EMAIL);
        }
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
    }
};

module.exports = seedAdmin;
