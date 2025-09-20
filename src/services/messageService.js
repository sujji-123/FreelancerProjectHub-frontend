import api from "./api";

export const createMessage = async (messageData) => {
  const res = await api.post(`/messages`, messageData);
  return res.data;
};

export const getMessagesByProject = async (projectId) => {
  const res = await api.get(`/messages/project/${projectId}`);
  return res.data;
};

// ADDED: Direct message functions
export const getDirectMessages = async (userId) => {
  const res = await api.get(`/messages/direct/${userId}`);
  return res.data;
};

export const createDirectMessage = async (messageData) => {
  const res = await api.post(`/messages/direct`, messageData);
  return res.data;
};

// ADDED: Get conversations
export const getConversations = async () => {
  const res = await api.get(`/messages/conversations`);
  return res.data;
};

// ADDED: Get messages between users (for backward compatibility)
export const getMessagesBetweenUsers = async (userId) => {
  return getDirectMessages(userId);
};