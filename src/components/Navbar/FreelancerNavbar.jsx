import { Link } from "react-router-dom";


export default function FreelancerNavbar() {
    return (
        <nav className="bg-white shadow p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">Freelancer Dashboard</h1>
            <div className="space-x-4">
                <Link to="/freelancer/dashboard" className="hover:underline">Home</Link>
                <Link to="/freelancer/projects" className="hover:underline">Browse Projects</Link>
                <Link to="/freelancer/tasks" className="hover:underline">My Tasks</Link>
                <Link to="/logout" className="hover:underline text-red-500">Logout</Link>
            </div>
        </nav>
    );
}