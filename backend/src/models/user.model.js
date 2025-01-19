// models/user.model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic info for all users
  email: { type: String, required: true }, // removed 'unique: true'
  name: { type: String, required: true },
  role: { type: String, enum: ['staff', 'patient'], required: true },

  // Staff-specific fields
  department: { type: String, required: function() { return this.role === 'staff'; }},

  // Patient-specific fields
  consents: [
    {
      envelopeId: { type: String }, // removed 'unique: true'
      templateId: { type: String },
      sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      department: { type: String },
      status: { type: String, enum: ['sent', 'completed', 'declined'], default: 'sent' },
      sentAt: { type: Date, default: Date.now },
      completedAt: { type: Date },
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);