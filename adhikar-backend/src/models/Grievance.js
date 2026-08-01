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
  portalName: {
    type: String,
    default: 'CPGRAMS National Portal',
  },
  redirectUrl: {
    type: String,
    default: 'https://pgportal.gov.in',
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
    enum: ['Pending', 'Appeal Filed', 'Resolved', 'Overdue'],
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
    default: '',
  },
  appeal2Draft: {
    type: String,
    default: '',
  },
  appeal_level: {
    type: Number,
    default: 0,
  },
  appeal1_date: {
    type: Date,
  },
  appeal2_date: {
    type: Date,
  },
  appeal1_letter: {
    type: String,
    default: '',
  },
  appeal2_letter: {
    type: String,
    default: '',
  },
  escalation_status: {
    type: String,
    default: 'None',
  },
  deadlineDays: {
    type: Number,
    default: 30,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Grievance', GrievanceSchema);
