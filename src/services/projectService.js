// src/services/projectService.js

import axios from 'axios';

const API_URL = '/api/projects'; // Using relative path for Nginx

// Function to get all projects (for freelancer browsing)
export const getProjects = () => {
    const token = localStorage.getItem('token');
    return axios.get(API_URL, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Function for a client to get ONLY their own projects
export const getMyProjects = () => {
    const token = localStorage.getItem('token');
    // This route should be configured on your backend to return projects for the logged-in user
    return axios.get(`${API_URL}/my-projects`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Function to get a single project by its ID
export const getProjectById = (projectId) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/${projectId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Function to accept a proposal for a project
export const acceptProposal = (projectId, proposalId) => {
    const token = localStorage.getItem('token');
    return axios.put(`${API_URL}/${projectId}/accept-proposal`, { proposalId }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};