import {
  FiActivity,
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiDownload,
  FiEdit2,
  FiFile,
  FiMoreHorizontal,
  FiPaperclip,
  FiSend,
  FiTag,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

const TaskDetails = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const [comment, setComment] = useState("");

  const task = {
    id: taskId,
    title: "Design landing page",
    description:
      "Create a modern and responsive landing page for the website redesign. The page should follow the new design system and work correctly across desktop, tablet, and mobile devices.",
    project: "Website Redesign",
    status: "In Progress",
    priority: "High",
    assignee: {
      name: "Tejas Abhale",
      initials: "TA",
    },
    dueDate: "September 3, 2026",
    labels: ["Frontend", "Design", "UI/UX"],
  };

  const comments = [
    {
      id: 1,
      user: "Rahul Patil",
      initials: "RP",
      text: "The desktop version looks good. We should also check the mobile layout.",
      time: "2 hours ago",
    },
    {
      id: 2,
      user: "Tejas Abhale",
      initials: "TA",
      text: "Yes, I'll handle the responsive version next.",
      time: "1 hour ago",
    },
  ];

  const attachments = [
    {
      id: 1,
      name: "landing-page-design.fig",
      size: "2.4 MB",
      type: "Figma",
    },
    {
      id: 2,
      name: "homepage-reference.png",
      size: "840 KB",
      type: "PNG",
    },
  ];

  const activities = [
    {
      id: 1,
      user: "Tejas Abhale",
      action: "created this task",
      time: "Yesterday",
    },
    {
      id: 2,
      user: "Rahul Patil",
      action: "assigned this task to Tejas Abhale",
      time: "Yesterday",
    },
    {
      id: 3,
      user: "Tejas Abhale",
      action: "changed status to In Progress",
      time: "5 hours ago",
    },
  ];

  const handleComment = () => {
    if (!comment.trim()) return;

    console.log("Comment:", comment);

    setComment("");
  };

  return (
    <div className="p-6">
      {/* Back */}
      <button
        onClick={() => navigate("/tasks")}
        className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
      >
        <FiArrowLeft size={16} />
        Back to Tasks
      </button>

      {/* Header */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">{task.project}</span>

              <span className="text-gray-300">/</span>

              <span className="text-sm text-gray-500">Task</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              {task.title}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500">
              {task.description}
            </p>
          </div>

          <div className="relative flex shrink-0 gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50">
              <FiEdit2 size={15} />
              Edit
            </button>

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50"
            >
              <FiMoreHorizontal size={18} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-11 z-20 w-44 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-50">
                  <FiEdit2 size={15} />
                  Edit Task
                </button>

                <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                  <FiTrash2 size={15} />
                  Delete Task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 xl:col-span-2">
          {/* Description */}
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold text-gray-900">Description</h2>

            <p className="mt-4 text-sm leading-7 text-gray-600">
              {task.description}
            </p>
          </section>

          {/* Comments */}
          <section className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Comments</h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Discuss this task with your team.
                  </p>
                </div>

                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                  {comments.length}
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {comments.map((item) => (
                <div key={item.id} className="flex gap-3 p-6">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold">
                    {item.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.user}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {item.time}
                        </p>
                      </div>

                      <button className="text-gray-400 hover:text-gray-700">
                        <FiMoreHorizontal size={17} />
                      </button>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Input */}
            <div className="border-t border-gray-100 p-5">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                  TA
                </div>

                <div className="flex flex-1 gap-2">
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleComment();
                      }
                    }}
                    placeholder="Write a comment..."
                    className="min-w-0 flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                  />

                  <button
                    onClick={handleComment}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black text-white hover:bg-gray-800"
                  >
                    <FiSend size={16} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Attachments */}
          <section className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <div>
                <h2 className="font-semibold text-gray-900">Attachments</h2>

                <p className="mt-1 text-xs text-gray-500">
                  Files attached to this task.
                </p>
              </div>

              <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50">
                <FiPaperclip size={15} />
                Upload
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      <FiFile size={18} className="text-gray-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {file.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {file.type} • {file.size}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                      <FiDownload size={17} />
                    </button>

                    <button className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
                      <FiTrash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Activity */}
          <section className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center gap-2">
                <FiActivity size={18} />

                <h2 className="font-semibold">Activity</h2>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold">
                    {activity.user
                      .split(" ")
                      .map((word) => word[0])
                      .join("")}
                  </div>

                  <div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium text-gray-900">
                        {activity.user}
                      </span>{" "}
                      {activity.action}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Status */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="font-semibold text-gray-900">Task Details</h2>

            <div className="mt-5 space-y-5">
              {/* Status */}
              <DetailItem icon={FiCheckCircle} label="Status">
                <button className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700">
                  {task.status}
                </button>
              </DetailItem>

              {/* Priority */}
              <DetailItem icon={FiActivity} label="Priority">
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                  {task.priority}
                </span>
              </DetailItem>

              {/* Assignee */}
              <DetailItem icon={FiUser} label="Assignee">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold">
                    {task.assignee.initials}
                  </div>

                  <span className="text-sm text-gray-700">
                    {task.assignee.name}
                  </span>
                </div>
              </DetailItem>

              {/* Due Date */}
              <DetailItem icon={FiCalendar} label="Due Date">
                <span className="text-sm text-gray-700">{task.dueDate}</span>
              </DetailItem>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-5">
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
                <FiCheck size={16} />
                Mark as Completed
              </button>
            </div>
          </div>

          {/* Labels */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiTag size={17} />

                <h2 className="font-semibold">Labels</h2>
              </div>

              <button className="text-gray-400 hover:text-gray-900">
                <FiEdit2 size={15} />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {task.labels.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Project */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-xs text-gray-400">Project</p>

            <button
              onClick={() => navigate("/projects/1")}
              className="mt-2 text-sm font-medium text-gray-900 hover:underline"
            >
              {task.project}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

const DetailItem = ({ icon: Icon, label, children }) => {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Icon size={14} />
        {label}
      </div>

      <div className="mt-2">{children}</div>
    </div>
  );
};

export default TaskDetails;
