// models/consent.model.js
const mongoose = require('mongoose');

const consentSchema = new mongoose.Schema({
  // Links to the patient
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // References User model
    required: true
  },

  // DocuSign specific fields
  envelopeId: {
    type: String,
    required: true,
    unique: true  // Each DocuSign envelope should be unique
  },
  templateId: {
    type: String,
    required: true
  },

  // Consent status
  status: {
    type: String,
    enum: ['sent', 'signed', 'declined', 'expired'],
    default: 'sent'
  },

  // Staff who sent the consent
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // References User model (staff)
    required: true
  },
  department: {
    type: String,
    required: true
  },

  // Timestamps
  sentAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Consent', consentSchema);