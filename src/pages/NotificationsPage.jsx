// src/pages/NotificationsPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import notificationService from '../services/notificationService';
import { toast } from 'react-toastify';
import { FaBell, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaArrowLeft } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';

// ADDED: Helper function to read user role for the back link
const readUser = () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const dec = jwtDecode(token);
        return dec.user || { role: dec.role };
      }
    } catch (err) { /* ignore */ }
    return null;
};


export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    // ADDED: State for user to determine the correct dashboard link
    const [user, setUser] = useState(readUser());

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await notificationService.getNotifications();
                setNotifications(res.data || []);
            } catch (err) {
                toast.error('Failed to load notifications.');
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'proposal_received':
                return <FaBell className="text-blue-500" />;
            case 'proposal_accepted':
                return <FaCheckCircle className="text-green-500" />;
            case 'proposal_rejected':
                return <FaExclamationCircle className="text-red-500" />;
            default:
                return <FaInfoCircle className="text-gray-500" />;
        }
    };

    const getNotificationLink = (notification) => {
        if (notification.payload?.projectId) {
            return `/project/collaborate/${notification.payload.projectId}`;
        }
        return '#'; // Default link if no specific page is relevant
    };

    if (loading) {
        return <div className="p-6 text-center">Loading notifications...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex items-center gap-4">
                    {/* ADDED: Back to Dashboard link */}
                    <Link 
                        to={user?.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard'} 
                        className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                    >
                        <FaArrowLeft />
                        Back to Dashboard
                    </Link>
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-6">Notifications</h1>
                <div className="bg-white rounded-xl shadow-md">
                    {notifications.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {notifications.map(n => (
                                <li key={n._id} className={`p-4 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-indigo-50' : ''}`}>
                                    <Link to={getNotificationLink(n)} className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(n.type)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {n.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {`For project: ${n.payload?.projectTitle || 'N/A'}`}
                                                {n.payload?.freelancerName && ` by ${n.payload.freelancerName}`}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(n.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {!n.read && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="p-6 text-gray-500 text-center">You have no notifications.</p>
                    )}
                </div>
            </div>
        </div>
    );
}