import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Check,
  CheckSquare,
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  Users,
  ChevronDown,
  ChevronLeft,
  LogOut,
  UserRound,
  Plus,
  X,
  Menu,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import { useWorkspace } from "../../context/WorkspaceContext.jsx";
import { createWorkspace } from "../../services/workspace.service.js";

const COLLAPSE_STORAGE_KEY = "taskflow:sidebar-collapsed";

const navItems = [
  { name: "Overview", path: "/dashboard", icon: LayoutDashboard, end: true },
  { name: "Tasks", path: "/dashboard/tasks", icon: ListTodo },
  { name: "Projects", path: "/dashboard/projects", icon: FolderKanban },
  { name: "Members", path: "/dashboard/members", icon: Users },
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

const readCollapsedPreference = () => {
  try {
    return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

/* ---------- Shared style tokens ---------- */

// One easing curve + duration for every sidebar animation keeps it cohesive.
const motion =
  "duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]";

const iconButtonClass =
  "flex size-9 shrink-0 items-center justify-center rounded-lg border border-transparent " +
  "text-[var(--text-muted)] transition-colors duration-200 " +
  "hover:bg-[var(--surface-muted)] hover:text-[var(--text)] " +
  focusRing;

const sectionLabelClass =
  "text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-subtle)]";

const fieldClass =
  "mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 text-sm " +
  "text-[var(--text)] outline-none transition-colors " +
  "placeholder:text-[var(--text-subtle)] hover:border-[var(--border-strong)] " +
  `focus:border-[var(--primary)] ${focusRing}`;

function FormField({ label, id, hint, as: Component = "input", ...props }) {
  const isTextarea = Component === "textarea";

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="text-sm font-medium text-[var(--text)]">
        {label}
      </label>

      <Component
        {...props}
        id={id}
        className={`${fieldClass} ${
          isTextarea ? "resize-y py-3" : "min-h-11 py-2.5"
        }`}
      />

      {hint && (
        <p className="mt-1.5 text-xs leading-5 text-[var(--text-subtle)]">
          {hint}
        </p>
      )}
    </div>
  );
}

/* ---------- Custom workspace dropdown ---------- */

function WorkspaceSelect({
  workspaces,
  selectedId,
  loading,
  isCollapsed,
  onSelect,
  onCreate,
}) {
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const closeTimer = useRef(null);

  // `mounted` keeps the menu in the DOM during the exit animation.
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 256 });

  const disabled = loading || workspaces.length === 0;
  const selectedIndex = workspaces.findIndex(
    (workspace) => getId(workspace) === selectedId,
  );
  const selected = selectedIndex >= 0 ? workspaces[selectedIndex] : null;

  const triggerText = loading
    ? "Loading workspaces..."
    : workspaces.length === 0
      ? "No workspaces available"
      : selected?.name || "Select workspace";

  const open = () => {
    if (disabled || !triggerRef.current) return;

    clearTimeout(closeTimer.current);

    // The menu is portaled to <body> so the sidebar's overflow clipping
    // can't cut it off. When the rail is collapsed it opens to the side.
    const rect = triggerRef.current.getBoundingClientRect();
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const sideways = isDesktop && isCollapsed;

    const top = sideways ? rect.top : rect.bottom + 6;

    setPosition({
      top: Math.max(8, Math.min(top, window.innerHeight - 380)),
      left: sideways ? rect.right + 12 : rect.left,
      width: sideways ? 256 : rect.width,
    });

    setActiveIndex(Math.max(selectedIndex, 0));
    setMounted(true);

    // Two frames so the browser paints the closed state before animating in.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setShown(true));
    });
  };

  const close = (restoreFocus = true) => {
    setShown(false);

    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMounted(false), 160);

    if (restoreFocus) triggerRef.current?.focus();
  };

  const choose = (workspace) => {
    if (!workspace) return;

    onSelect(getId(workspace));
    close();
  };

  // Move focus into the list when it opens.
  useEffect(() => {
    if (mounted) listRef.current?.focus({ preventScroll: true });
  }, [mounted]);

  // Keep the highlighted option visible while using the keyboard.
  useEffect(() => {
    if (!mounted) return;

    document
      .getElementById(`workspace-option-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, mounted]);

  // The menu is positioned once, so close it if the layout changes.
  useEffect(() => {
    if (!mounted) return;

    const handleResize = () => close(false);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const handleListKeyDown = (event) => {
    const lastIndex = workspaces.length - 1;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, lastIndex));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(lastIndex);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(workspaces[activeIndex]);
        break;
      case "Escape":
        // Stop here so Escape doesn't also close the mobile drawer.
        event.preventDefault();
        event.stopPropagation();
        close();
        break;
      case "Tab":
        close(false);
        break;
      default:
        break;
    }
  };

  const handleTriggerKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      open();
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        id="workspace"
        type="button"
        disabled={disabled}
        onClick={() => (mounted && shown ? close() : open())}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={mounted && shown}
        aria-controls="workspace-listbox"
        title={selected?.name || "Select workspace"}
        className={`relative flex h-12 w-full items-center rounded-xl border bg-[var(--surface)] text-left text-sm font-medium text-[var(--text)] outline-none transition-colors duration-200 hover:border-[var(--border-strong)] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing} ${
          shown ? "border-[var(--primary)]" : "border-[var(--border)]"
        }`}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[10px] font-bold text-[var(--primary)]"
        >
          {selected ? getInitials(selected.name) : "W"}
        </span>

        <span
          className={`min-w-0 flex-1 truncate pl-12 pr-9 transition-opacity duration-200 ${
            isCollapsed ? "md:opacity-0" : ""
          }`}
        >
          {triggerText}
        </span>

        <ChevronDown
          size={15}
          aria-hidden="true"
          className={`pointer-events-none absolute right-3 top-1/2 -mt-[7px] text-[var(--text-muted)] transition-[opacity,transform] duration-200 ${
            shown ? "rotate-180" : ""
          } ${isCollapsed ? "md:opacity-0" : ""}`}
        />
      </button>

      {mounted &&
        createPortal(
          <>
            {/* Click-away layer */}
            <div
              className="fixed inset-0 z-[80]"
              onMouseDown={() => close(false)}
            />

            <div
              style={{
                top: position.top,
                left: position.left,
                width: position.width,
              }}
              className={`fixed z-[81] origin-top-left overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 text-[var(--text)] shadow-2xl transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none ${
                shown
                  ? "translate-y-0 scale-100 opacity-100"
                  : "-translate-y-1 scale-95 opacity-0"
              }`}
            >
              <p className={`px-2.5 pb-1 pt-1.5 ${sectionLabelClass}`}>
                Switch workspace
              </p>

              <ul
                ref={listRef}
                id="workspace-listbox"
                role="listbox"
                tabIndex={-1}
                aria-label="Workspaces"
                aria-activedescendant={`workspace-option-${activeIndex}`}
                onKeyDown={handleListKeyDown}
                className="max-h-60 space-y-0.5 overflow-y-auto overscroll-contain py-1 outline-none"
              >
                {workspaces.map((workspace, index) => {
                  const isSelected = getId(workspace) === selectedId;
                  const isActive = index === activeIndex;

                  return (
                    <li
                      key={getId(workspace)}
                      id={`workspace-option-${index}`}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => choose(workspace)}
                      className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2.5 py-1.5 text-sm transition-colors duration-150 ${
                        isSelected
                          ? "bg-[var(--primary-soft,var(--surface-muted))] font-semibold text-[var(--primary)]"
                          : isActive
                            ? "bg-[var(--surface-muted)] font-medium text-[var(--text)]"
                            : "font-medium text-[var(--text-muted)]"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                          isSelected
                            ? "bg-[var(--surface)] text-[var(--primary)]"
                            : "bg-[var(--primary-soft)] text-[var(--primary)]"
                        }`}
                      >
                        {getInitials(workspace.name)}
                      </span>

                      <span className="min-w-0 flex-1 truncate">
                        {workspace.name}
                      </span>

                      {isSelected && (
                        <Check
                          size={16}
                          strokeWidth={2.2}
                          aria-hidden="true"
                          className="shrink-0"
                        />
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-1 border-t border-[var(--border)] pt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    close(false);
                    onCreate();
                  }}
                  className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-2.5 py-1.5 text-sm font-medium text-[var(--text-muted)] transition-colors duration-150 hover:bg-[var(--surface-muted)] hover:text-[var(--text)] ${focusRing}`}
                >
                  <span
                    aria-hidden="true"
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-dashed border-[var(--border-strong,var(--border))]"
                  >
                    <Plus size={15} />
                  </span>
                  Create workspace
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}

/* ---------- Sidebar ---------- */

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const {
    workspaces,
    currentWorkspaceId,
    setCurrentWorkspace,
    refreshWorkspaces,
    loading: loadingWorkspaces,
    error: workspaceError,
    clearWorkspaceError,
  } = useWorkspace();

  const [isCollapsed, setIsCollapsed] = useState(readCollapsedPreference);
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

  const displayName =
    user?.fullName || user?.userName || user?.name || "My Account";

  const email = user?.email || "";
  const userInitials = getInitials(displayName);

  // Labels fade and slide away (instead of popping) when collapsed on desktop.
  // On mobile the drawer is always fully expanded.
  const labelClass = `overflow-hidden whitespace-nowrap transition-[max-width,opacity] ${motion} ${
    isCollapsed
      ? "max-w-[12rem] opacity-100 md:max-w-0 md:opacity-0"
      : "max-w-[12rem] opacity-100"
  }`;

  // Remember the collapsed state between visits.
  useEffect(() => {
    try {
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, String(isCollapsed));
    } catch {
      // Storage can be unavailable (private mode, blocked cookies).
    }
  }, [isCollapsed]);

  // Close the mobile drawer if the viewport grows to desktop size.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");

    const handleChange = (event) => {
      if (event.matches) setIsMobileOpen(false);
    };

    query.addEventListener("change", handleChange);

    return () => {
      query.removeEventListener("change", handleChange);
    };
  }, []);

  // Select a newly created workspace when it appears in shared context.
  useEffect(() => {
    if (!createdWorkspaceId) return;

    const exists = workspaces.some(
      (workspace) => getId(workspace) === createdWorkspaceId,
    );

    if (exists) {
      setCurrentWorkspace(createdWorkspaceId);
      setCreatedWorkspaceId("");
    }
  }, [createdWorkspaceId, workspaces, setCurrentWorkspace]);

  // Close the dialog first when Escape is pressed.
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;

      if (createOpen) {
        if (!creatingWorkspace) {
          setCreateOpen(false);
          setCreateError("");
        }

        return;
      }

      if (isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [createOpen, creatingWorkspace, isMobileOpen]);

  // Prevent background scrolling while a drawer or dialog is open.
  useEffect(() => {
    if (!isMobileOpen && !createOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileOpen, createOpen]);

  const closeMobileSidebar = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const openCreateDialog = () => {
    setCreateError("");
    setWorkspaceForm({ name: "", description: "" });
    setCreateOpen(true);
  };

  const closeCreateDialog = () => {
    if (creatingWorkspace) return;

    setCreateOpen(false);
    setCreateError("");
  };

  const handleCreateWorkspace = async (event) => {
    event.preventDefault();
    setCreateError("");

    const name = workspaceForm.name.trim();
    const description = workspaceForm.description.trim();

    if (name.length < 3) {
      setCreateError("Workspace name must contain at least 3 characters.");
      return;
    }

    if (description.length > 0 && description.length < 5) {
      setCreateError(
        "Description must be empty or contain at least 5 characters.",
      );
      return;
    }

    let newWorkspaceId = "";

    try {
      setCreatingWorkspace(true);

      const response = await createWorkspace({ name, description });

      const newWorkspace = getCreatedWorkspace(response);
      newWorkspaceId = getId(newWorkspace);

      if (!newWorkspaceId) {
        throw new Error(
          "Workspace was created, but its details were not returned.",
        );
      }

      setWorkspaceForm({ name: "", description: "" });

      setCreatedWorkspaceId(newWorkspaceId);
      clearWorkspaceError?.();
      setCreateOpen(false);
    } catch (error) {
      setCreateError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to create workspace. Please try again.",
      );
      return;
    } finally {
      setCreatingWorkspace(false);
    }

    // A refresh failure must not be reported as a creation failure.
    // The shared-context effect will select the workspace when it appears.
    try {
      const refreshedWorkspaces = await refreshWorkspaces();

      if (
        Array.isArray(refreshedWorkspaces) &&
        refreshedWorkspaces.some(
          (workspace) => getId(workspace) === newWorkspaceId,
        )
      ) {
        setCurrentWorkspace(newWorkspaceId);
        setCreatedWorkspaceId("");
      }
    } catch {
      // Keep the new workspace ID pending for the shared-context effect.
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

  const hideWhenCollapsed = isCollapsed ? "md:hidden" : "";

  return (
    <>
      {/* Mobile menu trigger */}
      {!isMobileOpen && (
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open sidebar"
          aria-controls="taskflow-sidebar"
          aria-expanded={isMobileOpen}
          className={`fixed left-4 top-3 z-[60] flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-sm transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] md:hidden ${focusRing}`}
        >
          <Menu size={19} />
        </button>
      )}

      {/* Mobile backdrop */}
      <button
        type="button"
        aria-label="Close sidebar"
        tabIndex={isMobileOpen ? 0 : -1}
        onClick={closeMobileSidebar}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sidebar */}
      <aside
        id="taskflow-sidebar"
        aria-label="TaskFlow sidebar"
        className={`fixed inset-y-0 left-0 z-50 h-dvh w-[min(18rem,calc(100vw-1rem))] border-r border-[var(--border)] bg-[var(--surface)] transition-[width,transform,box-shadow,visibility] ${motion} md:visible md:sticky md:top-0 md:z-40 md:translate-x-0 md:shadow-none ${
          isMobileOpen
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full max-md:invisible"
        } ${isCollapsed ? "md:w-[72px]" : "md:w-64"}`}
      >
        {/* Floating desktop collapse handle, sits on the sidebar edge */}
        <button
          type="button"
          onClick={() => setIsCollapsed((previous) => !previous)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`absolute -right-3 top-5 z-10 hidden size-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] shadow-sm transition-colors duration-200 hover:border-[var(--primary)] hover:text-[var(--primary)] md:flex ${focusRing}`}
        >
          <ChevronLeft
            size={14}
            className={`transition-transform ${motion} ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Inner wrapper clips labels while the width animates */}
        <div className="flex h-full w-full flex-col overflow-hidden">
          {/* Brand */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] px-3">
            <div className="flex min-w-0 items-center gap-3 pl-1">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--text-inverse)]">
                <CheckSquare size={20} strokeWidth={1.8} />
              </span>

              <span
                className={`font-['Plus_Jakarta_Sans',sans-serif] text-lg font-bold tracking-[-0.035em] text-[var(--text)] ${labelClass}`}
              >
                TaskFlow
              </span>
            </div>

            {/* Mobile close control */}
            <button
              type="button"
              onClick={closeMobileSidebar}
              aria-label="Close sidebar"
              className={`${iconButtonClass} md:hidden`}
            >
              <X size={19} />
            </button>
          </div>

          {/* Workspace selector */}
          <div className="shrink-0 border-b border-[var(--border)] p-3">
            <div className="mb-2 flex items-center px-1">
              <label
                htmlFor="workspace"
                className={`${sectionLabelClass} ${labelClass}`}
              >
                Workspace
              </label>

              <span className="grow" aria-hidden="true" />

              <button
                type="button"
                onClick={openCreateDialog}
                aria-label="Create workspace"
                title="Create workspace"
                className={`${iconButtonClass} size-8`}
              >
                <Plus size={17} />
              </button>

              {/* Grows when collapsed so the button ends up centered */}
              <span
                aria-hidden="true"
                className={`grow-0 transition-[flex-grow] ${motion} ${
                  isCollapsed ? "md:grow" : ""
                }`}
              />
            </div>

            <WorkspaceSelect
              workspaces={workspaces}
              selectedId={currentWorkspaceId || ""}
              loading={loadingWorkspaces}
              isCollapsed={isCollapsed}
              onSelect={setCurrentWorkspace}
              onCreate={openCreateDialog}
            />

            {workspaceError && (
              <p
                role="alert"
                className={`mt-2 break-words px-1 text-xs leading-5 text-[var(--danger,#dc2626)] ${hideWhenCollapsed}`}
              >
                {workspaceError}
              </p>
            )}
          </div>

          {/* Primary navigation */}
          <nav
            aria-label="Dashboard navigation"
            className="flex min-h-0 flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto overscroll-contain p-3 pt-4"
          >
            <p className={`mb-2 px-3 ${sectionLabelClass} ${labelClass}`}>
              Menu
            </p>

            {navItems.map(({ name, path, icon: Icon, end }) => (
              <NavLink
                key={path}
                to={path}
                end={end}
                title={isCollapsed ? name : undefined}
                onClick={closeMobileSidebar}
                className={({ isActive }) =>
                  `flex h-11 shrink-0 items-center gap-3 rounded-xl px-[15px] text-sm transition-colors duration-200 ${focusRing} ${
                    isActive
                      ? "bg-[var(--primary-soft,var(--surface-muted))] font-semibold text-[var(--primary)]"
                      : "font-medium text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.8} className="shrink-0" />

                <span className={`truncate ${labelClass}`}>{name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Account and logout */}
          <div className="shrink-0 border-t border-[var(--border)] p-3">
            <div className="flex min-w-0 items-center gap-3 px-1 py-2">
              <span
                title={displayName}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-xs font-bold text-[var(--primary)]"
              >
                {userInitials}
              </span>

              <div className={`min-w-0 flex-1 ${labelClass}`}>
                <p className="truncate text-sm font-semibold text-[var(--text)]">
                  {displayName}
                </p>

                {email && (
                  <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                    {email}
                  </p>
                )}
              </div>

              <div
                className={`shrink-0 overflow-hidden transition-[max-width,opacity] ${motion} ${
                  isCollapsed
                    ? "max-w-9 opacity-100 md:max-w-0 md:opacity-0"
                    : "max-w-9 opacity-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    closeMobileSidebar();
                    navigate("/dashboard/profile");
                  }}
                  aria-label="My profile"
                  title="My profile"
                  tabIndex={isCollapsed ? -1 : 0}
                  className={iconButtonClass}
                >
                  <UserRound size={17} />
                </button>
              </div>
            </div>

            {logoutError && (
              <p
                role="alert"
                className={`break-words px-2 py-2 text-xs leading-5 text-[var(--danger,#dc2626)] ${hideWhenCollapsed}`}
              >
                {logoutError}
              </p>
            )}

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              title={isCollapsed ? "Logout" : undefined}
              className={`mt-1 flex h-11 w-full items-center gap-3 rounded-xl px-[15px] text-sm font-medium text-[var(--text-muted)] transition-colors duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
            >
              <LogOut size={18} strokeWidth={1.8} className="shrink-0" />

              <span className={labelClass}>
                {loggingOut ? "Logging out..." : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Create workspace dialog */}
      {createOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/45 px-4 py-5 backdrop-blur-[2px] sm:py-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeCreateDialog();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-workspace-title"
            className="my-auto max-h-[calc(100dvh-2.5rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--text)] shadow-2xl sm:p-7"
          >
            {/* Dialog header */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="mb-4 flex size-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                  <FolderKanban size={20} />
                </span>

                <h2
                  id="create-workspace-title"
                  className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold tracking-[-0.035em] sm:text-2xl"
                >
                  Create workspace
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  Create a shared space to organize your team&apos;s work.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateDialog}
                disabled={creatingWorkspace}
                aria-label="Close dialog"
                className={`${iconButtonClass} -mr-1 -mt-1`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Validation and API feedback */}
            {createError && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-[var(--danger,#dc2626)]/40 bg-[var(--surface-muted)] px-3.5 py-3 text-sm leading-6 text-[var(--danger,#dc2626)]"
              >
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateWorkspace} className="mt-6 space-y-5">
              <FormField
                id="new-workspace-name"
                name="name"
                label="Workspace name"
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
                hint="Use at least 3 characters."
                required
                autoFocus
              />

              <FormField
                id="new-workspace-description"
                name="description"
                label={
                  <>
                    Description{" "}
                    <span className="font-normal text-[var(--text-subtle)]">
                      (optional)
                    </span>
                  </>
                }
                as="textarea"
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
                hint="Leave blank or enter at least 5 characters."
              />

              <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCreateDialog}
                  disabled={creatingWorkspace}
                  className={`inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] px-5 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creatingWorkspace || workspaceForm.name.trim().length < 3
                  }
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--text-inverse)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                >
                  <Plus size={16} />

                  {creatingWorkspace ? "Creating..." : "Create workspace"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}