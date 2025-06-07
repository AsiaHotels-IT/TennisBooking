const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://itcoasia:L5RGqfSqj0qm0SNr@cluster0.ult7lnu.mongodb.net/TennisBooking?retryWrites=true&w=majority');
        console.log('DB connected');
    } catch (err) {
        console.log('MongoDB connection error:', err.message);
    }
};

module.exports = connectDB;
