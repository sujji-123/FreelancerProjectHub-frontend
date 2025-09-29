// src/pages/NotificationsPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import notificationService from '../services/notificationService';
import { toast } from 'react-toastify';
import { FaBell, FaArrowLeft } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';

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
    const [user] = useState(readUser());

    useEffect(() => {
        const fetchAndMarkNotifications = async () => {
            try {
                const res = await notificationService.getNotifications();
                setNotifications(res.data || []);
                
                // --- CHANGE 1: Mark all as read when the page is visited ---
                // This will remove the red count badge on other pages after you visit this one.
                await notificationService.markAllNotificationsRead();

            } catch (err) {
                toast.error('Failed to load notifications.');
            } finally {
                setLoading(false);
            }
        };
        fetchAndMarkNotifications();
    }, []);

    // --- CHANGE 2: Standardize the notification icon ---
    // This function now always returns the bell icon, regardless of the notification type.
    const getNotificationIcon = () => {
        return <FaBell className="text-blue-500" />;
    };

    const getNotificationLink = (notification) => {
        if (notification.payload?.projectId) {
            return `/project/collaborate/${notification.payload.projectId}`;
        }
        return '#';
    };

    if (loading) {
        return <div className="p-6 text-center">Loading notifications...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
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
                                <li key={n._id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <Link to={getNotificationLink(n)} className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon()}
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