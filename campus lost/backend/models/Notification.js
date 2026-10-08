const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'POSSIBLE_MATCH',
      'CLAIM_REQUEST',
      'VERIFICATION_SUCCESS',
      'VERIFICATION_FAILED',
      'CLAIM_APPROVED',
      'CLAIM_REJECTED',
      'NEW_MESSAGE',
      'ITEM_DELIVERED'
    ],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedItemId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
