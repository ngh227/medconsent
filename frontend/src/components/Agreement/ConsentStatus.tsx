// src/components/Agreement/ConsentStatus.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface ConsentDetails {
  _id: string;
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
  completedAt?: string;
}

const ConsentStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [consent, setConsent] = useState<ConsentDetails | null>(null);

  useEffect(() => {
    const fetchConsentDetails = async () => {
      try {
        const response = await axios.get(`/api/staff/consents/${id}/status`);
        setConsent(response.data.consent);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch consent details');
      } finally {
        setLoading(false);
      }
    };

    fetchConsentDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!consent) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'signed':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-yellow-100 text-yellow-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Consent Details</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800"
          >
            Back
          </button>
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Patient Information</h3>
          <div className="mt-2 space-y-2">
            <p className="text-sm text-gray-600">Name: {consent.patientId.name}</p>
            <p className="text-sm text-gray-600">Email: {consent.patientId.email}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900">Status Information</h3>
          <div className="mt-2 space-y-2">
            <p className="text-sm">
              Status: {' '}
              <span className={`px-2 py-1 text-sm rounded-full ${getStatusColor(consent.status)}`}>
                {consent.status}
              </span>
            </p>
            <p className="text-sm text-gray-600">Department: {consent.department}</p>
            <p className="text-sm text-gray-600">
              Sent Date: {new Date(consent.sentAt).toLocaleString()}
            </p>
            {consent.completedAt && (
              <p className="text-sm text-gray-600">
                Completed Date: {new Date(consent.completedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900">Sent By</h3>
          <div className="mt-2 space-y-2">
            <p className="text-sm text-gray-600">Name: {consent.sentBy.name}</p>
            <p className="text-sm text-gray-600">Department: {consent.sentBy.department}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentStatus;