// src/pages/FreelancerDashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link, Routes, Route } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
  FaUserCircle, FaCog, FaSignOutAlt, FaSearch, FaBell, FaStar,
  FaShoppingBag, FaClipboardList, FaFileContract, FaEnvelope, FaMoneyBill,
  FaCheckCircle, FaSpinner, FaCircle, FaEdit, FaBars, FaComment, FaTasks
} from 'react-icons/fa';
import { getProjects } from '../services/projectService';
import { getFreelancerProposals, createProposal, withdrawProposal } from '../services/proposalService';
import { getProfile, uploadProfilePicture } from '../services/userService';
import { getBalance } from '../services/paymentService'; // Import getBalance
import { toast } from 'react-toastify';
import EditProfileModal from '../components/Profile/EditProfileModal';
import FreelancerEarnings from './FreelancerEarnings';
import notificationService from '../services/notificationService';

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
  const [profile, setProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [earnings, setEarnings] = useState(0); // State for dynamic earnings
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, projectRes, proposalRes, notificationRes, balanceRes] = await Promise.all([
          getProfile(),
          getProjects(),
          getFreelancerProposals(),
          notificationService.getNotifications(),
          getBalance() // Fetch balance
        ]);
        
        setProfile(profileRes.data);
        setProjects(projectRes.data || []);
        setProposals(proposalRes.data || []);
        setNotifications(notificationRes.data || []);
        setEarnings(balanceRes.data.balance || 0); // Set dynamic earnings

      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("Freelancer bank account not set up yet, earnings default to 0.");
        } else {
          toast.error('Failed to load some dashboard data.');
          console.error("Dashboard fetch error:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    const handler = async () => {
      try {
        const res = await getFreelancerProposals();
        setProposals(res.data || []);
      } catch (err) { console.error("Failed to refresh proposals on update", err); }
    };
    window.addEventListener("proposal_updated", handler);
    return () => window.removeEventListener("proposal_updated", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const openProjects = useMemo(() => {
    const open = projects.filter(p => p.status === 'open');
    if (!searchQuery.trim()) return open.slice(0, 3);
    return open.filter(p => p.title.toLowerCase().includes(searchQuery.trim().toLowerCase())).slice(0, 3);
  }, [projects, searchQuery]);
  
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const activeProjects = useMemo(() => proposals
    .filter(pr => pr.status === 'accepted' && pr.project && pr.project.status !== 'completed')
    .map(pr => projects.find(p => String(p._id) === String(pr.project?._id || pr.project)))
    .filter(Boolean),
  [proposals, projects]);

  const handleApplyClick = (project) => {
    setSelectedProject(project);
    setCoverLetter('');
    setBidAmount('');
    setShowModal(true);
  };

  const handleSubmitProposal = async () => {
    if (!coverLetter || !bidAmount) {
      toast.error("Please fill in both fields.");
      return;
    }
    try {
      await createProposal({ projectId: selectedProject._id, coverLetter, bidAmount: Number(bidAmount) });
      toast.success("Proposal submitted!");
      setShowModal(false);
      const res = await getFreelancerProposals();
      setProposals(res.data || []);
    } catch (err) {
      console.error("Proposal submit error:", err);
      toast.error(err.response?.data?.msg || "Failed to send proposal.");
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

  const DashboardHome = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl relative">
              <label htmlFor="profile-picture-upload" className="cursor-pointer">{profile?.profilePicture ? (<img src={`http://localhost:5001/${profile.profilePicture}`} alt="Profile" className="w-16 h-16 rounded-full object-cover" />) : (<span>{profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}</span>)}</label>
              <input type="file" id="profile-picture-upload" className="hidden" onChange={handleProfilePictureChange} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{profile?.name}</h3>
              <div className="flex flex-wrap items-center space-x-2 text-sm text-gray-500">
                <span>Web Developer</span>
                <span className="flex items-center text-yellow-400"><FaStar className="mr-1" />{profile?.rating || 0}/5</span>
                <span>({profile?.reviews?.length || 0} reviews)</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">{profile?.skills.map(skill => (<span key={skill} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{skill}</span>))}</div>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-gray-500">Earnings</div>
            <div className="text-xl font-bold">${earnings.toLocaleString()}</div>
            <button onClick={() => setIsEditModalOpen(true)} className="mt-2 flex items-center justify-center sm:justify-end text-indigo-600 hover:underline"><FaEdit className="mr-1" /> Edit Profile</button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Job Recommendations</h2>
            <Link to="/freelancer/projects" className='text-sm text-indigo-600 hover:underline'>View All</Link>
          </div>
          <div className="space-y-4 flex-1">
            {openProjects.length > 0 ? openProjects.map(project => (
              <div key={project._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                  <h3 className="font-semibold text-gray-800">{project.title}</h3>
                  <span className="font-bold text-indigo-600">${project.budget}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3 truncate">{project.description}</p>
                {(() => {
                  const myProposal = proposals.find(pr => String(pr.project && (pr.project._id || pr.project)) === String(project._id));
                  if (myProposal) {
                    if (myProposal.status === "pending") {
                      return (<div className="flex flex-col sm:flex-row gap-2"><button disabled className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-medium">Proposal Sent</button><button onClick={() => handleWithdrawProposal(myProposal._id)} className="bg-red-500 text-white px-4 py-2 rounded-lg">Withdraw</button></div>);
                    } if (myProposal.status === "accepted") {
                      return (<button disabled className="w-full bg-green-100 text-green-700 py-2 rounded-lg font-medium">Accepted ✅</button>);
                    } if (myProposal.status === "rejected") {
                      return (<button disabled className="w-full bg-red-100 text-red-700 py-2 rounded-lg font-medium">Rejected ❌</button>);
                    } return (<button disabled className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg font-medium">{myProposal.status}</button>);
                  } return (<button onClick={() => handleApplyClick(project)} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium">Apply Now</button>);
                })()}
              </div>
            )) : (<p className="text-gray-500">No open projects matching your search.</p>)}
          </div>
        </div>
      </div>
      <aside className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h4 className="font-semibold text-lg">Your Stats</h4>
          <div className="mt-4 text-sm text-gray-600 space-y-3">
            <div className="flex justify-between"><span>Proposals Sent</span><strong>{proposals.length}</strong></div>
            <div className="flex justify-between"><span>Active Projects</span><strong>{activeProjects.length}</strong></div>
            <div className="flex justify-between"><span>Earnings</span><strong>${earnings.toLocaleString()}</strong></div>
            <div className="flex justify-between"><span>Client Rating</span><strong>{profile?.rating || 0}/5</strong></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">My Active Projects</h2>
            <Link to="/freelancer/my-contracts" className="text-sm text-indigo-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-4 flex-1">
            {activeProjects.slice(0, 2).map(project => (
              <div key={project._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                  <h3 className="font-semibold text-gray-800">{project.title}</h3>
                  <span className="font-bold text-indigo-600">${project.budget}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3 truncate">{project.description}</p>
                <Link to={`/project/collaborate/${project._id}`} className="mt-3 inline-block bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 text-center text-sm">Collaborate</Link>
              </div>
            ))}
            {activeProjects.length === 0 && (<p className="text-gray-500">No active projects yet.</p>)}
          </div>
        </div>
      </aside>
    </div>
  );

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={`fixed lg:static top-0 left-0 h-full w-64 bg-white shadow-lg transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300 z-50 flex flex-col`}>
        <div className="p-6 text-2xl font-bold text-indigo-600 border-b-2 border-gray-100 flex justify-between items-center">
          FreelancerHub
          <button className="lg:hidden text-gray-600" onClick={() => setSidebarOpen(false)}>✖</button>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <Link to="/freelancer/dashboard" className="flex items-center px-4 py-2.5 text-gray-700 bg-indigo-100 rounded-lg font-semibold"><FaUserCircle className="mr-3 h-5 w-5" /> Dashboard</Link>
          <Link to="/freelancer/projects" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-indigo-50 rounded-lg"><FaShoppingBag className="mr-3 h-5 w-5" /> Browse Projects</Link>
          <Link to="/freelancer/my-proposals" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-indigo-50 rounded-lg"><FaClipboardList className="mr-3 h-5 w-5" /> My Proposals</Link>
          <Link to="/clients" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-indigo-50 rounded-lg"><FaUserCircle className="mr-3 h-5 w-5" /> View Clients</Link>
          <Link to="/freelancer/my-contracts" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-indigo-50 rounded-lg"><FaFileContract className="mr-3 h-5 w-5" /> My Contracts</Link>
          <Link to="/freelancer/tasks" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-indigo-50 rounded-lg"><FaTasks className="mr-3 h-5 w-5" /> Task Progress</Link>
          <Link to="/messages" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-indigo-50 rounded-lg"><FaEnvelope className="mr-3 h-5 w-5" /> Messages</Link>
          <Link to="/freelancer/earnings" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-indigo-50 rounded-lg"><FaMoneyBill className="mr-3 h-5 w-5" /> Earnings</Link>
          <Link to="/freelancer/settings" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-indigo-50 rounded-lg"><FaCog className="mr-3 h-5 w-5" /> Settings</Link>
        </nav>
        <div className="p-4 border-t">
          <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg"><FaSignOutAlt className="mr-3 h-5 w-5" /> Logout</button>
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto h-full flex flex-col">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Welcome, {profile?.name || 'Freelancer'}!</h1>
            <p className="text-gray-500 mt-2">Find new projects and manage your work.</p>
          </div>
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search projects..." className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-96" />
            </div>
            <button className="lg:hidden p-2 bg-indigo-100 rounded-lg" onClick={() => setSidebarOpen(true)}><FaBars /></button>
            <Link to="/notifications" className="hidden sm:flex items-center text-gray-600 hover:text-gray-800 relative">
              <FaBell />
              {unreadNotifications > 0 && (<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{unreadNotifications}</span>)}
            </Link>
          </div>
        </header>
        <div className="flex-1">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/earnings" element={<FreelancerEarnings />} />
            </Routes>
        </div>
      </main>
      {showModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Submit Proposal</h2>
            <p className="mb-2 text-gray-600">Project: {selectedProject.title}</p>
            <textarea placeholder="Write a cover letter..." value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} className="w-full border rounded-lg p-3 mb-4" rows={4} />
            <input type="number" placeholder="Your bid amount" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="w-full border rounded-lg p-3 mb-4" />
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
              <button onClick={handleSubmitProposal} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Submit</button>
            </div>
          </div>
        </div>
      )}
      {isEditModalOpen && (<EditProfileModal user={profile} onClose={() => setIsEditModalOpen(false)} onProfileUpdate={(updatedProfile) => {setProfile(updatedProfile);}} />)}
    </div>
  );
}