import { useEffect, useState } from "react";
import {
  FiArrowUpRight,
  FiCheckCircle,
  FiClock,
  FiFolder,
  FiMoreHorizontal,
  FiPlus,
  FiUsers,
} from "react-icons/fi";

import { getDashboard } from "../../services/dashboard.service.js";
import { getMyTasks } from "../../services/task.service.js";
import { getMyProjects } from "../../services/project.service.js";
import useAuth from "../../hooks/useAuth.js";

const Dashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalWorkspaces: 0,
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
  });

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  const [tasksLoading, setTasksLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Logged-in user name

  const userName = user?.fullName || user?.userName || "User";

  // Dashboard Stats

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setStatsLoading(true);

        const response = await getDashboard();

        const dashboardData = response?.data;

        if (dashboardData && typeof dashboardData === "object") {
          setStats({
            totalWorkspaces: dashboardData.totalWorkspaces ?? 0,
            totalProjects: dashboardData.totalProjects ?? 0,
            totalTasks: dashboardData.totalTasks ?? 0,
            completedTasks: dashboardData.completedTasks ?? 0,
            pendingTasks: dashboardData.pendingTasks ?? 0,
            overdueTasks: dashboardData.overdueTasks ?? 0,
          });
        }
      } catch (error) {
        console.error(
          "Failed to fetch dashboard:",
          error.response?.data || error,
        );
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // My Tasks

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        setTasksLoading(true);

        const response = await getMyTasks();

        const taskList = response?.data || [];

        setTasks(Array.isArray(taskList) ? taskList : []);
      } catch (error) {
        console.error(
          "Failed to fetch my tasks:",
          error.response?.data || error,
        );

        setTasks([]);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchMyTasks();
  }, []);

  // My Projects

  useEffect(() => {
    const fetchMyProjects = async () => {
      try {
        setProjectsLoading(true);

        const response = await getMyProjects();

        const projectList = response?.data || [];

        setProjects(Array.isArray(projectList) ? projectList : []);
      } catch (error) {
        console.error(
          "Failed to fetch my projects:",
          error.response?.data || error,
        );

        setProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchMyProjects();
  }, []);

  // Stats Cards

  const statData = [
    {
      label: "My Tasks",
      value: stats.totalTasks,
      description: `${stats.pendingTasks} pending tasks`,
      icon: FiCheckCircle,
    },
    {
      label: "Completed Tasks",
      value: stats.completedTasks,
      description: `${stats.overdueTasks} overdue tasks`,
      icon: FiClock,
    },
    {
      label: "Projects",
      value: stats.totalProjects || projects.length,
      description: `${stats.totalWorkspaces} workspaces`,
      icon: FiFolder,
    },
    {
      label: "Pending Tasks",
      value: stats.pendingTasks,
      description: `${stats.overdueTasks} overdue`,
      icon: FiUsers,
    },
  ];

  // Upcoming Tasks

  const upcomingTasks = [...tasks]
    .filter((task) => task.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  return (
    <div className="p-6">
      {/* Header */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Good morning, {userName} 👋
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Here's what needs your attention today.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800">
          <FiPlus size={17} />
          New Task
        </button>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statData.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>

                  <h2 className="mt-2 text-3xl font-semibold text-gray-900">
                    {statsLoading ? "—" : stat.value}
                  </h2>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <Icon size={18} />
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Tasks + Upcoming */}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* My Tasks */}

        <div className="rounded-xl border border-gray-200 bg-white xl:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-200 p-5">
            <div>
              <h2 className="font-semibold text-gray-900">My Tasks</h2>

              <p className="mt-1 text-xs text-gray-500">
                Tasks that need your attention
              </p>
            </div>

            <button className="flex items-center gap-1 text-sm font-medium text-gray-600 transition hover:text-gray-900">
              View all
              <FiArrowUpRight size={15} />
            </button>
          </div>

          {tasksLoading ? (
            <div className="p-5 text-sm text-gray-500">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="p-5 text-sm text-gray-500">
              No tasks assigned to you.
            </div>
          ) : (
            tasks.slice(0, 5).map((task, index) => (
              <div
                key={task._id}
                className={`flex items-center justify-between gap-4 p-5 ${
                  index !== Math.min(tasks.length, 5) - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      task.status?.toLowerCase() === "completed"
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {task.status?.toLowerCase() === "completed" && (
                      <FiCheckCircle size={13} />
                    )}
                  </button>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-medium text-gray-900">
                      {task.title}
                    </h3>

                    <p className="mt-1 truncate text-xs text-gray-500">
                      {task.project?.name || "No project"}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <span
                    className={`hidden rounded-full px-2.5 py-1 text-xs sm:inline-block ${
                      task.priority?.toLowerCase() === "high"
                        ? "bg-red-50 text-red-600"
                        : task.priority?.toLowerCase() === "medium"
                          ? "bg-yellow-50 text-yellow-600"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {task.priority || "low"}
                  </span>

                  <span className="text-xs text-gray-500">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })
                      : "No due date"}
                  </span>

                  <FiMoreHorizontal size={18} className="text-gray-400" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Upcoming */}

        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900">Upcoming</h2>

            <p className="mt-1 text-xs text-gray-500">Upcoming deadlines</p>
          </div>

          {tasksLoading ? (
            <div className="p-5 text-sm text-gray-500">
              Loading deadlines...
            </div>
          ) : upcomingTasks.length === 0 ? (
            <div className="p-5 text-sm text-gray-500">
              No upcoming deadlines.
            </div>
          ) : (
            upcomingTasks.map((task) => (
              <div
                key={task._id}
                className="border-b border-gray-100 p-5 last:border-0"
              >
                <p className="text-xs font-medium uppercase text-gray-400">
                  {new Date(task.dueDate).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "2-digit",
                  })}
                </p>

                <h3 className="mt-2 truncate text-sm font-medium text-gray-900">
                  {task.project?.name || "Task"}
                </h3>

                <p className="mt-1 truncate text-xs text-gray-500">
                  {task.title}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* My Projects */}

      <div className="mt-6 rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <div>
            <h2 className="font-semibold text-gray-900">My Projects</h2>

            <p className="mt-1 text-xs text-gray-500">
              Projects you're currently part of
            </p>
          </div>

          <button className="flex items-center gap-1 text-sm font-medium text-gray-600 transition hover:text-gray-900">
            View all
            <FiArrowUpRight size={15} />
          </button>
        </div>

        {projectsLoading ? (
          <div className="p-5 text-sm text-gray-500">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <FiFolder size={18} className="text-gray-500" />
            </div>

            <h3 className="mt-3 text-sm font-medium text-gray-900">
              No projects found
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              You are not currently part of any projects.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 divide-y divide-gray-100 md:grid-cols-3 md:divide-x md:divide-y-0">
            {projects.slice(0, 3).map((project) => (
              <div
                key={project._id}
                className="p-5 transition hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-medium text-gray-900">
                      {project.name}
                    </h3>

                    <div className="mt-1 flex items-center gap-1.5">
                      <FiFolder size={12} className="shrink-0 text-gray-400" />

                      <p className="truncate text-xs text-gray-500">
                        {project.workspace?.name || "No workspace"}
                      </p>
                    </div>
                  </div>

                  <button className="shrink-0 text-gray-400 transition hover:text-gray-700">
                    <FiMoreHorizontal size={18} />
                  </button>
                </div>

                {project.description && (
                  <p className="mt-4 line-clamp-2 text-xs leading-5 text-gray-500">
                    {project.description}
                  </p>
                )}

                <div className="mt-5 flex items-center justify-between">
                  <div className="flex min-w-0 items-center gap-2">
                    {project.createdBy?.avatar?.url ? (
                      <img
                        src={project.createdBy.avatar.url}
                        alt={project.createdBy.fullName || "User"}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-[10px] font-medium text-gray-600">
                        {project.createdBy?.fullName
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </div>
                    )}

                    <span className="truncate text-xs text-gray-500">
                      {project.createdBy?.fullName || "Unknown"}
                    </span>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      project.status?.toLowerCase() === "active"
                        ? "bg-green-50 text-green-600"
                        : project.status?.toLowerCase() === "completed"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {project.status || "Active"}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                  <span>
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : "No start date"}
                  </span>

                  <span>→</span>

                  <span>
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "No end date"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
