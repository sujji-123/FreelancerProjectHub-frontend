// src/pages/ClientDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link, Routes, Route } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  FaUserCircle, FaBriefcase, FaCog, FaSignOutAlt, FaPlusSquare, FaSearch, 
  FaBell, FaCheckCircle, FaEnvelope, FaMoneyBill, FaInbox, FaComment, 
  FaSpinner, FaCircle, FaEdit, FaStar // ADDED: FaStar import
} from "react-icons/fa";
import projectService from "../services/projectService";
import proposalService from "../services/proposalService";
import notificationService from "../services/notificationService";
import { getProfile, uploadProfilePicture } from "../services/userService";
import EditProfileModal from "../components/Profile/EditProfileModal";
import { toast } from "react-toastify";
import ClientPayment from "./ClientPayment";
import { getTasksByProject } from "../services/taskService";

const readUser = () => {
  try {
    const u = localStorage.getItem("user");
    if (u) return JSON.parse(u);
  } catch (err) { /* ignore */ }
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const dec = jwtDecode(token);
      return dec.user || { name: dec.name, email: dec.email, role: dec.role };
    }
  } catch (err) { /* ignore */ }
  return null;
};

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(readUser());
  const [profile, setProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("open");
  const [activeProposalTab, setActiveProposalTab] = useState("pending");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [allTasks, setAllTasks] = useState([]);

  useEffect(() => {
    if (!user?.role) {
      navigate("/login", { replace: true });
    } else if (user.role !== "client") {
      navigate("/freelancer/dashboard", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const onStorage = () => setUser(readUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const loadAllData = async () => {
    try {
      const [profileRes, projectsRes, proposalsRes, notificationsRes] = await Promise.all([
        getProfile(),
        projectService.getMyProjects(),
        proposalService.getClientProposals(),
        notificationService.getNotifications()
      ]);

      setProfile(profileRes.data);
      const clientProjects = projectsRes.data || [];
      setProjects(clientProjects);
      setProposals(proposalsRes.data || []);
      setNotifications(notificationsRes.data || []);

      if (clientProjects.length > 0) {
        const tasksPromises = clientProjects.map(p => getTasksByProject(p._id));
        const tasksResults = await Promise.all(tasksPromises);
        setAllTasks(tasksResults.flat());
      }
    } catch (err) {
      toast.error("Failed to load dashboard data.");
      console.error("Dashboard data load error:", err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profilePicture', file);
      try {
        const res = await uploadProfilePicture(formData);
        setProfile(res.data);
        toast.success('Profile picture updated!');
      } catch (err) {
        toast.error('Failed to upload profile picture.');
      }
    }
  };

  const getProjectsByStatus = (status) => {
    const filteredByStatus = status === "all" ? projects : projects.filter((p) => p.status === status);
    if (!searchQuery.trim()) return filteredByStatus;
    return filteredByStatus.filter((p) => p.title.toLowerCase().includes(searchQuery.trim().toLowerCase()));
  };

  const getProposalsByStatus = (status) => proposals.filter((p) => p.status === status);

  const getTasksByStatus = (status, limit) => {
    const tasks = allTasks.filter((t) => t.status === status);
    return limit ? tasks.slice(0, limit) : tasks;
  };

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const getPriorityBadge = (priority) => {
    const classes = { high: "bg-red-100 text-red-800", medium: "bg-yellow-100 text-yellow-800", low: "bg-green-100 text-green-800" };
    return (<span className={`px-2 py-1 rounded-full text-xs font-medium ${classes[priority]}`}>{priority || 'normal'}</span>);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "done": return <FaCheckCircle className="text-green-500" />;
      case "inprogress": return <FaSpinner className="text-blue-500 animate-spin" />;
      default: return <FaCircle className="text-gray-400" />;
    }
  };

  const acceptProposal = async (id) => {
    try {
      await proposalService.acceptProposal(id);
      toast.success("Proposal accepted and project moved to 'In Progress'!");
      await loadAllData();
      setActiveTab('in-progress');
    } catch (err) {
      toast.error("Failed to accept proposal.");
      console.error("acceptProposal:", err);
    }
  };

  const rejectProposal = async (id) => {
    try {
      await proposalService.rejectProposal(id);
      toast.info("Proposal rejected.");
      const res = await proposalService.getClientProposals();
      setProposals(res.data || []);
    } catch (err) {
      toast.error("Failed to reject proposal.");
      console.error("rejectProposal:", err);
    }
  };

  const DashboardHome = () => (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <section className="bg-white rounded-xl shadow-md p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-2">
            <h2 className="text-xl font-bold text-gray-800">My Projects</h2>
            <div className="flex flex-wrap gap-2">
              {["all", "open", "in-progress", "completed"].map((s) => (<button key={s} onClick={() => setActiveTab(s)} className={`px-3 py-1 rounded-full text-sm font-medium ${activeTab === s ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>))}
            </div>
          </div>
          <div className="space-y-4">
            {getProjectsByStatus(activeTab).map((project) => (
              <div key={project._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-800">{project.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.status === "open" ? "bg-blue-100 text-blue-800" : project.status === "in-progress" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>{project.status}</span>
                </div>
                <div className="mt-2 text-sm text-gray-600">Budget: ${project.budget}</div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-500">{proposals.filter(pr => pr.project._id === project._id).length} proposals</span>
                  {project.status === 'in-progress' && (<Link to={`/project/collaborate/${project._id}`} className="text-sm text-green-600 hover:text-green-800 font-medium">Collaborate</Link>)}
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="bg-white rounded-xl shadow-md p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-2">
            <h2 className="text-xl font-bold text-gray-800">Proposals Review</h2>
            <div className="flex flex-wrap gap-2">
              {["pending", "accepted", "rejected"].map((s) => (<button key={s} onClick={() => setActiveProposalTab(s)} className={`px-3 py-1 rounded-full text-sm font-medium ${activeProposalTab === s ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>))}
            </div>
          </div>
          <div className="space-y-4">
            {getProposalsByStatus(activeProposalTab).map((p) => (
              <div key={p._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{p.project?.title || "Project"}</h3>
                    <p className="text-sm text-gray-600">Freelancer: {p.freelancer?.name || "Unknown"}</p>
                    <p className="text-sm text-gray-600">Bid: ${p.bidAmount}</p>
                    <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${p.status === "pending" ? "bg-yellow-100 text-yellow-800" : p.status === "accepted" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{p.status}</span>
                  </div>
                  {p.status === "pending" ? (<div className="flex items-center gap-2"><button onClick={() => acceptProposal(p._id)} className="px-3 py-1 rounded bg-emerald-500 text-white hover:bg-emerald-600">Accept</button><button onClick={() => rejectProposal(p._id)} className="px-3 py-1 rounded bg-rose-500 text-white hover:bg-rose-600">Reject</button></div>) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      
      <div className="mt-6 md:mt-8">
        <section className="bg-white rounded-xl shadow-md p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Task Progress</h2>
            <Link to="/client/tasks" className="text-sm text-indigo-600 hover:underline">View All Tasks</Link>
          </div>
          {allTasks.length > 0 ? (
            <div className="space-y-3">
              {["todo", "inprogress", "done"].map((status) => (
                <div key={status}>
                  <h3 className="font-semibold text-gray-700 capitalize mb-2">{status === 'inprogress' ? 'In Progress' : status}</h3>
                  {getTasksByStatus(status, 2).length > 0 ? getTasksByStatus(status, 2).map((task) => (
                    <div key={task._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 bg-gray-50 rounded mb-2 gap-2">
                      <div className="flex items-center">
                        {getStatusIcon(task.status)}
                        <span className="ml-2 text-sm">{task.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {getPriorityBadge(task.priority)}
                        <span className="text-gray-500">{task.comments || 0} <FaComment className="inline" /></span>
                        <span className="text-gray-400">{new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )) : <p className="text-xs text-gray-400">No tasks in this category.</p>}
                </div>
              ))}
            </div>
          ) : (<p className="text-gray-500">No tasks have been created for your projects yet.</p>)}
        </section>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-md shadow-lg">{isSidebarOpen ? '✕' : '☰'}</button>
      <aside className={`w-64 bg-white border-r flex flex-col fixed md:relative inset-y-0 left-0 z-40 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="px-6 py-5 flex items-center gap-3 border-b">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <label htmlFor="profile-picture-upload" className="cursor-pointer">{profile?.profilePicture ? (<img src={`http://localhost:5001/${profile.profilePicture}`} alt="Profile" className="w-10 h-10 rounded-full object-cover" />) : (<FaBriefcase className="text-indigo-600" />)}</label>
            <input type="file" id="profile-picture-upload" className="hidden" onChange={handleProfilePictureChange} />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Client Panel</p>
            <p className="text-xs text-gray-500">{profile?.email || "client@demo.com"}</p>
            <button onClick={() => setIsEditModalOpen(true)} className="mt-1 text-xs text-indigo-600 hover:underline flex items-center gap-1">
              <FaEdit /> Edit Profile
            </button>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700" to="/client/dashboard"><FaInbox /> Dashboard</Link>
          <Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700" to="/client/post-project"><FaPlusSquare /> Post New Project</Link>
          <Link to="/freelancers" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"><FaUserCircle /> View Freelancers</Link>
          
          {/* --- NEW LINK ADDED HERE --- */}
          <div className="mt-4">
            <p className="px-3 text-xs uppercase tracking-wide text-gray-400 mb-2">My Projects</p>
            <Link to="/client/my-projects" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">All Projects</Link>
          </div>

          <Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700" to="/client/proposals"><FaEnvelope /> Proposals Received</Link>
          <Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700" to="/messages"><FaUserCircle /> Messages</Link>
          <Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700" to="/client/dashboard/payment"><FaMoneyBill /> Payments</Link>
          <Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700" to="/client/rate-user"><FaStar /> Rate a Freelancer</Link>
        </nav>
        <div className="p-4 border-t flex items-center justify-between text-gray-600">
          <Link to="/client/settings" className="flex items-center gap-2 hover:text-gray-800"><FaCog /> Settings</Link>
          <button onClick={handleLogout} className="flex items-center gap-2 hover:text-red-600"><FaSignOutAlt /> Logout</button>
        </div>
      </aside>
      {isSidebarOpen && (<div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>)}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Welcome, {profile?.name || "Client"}!</h1>
            <p className="text-gray-500 mt-2">Manage your projects and proposals effectively.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 md:flex-none">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search projects..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64" />
            </div>
            <Link to="/notifications" className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative">
              <FaBell className="h-5 w-5" />
              {unreadNotifications > 0 && (<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{unreadNotifications}</span>)}
            </Link>
            <button onClick={handleLogout} className="hidden md:inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"><FaSignOutAlt /> Logout</button>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/payment" element={<ClientPayment />} />
        </Routes>
      </main>
      {isEditModalOpen && (<EditProfileModal user={profile} onClose={() => setIsEditModalOpen(false)} onProfileUpdate={(updatedProfile) => {setProfile(updatedProfile);}} />)}
    </div>
  );
}