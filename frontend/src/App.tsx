// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import StaffDashboard from './components/Staff/StaffDashboard';
import SendForm from './components/Agreement/SendForm';
import StatusCheck from './components/Agreement/StatusCheck';
import ConsentStatus from './components/Agreement/ConsentStatus';

// Optional: 404 component
const NotFound = () => (
  <div className="text-center mt-20">
    <h2 className="text-2xl font-bold text-gray-800">Page Not Found</h2>
    <p className="text-gray-600 mt-2">The page you're looking for doesn't exist.</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/send" element={<SendForm />} />
            <Route path="/staff/status" element={<StatusCheck />} />
            <Route path="/staff/consents/:id/status" element={<ConsentStatus />} />
            <Route path="/" element={<Navigate to="/staff/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;