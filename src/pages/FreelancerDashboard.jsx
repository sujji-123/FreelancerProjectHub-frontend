// src/pages/FreelancerDashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
  FaUserCircle, FaCog, FaSignOutAlt, FaSearch, FaBell, FaStar,
  FaShoppingBag, FaClipboardList, FaFileContract, FaEnvelope, FaMoneyBill,
  FaCheckCircle, FaSpinner, FaCircle
} from 'react-icons/fa';
import { getProjects } from '../services/projectService';
import { getFreelancerProposals } from '../services/proposalService';
import { toast } from 'react-toastify';

const readUser = () => {
  try {
    const u = localStorage.getItem('user');
    if (u) return JSON.parse(u);
  } catch { /* ignored */ }
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const dec = jwtDecode(token);
      return dec.user || { name: dec.name, email: dec.email, role: dec.role };
    }
  } catch { /* ignored */ }
  return null;
};

export default function FreelancerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(readUser());
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects and proposals
  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectRes = await getProjects();
        setProjects(projectRes.data || []);

        const proposalRes = await getFreelancerProposals();
        setProposals(proposalRes.data || []);
      } catch (error) {
        toast.error('Failed to load dashboard data.');
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  // Refresh proposals when "proposal_updated" event fires
  useEffect(() => {
    const handler = async () => {
      try {
        const res = await getFreelancerProposals();
        setProposals(res.data || []);
      } catch (err) {
        console.error("Failed to refresh proposals on update", err);
      }
    };
    window.addEventListener("proposal_updated", handler);
    return () => window.removeEventListener("proposal_updated", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const statusIcon = (s) => {
    if (!s) return <FaCircle className="text-gray-400" />;
    if (s === 'open') return <FaCircle className="text-green-400" />;
    if (s === 'in-progress') return <FaSpinner className="text-yellow-500" />;
    if (s === 'completed') return <FaCheckCircle className="text-indigo-600" />;
    return <FaCircle className="text-gray-400" />;
  };

  const openProjects = useMemo(
    () => projects.filter(p => p.status === 'open').slice(0, 3),
    [projects]
  );

  // Active projects = proposals accepted by client
  const activeProjects = useMemo(
    () =>
      proposals
        .filter(pr => pr.status === 'accepted' && pr.project)
        .map(pr => projects.find(p => String(p._id) === String(pr.project?._id || pr.project)))
        .filter(Boolean),
    [proposals, projects]
  );

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 text-2xl font-bold text-indigo-600 border-b-2 border-gray-100">
          FreelancerHub
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <Link to="/freelancer/dashboard" className="flex items-center px-4 py-2.5 text-gray-700 bg-indigo-100 rounded-lg font-semibold">
            <FaUserCircle className="mr-3 h-5 w-5" /> Dashboard
          </Link>
          <Link to="/freelancer/projects" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-indigo-50 rounded-lg">
            <FaShoppingBag className="mr-3 h-5 w-5" /> Browse Projects
          </Link>
          <Link to="/freelancer/my-proposals" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-indigo-50 rounded-lg">
            <FaClipboardList className="mr-3 h-5 w-5" /> My Proposals
          </Link>
          <Link to="#" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-indigo-50 rounded-lg">
            <FaFileContract className="mr-3 h-5 w-5" /> My Contracts
          </Link>
          <Link to="#" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-indigo-50 rounded-lg">
            <FaEnvelope className="mr-3 h-5 w-5" /> Messages
          </Link>
          <Link to="#" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-indigo-50 rounded-lg">
            <FaMoneyBill className="mr-3 h-5 w-5" /> Earnings
          </Link>
          <Link to="/freelancer/settings" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-indigo-50 rounded-lg">
            <FaCog className="mr-3 h-5 w-5" /> Settings
          </Link>
        </nav>
        <div className="p-4 border-t">
          <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg">
            <FaSignOutAlt className="mr-3 h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome, {user?.name || 'Freelancer'}!
            </h1>
            <p className="text-gray-500 mt-2">Find new projects and manage your work.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="pl-10 pr-4 py-2 border rounded-lg w-96"
              />
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/notifications" className="flex items-center text-gray-600 hover:text-gray-800">
                <FaBell />
              </Link>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8">
            {/* Profile card */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mr-4 text-indigo-600 font-bold text-xl">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{user?.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>Web Developer</span>
                    <span className="flex items-center text-yellow-400"><FaStar className="mr-1" />4.0</span>
                    <span>(12 reviews)</span>
                  </div>
                  <div className="mt-3">
                    {/* TODO: Replace with dynamic skills from profile */}
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">HTML</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">CSS</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">JavaScript</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">React</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-500">Earnings</div>
                <div className="text-xl font-bold">$4,250</div>
              </div>
            </div>

            {/* Job Recommendations */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Job Recommendations</h2>
                <Link to="/freelancer/projects" className='text-sm text-indigo-600 hover:underline'>View All</Link>
              </div>
              <div className="space-y-4">
                {openProjects.length > 0 ? openProjects.map(project => (
                  <div key={project._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{project.title}</h3>
                      <span className="font-bold text-indigo-600">${project.budget}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 truncate">
                      {project.description}
                    </p>
                    {(() => {
                      const myProposal = proposals.find(pr =>
                        String(pr.project && (pr.project._id || pr.project)) === String(project._id)
                      );
                      if (myProposal) {
                        if (myProposal.status === "pending") {
                          return (<button disabled className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg font-medium">Proposal Sent</button>);
                        }
                        if (myProposal.status === "accepted") {
                          return (<button disabled className="w-full bg-green-100 text-green-700 py-2 rounded-lg font-medium">Accepted ✅</button>);
                        }
                        if (myProposal.status === "rejected") {
                          return (<button disabled className="w-full bg-red-100 text-red-700 py-2 rounded-lg font-medium">Rejected ❌</button>);
                        }
                        return (<button disabled className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg font-medium">{myProposal.status}</button>);
                      }
                      return (<Link to={`/project/${project._id}`} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium">View & Apply</Link>);
                    })()}
                  </div>
                )) : (
                  <p className="text-gray-500">No open projects available right now.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <aside className="col-span-4 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h4 className="font-semibold text-lg">Your Stats</h4>
              <div className="mt-4 text-sm text-gray-600 space-y-3">
                <div className="flex justify-between"><span>Proposals Sent</span><strong>{proposals.length}</strong></div>
                <div className="flex justify-between"><span>Active Projects</span><strong>{activeProjects.length}</strong></div>
                <div className="flex justify-between"><span>Earnings</span><strong>$4,250</strong></div>
                <div className="flex justify-between"><span>Client Rating</span><strong>4.8/5</strong></div>
              </div>
            </div>

            {/* My Active Projects (moved here) */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">My Active Projects</h2>
                <Link to="/freelancer/my-projects" className="text-sm text-indigo-600 hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                {activeProjects.length > 0 ? activeProjects.map(project => (
                  <div key={project._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{project.title}</h3>
                      <span className="font-bold text-indigo-600">${project.budget}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 truncate">{project.description}</p>
                    <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      In Progress
                    </span>
                  </div>
                )) : (
                  <p className="text-gray-500">No active projects yet.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
