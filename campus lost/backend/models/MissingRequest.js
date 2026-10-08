const mongoose = require('mongoose');

const missingRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  imagePublicId: {
    type: String,
    default: ''
  },
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  brand: {
    type: String,
    default: '',
    trim: true
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  lastKnownLocation: {
    type: String,
    required: [true, 'Last known location is required'],
    trim: true
  },
  approximateLostDate: {
    type: Date,
    default: Date.now
  },
  additionalPrivateDetails: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'MATCHED', 'CLOSED'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MissingRequest', missingRequestSchema);
