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
    enum: ['Male', 'Female', 'Other'],
    default: 'Other',
  },
  dob: {
    type: Date,
    default: null,
  },
  state: {
    type: String,
    required: [true, 'Please add state location'],
  },
  district: {
    type: String,
    required: [true, 'Please add district location'],
  },
  blockOrMunicipality: {
    type: String,
    required: [true, 'Please add block or municipality location'],
  },
  idType: {
    type: String,
    enum: ['Aadhaar', 'PAN', 'VoterID'],
    default: 'Aadhaar'
  },
  country: {
    type: String,
    default: 'India',
  },
  profileImage: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: ''
  },
  aadhaarHash: {
    type: String,
    select: false
  },
  aadhaarVerified: {
    type: Boolean,
    default: false
  },
  isProfileComplete: {
    type: Boolean,
    default: true
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
