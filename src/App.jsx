// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SocketProvider } from './context/SocketContext';

// Import all your existing pages...
import Signup from './pages/Signup';
import Verify from './pages/Verify';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ClientDashboard from './pages/ClientDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import ProjectDashboard from "./pages/ProjectDashboard";
import PostProject from './pages/PostProject';
import FreelancerProjects from './pages/FreelancerProjects';
import MyProjects from "./pages/client/MyProjects";
import ViewClients from './pages/ViewClients';
import ViewFreelancers from './pages/ViewFreelancers';
import ProjectCollab from './pages/ProjectCollab';
import ClientPayment from './pages/ClientPayment';
import FreelancerEarnings from './pages/FreelancerEarnings';
import NotificationsPage from './pages/NotificationsPage';
import MessagesPage from './pages/MessagesPage';
import TaskDetailsPage from './pages/TaskDetailsPage';
import SettingsPage from './pages/SettingsPage';
import ClientProposals from './pages/ClientProposals';
import RateUserPage from './pages/RateUserPage';
// --- IMPORT THE TWO NEW PAGES ---
import FreelancerMyProposals from './pages/FreelancerMyProposals';
import FreelancerMyContracts from './pages/FreelancerMyContracts';

function App() {
  return (
    <SocketProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
        />
        <Routes>
          {/* All your existing routes... */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/client/dashboard/*" element={<ClientDashboard />} />
          <Route path="/freelancer/dashboard/*" element={<FreelancerDashboard />} />
          <Route path="/client/tasks" element={<TaskDetailsPage />} />
          <Route path="/freelancer/tasks" element={<TaskDetailsPage />} />
          <Route path="/client/settings" element={<SettingsPage />} />
          <Route path="/freelancer/settings" element={<SettingsPage />} />
          <Route path="/client/proposals" element={<ClientProposals />} />

          {/* --- NEW ROUTES ADDED FOR FREELANCER --- */}
          <Route path="/freelancer/my-proposals" element={<FreelancerMyProposals />} />
          <Route path="/freelancer/my-contracts" element={<FreelancerMyContracts />} />

          <Route path="/project/:id" element={<ProjectDashboard />} />
          <Route path="/client/post-project" element={<PostProject />} />
          <Route path="/freelancer/projects" element={<FreelancerProjects />} />
          <Route path="/client/my-projects" element={<MyProjects />} />
          <Route path="/clients" element={<ViewClients />} />
          <Route path="/freelancers" element={<ViewFreelancers />} />
          <Route path="/project/collaborate/:projectId" element={<ProjectCollab />} />
          <Route path="/client/payment" element={<ClientDashboard />} />
          <Route path="/freelancer/earnings" element={<FreelancerDashboard />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/tasks" element={<TaskDetailsPage />} />
          <Route path="/client/rate-user" element={<RateUserPage />} />
          <Route path="/freelancer/rate-user" element={<RateUserPage />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;