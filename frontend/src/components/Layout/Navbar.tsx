// src/components/Layout/Navbar.tsx
// Navigation
import React from "react";
import { Link } from 'react-router-dom'; // for client-side navigation

const Navbar = () => {
    return (
// Navigation bar with white background and shadow
    <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="text-xl font-bold">Medical Consent</div>
                <div className="space-x-4"></div>
                <Link to="/" className="hover:text-blue-600">Dashboad</Link>
                <Link to="/send" className="hovert:text-blue-600">New Agreement</Link>
                <Link to="/status" className="hovert:text-blue-600">Check Status</Link>
            </div>
        </div>
    </nav>
    )
}

export default Navbar;