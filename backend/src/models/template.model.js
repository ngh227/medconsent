// models/template.model.js
const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  // DocuSign template ID
  docusignTemplateId: {
    type: String,
    required: true,
    unique: true
  },

  // Template details
  name: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  description: String,

  // Who created the template
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Template status
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },

  // Additional metadata
  metadata: {
    language: String,
    version: String,
    category: String
  }
});

module.exports = mongoose.model('Template', templateSchema);