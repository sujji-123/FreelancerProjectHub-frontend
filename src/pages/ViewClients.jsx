// src/pages/ViewClients.jsx
import React, { useEffect, useState } from 'react';
import { getAllClients } from '../services/userService';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom'; // ADDED

export default function ViewClients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await getAllClients();
                setClients(res.data);
            } catch (err) {
                toast.error('Failed to load clients.');
            } finally {
                setLoading(false);
            }
        };
        fetchClients();
    }, []);

    if (loading) return <div className="p-6">Loading clients...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">All Clients</h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map(client => (
                    // MODIFIED: Wrapped card in a Link
                    <Link to={`/profile/${client._id}`} key={client._id} className="bg-white rounded-lg shadow p-4 block hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            {client.profilePicture ? (
                                <img src={`/${client.profilePicture}`} alt={client.name} className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                    {client.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="ml-4">
                                <h2 className="text-lg font-semibold">{client.name}</h2>
                                <p className="text-gray-500 text-sm">{client.email}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
