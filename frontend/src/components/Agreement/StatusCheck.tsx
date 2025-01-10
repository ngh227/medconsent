// src/components/Agreement/StatusCheck.tsx
import React, { useState } from 'react';

const StatusCheck = () => {
  const [envelopeId, setEnvelopeId] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/agreements/${envelopeId}/status`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to get status');
      
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Check Agreement Status</h2>

      <form onSubmit={checkStatus} className="space-y-4">
        <div>
          <label className="block mb-1">Envelope ID</label>
          <input
            type="text"
            value={envelopeId}
            onChange={(e) => setEnvelopeId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Checking...' : 'Check Status'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-600 rounded">
          {error}
        </div>
      )}

      {status && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Agreement Status</h3>
          <div>Status: {status.status}</div>
          <div>Last Modified: {new Date(status.lastModified).toLocaleString()}</div>
          {status.completedDateTime && (
            <div>Completed: {new Date(status.completedDateTime).toLocaleString()}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusCheck;