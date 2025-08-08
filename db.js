// db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected Successfully!');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err.message);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
