const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  foundItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoundItem',
    required: true
  },
  claimRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClaimRequest',
    required: true
  },
  finderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  claimantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Conversation', conversationSchema);
