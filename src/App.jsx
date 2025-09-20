// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SocketProvider } from './context/SocketContext';

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
// ADDED: Import the MessagesPage
import MessagesPage from './pages/MessagesPage';
// ADDED: Import the new task details page
import TaskDetailsPage from './pages/TaskDetailsPage';

function App() {
  return (
    <SocketProvider> {/* ADDED: Wrap everything with SocketProvider */}
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
        />
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/client/dashboard/*" element={<ClientDashboard />} />
          <Route path="/freelancer/dashboard/*" element={<FreelancerDashboard />} />
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
          {/* ADDED: Route for messages */}
          <Route path="/messages" element={<MessagesPage />} />

          {/* ADDED: Route for the task details page */}
          <Route path="/tasks" element={<TaskDetailsPage />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;