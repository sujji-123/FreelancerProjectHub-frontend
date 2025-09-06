export default function ProjectCard({ project }) {
    return (
        <div className="border rounded-lg p-4 shadow hover:shadow-md transition">
            <h2 className="text-lg font-semibold">{project.title}</h2>
            <p className="text-gray-600">{project.description}</p>
            <p className="text-sm text-gray-500">Budget: ${project.budget}</p>
        </div>
    );
}