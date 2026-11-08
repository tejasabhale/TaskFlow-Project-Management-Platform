import { useCallback, useEffect, useRef, useState } from "react";
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
    ChevronDown,
    Check,
} from "lucide-react";

import { useWorkspace } from "../../hooks/useWorkspace.js";
import { getProjects, createProject } from "../../services/project.service.js";
import { getTasks } from "../../services/task.service.js";

const projectStatuses = ["Planning", "Active", "Completed", "Archived"];

const filterOptions = [
    { value: "All", label: "All statuses" },
    ...projectStatuses.map((status) => ({ value: status, label: status })),
];

const statusOptions = projectStatuses.map((status) => ({
    value: status,
    label: status,
}));

const statusStyles = {
    Planning: {
        backgroundColor: "var(--surface-muted)",
        color: "var(--text-muted)",
    },
    Active: {
        backgroundColor: "var(--primary-soft)",
        color: "var(--primary-text)",
    },
    Completed: {
        backgroundColor: "var(--success-soft)",
        color: "var(--success)",
    },
    Archived: {
        backgroundColor: "var(--surface-muted)",
        color: "var(--text-subtle)",
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

/**
 * Themed dropdown.
 * Native <option> lists are drawn by the browser/OS and ignore most CSS,
 * so this renders the list with the same theme variables as the rest of the page.
 */
function ThemedSelect({
    id,
    value,
    onChange,
    options,
    ariaLabel,
    disabled = false,
}) {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const wrapperRef = useRef(null);
    const listRef = useRef(null);

    const selectedIndex = Math.max(
        0,
        options.findIndex((option) => option.value === value)
    );
    const selectedOption = options[selectedIndex];
    const listId = `${id || "themed-select"}-listbox`;

    const openMenu = () => {
        if (disabled) return;
        setActiveIndex(selectedIndex);
        setOpen(true);
    };

    const closeMenu = () => setOpen(false);

    const selectOption = (option) => {
        onChange(option.value);
        closeMenu();
    };

    // Close when clicking outside
    useEffect(() => {
        if (!open) return undefined;

        const handlePointerDown = (event) => {
            if (!wrapperRef.current?.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        return () =>
            document.removeEventListener("mousedown", handlePointerDown);
    }, [open]);

    // Keep the highlighted option visible while using the keyboard
    useEffect(() => {
        if (!open) return;

        listRef.current
            ?.querySelector(`[data-index="${activeIndex}"]`)
            ?.scrollIntoView({ block: "nearest" });
    }, [open, activeIndex]);

    const handleKeyDown = (event) => {
        if (disabled) return;

        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                if (!open) openMenu();
                else setActiveIndex((index) => (index + 1) % options.length);
                break;

            case "ArrowUp":
                event.preventDefault();
                if (!open) openMenu();
                else
                    setActiveIndex(
                        (index) => (index - 1 + options.length) % options.length
                    );
                break;

            case "Home":
                if (open) {
                    event.preventDefault();
                    setActiveIndex(0);
                }
                break;

            case "End":
                if (open) {
                    event.preventDefault();
                    setActiveIndex(options.length - 1);
                }
                break;

            case "Enter":
            case " ":
                event.preventDefault();
                if (!open) openMenu();
                else selectOption(options[activeIndex]);
                break;

            case "Escape":
                if (open) {
                    event.preventDefault();
                    event.stopPropagation();
                    closeMenu();
                }
                break;

            case "Tab":
                closeMenu();
                break;

            default:
                break;
        }
    };

    return (
        <div ref={wrapperRef} className="relative min-w-0">
            <button
                id={id}
                type="button"
                role="combobox"
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                disabled={disabled}
                onClick={() => (open ? closeMenu() : openMenu())}
                onKeyDown={handleKeyDown}
                className="flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5 text-left text-sm outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                    background: "var(--surface)",
                    color: "var(--text)",
                    borderColor: open ? "var(--primary)" : "var(--border)",
                }}
            >
                <span className="truncate">{selectedOption?.label}</span>

                <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform ${open ? "rotate-180" : ""
                        }`}
                    style={{ color: "var(--text-muted)" }}
                />
            </button>

            {open && (
                <ul
                    ref={listRef}
                    id={listId}
                    role="listbox"
                    aria-label={ariaLabel}
                    className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-60 overflow-y-auto rounded-lg border p-1 shadow-lg"
                    style={{
                        background: "var(--surface)",
                        color: "var(--text)",
                        borderColor: "var(--border)",
                    }}
                >
                    {options.map((option, index) => {
                        const isSelected = option.value === value;
                        const isActive = index === activeIndex;

                        return (
                            <li
                                key={option.value}
                                role="option"
                                aria-selected={isSelected}
                                data-index={index}
                                onMouseEnter={() => setActiveIndex(index)}
                                onMouseDown={(event) => {
                                    // keep focus on the trigger button
                                    event.preventDefault();
                                }}
                                onClick={() => selectOption(option)}
                                className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-sm"
                                style={{
                                    background: isActive
                                        ? "var(--surface-muted)"
                                        : "transparent",
                                    color: isSelected
                                        ? "var(--primary)"
                                        : "var(--text)",
                                    fontWeight: isSelected ? 600 : 400,
                                }}
                            >
                                <span className="truncate">{option.label}</span>

                                {isSelected && (
                                    <Check size={15} className="shrink-0" />
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default function Projects() {
    const {
        currentWorkspace: selectedWorkspace,
        currentWorkspaceId: workspaceId,
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
            setCreateError("Please select a workspace first.");
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
            className="mx-auto w-full max-w-7xl min-w-0 space-y-6 px-4 py-6 sm:space-y-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9"
            style={{ color: "var(--text)" }}
        >
            {/* Page heading */}
            <section className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl min-[400px]:text-3xl font-bold tracking-tight sm:text-4xl">
                        Projects
                    </h1>

                    <p
                        className="mt-1 text-sm"
                        style={{ color: "var(--text-muted)" }}
                    >
                        View your projects and track their progress.
                    </p>
                </div>

                <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
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
                    className="flex min-w-0 gap-3 rounded-lg border p-4 text-sm"
                    style={{
                        borderColor: "#dc7777",
                        background: "var(--surface)",
                        color: "#c24141",
                    }}
                >
                    <AlertCircle size={18} className="shrink-0" />
                    <span className="min-w-0 break-words">{error}</span>
                </div>
            )}

            {/* Search and status filter */}
            <section
                className="grid min-w-0 grid-cols-1 gap-3 rounded-xl border p-3 sm:grid-cols-[minmax(0,1fr)_minmax(170px,0.35fr)] sm:p-4"
                style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                }}
            >
                {/* Search */}
                <div className="relative min-w-0">
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
                        className="w-full min-w-0 rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none"
                        style={{
                            background: "var(--surface)",
                            borderColor: "var(--border)",
                            color: "var(--text)",
                        }}
                    />
                </div>

                {/* Status filter */}
                <ThemedSelect
                    id="project-status-filter"
                    ariaLabel="Filter projects by status"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={filterOptions}
                />
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
                            disabled={!workspaceId}
                            className="mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            style={{ background: "var(--primary)" }}
                        >
                            <Plus size={16} />
                            Create your first project
                        </button>
                    )}
                </div>
            ) : (
                <section className="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 2xl:grid-cols-3">
                    {filteredProjects.map((project) => {
                        const startDate = formatDate(project.startDate);
                        const endDate = formatDate(project.endDate);
                        const projectId = getId(project);
                        const detailsPath = `/dashboard/projects/${projectId}`;

                        return (
                            <article
                                key={projectId}
                                className="flex h-full min-w-0 flex-col rounded-xl border p-4 transition-colors hover:border-[var(--primary)] sm:p-5"
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

                                {/* Project name */}
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
                                        className="mt-2 min-h-12 break-words text-sm leading-6 [overflow-wrap:anywhere]"
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
                                    className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4 text-xs"
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
                    className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 px-3 py-4 sm:items-center sm:px-4 sm:py-6"
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
                        className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border p-5 shadow-xl sm:max-h-[calc(100dvh-3rem)] sm:p-6"
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
                                    className="mt-2 w-full min-w-0 rounded-lg border px-3.5 py-3 text-sm outline-none"
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
                                    className="mt-2 w-full min-w-0 resize-y rounded-lg border px-3.5 py-3 text-sm outline-none"
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

                                <div className="mt-2">
                                    <ThemedSelect
                                        id="project-status"
                                        value={projectForm.status}
                                        onChange={(status) =>
                                            setProjectForm((current) => ({
                                                ...current,
                                                status,
                                            }))
                                        }
                                        options={statusOptions}
                                    />
                                </div>
                            </div>

                            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
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
                                        className="mt-2 w-full min-w-0 rounded-lg border px-3 py-3 text-sm outline-none"
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
                                        className="mt-2 w-full min-w-0 rounded-lg border px-3 py-3 text-sm outline-none"
                                        style={{
                                            background: "var(--surface)",
                                            color: "var(--text)",
                                            borderColor: "var(--border)",
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-end sm:gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCreateOpen(false)}
                                    disabled={creatingProject}
                                    className="h-10 w-full rounded-lg border px-4 text-sm font-medium disabled:opacity-50 sm:w-auto"
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
                                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto"
                                    style={{ background: "var(--primary)" }}
                                >
                                    <Plus size={16} />
                                    {creatingProject
                                        ? "Creating..."
                                        : "Create project"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
}