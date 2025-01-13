// services/docusign/template.service.js
const docusign = require('docusign-esign');

class TemplateService {
    constructor() {
        this.apiClient = new docusign.ApiClient();
    }

    initializeClient(accessToken) {
        this.apiClient.setBasePath(process.env.DOCUSIGN_BASE_PATH);
        this.apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);
        return new docusign.TemplatesApi(this.apiClient);
    }

    async listTemplates(accountId, accessToken) {
        const templatesApi = this.initializeClient(accessToken);
        const options = {
            searchText: 'Consent',
            orderBy: 'name DESC'
        };
        return await templatesApi.listTemplates(accountId, options);
    }

    async createTemplate(accountId, accessToken, templateData) {
        const templatesApi = this.initializeClient(accessToken);
        // Template creation logic
        return await templatesApi.createTemplate(accountId, {
            // Template configuration
        });
    }
}

module.exports = new TemplateService();