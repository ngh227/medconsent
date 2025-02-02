// src/routes/api/agreements.routes
const express = require('express');
const router = express.Router();
const { checkAuth } = require('../../middleware/auth.middleware');
const docusign = require('docusign-esign');

const User = require('../../models/user.model');
const EnvelopeService = require('../../services/docusign/envelope.service');
const {  addConsentToPatient, getPatientConsents, updateConsentStatus } = require('../../services/user.service');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const multer = require('multer');
const upload = multer( {dest: 'uploads/' });

const API_BASE_PATH = process.env.DOCUSIGN_BASE_PATH;

// Create DocuSign API client
const getDocuSignClient = (accessToken, basePath) => {
    const apiClient = new docusign.ApiClient();
    apiClient.setBasePath(basePath); 
    apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);
    return apiClient;
};

router.post('/agreements/send', checkAuth, async (req, res) => {
    try {
        const { recipientEmail, recipientName, templateId } = req.body;
        const accountId = req.session.accountId;
        const accessToken = req.session.accessToken;

        if(!recipientEmail || !recipientName || !templateId) {
            return res.status(400).json({
                error: 'Missing required information'
            });
        }

        if (!accountId || !accessToken) {
            return res.status(401).json({
                error: 'Unauthorized: Missing accountId or accessToken'
            });
        }

        // create envelope
        const envelope = await EnvelopeService.createEnvelope(
            accountId,
            templateId,
            recipientEmail,
            recipientName,
            accessToken
        );

        // ADDED: Check if patient exist, if not create one:
        let patient = await User.findOne({ email: recipientEmail, role: 'patient' });
        if (!patient) {
            console.log(`Patient not found, creating new patient with email: ${recipientEmail}`);
            patient = new User({
                email: recipientEmail,
                name: recipientName,
                role: 'patient',
                consents: []
            });
            await patient.save();
        }

        const updatedPatient = await addConsentToPatient(patient._id, {
            envelopeId: envelope.envelopeId,
            templateId,
            sentBy: req.session.userId,
            status: 'sent',
            department: req.user?.department || 'General',
            sentAt: new Date()
        });
    
        res.json({
            success: true,
            envelopeId: envelope.envelopeId,
            patient: updatedPatient
        });
    } catch (err) {
        console.error('Error while sending agreement:', err);
        res.status(500).json({
            error: 'Cannot send agreement',
            details: err.message
        });
    }
});

// API endpoint to get agreement status
router.get('/agreements/:envelopeId/status', checkAuth, async (req, res) => {
    try {
      const status = await EnvelopeService.getEnvelopeStatus(
        req.session.accountId,
        req.params.envelopeId,
        req.session.accessToken
      );
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST agreement status
  router.post('/agreements/:envelopeId/status', async (req, res) => {
    try {
      const { envelopeId } = req.params;
      const { status, patientId } = req.body;
  
      const completedAt = status === 'signed' ? new Date() : null;
  
      const updatedPatient = await updateConsentStatus(patientId, envelopeId, status, completedAt);
  
      if (!updatedPatient) {
        return res.status(404).json({ error: 'Consent not found' });
      }
  
      res.json({ success: true, updatedPatient });
    } catch (error) {
      console.error('Error updating consent status:', error.message);
      res.status(500).json({ error: 'Failed to update consent status' });
    }
  });
// Fetch all consents for a patient

router.get('/patients/:patientId/consents', async (req, res) => {
  try {
    const { patientId } = req.params;

    const consents = await getPatientConsents(patientId);

    res.json(consents);
  } catch (error) {
    console.error('Error fetching consents:', error.message);
    res.status(500).json({ error: 'Failed to fetch consents' });
  }
});

 //////////////////
// upload feature
router.post('/templates/upload', checkAuth, upload.single('file'), async(req, res) => {
    try {
        const { name, description } = req.body;
        const file = req.file;

        const apiClient = getDocuSignClient(
            req.session.accessToken,
            API_BASE_PATH
        );

        // read file
        const fileBuffer = await fs.readFile(file.path);
        const base64File = fileBuffer.toString('base64');

        // create template definition
        const templateDefinition = new docusign.EnvelopeTemplate();
        templateDefinition.name = name;
        templateDefinition.description = description;

        // add document to template
        const doc = new docusign.Document();
        doc.documentBase64 = base64File;
        doc.name = file.originalname;
        doc.fileExtension = file.originalname.split('.').pop();
        doc.documentId = '1';

        // Complete these parts:
        templateDefinition.documents = [doc];
        
        // Create template in DocuSign
        const templatesApi = new docusign.TemplatesApi(apiClient);
        const results = await templatesApi.createTemplate(req.session.accountId, {
            envelopeTemplate: templateDefinition
        });

        res.json({
            templateId: results.templateId,
            name: results.name,
            status: 'created'
        });
    } catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({
            error: 'Cannot create template',
            details: error.message
        });
    }
});

module.exports = router;