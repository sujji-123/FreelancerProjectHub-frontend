// src/pages/FreelancerMyProposals.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getFreelancerProposals } from '../services/proposalService';
import { FaFileAlt, FaClock, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';

export default function FreelancerMyProposals() {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProposals = async () => {
            try {
                const res = await getFreelancerProposals();
                setProposals(res.data || []);
            } catch (err) {
                toast.error('Failed to fetch your proposals.');
            } finally {
                setLoading(false);
            }
        };
        fetchProposals();
    }, []);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'accepted':
                return { icon: <FaCheckCircle className="text-green-500" />, color: 'text-green-700 bg-green-100' };
            case 'rejected':
                return { icon: <FaTimesCircle className="text-red-500" />, color: 'text-red-700 bg-red-100' };
            default:
                return { icon: <FaClock className="text-yellow-500" />, color: 'text-yellow-700 bg-yellow-100' };
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading your proposals...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <Link to="/freelancer/dashboard" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
                        <FaArrowLeft />
                        Back to Dashboard
                    </Link>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-6">My Submitted Proposals</h1>
                {proposals.length > 0 ? (
                    <div className="space-y-4">
                        {proposals.map(p => {
                            const statusInfo = getStatusInfo(p.status);
                            return (
                                <div key={p._id} className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                        <div className="mb-3 sm:mb-0">
                                            <div className="flex items-center text-indigo-600 mb-1">
                                                <FaFileAlt />
                                                <h3 className="text-xl font-bold text-gray-800 ml-2">{p.project?.title || "Project Title"}</h3>
                                            </div>
                                            <p className="text-sm text-gray-500">Submitted on: {new Date(p.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Your Bid</p>
                                                <p className="font-bold text-lg text-green-600">${p.bidAmount.toLocaleString()}</p>
                                            </div>
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                                                {statusInfo.icon}
                                                <span>{p.status.charAt(0).toUpperCase() + p.status.slice(1)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center bg-white p-12 rounded-xl shadow-md">
                        <h3 className="text-xl font-semibold text-gray-700">You haven't submitted any proposals yet.</h3>
                        <p className="text-gray-500 mt-2">Browse the project marketplace to find work.</p>
                        <Link to="/freelancer/projects" className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">
                            Browse Projects
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}