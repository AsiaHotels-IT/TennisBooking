const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://192.168.199.169:27017');
        console.log('DB connected');
    } catch (err) {
        console.log('MongoDB connection error:', err.message);
    }
};

module.exports = connectDB;
