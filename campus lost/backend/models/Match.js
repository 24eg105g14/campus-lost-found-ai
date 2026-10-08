const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  foundItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoundItem',
    required: true
  },
  missingRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MissingRequest',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  confidence: {
    type: String,
    enum: ['HIGH', 'POSSIBLE', 'LOW'],
    required: true
  },
  reasons: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Match', matchSchema);
