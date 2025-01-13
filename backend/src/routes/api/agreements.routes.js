// src/routes/api/agreements.routes
const express = require('express');
const router = express.Router();
const { checkAuth } = require('../../middleware/auth.middleware');
const docusign = require('docusign-esign');

const User = require('../../models/user.model');
const Consent = require('../../models/consent.model');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const multer = require('multer');
const upload = multer( {dest: 'uploads/' });

const API_BASE_PATH = process.env.DOCUSIGN_BASE_PATH;

router.use((req, res, next) => {
    console.log('Session Debug [Time: ' + new Date().toISOString() + ']:', {
        hasSession: !!req.session,
        sessionID: req.sessionID,
        accessToken: !!req.session?.accessToken,
        accountId: req.session?.accountId || 'NOT SET',
        userId: req.session?.userId
    });
    next();
});

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
      console.log('Sending agreement - Session state:', {
        hasSession: !!req.session,
        accessToken: !!req.session?.accessToken,
        accountId: req.session?.accountId || 'NOT SET',
        userId: req.session?.userId,
        reqBody: { recipientEmail, recipientName, templateId }
    });
      if(!recipientEmail || !recipientName || !templateId) {
        return res.status(400).json({ 
          error: 'Missing required information' 
        });
      }
  
      // Find patient in database
      const patient = await User.findOne({ 
        email: recipientEmail,
        role: 'patient'
      });
  
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
  
      const apiClient = getDocuSignClient(
        req.session.accessToken, 
        API_BASE_PATH
      );
  
      const envelopesApi = new docusign.EnvelopesApi(apiClient);
  
      // Create envelope from template
      const envelopeDefinition = new docusign.EnvelopeDefinition();
      envelopeDefinition.templateId = templateId;
  
      const signer = docusign.TemplateRole.constructFromObject({
        email: recipientEmail,
        name: recipientName,
        roleName: 'Signer 1'
      });
  
      envelopeDefinition.templateRoles = [signer];
      envelopeDefinition.status = 'sent';

      console.log('Creating envelope with:', {
        accountId: req.session.accountId,
        templateId,
        recipientEmail
    });
  
      const results = await envelopesApi.createEnvelope(
        req.session.accountId,
        { envelopeDefinition }
      );
  
      // Save consent record
      await Consent.create({
        patientId: patient._id,
        envelopeId: results.envelopeId,
        templateId,
        sentBy: req.session.userId,
        department: req.user?.department || 'General'
      });
  
      res.json({
        envelopeId: results.envelopeId,
        status: results.status,
        statusDateTime: results.statusDateTime
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
      const status = await getEnvelopeStatus(
        req.session.accountId,
        req.params.envelopeId
      );
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
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