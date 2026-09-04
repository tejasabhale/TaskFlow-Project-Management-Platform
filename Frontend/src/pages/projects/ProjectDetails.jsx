import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FiActivity,
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiMoreHorizontal,
  FiPlus,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { deleteProject, getProjectById } from "../../services/project.service";

import { getWorkspaceMembers } from "../../services/workspace.service";

import { createTask, getAllTasks } from "../../services/task.service";

import { useWorkspace } from "../../hooks/useWorkspace";

const STATUS_LABELS = {
  todo: "To Do",
  inProgress: "In Progress",
  completed: "Completed",
  blocked: "Blocked",
};

const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const formatDate = (date) => {
  if (!date) return "No date";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getInitials = (name = "") => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const getStatusLabel = (status) => {
  return (
    STATUS_LABELS[status] ||
    status
      ?.replace(/([A-Z])/g, " $1")
      .replace(/^./, (char) => char.toUpperCase()) ||
    "Unknown"
  );
};

const getPriorityLabel = (priority) => {
  return PRIORITY_LABELS[priority] || priority || "Medium";
};

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);

  const [activeTab, setActiveTab] = useState("overview");

  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);

  const [error, setError] = useState("");

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [deleting, setDeleting] = useState(false);

  /*
   * Fetch project
   */
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProjectById(projectId);

        setProject(response?.data || null);
      } catch (error) {
        console.error("Failed to fetch project:", error);

        setError(error?.response?.data?.message || "Failed to load project.");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  /*
   * Fetch project tasks
   */
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setTasksLoading(true);

        const response = await getAllTasks(projectId, 1, 100);

        setTasks(response?.data?.tasks || []);
      } catch (error) {
        console.error("Failed to fetch project tasks:", error);

        setTasks([]);
      } finally {
        setTasksLoading(false);
      }
    };

    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  /*
   * Fetch workspace members
   */
  useEffect(() => {
    const fetchMembers = async () => {
      const workspaceId = project?.workspace?._id || activeWorkspace?._id;

      if (!workspaceId) {
        setMembers([]);
        return;
      }

      try {
        setMembersLoading(true);

        const response = await getWorkspaceMembers(workspaceId);

        setMembers(response?.data || []);
      } catch (error) {
        console.error("Failed to fetch workspace members:", error);

        setMembers([]);
      } finally {
        setMembersLoading(false);
      }
    };

    if (project) {
      fetchMembers();
    }
  }, [project, activeWorkspace?._id]);

  /*
   * Derived statistics
   */
  const completedTasks = useMemo(() => {
    return tasks.filter((task) => task.status === "completed").length;
  }, [tasks]);

  const totalTasks = tasks.length;

  const progress = useMemo(() => {
    if (!totalTasks) return 0;

    return Math.round((completedTasks / totalTasks) * 100);
  }, [completedTasks, totalTasks]);

  /*
   * Delete project
   */
  const handleDeleteProject = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project?.name}"?`,
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await deleteProject(projectId);

      navigate("/projects");
    } catch (error) {
      console.error("Failed to delete project:", error);

      alert(error?.response?.data?.message || "Failed to delete project.");
    } finally {
      setDeleting(false);
    }
  };

  /*
   * Create task
   */
  const handleCreateTask = async (taskData) => {
    try {
      const response = await createTask(projectId, taskData);

      const newTask = response?.data;

      if (newTask) {
        setTasks((prev) => [newTask, ...prev]);
      } else {
        const refreshed = await getAllTasks(projectId, 1, 100);

        setTasks(refreshed?.data?.tasks || []);
      }

      setShowTaskModal(false);
    } catch (error) {
      console.error("Failed to create task:", error);

      throw error;
    }
  };

  if (loading) {
    return <ProjectDetailsSkeleton />;
  }

  if (error || !project) {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Project not found."}</p>

          <button
            onClick={() => navigate("/projects")}
            className="px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-5">
          {/* Top row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate("/projects")}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <FiArrowLeft size={20} />
              </button>

              <div className="min-w-0">
                <h1 className="text-2xl font-semibold truncate">
                  {project.name}
                </h1>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {project.description || "No description"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Status */}
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  project.status === "Active"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {project.status}
              </span>

              {/* Edit */}
              <button
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                title="Edit project"
              >
                <FiEdit2 size={18} />
              </button>

              {/* Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <FiMoreHorizontal size={20} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-11 z-20 w-44 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg p-1">
                    <button
                      onClick={handleDeleteProject}
                      disabled={deleting}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <FiTrash2 size={16} />

                      {deleting ? "Deleting..." : "Delete Project"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Progress
              </span>

              <span className="text-sm font-medium">{progress}%</span>
            </div>

            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-black dark:bg-white transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-7">
            {[
              ["overview", "Overview"],
              ["tasks", "Tasks"],
              ["members", "Members"],
              ["activity", "Activity"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`pb-3 text-sm font-medium border-b-2 transition ${
                  activeTab === value
                    ? "border-black text-black dark:border-white dark:text-white"
                    : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === "overview" && (
          <OverviewTab
            project={project}
            tasks={tasks}
            members={members}
            progress={progress}
            completedTasks={completedTasks}
            totalTasks={totalTasks}
            tasksLoading={tasksLoading}
            membersLoading={membersLoading}
            navigate={navigate}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "tasks" && (
          <TasksTab
            tasks={tasks}
            loading={tasksLoading}
            navigate={navigate}
            onAddTask={() => setShowTaskModal(true)}
          />
        )}

        {activeTab === "members" && (
          <MembersTab members={members} loading={membersLoading} />
        )}

        {activeTab === "activity" && <ActivityTab />}
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <CreateTaskModal
          onClose={() => setShowTaskModal(false)}
          onSubmit={handleCreateTask}
        />
      )}
    </div>
  );
}

/* =========================================================
   OVERVIEW
========================================================= */

function OverviewTab({
  project,
  tasks,
  members,
  progress,
  completedTasks,
  totalTasks,
  tasksLoading,
  membersLoading,
  navigate,
  setActiveTab,
}) {
  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FiCheckCircle />}
          label="Total Tasks"
          value={totalTasks}
        />

        <StatCard
          icon={<FiCheckCircle />}
          label="Completed"
          value={completedTasks}
        />

        <StatCard icon={<FiClock />} label="Progress" value={`${progress}%`} />

        <StatCard icon={<FiUsers />} label="Members" value={members.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent tasks */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-semibold">Recent Tasks</h2>

            <button
              onClick={() => setActiveTab("tasks")}
              className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              View all
            </button>
          </div>

          {tasksLoading ? (
            <div className="p-5 text-sm text-gray-500">Loading tasks...</div>
          ) : recentTasks.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No tasks in this project yet.
            </div>
          ) : (
            <div>
              {recentTasks.map((task) => (
                <TaskRow
                  key={task._id}
                  task={task}
                  onClick={() => navigate(`/tasks/${task._id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Project details */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <h2 className="font-semibold mb-5">Project Details</h2>

          <div className="space-y-4">
            <DetailRow
              icon={<FiCalendar />}
              label="Start Date"
              value={formatDate(project.startDate)}
            />

            <DetailRow
              icon={<FiCalendar />}
              label="End Date"
              value={formatDate(project.endDate)}
            />

            <DetailRow
              icon={<FiUsers />}
              label="Created By"
              value={project.createdBy?.fullName || "Unknown"}
            />

            <DetailRow
              icon={<FiClock />}
              label="Created"
              value={formatDate(project.createdAt)}
            />
          </div>
        </div>
      </div>

      {/* Members */}
      <MembersCard members={members} loading={membersLoading} />
    </div>
  );
}

/* =========================================================
   TASKS
========================================================= */

function TasksTab({ tasks, loading, navigate, onAddTask }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="font-semibold">Project Tasks</h2>

          <p className="text-sm text-gray-500 mt-1">
            {tasks.length} task
            {tasks.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={onAddTask}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:opacity-90 transition"
        >
          <FiPlus size={17} />
          Add Task
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-gray-500">
          Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <FiCheckCircle size={22} />
          </div>

          <h3 className="font-medium">No tasks yet</h3>

          <p className="text-sm text-gray-500 mt-1">
            Create the first task for this project.
          </p>

          <button
            onClick={onAddTask}
            className="mt-4 px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black text-sm"
          >
            Create Task
          </button>
        </div>
      ) : (
        <div>
          {tasks.map((task) => (
            <TaskRow
              key={task._id}
              task={task}
              onClick={() => navigate(`/tasks/${task._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MEMBERS
========================================================= */

function MembersTab({ members, loading }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="p-5 border-b border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold">Project Members</h2>

        <p className="text-sm text-gray-500 mt-1">
          Members from the project workspace
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-gray-500">
          Loading members...
        </div>
      ) : members.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500">
          No members found.
        </div>
      ) : (
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => {
            const user = member.user;

            return (
              <div
                key={member._id}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800"
              >
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
                    {getInitials(user?.fullName)}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {user?.fullName || "Unknown User"}
                  </p>

                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>

                  <p className="text-xs text-gray-400 capitalize mt-0.5">
                    {member.role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   ACTIVITY
========================================================= */

function ActivityTab() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="p-5 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <FiActivity />
          <h2 className="font-semibold">Project Activity</h2>
        </div>
      </div>

      <div className="p-12 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <FiActivity size={22} />
        </div>

        <h3 className="font-medium">No activity data available</h3>

        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
          A project activity API is not currently available. Connect an activity
          endpoint here when it is added to the backend.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   TASK ROW
========================================================= */

function TaskRow({ task, onClick }) {
  const assignee = task.assignedTo;

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-4 p-5 border-b last:border-b-0 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
    >
      <div
        className={`w-2 h-2 rounded-full shrink-0 ${
          task.status === "completed"
            ? "bg-green-500"
            : task.status === "inProgress"
              ? "bg-blue-500"
              : "bg-gray-400"
        }`}
      />

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{task.title}</p>

        <p className="text-xs text-gray-500 mt-1">
          {getStatusLabel(task.status)}
        </p>
      </div>

      <span
        className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
          task.priority === "urgent"
            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            : task.priority === "high"
              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
              : task.priority === "medium"
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
        }`}
      >
        {getPriorityLabel(task.priority)}
      </span>

      <div className="hidden md:flex items-center gap-2 w-40">
        {assignee?.avatar?.url ? (
          <img
            src={assignee.avatar.url}
            alt={assignee.fullName}
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-medium">
            {getInitials(assignee?.fullName)}
          </div>
        )}

        <span className="text-sm truncate">
          {assignee?.fullName || "Unassigned"}
        </span>
      </div>

      <div className="hidden lg:flex items-center gap-1 text-xs text-gray-500 w-28">
        <FiCalendar size={14} />
        {formatDate(task.dueDate)}
      </div>
    </button>
  );
}

/* =========================================================
   MEMBERS CARD
========================================================= */

function MembersCard({ members, loading }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="p-5 border-b border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold">Members</h2>
      </div>

      {loading ? (
        <div className="p-5 text-sm text-gray-500">Loading members...</div>
      ) : members.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500">
          No members found.
        </div>
      ) : (
        <div className="p-5 flex flex-wrap gap-4">
          {members.map((member) => {
            const user = member.user;

            return (
              <div key={member._id} className="flex items-center gap-3">
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.fullName}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium">
                    {getInitials(user?.fullName)}
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium">
                    {user?.fullName || "Unknown"}
                  </p>

                  <p className="text-xs text-gray-500 capitalize">
                    {member.role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>

          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>

        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

/* =========================================================
   CREATE TASK MODAL
========================================================= */

function CreateTaskModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        ...(dueDate ? { dueDate } : {}),
      });
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to create task.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="font-semibold">Create Task</h2>

            <p className="text-sm text-gray-500 mt-1">
              Add a new task to this project.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Title</label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent outline-none resize-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Priority</label>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Due Date</label>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2.5 rounded-lg bg-black text-white dark:bg-white dark:text-black text-sm font-medium disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function ProjectDetailsSkeleton() {
  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded" />

        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-800 rounded" />

        <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 rounded-2xl bg-gray-200 dark:bg-gray-800"
            />
          ))}
        </div>

        <div className="h-96 rounded-2xl bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}
