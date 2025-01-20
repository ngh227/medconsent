// src/components/LandingPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Medical Consent Management
        </h1>
        <div className="space-y-4">
          <p className="text-lg text-gray-600 mb-8">
            Please select your role to continue
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/auth/staff/login')}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Staff Login
            </button>
            <button
              onClick={() => navigate('/auth/patient/login')}
              className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Patient Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;