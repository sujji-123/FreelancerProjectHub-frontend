import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { createDirectMessage } from '../../services/messageService';
import { useSocket } from '../../context/SocketContext';

export default function ChatWindow({ receiver, currentUser }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const socket = useSocket();

    useEffect(() => {
        if (socket && receiver) {
            // Join user room for direct messages
            socket.emit('joinUser', { userId: currentUser.id });
            
            const handleNewMessage = (message) => {
                if (message.sender._id === receiver._id || message.receiver._id === receiver._id) {
                    setMessages(prev => [...prev, message]);
                }
            };

            socket.on('directMessageCreated', handleNewMessage);

            return () => {
                socket.off('directMessageCreated', handleNewMessage);
            };
        }
    }, [socket, receiver, currentUser.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || !receiver) return;
        
        try {
            const messageData = {
                receiver: receiver._id,
                content: input,
            };
            const res = await createDirectMessage(messageData);
            setMessages([...messages, res.data]);
            setInput("");
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    if (!receiver) {
        return (
            <div className="border rounded-lg p-4 flex flex-col h-80 items-center justify-center text-gray-500">
                <p>Select a user to start chatting</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg p-4 flex flex-col h-80">
            <div className="border-b pb-2 mb-2">
                <h3 className="font-semibold">Chat with {receiver.name}</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 mb-2">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender._id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-lg px-3 py-2 max-w-xs ${msg.sender._id === currentUser.id ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-black'}`}>
                            <p className="text-sm font-semibold">{msg.sender.name}</p>
                            <p>{msg.content}</p>
                            <p className="text-xs opacity-75 mt-1 text-right">
                                {new Date(msg.createdAt).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            
            <div className="flex space-x-2">
                <input
                    className="flex-1 border rounded p-2"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                />
                <button 
                    onClick={sendMessage} 
                    className="bg-indigo-500 text-white px-3 py-2 rounded flex items-center"
                    disabled={!input.trim()}
                >
                    <FaPaperPlane className="mr-1" /> Send
                </button>
            </div>
        </div>
    );
}