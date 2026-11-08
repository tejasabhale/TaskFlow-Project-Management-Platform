import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import {
    AlertCircle,
    Check,
    ChevronDown,
    Loader2,
    Paperclip,
    Plus,
    RefreshCw,
    Search,
    X,
} from "lucide-react";

import { useWorkspace } from "../../hooks/useWorkspace.js";
import { getTasks, createTask } from "../../services/task.service.js";
import { getProjects } from "../../services/project.service.js";

const taskLinkStyle = { color: "var(--text)" };

const STATUSES = [
    { key: "todo", label: "To do", color: "var(--text-subtle)" },
    { key: "inProgress", label: "In progress", color: "var(--primary)" },
    { key: "review", label: "In review", color: "var(--warning, #d97706)" },
    { key: "completed", label: "Completed", color: "var(--success)" },
];

const STATUS_BY_KEY = Object.fromEntries(
    STATUSES.map((status) => [status.key, status])
);

const STATUS_FILTER_OPTIONS = [
    { value: "All", label: "All statuses" },
    ...STATUSES.map((status) => ({
        value: status.key,
        label: status.label,
    })),
];

const PRIORITY_OPTIONS = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
];

const initialTaskForm = {
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    priority: "medium",
    dueDate: "",
};

const fieldBase =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 text-sm text-[var(--text)] " +
    "outline-none transition-colors duration-150 hover:border-[var(--border-strong)] " +
    "placeholder:text-[var(--text-subtle)] focus:border-[var(--primary)] " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] " +
    "disabled:cursor-not-allowed disabled:opacity-60";

const field = `${fieldBase} h-11`;
const dialogField = `${fieldBase} mt-1.5 h-11`;

const panel = "rounded-2xl border border-[var(--border)] bg-[var(--surface)]";

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]";

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
        if (key && Array.isArray(result[key])) return result[key];

        if (result.data !== undefined) {
            result = result.data;
            continue;
        }

        break;
    }

    return [];
}

function getPersonName(person) {
    if (!person) return "Unassigned";
    if (typeof person === "string") return "User details unavailable";

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
    if (typeof project === "string") return "Project details unavailable";

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

/* ---------------------------------------------------------------
   Dropdown scroll helpers
---------------------------------------------------------------- */

function scrollTriggerToMakeRoom(element, requiredHeight) {
    if (!element) return;

    const viewportPadding = 12;
    const menuGap = 6;
    const rect = element.getBoundingClientRect();

    const overflow =
        rect.bottom + menuGap + requiredHeight + viewportPadding -
        window.innerHeight;

    if (overflow <= 0) return;

    let remaining = overflow + 16;
    let parent = element.parentElement;

    /* Scroll the nearest scrollable containers first */
    while (
        parent &&
        parent !== document.body &&
        parent !== document.documentElement &&
        remaining > 0
    ) {
        const styles = window.getComputedStyle(parent);
        const isScrollable =
            /(auto|scroll|overlay)/.test(styles.overflowY) &&
            parent.scrollHeight > parent.clientHeight + 1;

        if (isScrollable) {
            const maxScroll = Math.max(
                0,
                parent.scrollHeight - parent.clientHeight
            );
            const availableScroll = Math.max(
                0,
                maxScroll - parent.scrollTop
            );
            const scrollAmount = Math.min(remaining, availableScroll);

            if (scrollAmount > 0) {
                parent.scrollBy({
                    top: scrollAmount,
                    behavior: "smooth",
                });
                remaining -= scrollAmount;
            }
        }

        parent = parent.parentElement;
    }

    /* Scroll the main page if additional space is required */
    if (remaining > 1) {
        window.scrollBy({
            top: remaining,
            behavior: "smooth",
        });
    }
}

/* ---------------------------------------------------------------
   Themed Dropdown
   - Always opens downward
   - Automatically scrolls to create space
   - Uses portal to escape overflow containers
   - Scrollbar visibility is configurable per dropdown
   - Scrollbar appearance is defined in the global stylesheet
---------------------------------------------------------------- */

function Dropdown({
    id,
    value,
    options,
    onChange,
    ariaLabel,
    placeholder = "Select",
    disabled = false,
    className = "",
    buttonClassName = field,
    showScrollbar = false,
}) {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [position, setPosition] = useState(null);

    const rootRef = useRef(null);
    const buttonRef = useRef(null);
    const menuRef = useRef(null);

    const selectedIndex = options.findIndex(
        (option) => String(option.value) === String(value)
    );
    const selected = options[selectedIndex];
    const menuHeight = Math.min(options.length * 40 + 8, 256);

    /* Calculate the fixed-position menu coordinates */
    const updateMenuPosition = useCallback(() => {
        const button = buttonRef.current;
        if (!button) return;

        const rect = button.getBoundingClientRect();
        const viewportPadding = 8;
        const menuGap = 6;
        const top = rect.bottom + menuGap;
        const availableHeight = Math.max(
            0,
            window.innerHeight - top - viewportPadding
        );
        const viewportWidth = window.innerWidth;
        const width = Math.min(
            Math.max(rect.width, 180),
            Math.max(0, viewportWidth - viewportPadding * 2)
        );
        const left = Math.max(
            viewportPadding,
            Math.min(
                rect.left,
                viewportWidth - width - viewportPadding
            )
        );

        setPosition({
            top,
            left,
            width,
            maxHeight: Math.min(menuHeight, availableHeight),
        });
    }, [menuHeight]);

    /* Always make room below the trigger */
    const openMenu = () => {
        if (disabled || options.length === 0) return;

        scrollTriggerToMakeRoom(buttonRef.current, menuHeight);
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
        setOpen(true);
    };

    /* Close when clicking outside */
    useEffect(() => {
        if (!open) return undefined;

        const handlePointerDown = (event) => {
            const target = event.target;
            const clickedButton = rootRef.current?.contains(target);
            const clickedMenu = menuRef.current?.contains(target);

            if (!clickedButton && !clickedMenu) {
                setOpen(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
        };
    }, [open]);

    /* Recalculate position during scrolling */
    useLayoutEffect(() => {
        if (!open) {
            setPosition(null);
            return undefined;
        }

        updateMenuPosition();
        window.addEventListener("resize", updateMenuPosition);
        window.addEventListener("scroll", updateMenuPosition, true);

        return () => {
            window.removeEventListener("resize", updateMenuPosition);
            window.removeEventListener("scroll", updateMenuPosition, true);
        };
    }, [open, updateMenuPosition]);

    /* Keep highlighted option visible */
    useEffect(() => {
        if (!open || activeIndex < 0) return;

        menuRef.current
            ?.querySelector(`[data-index="${activeIndex}"]`)
            ?.scrollIntoView({ block: "nearest" });
    }, [open, activeIndex]);

    const choose = (option) => {
        onChange(option.value);
        setOpen(false);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Escape") {
            if (open) {
                event.stopPropagation();
                setOpen(false);
            }
            return;
        }

        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();

            if (!open) {
                openMenu();
                return;
            }

            const step = event.key === "ArrowDown" ? 1 : -1;
            setActiveIndex(
                (previous) =>
                    (previous + step + options.length) % options.length
            );
            return;
        }

        if (event.key === "Home" && open) {
            event.preventDefault();
            setActiveIndex(0);
            return;
        }

        if (event.key === "End" && open) {
            event.preventDefault();
            setActiveIndex(options.length - 1);
            return;
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();

            if (!open) {
                openMenu();
            } else if (options[activeIndex]) {
                choose(options[activeIndex]);
            }
            return;
        }

        if (event.key === "Tab") {
            setOpen(false);
        }
    };

    return (
        <div ref={rootRef} className={`relative min-w-0 ${className}`}>
            <button
                ref={buttonRef}
                id={id}
                type="button"
                role="combobox"
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open && id ? `${id}-listbox` : undefined}
                disabled={disabled}
                onClick={() => (open ? setOpen(false) : openMenu())}
                onKeyDown={handleKeyDown}
                className={`${buttonClassName} flex items-center justify-between gap-2 text-left`}
            >
                <span
                    className={`truncate ${selected ? "" : "text-[var(--text-subtle)]"
                        }`}
                >
                    {selected?.label || placeholder}
                </span>

                <ChevronDown
                    size={15}
                    aria-hidden="true"
                    className={`shrink-0 text-[var(--text-muted)] transition-transform duration-150 ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {open &&
                position &&
                position.maxHeight > 0 &&
                createPortal(
                    <ul
                        ref={menuRef}
                        id={id ? `${id}-listbox` : undefined}
                        role="listbox"
                        className={`tasks-dropdown-options ${showScrollbar
                                ? "tasks-dropdown-options--visible"
                                : "tasks-dropdown-options--hidden"
                            } fixed overflow-y-auto overscroll-contain rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1`}
                        style={{
                            position: "fixed",
                            top: position.top,
                            left: position.left,
                            width: position.width,
                            maxHeight: position.maxHeight,
                            zIndex: 2147483647,
                            boxShadow: "none",
                            WebkitOverflowScrolling: "touch",
                            touchAction: "pan-y",
                        }}
                    >
                        {options.map((option, index) => {
                            const isSelected =
                                String(option.value) === String(value);
                            const isActive = index === activeIndex;

                            return (
                                <li
                                    key={`${option.value}-${index}`}
                                    data-index={index}
                                    role="option"
                                    aria-selected={isSelected}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onClick={() => choose(option)}
                                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-100 ${isSelected
                                            ? "bg-[var(--primary-soft)] font-semibold text-[var(--primary)]"
                                            : isActive
                                                ? "bg-[var(--surface-muted)] font-medium text-[var(--text)]"
                                                : "font-medium text-[var(--text)]"
                                        }`}
                                >
                                    <span className="truncate">
                                        {option.label}
                                    </span>

                                    {isSelected && (
                                        <Check
                                            size={15}
                                            aria-hidden="true"
                                            className="shrink-0"
                                        />
                                    )}
                                </li>
                            );
                        })}
                    </ul>,
                    document.body
                )}
        </div>
    );
}

/* ---------------------------------------------------------------
   Tasks
---------------------------------------------------------------- */

export default function Tasks() {
    const {
        currentWorkspace,
        currentWorkspaceId: workspaceId,
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

    const rootRef = useRef(null);
    const requestRef = useRef(0);

    /* One quiet fade on page load */
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
    }, []);

    /* Load tasks and discard stale workspace responses */
    const loadTasks = useCallback(
        async (mode = "initial") => {
            const requestId = ++requestRef.current;

            if (!workspaceId) {
                setTasks([]);
                setLoadingTasks(false);
                setRefreshing(false);
                return;
            }

            if (mode === "initial") {
                setTasks([]);
                setLoadingTasks(true);
            } else {
                setRefreshing(true);
            }

            setError("");

            try {
                const response = await getTasks({ workspaceId });
                if (requestId !== requestRef.current) return;
                setTasks(getList(response, "tasks"));
            } catch (err) {
                if (requestId !== requestRef.current) return;
                if (mode === "initial") setTasks([]);

                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load tasks."
                );
            } finally {
                if (requestId === requestRef.current) {
                    setLoadingTasks(false);
                    setRefreshing(false);
                }
            }
        },
        [workspaceId]
    );

    /* Reset filters when workspace changes */
    useEffect(() => {
        setSearch("");
        setStatusFilter("All");
        setAssigneeFilter("All");
        setCreateOpen(false);
        setCreateError("");
        setCreateMessage("");

        loadTasks("initial");

        return () => {
            requestRef.current += 1;
        };
    }, [loadTasks]);

    /* Escape closes dialog */
    useEffect(() => {
        if (!createOpen) return;

        const onKey = (event) => {
            if (event.key === "Escape" && !creatingTask) {
                setCreateOpen(false);
            }
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [createOpen, creatingTask]);

    /* Auto-dismiss success message */
    useEffect(() => {
        if (!createMessage) return;

        const timer = setTimeout(() => setCreateMessage(""), 4000);
        return () => clearTimeout(timer);
    }, [createMessage]);

    /* Workspace members */
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

    /* Assignee filter options */
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

    /* Dropdown options */
    const assigneeFilterOptions = useMemo(
        () => [
            { value: "All", label: "All assignees" },
            { value: "Unassigned", label: "Unassigned" },
            ...assignees.map((person) => ({
                value: person.id,
                label: person.name,
            })),
        ],
        [assignees]
    );

    const projectOptions = useMemo(
        () =>
            projects.map((project) => ({
                value: getId(project),
                label: getProjectName(project),
            })),
        [projects]
    );

    const memberOptions = useMemo(
        () => [
            { value: "", label: "Unassigned" },
            ...workspaceMembers.map((member) => ({
                value: member._id,
                label: member.name,
            })),
        ],
        [workspaceMembers]
    );

    /* Task filtering */
    const filteredTasks = useMemo(() => {
        const query = search.trim().toLowerCase();

        return tasks.filter((task) => {
            const matchesSearch =
                (task.title || "").toLowerCase().includes(query) ||
                (task.description || "").toLowerCase().includes(query) ||
                getProjectName(task.project).toLowerCase().includes(query) ||
                getPersonName(task.assignedTo).toLowerCase().includes(query) ||
                getPersonName(task.createdBy).toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "All" || task.status === statusFilter;
            const assigneeId = getId(task.assignedTo);
            const matchesAssignee =
                assigneeFilter === "All" ||
                (assigneeFilter === "Unassigned"
                    ? !assigneeId
                    : assigneeId === assigneeFilter);

            return matchesSearch && matchesStatus && matchesAssignee;
        });
    }, [tasks, search, statusFilter, assigneeFilter]);

    /* Task statistics */
    const stats = useMemo(() => {
        const overdue = tasks.filter(isOverdue).length;

        return [
            { label: "Total tasks", value: tasks.length },
            {
                label: "Completed",
                value: tasks.filter((task) => task.status === "completed").length,
            },
            {
                label: "In progress",
                value: tasks.filter((task) => task.status === "inProgress").length,
            },
            { label: "Overdue", value: overdue, alert: overdue > 0 },
        ];
    }, [tasks]);

    const updateTaskForm = (event) => {
        const { name, value } = event.target;
        setTaskForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const setFormValue = (name) => (value) =>
        setTaskForm((current) => ({
            ...current,
            [name]: value,
        }));

    /* Load projects for create-task dialog */
    const loadProjects = async () => {
        if (!workspaceId) {
            setCreateError("No active workspace found. Please try again.");
            return;
        }

        setLoadingProjects(true);
        setCreateError("");
        setProjects([]);

        try {
            const response = await getProjects({ workspaceId });

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

    /* Create task */
    const handleCreateTask = async (event) => {
        event.preventDefault();

        setCreateError("");
        setCreateMessage("");

        if (!isOwner) {
            setCreateError("Only the workspace owner can create tasks.");
            return;
        }

        if (!workspaceId || !taskForm.project) {
            setCreateError("Please select a project.");
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

            await createTask({
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
            });

            setCreateOpen(false);
            setTaskForm(initialTaskForm);
            setCreateMessage("Task created.");
            await loadTasks("refresh");
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

    const columnCount = canViewAllTasks ? 8 : 7;

    return (
        <div
            ref={rootRef}
            className="mx-auto w-full max-w-7xl space-y-6 px-4 py-5 text-[var(--text)] sm:space-y-7 sm:px-6 sm:py-6 lg:px-8 lg:py-8"
        >
            {/* Page heading and primary actions */}
            <header className="flex flex-col gap-5 border-b border-[var(--border)] pb-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="min-w-0">
                    <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-subtle)] sm:text-[11px]">
                        <span className="size-1.5 rounded-full bg-[var(--primary)]" />
                        Task management
                    </p>

                    <h1 className="text-2xl min-[400px]:text-3xl font-bold tracking-tight sm:text-4xl">
                        {canViewAllTasks ? "Workspace tasks" : "My tasks"}
                    </h1>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
                        {canViewAllTasks
                            ? "Manage, organize and track every task in this workspace."
                            : "Keep track of the work assigned to you in this workspace."}
                    </p>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">
                    <button
                        type="button"
                        onClick={() => loadTasks("refresh")}
                        disabled={!workspaceId || refreshing || loadingTasks}
                        className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text)] transition-colors duration-150 hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                    >
                        <RefreshCw
                            size={15}
                            className={refreshing ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>

                    {isOwner && (
                        <button
                            type="button"
                            onClick={handleOpenCreate}
                            disabled={!workspaceId}
                            className={`btn-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                        >
                            <Plus size={16} />
                            Create task
                        </button>
                    )}
                </div>
            </header>

            {/* Messages */}
            {createMessage && (
                <p
                    role="status"
                    className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 text-sm font-medium text-[var(--success)] sm:px-5"
                >
                    {createMessage}
                </p>
            )}

            {error && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-[var(--danger)]/15 bg-[var(--danger-soft)] px-4 py-3.5 text-sm leading-5 text-[var(--danger)] sm:px-5"
                >
                    <AlertCircle size={17} className="mt-0.5 shrink-0" />
                    <span className="flex-1">{error}</span>
                    <button
                        type="button"
                        onClick={() => loadTasks("initial")}
                        className="shrink-0 font-semibold hover:underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Statistics */}
            <section
                aria-label="Task statistics"
                className="grid grid-cols-2 gap-3 xl:grid-cols-4"
            >
                {stats.map((stat) => (
                    <article
                        key={stat.label}
                        className={`${panel} flex min-h-[112px] flex-col justify-between p-4 sm:p-5`}
                    >
                        <p className="text-xs font-medium text-[var(--text-muted)] sm:text-sm">
                            {stat.label}
                        </p>
                        <p
                            className={`mt-3 text-3xl font-bold tabular-nums tracking-tight ${stat.alert
                                    ? "text-[var(--danger)]"
                                    : "text-[var(--text)]"
                                }`}
                        >
                            {loadingTasks ? "—" : stat.value}
                        </p>
                    </article>
                ))}
            </section>

            {/* Table with filters */}
            <section className={`${panel} min-w-0 overflow-hidden`}>
                <div className="space-y-4 border-b border-[var(--border)] p-4 sm:p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-sm font-semibold sm:text-base">
                                {canViewAllTasks ? "All tasks" : "Assigned to me"}
                            </h2>
                            <p className="mt-1 text-xs text-[var(--text-muted)] sm:text-sm">
                                {loadingTasks
                                    ? "Loading tasks..."
                                    : `${filteredTasks.length} ${filteredTasks.length === 1
                                        ? "task"
                                        : "tasks"
                                    } found`}
                            </p>
                        </div>

                        {(search ||
                            statusFilter !== "All" ||
                            assigneeFilter !== "All") && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        setStatusFilter("All");
                                        setAssigneeFilter("All");
                                    }}
                                    className="self-start text-xs font-semibold text-[var(--primary)] hover:underline sm:self-auto"
                                >
                                    Clear filters
                                </button>
                            )}
                    </div>

                    <div
                        className={`grid grid-cols-1 gap-2.5 ${canViewAllTasks
                                ? "lg:grid-cols-[minmax(240px,1fr)_190px_210px]"
                                : "sm:grid-cols-[minmax(240px,1fr)_190px]"
                            }`}
                    >
                        <div className="relative min-w-0 flex-1">
                            <Search
                                size={16}
                                aria-hidden="true"
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]"
                            />
                            <input
                                type="search"
                                aria-label="Search tasks"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by title, project or person"
                                className={`${field} pl-10`}
                            />
                        </div>

                        {/* Status dropdown: scrollbar remains hidden */}
                        <Dropdown
                            ariaLabel="Filter tasks by status"
                            value={statusFilter}
                            options={STATUS_FILTER_OPTIONS}
                            onChange={setStatusFilter}
                        />

                        {/* Assignee dropdown: styled visible scrollbar */}
                        {canViewAllTasks && (
                            <Dropdown
                                ariaLabel="Filter tasks by assignee"
                                value={assigneeFilter}
                                options={assigneeFilterOptions}
                                onChange={setAssigneeFilter}
                                showScrollbar
                            />
                        )}
                    </div>
                </div>

                {/* Task table */}
                <div className="max-w-full overflow-x-auto">
                    <table className="w-full min-w-[1000px] table-auto text-left text-sm">
                        <thead className="bg-[var(--surface-muted)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                            <tr>
                                <th className="whitespace-nowrap px-4 py-3.5 font-semibold">
                                    Task
                                </th>
                                <th className="whitespace-nowrap px-4 py-3.5 font-semibold">
                                    Project
                                </th>
                                <th className="whitespace-nowrap px-4 py-3.5 font-semibold">
                                    Assigned to
                                </th>
                                {canViewAllTasks && (
                                    <th className="whitespace-nowrap px-4 py-3.5 font-semibold">
                                        Created by
                                    </th>
                                )}
                                <th className="whitespace-nowrap px-4 py-3.5 font-semibold">
                                    Priority
                                </th>
                                <th className="whitespace-nowrap px-4 py-3.5 font-semibold">
                                    Due date
                                </th>
                                <th className="whitespace-nowrap px-4 py-3.5 font-semibold">
                                    Status
                                </th>
                                <th className="whitespace-nowrap px-4 py-3.5 font-semibold">
                                    Labels
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loadingTasks ? (
                                <tr>
                                    <td
                                        colSpan={columnCount}
                                        className="px-4 py-16 text-center"
                                    >
                                        <Loader2
                                            size={20}
                                            className="mx-auto animate-spin text-[var(--primary)]"
                                        />
                                        <p className="mt-3 text-sm text-[var(--text-muted)]">
                                            Loading tasks...
                                        </p>
                                    </td>
                                </tr>
                            ) : filteredTasks.length ? (
                                filteredTasks.map((task) => {
                                    const status =
                                        STATUS_BY_KEY[task.status] ||
                                        STATUS_BY_KEY.todo;
                                    const priority = task.priority || "medium";
                                    const overdue = isOverdue(task);
                                    const taskId = getId(task);
                                    const labels = Array.isArray(task.labels)
                                        ? task.labels
                                        : [];
                                    const attachments = Array.isArray(
                                        task.attachments
                                    )
                                        ? task.attachments
                                        : [];

                                    return (
                                        <tr
                                            key={taskId || task.title}
                                            className="border-t border-[var(--border)] align-middle transition-colors duration-150 hover:bg-[var(--surface-muted)]"
                                        >
                                            <td className="max-w-[280px] px-4 py-4">
                                                {taskId ? (
                                                    <Link
                                                        to={`/dashboard/tasks/${encodeURIComponent(
                                                            taskId
                                                        )}`}
                                                        className="font-semibold hover:underline"
                                                        style={taskLinkStyle}
                                                    >
                                                        {task.title || "Untitled task"}
                                                    </Link>
                                                ) : (
                                                    <span className="font-semibold">
                                                        {task.title || "Untitled task"}
                                                    </span>
                                                )}
                                                {task.description && (
                                                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--text-muted)]">
                                                        {task.description}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="max-w-[180px] px-4 py-4 text-[var(--text-muted)]">
                                                {getProjectName(task.project)}
                                            </td>

                                            <td
                                                className={`max-w-[180px] px-4 py-4 ${task.assignedTo
                                                        ? ""
                                                        : "text-[var(--text-subtle)]"
                                                    }`}
                                            >
                                                {getPersonName(task.assignedTo)}
                                            </td>

                                            {canViewAllTasks && (
                                                <td className="max-w-[180px] px-4 py-4 text-[var(--text-muted)]">
                                                    {getPersonName(task.createdBy)}
                                                </td>
                                            )}

                                            <td
                                                className={`whitespace-nowrap px-4 py-4 ${priority === "high"
                                                        ? "font-semibold text-[var(--danger)]"
                                                        : "text-[var(--text-muted)]"
                                                    }`}
                                            >
                                                {formatPriority(priority)}
                                            </td>

                                            <td
                                                className={`whitespace-nowrap px-4 py-4 ${overdue
                                                        ? "font-semibold text-[var(--danger)]"
                                                        : "text-[var(--text-muted)]"
                                                    }`}
                                            >
                                                {formatDate(task.dueDate)}
                                                {overdue && (
                                                    <span className="mt-0.5 block text-xs font-medium">
                                                        Overdue
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-4">
                                                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                                                    <span
                                                        aria-hidden="true"
                                                        className="h-2 w-2 rounded-full"
                                                        style={{
                                                            background: status.color,
                                                        }}
                                                    />
                                                    {status.label}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                {labels.length === 0 &&
                                                    attachments.length === 0 ? (
                                                    <span className="text-[var(--text-subtle)]">
                                                        —
                                                    </span>
                                                ) : (
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        {labels
                                                            .slice(0, 2)
                                                            .map((label, index) => (
                                                                <span
                                                                    key={
                                                                        getId(label) ||
                                                                        index
                                                                    }
                                                                    className="rounded-md bg-[var(--surface-muted)] px-2 py-1 text-xs text-[var(--text-muted)]"
                                                                >
                                                                    {typeof label ===
                                                                        "object"
                                                                        ? label.name ||
                                                                        label.title ||
                                                                        "Label"
                                                                        : "Label"}
                                                                </span>
                                                            ))}

                                                        {labels.length > 2 && (
                                                            <span className="text-xs text-[var(--text-muted)]">
                                                                +{labels.length - 2}
                                                            </span>
                                                        )}

                                                        {attachments.length > 0 && (
                                                            <span
                                                                className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]"
                                                                title={`${attachments.length} attachment${attachments.length ===
                                                                        1
                                                                        ? ""
                                                                        : "s"
                                                                    }`}
                                                            >
                                                                <Paperclip
                                                                    size={12}
                                                                    aria-hidden="true"
                                                                />
                                                                {attachments.length}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={columnCount}
                                        className="px-4 py-16 text-center"
                                    >
                                        <p className="text-sm font-semibold text-[var(--text)]">
                                            {tasks.length === 0
                                                ? canViewAllTasks
                                                    ? "No tasks in this workspace yet"
                                                    : "No tasks are assigned to you"
                                                : "No tasks match your filters"}
                                        </p>
                                        <p className="mx-auto mt-1 max-w-sm text-sm leading-5 text-[var(--text-muted)]">
                                            {tasks.length > 0
                                                ? "Try a different search or clear a filter."
                                                : canViewAllTasks
                                                    ? "Create a task to get started."
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
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/45 px-4 py-5 backdrop-blur-[2px] sm:py-8"
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
                        className="my-auto max-h-[calc(100dvh-2.5rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--text)] sm:p-7"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2
                                    id="create-task-title"
                                    className="text-2xl font-bold tracking-tight"
                                >
                                    Create task
                                </h2>
                                <p className="mt-1.5 text-sm text-[var(--text-muted)]">
                                    Add a task to{" "}
                                    {currentWorkspace?.name || "this workspace"}.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setCreateOpen(false)}
                                disabled={creatingTask}
                                aria-label="Close dialog"
                                className="-mr-1 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl text-[var(--text-muted)] transition-colors duration-150 hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {createError && (
                            <p
                                role="alert"
                                className="mt-5 rounded-xl border border-[var(--danger)]/15 bg-[var(--danger-soft)] px-4 py-3 text-sm leading-5 text-[var(--danger)]"
                            >
                                {createError}
                            </p>
                        )}

                        <form
                            onSubmit={handleCreateTask}
                            className="mt-6 space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="task-title"
                                    className="block text-sm font-semibold text-[var(--text)]"
                                >
                                    Title
                                </label>
                                <input
                                    id="task-title"
                                    name="title"
                                    value={taskForm.title}
                                    onChange={updateTaskForm}
                                    maxLength={200}
                                    required
                                    autoFocus
                                    placeholder="Implement user authentication"
                                    className={dialogField}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="task-description"
                                    className="block text-sm font-semibold text-[var(--text)]"
                                >
                                    Description
                                </label>
                                <textarea
                                    id="task-description"
                                    name="description"
                                    value={taskForm.description}
                                    onChange={updateTaskForm}
                                    rows={3}
                                    maxLength={3000}
                                    placeholder="What needs to be done?"
                                    className={`${fieldBase} mt-1.5 resize-y py-3`}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="task-project"
                                    className="block text-sm font-semibold text-[var(--text)]"
                                >
                                    Project
                                </label>
                                <Dropdown
                                    id="task-project"
                                    className="mt-1.5"
                                    value={taskForm.project}
                                    options={projectOptions}
                                    onChange={setFormValue("project")}
                                    disabled={
                                        loadingProjects || projects.length === 0
                                    }
                                    placeholder={
                                        loadingProjects
                                            ? "Loading projects..."
                                            : "Select a project"
                                    }
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="task-assignee"
                                    className="block text-sm font-semibold text-[var(--text)]"
                                >
                                    Assign to
                                </label>
                                {/* Member selection: styled visible scrollbar */}
                                <Dropdown
                                    id="task-assignee"
                                    className="mt-1.5"
                                    value={taskForm.assignedTo}
                                    options={memberOptions}
                                    onChange={setFormValue("assignedTo")}
                                    showScrollbar
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="task-priority"
                                        className="block text-sm font-semibold text-[var(--text)]"
                                    >
                                        Priority
                                    </label>
                                    <Dropdown
                                        id="task-priority"
                                        className="mt-1.5"
                                        value={taskForm.priority}
                                        options={PRIORITY_OPTIONS}
                                        onChange={setFormValue("priority")}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="task-due-date"
                                        className="block text-sm font-semibold text-[var(--text)]"
                                    >
                                        Due date
                                    </label>
                                    <input
                                        id="task-due-date"
                                        name="dueDate"
                                        type="date"
                                        value={taskForm.dueDate}
                                        onChange={updateTaskForm}
                                        className={dialogField}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-2.5 border-t border-[var(--border)] pt-4 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setCreateOpen(false)}
                                    disabled={creatingTask}
                                    className={`inline-flex h-11 items-center justify-center rounded-xl border border-[var(--border)] px-5 text-sm font-semibold text-[var(--text)] transition-colors duration-150 hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
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
                                    className={`btn-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                                >
                                    {creatingTask ? (
                                        <>
                                            <Loader2
                                                size={16}
                                                className="animate-spin"
                                            />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create task"
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
}
