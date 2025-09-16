// src/pages/FreelancerDashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
  FaUserCircle, FaCog, FaSignOutAlt, FaSearch, FaBell, FaStar,
  FaShoppingBag, FaClipboardList, FaFileContract, FaEnvelope, FaMoneyBill,
  FaEdit
} from 'react-icons/fa';
import { getProjects } from '../services/projectService';
import { getFreelancerProposals } from '../services/proposalService';
import userService from '../services/userService';
import { toast } from 'react-toastify';
import EditProfileModal from '../components/Profile/EditProfileModal';

const readUser = () => {
  try {
    const u = localStorage.getItem('user');
    if (u) return JSON.parse(u);
  } catch { /* intentionally ignored */ }
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const dec = jwtDecode(token);
      // The user object from the token payload might be nested under 'user'
      return dec.user || { id: dec.id, name: dec.name, email: dec.email, role: dec.role };
    }
  } catch { /* intentionally ignored */ }
  return null;
};

export default function FreelancerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(readUser());
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for dynamic data
  const [projects, setProjects] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Memoized values for notifications and derived data
  const notifications = useMemo(() => [
    { id: 1, message: 'Interview request', read: false },
  ], []);
  const unread = notifications.filter(n => !n.read).length;

  const openProjects = useMemo(() => 
    projects.filter(p => p.status === 'open').slice(0, 3), // Show top 3 open projects
    [projects]
  );

  useEffect(() => {
    if (!user?.role) {
      navigate('/login', { replace: true });
      return;
    } 
    if (user.role !== 'freelancer') {
      navigate('/client/dashboard', { replace: true });
      return;
    }

    // Fetch all data from backend
    const fetchData = async () => {
      try {
        const [projectRes, proposalRes, profileRes] = await Promise.all([
          getProjects(),
          getFreelancerProposals(),
          userService.getProfile(),
        ]);

        setProjects(projectRes.data || []);
        setProposals(proposalRes.data || []);
        setProfile(profileRes.data || null);

      } catch (error) {
        toast.error('Failed to load dashboard data.');
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
  };
  
  if (loading) {
    return <div className='flex justify-center items-center min-h-screen'>Loading Dashboard...</div>;
  }

  // Calculate stats based on fetched data
  const activeProjects = projects.filter(p => p.assignedFreelancer?._id === user.id && p.status === 'in-progress');
  const totalEarnings = proposals
    .filter(p => p.status === 'accepted')
    .reduce((sum, p) => sum + p.bidAmount, 0);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {isEditModalOpen && (
        <EditProfileModal
          user={profile}
          onClose={() => setIsEditModalOpen(false)}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 text-2xl font-bold text-indigo-600 border-b-2 border-gray-100">FreelancerHub</div>
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
          <Link to="#" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-indigo-50 rounded-lg">
            <FaCog className="mr-3 h-5 w-5" /> Settings
          </Link>
        </nav>
        <div className="p-4 border-t-2 border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg">
            <FaSignOutAlt className="mr-3 h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {profile?.name || user?.name}!</h1>
            <p className="text-gray-500 mt-2">Find new projects and manage your work.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative">
              <FaBell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Profile */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex justify-between items-start">
                  <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-indigo-700 font-bold text-xl">{(profile?.name || 'F').charAt(0)}</span>
                      </div>
                      <div>
                          <h2 className="text-xl font-bold text-gray-800">{profile?.name || 'Freelancer Name'}</h2>
                          <p className="text-gray-600">{profile?.bio || 'No bio provided. Click edit to add one.'}</p>
                          <div className="flex items-center mt-1">
                              <div className="flex text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                      <FaStar key={i} className={i < (profile?.rating || 0) ? '' : 'text-gray-300'} />
                                  ))}
                              </div>
                              <span className="ml-2 text-sm text-gray-500">{profile?.rating || 0} ({profile?.reviews?.length || 0} reviews)</span>
                          </div>
                      </div>
                  </div>
                  <button onClick={() => setIsEditModalOpen(true)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-indigo-600">
                      <FaEdit />
                  </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {profile?.skills?.length > 0 ? profile.skills.map(s => (
                  <span key={s} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{s}</span>
                )) : <p className="text-sm text-gray-500">No skills added yet. Click the edit icon to add your skills.</p>}
              </div>
            </div>

            {/* Job Recommendations from Database */}
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
                    <Link to="/freelancer/projects" className="w-full mt-2 block text-center bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium">
                      View & Apply
                    </Link>
                  </div>
                )) : (
                  <p className="text-gray-500">No open projects available right now.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Proposals Sent</span>
                  <span className="font-bold text-gray-800">{proposals.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Projects</span>
                  <span className="font-bold text-gray-800">{activeProjects.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Earnings</span>
                  <span className="font-bold text-gray-800">${totalEarnings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Client Rating</span>
                  <span className="font-bold text-gray-800">{profile?.rating || 0}/5</span>
                </div>
              </div>
            </div>
            
            {/* Active Projects */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">My Active Projects</h2>
              <div className="space-y-4">
                {activeProjects.length > 0 ? activeProjects.map(p => (
                  <div key={p._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{p.title}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs`}>Active</span>
                      <Link to={`/project/${p._id}`} className="text-blue-600 underline text-xs">
                        Open
                      </Link>
                    </div>
                  </div>
                )) : <p className="text-gray-500">No active projects.</p>}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}