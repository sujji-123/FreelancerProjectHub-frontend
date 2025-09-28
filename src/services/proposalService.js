// src/services/proposalService.js

import axios from 'axios';

// The BASE_URL is removed. We now use relative paths.
const API_URL = '/api/proposals';

// Function to get all proposals for a specific project
export const getProposalsForProject = (projectId) => {
    const token = localStorage.getItem('token');
    // The URL is now just /api/proposals/project/:projectId
    return axios.get(`${API_URL}/project/${projectId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Other functions are also updated
export const submitProposal = (proposalData) => {
    const token = localStorage.getItem('token');
    return axios.post(API_URL, proposalData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const getMyProposals = () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/my-proposals`, {
         headers: {
            Authorization: `Bearer ${token}`
        }
    });
};