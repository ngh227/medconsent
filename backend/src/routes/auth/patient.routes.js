// src/routes/auth/patient.route.js
const express = require('express');
const router = express.Router();
const User = require('../../models/user.model');

router.post('/auth/patient/login', async (req, res) => {
    try {
        const { patientId, email } = req.body;
        console.log('Login attempt:', { patientId, email });

        const patient = await User.findOne({
            patientId,
            email: { $regex: new RegExp(`^${email}$`, 'i') },
            role: 'patient'
        });

        if (!patient) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set session
        req.session.userId = patient._id;
        req.session.userRole = 'patient';

        res.json({ success: true });
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});

// Register new patient
router.post('/auth/patient/register', async (req, res) => {
    try {
        const { email, name, patientId, dateOfBirth } = req.body;

        const patient = await User.create({
            email,
            name,
            patientId,
            dateOfBirth,
            role: 'patient'
        });

        res.json({ success: true, patient });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

