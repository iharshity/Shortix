const mongoose = require('mongoose');

async function connectDB() {
    await mongoose.connect(process.env.DB_URL, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected to DB');
}

module.exports = connectDB;