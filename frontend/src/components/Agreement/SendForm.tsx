// src/components/Agreement/SendForm.tsx
import React, { useState } from 'react';
import axios from 'axios';

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
      const response = await axios.post('/api/agreements/send', formData);
      setSuccess('Agreement sent successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send agreement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Send New Agreement</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Name
          </label>
          <input
            type="text"
            value={formData.recipientName}
            onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Email
          </label>
          <input
            type="email"
            value={formData.recipientEmail}
            onChange={(e) => setFormData({...formData, recipientEmail: e.target.value})}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template ID
          </label>
          <input
            type="text"
            value={formData.templateId}
            onChange={(e) => setFormData({...formData, templateId: e.target.value})}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-500 p-3 rounded">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Sending...' : 'Send Agreement'}
        </button>
      </form>
    </div>
  );
};

export default SendForm;