// src/services/deliverableService.js
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const uploadDeliverable = async (formData) => {
  const res = await axios.post(`${API}/deliverables`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getDeliverablesByProject = async (projectId) => {
  const res = await axios.get(`${API}/deliverables/project/${projectId}`);
  return res.data;
};

export const updateDeliverable = async (id, updates) => {
  const res = await axios.put(`${API}/deliverables/${id}`, updates);
  return res.data;
};
