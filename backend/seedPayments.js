require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const User = require('./models/User');
const Project = require('./models/Project');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ role: 'admin' });
    const projects = await Project.find().limit(4);

    if (!admin || projects.length === 0) {
        console.log('No admin or projects found. Skipping.');
        process.exit(0);
    }

    const payments = [
        { userId: admin._id, projectId: projects[0]._id, amount: 500000, method: 'Bank Transfer', status: 'paid', description: 'Booking advance payment' },
        { userId: admin._id, projectId: projects[1]._id, amount: 250000, method: 'UPI', status: 'paid', description: 'Token amount' },
        { userId: admin._id, projectId: projects[2]._id, amount: 100000, method: 'Cheque', status: 'pending', description: 'First installment' },
        { userId: admin._id, projectId: projects[0]._id, amount: 750000, method: 'Bank Transfer', status: 'paid', description: 'Second installment' },
        { userId: admin._id, projectId: projects[3]?._id || projects[0]._id, amount: 300000, method: 'Credit Card', status: 'pending', description: 'Maintenance deposit' },
    ];

    for (const p of payments) {
        const payment = await Payment.create(p);
        console.log('Created payment:', payment.invoiceNumber, '-', p.description);
    }

    console.log('Done! Total demo payments:', payments.length);
    await mongoose.disconnect();
    process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
