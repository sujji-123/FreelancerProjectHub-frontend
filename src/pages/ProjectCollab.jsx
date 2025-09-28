// src/pages/ProjectCollab.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getTasksByProject, createTask, updateTaskStatus, deleteTask } from '../services/taskService';
import { getDeliverablesByProject, uploadDeliverable, deleteDeliverable } from '../services/deliverableService';
import { getMessagesByProject, createMessage } from '../services/messageService';
import projectService from '../services/projectService';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaTrash } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';

const SOCKET_URL = '/';

const readUser = () => {
  try {
    const u = localStorage.getItem("user");
    if (u) return JSON.parse(u);
  } catch (err) { /* ignore */ }
  try {
    const token = localStorage.getItem("token");
    if (token) return jwtDecode(token).user;
  } catch (err) { return null; }
  return null;
};

const ProjectCollab = () => {
    const { projectId } = useParams();
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [user] = useState(readUser());
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [deliverables, setDeliverables] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newMessageContent, setNewMessageContent] = useState('');
    const [file, setFile] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [projectRes, tasksRes, deliverablesRes, messagesRes] = await Promise.all([
                projectService.getProjectById(projectId),
                getTasksByProject(projectId),
                getDeliverablesByProject(projectId),
                getMessagesByProject(projectId),
            ]);

            setProject(projectRes.data);
            setTasks(tasksRes || []);
            setDeliverables(deliverablesRes || []);
            setMessages(messagesRes || []);
        } catch (error) {
            toast.error('Failed to load project data.');
            console.error("Fetch Data Error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchData();

        if (!socketRef.current) {
            socketRef.current = io(SOCKET_URL, { withCredentials: true, path: '/socket.io' });

            socketRef.current.on('connect', () => {
                socketRef.current.emit('joinProject', { projectId });
            });

            socketRef.current.on('taskUpdated', (updatedTask) => {
                setTasks(prevTasks => prevTasks.map(task => task._id === updatedTask._id ? updatedTask : task));
            });

            socketRef.current.on('deliverableUploaded', (newDeliverable) => {
                setDeliverables(prev => [...prev, newDeliverable]);
            });

            socketRef.current.on('deliverableDeleted', ({ _id }) => {
                setDeliverables(prev => prev.filter(d => d._id !== _id));
            });
            
            socketRef.current.on('messageCreated', (message) => {
                setMessages((prevMessages) => [...prevMessages, message]);
            });

        }
        
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [projectId, fetchData]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return;
        try {
            const newTask = await createTask({ project: projectId, title: newTaskTitle });
            setTasks([...tasks, newTask]);
            setNewTaskTitle('');
            toast.success('Task added!');
        } catch (error) {
            toast.error('Failed to add task.');
        }
    };

    const handleUpdateTaskStatus = async (taskId, status) => {
        try {
            const updatedTask = await updateTaskStatus(taskId, status);
            setTasks(tasks.map((task) => (task._id === taskId ? updatedTask : task)));
            toast.success(`Task marked as ${status}!`);
        } catch (error) {
            toast.error('Failed to update task status.');
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await deleteTask(taskId);
            setTasks(tasks.filter((task) => task._id !== taskId));
            toast.success('Task deleted!');
        } catch (error) {
            toast.error('Failed to delete task.');
        }
    };

    const handleUploadDeliverable = async () => {
        if (!file) {
            toast.warn('Please select a file to upload.');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project', projectId);

        try {
            // Service already handles multipart form data
            await uploadDeliverable(formData);
            // We don't need to manually add to state, socket event will handle it
            setFile(null);
            document.getElementById('file-input').value = '';
            toast.success('Deliverable uploaded!');
        } catch (error) {
            toast.error('Failed to upload deliverable.');
        }
    };

    const handleSendMessage = async () => {
        if (!newMessageContent.trim()) return;
        try {
            const messagePayload = { project: projectId, content: newMessageContent };
            await createMessage(messagePayload);
            setNewMessageContent('');
        } catch (error) {
            toast.error('Failed to send message.');
        }
    };
    
    const handleDeleteDeliverable = async (deliverableId) => {
        if (window.confirm('Are you sure you want to delete this file? This cannot be undone.')) {
            try {
                await deleteDeliverable(deliverableId);
                // We don't need to manually remove from state, socket event will handle it
                toast.success('Deliverable deleted!');
            } catch (error) {
                toast.error(error.response?.data?.error || 'Failed to delete deliverable.');
            }
        }
    };

    if (isLoading) {
        return <div className="container mx-auto p-8 text-center">Loading Collaboration Space...</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="mb-6">
                <Link to={user?.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard'} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 mb-4">
                    <FaArrowLeft />
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-800">{project?.title || "Project Collaboration"}</h1>
                <p className="text-gray-500 mt-1">
                    {user?.role === 'client'
                        ? `Freelancer: ${project?.assignedFreelancer?.name || 'Not Assigned'}`
                        : `Client: ${project?.client?.name || 'N/A'}`
                    }
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white border p-4 rounded-lg shadow-sm lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Tasks</h2>
                    <div className="flex mb-4 gap-2">
                        <input type="text" className="border p-2 w-full rounded-md" placeholder="Add a new task..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTask()} />
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md" onClick={handleAddTask}>Add</button>
                    </div>
                    <ul className="space-y-2">
                        {tasks.map((task) => (
                            <li key={task._id} className="flex justify-between items-center p-2 rounded-md bg-gray-50">
                                <span className={task.status === 'done' ? 'line-through text-gray-500' : ''}>{task.title}</span>
                                <div className="flex gap-2">
                                    {task.status === 'todo' && (
                                        <button className="text-sm text-yellow-600" onClick={() => handleUpdateTaskStatus(task._id, 'inprogress')}>In Progress</button>
                                    )}
                                     {task.status === 'inprogress' && (
                                        <button className="text-sm text-green-600" onClick={() => handleUpdateTaskStatus(task._id, 'done')}>Done</button>
                                    )}
                                    <button className="text-sm text-red-600" onClick={() => handleDeleteTask(task._id)}>Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white border p-4 rounded-lg shadow-sm row-start-3 lg:row-start-auto flex flex-col">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Chat</h2>
                    <div className="border h-80 overflow-y-auto mb-4 p-2 bg-gray-50 rounded-md flex-1 flex flex-col gap-2">
                        {messages.map((msg) => (
                            <div key={msg._id} className={`flex ${msg.sender?._id === user.id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`rounded-lg px-3 py-2 max-w-xs ${msg.sender?._id === user.id ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-black'}`}>
                                    <p className="font-bold text-sm">{msg.sender?.name || 'User'}</p>
                                    <p>{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="flex gap-2">
                        <input type="text" className="border p-2 w-full rounded-md" placeholder="Type a message..." value={newMessageContent} onChange={(e) => setNewMessageContent(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md" onClick={handleSendMessage}>Send</button>
                    </div>
                </div>

                <div className="bg-white border p-4 rounded-lg shadow-sm lg:col-span-3">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Deliverables</h2>
                    <div className="flex items-center gap-4">
                        <input id="file-input" type="file" className="flex-1" onChange={(e) => setFile(e.target.files[0])} />
                        <button className="bg-green-600 text-white px-4 py-2 rounded-md" onClick={handleUploadDeliverable}>Upload</button>
                    </div>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {deliverables.map((d) => (
                             <div key={d._id} className="relative p-2 bg-gray-50 rounded-md group">
                                <img
                                    /* MODIFIED: Use the direct Cloudinary URL */
                                    src={d.fileUrl}
                                    alt="deliverable"
                                    className="w-full h-24 object-cover rounded-md cursor-pointer"
                                    onClick={() => setSelectedImage(d.fileUrl)}
                                />
                                {user.id === d.uploadedBy?._id && (
                                    <button 
                                        onClick={() => handleDeleteDeliverable(d._id)}
                                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete Deliverable"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(null);
                        }}
                        className="absolute top-4 right-4 bg-gray-700 bg-opacity-70 text-white px-3 py-1.5 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm"
                        aria-label="Back to Collaboration Hub"
                    >
                        <FaArrowLeft />
                        <span>Back to Hub</span>
                    </button>
                    <img 
                        src={selectedImage} 
                        alt="Full screen deliverable" 
                        className="max-h-full max-w-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default ProjectCollab;
