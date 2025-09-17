import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getTasksByProject, createTask, updateTask, deleteTask } from '../services/taskService';
import { getDeliverablesByProject, uploadDeliverable } from '../services/deliverableService';
import { getMessagesByProject, createMessage } from '../services/messageService';
import { toast } from 'react-toastify';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

const ProjectCollab = () => {
    const { projectId } = useParams();
    const socketRef = useRef(null);

    const [tasks, setTasks] = useState([]);
    const [deliverables, setDeliverables] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newMessageContent, setNewMessageContent] = useState('');
    const [file, setFile] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [tasksRes, deliverablesRes, messagesRes] = await Promise.all([
                getTasksByProject(projectId),
                getDeliverablesByProject(projectId),
                getMessagesByProject(projectId),
            ]);

            // **THIS IS THE FIX (Part 1):**
            // Your services already return the final data array. We no longer need to access `.data`.
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
        console.log("Connecting to socket server...");
        if (!socketRef.current) {
            socketRef.current = io(SOCKET_URL, {
                transports: ['websocket'],
                withCredentials: true,
            });

            socketRef.current.on('connect', () => {
                console.log('Socket connected!', socketRef.current.id);
                socketRef.current.emit('joinProject', { projectId });
            });

            socketRef.current.on('newMessage', (message) => {
                setMessages((prevMessages) => [...prevMessages, message]);
            });

            socketRef.current.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
                toast.error('Could not connect to the chat server.');
            });
        }

        fetchData();

        return () => {
            if (socketRef.current && socketRef.current.connected) {
                console.log("Cleaning up socket connection...");
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [projectId, fetchData]);

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return;
        try {
            // The `createTask` service returns the new task object directly.
            const newTask = await createTask({ project: projectId, title: newTaskTitle });
            // **THIS IS THE FIX (Part 2):** Add the returned object to state.
            setTasks([...tasks, newTask]);
            setNewTaskTitle('');
            toast.success('Task added!');
        } catch (error) {
            toast.error('Failed to add task.');
        }
    };

    const handleUpdateTask = async (taskId, status) => {
        try {
            const updatedTask = await updateTask(taskId, { status });
            setTasks(tasks.map((task) => (task._id === taskId ? updatedTask : task)));
            toast.success(`Task marked as ${status}!`);
        } catch (error) {
            toast.error('Failed to update task.');
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
            const newDeliverable = await uploadDeliverable(formData);
            // **THIS IS THE FIX (Part 3):** Add the returned object to state.
            setDeliverables([...deliverables, newDeliverable]);
            setFile(null);
            document.getElementById('file-input').value = '';
            toast.success('Deliverable uploaded!');
        } catch (error) {
            toast.error('Failed to upload deliverable.');
        }
    };

    const handleSendMessage = async () => {
        if (!newMessageContent.trim() || !socketRef.current) return;
        try {
            const messagePayload = { project: projectId, content: newMessageContent };
            const newMessage = await createMessage(messagePayload);
            // **THIS IS THE FIX (Part 4):** Use the returned object for both socket and state.
            socketRef.current.emit('sendMessage', { projectId, message: newMessage });
            setMessages(prev => [...prev, newMessage]);
            setNewMessageContent('');
        } catch (error) {
            toast.error('Failed to send message.');
        }
    };

    if (isLoading) {
        return <div className="container mx-auto p-8 text-center">Loading Collaboration Space...</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Project Collaboration</h1>
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
                                    {task.status !== 'done' && (
                                        <button className="text-sm text-green-600" onClick={() => handleUpdateTask(task._id, 'done')}>Done</button>
                                    )}
                                    <button className="text-sm text-red-600" onClick={() => handleDeleteTask(task._id)}>Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white border p-4 rounded-lg shadow-sm row-start-3 lg:row-start-auto">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Chat</h2>
                    <div className="border h-80 overflow-y-scroll mb-4 p-2 bg-gray-50 rounded-md flex flex-col gap-2">
                        {messages.map((msg) => (
                            <div key={msg._id}>
                                <strong className="text-sm text-gray-800">{msg.sender?.name || 'User'}:</strong>
                                <p className="text-gray-600 bg-white p-2 rounded-md">{msg.content}</p>
                            </div>
                        ))}
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
                    <ul className="mt-4 space-y-2">
                        {deliverables.map((d) => (
                            <li key={d._id} className="p-2 bg-gray-50 rounded-md">
                                <a href={`http://localhost:5001/${d.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600">
                                    {d.fileUrl.split(/[\\/]/).pop()}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProjectCollab;