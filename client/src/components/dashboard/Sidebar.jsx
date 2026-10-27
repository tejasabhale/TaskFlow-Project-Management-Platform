
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  CheckSquare,
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  Users,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserRound,
  Plus,
  X,
  Menu,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import { useWorkspace } from "../../context/WorkspaceContext.jsx";
import { createWorkspace } from "../../services/workspace.service.js";

const navItems = [
  {
    name: "Overview",
    path: "/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    name: "Tasks",
    path: "/dashboard/tasks",
    icon: ListTodo,
  },
  {
    name: "Projects",
    path: "/dashboard/projects",
    icon: FolderKanban,
  },
  {
    name: "Members",
    path: "/dashboard/members",
    icon: Users,
  },
];

const getId = (value) => {
  if (!value) return "";

  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }

  return String(value);
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "W";

function getCreatedWorkspace(response) {
  let result = response?.data ?? response;

  if (result?.data) result = result.data;
  if (result?.workspace) result = result.workspace;

  return result;
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const {
    workspaces,
    currentWorkspace,
    currentWorkspaceId,
    setCurrentWorkspace,
    refreshWorkspaces,
    loading: loadingWorkspaces,
    error: workspaceError,
    clearWorkspaceError,
  } = useWorkspace();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [workspaceForm, setWorkspaceForm] = useState({
    name: "",
    description: "",
  });
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createdWorkspaceId, setCreatedWorkspaceId] = useState("");

  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const activeWorkspace = currentWorkspace;

  const displayName =
    user?.fullName || user?.userName || user?.name || "My Account";

  const email = user?.email || "";
  const userInitials = getInitials(displayName);

  // Select the newly created workspace once it appears in shared context.
  useEffect(() => {
    if (!createdWorkspaceId) return;

    const exists = workspaces.some(
      (workspace) => getId(workspace) === createdWorkspaceId
    );

    if (exists) {
      setCurrentWorkspace(createdWorkspaceId);
      setCreatedWorkspaceId("");
    }
  }, [createdWorkspaceId, workspaces, setCurrentWorkspace]);

  // Close the mobile drawer or modal with Escape.
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;

      setIsMobileOpen(false);

      if (createOpen && !creatingWorkspace) {
        setCreateOpen(false);
        setCreateError("");
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [createOpen, creatingWorkspace]);

  // Prevent the background page from scrolling while the mobile drawer is open.
  useEffect(() => {
    if (!isMobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileOpen]);

  const handleWorkspaceChange = (event) => {
    setCurrentWorkspace(event.target.value);
  };

  const handleCreateWorkspace = async (event) => {
    event.preventDefault();
    setCreateError("");

    const name = workspaceForm.name.trim();
    const description = workspaceForm.description.trim();

    if (name.length < 3) {
      setCreateError(
        "Workspace name must contain at least 3 characters."
      );
      return;
    }

    if (description.length > 0 && description.length < 5) {
      setCreateError(
        "Description must be empty or contain at least 5 characters."
      );
      return;
    }

    try {
      setCreatingWorkspace(true);

      const response = await createWorkspace({
        name,
        description,
      });

      const newWorkspace = getCreatedWorkspace(response);
      const newWorkspaceId = getId(newWorkspace);

      if (!newWorkspaceId) {
        throw new Error(
          "Workspace was created, but its details were not returned."
        );
      }

      setWorkspaceForm({
        name: "",
        description: "",
      });
      setCreateOpen(false);
      setCreatedWorkspaceId(newWorkspaceId);

      clearWorkspaceError?.();

      const refreshedWorkspaces = await refreshWorkspaces();

      const workspaceExists = refreshedWorkspaces.some(
        (workspace) => getId(workspace) === newWorkspaceId
      );

      if (!workspaceExists) {
        setCreateError(
          "Workspace created, but it was not returned in your workspace list. Refresh and try again."
        );
        setCreatedWorkspaceId("");
      }
    } catch (error) {
      setCreateError(
        error?.response?.data?.message ||
        error?.message ||
        "Unable to create workspace. Please try again."
      );
    } finally {
      setCreatingWorkspace(false);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      setLogoutError("Logout failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const navLinkStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "12px",
    flexShrink: 0,
    padding: "10px 12px",
    borderRadius: "8px",
    border: `1px solid ${isActive
        ? "var(--primary-soft, #d8eee9)"
        : "transparent"
      }`,
    backgroundColor: isActive
      ? "var(--primary-soft, #e1f2ef)"
      : "transparent",
    color: isActive ? "var(--primary)" : "var(--text-muted)",
    fontSize: "14px",
    fontWeight: isActive ? 600 : 500,
    textDecoration: "none",
    transition: "background-color 160ms ease, color 160ms ease",
  });

  const closeMobileSidebar = () => setIsMobileOpen(false);

  return (
    <>
      {/* Mobile menu button: visible when the drawer is closed */}
      {!isMobileOpen && (
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open sidebar"
          aria-expanded={false}
          className="fixed left-4 top-4 z-[60] flex size-10 items-center justify-center rounded-lg border shadow-sm md:hidden"
          style={{
            background: "var(--surface)",
            color: "var(--text)",
            borderColor: "var(--border)",
          }}
        >
          <Menu size={20} />
        </button>
      )}

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <aside
        id="taskflow-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r shadow-xl transition-[width,transform] duration-200 ease-in-out md:sticky md:top-0 md:z-auto md:translate-x-0 md:shadow-none ${isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"
          } ${isCollapsed ? "md:w-20" : "md:w-60"}`}
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        {/* Brand and collapse controls */}
        <div
          className={`flex h-16 shrink-0 items-center px-4 ${isCollapsed ? "md:justify-center" : "justify-between"
            }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor: "var(--primary)",
                color: "#ffffff",
              }}
            >
              <CheckSquare size={20} strokeWidth={1.8} />
            </div>

            <span
              className={`text-lg font-semibold tracking-tight ${isCollapsed ? "md:hidden" : ""
                }`}
              style={{ color: "var(--text)" }}
            >
              TaskFlow
            </span>
          </div>

          {/* Desktop collapse/expand button */}
          <button
            type="button"
            onClick={() => setIsCollapsed((previous) => !previous)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden size-8 shrink-0 items-center justify-center rounded-lg hover:bg-[var(--surface-muted)] focus-visible:outline-2 focus-visible:outline-[var(--focus)] md:flex"
            style={{ color: "var(--text-muted)" }}
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={closeMobileSidebar}
            aria-label="Close sidebar"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg hover:bg-[var(--surface-muted)] md:hidden"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={19} />
          </button>
        </div>

        {/* Workspace selector */}
        <div
          className={`px-3 pb-3 ${isCollapsed ? "md:px-2" : ""
            }`}
        >
          <div
            className={`mb-2 flex items-center justify-between px-1 ${isCollapsed ? "md:justify-center" : ""
              }`}
          >
            <label
              htmlFor="workspace"
              className={`text-xs font-medium tracking-wide ${isCollapsed ? "md:hidden" : ""
                }`}
              style={{ color: "var(--text-muted)" }}
            >
              WORKSPACE
            </label>

            <button
              type="button"
              onClick={() => {
                setCreateError("");
                setWorkspaceForm({ name: "", description: "" });
                setCreateOpen(true);
              }}
              aria-label="Create workspace"
              title="Create workspace"
              className="flex size-7 items-center justify-center rounded-md hover:bg-[var(--surface-muted)] focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
              style={{ color: "var(--primary)" }}
            >
              <Plus size={17} />
            </button>
          </div>

          {/* Full selector for expanded sidebar and mobile drawer */}
          <div
            className={`relative ${isCollapsed ? "md:hidden" : ""
              }`}
          >
            <div
              className="pointer-events-none absolute left-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-xs font-semibold"
              style={{
                backgroundColor: "var(--primary-soft, #e1f2ef)",
                color: "var(--primary)",
              }}
            >
              {activeWorkspace
                ? getInitials(activeWorkspace.name)
                : "W"}
            </div>

            <select
              id="workspace"
              value={currentWorkspaceId || ""}
              onChange={handleWorkspaceChange}
              disabled={loadingWorkspaces || workspaces.length === 0}
              className="w-full cursor-pointer appearance-none rounded-lg border py-3 pl-14 pr-9 text-sm font-medium outline-none focus-visible:outline-2 focus-visible:outline-[var(--focus)] disabled:cursor-not-allowed disabled:opacity-70"
              style={{
                backgroundColor: "var(--surface)",
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
                  <option key={getId(workspace)} value={getId(workspace)}>
                    {workspace.name}
                  </option>
                ))
              )}
            </select>

            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
          </div>

          {/* Compact workspace selector, desktop only */}
          {isCollapsed && (
            <div className="relative hidden md:block">
              <select
                aria-label="Select workspace"
                title={activeWorkspace?.name || "Select workspace"}
                value={currentWorkspaceId || ""}
                onChange={handleWorkspaceChange}
                disabled={loadingWorkspaces || workspaces.length === 0}
                className="w-full cursor-pointer appearance-none rounded-lg border px-1 py-3 text-center text-xs font-medium outline-none focus-visible:outline-2 focus-visible:outline-[var(--focus)] disabled:opacity-60"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "transparent",
                }}
              >
                {workspaces.map((workspace) => (
                  <option
                    key={getId(workspace)}
                    value={getId(workspace)}
                    style={{ color: "var(--text)" }}
                  >
                    {workspace.name}
                  </option>
                ))}
              </select>

              <span
                className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-semibold"
                style={{
                  color: "var(--primary)",
                }}
              >
                {activeWorkspace
                  ? getInitials(activeWorkspace.name)
                  : "W"}
              </span>
            </div>
          )}

          {workspaceError && (
            <p role="alert" className="mt-2 px-1 text-xs text-red-600">
              {workspaceError}
            </p>
          )}
        </div>

        {/* Navigation */}
        <nav
          aria-label="Dashboard navigation"
          className="flex flex-col gap-1 overflow-y-auto px-3 py-3 md:flex-1 md:py-5"
        >
          {navItems.map(({ name, path, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              title={isCollapsed ? name : undefined}
              onClick={closeMobileSidebar}
              style={({ isActive }) => navLinkStyle(isActive)}
              className={`hover:bg-[var(--surface-muted)] ${isCollapsed ? "md:justify-center md:gap-0 md:px-2" : ""
                }`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span className={isCollapsed ? "md:hidden" : ""}>
                {name}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Account and logout */}
        <div
          className="shrink-0 border-t p-3"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className={`flex min-w-0 items-center gap-3 px-2 py-3 ${isCollapsed ? "md:justify-center md:px-0" : ""
              }`}
          >
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
              style={{
                backgroundColor: "var(--primary-soft, #e1f2ef)",
                color: "var(--primary)",
              }}
              title={displayName}
            >
              {userInitials}
            </div>

            <div
              className={`min-w-0 flex-1 ${isCollapsed ? "md:hidden" : ""
                }`}
            >
              <p
                className="truncate text-sm font-medium"
                style={{ color: "var(--text)" }}
              >
                {displayName}
              </p>

              {email && (
                <p
                  className="truncate text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {email}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                navigate("/dashboard/profile");
                closeMobileSidebar();
              }}
              aria-label="My profile"
              title="My profile"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg hover:bg-[var(--surface-muted)] focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
              style={{ color: "var(--text-muted)" }}
            >
              <UserRound size={17} />
            </button>
          </div>

          {logoutError && (
            <p role="alert" className="px-2 py-2 text-xs text-red-600">
              {logoutError}
            </p>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            title={isCollapsed ? "Logout" : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-60 ${isCollapsed ? "md:justify-center md:gap-0 md:px-2" : ""
              }`}
            style={{ color: "var(--text-muted)" }}
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span className={isCollapsed ? "md:hidden" : ""}>
              {loggingOut ? "Logging out..." : "Logout"}
            </span>
          </button>

          <div
            className={`mt-3 border-t px-2 pt-3 ${isCollapsed ? "md:hidden" : ""
              }`}
            style={{ borderColor: "var(--border)" }}
          >
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Current workspace
            </p>

            <p
              className="mt-1 truncate text-sm font-medium"
              style={{ color: "var(--text)" }}
            >
              {loadingWorkspaces
                ? "Loading..."
                : activeWorkspace?.name || "No workspace selected"}
            </p>
          </div>
        </div>
      </aside>

      {/* Create workspace dialog */}
      {createOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !creatingWorkspace
            ) {
              setCreateOpen(false);
              setCreateError("");
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-workspace-title"
            className="w-full max-w-md rounded-2xl border p-6"
            style={{
              backgroundColor: "var(--surface)",
              color: "var(--text)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div
                  className="mb-4 flex size-10 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: "var(--primary-soft, #e1f2ef)",
                    color: "var(--primary)",
                  }}
                >
                  <FolderKanban size={20} />
                </div>

                <h2
                  id="create-workspace-title"
                  className="text-xl font-semibold tracking-tight"
                >
                  Create workspace
                </h2>

                <p
                  className="mt-1 text-sm leading-6"
                  style={{ color: "var(--text-muted)" }}
                >
                  Create a shared space to organize your team's work.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCreateOpen(false);
                  setCreateError("");
                }}
                disabled={creatingWorkspace}
                aria-label="Close dialog"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg hover:bg-[var(--surface-muted)] disabled:opacity-50"
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
                  backgroundColor: "var(--surface)",
                }}
              >
                {createError}
              </div>
            )}

            <form
              onSubmit={handleCreateWorkspace}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="new-workspace-name"
                  className="text-sm font-medium"
                >
                  Workspace name
                </label>

                <input
                  id="new-workspace-name"
                  name="name"
                  type="text"
                  placeholder="e.g. Product Development"
                  minLength={3}
                  maxLength={100}
                  value={workspaceForm.name}
                  onChange={(event) =>
                    setWorkspaceForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-lg border px-3.5 py-3 text-sm outline-none focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
                  style={{
                    backgroundColor: "var(--surface)",
                    color: "var(--text)",
                    borderColor: "var(--border)",
                  }}
                  required
                  autoFocus
                />

                <p
                  className="mt-1.5 text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Use at least 3 characters.
                </p>
              </div>

              <div>
                <label
                  htmlFor="new-workspace-description"
                  className="text-sm font-medium"
                >
                  Description{" "}
                  <span style={{ color: "var(--text-muted)" }}>
                    (optional)
                  </span>
                </label>

                <textarea
                  id="new-workspace-description"
                  name="description"
                  rows={3}
                  maxLength={500}
                  placeholder="What will this workspace be used for?"
                  value={workspaceForm.description}
                  onChange={(event) =>
                    setWorkspaceForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="mt-2 w-full resize-y rounded-lg border px-3.5 py-3 text-sm outline-none focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
                  style={{
                    backgroundColor: "var(--surface)",
                    color: "var(--text)",
                    borderColor: "var(--border)",
                  }}
                />

                <p
                  className="mt-1.5 text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Leave blank or enter at least 5 characters.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCreateOpen(false);
                    setCreateError("");
                  }}
                  disabled={creatingWorkspace}
                  className="h-10 rounded-lg border px-4 text-sm font-medium hover:bg-[var(--surface-muted)] disabled:opacity-50"
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
                    creatingWorkspace ||
                    workspaceForm.name.trim().length < 3
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "#ffffff",
                  }}
                >
                  <Plus size={16} />
                  {creatingWorkspace
                    ? "Creating..."
                    : "Create workspace"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
