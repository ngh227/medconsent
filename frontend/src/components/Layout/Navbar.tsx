// src/components/Layout/Navbar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const getLinkClass = (path: string) => {
    const baseClasses = "px-3 py-2 rounded-md text-sm font-medium";
    return location.pathname === path
      ? `${baseClasses} bg-gray-900 text-white`
      : `${baseClasses} text-gray-700 hover:bg-gray-700 hover:text-white`;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/staff/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-800">Medical Consent</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/staff/dashboard" className={getLinkClass('/staff/dashboard')}>
              Dashboard
            </Link>
            <Link to="/staff/send" className={getLinkClass('/staff/send')}>
              New Agreement
            </Link>
            <Link to="/staff/status" className={getLinkClass('/staff/status')}>
              Check Status
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;