import api from "./api";

export const createProject = (payload) => api.post("/projects", payload);
export const getProjects = () => api.get("/projects");
export const getMyProjects = () => api.get("/projects/my-projects");
export const deleteProject = (id) => api.delete(`/projects/${id}`);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
// --- NEW FUNCTION ADDED ---
export const getProjectById = (id) => api.get(`/projects/${id}`);

export default { 
    createProject, 
    getProjects, 
    getMyProjects, 
    deleteProject, 
    updateProject,
    getProjectById // EXPORTED
};