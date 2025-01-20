// src/services/staffApi.ts
import axios from 'axios';

// Types for API responses
interface DashboardData {
  totalPatients: number;
  totalConsents: number;
  recentConsents: Array<{
    patientId: {
      name: string;
      email: string;
    };
    status: string;
    department: string;
    sentAt: string;
    sentBy: {
      name: string;
      department: string;
    };
  }>;
  consentsByStatus: Array<{
    _id: string;
    count: number;
  }>;
}

const staffApi = {
  // Get dashboard data
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      const response = await axios.get('/api/staff/dashboard', {
        withCredentials: true // Important for sending cookies
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  // Get all patients
  getPatients: async (params?: { 
    search?: string; 
    department?: string; 
    page?: number; 
    limit?: number; 
  }) => {
    try {
      const response = await axios.get('/api/staff/patients', {
        params,
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  // Get specific patient's consents
  getPatientConsents: async (patientId: string) => {
    try {
      const response = await axios.get(`/api/staff/patients/${patientId}/consents`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching patient consents:', error);
      throw error;
    }
  },

  // Get templates
  getTemplates: async () => {
    try {
      const response = await axios.get('/api/staff/templates', {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  // Send consent
  sendConsent: async (data: {
    recipientEmail: string;
    recipientName: string;
    templateId: string;
  }) => {
    try {
      const response = await axios.post('/api/staff/consents/send', data, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error sending consent:', error);
      throw error;
    }
  }
};

export default staffApi;