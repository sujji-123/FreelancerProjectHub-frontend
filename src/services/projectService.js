// src/services/projectService.js
import api from "./api";

// create new project (client)
export const createProject = (payload) => api.post("/projects", payload);

// list all projects
export const getProjects = () => api.get("/projects");

// fetch my projects (client)
export const getMyProjects = () => api.get("/projects/my-projects");

// delete a project by ID
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// update a project by ID (partial updates)
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);

export default {
  createProject,
  getProjects,
  getMyProjects,
  deleteProject,
  updateProject,
};
