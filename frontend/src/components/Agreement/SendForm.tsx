// src/components/Agreement/SendForm.tsx
import React, { useState } from 'react';

const SendForm = () => {
  const [formData, setFormData] = useState({
    recipientEmail: '',
    recipientName: '',
    templateId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Sending data:', formData); // Debug log

      const response = await fetch('/api/agreements/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include' // Important for cookies/session
      });

      console.log('Response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send agreement');
      }

      const data = await response.json();
      console.log('Response data:', data); // Debug log
      setSuccess(`Agreement sent successfully! Envelope ID: ${data.envelopeId}`);
    } catch (err) {
      console.error('Error details:', err); // Debug log
      setError(err instanceof Error ? err.message : 'Failed to send agreement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Send Agreement</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Recipient Name</label>
          <input
            type="text"
            value={formData.recipientName}
            onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Recipient Email</label>
          <input
            type="email"
            value={formData.recipientEmail}
            onChange={(e) => setFormData({...formData, recipientEmail: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Template ID</label>
          <input
            type="text"
            value={formData.templateId}
            onChange={(e) => setFormData({...formData, templateId: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Sending...' : 'Send Agreement'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-600 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-2 bg-green-100 text-green-600 rounded">
          {success}
        </div>
      )}
    </div>
  );
};

export default SendForm;