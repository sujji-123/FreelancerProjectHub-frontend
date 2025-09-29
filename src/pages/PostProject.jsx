// src/pages/PostProject.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../services/projectService';
import { toast } from 'react-toastify';

const readUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
};

export default function PostProject() {
  const navigate = useNavigate();
  const [user, setUser] = useState(readUser());
  const [form, setForm] = useState({ title: '', description: '', budget: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'client') navigate('/login', { replace: true });
  }, [user, navigate]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.budget) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await createProject({
        title: form.title.trim(),
        description: form.description.trim(),
        budget: Number(form.budget),
      });
      toast.success('Project posted!');
      navigate('/client/my-projects'); // you can route anywhere you like
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to post project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">Post a New Project</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              className="w-full border rounded-lg p-2"
              placeholder="e.g., Sure Trust Final Project Idea 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={6}
              className="w-full border rounded-lg p-2"
              placeholder="Explain the project scope, deliverables, skills required…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Budget (USD)</label>
            <input
              type="number"
              name="budget"
              value={form.budget}
              onChange={onChange}
              className="w-full border rounded-lg p-2"
              placeholder="2500"
              min="1"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Posting…' : 'Post Project'}
          </button>
        </form>
      </div>
    </div>
  );
}
