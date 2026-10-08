require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const FoundItem = require('../models/FoundItem');
const MissingRequest = require('../models/MissingRequest');
const Match = require('../models/Match');
const ClaimRequest = require('../models/ClaimRequest');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lostlink';

async function clearDatabase() {
  try {
    console.log('Connecting to MongoDB for clearing database...');
    await mongoose.connect(MONGO_URI);

    await User.deleteMany({});
    await FoundItem.deleteMany({});
    await MissingRequest.deleteMany({});
    await Match.deleteMany({});
    await ClaimRequest.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});

    console.log('Successfully removed all database records and seed data.');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing database:', err);
    process.exit(1);
  }
}

clearDatabase();
