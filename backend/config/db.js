const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ Error connection to MongoDB: ${error.message}`);
        throw error;
    }
};

module.exports = connectDB;
