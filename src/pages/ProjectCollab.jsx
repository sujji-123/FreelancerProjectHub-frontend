// src/Pages/ProjectCollab.jsx
import React, { useState, useEffect } from "react";
import { createTask, getTasksByProject, updateTask, deleteTask } from "../services/taskService";
import { uploadDeliverable, getDeliverablesByProject } from "../services/deliverableService";
import { createMessage, getMessagesByProject } from "../services/messageService";
import { io } from "socket.io-client";

// ✅ Force WebSocket transport
const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5001", {
  transports: ["websocket"],
  withCredentials: true,
});

const ProjectCollab = ({ projectId, userId }) => {
  const [tasks, setTasks] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState(null);

  // --- Load Data ---
  useEffect(() => {
    if (!projectId) return;
    socket.emit("joinProject", projectId);

    fetchData();

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("newMessage");
  }, [projectId]);

  const fetchData = async () => {
    const tasksRes = await getTasksByProject(projectId);
    setTasks(tasksRes);

    const delRes = await getDeliverablesByProject(projectId);
    setDeliverables(delRes);

    const msgRes = await getMessagesByProject(projectId);
    setMessages(msgRes);
  };

  // --- Task ---
  const handleAddTask = async () => {
    if (!newTask) return;
    const task = await createTask({ project_id: projectId, title: newTask });
    setTasks([...tasks, task]);
    setNewTask("");
  };

  const handleUpdateTask = async (id, updates) => {
    const updated = await updateTask(id, updates);
    setTasks(tasks.map((t) => (t._id === id ? updated : t)));
  };

  const handleDeleteTask = async (id) => {
    await deleteTask(id);
    setTasks(tasks.filter((t) => t._id !== id));
  };

  // --- Deliverable ---
  const handleUploadDeliverable = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_id", projectId);
    formData.append("uploaded_by", userId);

    const uploaded = await uploadDeliverable(formData);
    setDeliverables([...deliverables, uploaded]);
    setFile(null);
  };

  // --- Message ---
  const handleSendMessage = async () => {
    if (!newMessage) return;
    const msg = await createMessage({ project_id: projectId, sender_id: userId, content: newMessage });
    socket.emit("sendMessage", { projectId, message: msg });
    setNewMessage("");
  };

  return (
    <div className="p-4 grid gap-6 grid-cols-1 md:grid-cols-3">
      {/* Tasks */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-lg font-bold mb-2">Tasks</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="border rounded p-2 flex-1"
            placeholder="New Task"
          />
          <button onClick={handleAddTask} className="bg-blue-500 text-white px-3 rounded">
            Add
          </button>
        </div>
        <ul>
          {tasks.map((task) => (
            <li key={task._id} className="flex justify-between items-center border-b py-2">
              <span>
                {task.title} - <em>{task.status}</em>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateTask(task._id, { status: "Done" })}
                  className="text-green-600"
                >
                  ✔
                </button>
                <button onClick={() => handleDeleteTask(task._id)} className="text-red-600">
                  ✖
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Deliverables */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-lg font-bold mb-2">Deliverables</h2>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUploadDeliverable} className="bg-green-500 text-white px-3 py-1 rounded ml-2">
          Upload
        </button>
        <ul className="mt-3">
          {deliverables.map((d) => (
            <li key={d._id} className="border-b py-2">
              <a href={d.file_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                {d.description || d.file_url}
              </a>
              <span className="ml-2">[{d.status}]</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Messages */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-lg font-bold mb-2">Messages</h2>
        <div className="h-64 overflow-y-auto border p-2 mb-2 rounded">
          {messages.map((m) => (
            <div key={m._id} className="mb-1">
              <strong>{m.sender_id?.name || "User"}:</strong> {m.content}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="border rounded p-2 flex-1"
            placeholder="Type message..."
          />
          <button onClick={handleSendMessage} className="bg-blue-500 text-white px-3 rounded">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCollab;
