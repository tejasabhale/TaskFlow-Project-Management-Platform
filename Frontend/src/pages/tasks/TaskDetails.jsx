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
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  uploadAttachment,
  deleteAttachment,
} from "../../services/task.service";

import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
} from "../../services/comment.service";

const TaskDetails = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showMenu, setShowMenu] = useState(false);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const [uploading, setUploading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingTask, setDeletingTask] = useState(false);

  /*
   * Fetch task
   */
  const fetchTask = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getTaskById(taskId);

      setTask(response.data || null);
    } catch (error) {
      console.error("Failed to fetch task:", error);
      setError("Failed to load task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /*
   * Fetch comments
   */
  const fetchComments = async () => {
    try {
      setCommentsLoading(true);

      const response = await getComments(taskId);

      const commentList = response.data || [];

      setComments(Array.isArray(commentList) ? commentList : []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (!taskId) return;

    fetchTask();
    fetchComments();
  }, [taskId]);

  /*
   * Helpers
   */
  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (char) => char.toUpperCase());
  };

  const formatPriority = (priority) => {
    if (!priority) return "Unknown";

    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const formatDate = (date) => {
    if (!date) return "No due date";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getInitials = (name) => {
    if (!name) return "?";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  /*
   * Add comment
   */
  const handleComment = async () => {
    if (!comment.trim()) return;

    try {
      setSubmittingComment(true);

      const response = await addComment(taskId, comment.trim());

      if (response.data) {
        setComments((prev) => [response.data, ...prev]);
      }

      setComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  /*
   * Edit comment
   */
  const handleUpdateComment = async (commentId) => {
    if (!editingContent.trim()) return;

    try {
      const response = await updateComment(commentId, editingContent.trim());

      if (response.data) {
        setComments((prev) =>
          prev.map((item) => (item._id === commentId ? response.data : item)),
        );
      }

      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  /*
   * Delete comment
   */
  const handleDeleteComment = async (commentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?",
    );

    if (!confirmed) return;

    try {
      await deleteComment(commentId);

      setComments((prev) => prev.filter((item) => item._id !== commentId));
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  /*
   * Update status
   */
  const handleStatusChange = async (status) => {
    try {
      setUpdatingStatus(true);

      const response = await updateTaskStatus(taskId, status);

      if (response.data) {
        setTask((prev) => ({
          ...prev,
          ...response.data,
        }));
      } else {
        setTask((prev) => ({
          ...prev,
          status,
        }));
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  /*
   * Mark completed
   */
  const handleMarkCompleted = () => {
    handleStatusChange("completed");
  };

  /*
   * Delete task
   */
  const handleDeleteTask = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) return;

    try {
      setDeletingTask(true);

      await deleteTask(taskId);

      navigate("/tasks");
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setDeletingTask(false);
    }
  };

  /*
   * Upload attachments
   */
  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    try {
      setUploading(true);

      const response = await uploadAttachment(taskId, files);

      if (response.data) {
        setTask((prev) => ({
          ...prev,
          attachments: response.data,
        }));
      } else {
        await fetchTask();
      }
    } catch (error) {
      console.error("Failed to upload attachment:", error);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  /*
   * Delete attachment
   */
  const handleDeleteAttachment = async (attachmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this attachment?",
    );

    if (!confirmed) return;

    try {
      await deleteAttachment(taskId, attachmentId);

      setTask((prev) => ({
        ...prev,
        attachments: (prev.attachments || []).filter(
          (attachment) => attachment._id !== attachmentId,
        ),
      }));
    } catch (error) {
      console.error("Failed to delete attachment:", error);
    }
  };

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">Loading task...</p>
      </div>
    );
  }

  /*
   * Error
   */
  if (error || !task) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <p className="text-sm text-red-500">{error || "Task not found."}</p>

        <button
          onClick={() => navigate("/tasks")}
          className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  const isCompleted = task.status === "completed";

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
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <span>{task.project?.name || "No project"}</span>
            <span>/</span>
            <span>Task</span>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900">{task.title}</h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
            {task.description || "No description available."}
          </p>
        </div>

        <div className="relative flex shrink-0 items-center gap-2">
          <button
            className="rounded-lg border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-50"
            title="Edit task"
          >
            <FiEdit2 size={17} />
          </button>

          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="rounded-lg border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-50"
          >
            <FiMoreHorizontal size={18} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-11 z-20 w-40 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
              <button
                onClick={handleDeleteTask}
                disabled={deletingTask}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <FiTrash2 size={15} />
                {deletingTask ? "Deleting..." : "Delete task"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="space-y-6">
          {/* Description */}
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <FiFile size={16} />
              Description
            </h2>

            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-600">
              {task.description || "No description available."}
            </p>
          </section>

          {/* Comments */}
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <FiActivity size={16} />
              Comments
            </h2>

            {/* Add comment */}
            <div className="mb-6 flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-700">
                Me
              </div>

              <div className="flex flex-1 gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleComment();
                    }
                  }}
                  placeholder="Write a comment..."
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />

                <button
                  onClick={handleComment}
                  disabled={submittingComment || !comment.trim()}
                  className="flex items-center justify-center rounded-lg bg-black px-3 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiSend size={16} />
                </button>
              </div>
            </div>

            {/* Comments list */}
            {commentsLoading ? (
              <p className="py-6 text-center text-sm text-gray-500">
                Loading comments...
              </p>
            ) : comments.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                No comments yet.
              </div>
            ) : (
              <div className="space-y-5">
                {comments.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-700">
                      {getInitials(item.user?.fullName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {item.user?.fullName || "Unknown user"}
                          </span>

                          <span className="ml-2 text-xs text-gray-400">
                            {formatDateTime(item.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingCommentId(item._id);
                              setEditingContent(item.content);
                            }}
                            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          >
                            <FiEdit2 size={14} />
                          </button>

                          <button
                            onClick={() => handleDeleteComment(item._id)}
                            className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {editingCommentId === item._id ? (
                        <div className="mt-2 flex gap-2">
                          <input
                            value={editingContent}
                            onChange={(event) =>
                              setEditingContent(event.target.value)
                            }
                            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                          />

                          <button
                            onClick={() => handleUpdateComment(item._id)}
                            className="rounded-lg bg-black px-3 text-xs font-medium text-white"
                          >
                            Save
                          </button>

                          <button
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditingContent("");
                            }}
                            className="rounded-lg border border-gray-200 px-3 text-gray-500"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ) : (
                        <p className="mt-1 text-sm leading-6 text-gray-600">
                          {item.content}
                          {item.isEdited && (
                            <span className="ml-2 text-xs text-gray-400">
                              edited
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Attachments */}
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <FiPaperclip size={16} />
                Attachments
              </h2>

              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
                <FiPaperclip size={14} />
                {uploading ? "Uploading..." : "Upload"}

                <input
                  type="file"
                  multiple
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {task.attachments?.length > 0 ? (
              <div className="space-y-3">
                {task.attachments.map((attachment) => (
                  <div
                    key={attachment._id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <FiFile size={16} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {attachment.name ||
                            attachment.fileName ||
                            "Attachment"}
                        </p>

                        {attachment.size && (
                          <p className="text-xs text-gray-400">
                            {attachment.size}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {attachment.url && (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        >
                          <FiDownload size={15} />
                        </a>
                      )}

                      <button
                        onClick={() => handleDeleteAttachment(attachment._id)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-gray-500">
                No attachments.
              </div>
            )}
          </section>

          {/* Activity */}
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <FiActivity size={16} />
              Activity
            </h2>

            <div className="space-y-4">
              <ActivityItem
                user={task.createdBy?.fullName}
                action="created this task"
                time={task.createdAt}
              />

              {task.updatedAt && task.updatedAt !== task.createdAt && (
                <ActivityItem
                  user={task.updatedBy?.fullName || "System"}
                  action="updated this task"
                  time={task.updatedAt}
                />
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Task details */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-5 text-sm font-semibold text-gray-900">
              Task Details
            </h2>

            <div className="space-y-5">
              <DetailItem icon={FiCheckCircle} label="Status">
                <select
                  value={task.status || ""}
                  onChange={(event) => handleStatusChange(event.target.value)}
                  disabled={updatingStatus}
                  className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs outline-none"
                >
                  <option value="toDo">To Do</option>
                  <option value="inProgress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </DetailItem>

              <DetailItem icon={FiActivity} label="Priority">
                <span className="text-sm text-gray-700">
                  {formatPriority(task.priority)}
                </span>
              </DetailItem>

              <DetailItem icon={FiUser} label="Assignee">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-[10px] font-medium">
                    {getInitials(task.assignedTo?.fullName)}
                  </div>

                  <span className="text-sm text-gray-700">
                    {task.assignedTo?.fullName || "Unassigned"}
                  </span>
                </div>
              </DetailItem>

              <DetailItem icon={FiCalendar} label="Due Date">
                <span className="text-sm text-gray-700">
                  {formatDate(task.dueDate)}
                </span>
              </DetailItem>
            </div>
          </section>

          {/* Complete */}
          {!isCompleted && (
            <button
              onClick={handleMarkCompleted}
              disabled={updatingStatus}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              <FiCheck size={16} />
              {updatingStatus ? "Updating..." : "Mark as Completed"}
            </button>
          )}

          {isCompleted && (
            <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700">
              <FiCheckCircle size={16} />
              Completed
            </div>
          )}

          {/* Labels */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <FiTag size={16} />
              Labels
            </h2>

            {task.labels?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {task.labels.map((label, index) => (
                  <span
                    key={label?._id || index}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                  >
                    {typeof label === "string" ? label : label.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No labels.</p>
            )}
          </section>

          {/* Project */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">
              Project
            </h2>

            {task.project ? (
              <button
                onClick={() => navigate(`/projects/${task.project._id}`)}
                className="text-sm font-medium text-gray-700 hover:text-black hover:underline"
              >
                {task.project.name}
              </button>
            ) : (
              <p className="text-sm text-gray-400">No project</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
};

/*
 * Detail item
 */
const DetailItem = ({ icon: Icon, label, children }) => {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
        <Icon size={14} />
        {label}
      </div>

      <div>{children}</div>
    </div>
  );
};

/*
 * Activity item
 */
const ActivityItem = ({ user, action, time }) => {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-700">
        {user
          ? user
              .split(" ")
              .map((word) => word[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          : "?"}
      </div>

      <div>
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">
            {user || "Unknown user"}
          </span>{" "}
          {action}
        </p>

        <p className="mt-1 text-xs text-gray-400">{formatActivityDate(time)}</p>
      </div>
    </div>
  );
};

const formatActivityDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default TaskDetails;
