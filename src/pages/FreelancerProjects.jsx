// src/pages/FreelancerProjects.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../services/projectService';
import { createProposal, getFreelancerProposals, withdrawProposal } from '../services/proposalService';
import { toast } from 'react-toastify';

const readUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
};

export default function FreelancerProjects() {
  const navigate = useNavigate();
  const [user] = useState(readUser());
  const [projects, setProjects] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [applyFor, setApplyFor] = useState(null); // project object
  const [bidAmount, setBidAmount] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'freelancer') {
      navigate('/login', { replace: true });
      return;
    }
    (async () => {
      try {
        const [projectRes, proposalRes] = await Promise.all([
          getProjects(),
          getFreelancerProposals(),
        ]);
        setProjects(projectRes.data || []);
        setProposals(proposalRes.data || []);
      } catch (e) {
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    })();
  }, [user, navigate]);

  const openProjects = useMemo(
    () => projects.filter(p => (p.status || 'open') === 'open'),
    [projects]
  );

  const submitProposal = async (e) => {
    e.preventDefault();
    if (!applyFor) return;

    if (!bidAmount || !coverLetter.trim()) {
      toast.error('Please enter bid amount and cover letter.');
      return;
    }

    try {
      await createProposal({
        projectId: applyFor._id,
        bidAmount: Number(bidAmount),
        coverLetter: coverLetter.trim(),
      });
      toast.success('Proposal submitted!');
      const res = await getFreelancerProposals();
      setProposals(res.data || []);
      setApplyFor(null);
      setBidAmount('');
      setCoverLetter('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit proposal');
    }
  };

  const handleWithdrawProposal = async (proposalId) => {
    if (window.confirm('Are you sure you want to withdraw this proposal?')) {
      try {
        await withdrawProposal(proposalId);
        toast.success('Proposal withdrawn');
        const res = await getFreelancerProposals();
        setProposals(res.data || []);
      } catch (err) {
        toast.error(err.response?.data?.msg || 'Failed to withdraw proposal.');
      }
    }
  };

  if (loading) {
    return <div className="p-6">Loading projects…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Browse Projects</h1>

        {openProjects.length === 0 ? (
          <p>No open projects yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {openProjects.map(p => {
              const myProposal = proposals.find(pr => String(pr.project && (pr.project._id || pr.project)) === String(p._id));
              return (
                <div key={p._id} className="bg-white rounded-2xl shadow p-4">
                  <h2 className="text-lg font-semibold">{p.title}</h2>
                  <p className="text-gray-600 whitespace-pre-line mt-1">{p.description}</p>
                  <div className="text-sm text-gray-500 mt-2">Budget: ${p.budget}</div>
                  <div className="mt-3">
                    {(() => {
                      if (myProposal) {
                        if (myProposal.status === "pending") {
                          return (
                            <div className="flex flex-row gap-2">
                              <button disabled className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium">Applied</button>
                              <button onClick={() => handleWithdrawProposal(myProposal._id)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Withdraw</button>
                            </div>
                          );
                        }
                        if (myProposal.status === "accepted") {
                          return (<button disabled className="w-full bg-green-100 text-green-700 py-2 rounded-lg font-medium">Accepted ✅</button>);
                        }
                        if (myProposal.status === "rejected") {
                          return (<button disabled className="w-full bg-red-100 text-red-700 py-2 rounded-lg font-medium">Rejected ❌</button>);
                        }
                        // Fallback for any other status
                        return (<button disabled className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg font-medium">{myProposal.status}</button>);
                      }
                      return (
                        <button
                          className="px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                          onClick={() => setApplyFor(p)}
                        >
                          Apply
                        </button>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {applyFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow p-6">
            <h3 className="text-xl font-semibold mb-2">Apply to: {applyFor.title}</h3>
            <form onSubmit={submitProposal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bid Amount (USD)</label>
                <input
                  type="number"
                  min="1"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  placeholder="e.g., 1200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cover Letter</label>
                <textarea
                  rows={6}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  placeholder="Explain why you’re a great fit…"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-gray-200"
                  onClick={() => setApplyFor(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}