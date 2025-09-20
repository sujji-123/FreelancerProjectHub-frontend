// src/pages/FreelancerMyContracts.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getFreelancerProposals } from '../services/proposalService';
import { FaFileSignature, FaArrowLeft } from 'react-icons/fa';

export default function FreelancerMyContracts() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const res = await getFreelancerProposals();
                // A contract is a project linked to an accepted proposal
                const acceptedProposals = (res.data || []).filter(p => p.status === 'accepted');
                setContracts(acceptedProposals);
            } catch (err) {
                toast.error('Failed to fetch your contracts.');
            } finally {
                setLoading(false);
            }
        };
        fetchContracts();
    }, []);

    if (loading) {
        return <div className="p-8 text-center">Loading your contracts...</div>;
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
                <h1 className="text-3xl font-bold text-gray-800 mb-6">My Contracts</h1>
                {contracts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {contracts.map(contract => (
                            <div key={contract._id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                                <div className="flex items-center mb-3">
                                    <FaFileSignature className="text-green-500 text-2xl" />
                                    <h3 className="text-xl font-bold text-gray-800 ml-3">{contract.project?.title || "Project Title"}</h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-700">Project Status:</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            contract.project?.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                        }`}>{contract.project?.status || 'Active'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-700">Agreed Bid:</span>
                                        <span className="font-bold text-green-600">${contract.bidAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-700">Contract Date:</span>
                                        <span className="text-gray-600">{new Date(contract.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="mt-5 pt-4 border-t">
                                    <Link to={`/project/collaborate/${contract.project?._id}`} className="w-full block text-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                                        Go to Collaboration Space
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="text-center bg-white p-12 rounded-xl shadow-md">
                        <h3 className="text-xl font-semibold text-gray-700">You have no active contracts.</h3>
                        <p className="text-gray-500 mt-2">When a client accepts your proposal, the project will appear here as a contract.</p>
                    </div>
                )}
            </div>
        </div>
    );
}