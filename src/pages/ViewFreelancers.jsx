// src/pages/ViewFreelancers.jsx
import React, { useEffect, useState } from 'react';
import { getAllFreelancers } from '../services/userService';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom'; // ADDED

export default function ViewFreelancers() {
    const [freelancers, setFreelancers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFreelancers = async () => {
            try {
                const res = await getAllFreelancers();
                setFreelancers(res.data);
            } catch (err) {
                toast.error('Failed to load freelancers.');
            } finally {
                setLoading(false);
            }
        };
        fetchFreelancers();
    }, []);

    if (loading) return <div className="p-6">Loading freelancers...</div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">All Freelancers</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {freelancers.map(freelancer => (
                    // MODIFIED: Wrapped card in a Link
                    <Link to={`/profile/${freelancer._id}`} key={freelancer._id} className="bg-white rounded-lg shadow p-4 block hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            {freelancer.profilePicture ? (
                                <img src={`${freelancer.profilePicture}`} alt={freelancer.name} className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                    {freelancer.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="ml-4">
                                <h2 className="text-lg font-semibold">{freelancer.name}</h2>
                                <p className="text-gray-500 text-sm">{freelancer.email}</p>
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {freelancer.skills.map(skill => (
                                        <span key={skill} className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
