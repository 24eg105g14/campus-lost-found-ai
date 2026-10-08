const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'College email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  batchYear: {
    type: String,
    required: true
  },
  departmentCode: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true,
    lowercase: true
  },
  rollNumber: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['STUDENT', 'ADMIN'],
    default: 'STUDENT'
  }
}, {
  timestamps: true
});

// Remove sensitive fields when converting to JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
