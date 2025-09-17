// src/services/messageService.js
import api from "./api"; // FIX: Import the configured api instance

export const createMessage = async (messageData) => {
  // FIX: Use the 'api' instance which includes the auth token
  const res = await api.post(`/messages`, messageData);
  return res.data;
};

export const getMessagesByProject = async (projectId) => {
  // FIX: Use the 'api' instance
  const res = await api.get(`/messages/project/${projectId}`);
  return res.data; // Note: The actual data is in res.data, not res itself
};