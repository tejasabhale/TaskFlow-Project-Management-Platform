import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { gsap } from "gsap";
import {
    ArrowLeft,
    ArrowUpRight,
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    Clock3,
    ClipboardList,
    FolderKanban,
    Loader2,
    Pencil,
    RefreshCw,
    Save,
    Trash2,
    UserRound,
    X,
} from "lucide-react";

import api from "../../api/axios";
import { getTasks } from "../../services/task.service.js";

/* Same loader id as the other pages, so the font is only added once */
const DISPLAY_FONT_ID = "login-display-font";
const DISPLAY_FONT_URL =
    "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&display=swap";

const displayFont = {
    fontFamily:
        '"Bricolage Grotesque", "Manrope", ui-sans-serif, system-ui, sans-serif',
};

/* index.css sets an unlayered color on <a>, so link colors are inline */
const mutedLinkStyle = { color: "var(--text-muted)" };
const textLinkStyle = { color: "var(--text)" };
const primaryLinkStyle = { color: "var(--primary-text)" };

const projectStatuses = ["Planning", "Active", "Completed", "Archived"];

const projectStatusBadge = {
    Planning: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
    Active: "bg-[var(--primary-soft)] text-[var(--primary-text)]",
    Completed: "bg-[var(--success-soft)] text-[var(--success)]",
    Archived: "bg-[var(--surface-muted)] text-[var(--text-subtle)]",
};

const TASK_STATUSES = {
    todo: { label: "To do", color: "var(--text-subtle)" },
    inProgress: { label: "In progress", color: "var(--primary)" },
    review: { label: "In review", color: "var(--warning)" },
    completed: { label: "Completed", color: "var(--success)" },
};

const priorityText = {
    low: "text-[var(--text-muted)]",
    medium: "text-[var(--warning)]",
    high: "font-semibold text-[var(--danger)]",
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
    name: "",
    description: "",
    status: "Planning",
    startDate: "",
    endDate: "",
};

/* ---------- data helpers ---------- */

function getId(value) {
    if (!value) return "";

    if (typeof value === "object") {
        return String(value._id || value.id || "");
    }

    return String(value);
}

function getEntity(response, key) {
    let result = response?.data ?? response;

    if (result?.data) result = result.data;
    if (key && result?.[key]) result = result[key];

    return result;
}

function getList(response, key) {
    const result = getEntity(response);

    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.[key])) return result[key];

    return [];
}

const isObjectId = (value) => typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

function getPersonName(person) {
    if (!person) return "Not available";

    if (typeof person === "string") {
        return isObjectId(person) ? "User details unavailable" : person;
    }

    return (
        person.fullName ||
        person.name ||
        person.userName ||
        person.username ||
        person.email ||
        "User details unavailable"
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

    if (typeof value === "string") {
        const datePart = value.split("T")[0];

        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
            return datePart;
        }
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");
}

function isOverdueDate(value) {
    if (!value) return false;

    const endDate = new Date(value);

    if (Number.isNaN(endDate.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    return endDate < today;
}

function projectToForm(project) {
    return {
        name: project.name || "",
        description: project.description || "",
        status: project.status || "Planning",
        startDate: toDateInput(project.startDate),
        endDate: toDateInput(project.endDate),
    };
}

/* ---------- small components ---------- */

function Field({ label, htmlFor, children }) {
    return (
        <div>
            <label htmlFor={htmlFor} className="text-sm font-semibold">
                {label}
            </label>
            {children}
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

function ProgressBar({ value, label }) {
    return (
        <div
            className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]"
            role="progressbar"
            aria-label={label}
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={100}
        >
            <div
                className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-500"
                style={{ width: `${value}%` }}
            />
        </div>
    );
}

/* ---------- page ---------- */

export default function ProjectDetails() {
    const { projectId, id } = useParams();
    const resolvedProjectId = projectId || id;
    const navigate = useNavigate();
    const rootRef = useRef(null);

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [form, setForm] = useState(initialForm);

    const [loading, setLoading] = useState(true);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");
    const [taskError, setTaskError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (document.getElementById(DISPLAY_FONT_ID)) return;
        const link = document.createElement("link");
        link.id = DISPLAY_FONT_ID;
        link.rel = "stylesheet";
        link.href = DISPLAY_FONT_URL;
        document.head.appendChild(link);
    }, []);

    const hasProject = Boolean(project);

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
    }, [hasProject]);

    /* The success message goes away on its own */
    useEffect(() => {
        if (!success) return;
        const timer = setTimeout(() => setSuccess(""), 4000);
        return () => clearTimeout(timer);
    }, [success]);

    // Load project information and its related tasks.
    const loadProject = useCallback(
        async (isRefresh = false) => {
            if (!resolvedProjectId) {
                setError("Project ID is missing from the URL.");
                setLoading(false);
                return;
            }

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");
            setTaskError("");

            try {
                const response = await api.get(`/projects/${resolvedProjectId}`);
                const projectData = getEntity(response, "project");

                if (!projectData?._id) {
                    throw new Error("Project not found.");
                }

                setProject(projectData);
                setForm(projectToForm(projectData));

                // The Project schema doesn't store task lists.
                // Fetch tasks separately and match their project reference.
                setLoadingTasks(true);

                try {
                    const workspaceId = getId(projectData.workspace);

                    const taskResponse = await getTasks(
                        workspaceId ? { workspaceId } : { projectId: resolvedProjectId }
                    );

                    setTasks(
                        getList(taskResponse, "tasks").filter(
                            (task) => getId(task.project) === resolvedProjectId
                        )
                    );
                } catch (err) {
                    setTasks([]);
                    setTaskError(
                        err?.response?.data?.message ||
                        "Unable to load tasks for this project."
                    );
                } finally {
                    setLoadingTasks(false);
                }
            } catch (err) {
                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load project details."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [resolvedProjectId]
    );

    useEffect(() => {
        loadProject();
    }, [loadProject]);

    const updateForm = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const startEditing = () => {
        setError("");
        setSuccess("");
        setForm(projectToForm(project));
        setEditing(true);
    };

    const cancelEditing = () => {
        setEditing(false);
        setError("");
        setForm(projectToForm(project));
    };

    const handleSave = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const name = form.name.trim();
        const description = form.description.trim();

        if (name.length < 3) {
            setError("Project name must contain at least 3 characters.");
            return;
        }

        if (description && description.length < 5) {
            setError("Description must be empty or contain at least 5 characters.");
            return;
        }

        if (form.startDate && form.endDate && form.startDate > form.endDate) {
            setError("The start date cannot be after the end date.");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                name,
                description,
                status: form.status,
                startDate: form.startDate || null,
                endDate: form.endDate || null,
            };

            const response = await api.patch(`/projects/${resolvedProjectId}`, payload);
            const updatedProject = getEntity(response, "project");

            setProject((current) => ({
                ...current,
                ...payload,
                ...(updatedProject?._id ? updatedProject : {}),
            }));

            setEditing(false);

            await loadProject(true);

            setSuccess("Project updated.");
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to update the project."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this project? This action cannot be undone."
        );

        if (!confirmed) return;

        setDeleting(true);
        setError("");

        try {
            await api.delete(`/projects/${resolvedProjectId}`);

            navigate("/dashboard/projects", { replace: true });
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to delete the project."
            );

            setDeleting(false);
        }
    };

    // Derived task statistics.
    const { totalTasks, completedTasks, inProgressTasks, progress } = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter((task) => task.status === "completed").length;
        const inProgress = tasks.filter((task) => task.status === "inProgress").length;

        return {
            totalTasks: total,
            completedTasks: completed,
            inProgressTasks: inProgress,
            progress: total ? Math.round((completed / total) * 100) : 0,
        };
    }, [tasks]);

    /* ---------- loading / not found ---------- */

    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-[var(--text-muted)]">
                <Loader2 size={18} className="animate-spin text-[var(--primary)]" />
                Loading project details...
            </div>
        );
    }

    if (!project) {
        return (
            <div className="mx-auto max-w-3xl space-y-5 px-1 py-2 text-[var(--text)] sm:px-2 sm:py-4">
                <Link
                    to="/dashboard/projects"
                    style={mutedLinkStyle}
                    className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                >
                    <ArrowLeft size={16} />
                    All projects
                </Link>

                <section className={`${panel} p-6 sm:p-8`}>
                    <AlertCircle size={26} className="text-[var(--danger)]" />

                    <h1
                        className="mt-3 text-xl font-bold tracking-tight"
                        style={displayFont}
                    >
                        Unable to display project
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                        {error || "The requested project could not be found."}
                    </p>

                    <button
                        type="button"
                        onClick={() => loadProject()}
                        className={`${btnPrimary} mt-5`}
                    >
                        Try again
                    </button>
                </section>
            </div>
        );
    }

    /* ---------- derived values ---------- */

    const workspaceName = getRelationName(
        project.workspace,
        "Workspace details unavailable"
    );

    const creator = project.createdBy;
    const statusKey = projectStatuses.includes(project.status) ? project.status : "Planning";

    const isPastEndDate =
        project.status !== "Completed" &&
        project.status !== "Archived" &&
        isOverdueDate(project.endDate);

    const anyBusy = saving || deleting;

    const stats = [
        { label: "Total tasks", value: totalTasks },
        { label: "Completed", value: completedTasks },
        { label: "In progress", value: inProgressTasks },
        { label: "Progress", value: `${progress}%`, bar: true },
    ];

    return (
        <div
            ref={rootRef}
            className="mx-auto max-w-7xl space-y-6 px-1 py-2 pb-8 text-[var(--text)] sm:space-y-8 sm:px-2 sm:py-4"
        >
            {/* Heading */}
            <header className="space-y-4">
                <Link
                    to="/dashboard/projects"
                    style={mutedLinkStyle}
                    className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                >
                    <ArrowLeft size={16} />
                    All projects
                </Link>

                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${projectStatusBadge[statusKey]}`}
                            >
                                {statusKey}
                            </span>

                            {isPastEndDate && (
                                <span className="rounded-full bg-[var(--danger-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--danger)]">
                                    Past end date
                                </span>
                            )}
                        </div>

                        <h1
                            className="mt-3 break-words text-3xl font-bold tracking-tight sm:text-4xl"
                            style={displayFont}
                        >
                            {project.name}
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                            {workspaceName}
                        </p>
                    </div>

                    {/* Actions: 2-col grid on phones, inline row from sm up */}
                    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                        <button
                            type="button"
                            onClick={() => loadProject(true)}
                            disabled={refreshing || anyBusy}
                            className={btnSecondary}
                        >
                            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                            Refresh
                        </button>

                        {!editing && (
                            <button
                                type="button"
                                onClick={startEditing}
                                disabled={anyBusy}
                                className={btnPrimary}
                            >
                                <Pencil size={15} />
                                Edit project
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

            {/* Stats */}
            <section
                aria-label="Project statistics"
                className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] lg:grid-cols-4"
            >
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-[var(--surface)] px-5 py-5 sm:px-6 sm:py-6">
                        <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
                        <p
                            className="mt-2 text-3xl font-bold tabular-nums tracking-tight"
                            style={displayFont}
                        >
                            {loadingTasks ? "—" : stat.value}
                        </p>
                        {stat.bar && (
                            <div className="mt-3">
                                <ProgressBar
                                    value={loadingTasks ? 0 : progress}
                                    label="Project completion"
                                />
                            </div>
                        )}
                    </div>
                ))}
            </section>

            {/* Main layout */}
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0 space-y-6">
                    {/* Project details */}
                    <section className={`${panel} overflow-hidden`}>
                        <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
                            <h2 className="font-semibold">Project details</h2>
                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                                Name, description, status and timeline.
                            </p>
                        </div>

                        <div className="px-5 py-5 sm:px-6">
                            {!editing ? (
                                <p className="max-w-prose whitespace-pre-wrap break-words text-sm leading-7 text-[var(--text-muted)]">
                                    {project.description || "No description has been provided."}
                                </p>
                            ) : (
                                <form
                                    id="edit-project-form"
                                    onSubmit={handleSave}
                                    className="space-y-5"
                                >
                                    <Field label="Project name" htmlFor="project-name">
                                        <input
                                            id="project-name"
                                            name="name"
                                            type="text"
                                            minLength={3}
                                            maxLength={120}
                                            required
                                            value={form.name}
                                            onChange={updateForm}
                                            className={field}
                                        />
                                    </Field>

                                    <Field label="Description" htmlFor="project-description">
                                        <textarea
                                            id="project-description"
                                            name="description"
                                            rows={4}
                                            maxLength={3000}
                                            value={form.description}
                                            onChange={updateForm}
                                            placeholder="What is this project for?"
                                            className={`${fieldBase} mt-2 resize-y py-3 leading-6`}
                                        />
                                    </Field>

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                                        <Field label="Status" htmlFor="project-status">
                                            <select
                                                id="project-status"
                                                name="status"
                                                value={form.status}
                                                onChange={updateForm}
                                                className={field}
                                            >
                                                {projectStatuses.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>

                                        <Field label="Start date" htmlFor="project-start-date">
                                            <input
                                                id="project-start-date"
                                                name="startDate"
                                                type="date"
                                                max={form.endDate || undefined}
                                                value={form.startDate}
                                                onChange={updateForm}
                                                className={field}
                                            />
                                        </Field>

                                        <Field label="End date" htmlFor="project-end-date">
                                            <input
                                                id="project-end-date"
                                                name="endDate"
                                                type="date"
                                                min={form.startDate || undefined}
                                                value={form.endDate}
                                                onChange={updateForm}
                                                className={field}
                                            />
                                        </Field>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-5 sm:flex sm:justify-end">
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
                                            disabled={saving || !form.name.trim()}
                                            className={btnPrimary}
                                        >
                                            {saving ? (
                                                <Loader2 size={15} className="animate-spin" />
                                            ) : (
                                                <Save size={15} />
                                            )}
                                            {saving ? "Saving..." : "Save changes"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </section>

                    {/* Project tasks */}
                    <section className={`${panel} overflow-hidden`}>
                        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-5 sm:px-6">
                            <div className="min-w-0">
                                <h2 className="flex items-center gap-2 font-semibold">
                                    Project tasks
                                    <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-xs font-semibold tabular-nums text-[var(--text-muted)]">
                                        {loadingTasks ? "…" : totalTasks}
                                    </span>
                                </h2>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    Tasks linked to this project.
                                </p>
                            </div>

                            <Link
                                to="/dashboard/tasks"
                                style={primaryLinkStyle}
                                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold hover:underline"
                            >
                                All tasks
                                <ArrowUpRight size={15} />
                            </Link>
                        </div>

                        {taskError && (
                            <div
                                role="alert"
                                className="m-4 rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm leading-5 text-[var(--danger)] sm:m-6"
                            >
                                {taskError}
                            </div>
                        )}

                        {loadingTasks ? (
                            <div className="px-6 py-14 text-center">
                                <Loader2
                                    size={20}
                                    className="mx-auto animate-spin text-[var(--primary)]"
                                />
                                <p className="mt-3 text-sm text-[var(--text-muted)]">
                                    Loading project tasks...
                                </p>
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="px-6 py-14 text-center">
                                <ClipboardList
                                    size={22}
                                    aria-hidden="true"
                                    className="mx-auto text-[var(--text-subtle)]"
                                />
                                <p className="mt-3 text-sm font-semibold">No tasks in this project</p>
                                <p className="mx-auto mt-1 max-w-sm text-sm leading-5 text-[var(--text-muted)]">
                                    Tasks you add to this project will show up here.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[560px] text-left text-sm">
                                    <thead className="bg-[var(--surface-muted)] text-xs text-[var(--text-muted)]">
                                        <tr>
                                            <th className="px-5 py-3 font-semibold sm:px-6">Task</th>
                                            <th className="px-4 py-3 font-semibold">Priority</th>
                                            <th className="px-4 py-3 font-semibold">Due date</th>
                                            <th className="px-4 py-3 font-semibold">Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {tasks.map((task, index) => {
                                            const status =
                                                TASK_STATUSES[task.status] || TASK_STATUSES.todo;
                                            const priority = task.priority || "medium";

                                            return (
                                                <tr
                                                    key={task._id || index}
                                                    className="border-t border-[var(--border)] align-top transition-colors duration-200 hover:bg-[var(--surface-muted)]"
                                                >
                                                    <td className="px-5 py-4 sm:px-6">
                                                        <Link
                                                            to={`/dashboard/tasks/${encodeURIComponent(task._id)}`}
                                                            style={textLinkStyle}
                                                            className="font-semibold hover:underline"
                                                        >
                                                            {task.title || "Untitled task"}
                                                        </Link>

                                                        {task.assignedTo && (
                                                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                                                {getPersonName(task.assignedTo)}
                                                            </p>
                                                        )}
                                                    </td>

                                                    <td className={`px-4 py-4 capitalize ${priorityText[priority] || priorityText.medium}`}>
                                                        {priority}
                                                    </td>

                                                    <td className="whitespace-nowrap px-4 py-4 text-[var(--text-muted)]">
                                                        {formatDate(task.dueDate)}
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <span className="inline-flex items-center gap-2 whitespace-nowrap">
                                                            <span
                                                                aria-hidden="true"
                                                                className="h-2 w-2 rounded-full"
                                                                style={{ background: status.color }}
                                                            />
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar */}
                <aside className="space-y-6 lg:sticky lg:top-4">
                    <section className={`${panel} p-5 sm:p-6`}>
                        <h2 className="font-semibold">Project information</h2>

                        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1">
                            <MetadataItem icon={CheckCircle2} label="Status">
                                {statusKey}
                            </MetadataItem>

                            <MetadataItem icon={FolderKanban} label="Workspace">
                                {workspaceName}
                            </MetadataItem>

                            <MetadataItem icon={CalendarDays} label="Start date">
                                {formatDate(project.startDate)}
                            </MetadataItem>

                            <MetadataItem icon={CalendarDays} label="End date">
                                <span className={isPastEndDate ? "text-[var(--danger)]" : ""}>
                                    {formatDate(project.endDate)}
                                </span>

                                {isPastEndDate && (
                                    <span className="mt-0.5 block text-xs font-medium text-[var(--danger)]">
                                        Past end date
                                    </span>
                                )}
                            </MetadataItem>

                            <MetadataItem icon={UserRound} label="Created by">
                                {getPersonName(creator)}

                                {creator && typeof creator === "object" && creator.email && (
                                    <span className="mt-0.5 block break-all text-xs font-normal text-[var(--text-muted)]">
                                        {creator.email}
                                    </span>
                                )}
                            </MetadataItem>
                        </div>
                    </section>

                    <section className={`${panel} p-5 sm:p-6`}>
                        <h2 className="font-semibold">Task completion</h2>

                        <p
                            className="mt-4 text-3xl font-bold tabular-nums tracking-tight"
                            style={displayFont}
                        >
                            {loadingTasks ? "—" : `${progress}%`}
                        </p>

                        <div className="mt-3">
                            <ProgressBar
                                value={loadingTasks ? 0 : progress}
                                label="Task completion"
                            />
                        </div>

                        <p className="mt-3 text-sm text-[var(--text-muted)]">
                            {loadingTasks
                                ? "Calculating..."
                                : `${completedTasks} of ${totalTasks} tasks completed.`}
                        </p>
                    </section>

                    <section className={`${panel} p-5 sm:p-6`}>
                        <h2 className="font-semibold">Activity</h2>

                        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1">
                            <MetadataItem icon={Clock3} label="Created">
                                {formatDateTime(project.createdAt)}
                            </MetadataItem>

                            <MetadataItem icon={RefreshCw} label="Last updated">
                                {formatDateTime(project.updatedAt)}
                            </MetadataItem>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}