// src/components/Footer/PublicFooter.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaConnectdevelop } from 'react-icons/fa';

export default function PublicFooter() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-lg font-bold flex items-center mb-4 justify-center md:justify-start">
              <FaConnectdevelop className="mr-2" />
              Connect & Collaborate
            </h3>
            <p className="text-gray-400">Your dedicated hub for successful project collaborations.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul>
              <li className="mb-2"><Link to="/login" className="text-gray-400 hover:text-white">Login</Link></li>
              <li><Link to="/signup" className="text-gray-400 hover:text-white">Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Made By</h4>
            <ul className="text-gray-400">
                <li className="mb-1">Sujala Gaddam</li>
                <li className="mb-1">sujala.gaddam@gmail.com</li>
                <li className="mb-1">+91 12345 67890</li>
                <li>Your City, Your State</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-gray-500 mt-10 pt-6 border-t border-gray-700">
          <p>&copy; {new Date().getFullYear()} Connect & Collaborate. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}