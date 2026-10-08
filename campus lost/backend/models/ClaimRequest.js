const mongoose = require('mongoose');

const claimRequestSchema = new mongoose.Schema({
  foundItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoundItem',
    required: true
  },
  claimantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verificationScore: {
    type: Number,
    default: 0
  },
  confidence: {
    type: String,
    enum: ['HIGH', 'POSSIBLE', 'LOW'],
    default: 'LOW'
  },
  attempts: {
    type: Number,
    default: 1,
    max: 3
  },
  status: {
    type: String,
    enum: ['PENDING_VERIFICATION', 'MANUAL_REVIEW', 'VERIFIED', 'REJECTED'],
    default: 'PENDING_VERIFICATION'
  },
  submittedAnswers: [{
    questionId: String,
    question: String,
    answer: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('ClaimRequest', claimRequestSchema);
