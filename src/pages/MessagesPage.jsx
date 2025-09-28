// src/pages/MessagesPage.jsx
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

    const updateConversationsList = (message) => {
        setConversations(prev => {
            const otherUser = message.sender._id === currentUser.id ? message.receiver : message.sender;
            
            const otherConversations = prev.filter(c => c.user._id !== otherUser._id);
            const updatedConversation = {
                user: otherUser,
                lastMessage: message,
                unreadCount: 0 // Assume read since user is on the page
            };
            
            return [updatedConversation, ...otherConversations];
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, conversationsRes] = await Promise.all([
                    getAllUsers(),
                    getConversations()
                ]);
                
                const usersData = usersRes.data || usersRes;
                const conversationsData = conversationsRes.data || conversationsRes;
                
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
        } else {
            setMessages([]);
        }
    }, [selectedUser]);
    
    useEffect(() => {
        if (!socket) return;
        
        const handleNewMessage = (message) => {
            if (selectedUser && (message.sender._id === selectedUser._id || message.receiver._id === selectedUser._id)) {
                setMessages(prev => [...prev, message]);
            }
            updateConversationsList(message);
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
            updateConversationsList(newMessageData);
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };
    
    const handleSelectUser = (user) => {
        setSelectedUser(user);
        if (!conversations.some(c => c.user._id === user._id)) {
            setConversations(prev => [{ user, lastMessage: null, unreadCount: 0 }, ...prev]);
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
        return <div className="flex h-screen bg-gray-100 items-center justify-center"><p>Loading messages...</p></div>;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className={`${selectedUser ? 'hidden' : 'flex'} md:flex flex-col w-full md:w-1/3 lg:w-1/4 bg-white border-r overflow-y-auto`}>
                <div className="p-4 border-b">
                    <Link to={currentUser.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard'} className="text-indigo-600 flex items-center gap-2">
                        <FaArrowLeft /> Back to Dashboard
                    </Link>
                    <h2 className="text-xl font-bold mt-4">Conversations</h2>
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
                
                <div className="p-2">
                    <h3 className="font-semibold text-gray-700 mb-2">Recent Conversations</h3>
                    {filteredConversations.length > 0 ? (
                        filteredConversations.map(conv => (
                            <div
                                key={conv.user._id}
                                onClick={() => handleSelectUser(conv.user)}
                                className={`p-3 cursor-pointer hover:bg-gray-50 rounded-lg mb-2 ${selectedUser?._id === conv.user._id ? 'bg-indigo-50 border border-indigo-200' : ''}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mr-3 flex-shrink-0">
                                            {conv.user.profilePicture ? (
                                                <img src={B.user.profilePicture} alt={conv.user.name} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <span>{conv.user.name?.charAt(0).toUpperCase() || 'U'}</span>
                                            )}
                                        </div>
                                        <div className="truncate">
                                            <p className="font-semibold truncate">{conv.user.name || 'Unknown User'}</p>
                                            {conv.lastMessage?.content ? (
                                                <p className="text-sm text-gray-600 truncate">
                                                    {conv.lastMessage.content}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-gray-400 italic">No messages yet</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm p-3">No recent conversations</p>
                    )}
                </div>

                <div className="p-2 border-t">
                    <h3 className="font-semibold text-gray-700 mb-2">All Users</h3>
                    {filteredUsers.map(user => (
                        <div key={user._id} onClick={() => handleSelectUser(user)} className={`p-3 cursor-pointer hover:bg-gray-50 rounded-lg mb-2 ${selectedUser?._id === user._id ? 'bg-indigo-50 border border-indigo-200' : ''}`}>
                             <div className="flex items-center">
                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mr-3 flex-shrink-0">
                                    {user.profilePicture ? (<img src={B.user.profilePicture} alt={user.name} className="w-10 h-10 rounded-full object-cover" />) : (<span>{user.name?.charAt(0).toUpperCase() || 'U'}</span>)}
                                </div>
                                <div className="truncate">
                                    <p className="font-semibold truncate">{user.name || 'Unknown User'}</p>
                                    <p className="text-sm text-gray-500">{user.role || 'user'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            <main className={`${selectedUser ? 'flex' : 'hidden'} md:flex flex-1 flex-col`}>
                {selectedUser ? (
                    <>
                        <header className="bg-white p-4 border-b flex items-center">
                             <button onClick={() => setSelectedUser(null)} className="md:hidden mr-4 text-gray-600">
                                 <FaArrowLeft />
                             </button>
                             <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mr-3 flex-shrink-0">
                                {selectedUser.profilePicture ? (<img src={B.user.profilePicture} alt={selectedUser.name} className="w-10 h-10 rounded-full object-cover" />) : (<span>{selectedUser.name?.charAt(0).toUpperCase() || 'U'}</span>)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{selectedUser.name || 'Unknown User'}</h2>
                                <p className="text-sm text-gray-500">{selectedUser.role || 'user'}</p>
                            </div>
                        </header>
                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                            {messages.map(msg => (
                                <div key={msg._id} className={`flex ${msg.sender?._id === currentUser.id ? 'justify-end' : 'justify-start'} mb-4`}>
                                    <div className={`rounded-lg px-4 py-2 max-w-lg ${msg.sender?._id === currentUser.id ? 'bg-indigo-500 text-white' : 'bg-white border border-gray-200 text-black'}`}>
                                        <p className="font-bold text-sm">{msg.sender.name}</p>
                                        <p>{msg.content}</p>
                                        <p className="text-xs text-right opacity-75 mt-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="bg-white p-4 border-t flex">
                            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Type a message..." className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            <button onClick={handleSendMessage} className="ml-3 bg-indigo-500 text-white p-3 rounded-full hover:bg-indigo-600 transition-colors" disabled={!newMessage.trim()}><FaPaperPlane /></button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500"><p>Select a user to start a conversation.</p></div>
                )}
            </main>
        </div>
    );
}
