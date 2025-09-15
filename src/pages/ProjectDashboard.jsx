// src/pages/ProjectDashboard.jsx
import React, { useEffect, useState } from "react";
import ProjectCard from "../components/Projects/ProjectCard";
import projectService from "../services/projectService";
import proposalService from "../services/proposalService";
import { toast } from "react-toastify";

export default function ProjectDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // read current user
  const readUser = () => {
    try {
      const u = localStorage.getItem("user");
      if (u) return JSON.parse(u);
    } catch (err) {
      // ignore
    }
    return null;
  };
  const user = readUser();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectService.getProjects();
      setProjects(res.data || []);
    } catch (err) {
      console.error("fetchProjects:", err);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleApply = async (projectId) => {
    try {
      // payload minimal; you can extend coverLetter/bidAmount UI later
      const payload = { projectId, coverLetter: "", bidAmount: 0 };
      const res = await proposalService.createProposal(payload);
      toast.success("Proposal sent!");
      // Optionally refresh projects or UI
    } catch (err) {
      console.error("apply err:", err);
      toast.error(err?.response?.data?.msg || "Failed to apply");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Marketplace — Open Projects</h1>
      {loading ? (
        <div>Loading projects…</div>
      ) : projects.length === 0 ? (
        <div>No open projects yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              user={user}
              onApply={() => handleApply(project._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
