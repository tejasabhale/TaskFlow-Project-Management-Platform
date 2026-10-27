
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FolderKanban,
    Pencil,
    Trash2,
    UserRound,
    X,
    Save,
    RefreshCw,
    AlertCircle,
    ClipboardList,
} from "lucide-react";

import api from "../../api/axios";

const statusOptions = [
    { label: "To Do", value: "todo" },
    { label: "In Progress", value: "inProgress" },
    { label: "In Review", value: "review" },
    { label: "Completed", value: "completed" },
];

const priorityOptions = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
];

const statusStyles = {
    todo: {
        color: "var(--text-muted)",
        background: "var(--surface-muted)",
    },
    inProgress: {
        color: "var(--primary)",
        background: "var(--primary-soft, #e1f2ef)",
    },
    review: {
        color: "#c2410c",
        background: "#fff7ed",
    },
    completed: {
        color: "#047857",
        background: "#ecfdf5",
    },
};

const priorityStyles = {
    low: { color: "var(--text-muted)" },
    medium: { color: "#d97706" },
    high: { color: "#dc2626" },
};

const initialForm = {
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
};

const getId = (value) => {
    if (!value) return "";
    if (typeof value === "object") {
        return String(value._id || value.id || "");
    }
    return String(value);
};

function normalizeTask(response) {
    let result = response?.data ?? response;

    if (result?.data) result = result.data;
    if (result?.task) result = result.task;

    return result;
}

function getName(person) {
    if (!person) return "Not assigned";
    if (typeof person === "string") return person;

    return (
        person.fullName ||
        person.name ||
        person.userName ||
        person.username ||
        person.email ||
        "Unknown"
    );
}

function formatDate(value) {
    if (!value) return "Not set";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not set";

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

function formatDateTime(value) {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not available";

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function toDateInput(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function isOverdue(task) {
    if (!task?.dueDate || task.status === "completed") return false;

    const dueDate = new Date(task.dueDate);

    if (Number.isNaN(dueDate.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
}

export default function TaskDetails() {
    const params = useParams();
    const taskId = params.taskId || params.id;
    const navigate = useNavigate();

    const [task, setTask] = useState(null);
    const [form, setForm] = useState(initialForm);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadTask = useCallback(async (isRefresh = false) => {
        if (!taskId) {
            setError("Task ID is missing from the URL.");
            setLoading(false);
            return;
        }

        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        setError("");

        try {
            const response = await api.get(`/tasks/${taskId}`);
            const taskData = normalizeTask(response);

            if (!taskData?._id) {
                throw new Error("Task was not found.");
            }

            setTask(taskData);

            setForm({
                title: taskData.title || "",
                description: taskData.description || "",
                status: taskData.status || "todo",
                priority: taskData.priority || "medium",
                dueDate: toDateInput(taskData.dueDate),
            });
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to load task details."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [taskId]);

    useEffect(() => {
        loadTask();

    }, [loadTask]);

    const updateForm = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSave = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const title = form.title.trim();

        if (!title) {
            setError("Task title is required.");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                title,
                description: form.description.trim(),
                status: form.status,
                priority: form.priority,
                dueDate: form.dueDate || null,
            };

            const response = await api.patch(`/tasks/${taskId}`, payload);
            const updatedTask = normalizeTask(response);

            setTask((current) => ({
                ...current,
                ...payload,
                ...(updatedTask && typeof updatedTask === "object"
                    ? updatedTask
                    : {}),
            }));

            setEditing(false);
            setSuccess("Task updated successfully.");

            // Reload to display the latest server values.
            await loadTask(true);
            setSuccess("Task updated successfully.");
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to update task."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this task? This action cannot be undone."
        );

        if (!confirmed) return;

        setDeleting(true);
        setError("");

        try {
            await api.delete(`/tasks/${taskId}`);
            navigate("/dashboard/tasks", { replace: true });
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to delete task."
            );
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div
                className="flex min-h-64 items-center justify-center gap-3"
                style={{ color: "var(--text-muted)" }}
            >
                <RefreshCw size={20} className="animate-spin" />
                Loading task details...
            </div>
        );
    }

    if (!task) {
        return (
            <div className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
                <Link
                    to="/dashboard/tasks"
                    className="inline-flex items-center gap-2 text-sm"
                    style={{ color: "var(--primary)" }}
                >
                    <ArrowLeft size={16} />
                    Back to Tasks
                </Link>

                <div
                    className="rounded-xl border p-6"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                    }}
                >
                    <AlertCircle
                        size={26}
                        style={{ color: "#dc2626" }}
                    />
                    <h1 className="mt-3 text-lg font-semibold">
                        Unable to display task
                    </h1>
                    <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                        {error || "This task could not be found."}
                    </p>

                    <button
                        type="button"
                        onClick={() => loadTask()}
                        className="mt-4 rounded-lg px-4 py-2 text-sm font-medium text-white"
                        style={{ background: "var(--primary)" }}
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    const projectName =
        typeof task.project === "object"
            ? task.project?.name || task.project?.title
            : "";

    const workspaceName =
        typeof task.workspace === "object"
            ? task.workspace?.name
            : "";

    const assignee = task.assignedTo || task.assignee;
    const creator = task.createdBy || task.createdByUser;
    const statusStyle = statusStyles[task.status] || statusStyles.todo;
    const priorityStyle =
        priorityStyles[task.priority] || priorityStyles.medium;

    return (
        <div
            className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6"
            style={{ color: "var(--text)" }}
        >
            {/* Breadcrumb and actions */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Link
                        to="/dashboard/tasks"
                        className="inline-flex items-center gap-2 hover:underline"
                        style={{ color: "var(--text-muted)" }}
                    >
                        <ArrowLeft size={16} />
                        Tasks
                    </Link>

                    <span style={{ color: "var(--text-muted)" }}>/</span>
                    <span className="font-medium">Task details</span>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => loadTask(true)}
                        disabled={refreshing || saving || deleting}
                        className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-50"
                        style={{
                            background: "var(--surface)",
                            borderColor: "var(--border)",
                        }}
                    >
                        <RefreshCw
                            size={15}
                            className={refreshing ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>

                    {!editing && (
                        <button
                            type="button"
                            onClick={() => {
                                setError("");
                                setSuccess("");
                                setForm({
                                    title: task.title || "",
                                    description: task.description || "",
                                    status: task.status || "todo",
                                    priority: task.priority || "medium",
                                    dueDate: toDateInput(task.dueDate),
                                });
                                setEditing(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white"
                            style={{ background: "var(--primary)" }}
                        >
                            <Pencil size={15} />
                            Edit Task
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting || saving}
                        className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-50"
                        style={{
                            background: "var(--surface)",
                            borderColor: "var(--border)",
                            color: "#dc2626",
                        }}
                    >
                        <Trash2 size={15} />
                        {deleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>

            {/* Feedback */}
            {error && (
                <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border px-4 py-3 text-sm"
                    style={{
                        color: "#b42318",
                        borderColor: "#f2b8b5",
                        background: "#fff4f2",
                    }}
                >
                    <AlertCircle size={17} className="mt-0.5 shrink-0" />
                    {error}
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="rounded-lg border px-4 py-3 text-sm"
                    style={{
                        color: "#187044",
                        borderColor: "#b7e4c7",
                        background: "#f0fff5",
                    }}
                >
                    {success}
                </div>
            )}

            {/* Main details */}
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                <section
                    className="min-w-0 overflow-hidden rounded-xl border"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                    }}
                >
                    <div className="border-b p-5 sm:p-6" style={{ borderColor: "var(--border)" }}>
                        <div className="flex items-start gap-3">
                            <div
                                className="flex size-11 shrink-0 items-center justify-center rounded-lg"
                                style={{
                                    background: "var(--primary-soft, #e1f2ef)",
                                    color: "var(--primary)",
                                }}
                            >
                                <ClipboardList size={21} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className="rounded-full px-2.5 py-1 text-xs font-medium"
                                        style={statusStyle}
                                    >
                                        {statusOptions.find((item) => item.value === task.status)?.label ||
                                            task.status ||
                                            "To Do"}
                                    </span>

                                    {isOverdue(task) && (
                                        <span
                                            className="rounded-full px-2.5 py-1 text-xs font-medium"
                                            style={{
                                                background: "#fef2f2",
                                                color: "#b91c1c",
                                            }}
                                        >
                                            Overdue
                                        </span>
                                    )}
                                </div>

                                {!editing ? (
                                    <>
                                        <h1 className="mt-3 break-words text-2xl font-semibold tracking-tight">
                                            {task.title}
                                        </h1>

                                        <p
                                            className="mt-2 text-sm"
                                            style={{ color: "var(--text-muted)" }}
                                        >
                                            Task ID: {getId(task)}
                                        </p>
                                    </>
                                ) : (
                                    <div className="mt-4">
                                        <label
                                            htmlFor="task-title"
                                            className="block text-sm font-medium"
                                        >
                                            Task title
                                        </label>
                                        <input
                                            id="task-title"
                                            name="title"
                                            value={form.title}
                                            onChange={updateForm}
                                            required
                                            maxLength={200}
                                            className="mt-2 w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                                            style={{
                                                background: "var(--surface)",
                                                color: "var(--text)",
                                                borderColor: "var(--border)",
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 p-5 sm:p-6">
                        <div>
                            <h2 className="text-sm font-semibold">Description</h2>

                            {!editing ? (
                                <p
                                    className="mt-3 whitespace-pre-wrap break-words text-sm leading-7"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    {task.description || "No description has been provided."}
                                </p>
                            ) : (
                                <textarea
                                    id="task-description"
                                    name="description"
                                    value={form.description}
                                    onChange={updateForm}
                                    rows={5}
                                    maxLength={3000}
                                    placeholder="Describe this task..."
                                    className="mt-3 w-full resize-y rounded-lg border px-3 py-2.5 text-sm outline-none"
                                    style={{
                                        background: "var(--surface)",
                                        color: "var(--text)",
                                        borderColor: "var(--border)",
                                    }}
                                />
                            )}
                        </div>

                        {editing && (
                            <form id="edit-task-form" onSubmit={handleSave} className="space-y-5">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="task-status"
                                            className="block text-sm font-medium"
                                        >
                                            Status
                                        </label>
                                        <select
                                            id="task-status"
                                            name="status"
                                            value={form.status}
                                            onChange={updateForm}
                                            className="mt-2 w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                                            style={{
                                                background: "var(--surface)",
                                                color: "var(--text)",
                                                borderColor: "var(--border)",
                                            }}
                                        >
                                            {statusOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="task-priority"
                                            className="block text-sm font-medium"
                                        >
                                            Priority
                                        </label>
                                        <select
                                            id="task-priority"
                                            name="priority"
                                            value={form.priority}
                                            onChange={updateForm}
                                            className="mt-2 w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                                            style={{
                                                background: "var(--surface)",
                                                color: "var(--text)",
                                                borderColor: "var(--border)",
                                            }}
                                        >
                                            {priorityOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="task-due-date"
                                        className="block text-sm font-medium"
                                    >
                                        Due date
                                    </label>
                                    <input
                                        id="task-due-date"
                                        name="dueDate"
                                        type="date"
                                        value={form.dueDate}
                                        onChange={updateForm}
                                        className="mt-2 w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                                        style={{
                                            background: "var(--surface)",
                                            color: "var(--text)",
                                            borderColor: "var(--border)",
                                        }}
                                    />
                                </div>

                                <div className="flex flex-wrap justify-end gap-2 border-t pt-4" style={{ borderColor: "var(--border)" }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditing(false);
                                            setError("");
                                            setForm({
                                                title: task.title || "",
                                                description: task.description || "",
                                                status: task.status || "todo",
                                                priority: task.priority || "medium",
                                                dueDate: toDateInput(task.dueDate),
                                            });
                                        }}
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
                                        style={{
                                            borderColor: "var(--border)",
                                            color: "var(--text)",
                                        }}
                                    >
                                        <X size={15} />
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving || !form.title.trim()}
                                        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                                        style={{ background: "var(--primary)" }}
                                    >
                                        <Save size={15} />
                                        {saving ? "Saving..." : "Save changes"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Project */}
                        <div
                            className="flex items-start gap-3 border-t pt-5"
                            style={{ borderColor: "var(--border)" }}
                        >
                            <FolderKanban
                                size={19}
                                className="mt-0.5 shrink-0"
                                style={{ color: "var(--primary)" }}
                            />
                            <div className="min-w-0">
                                <p className="text-sm font-medium">Project</p>
                                <p className="mt-1 break-words text-sm" style={{ color: "var(--text-muted)" }}>
                                    {projectName || "Project details unavailable"}
                                </p>
                            </div>
                        </div>

                        {/* Workspace */}
                        <div className="flex items-start gap-3">
                            <ClipboardList
                                size={19}
                                className="mt-0.5 shrink-0"
                                style={{ color: "var(--primary)" }}
                            />
                            <div className="min-w-0">
                                <p className="text-sm font-medium">Workspace</p>
                                <p className="mt-1 break-words text-sm" style={{ color: "var(--text-muted)" }}>
                                    {workspaceName || "Workspace details unavailable"}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Task information sidebar */}
                <aside className="space-y-5">
                    <section
                        className="rounded-xl border p-5"
                        style={{
                            background: "var(--surface)",
                            borderColor: "var(--border)",
                        }}
                    >
                        <h2 className="text-base font-semibold">Task information</h2>

                        <div className="mt-5 space-y-5">
                            <div className="flex items-start gap-3">
                                <CheckCircle2
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                    style={{ color: "var(--primary)" }}
                                />
                                <div>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                        Status
                                    </p>
                                    <p className="mt-1 text-sm font-medium">
                                        {statusOptions.find((item) => item.value === task.status)?.label ||
                                            task.status ||
                                            "To Do"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <AlertCircle
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                    style={priorityStyle}
                                />
                                <div>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                        Priority
                                    </p>
                                    <p className="mt-1 text-sm font-medium capitalize" style={priorityStyle}>
                                        {task.priority || "Medium"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CalendarDays
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                    style={{ color: "var(--primary)" }}
                                />
                                <div>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                        Due date
                                    </p>
                                    <p className="mt-1 text-sm font-medium">
                                        {formatDate(task.dueDate)}
                                    </p>
                                    {isOverdue(task) && (
                                        <p className="mt-1 text-xs text-red-600">Past due date</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <UserRound
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                    style={{ color: "var(--primary)" }}
                                />
                                <div className="min-w-0">
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                        Assigned to
                                    </p>
                                    <p className="mt-1 break-words text-sm font-medium">
                                        {getName(assignee)}
                                    </p>
                                    {typeof assignee === "object" && assignee?.email && (
                                        <p className="mt-1 break-all text-xs" style={{ color: "var(--text-muted)" }}>
                                            {assignee.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <UserRound
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                    style={{ color: "var(--primary)" }}
                                />
                                <div className="min-w-0">
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                        Created by
                                    </p>
                                    <p className="mt-1 break-words text-sm font-medium">
                                        {getName(creator)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock3
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                    style={{ color: "var(--primary)" }}
                                />
                                <div>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                        Created
                                    </p>
                                    <p className="mt-1 text-sm font-medium">
                                        {formatDateTime(task.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock3
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                    style={{ color: "var(--primary)" }}
                                />
                                <div>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                        Last updated
                                    </p>
                                    <p className="mt-1 text-sm font-medium">
                                        {formatDateTime(task.updatedAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}
