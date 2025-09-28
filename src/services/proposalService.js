// src/services/proposalService.js

import axios from 'axios';

const API_URL = '/api/proposals'; // Using relative path for Nginx

// For Client: Get all proposals for their projects
export const getClientProposals = () => {
    const token = localStorage.getItem('token');
    return axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

// For Client: Accept a specific proposal
export const acceptProposal = (proposalId) => {
    const token = localStorage.getItem('token');
    return axios.put(`${API_URL}/${proposalId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

// For Client: Reject a specific proposal
export const rejectProposal = (proposalId) => {
    const token = localStorage.getItem('token');
    return axios.put(`${API_URL}/${proposalId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

// For Freelancer: Get all proposals they have submitted
export const getFreelancerProposals = () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/my-proposals`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

// For Freelancer: Create a new proposal
export const createProposal = (proposalData) => {
    const token = localStorage.getItem('token');
    return axios.post(API_URL, proposalData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

// For Freelancer: Withdraw a submitted proposal
export const withdrawProposal = (proposalId) => {
    const token = localStorage.getItem('token');
    return axios.delete(`${API_URL}/${proposalId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

// For Project Page: Get all proposals for a specific project
export const getProposalsForProject = (projectId) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};