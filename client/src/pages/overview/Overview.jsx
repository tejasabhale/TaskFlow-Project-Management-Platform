
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListTodo,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { useWorkspace } from "../../context/WorkspaceContext.jsx";
import { getProjects } from "../../services/project.service.js";
import { getTasks } from "../../services/task.service.js";

const DISPLAY_FONT_ID = "login-display-font";
const DISPLAY_FONT_URL =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&display=swap";

const displayFont = {
  fontFamily:
    '"Bricolage Grotesque", "Manrope", ui-sans-serif, system-ui, sans-serif',
};

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

const getId = (value) => {
  if (!value) return "";

  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }

  return String(value);
};

function getList(response, key) {
  let result = response;

  for (let depth = 0; depth < 5; depth += 1) {
    if (Array.isArray(result)) return result;
    if (!result || typeof result !== "object") return [];
    if (key && Array.isArray(result[key])) return result[key];

    if (result.data !== undefined) {
      result = result.data;
      continue;
    }

    return [];
  }

  return [];
}

const formatDate = (value) => {
  if (!value) return "No due date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "No due date";

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const isOverdue = (task) => {
  if (!task.dueDate || task.status === "completed") return false;

  const dueDate = new Date(task.dueDate);

  if (Number.isNaN(dueDate.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
};

const panelClass =
  "rounded-2xl border border-[var(--border)] bg-[var(--surface)]";

/* ---------------------------------------------------------------
   Overview Dashboard
---------------------------------------------------------------- */

export default function Overview() {
  const {
    currentWorkspace,
    currentWorkspaceId,
  } = useWorkspace();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const rootRef = useRef(null);
  const requestRef = useRef(0);

  useEffect(() => {
    if (document.getElementById(DISPLAY_FONT_ID)) return;

    const link = document.createElement("link");
    link.id = DISPLAY_FONT_ID;
    link.rel = "stylesheet";
    link.href = DISPLAY_FONT_URL;

    document.head.appendChild(link);
  }, []);

  const loadData = useCallback(
    async (mode = "initial") => {
      const requestId = ++requestRef.current;

      if (!currentWorkspaceId) {
        setProjects([]);
        setTasks([]);
        setLoadingData(false);
        setRefreshing(false);
        setError("");
        return;
      }

      if (mode === "refresh") {
        setRefreshing(true);
      } else {
        setProjects([]);
        setTasks([]);
        setLoadingData(true);
      }

      setError("");

      try {
        const [projectResponse, taskResponse] = await Promise.all([
          getProjects({ workspaceId: currentWorkspaceId }),
          getTasks({ workspaceId: currentWorkspaceId }),
        ]);

        if (requestId !== requestRef.current) return;

        setProjects(getList(projectResponse, "projects"));
        setTasks(getList(taskResponse, "tasks"));
      } catch (err) {
        if (requestId !== requestRef.current) return;

        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load workspace overview."
        );

        setProjects([]);
        setTasks([]);
      } finally {
        if (requestId === requestRef.current) {
          setLoadingData(false);
          setRefreshing(false);
        }
      }
    },
    [currentWorkspaceId]
  );

  useEffect(() => {
    loadData("initial");

    return () => {
      requestRef.current += 1;
    };
  }, [loadData]);

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
        y: 8,
        duration: 0.45,
        ease: "power3.out",
        clearProps: "transform,opacity",
      });
    }, root);

    return () => ctx.revert();
  }, []);

  /* Derived dashboard data */
  const total = tasks.length;

  const countByStatus = STATUSES.reduce((acc, status) => {
    acc[status.key] = tasks.filter(
      (task) => (task.status || "todo") === status.key
    ).length;

    return acc;
  }, {});

  const overdue = tasks.filter(isOverdue).length;

  const completedPercent = total
    ? Math.round((countByStatus.completed / total) * 100)
    : 0;

  const stats = [
    {
      label: "Total tasks",
      value: total,
      helper: "Across this workspace",
      icon: ListTodo,
      tone: "neutral",
    },
    {
      label: "Completed",
      value: countByStatus.completed,
      helper: `${completedPercent}% of all tasks`,
      icon: CheckCircle2,
      tone: "success",
    },
    {
      label: "In progress",
      value: countByStatus.inProgress,
      helper: "Currently being worked on",
      icon: Clock3,
      tone: "primary",
    },
    {
      label: "Overdue",
      value: overdue,
      helper: overdue > 0 ? "Needs your attention" : "Nothing past due",
      icon: AlertCircle,
      tone: overdue > 0 ? "danger" : "neutral",
    },
  ];

  const recentTasks = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0).getTime() -
        new Date(a.updatedAt || a.createdAt || 0).getTime()
    )
    .slice(0, 6);

  const projectRows = projects
    .map((project) => {
      const id = getId(project);

      const projectTasks = tasks.filter(
        (task) => getId(task.project) === id
      );

      const done = projectTasks.filter(
        (task) => task.status === "completed"
      ).length;

      return {
        id,
        name: project.name || project.title || "Untitled project",
        total: projectTasks.length,
        done,
        percent: projectTasks.length
          ? Math.round((done / projectTasks.length) * 100)
          : 0,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const renderTaskStatus = (task) => {
    const status = STATUS_BY_KEY[task.status] || STATUS_BY_KEY.todo;

    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
        style={{
          background: "var(--surface-muted)",
          color: status.color,
        }}
      >
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full"
          style={{ background: status.color }}
        />
        {status.label}
      </span>
    );
  };

  const renderPriority = (priority = "medium") => {
    const normalized = String(priority).toLowerCase();
    const isHigh = normalized === "high";
    const isUrgent = normalized === "urgent";

    return (
      <span
        className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize"
        style={{
          background:
            isHigh || isUrgent
              ? "var(--danger-soft)"
              : "var(--surface-muted)",
          color:
            isUrgent || isHigh
              ? "var(--danger)"
              : "var(--text-muted)",
        }}
      >
        {normalized}
      </span>
    );
  };

  return (
    <div
      ref={rootRef}
      className="mx-auto w-full max-w-7xl space-y-6 px-4 py-5 text-[var(--text)] sm:space-y-7 sm:px-6 sm:py-6 lg:px-8 lg:py-8"
    >
      {/* Header */}
      <header className="flex flex-col gap-5 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
            <span className="size-1.5 rounded-full bg-[var(--primary)]" />
            Workspace overview
          </p>

          <h1
            className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl"
            style={displayFont}
          >
            Overview
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
            {currentWorkspace?.name
              ? `A snapshot of tasks and project progress in ${currentWorkspace.name}.`
              : "Your tasks and project progress will appear here once a workspace is selected."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadData("refresh")}
          disabled={!currentWorkspaceId || refreshing || loadingData}
          aria-label="Refresh overview"
          title="Refresh overview"
          className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--text-muted)] transition-colors duration-150 hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          {refreshing ? "Refreshing" : "Refresh"}
        </button>
      </header>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-soft)] px-4 py-3.5 text-sm text-[var(--danger)] sm:flex-row sm:items-center"
        >
          <span className="flex min-w-0 flex-1 items-start gap-2.5 leading-5">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            {error}
          </span>

          <button
            type="button"
            onClick={() => loadData("initial")}
            className="self-start font-semibold underline-offset-4 hover:underline sm:self-auto"
          >
            Try again
          </button>
        </div>
      )}

      {/* Statistics */}
      <section aria-label="Task statistics">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            At a glance
          </h2>

          {currentWorkspace && (
            <span className="truncate text-xs text-[var(--text-subtle)]">
              {currentWorkspace.name}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            const toneClass =
              stat.tone === "success"
                ? "text-[var(--success)]"
                : stat.tone === "primary"
                  ? "text-[var(--primary)]"
                  : stat.tone === "danger"
                    ? "text-[var(--danger)]"
                    : "text-[var(--text-muted)]";

            return (
              <article
                key={stat.label}
                className={`${panelClass} min-w-0 p-4 sm:p-5`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-[var(--text-muted)] sm:text-sm">
                    {stat.label}
                  </p>

                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] ${toneClass}`}
                  >
                    <Icon size={16} strokeWidth={1.9} />
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
                  <p
                    className={`text-2xl font-bold tabular-nums tracking-tight sm:text-3xl ${stat.tone === "danger"
                        ? "text-[var(--danger)]"
                        : "text-[var(--text)]"
                      }`}
                    style={displayFont}
                  >
                    {loadingData ? "—" : stat.value}
                  </p>

                  <span className="pb-1 text-[10px] leading-4 text-[var(--text-subtle)] sm:text-[11px]">
                    {stat.helper}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Main content */}
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.85fr)]">
        {/* Recent tasks */}
        <section className={`${panelClass} min-w-0 overflow-hidden`}>
          <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-4 sm:px-5 sm:py-5">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[var(--text)] sm:text-base">
                Recent tasks
              </h2>

              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)] sm:text-sm">
                The latest activity in this workspace.
              </p>
            </div>

            <Link
              to="/dashboard/tasks"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold transition-colors hover:text-[var(--primary)] sm:text-sm"
              style={{ color: "var(--primary)" }}
            >
              View all
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {loadingData ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-5 py-12 text-center">
              <Loader2
                size={22}
                className="animate-spin text-[var(--primary)]"
              />

              <p className="mt-3 text-sm text-[var(--text-muted)]">
                Loading tasks...
              </p>
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-5 py-12 text-center">
              <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--text-muted)]">
                <ListTodo size={20} />
              </span>

              <p className="mt-3 text-sm font-semibold text-[var(--text)]">
                {currentWorkspace ? "No tasks yet" : "No workspace selected"}
              </p>

              <p className="mt-1 max-w-xs text-xs leading-5 text-[var(--text-muted)] sm:text-sm">
                {currentWorkspace
                  ? "Tasks created in this workspace will appear here."
                  : "Select a workspace to see its latest tasks."}
              </p>

              <Link
                to="/dashboard/tasks"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline sm:text-sm"
              >
                Open tasks
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop and tablet table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-[var(--surface-muted)] text-[11px] font-semibold uppercase tracking-wide text-[var(--text-subtle)]">
                    <tr>
                      <th className="px-5 py-3">Task</th>
                      <th className="px-4 py-3">Project</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Due date</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentTasks.map((task) => {
                      const taskId = getId(task);
                      const priority = task.priority || "medium";
                      const late = isOverdue(task);

                      return (
                        <tr
                          key={taskId || task.title}
                          className="border-t border-[var(--border)] transition-colors duration-150 hover:bg-[var(--surface-muted)]"
                        >
                          <td className="max-w-[220px] px-5 py-4">
                            {taskId ? (
                              <Link
                                to={`/dashboard/tasks/${encodeURIComponent(taskId)}`}
                                className="block truncate font-medium hover:underline"
                                style={taskLinkStyle}
                              >
                                {task.title || "Untitled task"}
                              </Link>
                            ) : (
                              <span className="block truncate font-medium">
                                {task.title || "Untitled task"}
                              </span>
                            )}
                          </td>

                          <td className="max-w-[150px] truncate px-4 py-4 text-[var(--text-muted)]">
                            {task.project?.name ||
                              task.project?.title ||
                              "—"}
                          </td>

                          <td className="px-4 py-4">
                            {renderPriority(priority)}
                          </td>

                          <td
                            className={`whitespace-nowrap px-4 py-4 text-xs ${late
                                ? "font-semibold text-[var(--danger)]"
                                : "text-[var(--text-muted)]"
                              }`}
                          >
                            {formatDate(task.dueDate)}

                            {late && (
                              <span className="sr-only"> (overdue)</span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {renderTaskStatus(task)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile task list */}
              <div className="divide-y divide-[var(--border)] md:hidden">
                {recentTasks.map((task) => {
                  const taskId = getId(task);
                  const late = isOverdue(task);

                  return (
                    <article
                      key={taskId || task.title}
                      className="space-y-3 px-4 py-4"
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          {taskId ? (
                            <Link
                              to={`/dashboard/tasks/${encodeURIComponent(taskId)}`}
                              className="line-clamp-2 text-sm font-semibold hover:underline"
                              style={taskLinkStyle}
                            >
                              {task.title || "Untitled task"}
                            </Link>
                          ) : (
                            <p className="line-clamp-2 text-sm font-semibold">
                              {task.title || "Untitled task"}
                            </p>
                          )}

                          <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                            {task.project?.name ||
                              task.project?.title ||
                              "No project"}
                          </p>
                        </div>

                        {renderPriority(task.priority || "medium")}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {renderTaskStatus(task)}

                        <span
                          className={`inline-flex items-center gap-1.5 text-xs ${late
                              ? "font-semibold text-[var(--danger)]"
                              : "text-[var(--text-muted)]"
                            }`}
                        >
                          <CalendarDays size={13} />
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* Right side */}
        <aside className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-1">
          {/* Task status */}
          <section className={`${panelClass} min-w-0 p-4 sm:p-5`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[var(--text)] sm:text-base">
                  Task status
                </h2>

                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Breakdown by workflow stage.
                </p>
              </div>

              <span className="rounded-lg bg-[var(--surface-muted)] px-2.5 py-1.5 text-xs font-semibold tabular-nums text-[var(--text-muted)]">
                {loadingData ? "—" : total}
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {STATUSES.map((status) => {
                const count = countByStatus[status.key] || 0;

                const percent = total
                  ? Math.round((count / total) * 100)
                  : 0;

                return (
                  <div key={status.key}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                      <span className="flex min-w-0 items-center gap-2 text-[var(--text-muted)]">
                        <span
                          aria-hidden="true"
                          className="size-2 shrink-0 rounded-full"
                          style={{ background: status.color }}
                        />

                        <span className="truncate">{status.label}</span>
                      </span>

                      <span className="shrink-0 font-semibold tabular-nums text-[var(--text)]">
                        {loadingData ? "—" : count}
                      </span>
                    </div>

                    <div
                      className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]"
                      role="progressbar"
                      aria-label={`${status.label} tasks`}
                      aria-valuemin={0}
                      aria-valuemax={total || 1}
                      aria-valuenow={loadingData ? 0 : count}
                    >
                      <div
                        className="h-full rounded-full transition-[width] duration-300"
                        style={{
                          width: loadingData ? "0%" : `${percent}%`,
                          background: status.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Projects */}
          <section className={`${panelClass} min-w-0 p-4 sm:p-5`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[var(--text)] sm:text-base">
                  Projects
                </h2>

                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Progress across your projects.
                </p>
              </div>

              <Link
                to="/dashboard/projects"
                aria-label="View all projects"
                title="View all projects"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--primary)]"
              >
                <ArrowUpRight size={17} />
              </Link>
            </div>

            {loadingData ? (
              <div className="flex items-center gap-2 py-8 text-xs text-[var(--text-muted)]">
                <Loader2 size={15} className="animate-spin" />
                Loading projects...
              </div>
            ) : projectRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--text-muted)]">
                  <FolderKanban size={18} />
                </span>

                <p className="mt-3 text-sm font-medium text-[var(--text)]">
                  No projects yet
                </p>

                <p className="mt-1 max-w-[220px] text-xs leading-5 text-[var(--text-muted)]">
                  {currentWorkspace
                    ? "Create a project to start organizing work."
                    : "Select a workspace to see its projects."}
                </p>

                <Link
                  to="/dashboard/projects"
                  className="mt-3 text-xs font-semibold text-[var(--primary)] hover:underline"
                >
                  Explore projects
                </Link>
              </div>
            ) : (
              <ul className="mt-5 space-y-4">
                {projectRows.map((project) => (
                  <li
                    key={project.id || project.name}
                    className="min-w-0"
                  >
                    <div className="flex items-center justify-between gap-3">
                      {project.id ? (
                        <Link
                          to={`/dashboard/projects/${encodeURIComponent(project.id)}`}
                          className="min-w-0 truncate text-xs font-semibold text-[var(--text)] hover:text-[var(--primary)] hover:underline"
                        >
                          {project.name}
                        </Link>
                      ) : (
                        <span className="min-w-0 truncate text-xs font-semibold text-[var(--text)]">
                          {project.name}
                        </span>
                      )}

                      <span className="shrink-0 text-[10px] tabular-nums text-[var(--text-muted)]">
                        {project.total
                          ? `${project.percent}%`
                          : "No tasks"}
                      </span>
                    </div>

                    <div
                      className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]"
                      role="progressbar"
                      aria-label={`${project.name} progress`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={project.percent}
                    >
                      <div
                        className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-300"
                        style={{ width: `${project.percent}%` }}
                      />
                    </div>

                    <p className="mt-1.5 text-[10px] text-[var(--text-subtle)]">
                      {project.done} of {project.total} tasks completed
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
