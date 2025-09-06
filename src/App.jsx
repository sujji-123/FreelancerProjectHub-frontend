import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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

function App() {
  return (
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
        <Route path="/login" element={<Login />} />
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
        <Route path="/project/:id" element={<ProjectDashboard />} />
        <Route path="/client/new-project" element={<PostProject />} />
        <Route path="/freelancer/projects" element={<FreelancerProjects />} />  
        <Route path="/client/my-projects" element={<MyProjects />} />
      </Routes>
    </Router>
  );
}

export default App;