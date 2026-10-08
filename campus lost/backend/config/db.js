const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lostlink';
    console.log(`Connecting to MongoDB at: ${connStr}...`);
    const conn = await mongoose.connect(connStr);
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    // If local MongoDB is not running, log guidance
    console.warn('Please ensure MongoDB service is running locally or set a valid MONGO_URI in .env');
  }
};

module.exports = connectDB;
