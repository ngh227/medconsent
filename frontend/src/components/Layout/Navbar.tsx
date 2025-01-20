// src/components/Layout/Navbar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const getLinkClass = (path: string) => {
    return location.pathname === path
      ? 'text-blue-600'
      : 'text-gray-700 hover:text-blue-600';
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/staff/dashboard" className="text-xl font-bold text-gray-800">
            Medical Consent
          </Link>
          <div className="flex items-center space-x-8">
            <Link
              to="/staff/dashboard"
              className={getLinkClass('/staff/dashboard')}
            >
              Dashboard
            </Link>
            <Link
              to="/staff/send"
              className={getLinkClass('/staff/send')}
            >
              New Agreement
            </Link>
            <Link
              to="/staff/status"
              className={getLinkClass('/staff/status')}
            >
              Check Status
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;