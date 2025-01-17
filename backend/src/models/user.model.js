// models/user.model.js
/**
 * User authentication and access.
 * Differentiating roles (staff vs. patient).
 * Storing additional details for staff (e.g., department) and patients (e.g., consents)
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic info for all users
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['staff', 'patient'], required: true },

  // Staff-specific fields
  department: { type: String, required: function() { return this.role === 'staff'; }},

  // Patient-specific fields
  consents: [
    {
      envelopeId: { type: String, unique: true }, // DocuSign envelope ID
      templateId: { type: String },              // Template ID for the consent
      sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Staff who sent it
      department: { type: String },              // Department associated with the consent
      status: { type: String, enum: ['sent', 'completed', 'declined'], default: 'sent' },
      sentAt: { type: Date, default: Date.now },
      completedAt: { type: Date },
    }
  ],
  // Common field
  createdAt: { type: Date, default: Date.now }
  
});

module.exports = mongoose.model('User', userSchema);