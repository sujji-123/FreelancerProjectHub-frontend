// src/services/taskService.js
import api from "./api"; // use configured axios instance that attaches token automatically

export const createTask = async (taskData) => {
  const res = await api.post(`/tasks`, taskData);
  return res.data;
};

export const getTasksByProject = async (projectId) => {
  const res = await api.get(`/tasks/project/${projectId}`);
  return res.data;
};

export const updateTask = async (id, updates) => {
  const res = await api.put(`/tasks/${id}`, updates);
  return res.data;
};

export const deleteTask = async (id) => {
  const res = await api.delete(`/tasks/${id}`);
  return res.data;
};
