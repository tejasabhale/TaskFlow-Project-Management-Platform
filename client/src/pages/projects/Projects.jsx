
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FolderKanban,
    Plus,
    Search,
    RefreshCw,
    X,
    CalendarDays,
    CheckCircle2,
    CircleDashed,
    AlertCircle,
    ArrowUpRight,
} from "lucide-react";

import { useWorkspace } from "../../context/WorkspaceContext.jsx";
import { getProjects, createProject } from "../../services/project.service.js";
import { getTasks } from "../../services/task.service.js";

const projectStatuses = ["Planning", "Active", "Completed", "Archived"];

const statusStyles = {
    Planning: {
        backgroundColor: "var(--surface-muted)",
        color: "var(--text-muted)",
    },
    Active: {
        backgroundColor: "var(--primary-soft, #e1f2ef)",
        color: "var(--primary)",
    },
    Completed: {
        backgroundColor: "#ecfdf5",
        color: "#047857",
    },
    Archived: {
        backgroundColor: "#f1f5f9",
        color: "#64748b",
    },
};

const getId = (value) => {
    if (!value) return "";

    if (typeof value === "object") {
        return String(value._id || value.id || "");
    }

    return String(value);
};

function getList(response, key) {
    let result = response?.data ?? response;

    if (result?.data) result = result.data;

    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.[key])) return result[key];

    return [];
}

const formatDate = (date) => {
    if (!date) return null;

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return null;

    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(parsed);
};

const initialProjectForm = {
    name: "",
    description: "",
    status: "Planning",
    startDate: "",
    endDate: "",
};

export default function Projects() {
    const {
        workspaces,
        currentWorkspace: selectedWorkspace,
        currentWorkspaceId: workspaceId,
        setCurrentWorkspace,
        loading: loadingWorkspaces,
        canManageMembers,
    } = useWorkspace();

    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [loadingProjects, setLoadingProjects] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [createOpen, setCreateOpen] = useState(false);
    const [projectForm, setProjectForm] = useState(initialProjectForm);
    const [creatingProject, setCreatingProject] = useState(false);
    const [createError, setCreateError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const loadProjectData = useCallback(async (id) => {
        if (!id) {
            setProjects([]);
            setTasks([]);
            setLoadingProjects(false);
            setRefreshing(false);
            return;
        }

        setLoadingProjects(true);
        setError("");

        try {
            const [projectResponse, taskResponse] = await Promise.all([
                getProjects({ workspaceId: id }),
                getTasks({ workspaceId: id }),
            ]);

            setProjects(getList(projectResponse, "projects"));
            setTasks(getList(taskResponse, "tasks"));
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to load projects. Please try again."
            );

            setProjects([]);
            setTasks([]);
        } finally {
            setLoadingProjects(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadProjectData(workspaceId);
    }, [workspaceId, loadProjectData]);

    useEffect(() => {
        setSearch("");
        setStatusFilter("All");
        setSuccessMessage("");
        setError("");
        setCreateOpen(false);
    }, [workspaceId]);

    const handleRefresh = async () => {
        if (!workspaceId || loadingProjects) return;

        setRefreshing(true);
        await loadProjectData(workspaceId);
    };

    const handleCreateProject = async (event) => {
        event.preventDefault();

        setCreateError("");
        setSuccessMessage("");

        if (!workspaceId) {
            setCreateError("Please select a workspace.");
            return;
        }

        if (!canManageMembers) {
            setCreateError(
                "Only the workspace owner or an admin can create projects."
            );
            return;
        }

        const name = projectForm.name.trim();
        const description = projectForm.description.trim();

        if (name.length < 3) {
            setCreateError(
                "Project name must contain at least 3 characters."
            );
            return;
        }

        if (
            projectForm.startDate &&
            projectForm.endDate &&
            projectForm.startDate > projectForm.endDate
        ) {
            setCreateError(
                "The project start date cannot be after its end date."
            );
            return;
        }

        try {
            setCreatingProject(true);

            const payload = {
                name,
                description,
                workspace: workspaceId,
                status: projectForm.status,
                ...(projectForm.startDate && {
                    startDate: projectForm.startDate,
                }),
                ...(projectForm.endDate && {
                    endDate: projectForm.endDate,
                }),
            };

            const response = await createProject(payload);

            const createdProject =
                response?.data?.data ||
                response?.data?.project ||
                response?.data;

            if (!createdProject?._id) {
                throw new Error(
                    "The server did not return the created project."
                );
            }

            setProjects((current) => [
                createdProject,
                ...current.filter(
                    (project) => getId(project) !== getId(createdProject)
                ),
            ]);

            setProjectForm(initialProjectForm);
            setCreateOpen(false);
            setSuccessMessage("Project created successfully.");
        } catch (err) {
            setCreateError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to create the project."
            );
        } finally {
            setCreatingProject(false);
        }
    };

    const projectCards = projects.map((project) => {
        const projectTasks = tasks.filter(
            (task) => getId(task.project) === getId(project)
        );

        const total = projectTasks.length;

        const completed = projectTasks.filter(
            (task) => task.status === "completed"
        ).length;

        return {
            ...project,
            total,
            completed,
            progress: total
                ? Math.round((completed / total) * 100)
                : 0,
        };
    });

    const filteredProjects = projectCards.filter((project) => {
        const query = search.trim().toLowerCase();

        const matchesSearch =
            project.name?.toLowerCase().includes(query) ||
            project.description?.toLowerCase().includes(query);

        const matchesStatus =
            statusFilter === "All" ||
            project.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div
            className="mx-auto max-w-7xl space-y-6"
            style={{ color: "var(--text)" }}
        >
            {/* Page heading */}
            <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Projects
                    </h2>

                    <p
                        className="mt-1 text-sm"
                        style={{ color: "var(--text-muted)" }}
                    >
                        View your projects and track their progress.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                    >
                        {filteredProjects.length}{" "}
                        {filteredProjects.length === 1 ? "project" : "projects"}
                    </span>

                    {canManageMembers && (
                        <button
                            type="button"
                            onClick={() => {
                                setCreateError("");
                                setProjectForm(initialProjectForm);
                                setCreateOpen(true);
                            }}
                            disabled={!workspaceId}
                            className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold disabled:opacity-50"
                            style={{
                                background: "var(--primary)",
                                color: "#fff",
                            }}
                        >
                            <Plus size={17} />
                            Create Project
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={!workspaceId || loadingProjects}
                        aria-label="Refresh projects"
                        className="flex size-10 items-center justify-center rounded-lg border disabled:opacity-50"
                        style={{
                            borderColor: "var(--border)",
                            background: "var(--surface)",
                        }}
                    >
                        <RefreshCw
                            size={16}
                            className={refreshing ? "animate-spin" : ""}
                        />
                    </button>
                </div>
            </section>

            {/* Success message */}
            {successMessage && (
                <div
                    role="status"
                    className="rounded-lg border px-4 py-3 text-sm"
                    style={{
                        borderColor: "var(--border)",
                        background: "var(--surface)",
                        color: "var(--primary)",
                    }}
                >
                    {successMessage}
                </div>
            )}

            {/* Errors */}
            {error && (
                <div
                    role="alert"
                    className="flex gap-3 rounded-lg border p-4 text-sm"
                    style={{
                        borderColor: "#dc7777",
                        background: "var(--surface)",
                        color: "#c24141",
                    }}
                >
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Workspace selector and filters */}
            <section
                className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row"
                style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                }}
            >
                <select
                    aria-label="Select workspace"
                    value={workspaceId || ""}
                    onChange={(event) =>
                        setCurrentWorkspace(event.target.value)
                    }
                    disabled={loadingWorkspaces || workspaces.length === 0}
                    className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none sm:max-w-xs"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                    }}
                >
                    {loadingWorkspaces ? (
                        <option value="">Loading workspaces...</option>
                    ) : workspaces.length === 0 ? (
                        <option value="">No workspaces available</option>
                    ) : (
                        workspaces.map((workspace) => (
                            <option
                                key={getId(workspace)}
                                value={getId(workspace)}
                            >
                                {workspace.name}
                            </option>
                        ))
                    )}
                </select>

                <div className="relative min-w-0 flex-1">
                    <Search
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--text-muted)" }}
                    />

                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search projects..."
                        className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none"
                        style={{
                            background: "var(--surface)",
                            borderColor: "var(--border)",
                            color: "var(--text)",
                        }}
                    />
                </div>

                <select
                    aria-label="Filter projects by status"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="rounded-lg border px-3.5 py-2.5 text-sm outline-none"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                    }}
                >
                    <option value="All">All statuses</option>

                    {projectStatuses.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
            </section>

            {/* Project cards */}
            {loadingProjects ? (
                <div
                    className="rounded-xl border py-16 text-center"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                    }}
                >
                    <RefreshCw
                        size={22}
                        className="mx-auto animate-spin"
                        style={{ color: "var(--primary)" }}
                    />

                    <p
                        className="mt-3 text-sm"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Loading projects...
                    </p>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div
                    className="rounded-xl border px-5 py-14 text-center"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                    }}
                >
                    <FolderKanban
                        size={30}
                        className="mx-auto"
                        style={{ color: "var(--text-muted)" }}
                    />

                    <h3 className="mt-4 font-semibold">
                        {projects.length === 0
                            ? "No projects yet"
                            : "No matching projects"}
                    </h3>

                    <p
                        className="mt-2 text-sm"
                        style={{ color: "var(--text-muted)" }}
                    >
                        {projects.length === 0
                            ? "Create a project to start organizing your work."
                            : "Try another search term or status filter."}
                    </p>

                    {projects.length === 0 && canManageMembers && (
                        <button
                            type="button"
                            onClick={() => {
                                setCreateError("");
                                setProjectForm(initialProjectForm);
                                setCreateOpen(true);
                            }}
                            className="mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                            style={{ background: "var(--primary)" }}
                        >
                            <Plus size={16} />
                            Create your first project
                        </button>
                    )}
                </div>
            ) : (
                <section className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
                    {filteredProjects.map((project) => {
                        const startDate = formatDate(project.startDate);
                        const endDate = formatDate(project.endDate);
                        const detailsPath = `/dashboard/projects/${project._id}`;

                        return (
                            <article
                                key={project._id}
                                className="flex min-w-0 flex-col rounded-xl border p-5 transition-colors hover:border-[var(--primary)]"
                                style={{
                                    background: "var(--surface)",
                                    borderColor: "var(--border)",
                                }}
                            >
                                {/* Card heading */}
                                <div className="flex items-start justify-between gap-3">
                                    <div
                                        className="flex size-11 shrink-0 items-center justify-center rounded-lg text-lg font-semibold"
                                        style={{
                                            background: "var(--primary-soft, #e1f2ef)",
                                            color: "var(--primary)",
                                        }}
                                    >
                                        {project.name?.charAt(0).toUpperCase() || "P"}
                                    </div>

                                    <span
                                        className="rounded-full px-2.5 py-1 text-xs font-medium"
                                        style={
                                            statusStyles[project.status] ||
                                            statusStyles.Planning
                                        }
                                    >
                                        {project.status || "Planning"}
                                    </span>
                                </div>

                                {/* Project name opens ProjectDetails */}
                                <div className="mt-5">
                                    <p
                                        className="text-xs font-medium"
                                        style={{ color: "var(--primary)" }}
                                    >
                                        {selectedWorkspace?.name || "Workspace project"}
                                    </p>

                                    <h3 className="mt-2 text-lg font-semibold">
                                        <Link
                                            to={detailsPath}
                                            className="inline-flex max-w-full items-start gap-1.5 break-words hover:underline"
                                            style={{ color: "var(--text)" }}
                                            aria-label={`View details for ${project.name}`}
                                        >
                                            <span>{project.name}</span>
                                            <ArrowUpRight
                                                size={16}
                                                className="mt-1 shrink-0"
                                                style={{ color: "var(--primary)" }}
                                            />
                                        </Link>
                                    </h3>

                                    <p
                                        className="mt-2 min-h-10 break-words text-sm leading-6"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        {project.description || "No description provided."}
                                    </p>
                                </div>

                                {/* Progress */}
                                <div className="mt-6">
                                    <div className="mb-2 flex items-center justify-between text-sm">
                                        <span style={{ color: "var(--text-muted)" }}>
                                            Progress
                                        </span>
                                        <span className="font-medium">
                                            {project.progress}%
                                        </span>
                                    </div>

                                    <div
                                        className="h-2 overflow-hidden rounded-full"
                                        style={{ background: "var(--surface-muted)" }}
                                        role="progressbar"
                                        aria-label={`${project.name} progress`}
                                        aria-valuenow={project.progress}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                    >
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${project.progress}%`,
                                                background: "var(--primary)",
                                            }}
                                        />
                                    </div>

                                    <p
                                        className="mt-2 text-xs"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        {project.completed} of {project.total} tasks completed
                                    </p>
                                </div>

                                {/* Dates */}
                                <div
                                    className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4 text-xs"
                                    style={{
                                        borderColor: "var(--border)",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    {startDate && (
                                        <span className="inline-flex items-center gap-1.5">
                                            <CalendarDays size={14} />
                                            Starts {startDate}
                                        </span>
                                    )}

                                    {endDate && (
                                        <span className="inline-flex items-center gap-1.5">
                                            <CalendarDays size={14} />
                                            Due {endDate}
                                        </span>
                                    )}

                                    {!startDate && !endDate && (
                                        <span>No dates set</span>
                                    )}
                                </div>

                                {/* Footer */}
                                <div
                                    className="mt-4 flex items-center justify-between gap-3 border-t pt-4"
                                    style={{ borderColor: "var(--border)" }}
                                >
                                    <span
                                        className="flex min-w-0 items-center gap-2 text-xs"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        {project.total > 0 &&
                                            project.completed === project.total ? (
                                            <CheckCircle2 size={15} className="shrink-0" />
                                        ) : (
                                            <CircleDashed size={15} className="shrink-0" />
                                        )}

                                        <span className="truncate">
                                            {project.total === 0
                                                ? "No tasks"
                                                : `${project.total} total tasks`}
                                        </span>
                                    </span>

                                    <Link
                                        to={detailsPath}
                                        className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold hover:underline"
                                        style={{ color: "var(--primary)" }}
                                    >
                                        View details
                                        <ArrowUpRight size={14} />
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </section>
            )}

            {/* Create project dialog */}
            {createOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-6"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !creatingProject
                        ) {
                            setCreateOpen(false);
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="create-project-title"
                        className="my-auto w-full max-w-lg rounded-2xl border p-6"
                        style={{
                            background: "var(--surface)",
                            color: "var(--text)",
                            borderColor: "var(--border)",
                        }}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div
                                    className="mb-4 flex size-10 items-center justify-center rounded-lg"
                                    style={{
                                        background: "var(--primary-soft, #e1f2ef)",
                                        color: "var(--primary)",
                                    }}
                                >
                                    <FolderKanban size={20} />
                                </div>

                                <h2
                                    id="create-project-title"
                                    className="text-xl font-semibold"
                                >
                                    Create project
                                </h2>

                                <p
                                    className="mt-1 text-sm"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    Add a project to {selectedWorkspace?.name}.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setCreateOpen(false)}
                                disabled={creatingProject}
                                aria-label="Close dialog"
                                className="flex size-8 items-center justify-center rounded-lg"
                                style={{ color: "var(--text-muted)" }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {createError && (
                            <div
                                role="alert"
                                className="mt-5 rounded-lg border px-3 py-2.5 text-sm"
                                style={{
                                    borderColor: "#dc7777",
                                    color: "#c24141",
                                }}
                            >
                                {createError}
                            </div>
                        )}

                        <form
                            onSubmit={handleCreateProject}
                            className="mt-6 space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="project-name"
                                    className="text-sm font-medium"
                                >
                                    Project name
                                </label>

                                <input
                                    id="project-name"
                                    type="text"
                                    minLength={3}
                                    maxLength={120}
                                    required
                                    value={projectForm.name}
                                    onChange={(event) =>
                                        setProjectForm((current) => ({
                                            ...current,
                                            name: event.target.value,
                                        }))
                                    }
                                    placeholder="e.g. Website Redesign"
                                    className="mt-2 w-full rounded-lg border px-3.5 py-3 text-sm outline-none"
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
                                    rows={3}
                                    value={projectForm.description}
                                    onChange={(event) =>
                                        setProjectForm((current) => ({
                                            ...current,
                                            description: event.target.value,
                                        }))
                                    }
                                    placeholder="Describe the project."
                                    className="mt-2 w-full resize-y rounded-lg border px-3.5 py-3 text-sm outline-none"
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
                                    value={projectForm.status}
                                    onChange={(event) =>
                                        setProjectForm((current) => ({
                                            ...current,
                                            status: event.target.value,
                                        }))
                                    }
                                    className="mt-2 w-full rounded-lg border px-3.5 py-3 text-sm outline-none"
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
                                        htmlFor="project-start"
                                        className="text-sm font-medium"
                                    >
                                        Start date
                                    </label>

                                    <input
                                        id="project-start"
                                        type="date"
                                        value={projectForm.startDate}
                                        onChange={(event) =>
                                            setProjectForm((current) => ({
                                                ...current,
                                                startDate: event.target.value,
                                            }))
                                        }
                                        className="mt-2 w-full rounded-lg border px-3 py-3 text-sm outline-none"
                                        style={{
                                            background: "var(--surface)",
                                            color: "var(--text)",
                                            borderColor: "var(--border)",
                                        }}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="project-end"
                                        className="text-sm font-medium"
                                    >
                                        End date
                                    </label>

                                    <input
                                        id="project-end"
                                        type="date"
                                        min={projectForm.startDate || undefined}
                                        value={projectForm.endDate}
                                        onChange={(event) =>
                                            setProjectForm((current) => ({
                                                ...current,
                                                endDate: event.target.value,
                                            }))
                                        }
                                        className="mt-2 w-full rounded-lg border px-3 py-3 text-sm outline-none"
                                        style={{
                                            background: "var(--surface)",
                                            color: "var(--text)",
                                            borderColor: "var(--border)",
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setCreateOpen(false)}
                                    disabled={creatingProject}
                                    className="h-10 rounded-lg border px-4 text-sm font-medium disabled:opacity-50"
                                    style={{
                                        borderColor: "var(--border)",
                                        color: "var(--text)",
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        creatingProject ||
                                        !projectForm.name.trim() ||
                                        !workspaceId
                                    }
                                    className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-60"
                                    style={{ background: "var(--primary)" }}
                                >
                                    <Plus size={16} />
                                    {creatingProject ? "Creating..." : "Create project"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
}
