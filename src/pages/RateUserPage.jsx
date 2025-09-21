// src/pages/RateUserPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCollaboratedUsers } from '../services/userService';
import projectService from '../services/projectService';
import { getFreelancerProposals } from '../services/proposalService';
import FeedbackModal from '../components/Feedback/FeedbackModal';
import { FaArrowLeft, FaUserCircle } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';

const readUser = () => {
  try {
    const token = localStorage.getItem("token");
    if (token) return jwtDecode(token).user;
  } catch (err) { return null; }
};

export default function RateUserPage() {
    const [user] = useState(readUser());
    const [collaborators, setCollaborators] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchPageData = async () => {
        try {
            const usersRes = await getCollaboratedUsers();
            setCollaborators(usersRes.data || []);
            
            let projectData = [];
            if (user.role === 'client') {
                const projectsRes = await projectService.getMyProjects();
                projectData = projectsRes.data || [];
            } else {
                const proposalsRes = await getFreelancerProposals();
                // Extract the full project object from each proposal
                projectData = (proposalsRes.data || []).map(p => p.project).filter(Boolean);
            }
            setProjects(projectData);

        } catch (err) {
            toast.error("Failed to load users you've worked with.");
            console.error("Fetch data error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPageData();
        }
    }, [user]);

    const projectsWithSelectedUser = projects.filter(p => {
        if (!selectedUser || !p) return false;
        
        const projectClient = p.client?._id || p.client;
        const projectFreelancer = p.assignedFreelancer?._id || p.assignedFreelancer;

        return user.role === 'client'
            ? String(projectFreelancer) === String(selectedUser._id)
            : String(projectClient) === String(selectedUser._id);
    });

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <Link to={`/${user.role}/dashboard`} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
                        <FaArrowLeft /> Back to Dashboard
                    </Link>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Rate a User</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <h2 className="text-xl font-semibold mb-3">Select a User</h2>
                        <div className="bg-white rounded-xl shadow-md p-4 space-y-3">
                            {collaborators.length > 0 ? collaborators.map(c => (
                                <button key={c._id} onClick={() => setSelectedUser(c)} className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${selectedUser?._id === c._id ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}>
                                    <FaUserCircle className="text-gray-400 text-2xl" />
                                    <span>{c.name}</span>
                                </button>
                            )) : <p className="text-gray-500 text-sm">You haven't collaborated with anyone yet.</p>}
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <h2 className="text-xl font-semibold mb-3">Select a Project to Review</h2>
                        <div className="bg-white rounded-xl shadow-md p-4 space-y-3">
                           {selectedUser ? (
                                projectsWithSelectedUser.length > 0 ? (
                                    projectsWithSelectedUser.map(p => (
                                        <div key={p._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span>{p.title}</span>
                                            <button onClick={() => setSelectedProject(p)} className="px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded-lg hover:bg-yellow-600">
                                                Leave Feedback
                                            </button>
                                        </div>
                                    ))
                                ) : <p className="text-gray-500">No projects found with this user.</p>
                           ) : <p className="text-gray-500">Please select a user to see your projects together.</p>}
                        </div>
                    </div>
                </div>
            </div>
            {selectedProject && (
                <FeedbackModal 
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                    onFeedbackSubmitted={() => {
                        setSelectedProject(null);
                        toast.info("Feedback submitted! It may take a moment for ratings to update.")
                    }}
                />
            )}
        </div>
    );
}