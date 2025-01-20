
// services/docusign/envelope.service.js
const docusign = require('docusign-esign');
const User = require('../../models/user.model');
const Consent = require('../../models/consent.model');
const Template = require('../../models/template.model');

class EnvelopeService {
    constructor() {
        this.apiClient = new docusign.ApiClient();
    }

    initializeClient(accessToken) {
        this.apiClient.setBasePath(process.env.DOCUSIGN_BASE_PATH);
        this.apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);
        return new docusign.EnvelopesApi(this.apiClient);
    }

    async createEnvelope(accountId, templateId, recipientEmail, recipientName, accessToken) {
        const envelopeDefinition = new docusign.EnvelopeDefinition();
        envelopeDefinition.templateId = templateId;

        const signer = docusign.TemplateRole.constructFromObject({
            email: recipientEmail,
            name: recipientName,
            roleName: 'signer'
        });

        envelopeDefinition.templateRoles = [signer];
        envelopeDefinition.status = 'sent';

        const envelopesApi = this.initializeClient(accessToken);
        const results = await envelopesApi.createEnvelope(accountId, {
            envelopeDefinition
        });

        return results;
    }

    async getEnvelopeStatus(accountId, envelopeId, accessToken) {
        const envelopesApi = this.initializeClient(accessToken);
        return await envelopesApi.getEnvelope(accountId, envelopeId);
    }

    async saveConsentDetails(envelopeData, patientData) {
        try {
            console.log('Saving consent with data:', {
                envelopeId: envelopeData.envelopeId,
                patientId: patientData._id,
                templateId: envelopeData.templateId
            });

            const consent = new Consent({
                patientId: patientData._id,  // Make sure this matches
                envelopeId: envelopeData.envelopeId,
                templateId: envelopeData.templateId,
                status: 'sent',
                sentBy: envelopeData.sentBy,
                department: envelopeData.department,
                sentAt: new Date()
            });
            const savedConsent = await consent.save();
            console.log('Saved consent:', savedConsent);

            // await User.findByIdAndUpdate(
            return savedConsent;
        } catch (error) {
            console.error('Error while saving consent details:', error);
            throw error;
        }
    }

    async getConsentHistory(patientId) {
        try {
            console.log('Fetching consents for patientId:', patientId);
            
            // Get patient with populated consents
            const patient = await User.findById(patientId)
                .populate({
                    path: 'consents'
                });
    
            if (!patient) {
                console.log('Patient not found');
                return [];
            }
    
            console.log('Found consents for patient:', patient.consents.length);
            
            return patient.consents;
        } catch (error) {
            console.error('Error details:', {
                error: error.message,
                patientId: patientId,
                type: error.name
            });
            throw error;
        }
    }
}

module.exports = new EnvelopeService();