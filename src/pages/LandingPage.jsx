// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaLaptopCode, FaHandshake, FaMoneyCheckAlt, FaRocket } from 'react-icons/fa';
import PublicNavbar from '../components/Navbar/PublicNavbar';
import PublicFooter from '../components/Footer/PublicFooter';

export default function LandingPage() {
  const heroStyle = {
    backgroundImage: "url('https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2070&auto=format&fit=crop')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className="bg-white text-gray-800">
      <PublicNavbar />
      
      {/* Hero Section with Background Image */}
      <header className="relative" style={heroStyle}>
        {/* Overlay for blur/darkening effect */}
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
        
        <div className="relative container mx-auto px-6 text-center py-20">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Connect & Collaborate: Your Project Hub
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mt-4 max-w-2xl mx-auto">
            A streamlined platform for freelancers and clients to manage projects from proposal to payment, fostering seamless collaboration.
          </p>
          <div className="mt-8 space-y-4 md:space-y-0 md:space-x-4">
            <Link 
              to="/signup" 
              className="inline-block w-full md:w-auto bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105"
            >
              New Here? Sign Up
            </Link>
            <Link 
              to="/login" 
              className="inline-block w-full md:w-auto bg-white text-indigo-600 font-semibold py-3 px-8 rounded-lg border border-transparent hover:bg-gray-200 transition-transform transform hover:scale-105"
            >
              Already have an account? Login
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
              <FaLaptopCode className="text-4xl text-indigo-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Post a Project</h3>
              <p className="text-gray-600">Clients can easily post project details, budget, and requirements for freelancers to see.</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
              <FaHandshake className="text-4xl text-indigo-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Find Your Match</h3>
              <p className="text-gray-600">Freelancers can browse projects and submit proposals to showcase their skills.</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
              <FaRocket className="text-4xl text-indigo-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Collaborate Effortlessly</h3>
              <p className="text-gray-600">Use our dedicated workspace for real-time chat, task management, and file sharing.</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
              <FaMoneyCheckAlt className="text-4xl text-indigo-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">Manage invoices and payments seamlessly through our integrated (mock) system.</p>
            </div>
          </div>
        </div>
      </section>
      
      <PublicFooter />
    </div>
  );
}