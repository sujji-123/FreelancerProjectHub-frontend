// src/services/proposalService.js
import api from "./api";

// Freelancer submits proposal
export const createProposal = (payload) => api.post("/proposals", payload);

// Client fetches proposals for their projects
export const getClientProposals = () => api.get("/proposals/client");

// Freelancer fetches their own proposals
export const getFreelancerProposals = () => api.get("/proposals/freelancer");

// Client accepts / rejects proposals
export const acceptProposal = (id) => api.patch(`/proposals/${id}/accept`);
export const rejectProposal = (id) => api.patch(`/proposals/${id}/reject`);
export const withdrawProposal = (id) => api.delete(`/proposals/${id}/withdraw`);

export default {
  createProposal,
  getClientProposals,
  getFreelancerProposals,
  acceptProposal,
  rejectProposal,
  withdrawProposal,
};