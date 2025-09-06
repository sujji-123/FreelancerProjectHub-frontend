import { Link } from "react-router-dom";


export default function ClientNavbar() {
    return (
        <nav className="bg-white shadow p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">Client Dashboard</h1>
            <div className="space-x-4">
                <Link to="/client/dashboard" className="hover:underline">Home</Link>
                <Link to="/client/post-project" className="hover:underline">Post Project</Link>
                <Link to="/client/proposals" className="hover:underline">Proposals</Link>
                <Link to="/logout" className="hover:underline text-red-500">Logout</Link>
            </div>
        </nav>
    );
}