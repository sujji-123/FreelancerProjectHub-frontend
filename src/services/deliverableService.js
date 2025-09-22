// src/services/deliverableService.js
import api from "./api";

export const uploadDeliverable = async (formData) => {
  const res = await api.post(`/deliverables`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getDeliverablesByProject = async (projectId) => {
  const res = await api.get(`/deliverables/project/${projectId}`);
  return res.data;
};

export const updateDeliverable = async (id, updates) => {
  const res = await api.put(`/deliverables/${id}`, updates);
  return res.data;
};

export const deleteDeliverable = async (id) => {
  const res = await api.delete(`/deliverables/${id}`);
  return res.data;
};