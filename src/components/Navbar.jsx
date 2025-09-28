// src/components/Navbar.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FaBell, FaEnvelope, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

export default function Navbar() {
    const [user, setUser] = useState(null);
    // ADDED: State to control the mobile menu's visibility
    const [isMenuOpen, setIsMenuOpen] = useState(false); 
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Ensure user object has role for dashboard link logic
                setUser({ role: decoded.role, ...decoded });
            } catch (error) {
                console.error("Token decoding failed:", error);
                handleLogout(); // Log out if token is invalid
            }
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsMenuOpen(false); // Close mobile menu upon logout
        navigate('/login');
    };

    // Determine the correct dashboard link based on user role
    const dashboardLink = user ? (user.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard') : '/';

    // ADDED: An array of navigation links to avoid repetition in desktop and mobile menus
    const navLinks = (
        <>
            <Link to={dashboardLink} onClick={() => setIsMenuOpen(false)} className="block md:inline-block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Dashboard</Link>
            <Link to="/freelancer/projects" onClick={() => setIsMenuOpen(false)} className="block md:inline-block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Find Work</Link>
            <Link to="/freelancers" onClick={() => setIsMenuOpen(false)} className="block md:inline-block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Find Talent</Link>
            <Link to="/messages" onClick={() => setIsMenuOpen(false)} className="block md:inline-block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Messages</Link>
        </>
    );

    return (
        <nav className="bg-white shadow-md fixed w-full top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-2xl font-bold text-indigo-600">FreeFlow</Link>
                    </div>
                    
                    {/* Desktop Menu Links (unchanged) */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {user && navLinks}
                        </div>
                    </div>
                    
                    <div className="flex items-center">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <Link to="/notifications" className="text-gray-500 hover:text-indigo-600">
                                    <FaBell size={20} />
                                </Link>
                                <Link to={`/profile/${user.id}`} className="text-gray-500 hover:text-indigo-600">
                                    <FaUserCircle size={22} />
                                </Link>
                                <button onClick={handleLogout} className="hidden md:block bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600">
                                    Logout
                                </button>
                                {/* ADDED: Hamburger Menu Button for logged-in users */}
                                <div className="md:hidden">
                                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-indigo-600 focus:outline-none">
                                        {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center space-x-4">
                                <Link to="/login" className="text-gray-700 hover:text-indigo-600">Login</Link>
                                <Link to="/signup" className="bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-600">Sign Up</Link>
                            </div>
                        )}
                         {/* ADDED: Hamburger Menu Button for guests */}
                         {!user && (
                            <div className="md:hidden">
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-indigo-600 focus:outline-none">
                                    {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                                </button>
                            </div>
                         )}
                    </div>
                </div>
            </div>

            {/* ADDED: The Mobile Menu dropdown */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {user ? (
                            <>
                                {navLinks}
                                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">
                                    Logout
                                </button>
                            </>
                        ) : (
                             <>
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Login</Link>
                                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Sign Up</Link>
                             </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}