import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';   // ✅ Added Link
import { jwtDecode } from 'jwt-decode';
import {
  FaUserCircle, FaCog, FaSignOutAlt, FaSearch, FaBell, FaStar,
  FaShoppingBag, FaClipboardList, FaFileContract, FaEnvelope, FaMoneyBill,
  FaCheckCircle, FaSpinner, FaCircle
} from 'react-icons/fa';

const readUser = () => {
  try {
    const u = localStorage.getItem('user');
    if (u) return JSON.parse(u);
  } catch {
    // intentionally ignored
  }
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const dec = jwtDecode(token);
      return dec.user || { name: dec.name, email: dec.email, role: dec.role };
    }
  } catch {
    // intentionally ignored
  }
  return null;
};

export default function FreelancerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(readUser());
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = useMemo(() => [
    { id: 1, message: 'Interview request', read: false },
  ], []);
  const unread = notifications.filter(n => !n.read).length;

  const jobRecommendations = useMemo(() => [
    { id: 1, title: 'Front-End Developer', budget: 2800, deadline: 'Dec 10', skills: ['HTML', 'CSS', 'JavaScript'] },
    { id: 2, title: 'UX Designer', budget: 1200, deadline: 'Dec 5', skills: ['Figma', 'UI Design', 'Wireframing'] },
    { id: 3, title: 'Full-Stack Developer', budget: 3500, deadline: 'Dec 15', skills: ['React', 'Node.js', 'MongoDB'] }
  ], []);

  useEffect(() => {
    if (!user?.role) {
      navigate('/login', { replace: true });
    } else if (user.role !== 'freelancer') {
      navigate('/client/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const statusIcon = (s) => s === 'done' ? <FaCheckCircle className="text-green-500"/> :
    s === 'progress' ? <FaSpinner className="text-blue-500 animate-spin"/> : <FaCircle className="text-gray-400"/>;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 text-2xl font-bold text-indigo-600 border-b-2 border-gray-100">FreelancerHub</div>
        <nav className="flex-grow p-4 space-y-2">
          <span className="flex items-center px-4 py-2.5 text-gray-700 bg-indigo-100 rounded-lg font-semibold">
            <FaUserCircle className="mr-3 h-5 w-5" /> Dashboard
          </span>
          <a className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-indigo-50 rounded-lg">
            <FaShoppingBag className="mr-3 h-5 w-5" /> Marketplace
          </a>
          <a className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-indigo-50 rounded-lg">
            <FaClipboardList className="mr-3 h-5 w-5" /> My Proposals
          </a>
          <a className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-indigo-50 rounded-lg">
            <FaFileContract className="mr-3 h-5 w-5" /> My Contracts
          </a>
          <a className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-indigo-50 rounded-lg">
            <FaEnvelope className="mr-3 h-5 w-5" /> Messages
          </a>
          <a className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-indigo-50 rounded-lg">
            <FaMoneyBill className="mr-3 h-5 w-5" /> Earnings
          </a>
          <a className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-indigo-50 rounded-lg">
            <FaCog className="mr-3 h-5 w-5" /> Settings
          </a>
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
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name || 'Freelancer'}!</h1>
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
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-indigo-700 font-bold text-xl">{(user?.name || 'F').charAt(0)}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{user?.name || 'Freelancer Name'}</h2>
                  <p className="text-gray-600">Web Developer</p>
                  <div className="flex items-center mt-1">
                    <div className="flex text-yellow-400">
                      <FaStar /><FaStar /><FaStar /><FaStar /><FaStar className="text-gray-300" />
                    </div>
                    <span className="ml-2 text-sm text-gray-500">4.0 (12 reviews)</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {['HTML','CSS','JavaScript','React'].map(s => (
                  <span key={s} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{s}</span>
                ))}
              </div>
            </div>

            {/* Job Recommendations */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Job Recommendations</h2>
              <div className="space-y-4">
                {jobRecommendations.map(job => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{job.title}</h3>
                      <span className="font-bold text-indigo-600">${job.budget}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Deadline: {job.deadline}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{skill}</span>
                      ))}
                    </div>
                    <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium">Apply Now</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar stats */}
          <div className="space-y-6">
            {/* Active Projects with Link */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Active Projects</h2>
              <div className="space-y-4">
                {[
                  {id:'p1', name:'E-commerce Website', badge:'Active', cls:'bg-blue-100 text-blue-700'},
                  {id:'p2', name:'Mobile App Design', badge:'Review', cls:'bg-yellow-100 text-yellow-700'},
                  {id:'p3', name:'Logo Design', badge:'Completed', cls:'bg-green-100 text-green-700'},
                ].map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{p.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 ${p.cls} rounded-full text-xs`}>{p.badge}</span>
                      {/* ✅ Link to project collaboration */}
                      <Link to={`/project/${p.id}`} className="text-blue-600 underline text-xs">
                        Open Collaboration
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Stats</h2>
              <div className="space-y-4">
                {[
                  ['Active Projects','3'],
                  ['Proposals Sent','12'],
                  ['Earnings','$4,250'],
                  ['Client Rating','4.8/5'],
                ].map(([k,v]) => (
                  <div key={k} className="flex justify-between items-center">
                    <span className="text-gray-600">{k}</span>
                    <span className="font-bold text-gray-800">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Progress */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Task Progress</h2>
              <div className="space-y-3">
                {[
                  ['todo','Design homepage'],
                  ['progress','Implement navigation'],
                  ['progress','Test responsiveness'],
                  ['done','Deploy to production'],
                ].map(([s,label]) => (
                  <div key={label} className="flex items-center p-2 bg-gray-50 rounded">
                    {statusIcon(s)} <span className="ml-2 text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
