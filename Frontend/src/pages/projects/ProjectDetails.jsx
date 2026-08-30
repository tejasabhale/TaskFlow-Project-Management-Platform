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
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Temporary data.
  // We will replace this with API data later.
  const project = {
    id: projectId,
    name: "Website Redesign",
    description:
      "Redesign and improve the company website with a modern, responsive interface.",
    status: "Active",
    progress: 68,
    totalTasks: 24,
    completedTasks: 16,
    members: 6,
    dueDate: "September 15, 2026",
  };

  const tasks = [
    {
      id: "1",
      title: "Design landing page",
      status: "In Progress",
      priority: "High",
      assignee: "TA",
      dueDate: "Today",
    },
    {
      id: "2",
      title: "Implement navbar",
      status: "Completed",
      priority: "Medium",
      assignee: "RP",
      dueDate: "Aug 28",
    },
    {
      id: "3",
      title: "Create responsive layout",
      status: "To Do",
      priority: "High",
      assignee: "PS",
      dueDate: "Sep 3",
    },
    {
      id: "4",
      title: "Add animations",
      status: "To Do",
      priority: "Low",
      assignee: "AJ",
      dueDate: "Sep 7",
    },
  ];

  const activities = [
    {
      id: 1,
      user: "Tejas Abhale",
      action: "created this project",
      time: "2 days ago",
    },
    {
      id: 2,
      user: "Rahul Patil",
      action: "completed Implement navbar",
      time: "5 hours ago",
    },
    {
      id: 3,
      user: "Priya Shah",
      action: "was assigned to Create responsive layout",
      time: "2 hours ago",
    },
  ];

  const members = [
    {
      id: 1,
      name: "Tejas Abhale",
      email: "tejas@example.com",
      role: "Owner",
      initials: "TA",
    },
    {
      id: 2,
      name: "Rahul Patil",
      email: "rahul@example.com",
      role: "Admin",
      initials: "RP",
    },
    {
      id: 3,
      name: "Priya Shah",
      email: "priya@example.com",
      role: "Member",
      initials: "PS",
    },
    {
      id: 4,
      name: "Aditya Joshi",
      email: "aditya@example.com",
      role: "Member",
      initials: "AJ",
    },
  ];

  const labels = ["Frontend", "Design", "UI/UX", "Priority"];

  const tabs = [
    {
      id: "overview",
      label: "Overview",
    },
    {
      id: "tasks",
      label: "Tasks",
    },
    {
      id: "members",
      label: "Members",
    },
    {
      id: "activity",
      label: "Activity",
    },
  ];

  return (
    <div className="p-6">
      {/* Back */}
      <button
        onClick={() => navigate("/projects")}
        className="mb-6 flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-900"
      >
        <FiArrowLeft size={16} />
        Back to Projects
      </button>

      {/* Project Header */}
      <div className="relative rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                {project.name}
              </h1>

              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                {project.status}
              </span>
            </div>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
              {project.description}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <FiCalendar size={16} />
                Due {project.dueDate}
              </div>

              <div className="flex items-center gap-2">
                <FiUsers size={16} />
                {project.members} members
              </div>

              <div className="flex items-center gap-2">
                <FiCheckCircle size={16} />
                {project.completedTasks}/{project.totalTasks} completed
              </div>
            </div>
          </div>

          <div className="relative flex shrink-0 gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
              <FiEdit2 size={15} />
              Edit
            </button>

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
            >
              <FiMoreHorizontal size={18} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-11 z-20 w-44 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <FiEdit2 size={15} />
                  Edit Project
                </button>

                <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                  <FiTrash2 size={15} />
                  Delete Project
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-7 border-t border-gray-100 pt-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Project Progress
            </span>

            <span className="text-sm font-semibold text-gray-900">
              {project.progress}%
            </span>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gray-900 transition-all"
              style={{
                width: `${project.progress}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Stats */}
          <div className="xl:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                icon={FiCheckCircle}
                label="Total Tasks"
                value={project.totalTasks}
              />

              <StatCard
                icon={FiCheckCircle}
                label="Completed"
                value={project.completedTasks}
              />

              <StatCard
                icon={FiClock}
                label="Remaining"
                value={project.totalTasks - project.completedTasks}
              />
            </div>

            {/* Recent Tasks */}
            <div className="mt-6 rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-200 p-5">
                <div>
                  <h2 className="font-semibold text-gray-900">Recent Tasks</h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Latest tasks in this project
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab("tasks")}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  View all
                </button>
              </div>

              {tasks.slice(0, 3).map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <LabelsCard labels={labels} />

            <MembersCard
              members={members}
              onViewAll={() => setActiveTab("members")}
            />
          </div>
        </div>
      )}

      {/* Tasks */}
      {activeTab === "tasks" && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Project Tasks</h2>

              <p className="mt-1 text-xs text-gray-500">
                Manage all tasks belonging to this project.
              </p>
            </div>

            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              <FiPlus size={16} />
              Add Task
            </button>
          </div>

          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onClick={() => navigate(`/tasks/${task.id}`)}
            />
          ))}
        </div>
      )}

      {/* Members */}
      {activeTab === "members" && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 p-5">
            <div>
              <h2 className="font-semibold">Project Members</h2>

              <p className="mt-1 text-xs text-gray-500">
                Members working on this project.
              </p>
            </div>

            <button className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white">
              <FiPlus size={16} />
              Add Member
            </button>
          </div>

          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between border-b border-gray-100 p-5 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold">
                  {member.initials}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {member.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                  {member.role}
                </span>

                <button className="text-gray-400 hover:text-gray-700">
                  <FiMoreHorizontal size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity */}
      {activeTab === "activity" && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-5">
            <div className="flex items-center gap-2">
              <FiActivity size={18} />

              <h2 className="font-semibold">Project Activity</h2>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-4 p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold">
                  {activity.user
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </div>

                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">
                      {activity.user}
                    </span>{" "}
                    {activity.action}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <CreateTaskModal onClose={() => setShowTaskModal(false)} />
      )}
    </div>
  );
};

/* =========================
   Components
========================= */

const StatCard = ({ icon: Icon, label, value }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
          <Icon size={17} />
        </div>
      </div>

      <p className="mt-3 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
};

const TaskRow = ({ task, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 border-b border-gray-100 p-5 text-left transition last:border-0 hover:bg-gray-50"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="h-5 w-5 shrink-0 rounded-full border border-gray-300" />

        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-gray-900">
            {task.title}
          </h3>

          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-gray-500">{task.dueDate}</span>

            <span className="text-gray-300">•</span>

            <span className="text-xs text-gray-500">{task.assignee}</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 sm:inline-block">
          {task.priority}
        </span>

        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
          {task.status}
        </span>

        <FiMoreHorizontal size={17} className="text-gray-400" />
      </div>
    </button>
  );
};

const LabelsCard = ({ labels }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Labels</h2>

        <button className="text-gray-400 hover:text-gray-900">
          <FiPlus size={17} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {labels.map((label) => (
          <span
            key={label}
            className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

const MembersCard = ({ members, onViewAll }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Members</h2>

        <button
          onClick={onViewAll}
          className="text-xs font-medium text-gray-500 hover:text-gray-900"
        >
          View all
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {members.slice(0, 4).map((member) => (
          <div key={member.id} className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold">
              {member.initials}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-800">
                {member.name}
              </p>

              <p className="text-xs text-gray-400">{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CreateTaskModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="font-semibold text-gray-900">Create Task</h2>

            <p className="mt-1 text-xs text-gray-500">
              Add a new task to this project.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Task Title</label>

            <input
              placeholder="Enter task title"
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              rows="4"
              placeholder="Describe the task..."
              className="w-full resize-none rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Priority</label>

              <select className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Due Date</label>

              <input
                type="date"
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t p-5">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>

          <button className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
