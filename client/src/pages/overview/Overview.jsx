import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RefreshCw,
  ClipboardList,
  FolderKanban,
  CheckCircle2,
  Clock3,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";

import { useWorkspace } from "../../context/WorkspaceContext.jsx";
import { getProjects } from "../../services/project.service.js";
import { getTasks } from "../../services/task.service.js";

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

const priorityColors = {
  high: "#dc2626",
  medium: "#d97706",
  low: "var(--text-muted)",
};

const getId = (value) => {
  if (!value) return "";

  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }

  return String(value);
};

// Handles the API response envelope returned by your service functions.
function getList(response, key) {
  let result = response;

  for (let depth = 0; depth < 5; depth += 1) {
    if (Array.isArray(result)) {
      return result;
    }

    if (!result || typeof result !== "object") {
      return [];
    }

    if (key && Array.isArray(result[key])) {
      return result[key];
    }

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

  if (Number.isNaN(date.getTime())) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const isOverdue = (task) => {
  if (!task.dueDate || task.status === "completed") {
    return false;
  }

  const dueDate = new Date(task.dueDate);

  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
};

export default function Overview() {
  const {
    workspaces,
    currentWorkspace,
    currentWorkspaceId,
    setCurrentWorkspace,
    loading: loadingWorkspaces,
  } = useWorkspace();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadOverviewData = useCallback(
    async (isRefresh = false) => {
      if (!currentWorkspaceId) {
        setProjects([]);
        setTasks([]);
        setLoadingData(false);
        setRefreshing(false);
        setError("");
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoadingData(true);
      }

      setError("");

      try {
        const [projectResponse, taskResponse] = await Promise.all([
          getProjects({
            workspaceId: currentWorkspaceId,
          }),
          getTasks({
            workspaceId: currentWorkspaceId,
          }),
        ]);

        setProjects(getList(projectResponse, "projects"));
        setTasks(getList(taskResponse, "tasks"));
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load workspace overview.",
        );

        setProjects([]);
        setTasks([]);
      } finally {
        setLoadingData(false);
        setRefreshing(false);
      }
    },
    [currentWorkspaceId],
  );

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      if (!currentWorkspaceId) {
        setProjects([]);
        setTasks([]);
        setLoadingData(false);
        setRefreshing(false);
        setError("");
        return;
      }

      setProjects([]);
      setTasks([]);
      setLoadingData(true);
      setError("");

      try {
        const [projectResponse, taskResponse] = await Promise.all([
          getProjects({
            workspaceId: currentWorkspaceId,
          }),
          getTasks({
            workspaceId: currentWorkspaceId,
          }),
        ]);

        if (!active) return;

        setProjects(getList(projectResponse, "projects"));
        setTasks(getList(taskResponse, "tasks"));
      } catch (err) {
        if (!active) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load workspace overview.",
        );

        setProjects([]);
        setTasks([]);
      } finally {
        if (active) {
          setLoadingData(false);
        }
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [currentWorkspaceId]);

  const completed = tasks.filter((task) => task.status === "completed").length;

  const inProgress = tasks.filter(
    (task) => task.status === "inProgress",
  ).length;

  const overdue = tasks.filter(isOverdue).length;

  const stats = [
    {
      label: "Total Tasks",
      value: tasks.length,
      detail: "Tasks in this workspace",
      icon: ClipboardList,
    },
    {
      label: "Completed",
      value: completed,
      detail: "Tasks finished",
      icon: CheckCircle2,
    },
    {
      label: "In Progress",
      value: inProgress,
      detail: "Currently active",
      icon: Clock3,
    },
    {
      label: "Overdue",
      value: overdue,
      detail: "Past their due date",
      icon: AlertCircle,
    },
  ];

  const recentTasks = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0).getTime() -
        new Date(a.updatedAt || a.createdAt || 0).getTime(),
    )
    .slice(0, 6);

  return (
    <div
      className="mx-auto max-w-7xl space-y-6"
      style={{ color: "var(--text)" }}
    >
      {/* Page heading */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Here's what's happening with your work.
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Overview
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Select workspace"
            value={currentWorkspaceId || ""}
            onChange={(event) => setCurrentWorkspace(event.target.value)}
            disabled={loadingWorkspaces || workspaces.length === 0}
            className="rounded-lg border px-3 py-2 text-sm outline-none"
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
                <option key={getId(workspace)} value={getId(workspace)}>
                  {workspace.name}
                </option>
              ))
            )}
          </select>

          <button
            type="button"
            onClick={() => loadOverviewData(true)}
            disabled={!currentWorkspaceId || refreshing || loadingData}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-50"
            style={{
              background: "var(--surface)",
              color: "var(--text)",
              borderColor: "var(--border)",
            }}
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </section>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: "#dc7777",
            color: "#c24141",
            background: "var(--surface)",
          }}
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Current workspace */}
      <section
        className="rounded-xl border p-4 sm:p-5"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex size-11 items-center justify-center rounded-lg"
            style={{
              color: "var(--primary)",
              background: "var(--primary-soft, #e1f2ef)",
            }}
          >
            <FolderKanban size={21} />
          </div>

          <div className="min-w-0">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Current workspace
            </p>

            <h2 className="break-words font-semibold">
              {currentWorkspace?.name || "No workspace selected"}
            </h2>
          </div>
        </div>

        {currentWorkspace?.description && (
          <p
            className="mt-3 text-sm leading-6"
            style={{ color: "var(--text-muted)" }}
          >
            {currentWorkspace.description}
          </p>
        )}
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="rounded-xl border p-5"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {stat.label}
                </p>

                <Icon size={19} style={{ color: "var(--primary)" }} />
              </div>

              <p className="mt-3 text-3xl font-semibold tabular-nums">
                {loadingData ? "—" : stat.value}
              </p>

              <p
                className="mt-2 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {stat.detail}
              </p>
            </article>
          );
        })}
      </section>

      {/* Recent tasks */}
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
            <h2 className="font-semibold">Recent Tasks</h2>

            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Recent activity in the selected workspace.
            </p>
          </div>

          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            {loadingData ? "Loading..." : `${tasks.length} tasks`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
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
              {loadingData ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <RefreshCw
                      size={20}
                      className="mx-auto animate-spin"
                      style={{
                        color: "var(--primary)",
                      }}
                    />

                    <p
                      className="mt-3 text-sm"
                      style={{
                        color: "var(--text-muted)",
                      }}
                    >
                      Loading workspace data...
                    </p>
                  </td>
                </tr>
              ) : recentTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <ClipboardList
                      size={27}
                      className="mx-auto"
                      style={{
                        color: "var(--text-muted)",
                      }}
                    />

                    <p className="mt-3 text-sm font-medium">
                      {currentWorkspace ? "No tasks yet" : "Select a workspace"}
                    </p>

                    <p
                      className="mt-1 text-sm"
                      style={{
                        color: "var(--text-muted)",
                      }}
                    >
                      {currentWorkspace
                        ? "Tasks in this workspace will appear here."
                        : "Choose a workspace to view its tasks."}
                    </p>
                  </td>
                </tr>
              ) : (
                recentTasks.map((task) => {
                  const status = task.status || "todo";
                  const priority = task.priority || "medium";
                  const taskId = getId(task);

                  return (
                    <tr
                      key={taskId}
                      className="border-t transition-colors hover:bg-[var(--surface-muted)]"
                      style={{
                        borderColor: "var(--border)",
                      }}
                    >
                      <td className="max-w-xs px-5 py-4">
                        {taskId ? (
                          <Link
                            to={`/dashboard/tasks/${encodeURIComponent(taskId)}`}
                            className="inline-flex max-w-full items-center gap-1 font-medium hover:underline"
                            style={{
                              color: "var(--text)",
                            }}
                          >
                            <span className="truncate">
                              {task.title || "Untitled task"}
                            </span>

                            <ArrowUpRight size={14} className="shrink-0" />
                          </Link>
                        ) : (
                          <span className="font-medium">
                            {task.title || "Untitled task"}
                          </span>
                        )}
                      </td>

                      <td
                        className="px-5 py-4"
                        style={{
                          color: "var(--text-muted)",
                        }}
                      >
                        {task.project?.name || task.project?.title || "—"}
                      </td>

                      <td
                        className="px-5 py-4 font-medium capitalize"
                        style={{
                          color:
                            priorityColors[priority] || priorityColors.medium,
                        }}
                      >
                        {priority}
                      </td>

                      <td
                        className="whitespace-nowrap px-5 py-4"
                        style={{
                          color: isOverdue(task)
                            ? "#dc2626"
                            : "var(--text-muted)",
                        }}
                      >
                        {formatDate(task.dueDate)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className="inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium"
                          style={statusStyles[status] || statusStyles.todo}
                        >
                          {statusLabels[status] || status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Project summary */}
      <section
        className="rounded-xl border p-5"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-3">
          <FolderKanban size={20} style={{ color: "var(--primary)" }} />
          <h2 className="font-semibold">Projects in this workspace</h2>
        </div>

        <p className="mt-3 text-2xl font-semibold tabular-nums">
          {loadingData ? "—" : projects.length}
        </p>

        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          {projects.length === 1 ? "Project" : "Projects"} available in{" "}
          {currentWorkspace?.name || "the selected workspace"}.
        </p>
      </section>
    </div>
  );
}
