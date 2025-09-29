import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import notificationService from '../services/notificationService';
import proposalService from '../services/proposalService'; // Import proposalService for checking status
import { toast } from 'react-toastify';
import { FaBell, FaArrowLeft } from 'react-icons/fa';
import * as jwtDecode from 'jwt-decode'; // Fixed import

const readUser = () => {
    try {
        const token = localStorage.getItem("token");
        if (token) {
            const dec = jwtDecode.default ? jwtDecode.default(token) : jwtDecode(token);
            return dec.user || { role: dec.role };
        }
    } catch (err) { /* ignore */ }
    return null;
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user] = useState(readUser());
    const [proposalStatusMap, setProposalStatusMap] = useState({}); // key: projectId, value: accepted boolean

    useEffect(() => {
        const fetchAndMarkNotifications = async () => {
            try {
                const res = await notificationService.getNotifications();
                const notifs = res.data || [];
                setNotifications(notifs);

                // Mark all as read when the page is visited
                await notificationService.markAllNotificationsRead();

                // Fetch proposal acceptance status for notifications related to proposals
                const projectIds = notifs
                    .filter(n => n.payload?.projectId)
                    .map(n => n.payload.projectId);

                // To avoid duplicate calls for same project
                const uniqueProjectIds = Array.from(new Set(projectIds));
                
                // Fetch proposals for each project and check if any is accepted (client role)
                let statusMap = {};
                if(user?.role === 'client') {
                    for (const projectId of uniqueProjectIds) {
                        try {
                            const proposalsRes = await proposalService.getClientProposals(); 
                            // Filter proposals for this project and find any accepted
                            const accepted = proposalsRes.data.some(p => p.projectId === projectId && p.status === 'accepted');
                            statusMap[projectId] = accepted;
                        } catch {
                            statusMap[projectId] = false;
                        }
                    }
                }
                setProposalStatusMap(statusMap);

            } catch (err) {
                toast.error('Failed to load notifications.');
            } finally {
                setLoading(false);
            }
        };
        fetchAndMarkNotifications();
    }, [user]);

    // Always return bell icon
    const getNotificationIcon = () => {
        return <FaBell className="text-blue-500" />;
    };

    // Modify link logic:
    // If proposal related notification and not accepted => link to proposal review page
    // Else link to collaboration hub
    const getNotificationLink = (notification) => {
        const projectId = notification.payload?.projectId;
        if (projectId && user?.role === 'client') {
            let accepted = proposalStatusMap[projectId];
            if (accepted === false) {
                // Proposal not accepted yet, link to proposal review page
                return `/client/proposal-review/${projectId}`;
            }
            return `/project/collaborate/${projectId}`;
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
