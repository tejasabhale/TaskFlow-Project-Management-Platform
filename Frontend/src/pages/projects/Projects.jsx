import { useCallback, useEffect, useState } from "react";
import { FiArrowUpRight, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getAllProjects } from "../../services/workspace.service";
import { useWorkspace } from "../../hooks/useWorkspace";

const Projects = () => {
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    if (!activeWorkspace?._id) {
      setProjects([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getAllProjects(activeWorkspace._id);
      const projectList = response.data || [];

      setProjects(Array.isArray(projectList) ? projectList : []);
    } catch (error) {
      console.error("Failed to load projects:", error);

      setError("Failed to load projects. Please try again.");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace?._id]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

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

      {loading && (
        <div className="py-12 text-center text-sm text-gray-500">
          Loading projects...
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-red-500">{error}</p>

          <button
            onClick={fetchProjects}
            className="mt-3 text-sm font-medium text-gray-900 underline hover:text-gray-600"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-gray-500">No projects found.</p>

          <button className="mt-4 flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
            <FiPlus size={16} />
            Create Project
          </button>
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const progress = project.progress ?? 0;
            const tasks = project.tasks ?? 0;

            return (
              <div
                key={project._id}
                className="rounded-xl border border-gray-200 bg-white p-5"
              >
                {/* Project Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {project.name}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      {project.description || "No description available."}
                    </p>
                  </div>

                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                    {project.status || "Active"}
                  </span>
                </div>

                {/* Progress */}
                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-gray-500">Progress</span>

                    <span className="font-medium text-gray-700">
                      {progress}%
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-gray-900 transition-all"
                      style={{
                        width: `${Math.min(Math.max(progress, 0), 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{tasks} tasks</span>

                  <button
                    onClick={() => navigate(`/projects/${project._id}`)}
                    className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Open
                    <FiArrowUpRight size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Projects;
