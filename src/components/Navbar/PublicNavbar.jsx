// src/components/Navbar/PublicNavbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaConnectdevelop } from 'react-icons/fa';

export default function PublicNavbar() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center text-2xl font-bold text-indigo-600">
          <FaConnectdevelop className="mr-2" />
          <span>Connect & Collaborate</span>
        </Link>
        <div className="space-x-4">
          <Link to="/login" className="text-gray-600 font-semibold hover:text-indigo-600">Login</Link>
          <Link to="/signup" className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}