// models/consent.model.js
const mongoose = require('mongoose');

const consentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  envelopeId: {
    type: String,
    required: true
    // removed 'unique: true'
  },
  templateId: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ['sent', 'signed', 'declined', 'expired'],
    default: 'sent'
  },

  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: true
  },

  sentAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Consent', consentSchema);