// src/pages/ClientProposals.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import proposalService from '../services/proposalService';
import { FaUserCircle, FaFileAlt, FaArrowLeft } from 'react-icons/fa';

export default function ClientProposals() {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProposals = async () => {
            try {
                const res = await proposalService.getClientProposals();
                setProposals(res.data || []);
            } catch (err) {
                toast.error('Failed to fetch proposals.');
            } finally {
                setLoading(false);
            }
        };
        fetchProposals();
    }, []);

    if (loading) {
        return <div className="p-8 text-center">Loading proposals...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <Link to="/client/dashboard" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
                        <FaArrowLeft />
                        Back to Dashboard
                    </Link>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Proposals Received</h1>
                {proposals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {proposals.map(p => (
                            <div key={p._id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                                <div className="flex items-center mb-4">
                                    <FaFileAlt className="text-indigo-500 text-2xl" />
                                    <h3 className="text-xl font-bold text-gray-800 ml-3">{p.project?.title || "Project Title"}</h3>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center">
                                        <FaUserCircle className="text-gray-400 mr-2" />
                                        <span className="font-semibold text-gray-700">Freelancer:</span>
                                        <span className="ml-2 text-gray-600">{p.freelancer?.name || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-700">Bid:</span>
                                        <span className="ml-2 font-bold text-green-600">${p.bidAmount.toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-700 mb-1">Cover Letter:</p>
                                        <p className="text-gray-600 bg-gray-50 p-3 rounded-md h-28 overflow-auto">
                                            {p.coverLetter || "No cover letter provided."}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t text-right">
                                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                         p.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                         p.status === "accepted" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                     }`}>{p.status.charAt(0).toUpperCase() + p.status.slice(1)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-white p-12 rounded-xl shadow-md">
                        <h3 className="text-xl font-semibold text-gray-700">No Proposals Yet</h3>
                        <p className="text-gray-500 mt-2">When freelancers apply to your projects, their proposals will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}