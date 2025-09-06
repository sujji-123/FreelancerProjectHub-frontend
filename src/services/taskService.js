// src/services/taskService.js
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const createTask = async (taskData) => {
  const res = await axios.post(`${API}/tasks`, taskData);
  return res.data;
};

export const getTasksByProject = async (projectId) => {
  const res = await axios.get(`${API}/tasks/project/${projectId}`);
  return res.data;
};

export const updateTask = async (id, updates) => {
  const res = await axios.put(`${API}/tasks/${id}`, updates);
  return res.data;
};

export const deleteTask = async (id) => {
  const res = await axios.delete(`${API}/tasks/${id}`);
  return res.data;
};

