// models/user.model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic info for all users
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['staff', 'patient'],  // User can only be either staff or patient
    required: true 
  },

  // Staff-specific fields
  staffId: {
    type: String,
    sparse: true  // Optional, only for staff
  },
  department: {
    type: String,
    required: function() { 
      return this.role === 'staff';  // Only required if user is staff
    }
  },

  // Patient-specific fields
  patientId: {
    type: String,
    sparse: true  // Optional, only for patients
  },
  dateOfBirth: {
    type: Date,
    required: function() { 
      return this.role === 'patient';  // Only required if user is patient
    }
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', userSchema);