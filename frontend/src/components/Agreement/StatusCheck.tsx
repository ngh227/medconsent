// src/components/Agreement/StatusCheck.tsx
import React, { useState } from 'react';
import axios from 'axios';

const StatusCheck = () => {
  const [envelopeId, setEnvelopeId] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStatus(null);

    try {
      const response = await axios.get(`/api/agreements/${envelopeId}/status`);
      setStatus(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to get status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Check Agreement Status</h2>

      <form onSubmit={handleCheck} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Envelope ID
          </label>
          <input
            type="text"
            value={envelopeId}
            onChange={(e) => setEnvelopeId(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter envelope ID"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Checking...' : 'Check Status'}
        </button>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded">
            {error}
          </div>
        )}

        {status && (
          <div className="mt-4 border rounded p-4">
            <h3 className="font-semibold mb-2">Status Details</h3>
            <div className="space-y-2">
              <p>Status: {status.status}</p>
              {status.created && (
                <p>Created: {new Date(status.created).toLocaleString()}</p>
              )}
              {status.lastModified && (
                <p>Last Modified: {new Date(status.lastModified).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default StatusCheck;