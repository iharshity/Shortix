const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.DB_URL, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });
        console.log('Connected to DB');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message);
        throw error;
    }
}

module.exports = connectDB;
