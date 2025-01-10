import axios from "axios";
export const agreementApi = {
    sendAgreement: async (data: {
        recipientEmail: string;
        recipientName: string;
        templateId: string;
    }) => {
        const response = await axios.post('/api/agreements/send', data);
        return response.data;
    },

    getStatus: async (envelopeId: string) => {
        const response = await axios.get(`/api/agreements/${envelopeId}/status`);
        return response.data;
    },
    // Will be used for predictive analytics and NLP features
    uploadTemplate: async (formData: FormData) => {
        const response = await axios.post('/api/templates/upload', formData);
        return response.data;
    }
};