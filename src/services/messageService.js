// src/services/messageService.js
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const createMessage = async (messageData) => {
  const res = await axios.post(`${API}/messages`, messageData);
  return res.data;
};

export const getMessagesByProject = async (projectId) => {
  const res = await axios.get(`${API}/messages/project/${projectId}`);
  return res.data;
};
