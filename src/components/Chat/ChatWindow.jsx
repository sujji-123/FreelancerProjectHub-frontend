import { useState } from "react";


export default function ChatWindow() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");


    const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { text: input, sender: "me" }]);
    setInput("");
    };


    return (
        <div className="border rounded-lg p-4 flex flex-col h-80">
            <div className="flex-1 overflow-y-auto space-y-2 mb-2">
                {messages.map((msg, idx) => (
                <p key={idx} className={`p-2 rounded ${msg.sender === "me" ? "bg-blue-100 self-end" : "bg-gray-100"}`}>
                {msg.text}
                </p>
                ))}
            </div>
            <div className="flex space-x-2">
                <input
                className="flex-1 border rounded p-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                />
                <button onClick={sendMessage} className="bg-blue-500 text-white px-3 py-1 rounded">Send</button>
            </div>
        </div>
    );
}
// src/components/Chat/ChatWindow.jsx