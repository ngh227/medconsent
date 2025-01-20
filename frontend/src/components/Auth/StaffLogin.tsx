// src/components/Auth/StaffLogin.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StaffLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Function to check existing session
    const checkSession = async () => {
      try {
        const response = await axios.get('/api/staff/session-check');
        if (response.data.hasSession && response.data.sessionData.hasAccessToken) {
          navigate('/staff/dashboard');
          return true;
        }
        return false;
      } catch (err) {
        console.error('Session check failed:', err);
        return false;
      }
    };

    // Function to initiate DocuSign OAuth login
    const initiateOAuthLogin = async () => {
      try {
        // This endpoint should handle the DocuSign OAuth redirect
        window.location.href = '/api/auth/staff/login';
      } catch (err) {
        console.error('OAuth initialization failed:', err);
        setError('Failed to start login process. Please try again.');
        setLoading(false);
      }
    };

    // Main login flow
    const startLoginProcess = async () => {
      try {
        // First check if we have an existing session
        const hasSession = await checkSession();
        if (!hasSession) {
          // Try JWT authentication first
          const jwtResponse = await axios.get('/api/auth/staff/jwt');
          if (jwtResponse.data.success) {
            navigate('/staff/dashboard');
          } else {
            // If JWT fails, start OAuth process
            await initiateOAuthLogin();
          }
        }
      } catch (err) {
        // If JWT fails, try OAuth
        await initiateOAuthLogin();
      } finally {
        setLoading(false);
      }
    };

    startLoginProcess();
  }, [navigate]);

  // Handle DocuSign OAuth callback
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        try {
          setLoading(true);
          // The backend will handle the code exchange
          const response = await axios.get(`/api/auth/callback?code=${code}`);
          if (response.data.success) {
            navigate('/staff/dashboard');
          }
        } catch (err) {
          setError('Authentication failed. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    handleCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to DocuSign...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            {error}
          </div>
          <button
            onClick={() => window.location.href = '/api/auth/staff/login'}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="mt-4 ml-2 text-blue-500 hover:text-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default StaffLogin;