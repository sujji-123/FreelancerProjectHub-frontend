// src/components/Navbar/ClientNavbar.jsx
import { Link } from "react-router-dom";
import NotificationBell from "../Notifications/NotificationBell";

export default function ClientNavbar() {
  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Client Dashboard</h1>
      <div className="flex items-center space-x-4">
        <Link to="/client/dashboard" className="hover:underline">Home</Link>
        <Link to="/client/post-project" className="hover:underline">Post Project</Link>
        <Link to="/client/proposals" className="hover:underline">Proposals</Link>
        <NotificationBell />
        <Link to="/logout" className="hover:underline text-red-500">Logout</Link>
      </div>
    </nav>
  );
}
