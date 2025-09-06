// src/Pages/ProjectDashboard.jsx
import React from "react";
import ProjectCollab from "./ProjectCollab";

export default function ProjectDashboard() {
  // ⛔ Ignore useParams and localStorage for now
  // const { id } = useParams();
  // const user = JSON.parse(localStorage.getItem("user"));

  // ✅ Hardcoded values for testing
  const projectId = "64f12ab45d6c8e90f7d12c34"; // replace with a real project _id from MongoDB
  const userId = "64f12ab45d6c8e90f7d12c77";   // replace with a real user _id from MongoDB

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Project Collaboration</h1>
      <ProjectCollab projectId={projectId} userId={userId} />
    </div>
  );
}
