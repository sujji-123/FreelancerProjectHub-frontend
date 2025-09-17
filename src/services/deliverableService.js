// src/services/deliverableService.js
import api from "./api"; // FIX: Import the configured api instance

export const uploadDeliverable = async (formData) => {
  // FIX: Use the 'api' instance
  const res = await api.post(`/deliverables`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getDeliverablesByProject = async (projectId) => {
  // FIX: Use the 'api' instance
  const res = await api.get(`/deliverables/project/${projectId}`);
  return res.data; // Note: The actual data is in res.data
};

export const updateDeliverable = async (id, updates) => {
  // FIX: Use the 'api' instance
  const res = await api.put(`/deliverables/${id}`, updates);
  return res.data;
};