
// services/docusign/envelope.service.js
const docusign = require('docusign-esign');

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
        // accessToken added as parameter ^^^^^^^^^^^^^^
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
}

module.exports = new EnvelopeService();