// src/pages/NotificationsPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markAsRead } from '../services/notificationService';
import { FaBell } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data } = await getNotifications();
                setNotifications(data);
            } catch (error) {
                toast.error("Failed to load notifications.");
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error("Could not mark notification as read", error);
        }
    };

    if (loading) {
        return <div className="text-center p-10">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Notifications</h1>
            <div className="bg-white shadow-lg rounded-lg">
                {notifications.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {notifications.map(notification => (
                            <li key={notification._id} className={`${!notification.read ? 'bg-indigo-50' : 'bg-white'} hover:bg-gray-50 transition-colors`}>
                                {/* MODIFIED: The Link now correctly points to the project dashboard page.
                                  The backend should store the project's ID in the 'link' field of the notification document.
                                */}
                                <Link 
                                    to={`/project/${notification.link}`} 
                                    onClick={() => handleMarkAsRead(notification._id)}
                                    className="block p-4"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 pt-1 text-indigo-500">
                                            <FaBell size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="flex-shrink-0">
                                                <span className="w-3 h-3 bg-blue-500 rounded-full inline-block" title="Unread"></span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 p-10">You have no new notifications.</p>
                )}
            </div>
        </div>
    );
}