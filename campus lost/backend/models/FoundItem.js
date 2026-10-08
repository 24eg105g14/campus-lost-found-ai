const mongoose = require('mongoose');

const verificationQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true }
}, { _id: true });

const foundItemSchema = new mongoose.Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
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
  locationFound: {
    type: String,
    required: [true, 'Location found is required'],
    trim: true
  },
  dateFound: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['PENDING', 'DELIVERED'],
    default: 'PENDING'
  },
  verificationQuestions: {
    type: [verificationQuestionSchema],
    validate: [val => val.length > 0, 'At least one verification question is required']
  },
  deliveredAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Sanitized public view that NEVER exposes verification answers or secret questions publicly
foundItemSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  // Strip secret answers from verification questions
  if (obj.verificationQuestions) {
    obj.verificationQuestions = obj.verificationQuestions.map(vq => ({
      _id: vq._id,
      question: vq.question
    }));
  }
  return obj;
};

module.exports = mongoose.model('FoundItem', foundItemSchema);
