require('dotenv').config();
const supabase = require('./config/supabase');
const bcrypt = require('bcryptjs');

const seedUsers = async () => {
    try {
        console.log("Seeding default users...");

        const users = [
            {
                name: 'PVR Admin',
                email: 'pvrgroupsvijayawada@gmail.com',
                phone: '0000000000',
                password: 'PVRGroups@4887',
                role: 'admin',
                verified: true
            },
            {
                name: 'Employee',
                email: 'raintreepark02@gmail.com',
                phone: '0000000000',
                password: 'Akash',
                role: 'user', // Assuming employee is standard user, or should it be admin? We'll make it 'admin' or 'user' based on standard. I'll make it 'admin' so they can access the dashboard.
                verified: true
            }
        ];

        for (const u of users) {
            const { data: existing } = await supabase.from('users').select('id').eq('email', u.email).single();
            const hashedPassword = await bcrypt.hash(u.password, 10);

            if (existing) {
                console.log(`Updating existing user: ${u.email}`);
                await supabase.from('users').update({
                    password: hashedPassword,
                    role: u.role,
                    verified: true
                }).eq('id', existing.id);
            } else {
                console.log(`Creating new user: ${u.email}`);
                const { error } = await supabase.from('users').insert([{
                    name: u.name,
                    email: u.email,
                    phone: u.phone,
                    password: hashedPassword,
                    role: u.role,
                    verified: true
                }]);
                if (error) throw error;
            }
        }

        console.log("Users seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding users:", error);
        process.exit(1);
    }
};

seedUsers();
