const express = require('express');
const docusign = require('docusign-esign');
const router = express.Router();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const multer = require('multer');
const upload = multer( {dest: 'uploads/' });

const OAUTH_BASE_PATH = process.env.AUTH_SERVER;
const API_BASE_PATH = process.env.DOCUSIGN_BASE_PATH;

// Middleware to check if user has log in yet
const checkAuth = (req, res, next) => {
    if (!req.session.accessToken) {
        return res.status(401).json({ error: 'Have not logged in'});
    }
    next(); // next() if token found (aka logged in alreaady)
};

// Create DocuSign API client
const getDocuSignClient = (accessToken, basePath) => {
    const apiClient = new docusign.ApiClient();
    apiClient.setBasePath(basePath); 
    apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);
    return apiClient;
};

// API endpoint to send new agreement
router.post('/agreements/send', checkAuth, async (req, res) => {
    try {
        const { recipientEmail, recipientName, templateId } = req.body;

        if(!recipientEmail || !recipientName || !templateId) {
            return res.status(400).json( {
                error: 'Missing required information'
            });
        }

        console.log('Session data:', {
            accessToken: !!req.session.accessToken,
            accountId: req.session.accountId
        });
        console.log('Session data:', req.session);

        const apiClient = getDocuSignClient(
            req.session.accessToken, 
            API_BASE_PATH
        );
        // create API to work with envelops (aka agreeement)
        const envelopesApi = new docusign.EnvelopesApi(apiClient);

        // create envelope from template
        const envelopeDefinition = new docusign.EnvelopeDefinition();
        console.log('Using template ID:', templateId);
        envelopeDefinition.templateId = templateId;

        // set up reciever / signer
        const signer = docusign.TemplateRole.constructFromObject({
            email: recipientEmail,
            name: recipientName,
            roleName: 'Signer 1'
        });

        envelopeDefinition.templateRoles = [signer];
        envelopeDefinition.status = 'sent';

        console.log('Creating envelope with account ID:', req.session.accountId);

        // send envelope
        const results = await envelopesApi.createEnvelope(
            req.session.accountId,
            { envelopeDefinition }
        );

        if (!req.session.envelopes){
            req.session.envelopes = [];
        }
        req.session.envelopes.push({
            envelopeId: results.envelopeId,
            status: results.status,
            createdAt: results.statusDateTime
        })

        res.json({
            envelopeId: results.envelopeId,
            status: results.status,
            statusDateTime: results.statusDateTime
        });
    } catch (err){
        console.error('Error while sending aggreement: ', err);
        res.status(500).json({
            error: 'Can not send aggreement',
            details: err.message
        })
    }
});

// API endpoint to get an envelope's ID
router.get('/agreements/:envelopeId/status', checkAuth, async (req, res) => {
    try {
        const { envelopeId } = req.params; // get ID from URL

        const apiClient = getDocuSignClient (
            req.session.accessToken,
            API_BASE_PATH
        );

        const envelopesApi = new docusign.EnvelopesApi(apiClient);
        // get information from envelope
        const results = await envelopesApi.getEnvelope(
            req.session.accountId,
            envelopeId
        );

        res.json({
            status: results.status,
            statusDateTime: results.statusDateTime,
            lastModified: results.lastModifiedDateTime,
            expirationDate: results.expirationDate,
            deliveredDateTime: results.deliveredDateTime,
            completedDateTime: results.completedDateTime
        });
    } catch (error){
        console.error('Error getting envelope status', error);
        res.status(500).json({
            error: 'Cannot get envelope status',
            details: error.message
        });
    }
});

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
        doc.fileExtention = file.originalname.split('.').pop();
        doc.documentId = '1';
    } catch (error) {

    }
})

module.exports = router;