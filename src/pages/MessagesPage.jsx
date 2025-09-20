import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FaPaperPlane, FaArrowLeft, FaSearch } from 'react-icons/fa';
import { getAllUsers } from '../services/userService';
import { getDirectMessages, createDirectMessage, getConversations } from '../services/messageService';
import { useSocket } from '../context/SocketContext';

const readUser = () => {
    try {
        const token = localStorage.getItem("token");
        if (token) {
            const dec = jwtDecode(token);
            return dec.user || { id: dec.id, role: dec.role };
        }
    } catch (err) { /* ignore */ }
    return null;
};

export default function MessagesPage() {
    const [currentUser] = useState(readUser());
    const [users, setUsers] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const socket = useSocket();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, conversationsRes] = await Promise.all([
                    getAllUsers(),
                    getConversations()
                ]);
                
                // FIX: Handle different response structures
                const usersData = usersRes.data || usersRes;
                const conversationsData = conversationsRes.data || conversationsRes;
                
                // Exclude current user from the list
                setUsers(Array.isArray(usersData) ? usersData.filter(u => u._id !== currentUser.id) : []);
                setConversations(Array.isArray(conversationsData) ? conversationsData : []);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUser.id]);

    useEffect(() => {
        if (selectedUser) {
            const fetchMessages = async () => {
                try {
                    const res = await getDirectMessages(selectedUser._id);
                    const messagesData = res.data || res;
                    setMessages(Array.isArray(messagesData) ? messagesData : []);
                } catch (error) {
                    console.error("Failed to fetch messages", error);
                }
            };
            fetchMessages();
        }
    }, [selectedUser]);
    
    // Socket.io listener for new messages
    useEffect(() => {
        if (!socket) return;
        
        const handleNewMessage = (message) => {
            // Add message only if it's part of the current conversation
            if (selectedUser && 
                (message.sender._id === selectedUser._id || message.receiver._id === selectedUser._id)) {
                setMessages(prev => [...prev, message]);
            }
            
            // Update conversations list with new message
            setConversations(prev => {
                const otherUserId = message.sender._id === currentUser.id 
                    ? message.receiver._id 
                    : message.sender._id;
                
                const existingConv = prev.find(conv => conv.user._id === otherUserId);
                if (existingConv) {
                    return [
                        { ...existingConv, lastMessage: message },
                        ...prev.filter(conv => conv.user._id !== otherUserId)
                    ];
                }
                return prev;
            });
        };

        socket.on('directMessageCreated', handleNewMessage);

        return () => {
            socket.off('directMessageCreated');
        };
    }, [socket, selectedUser, currentUser.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedUser) return;
        try {
            const messageData = {
                receiver: selectedUser._id,
                content: newMessage,
            };
            const res = await createDirectMessage(messageData);
            const newMessageData = res.data || res;
            setMessages([...messages, newMessageData]);
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    const filteredUsers = Array.isArray(users) ? users.filter(user => 
        user._id !== currentUser.id &&
        user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const filteredConversations = Array.isArray(conversations) ? conversations.filter(conv =>
        conv.user && conv.user.name && conv.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-100 items-center justify-center">
                <p>Loading messages...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* User List Sidebar */}
            <aside className="w-1/3 md:w-1/4 bg-white border-r overflow-y-auto">
                <div className="p-4 border-b">
                    <Link to={currentUser.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard'} className="text-indigo-600 flex items-center gap-2">
                        <FaArrowLeft /> Back to Dashboard
                    </Link>
                    <h2 className="text-xl font-bold mt-4">Conversations</h2>
                    
                    {/* Search Bar */}
                    <div className="mt-3 relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-lg w-full"
                        />
                    </div>
                </div>
                
                {/* Conversations List */}
                <div className="p-2">
                    <h3 className="font-semibold text-gray-700 mb-2">Recent Conversations</h3>
                    {filteredConversations.length > 0 ? (
                        filteredConversations.map(conv => (
                            <div
                                key={conv.user._id}
                                onClick={() => setSelectedUser(conv.user)}
                                className={`p-3 cursor-pointer hover:bg-gray-50 rounded-lg mb-2 ${selectedUser?._id === conv.user._id ? 'bg-indigo-50 border border-indigo-200' : ''}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mr-3">
                                            {conv.user.profilePicture ? (
                                                <img src={`http://localhost:5001/${conv.user.profilePicture}`} alt={conv.user.name} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <span>{conv.user.name?.charAt(0).toUpperCase() || 'U'}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{conv.user.name || 'Unknown User'}</p>
                                            <p className="text-sm text-gray-500">{conv.user.role || 'user'}</p>
                                        </div>
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                                {conv.lastMessage && (
                                    <p className="text-sm text-gray-600 mt-1 truncate">
                                        {conv.lastMessage.content?.substring(0, 30)}...
                                    </p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm p-3">No conversations yet</p>
                    )}
                </div>

                {/* All Users List */}
                <div className="p-2 border-t">
                    <h3 className="font-semibold text-gray-700 mb-2">All Users</h3>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <div
                                key={user._id}
                                onClick={() => setSelectedUser(user)}
                                className={`p-3 cursor-pointer hover:bg-gray-50 rounded-lg mb-2 ${selectedUser?._id === user._id ? 'bg-indigo-50 border border-indigo-200' : ''}`}
                            >
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mr-3">
                                        {user.profilePicture ? (
                                            <img src={`http://localhost:5001/${user.profilePicture}`} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <span>{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{user.name || 'Unknown User'}</p>
                                        <p className="text-sm text-gray-500">{user.role || 'user'}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm p-3">No users found</p>
                    )}
                </div>
            </aside>

            {/* Chat Area */}
            <main className="flex-1 flex flex-col">
                {selectedUser ? (
                    <>
                        <header className="bg-white p-4 border-b flex items-center">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mr-3">
                                {selectedUser.profilePicture ? (
                                    <img src={`http://localhost:5001/${selectedUser.profilePicture}`} alt={selectedUser.name} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <span>{selectedUser.name?.charAt(0).toUpperCase() || 'U'}</span>
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{selectedUser.name || 'Unknown User'}</h2>
                                <p className="text-sm text-gray-500">{selectedUser.role || 'user'}</p>
                            </div>
                        </header>
                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                            {messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <p>No messages yet. Start a conversation!</p>
                                </div>
                            ) : (
                                messages.map(msg => (
                                    <div key={msg._id} className={`flex ${msg.sender._id === currentUser.id ? 'justify-end' : 'justify-start'} mb-4`}>
                                        <div className={`rounded-lg px-4 py-2 max-w-lg ${msg.sender._id === currentUser.id ? 'bg-indigo-500 text-white' : 'bg-white border border-gray-200 text-black'}`}>
                                            <p className="font-bold text-sm">{msg.sender.name}</p>
                                            <p>{msg.content}</p>
                                            <p className="text-xs text-right opacity-75 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="bg-white p-4 border-t flex">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button 
                                onClick={handleSendMessage} 
                                className="ml-3 bg-indigo-500 text-white p-3 rounded-full hover:bg-indigo-600 transition-colors"
                                disabled={!newMessage.trim()}
                            >
                                <FaPaperPlane />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <p>Select a user to start a conversation.</p>
                    </div>
                )}
            </main>
        </div>
    );
}