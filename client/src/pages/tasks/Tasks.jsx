import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    Search,
    RefreshCw,
    ClipboardList,
    AlertCircle,
    Plus,
    X,
    ArrowUpRight,
    CalendarDays,
    UserRound,
    Paperclip,
    Tag,
    CheckCircle2,
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
        return String(value._id || value.id || value.userId || "");
    }

    return String(value);
};

function getList(response, key) {
    let result = response?.data ?? response;

    for (let depth = 0; depth < 4; depth += 1) {
        if (Array.isArray(result)) return result;
        if (!result || typeof result !== "object") break;

        if (key && Array.isArray(result[key])) {
            return result[key];
        }

        if (result.data !== undefined) {
            result = result.data;
            continue;
        }

        break;
    }

    return [];
}

function getTaskResponse(response) {
    let result = response?.data ?? response;

    for (let depth = 0; depth < 4; depth += 1) {
        if (!result || typeof result !== "object") return null;
        if (result._id) return result;

        if (result.task) {
            result = result.task;
            continue;
        }

        if (result.data !== undefined) {
            result = result.data;
            continue;
        }

        break;
    }

    return null;
}

function getPersonName(person) {
    if (!person) return "Unassigned";

    if (typeof person === "string") {
        return "User details unavailable";
    }

    return (
        person.fullName ||
        person.userName ||
        person.username ||
        person.name ||
        person.email ||
        "User details unavailable"
    );
}

function getProjectName(project) {
    if (!project) return "Unknown project";

    if (typeof project === "string") {
        return "Project details unavailable";
    }

    return project.name || project.title || "Unknown project";
}

function formatDate(value) {
    if (!value) return "No due date";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "No due date";

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

function isOverdue(task) {
    if (!task.dueDate || task.status === "completed") return false;

    const date = new Date(task.dueDate);

    if (Number.isNaN(date.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    return date < today;
}

function formatPriority(priority = "medium") {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export default function Tasks() {
    const {
        workspaces,
        currentWorkspace,
        currentWorkspaceId: workspaceId,
        setCurrentWorkspace,
        loading: loadingWorkspaces,
        isOwner,
        canManageMembers,
    } = useWorkspace();

    const canViewAllTasks = Boolean(isOwner || canManageMembers);

    const [tasks, setTasks] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [assigneeFilter, setAssigneeFilter] = useState("All");

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

    const [loadingAction, setLoadingAction] = useState(false);

    const loadTasks = useCallback(async () => {
        if (!workspaceId) {
            setTasks([]);
            return;
        }

        setLoadingAction(true);
        setError("");

        try {
            const response = await getTasks({ workspaceId });
            setTasks(getList(response, "tasks"));
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to load tasks."
            );
        } finally {
            setLoadingAction(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        let active = true;

        const fetchTasks = async () => {
            if (!workspaceId) {
                setTasks([]);
                setLoadingTasks(false);
                return;
            }

            setTasks([]);
            setLoadingTasks(true);
            setError("");
            setSearch("");
            setStatusFilter("All");
            setAssigneeFilter("All");
            setCreateOpen(false);
            setCreateError("");
            setCreateMessage("");

            try {
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
                    "Unable to load tasks."
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

    // Build the list of users who can receive tasks.
    const workspaceMembers = useMemo(() => {
        const result = [];
        const seen = new Set();

        const addMember = (person) => {
            if (!person || typeof person !== "object") return;

            const id = getId(person);

            if (!id || seen.has(id)) return;

            seen.add(id);
            result.push({
                _id: id,
                name: getPersonName(person),
                email: person.email || "",
            });
        };

        addMember(currentWorkspace?.owner);

        for (const item of currentWorkspace?.members || []) {
            addMember(item?.user || item?.member || item);
        }

        return result;
    }, [currentWorkspace]);

    // Assignee options are derived from the tasks returned by the API.
    const assignees = useMemo(() => {
        const users = new Map();

        tasks.forEach((task) => {
            const person = task.assignedTo;

            if (person && typeof person === "object") {
                const id = getId(person);

                if (id) {
                    users.set(id, {
                        id,
                        name: getPersonName(person),
                    });
                }
            }
        });

        return [...users.values()].sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        const query = search.trim().toLowerCase();

        return tasks.filter((task) => {
            const projectName = getProjectName(task.project);
            const assigneeName = getPersonName(task.assignedTo);
            const creatorName = getPersonName(task.createdBy);

            const matchesSearch =
                (task.title || "").toLowerCase().includes(query) ||
                (task.description || "").toLowerCase().includes(query) ||
                projectName.toLowerCase().includes(query) ||
                assigneeName.toLowerCase().includes(query) ||
                creatorName.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "All" ||
                task.status === statusFilter;

            const matchesAssignee =
                assigneeFilter === "All" ||
                getId(task.assignedTo) === assigneeFilter;

            return matchesSearch && matchesStatus && matchesAssignee;
        });
    }, [tasks, search, statusFilter, assigneeFilter]);

    const statistics = useMemo(() => {
        const completed = tasks.filter(
            (task) => task.status === "completed"
        ).length;

        const inProgress = tasks.filter(
            (task) => task.status === "inProgress"
        ).length;

        const overdue = tasks.filter(isOverdue).length;

        return {
            total: tasks.length,
            completed,
            inProgress,
            overdue,
        };
    }, [tasks]);

    const updateTaskForm = (event) => {
        const { name, value } = event.target;

        setTaskForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

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

            const projectList = getList(response, "projects").filter(
                (project) =>
                    !project.workspace ||
                    getId(project.workspace) === getId(workspaceId)
            );

            setProjects(projectList);

            setTaskForm((current) => ({
                ...current,
                project: getId(projectList[0]),
            }));

            if (projectList.length === 0) {
                setCreateError(
                    "Create a project in this workspace before adding a task."
                );
            }
        } catch (err) {
            setCreateError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to load projects."
            );
        } finally {
            setLoadingProjects(false);
        }
    };

    const handleOpenCreate = async () => {
        if (!workspaceId || !isOwner) return;

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

        if (!isOwner) {
            setCreateError("Only the workspace owner can create tasks.");
            return;
        }

        if (!workspaceId || !taskForm.project) {
            setCreateError("Select a workspace and project.");
            return;
        }

        if (!taskForm.title.trim()) {
            setCreateError("Task title is required.");
            return;
        }

        const selectedProject = projects.find(
            (project) => getId(project) === taskForm.project
        );

        if (!selectedProject) {
            setCreateError("The selected project is not available.");
            return;
        }

        if (
            taskForm.assignedTo &&
            !workspaceMembers.some(
                (member) => member._id === taskForm.assignedTo
            )
        ) {
            setCreateError(
                "The selected assignee is not a member of this workspace."
            );
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

            await createTask(payload);

            setCreateOpen(false);
            setTaskForm(initialTaskForm);
            setCreateMessage("Task created successfully.");

            // Reload from the backend so populated fields are displayed.
            const response = await getTasks({ workspaceId });
            setTasks(getList(response, "tasks"));
        } catch (err) {
            setCreateError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to create task."
            );
        } finally {
            setCreatingTask(false);
        }
    };

    const handleRefresh = async () => {
        if (!workspaceId || refreshing || loadingTasks) return;

        setRefreshing(true);
        setError("");

        try {
            const response = await getTasks({ workspaceId });
            setTasks(getList(response, "tasks"));
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to refresh tasks."
            );
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <div
            className="mx-auto max-w-7xl space-y-6"
            style={{ color: "var(--text)" }}
        >
            {/* Heading */}
            <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {canViewAllTasks ? "Workspace Tasks" : "My Tasks"}
                    </h1>

                    <p
                        className="mt-1 text-sm"
                        style={{ color: "var(--text-muted)" }}
                    >
                        {canViewAllTasks
                            ? "View and manage tasks assigned across your workspace."
                            : "View tasks assigned to you in this workspace."}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {isOwner && (
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
                        disabled={!workspaceId || refreshing || loadingTasks}
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

            {/* Workspace selector */}
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
                    {workspaces.map((workspace) => (
                        <option
                            key={getId(workspace)}
                            value={getId(workspace)}
                        >
                            {workspace.name}
                        </option>
                    ))}
                </select>
            </section>

            {/* Statistics */}
            <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {[
                    {
                        label: "Total tasks",
                        value: statistics.total,
                        icon: ClipboardList,
                    },
                    {
                        label: "Completed",
                        value: statistics.completed,
                        icon: CheckCircle2,
                    },
                    {
                        label: "In progress",
                        value: statistics.inProgress,
                        icon: RefreshCw,
                    },
                    {
                        label: "Overdue",
                        value: statistics.overdue,
                        icon: AlertCircle,
                    },
                ].map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.label}
                            className="rounded-xl border p-4 sm:p-5"
                            style={{
                                background: "var(--surface)",
                                borderColor: "var(--border)",
                            }}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <p
                                    className="text-sm"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    {item.label}
                                </p>
                                <Icon
                                    size={18}
                                    style={{ color: "var(--primary)" }}
                                />
                            </div>

                            <p className="mt-3 text-2xl font-semibold">
                                {loadingTasks ? "—" : item.value}
                            </p>
                        </div>
                    );
                })}
            </section>

            {/* Search and filters */}
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
                        placeholder="Search title, project, assignee..."
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

                {canViewAllTasks && (
                    <select
                        aria-label="Filter tasks by assignee"
                        value={assigneeFilter}
                        onChange={(event) =>
                            setAssigneeFilter(event.target.value)
                        }
                        className="rounded-lg border px-4 py-2.5 text-sm outline-none"
                        style={{
                            background: "var(--surface)",
                            borderColor: "var(--border)",
                            color: "var(--text)",
                        }}
                    >
                        <option value="All">All assignees</option>
                        <option value="Unassigned">Unassigned</option>

                        {assignees.map((person) => (
                            <option key={person.id} value={person.id}>
                                {person.name}
                            </option>
                        ))}
                    </select>
                )}
            </section>

            {/* Errors */}
            {(error || loadingAction) && (
                <div
                    role={error ? "alert" : "status"}
                    className="flex items-start gap-3 rounded-lg border p-4 text-sm"
                    style={{
                        borderColor: error ? "#dc7777" : "var(--border)",
                        background: "var(--surface)",
                        color: error ? "#c24141" : "var(--text-muted)",
                    }}
                >
                    {error ? (
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    ) : (
                        <RefreshCw
                            size={18}
                            className="animate-spin"
                        />
                    )}
                    <span>{error || "Refreshing tasks..."}</span>
                </div>
            )}

            {/* Task table */}
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
                    <h2 className="font-semibold">
                        {canViewAllTasks ? "All workspace tasks" : "Tasks assigned to me"}
                    </h2>

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
                    <table className="w-full min-w-[1050px] text-left text-sm">
                        <thead
                            style={{
                                background: "var(--surface-muted)",
                                color: "var(--text-muted)",
                            }}
                        >
                            <tr>
                                <th className="px-4 py-3 font-medium">Task</th>
                                <th className="px-4 py-3 font-medium">Project</th>
                                <th className="px-4 py-3 font-medium">Assigned to</th>
                                {canViewAllTasks && (
                                    <th className="px-4 py-3 font-medium">Created by</th>
                                )}
                                <th className="px-4 py-3 font-medium">Priority</th>
                                <th className="px-4 py-3 font-medium">Due date</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Files / Labels</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loadingTasks ? (
                                <tr>
                                    <td
                                        colSpan={canViewAllTasks ? 8 : 7}
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
                            ) : filteredTasks.length ? (
                                filteredTasks.map((task) => {
                                    const status = task.status || "todo";
                                    const priority = task.priority || "medium";
                                    const overdue = isOverdue(task);
                                    const labels = Array.isArray(task.labels)
                                        ? task.labels
                                        : [];
                                    const attachments = Array.isArray(task.attachments)
                                        ? task.attachments
                                        : [];

                                    return (
                                        <tr
                                            key={getId(task)}
                                            className="border-t align-top hover:bg-[var(--surface-muted)]"
                                            style={{ borderColor: "var(--border)" }}
                                        >
                                            <td className="max-w-xs px-4 py-4">
                                                <Link
                                                    to={`/dashboard/tasks/${getId(task)}`}
                                                    className="inline-flex items-center gap-1 font-medium hover:underline"
                                                    style={{ color: "var(--text)" }}
                                                >
                                                    <span className="break-words">
                                                        {task.title || "Untitled task"}
                                                    </span>
                                                    <ArrowUpRight
                                                        size={14}
                                                        className="shrink-0"
                                                    />
                                                </Link>

                                                {task.description && (
                                                    <p
                                                        className="mt-1 line-clamp-2 text-xs leading-5"
                                                        style={{ color: "var(--text-muted)" }}
                                                    >
                                                        {task.description}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-4 py-4">
                                                {getProjectName(task.project)}
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                                                        style={{
                                                            background: "var(--primary-soft, #e1f2ef)",
                                                            color: "var(--primary)",
                                                        }}
                                                    >
                                                        {getPersonName(task.assignedTo)
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <span>
                                                        {getPersonName(task.assignedTo)}
                                                    </span>
                                                </div>
                                            </td>

                                            {canViewAllTasks && (
                                                <td className="px-4 py-4">
                                                    {getPersonName(task.createdBy)}
                                                </td>
                                            )}

                                            <td className="px-4 py-4">
                                                <span
                                                    className="font-medium"
                                                    style={
                                                        priorityStyles[priority] ||
                                                        priorityStyles.medium
                                                    }
                                                >
                                                    {formatPriority(priority)}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-4">
                                                <div
                                                    className="flex items-center gap-1.5"
                                                    style={{
                                                        color: overdue
                                                            ? "#dc2626"
                                                            : "var(--text-muted)",
                                                    }}
                                                >
                                                    <CalendarDays size={14} />
                                                    {formatDate(task.dueDate)}
                                                </div>

                                                {overdue && (
                                                    <span className="mt-1 block text-xs font-medium text-red-600">
                                                        Overdue
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-4">
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

                                            <td className="px-4 py-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    <span
                                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs"
                                                        style={{
                                                            background: "var(--surface-muted)",
                                                            color: "var(--text-muted)",
                                                        }}
                                                    >
                                                        <Paperclip size={12} />
                                                        {attachments.length}
                                                    </span>

                                                    {labels.length > 0 ? (
                                                        labels.slice(0, 2).map((label, index) => (
                                                            <span
                                                                key={getId(label) || index}
                                                                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs"
                                                                style={{
                                                                    background: "var(--surface-muted)",
                                                                    color: "var(--text-muted)",
                                                                }}
                                                            >
                                                                <Tag size={11} />
                                                                {typeof label === "object"
                                                                    ? label.name || label.title || "Label"
                                                                    : "Label"}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span
                                                            className="text-xs"
                                                            style={{ color: "var(--text-muted)" }}
                                                        >
                                                            No labels
                                                        </span>
                                                    )}

                                                    {labels.length > 2 && (
                                                        <span className="text-xs text-slate-500">
                                                            +{labels.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={canViewAllTasks ? 8 : 7}
                                        className="px-5 py-14 text-center"
                                    >
                                        <ClipboardList
                                            size={28}
                                            className="mx-auto"
                                            style={{ color: "var(--text-muted)" }}
                                        />

                                        <p className="mt-3 text-sm font-medium">
                                            {tasks.length === 0
                                                ? canViewAllTasks
                                                    ? "No tasks in this workspace yet."
                                                    : "No tasks are assigned to you."
                                                : "No tasks match your filters."}
                                        </p>

                                        <p
                                            className="mt-1 text-sm"
                                            style={{ color: "var(--text-muted)" }}
                                        >
                                            {canViewAllTasks
                                                ? "Create a task or change your filters to see more results."
                                                : "Ask your workspace owner to assign a task to you."}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Create task dialog */}
            {createOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-6">
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
                                    Add a task to {currentWorkspace?.name || "this workspace"}.
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
                                    background: "var(--surface)",
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
                                <label htmlFor="task-title" className="text-sm font-medium">
                                    Task title
                                </label>
                                <input
                                    id="task-title"
                                    name="title"
                                    value={taskForm.title}
                                    onChange={updateTaskForm}
                                    maxLength={200}
                                    required
                                    placeholder="Implement user authentication"
                                    className="mt-2 w-full rounded-lg border px-3.5 py-3 text-sm outline-none"
                                    style={{
                                        background: "var(--surface)",
                                        color: "var(--text)",
                                        borderColor: "var(--border)",
                                    }}
                                />
                            </div>

                            <div>
                                <label htmlFor="task-description" className="text-sm font-medium">
                                    Description
                                </label>
                                <textarea
                                    id="task-description"
                                    name="description"
                                    value={taskForm.description}
                                    onChange={updateTaskForm}
                                    rows={3}
                                    maxLength={3000}
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
                                <label htmlFor="task-project" className="text-sm font-medium">
                                    Project
                                </label>
                                <select
                                    id="task-project"
                                    name="project"
                                    value={taskForm.project}
                                    onChange={updateTaskForm}
                                    disabled={loadingProjects || projects.length === 0}
                                    required
                                    className="mt-2 w-full rounded-lg border px-3.5 py-3 text-sm outline-none"
                                    style={{
                                        background: "var(--surface)",
                                        color: "var(--text)",
                                        borderColor: "var(--border)",
                                    }}
                                >
                                    <option value="">
                                        {loadingProjects
                                            ? "Loading projects..."
                                            : "Select a project"}
                                    </option>
                                    {projects.map((project) => (
                                        <option key={getId(project)} value={getId(project)}>
                                            {getProjectName(project)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="task-assignee" className="text-sm font-medium">
                                    Assign to
                                </label>
                                <select
                                    id="task-assignee"
                                    name="assignedTo"
                                    value={taskForm.assignedTo}
                                    onChange={updateTaskForm}
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
                                            {member.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="task-priority" className="text-sm font-medium">
                                        Priority
                                    </label>
                                    <select
                                        id="task-priority"
                                        name="priority"
                                        value={taskForm.priority}
                                        onChange={updateTaskForm}
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
                                    <label htmlFor="task-due-date" className="text-sm font-medium">
                                        Due date
                                    </label>
                                    <input
                                        id="task-due-date"
                                        name="dueDate"
                                        type="date"
                                        value={taskForm.dueDate}
                                        onChange={updateTaskForm}
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
                                    className="h-10 rounded-lg border px-4 text-sm font-medium"
                                    style={{ borderColor: "var(--border)" }}
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
                                    className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-50"
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