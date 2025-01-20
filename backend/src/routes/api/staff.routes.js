// src/routes/api/staff.routes.js
const express = require('express');
const router = express.Router();
const { checkAuth, checkStaffAuth } = require('../../middleware/auth.middleware');
const { checkRole } = require('../../middleware/roles.middleware');
const EnvelopeService = require('../../services/docusign/envelope.service');
const TemplateService = require('../../services/docusign/template.service');
const User = require('../../models/user.model');
const Consent = require('../../models/consent.model');
// WORKED! NEED CHECK ROLE(STAFF) MIDDLEWARE
router.get('/staff/dashboard', checkStaffAuth, async (req, res) => {
    try {

        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalConsents = await Consent.countDocuments();
        const recentConsents = await Consent.find()
            .sort({ sentAt: -1 })
            .limit(5)
            .populate('patientId', 'name email')
            .populate('sentBy', 'name department');

        const consentsByStatus = await Consent.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.json({
            totalPatients,
            totalConsents,
            recentConsents,
            consentsByStatus
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// routes/api/staff.routes.js
router.get('/staff/session-check', (req, res) => {
    res.json({
        hasSession: !!req.session,
        sessionData: {
            hasAccessToken: !!req.session?.accessToken,
            hasAccountId: !!req.session?.accountId
        },
        cookies: req.headers.cookie // Check what cookies are being sent
    });
});


// get all patients (need to add checkRole('staff') middleware)
router.get('/staff/patients', checkStaffAuth, async (req, res) => {
    try {
        const { 
            search, 
            department, 
            page = 1, 
            limit = 10 
        } = req.query;

        let query = { role: 'patient' };

        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ];
        }

        const patients = await User.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .select('-consents')
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({
            patients,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// WORKED (need to add checkRole('staff') middleware)
router.get('/staff/patients/:patientId', checkStaffAuth, async (req, res) => {
    try {
        const patient = await User.findOne({
            _id: req.params.patientId,
            role: 'patient'
        }).populate({
            path: 'consents',
            populate: {
                path: 'sentBy',
                select: 'name department'
            }
        });

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.json(patient);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// WORKED 
router.get('/staff/patients/:patientId/consents', checkStaffAuth, async (req, res) => {
    try {
        const consents = await EnvelopeService.getConsentHistory(req.params.patientId);
        res.json(consents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// WORKED
router.get('/staff/templates', checkStaffAuth, async (req, res) => {
    try {
        const templates = await TemplateService.listTemplates(
            req.session.accountId,
            req.session.accessToken
        );
        res.json(templates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 
 */
router.post('/staff/consents/send', checkStaffAuth, async (req, res) => {
    try {
        const { recipientEmail, recipientName, templateId } = req.body;
        const { accountId, accessToken, userId } = req.session;

        // Validate inputs
        if (!recipientEmail || !recipientName || !templateId) {
            return res.status(400).json({
                error: 'Missing required information'
            });
        }

        // Find or create patient
        let patient = await User.findOne({ email: recipientEmail, role: 'patient' });
        if (!patient) {
            patient = await User.create({
                email: recipientEmail,
                name: recipientName,
                role: 'patient'
            });
        }

        // Create envelope
        const envelope = await EnvelopeService.createEnvelope(
            accountId,
            templateId,
            recipientEmail,
            recipientName,
            accessToken
        );

        // Save consent
        const savedConsent = await EnvelopeService.saveConsentDetails({
            envelopeId: envelope.envelopeId,
            templateId,
            sentBy: userId,
            department: 'General'
        }, patient);

        res.json({
            success: true,
            envelope,
            consent: savedConsent,
            patient
        });
    } catch (error) {
        console.error('Error sending consent:', error);
        res.status(500).json({
            error: 'Cannot send consent',
            details: error.message
        });
    }
});

router.get('/staff/consents/:consentId/status', checkStaffAuth, async (req, res) => {
    try {
        const consent = await Consent.findById(req.params.consentId)
            .populate('patientId', 'name email')
            .populate('sentBy', 'name department');

        if (!consent) {
            return res.status(404).json({ error: 'Consent not found' });
        }

        const envelopeStatus = await EnvelopeService.getEnvelopeStatus(
            req.session.accountId,
            consent.envelopeId,
            req.session.accessToken
        );

        res.json({
            consent,
            envelopeStatus
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;