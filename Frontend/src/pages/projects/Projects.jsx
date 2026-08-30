import { FiArrowUpRight, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Projects = () => {
  const navigate = useNavigate();

  const projects = [
    {
      id: "1",
      name: "Website Redesign",
      description: "Redesign and improve the company website.",
      progress: 75,
      tasks: 18,
      status: "Active",
    },
    {
      id: "2",
      name: "TaskFlow",
      description: "Build the TaskFlow productivity platform.",
      progress: 55,
      tasks: 32,
      status: "Active",
    },
    {
      id: "3",
      name: "Mobile Application",
      description: "Develop the TaskFlow mobile application.",
      progress: 35,
      tasks: 21,
      status: "In Progress",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage and track your projects.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
          <FiPlus size={17} />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-gray-900">{project.name}</h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {project.description}
                </p>
              </div>

              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                {project.status}
              </span>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-gray-500">Progress</span>

                <span className="font-medium text-gray-700">
                  {project.progress}%
                </span>
              </div>

              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-gray-900"
                  style={{
                    width: `${project.progress}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {project.tasks} tasks
              </span>

              <button
                onClick={() => navigate(`/projects/${project.id}`)}
                className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Open
                <FiArrowUpRight size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
