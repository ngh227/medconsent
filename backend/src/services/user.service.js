const User = require('../models/user.model')

/**
 * Find a user by their ID.
 */
async function findUserById(userId) {
  return await User.findById(userId);
}

/**
 * Add a consent to a patient's record.
 */
async function addConsentToPatient(patientId, consentData) {
  return await User.findByIdAndUpdate(
    patientId,
    { $push: { consents: consentData } },
    { new: true }
  );
}

/**
 * Get all patients or filter by criteria.
 */
async function getAllPatients(criteria = {}) {
  return await User.find({ role: 'patient', ...criteria });
}

module.exports = {
  findUserById,
  addConsentToPatient,
  getAllPatients
};
