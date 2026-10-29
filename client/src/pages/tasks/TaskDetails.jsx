import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    Clock3,
    ClipboardList,
    ExternalLink,
    FileText,
    FolderKanban,
    Paperclip,
    Pencil,
    RefreshCw,
    Save,
    Trash2,
    Upload,
    UserRound,
    X,
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
    todo: "bg-slate-100 text-slate-600",
    inProgress: "bg-teal-50 text-teal-800",
    review: "bg-amber-50 text-amber-800",
    completed: "bg-emerald-50 text-emerald-800",
};

const priorityStyles = {
    low: "text-slate-500",
    medium: "text-amber-700",
    high: "text-red-600",
};

const initialForm = {
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    assignedTo: "",
};

function normalizeTask(response) {
    let result = response?.data ?? response;

    if (result?.data) result = result.data;
    if (result?.task) result = result.task;

    return result;
}

function unwrapResponse(response) {
    let result = response?.data ?? response;

    for (let index = 0; index < 3; index += 1) {
        if (result && !Array.isArray(result) && result.data !== undefined) {
            result = result.data;
        } else if (result && !Array.isArray(result) && result.workspace) {
            result = result.workspace;
        } else {
            break;
        }
    }

    return result;
}

function normalizeWorkspaceMembers(response) {
    const result = unwrapResponse(response);

    const entries = Array.isArray(result)
        ? result
        : Array.isArray(result?.members)
            ? result.members
            : Array.isArray(result?.users)
                ? result.users
                : [];

    return entries
        .map((entry) => {
            const entryUser = entry?.user;

            const person =
                entryUser && typeof entryUser === "object"
                    ? entryUser
                    : entry?.member && typeof entry.member === "object"
                        ? entry.member
                        : entry;

            const userId = getId(entryUser) || getId(person) || getId(entry);

            if (!userId) return null;

            return {
                ...(person && typeof person === "object" ? person : {}),
                _id: userId,
            };
        })
        .filter(Boolean);
}

function uniquePeople(people) {
    const byId = new Map();

    for (const person of people) {
        const id = getId(person);

        if (!id) continue;

        const existing = byId.get(id);

        byId.set(
            id,
            existing
                ? { ...existing, ...person, _id: id }
                : { ...person, _id: id }
        );
    }

    return [...byId.values()];
}

function getId(value) {
    if (!value) return "";

    if (typeof value === "object") {
        return String(value._id || value.id || "");
    }

    return String(value);
}

function isObjectId(value) {
    return typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
}

function getPersonName(person) {
    if (!person) return "Not assigned";

    if (typeof person === "string") {
        return isObjectId(person)
            ? "User details unavailable"
            : person;
    }

    return (
        person.fullName ||
        person.name ||
        person.userName ||
        person.username ||
        person.email ||
        (person._id ? "User details unavailable" : "Unknown")
    );
}

function getRelationName(value, fallback) {
    if (!value) return fallback;

    if (typeof value === "string") {
        return isObjectId(value) ? fallback : value;
    }

    return value.name || value.title || fallback;
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

function formatFileSize(bytes) {
    if (bytes == null || !Number.isFinite(Number(bytes))) return "";

    const size = Number(bytes);

    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getAttachmentUrl(attachment) {
    if (typeof attachment === "string") return attachment;

    return (
        attachment?.url ||
        attachment?.secureUrl ||
        attachment?.secure_url ||
        ""
    );
}

function getFileName(attachment) {
    if (typeof attachment === "object" && attachment) {
        if (attachment.fileName) return attachment.fileName;
        if (attachment.originalName) return attachment.originalName;
        if (attachment.name) return attachment.name;
    }

    const url = getAttachmentUrl(attachment);

    try {
        const pathname = new URL(
            url,
            window.location.origin
        ).pathname;

        return decodeURIComponent(pathname.split("/").pop()) || "Attachment";
    } catch {
        return "Attachment";
    }
}

function getAttachmentIdentifier(attachment, index) {
    if (typeof attachment === "string") return attachment;

    return (
        attachment?.publicId ||
        attachment?.public_id ||
        attachment?._id ||
        attachment?.url ||
        attachment?.secureUrl ||
        attachment?.secure_url ||
        String(index)
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>
            {children}
        </div>
    );
}

function MetadataItem({ icon: Icon, label, children }) {
    return (
        <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                <Icon size={17} />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500">{label}</p>
                <div className="mt-1 break-words text-sm font-medium text-slate-800">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function TaskDetails() {
    const { taskId, id } = useParams();
    const currentTaskId = taskId || id;
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [task, setTask] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [members, setMembers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [uploading, setUploading] = useState(false);
    const [removingAttachmentId, setRemovingAttachmentId] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadTask = useCallback(
        async (isRefresh = false) => {
            if (!currentTaskId) {
                setError("Task ID is missing from the URL.");
                setLoading(false);
                return;
            }

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            try {
                const response = await api.get(`/tasks/${currentTaskId}`);
                const taskData = normalizeTask(response);

                if (!taskData?._id) {
                    throw new Error("Task was not found.");
                }

                setTask(taskData);

                const workspaceId = getId(taskData.workspace);
                const people = [];
                let workspaceDetails = null;

                if (workspaceId) {
                    const [membersResult, workspaceResult] =
                        await Promise.allSettled([
                            api.get(
                                `/workspaces/${encodeURIComponent(workspaceId)}/members`
                            ),
                            api.get(
                                `/workspaces/${encodeURIComponent(workspaceId)}`
                            ),
                        ]);

                    if (membersResult.status === "fulfilled") {
                        people.push(
                            ...normalizeWorkspaceMembers(membersResult.value)
                        );
                    }

                    if (workspaceResult.status === "fulfilled") {
                        const result = unwrapResponse(workspaceResult.value);

                        workspaceDetails = Array.isArray(result)
                            ? null
                            : result;

                        if (Array.isArray(workspaceDetails?.members)) {
                            people.push(
                                ...normalizeWorkspaceMembers(
                                    workspaceDetails.members
                                )
                            );
                        }

                        if (workspaceDetails?.owner) {
                            const owner = workspaceDetails.owner;
                            const ownerId = getId(owner);

                            if (ownerId) {
                                people.push(
                                    owner && typeof owner === "object"
                                        ? { ...owner, _id: ownerId }
                                        : { _id: ownerId }
                                );
                            }
                        }
                    }
                }

                if (
                    taskData.assignedTo &&
                    typeof taskData.assignedTo === "object"
                ) {
                    people.push(taskData.assignedTo);
                }

                setMembers(uniquePeople(people));

                setForm({
                    title: taskData.title || "",
                    description: taskData.description || "",
                    status: taskData.status || "todo",
                    priority: taskData.priority || "medium",
                    dueDate: toDateInput(taskData.dueDate),
                    assignedTo: getId(taskData.assignedTo),
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
        },
        [currentTaskId]
    );

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

    const cancelEditing = () => {
        setEditing(false);
        setError("");

        setForm({
            title: task.title || "",
            description: task.description || "",
            status: task.status || "todo",
            priority: task.priority || "medium",
            dueDate: toDateInput(task.dueDate),
            assignedTo: getId(task.assignedTo),
        });
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

            const originalAssigneeId = getId(task.assignedTo);

            if (form.assignedTo !== originalAssigneeId) {
                payload.assignedTo = form.assignedTo || null;
            }

            await api.patch(`/tasks/${currentTaskId}`, payload);

            setEditing(false);
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

    const handleUploadAttachments = async (event) => {
        const files = Array.from(event.target.files || []);

        event.target.value = "";

        if (!files.length) return;

        setError("");
        setSuccess("");
        setUploading(true);

        let uploadedCount = 0;
        let uploadError = "";

        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);

                try {
                    await api.post(
                        `/tasks/${currentTaskId}/attachments`,
                        formData
                    );

                    uploadedCount += 1;
                } catch (err) {
                    uploadError =
                        err?.response?.data?.message ||
                        err?.message ||
                        `Unable to upload ${file.name}.`;

                    break;
                }
            }

            if (uploadedCount > 0) {
                await loadTask(true);
            }

            if (uploadError) {
                setError(
                    uploadedCount > 0
                        ? `${uploadedCount} file(s) uploaded successfully. ${uploadError}`
                        : uploadError
                );
            } else if (uploadedCount > 0) {
                setSuccess(
                    uploadedCount === 1
                        ? "Attachment uploaded successfully."
                        : `${uploadedCount} attachments uploaded successfully.`
                );
            }
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveAttachment = async (attachment, index) => {
        const attachmentId = getAttachmentIdentifier(attachment, index);
        const fileName = getFileName(attachment);

        if (!attachmentId) {
            setError("Unable to identify this attachment.");
            return;
        }

        const confirmed = window.confirm(
            `Remove "${fileName}" from this task?`
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");
        setRemovingAttachmentId(String(attachmentId));

        try {
            await api.delete(
                `/tasks/${currentTaskId}/attachments`,
                {
                    data: { attachmentId },
                }
            );

            await loadTask(true);
            setSuccess("Attachment removed successfully.");
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to remove attachment."
            );
        } finally {
            setRemovingAttachmentId("");
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this task? This action cannot be undone."
        );

        if (!confirmed) return;

        setDeleting(true);
        setError("");
        setSuccess("");

        try {
            await api.delete(`/tasks/${currentTaskId}`);

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
            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500">
                <RefreshCw size={18} className="animate-spin" />
                Loading task details...
            </div>
        );
    }

    if (!task) {
        return (
            <div className="mx-auto max-w-3xl space-y-5">
                <Link
                    to="/dashboard/tasks"
                    className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-800"
                >
                    <ArrowLeft size={16} />
                    Back to Tasks
                </Link>

                <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <AlertCircle size={26} className="text-red-600" />

                    <h1 className="mt-3 text-lg font-semibold text-slate-900">
                        Unable to display task
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        {error || "This task could not be found."}
                    </p>

                    <button
                        type="button"
                        onClick={() => loadTask()}
                        className="mt-5 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800"
                    >
                        Try again
                    </button>
                </section>
            </div>
        );
    }

    const projectName = getRelationName(
        task.project,
        "Project details unavailable"
    );

    const workspaceName = getRelationName(
        task.workspace,
        "Workspace details unavailable"
    );

    const assignee = task.assignedTo;
    const creator = task.createdBy;

    const attachments = Array.isArray(task.attachments)
        ? task.attachments
        : [];

    const currentStatus =
        statusOptions.find((item) => item.value === task.status)?.label ||
        "To Do";

    const currentPriority =
        priorityOptions.find((item) => item.value === task.priority)?.label ||
        "Medium";

    const attachmentsBusy = uploading || Boolean(removingAttachmentId);

    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-8">
            {/* Page heading and actions */}
            <div className="space-y-4">
                <Link
                    to="/dashboard/tasks"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-teal-700"
                >
                    <ArrowLeft size={16} />
                    All tasks
                </Link>

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800">
                                Task details
                            </span>

                            {isOverdue(task) && (
                                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                                    Overdue
                                </span>
                            )}
                        </div>

                        <h1 className="mt-3 break-words text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                            {task.title}
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Review details, manage progress, and keep everything organized.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => loadTask(true)}
                            disabled={
                                refreshing ||
                                saving ||
                                deleting ||
                                attachmentsBusy
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={15}
                                className={refreshing ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>

                        {editing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={cancelEditing}
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    <X size={15} />
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    form="edit-task-form"
                                    disabled={saving || !form.title.trim()}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-3.5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800 disabled:opacity-50"
                                >
                                    <Save size={15} />
                                    {saving ? "Saving..." : "Save changes"}
                                </button>
                            </>
                        ) : (
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
                                        assignedTo: getId(task.assignedTo),
                                    });

                                    setEditing(true);
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-3.5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800"
                            >
                                <Pencil size={15} />
                                Edit task
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting || saving || attachmentsBusy}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3.5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                        >
                            <Trash2 size={15} />
                            {deleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Feedback */}
            {error && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    <AlertCircle size={17} className="mt-0.5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                >
                    <CheckCircle2 size={17} className="shrink-0" />
                    {success}
                </div>
            )}

            {/* Main layout */}
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_310px]">
                {/* Main content */}
                <form
                    id="edit-task-form"
                    onSubmit={handleSave}
                    className="min-w-0 space-y-6"
                >
                    {/* Task description */}
                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <div className="flex items-start gap-4 border-b border-slate-100 p-5 sm:p-6">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                                <ClipboardList size={21} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[task.status] ||
                                            statusStyles.todo
                                            }`}
                                    >
                                        {currentStatus}
                                    </span>

                                    <span
                                        className={`text-xs font-semibold ${priorityStyles[task.priority] ||
                                            priorityStyles.medium
                                            }`}
                                    >
                                        {currentPriority} priority
                                    </span>
                                </div>

                                {editing ? (
                                    <div className="mt-3">
                                        <Field label="Task title">
                                            <input
                                                name="title"
                                                value={form.title}
                                                onChange={updateForm}
                                                required
                                                maxLength={200}
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-teal-600 focus:ring-2 focus:ring-teal-50"
                                            />
                                        </Field>
                                    </div>
                                ) : (
                                    <h2 className="mt-3 break-words text-xl font-semibold text-slate-900">
                                        {task.title}
                                    </h2>
                                )}

                                <p className="mt-2 break-all text-xs text-slate-400">
                                    Task ID: {getId(task)}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6 p-5 sm:p-6">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Description
                                </h3>

                                {editing ? (
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={updateForm}
                                        rows={5}
                                        maxLength={3000}
                                        placeholder="Describe the task and its requirements..."
                                        className="mt-3 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-50"
                                    />
                                ) : (
                                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                                        {task.description ||
                                            "No description has been provided."}
                                    </p>
                                )}
                            </div>

                            {editing && (
                                <div className="grid grid-cols-1 gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2">
                                    <Field label="Status">
                                        <select
                                            name="status"
                                            value={form.status}
                                            onChange={updateForm}
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-teal-600"
                                        >
                                            {statusOptions.map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    <Field label="Priority">
                                        <select
                                            name="priority"
                                            value={form.priority}
                                            onChange={updateForm}
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-teal-600"
                                        >
                                            {priorityOptions.map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    <Field label="Assign to">
                                        <select
                                            name="assignedTo"
                                            value={form.assignedTo}
                                            onChange={updateForm}
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-teal-600"
                                        >
                                            <option value="">Unassigned</option>

                                            {members.map((member) => {
                                                const memberId = getId(member);

                                                if (!memberId) return null;

                                                return (
                                                    <option
                                                        key={memberId}
                                                        value={memberId}
                                                    >
                                                        {getPersonName(member)}
                                                        {member.email
                                                            ? ` (${member.email})`
                                                            : ""}
                                                    </option>
                                                );
                                            })}
                                        </select>

                                        <p className="mt-2 text-xs text-slate-500">
                                            Choose a workspace member or leave the task unassigned. Only workspace owners and admins can change the assignee.
                                        </p>
                                    </Field>

                                    <div className="sm:col-span-2">
                                        <Field label="Due date">
                                            <input
                                                type="date"
                                                name="dueDate"
                                                value={form.dueDate}
                                                onChange={updateForm}
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-teal-600 sm:max-w-sm"
                                            />
                                        </Field>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Attachments */}
                    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                                <Paperclip size={17} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Attachments
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    Upload files or manage existing attachments
                                </p>
                            </div>

                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                {attachments.length}
                            </span>

                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="sr-only"
                                onChange={handleUploadAttachments}
                                disabled={uploading || deleting}
                                aria-label="Choose files to attach"
                            />

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading || deleting || saving}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-3.5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {uploading ? (
                                    <RefreshCw
                                        size={15}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Upload size={15} />
                                )}
                                {uploading ? "Uploading..." : "Add files"}
                            </button>
                        </div>

                        {uploading && (
                            <div
                                role="status"
                                className="mt-4 flex items-center gap-3 rounded-lg border border-teal-100 bg-teal-50 px-3 py-3 text-sm text-teal-800"
                            >
                                <RefreshCw
                                    size={16}
                                    className="animate-spin shrink-0"
                                />
                                Uploading files. Please keep this page open.
                            </div>
                        )}

                        {attachments.length > 0 ? (
                            <div className="mt-5 divide-y divide-slate-100">
                                {attachments.map((attachment, index) => {
                                    const fileUrl =
                                        getAttachmentUrl(attachment);

                                    const fileName =
                                        getFileName(attachment);

                                    const attachmentId = String(
                                        getAttachmentIdentifier(
                                            attachment,
                                            index
                                        )
                                    );

                                    const isRemoving =
                                        removingAttachmentId === attachmentId;

                                    const fileType =
                                        typeof attachment === "object"
                                            ? attachment?.fileType ||
                                            attachment?.mimeType ||
                                            attachment?.type ||
                                            ""
                                            : "";

                                    const fileSize =
                                        typeof attachment === "object"
                                            ? attachment?.fileSize ??
                                            attachment?.size
                                            : null;

                                    return (
                                        <div
                                            key={attachmentId}
                                            className="flex min-w-0 items-center gap-3 py-3 first:pt-0 last:pb-0"
                                        >
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
                                                <FileText size={19} />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="break-words text-sm font-medium text-slate-800">
                                                    {fileName}
                                                </p>

                                                <p className="mt-1 break-words text-xs text-slate-500">
                                                    {[
                                                        fileType,
                                                        formatFileSize(fileSize),
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" · ") ||
                                                        "File attachment"}
                                                </p>
                                            </div>

                                            {fileUrl && (
                                                <a
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={`Open ${fileName}`}
                                                    title="Open attachment"
                                                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-teal-700"
                                                >
                                                    <ExternalLink size={17} />
                                                </a>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveAttachment(
                                                        attachment,
                                                        index
                                                    )
                                                }
                                                disabled={
                                                    attachmentsBusy ||
                                                    saving ||
                                                    deleting
                                                }
                                                aria-label={`Remove ${fileName}`}
                                                title="Remove attachment"
                                                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {isRemoving ? (
                                                    <RefreshCw
                                                        size={17}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <Trash2 size={17} />
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="mt-5 rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center">
                                <Paperclip
                                    size={24}
                                    className="mx-auto text-slate-400"
                                />
                                <p className="mt-3 text-sm font-medium text-slate-700">
                                    No attachments yet
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Add documents, images, or other files related to this task.
                                </p>
                            </div>
                        )}
                    </section>
                </form>

                {/* Sidebar details */}
                <aside className="space-y-5">
                    <section className="rounded-xl border border-slate-200 bg-white p-5">
                        <h3 className="text-base font-semibold text-slate-900">
                            Task information
                        </h3>

                        <div className="mt-6 space-y-5">
                            <MetadataItem icon={CheckCircle2} label="Status">
                                {currentStatus}
                            </MetadataItem>

                            <MetadataItem icon={AlertCircle} label="Priority">
                                <span
                                    className={
                                        priorityStyles[task.priority] ||
                                        priorityStyles.medium
                                    }
                                >
                                    {currentPriority}
                                </span>
                            </MetadataItem>

                            <MetadataItem icon={CalendarDays} label="Due date">
                                {formatDate(task.dueDate)}

                                {isOverdue(task) && (
                                    <span className="mt-1 block text-xs font-medium text-red-600">
                                        Past due date
                                    </span>
                                )}
                            </MetadataItem>

                            <MetadataItem icon={FolderKanban} label="Project">
                                {projectName}
                            </MetadataItem>

                            <MetadataItem icon={ClipboardList} label="Workspace">
                                {workspaceName}
                            </MetadataItem>

                            <MetadataItem icon={UserRound} label="Assigned to">
                                {getPersonName(assignee)}

                                {assignee &&
                                    typeof assignee === "object" &&
                                    assignee.email && (
                                        <span className="mt-1 block break-all text-xs font-normal text-slate-500">
                                            {assignee.email}
                                        </span>
                                    )}
                            </MetadataItem>

                            <MetadataItem icon={UserRound} label="Created by">
                                {getPersonName(creator)}

                                {creator &&
                                    typeof creator === "object" &&
                                    creator.email && (
                                        <span className="mt-1 block break-all text-xs font-normal text-slate-500">
                                            {creator.email}
                                        </span>
                                    )}
                            </MetadataItem>
                        </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-5">
                        <h3 className="text-sm font-semibold text-slate-900">
                            Activity
                        </h3>

                        <div className="mt-5 space-y-5">
                            <MetadataItem icon={Clock3} label="Created">
                                {formatDateTime(task.createdAt)}
                            </MetadataItem>

                            <MetadataItem icon={RefreshCw} label="Last updated">
                                {formatDateTime(task.updatedAt)}
                            </MetadataItem>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}