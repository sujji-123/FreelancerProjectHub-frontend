import { useEffect, useState } from "react";
import projectService from "../../services/projectService";


export default function MyProjects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectService.getMyProjects();
        setProjects(res.data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    fetchProjects();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await projectService.deleteProject(id);
      setProjects(projects.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await projectService.updateProject(id, { status });
      setProjects(
        projects.map((p) => (p._id === id ? { ...p, status: res.data.status } : p))
      );
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Projects</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project._id}
            className="bg-white rounded-2xl shadow p-5 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <p className="text-sm text-gray-500">
                Status:{" "}
                <span
                  className={`font-medium ${
                    project.status === "completed"
                      ? "text-green-600"
                      : project.status === "under work"
                      ? "text-yellow-600"
                      : "text-gray-600"
                  }`}
                >
                  {project.status || "pending"}
                </span>
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusChange(project._id, "under work")}
                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm"
              >
                Mark Under Work
              </button>
              <button
                onClick={() => handleStatusChange(project._id, "completed")}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm"
              >
                Mark Completed
              </button>
              <button
                onClick={() => handleDelete(project._id)}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm"
              >
                Delete
              </button>
              {/* Update button could open a modal/form */}
              <button
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm"
              >
                Update
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
