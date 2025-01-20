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
        try {
            console.log('Listing templates for account:', accountId);
            
            const templatesApi = this.initializeClient(accessToken);
            
            // Simplified options first to test basic functionality
            const options = {
                searchText: null,  // Remove search filter initially
                orderBy: null     // Remove ordering initially
            };

            const response = await templatesApi.listTemplates(accountId, options);
            console.log('Templates response:', response);
            return response;
        } catch (error) {
            console.error('Template listing error details:', {
                message: error.message,
                response: error.response?.body,
                status: error.response?.status
            });
            throw error;
        }
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