
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    FolderKanban,
    CalendarDays,
    UserRound,
    ClipboardList,
    CheckCircle2,
    Clock3,
    Pencil,
    Trash2,
    RefreshCw,
    AlertCircle,
    Plus,
    X,
    Save,
} from "lucide-react";

import api from "../../api/axios";
import { getTasks } from "../../services/task.service.js";

const projectStatuses = [
    "Planning",
    "Active",
    "Completed",
    "Archived",
];

const taskStatusLabels = {
    todo: "To Do",
    inProgress: "In Progress",
    review: "In Review",
    completed: "Completed",
};

const taskStatusStyles = {
    todo: {
        background: "var(--surface-muted)",
        color: "var(--text-muted)",
    },
    inProgress: {
        background: "var(--primary-soft, #e1f2ef)",
        color: "var(--primary)",
    },
    review: {
        background: "#fff7ed",
        color: "#c2410c",
    },
    completed: {
        background: "#ecfdf5",
        color: "#047857",
    },
};

const projectStatusStyles = {
    Planning: {
        background: "var(--surface-muted)",
        color: "var(--text-muted)",
    },
    Active: {
        background: "var(--primary-soft, #e1f2ef)",
        color: "var(--primary)",
    },
    Completed: {
        background: "#ecfdf5",
        color: "#047857",
    },
    Archived: {
        background: "#f1f5f9",
        color: "#64748b",
    },
};

const initialForm = {
    name: "",
    description: "",
    status: "Planning",
    startDate: "",
    endDate: "",
};

const getId = (value) => {
    if (!value) return "";

    if (typeof value === "object") {
        return String(value._id || value.id || "");
    }

    return String(value);
};

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

function getPersonName(person) {
    if (!person) return "Not available";
    if (typeof person === "string") return "Not available";

    return (
        person.fullName ||
        person.name ||
        person.userName ||
        person.username ||
        person.email ||
        "Not available"
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

function formatDateTime(value) {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not available";

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

export default function ProjectDetails() {
    const { projectId, id } = useParams();
    const resolvedProjectId = projectId || id;
    const navigate = useNavigate();

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

    const loadProject = useCallback(async (isRefresh = false) => {
        if (!resolvedProjectId) {
            setError("Project ID is missing from the URL.");
            setLoading(false);
            return;
        }

        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        setError("");
        setTaskError("");

        try {
            const response = await api.get(
                `/projects/${resolvedProjectId}`
            );

            const projectData = getEntity(response, "project");

            if (!projectData?._id) {
                throw new Error("Project not found.");
            }

            setProject(projectData);

            setForm({
                name: projectData.name || "",
                description: projectData.description || "",
                status: projectData.status || "Planning",
                startDate: toDateInput(projectData.startDate),
                endDate: toDateInput(projectData.endDate),
            });

            // Load tasks belonging to this project's workspace.
            setLoadingTasks(true);

            try {
                const workspaceId = getId(projectData.workspace);

                const taskResponse = await getTasks(
                    workspaceId
                        ? { workspaceId }
                        : { projectId: resolvedProjectId }
                );

                const taskList = getList(taskResponse, "tasks");

                setTasks(
                    taskList.filter(
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
    }, [resolvedProjectId]);

    useEffect(() => {
        loadProject();
    }, [loadProject]);

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

        const name = form.name.trim();
        const description = form.description.trim();

        if (name.length < 3) {
            setError("Project name must contain at least 3 characters.");
            return;
        }

        if (description.length > 0 && description.length < 5) {
            setError(
                "Description must be empty or contain at least 5 characters."
            );
            return;
        }

        if (
            form.startDate &&
            form.endDate &&
            form.startDate > form.endDate
        ) {
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

            const response = await api.patch(
                `/projects/${resolvedProjectId}`,
                payload
            );

            const updatedProject = getEntity(response, "project");

            setProject((current) => ({
                ...current,
                ...payload,
                ...(updatedProject?._id ? updatedProject : {}),
            }));

            setEditing(false);
            setSuccess("Project updated successfully.");

            await loadProject(true);
            setSuccess("Project updated successfully.");
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

    const totalTasks = tasks.length;

    const completedTasks = useMemo(
        () => tasks.filter((task) => task.status === "completed").length,
        [tasks]
    );

    const progress = totalTasks
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    const inProgressTasks = tasks.filter(
        (task) => task.status === "inProgress"
    ).length;

    const currentStatusStyle =
        projectStatusStyles[project?.status] ||
        projectStatusStyles.Planning;

    if (loading) {
        return (
            <div
                className="flex min-h-64 items-center justify-center gap-3"
                style={{ color: "var(--text-muted)" }}
            >
                <RefreshCw size={20} className="animate-spin" />
                Loading project details...
            </div>
        );
    }

    if (!project) {
        return (
            <div className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
                <Link
                    to="/dashboard/projects"
                    className="inline-flex items-center gap-2 text-sm"
                    style={{ color: "var(--primary)" }}
                >
                    <ArrowLeft size={16} />
                    Back to Projects
                </Link>

                <div
                    className="rounded-xl border p-6"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                    }}
                >
                    <AlertCircle size={26} style={{ color: "#dc2626" }} />

                    <h1 className="mt-3 text-lg font-semibold">
                        Unable to display project
                    </h1>

                    <p
                        className="mt-2 text-sm"
                        style={{ color: "var(--text-muted)" }}
                    >
                        {error || "The requested project could not be found."}
                    </p>

                    <button
                        type="button"
                        onClick={() => loadProject()}
                        className="mt-4 rounded-lg px-4 py-2 text-sm font-medium text-white"
                        style={{ background: "var(--primary)" }}
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    const workspaceName =
        typeof project.workspace === "object"
            ? project.workspace?.name
            : "";

    const createdBy = project.createdBy;

    return (
        <div
            className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6"
            style={{ color: "var(--text)" }}
        >
            {/* Header */}
            <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-3">
                    <Link
                        to="/dashboard/projects"
                        className="inline-flex items-center gap-2 text-sm"
                        style={{ color: "var(--text-muted)" }}
                    >
                        <ArrowLeft size={16} />
                        Back to Projects
                    </Link>

                    <div className="flex items-start gap-3">
                        <div
                            className="flex size-12 shrink-0 items-center justify-center rounded-xl"
                            style={{
                                background: "var(--primary-soft, #e1f2ef)",
                                color: "var(--primary)",
                            }}
                        >
                            <FolderKanban size={23} />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="break-words text-2xl font-semibold tracking-tight">
                                    {project.name}
                                </h1>

                                <span
                                    className="rounded-full px-2.5 py-1 text-xs font-medium"
                                    style={currentStatusStyle}
                                >
                                    {project.status || "Planning"}
                                </span>
                            </div>

                            <p
                                className="mt-1 text-sm"
                                style={{ color: "var(--text-muted)" }}
                            >
                                {workspaceName || "Project details"}
                                {" · "}
                                Project ID: {getId(project)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => loadProject(true)}
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
                                    name: project.name || "",
                                    description: project.description || "",
                                    status: project.status || "Planning",
                                    startDate: toDateInput(project.startDate),
                                    endDate: toDateInput(project.endDate),
                                });

                                setEditing(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white"
                            style={{ background: "var(--primary)" }}
                        >
                            <Pencil size={15} />
                            Edit Project
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
            </section>

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

            {/* Project summary and statistics */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div
                    className="rounded-xl border p-5"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                    }}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                            Total tasks
                        </p>
                        <ClipboardList size={19} style={{ color: "var(--primary)" }} />
                    </div>

                    <p className="mt-3 text-3xl font-semibold">{totalTasks}</p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                        In this project
                    </p>
                </div>

                <div
                    className="rounded-xl border p-5"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                    }}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                            Completed
                        </p>
                        <CheckCircle2 size={19} style={{ color: "#047857" }} />
                    </div>

                    <p className="mt-3 text-3xl font-semibold">{completedTasks}</p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                        Tasks finished
                    </p>
                </div>

                <div
                    className="rounded-xl border p-5"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                    }}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                            In progress
                        </p>
                        <Clock3 size={19} style={{ color: "var(--primary)" }} />
                    </div>

                    <p className="mt-3 text-3xl font-semibold">{inProgressTasks}</p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                        Currently active
                    </p>
                </div>

                <div
                    className="rounded-xl border p-5"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                    }}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                            Progress
                        </p>
                        <CheckCircle2 size={19} style={{ color: "var(--primary)" }} />
                    </div>

                    <p className="mt-3 text-3xl font-semibold">{progress}%</p>

                    <div
                        className="mt-3 h-2 overflow-hidden rounded-full"
                        style={{ background: "var(--surface-muted)" }}
                        role="progressbar"
                        aria-label="Project completion"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${progress}%`,
                                background: "var(--primary)",
                            }}
                        />
                    </div>
                </div>
            </section>

            {/* Main content */}
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="min-w-0 space-y-6">
                    {/* Project details */}
                    <section
                        className="rounded-xl border p-5 sm:p-6"
                        style={{
                            background: "var(--surface)",
                            borderColor: "var(--border)",
                        }}
                    >
                        <h2 className="text-lg font-semibold">Project details</h2>

                        {!editing ? (
                            <p
                                className="mt-4 whitespace-pre-wrap break-words text-sm leading-7"
                                style={{ color: "var(--text-muted)" }}
                            >
                                {project.description || "No description has been provided."}
                            </p>
                        ) : (
                            <form onSubmit={handleSave} className="mt-5 space-y-5">
                                <div>
                                    <label htmlFor="project-name" className="text-sm font-medium">
                                        Project name
                                    </label>

                                    <input
                                        id="project-name"
                                        name="name"
                                        type="text"
                                        minLength={3}
                                        maxLength={120}
                                        required
                                        value={form.name}
                                        onChange={updateForm}
                                        className="mt-2 w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                                        style={{
                                            background: "var(--surface)",
                                            color: "var(--text)",
                                            borderColor: "var(--border)",
                                        }}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="project-description"
                                        className="text-sm font-medium"
                                    >
                                        Description
                                    </label>

                                    <textarea
                                        id="project-description"
                                        name="description"
                                        rows={4}
                                        maxLength={3000}
                                        value={form.description}
                                        onChange={updateForm}
                                        placeholder="Describe what this project aims to achieve."
                                        className="mt-2 w-full resize-y rounded-lg border px-3 py-2.5 text-sm outline-none"
                                        style={{
                                            background: "var(--surface)",
                                            color: "var(--text)",
                                            borderColor: "var(--border)",
                                        }}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="project-status"
                                        className="text-sm font-medium"
                                    >
                                        Status
                                    </label>

                                    <select
                                        id="project-status"
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
                                        {projectStatuses.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="project-start-date"
                                            className="text-sm font-medium"
                                        >
                                            Start date
                                        </label>

                                        <input
                                            id="project-start-date"
                                            name="startDate"
                                            type="date"
                                            value={form.startDate}
                                            onChange={updateForm}
                                            className="mt-2 w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                                            style={{
                                                background: "var(--surface)",
                                                color: "var(--text)",
                                                borderColor: "var(--border)",
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="project-end-date"
                                            className="text-sm font-medium"
                                        >
                                            End date
                                        </label>

                                        <input
                                            id="project-end-date"
                                            name="endDate"
                                            type="date"
                                            min={form.startDate || undefined}
                                            value={form.endDate}
                                            onChange={updateForm}
                                            className="mt-2 w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                                            style={{
                                                background: "var(--surface)",
                                                color: "var(--text)",
                                                borderColor: "var(--border)",
                                            }}
                                        />
                                    </div>
                                </div>

                                <div
                                    className="flex flex-wrap justify-end gap-2 border-t pt-4"
                                    style={{ borderColor: "var(--border)" }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditing(false);
                                            setError("");
                                            setForm({
                                                name: project.name || "",
                                                description: project.description || "",
                                                status: project.status || "Planning",
                                                startDate: toDateInput(project.startDate),
                                                endDate: toDateInput(project.endDate),
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
                                        disabled={saving || !form.name.trim()}
                                        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                                        style={{ background: "var(--primary)" }}
                                    >
                                        <Save size={15} />
                                        {saving ? "Saving..." : "Save changes"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>

                    {/* Associated tasks */}
                    <section
                        className="overflow-hidden rounded-xl border"
                        style={{
                            background: "var(--surface)",
                            borderColor: "var(--border)",
                        }}
                    >
                        <div
                            className="flex items-center justify-between gap-3 border-b px-5 py-4"
                            style={{ borderColor: "var(--border)" }}
                        >
                            <div>
                                <h2 className="font-semibold">Project tasks</h2>
                                <p
                                    className="mt-1 text-sm"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    Tasks associated with this project.
                                </p>
                            </div>

                            <span
                                className="rounded-full px-2.5 py-1 text-xs font-medium"
                                style={{
                                    background: "var(--surface-muted)",
                                    color: "var(--text-muted)",
                                }}
                            >
                                {tasks.length}
                            </span>
                        </div>

                        {taskError && (
                            <div
                                role="alert"
                                className="m-4 rounded-lg border p-3 text-sm"
                                style={{
                                    borderColor: "#dc7777",
                                    color: "#c24141",
                                }}
                            >
                                {taskError}
                            </div>
                        )}

                        {loadingTasks ? (
                            <div
                                className="flex items-center justify-center gap-2 p-10 text-sm"
                                style={{ color: "var(--text-muted)" }}
                            >
                                <RefreshCw size={17} className="animate-spin" />
                                Loading tasks...
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="px-5 py-12 text-center">
                                <ClipboardList
                                    size={28}
                                    className="mx-auto"
                                    style={{ color: "var(--text-muted)" }}
                                />

                                <p className="mt-3 text-sm font-medium">No tasks yet</p>

                                <p
                                    className="mt-1 text-sm"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    Tasks created for this project will appear here.
                                </p>

                                <Link
                                    to="/dashboard/tasks"
                                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium"
                                    style={{ color: "var(--primary)" }}
                                >
                                    View all tasks
                                    <ArrowLeft size={14} className="rotate-180" />
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[560px] text-left text-sm">
                                    <thead
                                        style={{
                                            background: "var(--surface-muted)",
                                            color: "var(--text-muted)",
                                        }}
                                    >
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Task</th>
                                            <th className="px-4 py-3 font-medium">Priority</th>
                                            <th className="px-4 py-3 font-medium">Due date</th>
                                            <th className="px-4 py-3 font-medium">Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {tasks.map((task) => {
                                            const status = task.status || "todo";
                                            const priority = task.priority || "medium";

                                            return (
                                                <tr
                                                    key={task._id}
                                                    className="border-t"
                                                    style={{ borderColor: "var(--border)" }}
                                                >
                                                    <td className="px-4 py-4">
                                                        <Link
                                                            to={`/dashboard/tasks/${task._id}`}
                                                            className="font-medium hover:underline"
                                                            style={{ color: "var(--text)" }}
                                                        >
                                                            {task.title || "Untitled task"}
                                                        </Link>

                                                        {task.assignedTo && (
                                                            <p
                                                                className="mt-1 text-xs"
                                                                style={{ color: "var(--text-muted)" }}
                                                            >
                                                                {getPersonName(task.assignedTo)}
                                                            </p>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <span
                                                            className="font-medium capitalize"
                                                            style={{
                                                                color:
                                                                    priority === "high"
                                                                        ? "#dc2626"
                                                                        : priority === "medium"
                                                                            ? "#d97706"
                                                                            : "var(--text-muted)",
                                                            }}
                                                        >
                                                            {priority}
                                                        </span>
                                                    </td>

                                                    <td
                                                        className="px-4 py-4 whitespace-nowrap"
                                                        style={{ color: "var(--text-muted)" }}
                                                    >
                                                        {formatDate(task.dueDate)}
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <span
                                                            className="inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium"
                                                            style={
                                                                taskStatusStyles[status] ||
                                                                taskStatusStyles.todo
                                                            }
                                                        >
                                                            {taskStatusLabels[status] || status}
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

                {/* Sidebar information */}
                <aside className="space-y-5">
                    <section
                        className="rounded-xl border p-5"
                        style={{
                            background: "var(--surface)",
                            borderColor: "var(--border)",
                        }}
                    >
                        <h2 className="font-semibold">Project information</h2>

                        <div className="mt-5 space-y-5">
                            <div className="flex items-start gap-3">
                                <FolderKanban
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                    style={{ color: "var(--primary)" }}
                                />

                                <div>
                                    <p
                                        className="text-xs"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        Status
                                    </p>
                                    <p className="mt-1 text-sm font-medium">
                                        {project.status || "Planning"}
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
                                    <p
                                        className="text-xs"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        Start date
                                    </p>
                                    <p className="mt-1 text-sm font-medium">
                                        {formatDate(project.startDate)}
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
                                    <p
                                        className="text-xs"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        End date
                                    </p>
                                    <p className="mt-1 text-sm font-medium">
                                        {formatDate(project.endDate)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <UserRound
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                    style={{ color: "var(--primary)" }}
                                />

                                <div className="min-w-0">
                                    <p
                                        className="text-xs"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        Created by
                                    </p>
                                    <p className="mt-1 break-words text-sm font-medium">
                                        {getPersonName(createdBy)}
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
                                    <p
                                        className="text-xs"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        Created
                                    </p>
                                    <p className="mt-1 text-sm font-medium">
                                        {formatDateTime(project.createdAt)}
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
                                    <p
                                        className="text-xs"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        Last updated
                                    </p>
                                    <p className="mt-1 text-sm font-medium">
                                        {formatDateTime(project.updatedAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section
                        className="rounded-xl border p-5"
                        style={{
                            background: "var(--surface)",
                            borderColor: "var(--border)",
                        }}
                    >
                        <h2 className="font-semibold">Task completion</h2>

                        <p className="mt-4 text-3xl font-semibold">{progress}%</p>

                        <div
                            className="mt-3 h-2 overflow-hidden rounded-full"
                            style={{ background: "var(--surface-muted)" }}
                        >
                            <div
                                className="h-full rounded-full"
                                style={{
                                    width: `${progress}%`,
                                    background: "var(--primary)",
                                }}
                            />
                        </div>

                        <p
                            className="mt-3 text-sm"
                            style={{ color: "var(--text-muted)" }}
                        >
                            {completedTasks} of {totalTasks} tasks completed.
                        </p>
                    </section>

                    <Link
                        to="/dashboard/tasks"
                        className="flex items-center justify-between rounded-xl border p-4 text-sm font-medium"
                        style={{
                            background: "var(--surface)",
                            borderColor: "var(--border)",
                            color: "var(--text)",
                        }}
                    >
                        <span className="flex items-center gap-2">
                            <Plus size={17} style={{ color: "var(--primary)" }} />
                            View all tasks
                        </span>

                        <ArrowLeft
                            size={16}
                            className="rotate-180"
                            style={{ color: "var(--text-muted)" }}
                        />
                    </Link>
                </aside>
            </div>
        </div>
    );
}
