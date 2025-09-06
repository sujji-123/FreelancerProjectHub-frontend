// src/services/proposalService.js
import api from './api';

// freelancer applies to a project
export const createProposal = (payload) => api.post('/proposals', payload);

// list proposals (optional, for client review pages later)
export const getProposals = () => api.get('/proposals');
