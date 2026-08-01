const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Please add a valid 10-digit mobile number'],
  },
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name'],
    trim: true,
  },
  gender: {
    type: String,
    required: [true, 'Please add gender details'],
    enum: ['Male', 'Female', 'Other'],
  },
  dob: {
    type: Date,
    required: [true, 'Please add date of birth'],
  },
  state: {
    type: String,
    required: [true, 'Please add state location'],
  },
  district: {
    type: String,
    required: [true, 'Please add district location'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', UserSchema);
