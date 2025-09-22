// src/components/Sidebar/ClientSidebar.jsx
import { Link } from "react-router-dom";

export default function ClientSidebar() {
  return (
    <aside className="bg-gray-100 p-4 w-64 min-h-screen shadow">
      <ul className="space-y-3">
        <li><Link to="/client/post-project" className="block hover:underline">Post Project</Link></li>
        <li><Link to="/client/my-projects" className="block hover:underline">My Projects</Link></li>
        <li><Link to="/client/proposals" className="block hover:underline">Proposals</Link></li>
        <li><Link to="/task-progress" className="block hover:underline">Task Progress</Link></li>
        <li><Link to="/client/payment" className="block font-medium text-indigo-600 hover:underline">Payment Gateway</Link></li>
      </ul>
    </aside>
  );
}