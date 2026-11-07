import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { gsap } from "gsap";
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
    Loader2,
    Paperclip,
    Pencil,
    RefreshCw,
    Save,
    Trash2,
    Upload,
    UserRound,
    X,
} from "lucide-react";

import {
    getTaskById,
    updateTask,
    deleteTask,
    uploadTaskAttachment,
    deleteTaskAttachment,
} from "../../services/task.service.js";
import {
    getWorkspaceById,
    getWorkspaceMembers,
} from "../../services/workspace.service.js";

/* Same loader id as Login / Register / Overview / Tasks, so the font is only added once */
const DISPLAY_FONT_ID = "login-display-font";
const DISPLAY_FONT_URL =
    "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&display=swap";

const displayFont = {
    fontFamily:
        '"Bricolage Grotesque", "Manrope", ui-sans-serif, system-ui, sans-serif',
};

/* Colors come from the theme variables in index.css (light + .dark) */
const statusOptions = [
    { label: "To do", value: "todo", color: "var(--text-subtle)" },
    { label: "In progress", value: "inProgress", color: "var(--primary)" },
    { label: "In review", value: "review", color: "var(--warning)" },
    { label: "Completed", value: "completed", color: "var(--success)" },
];

const priorityOptions = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
];

const statusBadge = {
    todo: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
    inProgress: "bg-[var(--primary-soft)] text-[var(--primary-text)]",
    review: "bg-[var(--warning-soft)] text-[var(--warning)]",
    completed: "bg-[var(--success-soft)] text-[var(--success)]",
};

const priorityText = {
    low: "text-[var(--text-muted)]",
    medium: "text-[var(--warning)]",
    high: "text-[var(--danger)]",
};

const fieldBase =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 text-base text-[var(--text)] " +
    "hover:border-[var(--border-strong)] placeholder:text-[var(--text-subtle)] " +
    "disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm";
const field = `${fieldBase} mt-2 h-11`;

const panel = "rounded-xl border border-[var(--border)] bg-[var(--surface)]";

const btnBase =
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold whitespace-nowrap " +
    "disabled:cursor-not-allowed disabled:opacity-50";
const btnSecondary = `${btnBase} border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]`;
const btnPrimary = `${btnBase} btn-primary active:scale-[0.98]`;
const btnDanger = `${btnBase} border border-[var(--danger)] bg-[var(--surface)] text-[var(--danger)] hover:bg-[var(--danger-soft)]`;

const initialForm = {
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    assignedTo: "",
};

/* ---------- data helpers ---------- */

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

function getId(value) {
    if (!value) return "";

    if (typeof value === "object") {
        return String(value._id || value.id || "");
    }

    return String(value);
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
            existing ? { ...existing, ...person, _id: id } : { ...person, _id: id }
        );
    }

    return [...byId.values()];
}

function isObjectId(value) {
    return typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
}

function getPersonName(person) {
    if (!person) return "Not assigned";

    if (typeof person === "string") {
        return isObjectId(person) ? "User details unavailable" : person;
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

    return attachment?.url || attachment?.secureUrl || attachment?.secure_url || "";
}

function getFileName(attachment) {
    if (typeof attachment === "object" && attachment) {
        if (attachment.fileName) return attachment.fileName;
        if (attachment.originalName) return attachment.originalName;
        if (attachment.name) return attachment.name;
    }

    const url = getAttachmentUrl(attachment);

    try {
        const pathname = new URL(url, window.location.origin).pathname;

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

function taskToForm(task) {
    return {
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        dueDate: toDateInput(task.dueDate),
        assignedTo: getId(task.assignedTo),
    };
}

/* ---------- small components ---------- */

function Field({ label, htmlFor, hint, children }) {
    return (
        <div>
            <label htmlFor={htmlFor} className="text-sm font-semibold">
                {label}
            </label>
            {children}
            {hint && (
                <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{hint}</p>
            )}
        </div>
    );
}

function MetadataItem({ icon: Icon, label, children }) {
    return (
        <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--text-muted)]">
                <Icon size={17} aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-xs text-[var(--text-muted)]">{label}</p>
                <div className="mt-0.5 break-words text-sm font-semibold">{children}</div>
            </div>
        </div>
    );
}

/**
 * "All tasks" back link (same effect as the Projects page).
 * Hover: text shifts to the primary color, an underline draws in from the
 * left, and the arrow nudges back. The color is driven by a CSS variable
 * because index.css sets an unlayered color on <a>, which would otherwise
 * override a normal hover:text-* class.
 */
function BackLink({ to = "/dashboard/tasks", children = "All tasks" }) {
    return (
        <Link
            to={to}
            style={{ color: "var(--back-link-color, var(--text))" }}
            className="group inline-flex items-center gap-2 rounded-sm text-sm font-medium transition-colors duration-200 outline-none hover:[--back-link-color:var(--primary-text)] focus-visible:[--back-link-color:var(--primary-text)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)] motion-reduce:transition-none"
        >
            <ArrowLeft
                size={16}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:-translate-x-1 group-focus-visible:-translate-x-1 motion-reduce:transition-none"
            />

            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-[position:left_100%] bg-no-repeat pb-0.5 transition-[background-size] duration-300 ease-out group-hover:bg-[length:100%_1.5px] group-focus-visible:bg-[length:100%_1.5px] motion-reduce:transition-none">
                {children}
            </span>
        </Link>
    );
}

/* ---------- page ---------- */

export default function TaskDetails() {
    const { taskId, id } = useParams();
    const currentTaskId = taskId || id;
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const rootRef = useRef(null);

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

    useEffect(() => {
        if (document.getElementById(DISPLAY_FONT_ID)) return;
        const link = document.createElement("link");
        link.id = DISPLAY_FONT_ID;
        link.rel = "stylesheet";
        link.href = DISPLAY_FONT_URL;
        document.head.appendChild(link);
    }, []);

    const hasTask = Boolean(task);

    /* One quiet fade when the page first shows. Nothing else moves on its own. */
    useLayoutEffect(() => {
        const root = rootRef.current;
        if (
            !root ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            return;
        }

        const ctx = gsap.context(() => {
            gsap.from(root, {
                opacity: 0,
                y: 10,
                duration: 0.5,
                ease: "power3.out",
                clearProps: "transform,opacity",
            });
        }, root);

        return () => ctx.revert();
    }, [hasTask]);

    /* The success message goes away on its own */
    useEffect(() => {
        if (!success) return;
        const timer = setTimeout(() => setSuccess(""), 4000);
        return () => clearTimeout(timer);
    }, [success]);

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
                const response = await getTaskById(currentTaskId);
                const taskData = normalizeTask(response);

                if (!taskData?._id) {
                    throw new Error("Task was not found.");
                }

                setTask(taskData);

                const workspaceId = getId(taskData.workspace);
                const people = [];
                let workspaceDetails = null;

                if (workspaceId) {
                    const [membersResult, workspaceResult] = await Promise.allSettled([
                        getWorkspaceMembers(workspaceId),
                        getWorkspaceById(workspaceId),
                    ]);

                    if (membersResult.status === "fulfilled") {
                        people.push(...normalizeWorkspaceMembers(membersResult.value));
                    }

                    if (workspaceResult.status === "fulfilled") {
                        const result = unwrapResponse(workspaceResult.value);

                        workspaceDetails = Array.isArray(result) ? null : result;

                        if (Array.isArray(workspaceDetails?.members)) {
                            people.push(
                                ...normalizeWorkspaceMembers(workspaceDetails.members)
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

                if (taskData.assignedTo && typeof taskData.assignedTo === "object") {
                    people.push(taskData.assignedTo);
                }

                setMembers(uniquePeople(people));
                setForm(taskToForm(taskData));
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
        setForm((current) => ({ ...current, [name]: value }));
    };

    const startEditing = () => {
        setError("");
        setSuccess("");
        setForm(taskToForm(task));
        setEditing(true);
    };

    const cancelEditing = () => {
        setEditing(false);
        setError("");
        setForm(taskToForm(task));
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

            if (form.assignedTo !== getId(task.assignedTo)) {
                payload.assignedTo = form.assignedTo || null;
            }

            await updateTask(currentTaskId, payload);

            setEditing(false);
            await loadTask(true);

            setSuccess("Task updated.");
        } catch (err) {
            setError(
                err?.response?.data?.message || err?.message || "Unable to update task."
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
                try {
                    await uploadTaskAttachment(currentTaskId, file);
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
                        ? `${uploadedCount} file(s) uploaded. ${uploadError}`
                        : uploadError
                );
            } else if (uploadedCount > 0) {
                setSuccess(
                    uploadedCount === 1
                        ? "Attachment uploaded."
                        : `${uploadedCount} attachments uploaded.`
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

        const confirmed = window.confirm(`Remove "${fileName}" from this task?`);

        if (!confirmed) return;

        setError("");
        setSuccess("");
        setRemovingAttachmentId(String(attachmentId));

        try {
            await deleteTaskAttachment(currentTaskId, attachmentId);

            await loadTask(true);
            setSuccess("Attachment removed.");
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
            await deleteTask(currentTaskId);
            navigate("/dashboard/tasks", { replace: true });
        } catch (err) {
            setError(
                err?.response?.data?.message || err?.message || "Unable to delete task."
            );
            setDeleting(false);
        }
    };

    /* ---------- loading / not found ---------- */

    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-[var(--text-muted)]">
                <Loader2 size={18} className="animate-spin text-[var(--primary)]" />
                Loading task details...
            </div>
        );
    }

    if (!task) {
        return (
            <div className="mx-auto max-w-3xl space-y-5 px-1 py-2 text-[var(--text)] sm:px-2 sm:py-4">
                <BackLink />

                <section className={`${panel} p-6 sm:p-8`}>
                    <AlertCircle size={26} className="text-[var(--danger)]" />

                    <h1
                        className="mt-3 text-xl font-bold tracking-tight"
                        style={displayFont}
                    >
                        Unable to display task
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                        {error || "This task could not be found."}
                    </p>

                    <button
                        type="button"
                        onClick={() => loadTask()}
                        className={`${btnPrimary} mt-5`}
                    >
                        Try again
                    </button>
                </section>
            </div>
        );
    }

    /* ---------- derived values ---------- */

    const projectName = getRelationName(task.project, "Project details unavailable");
    const workspaceName = getRelationName(
        task.workspace,
        "Workspace details unavailable"
    );

    const assignee = task.assignedTo;
    const creator = task.createdBy;

    const attachments = Array.isArray(task.attachments) ? task.attachments : [];

    const statusInfo =
        statusOptions.find((item) => item.value === task.status) || statusOptions[0];

    const currentPriority =
        priorityOptions.find((item) => item.value === task.priority)?.label ||
        "Medium";

    const overdue = isOverdue(task);
    const attachmentsBusy = uploading || Boolean(removingAttachmentId);
    const anyBusy = saving || deleting || attachmentsBusy;

    return (
        <div
            ref={rootRef}
            className="mx-auto max-w-7xl space-y-6 px-1 py-2 pb-8 text-[var(--text)] sm:space-y-8 sm:px-2 sm:py-4"
        >
            {/* Heading */}
            <header className="space-y-4">
                <BackLink />

                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0">
                        <h1
                            className="break-words text-3xl font-bold tracking-tight sm:text-4xl"
                            style={displayFont}
                        >
                            {task.title}
                        </h1>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
                            Review details, update progress and manage files for this task.
                        </p>
                    </div>

                    {/* Actions: 2-col grid on phones, inline row from sm up */}
                    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                        <button
                            type="button"
                            onClick={() => loadTask(true)}
                            disabled={refreshing || anyBusy}
                            className={btnSecondary}
                        >
                            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                            Refresh
                        </button>

                        {editing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={cancelEditing}
                                    disabled={saving}
                                    className={btnSecondary}
                                >
                                    <X size={15} />
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    form="edit-task-form"
                                    disabled={saving || !form.title.trim()}
                                    className={btnPrimary}
                                >
                                    {saving ? (
                                        <Loader2 size={15} className="animate-spin" />
                                    ) : (
                                        <Save size={15} />
                                    )}
                                    {saving ? "Saving..." : "Save changes"}
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={startEditing}
                                disabled={anyBusy}
                                className={btnPrimary}
                            >
                                <Pencil size={15} />
                                Edit task
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={anyBusy}
                            className={btnDanger}
                        >
                            {deleting ? (
                                <Loader2 size={15} className="animate-spin" />
                            ) : (
                                <Trash2 size={15} />
                            )}
                            {deleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>
            </header>

            {/* Messages */}
            {error && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-lg bg-[var(--danger-soft)] px-5 py-4 text-sm leading-5 text-[var(--danger)]"
                >
                    <AlertCircle size={17} className="mt-0.5 shrink-0" />
                    <span className="flex-1">{error}</span>
                </div>
            )}

            {success && (
                <p
                    role="status"
                    className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-sm font-medium text-[var(--success)]"
                >
                    <CheckCircle2 size={17} className="shrink-0" />
                    {success}
                </p>
            )}

            {/* Layout: single column on phones, sidebar on the right from lg up */}
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0 space-y-6">
                    {/* Details */}
                    <form
                        id="edit-task-form"
                        onSubmit={handleSave}
                        className={`${panel} overflow-hidden`}
                    >
                        <div className="flex items-start gap-4 border-b border-[var(--border)] px-5 py-5 sm:px-6">
                            <div className="hidden size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary-text)] sm:flex">
                                <ClipboardList size={21} aria-hidden="true" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                    <span
                                        className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge[task.status] || statusBadge.todo
                                            }`}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className="h-2 w-2 rounded-full"
                                            style={{ background: statusInfo.color }}
                                        />
                                        {statusInfo.label}
                                    </span>

                                    <span
                                        className={`text-xs font-semibold ${priorityText[task.priority] || priorityText.medium
                                            }`}
                                    >
                                        {currentPriority} priority
                                    </span>

                                    {overdue && (
                                        <span className="rounded-full bg-[var(--danger-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--danger)]">
                                            Overdue
                                        </span>
                                    )}
                                </div>

                                {editing ? (
                                    <div className="mt-4">
                                        <Field label="Title" htmlFor="task-title">
                                            <input
                                                id="task-title"
                                                name="title"
                                                value={form.title}
                                                onChange={updateForm}
                                                required
                                                maxLength={200}
                                                className={field}
                                            />
                                        </Field>
                                    </div>
                                ) : (
                                    <h2
                                        className="mt-3 break-words text-xl font-bold tracking-tight"
                                        style={displayFont}
                                    >
                                        {task.title}
                                    </h2>
                                )}

                                <p className="mt-2 break-all text-xs text-[var(--text-subtle)]">
                                    Task ID: {getId(task)}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6 px-5 py-5 sm:px-6">
                            <div>
                                {editing ? (
                                    <Field label="Description" htmlFor="task-description">
                                        <textarea
                                            id="task-description"
                                            name="description"
                                            value={form.description}
                                            onChange={updateForm}
                                            rows={5}
                                            maxLength={3000}
                                            placeholder="What needs to be done?"
                                            className={`${fieldBase} mt-2 resize-y py-3 leading-6`}
                                        />
                                    </Field>
                                ) : (
                                    <>
                                        <h3 className="text-sm font-semibold">Description</h3>
                                        <p className="mt-2 max-w-prose whitespace-pre-wrap break-words text-sm leading-7 text-[var(--text-muted)]">
                                            {task.description || "No description has been provided."}
                                        </p>
                                    </>
                                )}
                            </div>

                            {editing && (
                                <div className="grid grid-cols-1 gap-5 border-t border-[var(--border)] pt-5 sm:grid-cols-2">
                                    <Field label="Status" htmlFor="task-status">
                                        <select
                                            id="task-status"
                                            name="status"
                                            value={form.status}
                                            onChange={updateForm}
                                            className={field}
                                        >
                                            {statusOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    <Field label="Priority" htmlFor="task-priority">
                                        <select
                                            id="task-priority"
                                            name="priority"
                                            value={form.priority}
                                            onChange={updateForm}
                                            className={field}
                                        >
                                            {priorityOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    <Field
                                        label="Assign to"
                                        htmlFor="task-assignee"
                                        hint="Only workspace owners and admins can change the assignee."
                                    >
                                        <select
                                            id="task-assignee"
                                            name="assignedTo"
                                            value={form.assignedTo}
                                            onChange={updateForm}
                                            className={field}
                                        >
                                            <option value="">Unassigned</option>

                                            {members.map((member) => {
                                                const memberId = getId(member);

                                                if (!memberId) return null;

                                                return (
                                                    <option key={memberId} value={memberId}>
                                                        {getPersonName(member)}
                                                        {member.email ? ` (${member.email})` : ""}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </Field>

                                    <Field label="Due date" htmlFor="task-due-date">
                                        <input
                                            id="task-due-date"
                                            type="date"
                                            name="dueDate"
                                            value={form.dueDate}
                                            onChange={updateForm}
                                            className={field}
                                        />
                                    </Field>
                                </div>
                            )}
                        </div>
                    </form>

                    {/* Attachments */}
                    <section className={`${panel} overflow-hidden`}>
                        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] px-5 py-5 sm:px-6">
                            <div className="min-w-0 flex-1">
                                <h2 className="flex items-center gap-2 font-semibold">
                                    Attachments
                                    <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-xs font-semibold tabular-nums text-[var(--text-muted)]">
                                        {attachments.length}
                                    </span>
                                </h2>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    Upload files or manage existing ones.
                                </p>
                            </div>

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
                                className={`${btnPrimary} w-full sm:w-auto`}
                            >
                                {uploading ? (
                                    <Loader2 size={15} className="animate-spin" />
                                ) : (
                                    <Upload size={15} />
                                )}
                                {uploading ? "Uploading..." : "Add files"}
                            </button>
                        </div>

                        {uploading && (
                            <div
                                role="status"
                                className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--primary-soft)] px-5 py-3 text-sm text-[var(--primary-text)] sm:px-6"
                            >
                                <Loader2 size={16} className="shrink-0 animate-spin" />
                                Uploading files. Keep this page open.
                            </div>
                        )}

                        {attachments.length > 0 ? (
                            <ul className="divide-y divide-[var(--border)]">
                                {attachments.map((attachment, index) => {
                                    const fileUrl = getAttachmentUrl(attachment);
                                    const fileName = getFileName(attachment);
                                    const attachmentId = String(
                                        getAttachmentIdentifier(attachment, index)
                                    );
                                    const isRemoving = removingAttachmentId === attachmentId;

                                    const fileType =
                                        typeof attachment === "object"
                                            ? attachment?.fileType ||
                                            attachment?.mimeType ||
                                            attachment?.type ||
                                            ""
                                            : "";

                                    const fileSize =
                                        typeof attachment === "object"
                                            ? attachment?.fileSize ?? attachment?.size
                                            : null;

                                    return (
                                        <li
                                            key={attachmentId}
                                            className="flex min-w-0 items-center gap-3 px-5 py-4 transition-colors duration-200 hover:bg-[var(--surface-muted)] sm:px-6"
                                        >
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary-text)]">
                                                <FileText size={19} aria-hidden="true" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="break-words text-sm font-semibold">
                                                    {fileName}
                                                </p>

                                                <p className="mt-0.5 break-words text-xs text-[var(--text-muted)]">
                                                    {[fileType, formatFileSize(fileSize)]
                                                        .filter(Boolean)
                                                        .join(" · ") || "File attachment"}
                                                </p>
                                            </div>

                                            {fileUrl && (
                                                <a
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={`Open ${fileName}`}
                                                    title="Open attachment"
                                                    style={{ color: "var(--text-muted)" }}
                                                    className="flex size-10 shrink-0 items-center justify-center rounded-lg hover:bg-[var(--surface-muted)]"
                                                >
                                                    <ExternalLink size={17} />
                                                </a>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveAttachment(attachment, index)
                                                }
                                                disabled={attachmentsBusy || saving || deleting}
                                                aria-label={`Remove ${fileName}`}
                                                title="Remove attachment"
                                                className="flex size-10 shrink-0 items-center justify-center rounded-lg text-[var(--text-subtle)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {isRemoving ? (
                                                    <Loader2 size={17} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={17} />
                                                )}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="px-6 py-14 text-center">
                                <Paperclip
                                    size={22}
                                    aria-hidden="true"
                                    className="mx-auto text-[var(--text-subtle)]"
                                />
                                <p className="mt-3 text-sm font-semibold">No attachments yet</p>
                                <p className="mx-auto mt-1 max-w-sm text-sm leading-5 text-[var(--text-muted)]">
                                    Add documents, images or other files related to this task.
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar */}
                <aside className="space-y-6 lg:sticky lg:top-4">
                    <section className={`${panel} p-5 sm:p-6`}>
                        <h2 className="font-semibold">Task information</h2>

                        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1">
                            <MetadataItem icon={CheckCircle2} label="Status">
                                <span className="inline-flex items-center gap-2">
                                    <span
                                        aria-hidden="true"
                                        className="h-2 w-2 rounded-full"
                                        style={{ background: statusInfo.color }}
                                    />
                                    {statusInfo.label}
                                </span>
                            </MetadataItem>

                            <MetadataItem icon={AlertCircle} label="Priority">
                                <span
                                    className={priorityText[task.priority] || priorityText.medium}
                                >
                                    {currentPriority}
                                </span>
                            </MetadataItem>

                            <MetadataItem icon={CalendarDays} label="Due date">
                                <span className={overdue ? "text-[var(--danger)]" : ""}>
                                    {formatDate(task.dueDate)}
                                </span>

                                {overdue && (
                                    <span className="mt-0.5 block text-xs font-medium text-[var(--danger)]">
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
                                        <span className="mt-0.5 block break-all text-xs font-normal text-[var(--text-muted)]">
                                            {assignee.email}
                                        </span>
                                    )}
                            </MetadataItem>

                            <MetadataItem icon={UserRound} label="Created by">
                                {getPersonName(creator)}

                                {creator &&
                                    typeof creator === "object" &&
                                    creator.email && (
                                        <span className="mt-0.5 block break-all text-xs font-normal text-[var(--text-muted)]">
                                            {creator.email}
                                        </span>
                                    )}
                            </MetadataItem>
                        </div>
                    </section>

                    <section className={`${panel} p-5 sm:p-6`}>
                        <h2 className="font-semibold">Activity</h2>

                        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1">
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