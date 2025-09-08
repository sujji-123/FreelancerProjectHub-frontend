// src/services/proposalService.js
import api from "./api";

// Freelancer submits proposal
export const createProposal = (payload) => api.post("/proposals", payload);

// Client fetches proposals for their projects
export const getClientProposals = () => api.get("/proposals/client");

// Client accepts / rejects proposals
export const acceptProposal = (id) => api.patch(`/proposals/${id}/accept`);
export const rejectProposal = (id) => api.patch(`/proposals/${id}/reject`);

export default { createProposal, getClientProposals, acceptProposal, rejectProposal };
