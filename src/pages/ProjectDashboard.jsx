// src/pages/ProjectDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProjectById, acceptProposal } from '../services/projectService'; // You need these services
import { getProposalsForProject } from '../services/proposalService'; // You need this service
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { FaDollarSign, FaFileAlt, FaCheck, FaTimes, FaExternalLinkAlt, FaStar, FaUser } from 'react-icons/fa';

// --- Reusable ProposalCard Component (can be moved to its own file if preferred) ---
const ProposalCard = ({ proposal, onAccept, onViewFreelancer }) => (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
        <div className="flex items-center mb-4">
            <img 
                src={proposal.freelancer?.profilePicture || `https://ui-avatars.com/api/?name=${proposal.freelancer.name.split(' ').join('+')}&background=random`} 
                alt={proposal.freelancer.name} 
                className="w-16 h-16 rounded-full object-cover mr-4"
            />
            <div>
                <h3 className="text-xl font-bold text-gray-800">{proposal.freelancer.name}</h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span>No reviews yet</span>
                </div>
            </div>
        </div>
        <div className="space-y-4">
            <div className="flex items-center text-gray-700">
                <FaDollarSign className="mr-3 text-indigo-500" />
                <p><span className="font-semibold">Bid Amount:</span> ${proposal.bid.toLocaleString()}</p>
            </div>
            <div className="flex items-start text-gray-700">
                <FaFileAlt className="mr-3 mt-1 text-indigo-500" />
                <div>
                    <p className="font-semibold">Cover Letter:</p>
                    <p className="text-gray-600 whitespace-pre-wrap">{proposal.coverLetter}</p>
                </div>
            </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
            <button 
                onClick={() => onViewFreelancer(proposal.freelancer)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
                View Profile
            </button>
            <button 
                onClick={() => onAccept(proposal._id)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
                <FaCheck /> Accept Proposal
            </button>
        </div>
    </div>
);


export default function ProjectDashboard() {
    const { id: projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            setCurrentUser({ id: decoded.id, role: decoded.role });
        } else {
            navigate('/login');
        }

        const fetchAllData = async () => {
            try {
                const projectRes = await getProjectById(projectId);
                setProject(projectRes.data);

                // Only fetch proposals if the project is open
                if (projectRes.data.status === 'open') {
                    const proposalsRes = await getProposalsForProject(projectId);
                    setProposals(proposalsRes.data);
                }
            } catch (error) {
                toast.error("Failed to load project data.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [projectId, navigate]);

    const handleAcceptProposal = async (proposalId) => {
        if (window.confirm("Are you sure you want to accept this proposal? This will hire the freelancer and change the project status to 'in-progress'.")) {
            try {
                await acceptProposal(projectId, proposalId);
                toast.success('Proposal accepted! The project is now in progress.');
                // Navigate to the collaboration page after accepting
                navigate(`/project/collaborate/${projectId}`);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to accept proposal.');
            }
        }
    };

    // This function can be used to navigate to a freelancer's profile page
    const handleViewFreelancer = (freelancer) => {
        navigate(`/profile/${freelancer._id}`);
    };


    if (loading) {
        return <div className="text-center py-10">Loading Project...</div>;
    }

    if (!project) {
        return <div className="text-center py-10 text-red-500">Project could not be found.</div>;
    }

    const isClientOwner = currentUser?.id === project.client._id;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">{project.title}</h1>
                <p className="text-gray-500 mb-4">Posted by {project.client.name}</p>
                <div className="flex items-center gap-4 text-gray-600 mb-6 flex-wrap">
                    <span className={`px-3 py-1 text-sm rounded-full capitalize ${project.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        Status: {project.status}
                    </span>
                    <span className="font-bold text-lg text-gray-800">${project.budget.toLocaleString()} Budget</span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
            </div>
            
            {/* --- CONDITIONAL RENDERING LOGIC --- */}
            
            {/* Condition 1: If project is OPEN and current user is the CLIENT */}
            {isClientOwner && project.status === 'open' && (
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Proposals Received</h2>
                    {proposals.length > 0 ? (
                        proposals.map(p => (
                            <ProposalCard 
                                key={p._id} 
                                proposal={p}
                                onAccept={handleAcceptProposal}
                                onViewFreelancer={handleViewFreelancer}
                            />
                        ))
                    ) : (
                        <div className="text-center text-gray-600 bg-gray-100 p-8 rounded-lg">
                            <h3 className="text-xl font-semibold">No proposals yet.</h3>
                            <p>You will be notified when freelancers apply for your project.</p>
                        </div>
                    )}
                </div>
            )}
            
            {/* Condition 2: If project is IN-PROGRESS or COMPLETED */}
            {project.status !== 'open' && (
                <div className="text-center bg-blue-50 p-8 rounded-lg shadow">
                    <h2 className="text-2xl font-bold text-blue-800 mb-4">Project In Progress</h2>
                    <p className="text-blue-700 mb-6">This project has been awarded. Manage tasks, communication, and deliverables in the Collaboration Hub.</p>
                    <Link 
                        to={`/project/collaborate/${project._id}`} 
                        className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105"
                    >
                        Go to Collaboration Hub
                    </Link>
                </div>
            )}
        </div>
    );
}