// src/pages/client/ProposalReviewPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import proposalService from '../../services/proposalService';
import { toast } from 'react-toastify';

export default function ProposalReviewPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await proposalService.getClientProposals();
        const filtered = res.data.filter(p => p.projectId === projectId);
        setProposals(filtered);
      } catch (err) {
        toast.error('Failed to load proposals.');
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, [projectId]);

  const handleAccept = async (id) => {
    try {
      await proposalService.acceptProposal(id);
      toast.success('Proposal accepted.');
      // Refresh list
      setProposals(p => p.map(item => item._id === id ? {...item, status: 'accepted'} : item));
    } catch {
      toast.error('Failed to accept proposal.');
    }
  };

  const handleReject = async (id) => {
    try {
      await proposalService.rejectProposal(id);
      toast.success('Proposal rejected.');
      setProposals(p => p.map(item => item._id === id ? {...item, status: 'rejected'} : item));
    } catch {
      toast.error('Failed to reject proposal.');
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading proposals...</div>;
  }

  if (proposals.length === 0) {
    return (
      <div className="p-6">
        <p>No proposals found for this project.</p>
        <Link to="/client/proposals" className="text-blue-600 hover:underline">Back to Proposals</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Review Proposals for Project</h1>
      <ul className="divide-y divide-gray-300">
        {proposals.map(p => (
          <li key={p._id} className="py-4">
            <p><strong>Freelancer:</strong> {p.freelancerName || 'N/A'}</p>
            <p><strong>Status:</strong> {p.status}</p>
            <div className="space-x-4 mt-2">
              {p.status === 'pending' && (
                <>
                  <button onClick={() => handleAccept(p._id)} className="px-3 py-1 bg-green-600 text-white rounded">Accept</button>
                  <button onClick={() => handleReject(p._id)} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
                </>
              )}
              {p.status !== 'pending' && <span>Decision made</span>}
            </div>
          </li>
        ))}
      </ul>
      <button onClick={() => navigate(-1)} className="mt-6 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Back</button>
    </div>
  );
}
