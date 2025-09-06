import api from "./api";

// ✅ Create new project (client)
export const createProject = (payload) => api.post("/projects", payload);

// ✅ List all projects
export const getProjects = () => api.get("/projects");

// ✅ Fetch my projects
export const getMyProjects = () => api.get("/projects/my-projects");

// ✅ Delete a project by ID
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// ✅ Update a project by ID (e.g., status, title, description)
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);

export default {
  createProject,
  getProjects,
  getMyProjects,
  deleteProject,
  updateProject,
};
