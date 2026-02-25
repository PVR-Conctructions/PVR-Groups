const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
    try {
        // In development, log emails instead of sending
        if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
            console.log('📧 [DEV] Email would be sent:');
            console.log(`   To: ${to}`);
            console.log(`   Subject: ${subject}`);
            console.log(`   Body: ${html.substring(0, 100)}...`);
            return { success: true, dev: true };
        }

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"PVR Groups" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        return { success: true };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error };
    }
};

module.exports = sendEmail;
