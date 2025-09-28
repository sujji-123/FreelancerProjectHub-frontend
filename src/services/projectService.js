// src/services/projectService.js

import axios from 'axios';

const API_URL = '/api/projects'; // Using relative path for Nginx

// For Freelancer: Get all available projects for browsing
export const getProjects = () => {
    const token = localStorage.getItem('token');
    return axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

// For Client: Get only the projects they have created
export const getMyProjects = () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/my-projects`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

// For Client: Create/Post a new project
export const createProject = (projectData) => {
    const token = localStorage.getItem('token');
    return axios.post(API_URL, projectData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

// Get a single project by its unique ID
export const getProjectById = (projectId) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

// Accept a proposal for a project
export const acceptProposal = (projectId, proposalId) => {
    const token = localStorage.getItem('token');
    return axios.put(`${API_URL}/${projectId}/accept-proposal`, { proposalId }, {
        headers: { Authorization: `Bearer ${token}` }
    });
};