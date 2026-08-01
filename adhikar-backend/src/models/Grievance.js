const mongoose = require('mongoose');

const GrievanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  complaintText: {
    type: String,
    required: [true, 'Complaint text is required'],
  },
  proofUrl: {
    type: String,
    default: '',
  },
  referenceNumber: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['certificate', 'grievance', 'corruption', 'delay'],
    required: true,
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  confidence: {
    type: Number,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Appeal Filed', 'Resolved'],
    default: 'Pending',
  },
  formalLetter: {
    type: String,
    required: true,
  },
  rtiDraft: {
    type: String,
    required: true,
  },
  appealDraft: {
    type: String,
    required: true,
  },
  appeal2Draft: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Grievance', GrievanceSchema);
