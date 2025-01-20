// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import StaffDashboard from './components/Staff/StaffDashboard';
import SendForm from './components/Agreement/SendForm';
import StatusCheck from './components/Agreement/StatusCheck';
import ConsentStatus from './components/Agreement/ConsentStatus';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Redirect from root to dashboard */}
            <Route path="/" element={<Navigate to="/staff/dashboard" replace />} />
            
            {/* Staff routes */}
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/send" element={<SendForm />} />
            <Route path="/staff/status" element={<StatusCheck />} />
            <Route path="/staff/consents/:id/status" element={<ConsentStatus />} />
            
            {/* Catch all route - 404 */}
            <Route path="*" element={
              <div className="text-center mt-10">
                <h2 className="text-2xl font-bold">Page Not Found</h2>
                <p className="mt-2">The page you're looking for doesn't exist.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;