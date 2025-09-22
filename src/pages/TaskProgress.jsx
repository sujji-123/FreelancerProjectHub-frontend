// src/pages/TaskProgress.jsx
import React, { useEffect, useState } from 'react';
import { getMyProjects, getFreelancerProjects } from '../services/projectService';
import { getTasksByProject } from '../services/taskService';
import { toast } from 'react-toastify';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { FaArrowLeft } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend);

const readUser = () => {
    try {
        const u = localStorage.getItem("user");
        if (u) return JSON.parse(u);
    } catch (err) { /* ignore */ }
    return null;
};

export default function TaskProgress() {
    const [user] = useState(readUser());
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                // Fetch projects based on the user's role
                const res = user.role === 'client' 
                    ? await getMyProjects() 
                    : await getFreelancerProjects();
                
                // We only want to see projects that are actively being worked on
                const activeProjects = (res.data || []).filter(p => p.status === 'in-progress' || p.status === 'completed');
                setProjects(activeProjects);

            } catch (err) {
                toast.error("Failed to load projects.");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProjects();
        }
    }, [user]);

    // This function runs when a user clicks on a project from the list
    const handleProjectClick = async (project) => {
        try {
            setLoading(true);
            const res = await getTasksByProject(project._id);
            setTasks(res || []);
            setSelectedProject(project); // Set the selected project to switch the view
        } catch (err) {
            toast.error("Failed to load tasks for this project.");
        } finally {
            setLoading(false);
        }
    };

    // This function returns the user to the project list view
    const handleBackToProjects = () => {
        setSelectedProject(null);
        setTasks([]);
    };

    const taskData = {
        labels: ['To Do', 'In Progress', 'Done'],
        datasets: [
            {
                data: [
                    tasks.filter(t => t.status === 'todo').length,
                    tasks.filter(t => t.status === 'inprogress').length,
                    tasks.filter(t => t.status === 'done').length,
                ],
                backgroundColor: ['#ef4444', '#f59e0b', '#22c55e'],
                borderColor: ['#ffffff', '#ffffff', '#ffffff'],
                borderWidth: 1,
            },
        ],
    };
    
    if (loading) return <div className="p-8 text-center">Loading...</div>;

    // VIEW 2: Show Task Details for a single selected project
    if (selectedProject) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <button onClick={handleBackToProjects} className="flex items-center gap-2 text-indigo-600 mb-4 font-semibold hover:underline">
                    <FaArrowLeft /> Back to Projects List
                </button>
                <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold mb-1">Task Progress for: {selectedProject.title}</h1>
                     <p className="text-sm text-gray-500 mb-4">
                        {user.role === 'client' 
                            ? `Freelancer: ${selectedProject.assignedFreelancer?.name || 'N/A'}` 
                            : `Client: ${selectedProject.client?.name || 'N/A'}`}
                    </p>
                    {tasks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                            <div className="md:col-span-1 h-56 md:h-auto">
                                <Pie data={taskData} options={{ maintainAspectRatio: false }} />
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg text-red-600">To Do</h3>
                                    {tasks.filter(t => t.status === 'todo').map(t => <p key={t._id} className="text-gray-700">{t.title}</p>)}
                                </div>
                                 <div>
                                    <h3 className="font-semibold text-lg text-amber-600">In Progress</h3>
                                    {tasks.filter(t => t.status === 'inprogress').map(t => <p key={t._id} className="text-gray-700">{t.title}</p>)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-green-600">Done</h3>
                                    {tasks.filter(t => t.status === 'done').map(t => <p key={t._id} className="text-gray-700 line-through">{t.title}</p>)}
                                </div>
                            </div>
                        </div>
                    ) : <p className="text-center text-gray-500 py-4">No tasks found for this project.</p>}
                </div>
            </div>
        );
    }

    // VIEW 1: Show the list of all projects
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Select a Project</h1>
            <p className="text-gray-600 mb-6">Click on a project to view its detailed task progress.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <div 
                        key={project._id} 
                        onClick={() => handleProjectClick(project)} 
                        className="bg-white rounded-lg shadow p-5 cursor-pointer hover:shadow-xl hover:border-indigo-500 border-2 border-transparent transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <h2 className="text-lg font-bold text-gray-900 truncate">{project.title}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {user.role === 'client' 
                                ? `Freelancer: ${project.assignedFreelancer?.name || 'Not Assigned'}` 
                                : `Client: ${project.client?.name || 'Unknown'}`}
                        </p>
                         <div className="mt-4 pt-3 border-t border-gray-200">
                             <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                                View Progress
                             </span>
                         </div>
                    </div>
                ))}
                 {projects.length === 0 && (
                    <div className="md:col-span-2 lg:col-span-3 text-center bg-white p-12 rounded-lg shadow">
                        <h3 className="text-xl font-semibold text-gray-700">No Active Projects Found</h3>
                        <p className="text-gray-500 mt-2">There are no "in-progress" or "completed" projects to show task data for.</p>
                    </div>
                )}
            </div>
        </div>
    );
}