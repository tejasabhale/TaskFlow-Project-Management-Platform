
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Search,
    RefreshCw,
    ClipboardList,
    AlertCircle,
    Plus,
    X,
    ArrowUpRight,
} from "lucide-react";

import { useWorkspace } from "../../context/WorkspaceContext.jsx";
import { getTasks, createTask } from "../../services/task.service.js";
import api from "../../api/axios";

const statusOptions = [
    { label: "All statuses", value: "All" },
    { label: "To Do", value: "todo" },
    { label: "In Progress", value: "inProgress" },
    { label: "In Review", value: "review" },
    { label: "Completed", value: "completed" },
];

const statusLabels = {
    todo: "To Do",
    inProgress: "In Progress",
    review: "In Review",
    completed: "Completed",
};

const statusStyles = {
    todo: {
        backgroundColor: "var(--surface-muted)",
        color: "var(--text-muted)",
    },
    inProgress: {
        backgroundColor: "var(--primary-soft, #e1f2ef)",
        color: "var(--primary)",
    },
    review: {
        backgroundColor: "#fff7ed",
        color: "#c2410c",
    },
    completed: {
        backgroundColor: "#ecfdf5",
        color: "#047857",
    },
};

const priorityStyles = {
    high: { color: "#dc2626" },
    medium: { color: "#d97706" },
    low: { color: "var(--text-muted)" },
};

const initialTaskForm = {
    title: "",
    description: "",
    project: "",
    assignedTo: "",
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

function getList(response, key) {
    let result = response?.data ?? response;

    if (result?.data) result = result.data;

    if (Array.isArray(result)) return result;

    if (Array.isArray(result?.[key])) {
        return result[key];
    }

    return [];
}

const formatDate = (date) => {
    if (!date) return "No due date";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Invalid date";
    }

    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(parsedDate);
};

const formatPriority = (priority = "medium") =>
    priority.charAt(0).toUpperCase() + priority.slice(1);

export default function Tasks() {
    const {
        workspaces,
        currentWorkspace: selectedWorkspace,
        currentWorkspaceId: workspaceId,
        setCurrentWorkspace,
        loading: loadingWorkspaces,
        isOwner,
    } = useWorkspace();

    const [tasks, setTasks] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [loadingTasks, setLoadingTasks] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [createOpen, setCreateOpen] = useState(false);
    const [taskForm, setTaskForm] = useState(initialTaskForm);

    const [projects, setProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [creatingTask, setCreatingTask] = useState(false);

    const [createError, setCreateError] = useState("");
    const [createMessage, setCreateMessage] = useState("");

    const isWorkspaceOwner = Boolean(isOwner);

    useEffect(() => {
        setSearch("");
        setStatusFilter("All");
        setCreateOpen(false);
        setCreateError("");
        setCreateMessage("");
        setError("");
    }, [workspaceId]);

    // Load tasks for the shared selected workspace.
    useEffect(() => {
        if (!workspaceId) {
            setTasks([]);
            setLoadingTasks(false);
            return;
        }

        let active = true;

        const fetchTasks = async () => {
            try {
                setLoadingTasks(true);
                setError("");

                const response = await getTasks({ workspaceId });

                if (active) {
                    setTasks(getList(response, "tasks"));
                }
            } catch (err) {
                if (!active) return;

                setTasks([]);

                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load tasks. Please try again."
                );
            } finally {
                if (active) setLoadingTasks(false);
            }
        };

        fetchTasks();

        return () => {
            active = false;
        };
    }, [workspaceId]);

    const loadProjects = async () => {
        if (!workspaceId) {
            setCreateError("Please select a workspace.");
            return;
        }

        setLoadingProjects(true);
        setCreateError("");
        setProjects([]);

        try {
            const response = await api.get("/projects", {
                params: { workspaceId },
            });

            const list = getList(response, "projects").filter(
                (project) =>
                    !project.workspace ||
                    getId(project.workspace) === getId(workspaceId)
            );

            setProjects(list);

            setTaskForm((current) => ({
                ...current,
                project: list[0]?._id || "",
            }));

            if (list.length === 0) {
                setCreateError(
                    "This workspace has no projects. Create a project before creating a task."
                );
            }
        } catch (err) {
            setCreateError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to load projects for this workspace."
            );
        } finally {
            setLoadingProjects(false);
        }
    };

    const handleOpenCreate = async () => {
        if (!workspaceId || !isWorkspaceOwner) return;

        setTaskForm(initialTaskForm);
        setCreateError("");
        setCreateMessage("");
        setCreateOpen(true);

        await loadProjects();
    };

    const handleCreateTask = async (event) => {
        event.preventDefault();

        setCreateError("");
        setCreateMessage("");

        if (!isWorkspaceOwner) {
            setCreateError("Only the workspace owner can create tasks.");
            return;
        }

        if (!workspaceId) {
            setCreateError("Please select a workspace.");
            return;
        }

        if (!taskForm.title.trim()) {
            setCreateError("Task title is required.");
            return;
        }

        if (!taskForm.project) {
            setCreateError("Please select a project.");
            return;
        }

        try {
            setCreatingTask(true);

            const payload = {
                title: taskForm.title.trim(),
                description: taskForm.description.trim(),
                workspace: workspaceId,
                project: taskForm.project,
                priority: taskForm.priority,
                ...(taskForm.assignedTo && {
                    assignedTo: taskForm.assignedTo,
                }),
                ...(taskForm.dueDate && {
                    dueDate: taskForm.dueDate,
                }),
            };

            const response = await createTask(payload);

            const createdTask =
                response?.data?.data ||
                response?.data?.task ||
                response?.data;

            if (!createdTask?._id) {
                throw new Error(
                    "The server did not return the created task. Refresh the list to check."
                );
            }

            setTasks((current) => [
                createdTask,
                ...current.filter(
                    (task) => task._id !== createdTask._id
                ),
            ]);

            setCreateOpen(false);
            setTaskForm(initialTaskForm);
            setCreateMessage("Task created successfully.");
        } catch (err) {
            setCreateError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to create task. Please try again."
            );
        } finally {
            setCreatingTask(false);
        }
    };

    const handleRefresh = async () => {
        if (!workspaceId || loadingTasks) return;

        setRefreshing(true);
        setError("");

        try {
            const response = await getTasks({ workspaceId });
            setTasks(getList(response, "tasks"));
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to refresh tasks. Please try again."
            );
        } finally {
            setRefreshing(false);
        }
    };

    // Build the list of people who can be assigned a task.
    const workspaceMembers = [];
    const seenMemberIds = new Set();

    if (
        selectedWorkspace?.owner &&
        typeof selectedWorkspace.owner === "object"
    ) {
        const owner = selectedWorkspace.owner;
        const ownerId = getId(owner);

        if (ownerId) {
            workspaceMembers.push({
                _id: ownerId,
                fullName:
                    owner.fullName ||
                    owner.userName ||
                    owner.name ||
                    owner.email ||
                    "Workspace owner",
            });

            seenMemberIds.add(ownerId);
        }
    }

    for (const item of selectedWorkspace?.members || []) {
        const memberUser = item.user || item.member;
        const memberId = getId(memberUser);

        if (
            !memberId ||
            seenMemberIds.has(memberId) ||
            typeof memberUser !== "object"
        ) {
            continue;
        }

        workspaceMembers.push({
            _id: memberId,
            fullName:
                memberUser.fullName ||
                memberUser.userName ||
                memberUser.name ||
                memberUser.email ||
                "Workspace member",
        });

        seenMemberIds.add(memberId);
    }

    const filteredTasks = tasks.filter((task) => {
        const projectName =
            typeof task.project === "object"
                ? task.project?.name || task.project?.title || ""
                : "";

        const assignedName =
            typeof task.assignedTo === "object"
                ? task.assignedTo?.fullName ||
                task.assignedTo?.name ||
                ""
                : "";

        const query = search.trim().toLowerCase();

        const matchesSearch =
            (task.title || "").toLowerCase().includes(query) ||
            projectName.toLowerCase().includes(query) ||
            assignedName.toLowerCase().includes(query);

        const matchesStatus =
            statusFilter === "All" ||
            task.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div
            className="mx-auto max-w-7xl space-y-6"
            style={{ color: "var(--text)" }}
        >
            {/* Heading */}
            <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                        My Tasks
                    </h2>

                    <p
                        className="mt-1 text-sm"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Manage and track your work in one place.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {isWorkspaceOwner && (
                        <button
                            type="button"
                            onClick={handleOpenCreate}
                            disabled={!workspaceId}
                            className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-50"
                            style={{ background: "var(--primary)" }}
                        >
                            <Plus size={17} />
                            Create Task
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={!workspaceId || loadingTasks}
                        className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium disabled:opacity-50"
                        style={{
                            borderColor: "var(--border)",
                            background: "var(--surface)",
                        }}
                    >
                        <RefreshCw
                            size={16}
                            className={refreshing ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>
                </div>
            </section>

            {createMessage && (
                <div
                    role="status"
                    className="rounded-lg border px-4 py-3 text-sm"
                    style={{
                        borderColor: "var(--border)",
                        background: "var(--surface)",
                        color: "var(--primary)",
                    }}
                >
                    {createMessage}
                </div>
            )}

            {/* Workspace Selector */}
            <section
                className="rounded-xl border p-4"
                style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                }}
            >
                <label
                    htmlFor="tasks-workspace"
                    className="mb-2 block text-sm font-medium"
                >
                    Workspace
                </label>

                <select
                    id="tasks-workspace"
                    value={workspaceId || ""}
                    onChange={(event) =>
                        setCurrentWorkspace(event.target.value)
                    }
                    disabled={loadingWorkspaces || workspaces.length === 0}
                    className="w-full max-w-md rounded-lg border px-3.5 py-2.5 text-sm outline-none"
                    style={{
                        background: "var(--surface)",
                        color: "var(--text)",
                        borderColor: "var(--border)",
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

                {selectedWorkspace && (
                    <p
                        className="mt-2 text-xs"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Showing tasks in {selectedWorkspace.name}.
                        {isWorkspaceOwner
                            ? " You can create tasks in this workspace."
                            : ""}
                    </p>
                )}
            </section>

            {/* Search and Status Filters */}
            <section className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                    <Search
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--text-muted)" }}
                    />

                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search tasks or projects..."
                        className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none"
                        style={{
                            background: "var(--surface)",
                            borderColor: "var(--border)",
                            color: "var(--text)",
                        }}
                    />
                </div>

                <select
                    aria-label="Filter tasks by status"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="rounded-lg border px-4 py-2.5 text-sm outline-none"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                    }}
                >
                    {statusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                            {status.label}
                        </option>
                    ))}
                </select>
            </section>

            {/* Errors */}
            {error && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-lg border p-4 text-sm"
                    style={{
                        borderColor: "#dc7777",
                        background: "var(--surface)",
                        color: "#c24141",
                    }}
                >
                    <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0"
                    />
                    <span>{error}</span>
                </div>
            )}

            {/* Tasks Table */}
            <section
                className="overflow-hidden rounded-xl border"
                style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                }}
            >
                <div
                    className="border-b px-5 py-4"
                    style={{ borderColor: "var(--border)" }}
                >
                    <h3 className="font-semibold">All Tasks</h3>

                    <p
                        className="mt-1 text-sm"
                        style={{ color: "var(--text-muted)" }}
                    >
                        {loadingTasks
                            ? "Loading tasks..."
                            : `${filteredTasks.length} tasks found`}
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[750px] text-left text-sm">
                        <thead
                            className="text-xs uppercase tracking-wide"
                            style={{
                                background: "var(--surface-muted)",
                                color: "var(--text-muted)",
                            }}
                        >
                            <tr>
                                <th className="px-5 py-3 font-medium">Task</th>
                                <th className="px-5 py-3 font-medium">Project</th>
                                <th className="px-5 py-3 font-medium">Priority</th>
                                <th className="px-5 py-3 font-medium">Due Date</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loadingTasks ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-5 py-14 text-center"
                                    >
                                        <RefreshCw
                                            size={20}
                                            className="mx-auto animate-spin"
                                            style={{ color: "var(--primary)" }}
                                        />

                                        <p
                                            className="mt-3 text-sm"
                                            style={{ color: "var(--text-muted)" }}
                                        >
                                            Loading tasks...
                                        </p>
                                    </td>
                                </tr>
                            ) : filteredTasks.length > 0 ? (
                                filteredTasks.map((task) => {
                                    const status = task.status || "todo";
                                    const priority = task.priority || "medium";

                                    const projectName =
                                        typeof task.project === "object"
                                            ? task.project?.name ||
                                            task.project?.title ||
                                            "Unknown project"
                                            : "Unknown project";

                                    return (
                                        <tr
                                            key={task._id}
                                            className="border-t transition-colors hover:bg-[var(--surface-muted)]"
                                            style={{ borderColor: "var(--border)" }}
                                        >
                                            <td className="px-5 py-4">
                                                <Link
                                                    to={`/dashboard/tasks/${task._id}`}
                                                    className="group inline-flex max-w-sm items-center gap-1.5 font-medium hover:underline"
                                                    style={{ color: "var(--text)" }}
                                                    aria-label={`View details for ${task.title}`}
                                                >
                                                    <span className="break-words">
                                                        {task.title}
                                                    </span>

                                                    <ArrowUpRight
                                                        size={15}
                                                        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                                                        style={{ color: "var(--primary)" }}
                                                    />
                                                </Link>

                                                {task.description && (
                                                    <p
                                                        className="mt-1 max-w-sm truncate text-xs"
                                                        style={{ color: "var(--text-muted)" }}
                                                    >
                                                        {task.description}
                                                    </p>
                                                )}
                                            </td>

                                            <td
                                                className="px-5 py-4"
                                                style={{ color: "var(--text-muted)" }}
                                            >
                                                {projectName}
                                            </td>

                                            <td
                                                className="px-5 py-4 font-medium"
                                                style={
                                                    priorityStyles[priority] ||
                                                    priorityStyles.medium
                                                }
                                            >
                                                {formatPriority(priority)}
                                            </td>

                                            <td
                                                className="px-5 py-4"
                                                style={{ color: "var(--text-muted)" }}
                                            >
                                                {formatDate(task.dueDate)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className="inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium"
                                                    style={
                                                        statusStyles[status] ||
                                                        statusStyles.todo
                                                    }
                                                >
                                                    {statusLabels[status] || status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-5 py-14 text-center"
                                    >
                                        <ClipboardList
                                            size={28}
                                            className="mx-auto"
                                            style={{ color: "var(--text-muted)" }}
                                        />

                                        <p className="mt-3 text-sm font-medium">
                                            {tasks.length === 0
                                                ? "No tasks in this workspace yet."
                                                : "No tasks match your search."}
                                        </p>

                                        <p
                                            className="mt-1 text-sm"
                                            style={{ color: "var(--text-muted)" }}
                                        >
                                            {tasks.length === 0
                                                ? "Create a task to get started."
                                                : "Try another search term or status filter."}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Create Task Dialog */}
            {createOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-6"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !creatingTask
                        ) {
                            setCreateOpen(false);
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="create-task-title"
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
                                    <ClipboardList size={20} />
                                </div>

                                <h2
                                    id="create-task-title"
                                    className="text-xl font-semibold"
                                >
                                    Create task
                                </h2>

                                <p
                                    className="mt-1 text-sm"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    Add a task to{" "}
                                    {selectedWorkspace?.name || "this workspace"}.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setCreateOpen(false)}
                                disabled={creatingTask}
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
                            onSubmit={handleCreateTask}
                            className="mt-6 space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="task-title"
                                    className="text-sm font-medium"
                                >
                                    Task title
                                </label>

                                <input
                                    id="task-title"
                                    type="text"
                                    minLength={1}
                                    maxLength={200}
                                    value={taskForm.title}
                                    onChange={(event) =>
                                        setTaskForm((current) => ({
                                            ...current,
                                            title: event.target.value,
                                        }))
                                    }
                                    placeholder="e.g. Implement user authentication"
                                    className="mt-2 w-full rounded-lg border px-3.5 py-3 text-sm outline-none"
                                    style={{
                                        background: "var(--surface)",
                                        color: "var(--text)",
                                        borderColor: "var(--border)",
                                    }}
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="task-description"
                                    className="text-sm font-medium"
                                >
                                    Description (optional)
                                </label>

                                <textarea
                                    id="task-description"
                                    rows={3}
                                    maxLength={3000}
                                    value={taskForm.description}
                                    onChange={(event) =>
                                        setTaskForm((current) => ({
                                            ...current,
                                            description: event.target.value,
                                        }))
                                    }
                                    placeholder="Describe the task..."
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
                                    htmlFor="task-project"
                                    className="text-sm font-medium"
                                >
                                    Project
                                </label>

                                <select
                                    id="task-project"
                                    value={taskForm.project}
                                    onChange={(event) =>
                                        setTaskForm((current) => ({
                                            ...current,
                                            project: event.target.value,
                                        }))
                                    }
                                    disabled={
                                        loadingProjects || projects.length === 0
                                    }
                                    className="mt-2 w-full rounded-lg border px-3.5 py-3 text-sm outline-none disabled:opacity-60"
                                    style={{
                                        background: "var(--surface)",
                                        color: "var(--text)",
                                        borderColor: "var(--border)",
                                    }}
                                    required
                                >
                                    <option value="">
                                        {loadingProjects
                                            ? "Loading projects..."
                                            : projects.length === 0
                                                ? "No projects available"
                                                : "Select a project"}
                                    </option>

                                    {projects.map((project) => (
                                        <option key={project._id} value={project._id}>
                                            {project.name ||
                                                project.title ||
                                                "Untitled project"}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="task-assignee"
                                    className="text-sm font-medium"
                                >
                                    Assign to
                                </label>

                                <select
                                    id="task-assignee"
                                    value={taskForm.assignedTo}
                                    onChange={(event) =>
                                        setTaskForm((current) => ({
                                            ...current,
                                            assignedTo: event.target.value,
                                        }))
                                    }
                                    className="mt-2 w-full rounded-lg border px-3.5 py-3 text-sm outline-none"
                                    style={{
                                        background: "var(--surface)",
                                        color: "var(--text)",
                                        borderColor: "var(--border)",
                                    }}
                                >
                                    <option value="">Unassigned</option>

                                    {workspaceMembers.map((member) => (
                                        <option key={member._id} value={member._id}>
                                            {member.fullName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="task-priority"
                                        className="text-sm font-medium"
                                    >
                                        Priority
                                    </label>

                                    <select
                                        id="task-priority"
                                        value={taskForm.priority}
                                        onChange={(event) =>
                                            setTaskForm((current) => ({
                                                ...current,
                                                priority: event.target.value,
                                            }))
                                        }
                                        className="mt-2 w-full rounded-lg border px-3.5 py-3 text-sm outline-none"
                                        style={{
                                            background: "var(--surface)",
                                            color: "var(--text)",
                                            borderColor: "var(--border)",
                                        }}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="task-due-date"
                                        className="text-sm font-medium"
                                    >
                                        Due date
                                    </label>

                                    <input
                                        id="task-due-date"
                                        type="date"
                                        value={taskForm.dueDate}
                                        onChange={(event) =>
                                            setTaskForm((current) => ({
                                                ...current,
                                                dueDate: event.target.value,
                                            }))
                                        }
                                        className="mt-2 w-full rounded-lg border px-3.5 py-3 text-sm outline-none"
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
                                    disabled={creatingTask}
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
                                        creatingTask ||
                                        loadingProjects ||
                                        !taskForm.title.trim() ||
                                        !taskForm.project
                                    }
                                    className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-60"
                                    style={{ background: "var(--primary)" }}
                                >
                                    <Plus size={16} />
                                    {creatingTask ? "Creating..." : "Create task"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
}
