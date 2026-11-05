
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import {
  Check,
  ChevronsLeft,
  ChevronsUpDown,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Plus,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { useWorkspace } from "../../context/WorkspaceContext.jsx";
import { createWorkspace } from "../../services/workspace.service.js";
import { useAuth } from "../../hooks/useAuth.js";

/* ---------- Constants & helpers ---------- */

export const SIDEBAR_WIDTH = 288;

const EASE = [0.32, 0.72, 0, 1];

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

/* ---------- Shared theme-aware styles ---------- */

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]";

const iconButtonClass =
  "flex size-9 shrink-0 items-center justify-center rounded-lg border border-transparent " +
  "text-[var(--text-muted)] transition-colors duration-200 " +
  "hover:bg-[var(--surface-muted)] hover:text-[var(--text)] " +
  focusRing;

const sectionLabelClass =
  "text-xs font-semibold tracking-wide text-[var(--text-subtle)]";

const fieldClass =
  "mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 text-sm " +
  "text-[var(--text)] outline-none transition-colors " +
  "placeholder:text-[var(--text-subtle)] hover:border-[var(--border-strong)] " +
  `focus:border-[var(--primary)] ${focusRing}`;

function FormField({ label, id, hint, as: Component = "input", ...props }) {
  const isTextarea = Component === "textarea";

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="text-sm font-semibold text-[var(--text)]">
        {label}
      </label>

      <Component
        {...props}
        id={id}
        className={`${fieldClass} ${isTextarea ? "resize-y py-3" : "min-h-11 py-2.5"
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

/* ---------- Workspace dropdown ---------- */

function WorkspaceSelect({
  workspaces,
  selectedId,
  loading,
  onSelect,
  onCreate,
}) {
  const reduceMotion = useReducedMotion();
  const triggerRef = useRef(null);
  const listRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 256,
  });

  const disabled = loading || workspaces.length === 0;

  const selectedIndex = workspaces.findIndex(
    (workspace) => getId(workspace) === selectedId,
  );

  const selected = selectedIndex >= 0 ? workspaces[selectedIndex] : null;

  const triggerText = loading
    ? "Loading workspaces..."
    : workspaces.length === 0
      ? "No workspaces yet"
      : selected?.name || "Select workspace";

  const subtitle = loading
    ? "Please wait"
    : workspaces.length === 0
      ? "Create one to get started"
      : `${workspaces.length} workspace${workspaces.length > 1 ? "s" : ""}`;

  const openMenu = () => {
    if (disabled || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();

    setPosition({
      top: Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - 360)),
      left: rect.left,
      width: rect.width,
    });

    setActiveIndex(Math.max(selectedIndex, 0));
    setOpen(true);
  };

  const close = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  const choose = (workspace) => {
    if (!workspace) return;

    onSelect(getId(workspace));
    close();
  };

  useEffect(() => {
    if (open) listRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open) return;

    document
      .getElementById(`workspace-option-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleResize = () => setOpen(false);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [open]);

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
      openMenu();
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        id="workspace"
        type="button"
        disabled={disabled}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="workspace-listbox"
        title={selected?.name || "Select workspace"}
        className={`group flex h-14 w-full items-center gap-3 rounded-xl border bg-[var(--surface)] px-2.5 text-left outline-none transition-colors duration-200 hover:border-[var(--border-strong)] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing} ${open ? "border-[var(--primary)]" : "border-[var(--border)]"
          }`}
      >
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[11px] font-extrabold text-[var(--text)]"
        >
          {selected ? getInitials(selected.name) : "W"}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-[var(--text)]">
            {triggerText}
          </span>
          <span className="mt-0.5 block truncate text-[11px] font-medium text-[var(--text-muted)]">
            {subtitle}
          </span>
        </span>

        <ChevronsUpDown
          size={15}
          aria-hidden="true"
          className="shrink-0 text-[var(--text-muted)] transition-colors group-hover:text-[var(--text)]"
        />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                key="workspace-backdrop"
                className="fixed inset-0 z-[80]"
                onMouseDown={() => close(false)}
              />

              <motion.div
                key="workspace-menu"
                initial={
                  reduceMotion ? false : { opacity: 0, y: -6, scale: 0.97 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -6, scale: 0.97 }
                }
                transition={{ duration: 0.16, ease: EASE }}
                style={{
                  top: position.top,
                  left: position.left,
                  width: position.width,
                }}
                className="fixed z-[81] origin-top overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 text-[var(--text)] shadow-[var(--shadow-md)]"
              >
                <p className={`px-2.5 pb-1 pt-1.5 ${sectionLabelClass}`}>
                  Switch workspace
                </p>

                <ul
                  ref={listRef}
                  id="workspace-listbox"
                  role="listbox"
                  tabIndex={-1}
                  data-lenis-prevent
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
                        className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2.5 py-1.5 text-sm transition-colors duration-150 ${isSelected
                            ? "bg-[var(--primary-soft)] font-bold text-[var(--text)]"
                            : isActive
                              ? "bg-[var(--surface-muted)] font-semibold text-[var(--text)]"
                              : "font-medium text-[var(--text-muted)]"
                          }`}
                      >
                        <span
                          aria-hidden="true"
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[10px] font-extrabold text-[var(--text)]"
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
                            className="shrink-0 text-[var(--primary)]"
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
                    className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-2.5 py-1.5 text-sm font-semibold text-[var(--text)] transition-colors duration-150 hover:bg-[var(--surface-muted)] ${focusRing}`}
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-dashed border-[var(--border-strong)] text-[var(--text)]"
                    >
                      <Plus size={15} />
                    </span>
                    Create workspace
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

/* ---------- Create workspace dialog ---------- */

function CreateWorkspaceDialog({ open, onClose }) {
  const reduceMotion = useReducedMotion();

  const {
    workspaces,
    setCurrentWorkspace,
    refreshWorkspaces,
    clearWorkspaceError,
  } = useWorkspace();

  const [form, setForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [createdWorkspaceId, setCreatedWorkspaceId] = useState("");

  useEffect(() => {
    if (!open) return;

    setError("");
    setForm({ name: "", description: "" });
  }, [open]);

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

  const requestClose = () => {
    if (creating) return;
    onClose();
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const description = form.description.trim();

    if (name.length < 3) {
      setError("Workspace name must contain at least 3 characters.");
      return;
    }

    if (description.length > 0 && description.length < 5) {
      setError("Description must be empty or contain at least 5 characters.");
      return;
    }

    let newWorkspaceId = "";

    try {
      setCreating(true);

      const response = await createWorkspace({ name, description });
      const newWorkspace = getCreatedWorkspace(response);

      newWorkspaceId = getId(newWorkspace);

      if (!newWorkspaceId) {
        throw new Error(
          "Workspace was created, but its details were not returned.",
        );
      }

      setForm({ name: "", description: "" });
      setCreatedWorkspaceId(newWorkspaceId);
      clearWorkspaceError?.();
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Unable to create workspace. Please try again.",
      );
      return;
    } finally {
      setCreating(false);
    }

    try {
      const refreshed = await refreshWorkspaces();

      if (
        Array.isArray(refreshed) &&
        refreshed.some((workspace) => getId(workspace) === newWorkspaceId)
      ) {
        setCurrentWorkspace(newWorkspaceId);
        setCreatedWorkspaceId("");
      }
    } catch {
      // Keep the new workspace ID pending for the shared-context effect.
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="create-workspace"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          data-lenis-prevent
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[var(--overlay)] px-4 py-5 sm:py-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) requestClose();
          }}
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            event.stopPropagation();
            requestClose();
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-workspace-title"
            initial={
              reduceMotion ? false : { opacity: 0, y: 18, scale: 0.97 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 12, scale: 0.98 }
            }
            transition={{ duration: 0.28, ease: EASE }}
            className="my-auto max-h-[calc(100dvh-2.5rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--text)] shadow-[var(--shadow-md)] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="mb-4 flex size-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--text)]">
                  <FolderKanban size={20} />
                </span>

                <h2
                  id="create-workspace-title"
                  className="text-xl font-extrabold tracking-tight text-[var(--text)] sm:text-2xl"
                >
                  Create workspace
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  Create a shared space to organize your team's work.
                </p>
              </div>

              <button
                type="button"
                onClick={requestClose}
                disabled={creating}
                aria-label="Close dialog"
                className={`${iconButtonClass} -mr-1 -mt-1`}
              >
                <X size={18} />
              </button>
            </div>

            <AnimatePresence initial={false}>
              {error && (
                <motion.div
                  key="error"
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 rounded-xl border border-[var(--danger)] bg-[var(--danger-soft)] px-3.5 py-3 text-sm font-semibold leading-6 text-[var(--danger)]">
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <FormField
                id="new-workspace-name"
                name="name"
                label="Workspace name"
                type="text"
                placeholder="e.g. Product Development"
                minLength={3}
                maxLength={100}
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
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
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                hint="Leave blank or enter at least 5 characters."
              />

              <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={requestClose}
                  disabled={creating}
                  className={`inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating || form.name.trim().length < 3}
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-5 text-sm font-bold text-[var(--text-inverse)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                >
                  <Plus size={16} />
                  {creating ? "Creating..." : "Create workspace"}
                </button>
              </div>
            </form>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ---------- Sidebar content ---------- */

function SidebarPanel({ open, onClose, onCreate }) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const panelRef = useRef(null);

  const { user, logout } = useAuth();

  const {
    workspaces,
    currentWorkspaceId,
    setCurrentWorkspace,
    loading: loadingWorkspaces,
    error: workspaceError,
  } = useWorkspace();

  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const displayName =
    user?.fullName || user?.userName || user?.name || "My Account";

  const email = user?.email || "";
  const userInitials = getInitials(displayName);

  useEffect(() => {
    if (!open || reduceMotion || !panelRef.current) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-sb-item]",
        { x: -16, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.045,
          delay: 0.1,
          clearProps: "transform,opacity",
        },
      );
    }, panelRef);

    return () => ctx.revert();
  }, [open, reduceMotion]);

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

  return (
    <div ref={panelRef} className="flex h-full w-full flex-col">
      {/* Brand + close */}
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-[var(--border)] px-4">
        <NavLink
          to="/dashboard"
          aria-label="TaskFlow dashboard"
          data-sb-item
          className={`flex min-w-0 items-center gap-3 rounded-lg ${focusRing}`}
        >
          <img
            src="/taskflow-logo.svg"
            alt=""
            aria-hidden="true"
            draggable="false"
            className="size-9 shrink-0 object-contain"
          />

          <span className="truncate text-lg font-extrabold tracking-tight text-[var(--text)]">
            Task<span className="text-[var(--primary)]">Flow</span>
          </span>
        </NavLink>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar"
          title="Close sidebar"
          data-sb-item
          className={`group ${iconButtonClass}`}
        >
          <ChevronsLeft
            size={18}
            strokeWidth={1.8}
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />
        </button>
      </div>

      {/* Workspace selector */}
      <div className="shrink-0 border-b border-[var(--border)] p-4">
        <div className="mb-2 flex items-center justify-between" data-sb-item>
          <label htmlFor="workspace" className={sectionLabelClass}>
            Workspace
          </label>

          <button
            type="button"
            onClick={onCreate}
            aria-label="Create workspace"
            title="Create workspace"
            className={`${iconButtonClass} -mr-1.5 size-7`}
          >
            <Plus size={16} />
          </button>
        </div>

        <div data-sb-item>
          <WorkspaceSelect
            workspaces={workspaces}
            selectedId={currentWorkspaceId || ""}
            loading={loadingWorkspaces}
            onSelect={setCurrentWorkspace}
            onCreate={onCreate}
          />
        </div>

        {workspaceError && (
          <p
            role="alert"
            className="mt-2 break-words px-1 text-xs font-semibold leading-5 text-[var(--danger)]"
          >
            {workspaceError}
          </p>
        )}
      </div>

      {/* Primary navigation */}
      <nav
        aria-label="Dashboard navigation"
        data-lenis-prevent
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-4"
      >
        <p className={`mb-2 px-2 ${sectionLabelClass}`} data-sb-item>
          Menu
        </p>

        <ul className="space-y-1">
          {navItems.map(({ name, path, icon: Icon, end }) => (
            <li key={path} data-sb-item>
              <NavLink
                to={path}
                end={end}
                className={({ isActive }) =>
                  `group relative flex h-11 items-center gap-3 rounded-xl px-3.5 text-sm transition-colors duration-200 ${focusRing} ${isActive
                    ? "font-bold text-[var(--primary)]"
                    : "font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <>
                        <motion.span
                          layoutId="sidebar-active-pill"
                          aria-hidden="true"
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 34,
                          }}
                          className="absolute inset-0 rounded-xl bg-[var(--primary-soft)]"
                        />

                        <motion.span
                          layoutId="sidebar-active-bar"
                          aria-hidden="true"
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 34,
                          }}
                          className="absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-r-full bg-[var(--primary)]"
                        />
                      </>
                    )}

                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      className={`relative shrink-0 transition-colors duration-200 ${isActive
                          ? "text-[var(--primary)]"
                          : "text-[var(--text)]"
                        }`}
                    />

                    <span className="relative truncate">{name}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Account + logout */}
      <div className="shrink-0 border-t border-[var(--border)] p-4">
        <div
          data-sb-item
          className="flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-2.5"
        >
          <span
            title={displayName}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-xs font-extrabold text-[var(--text)] ring-1 ring-inset ring-[var(--border)]"
          >
            {userInitials}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[var(--text)]">
              {displayName}
            </p>

            {email && (
              <p className="mt-0.5 truncate text-xs font-medium text-[var(--text-muted)]">
                {email}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard/profile")}
            aria-label="My profile"
            title="My profile"
            className={iconButtonClass}
          >
            <UserRound size={17} />
          </button>
        </div>

        {logoutError && (
          <p
            role="alert"
            className="mt-2 break-words rounded-lg bg-[var(--danger-soft)] px-3 py-2 text-xs font-semibold leading-5 text-[var(--danger)]"
          >
            {logoutError}
          </p>
        )}

        <button
          type="button"
          data-sb-item
          onClick={handleLogout}
          disabled={loggingOut}
          className={`mt-2 flex h-11 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-semibold text-[var(--text-muted)] transition-colors duration-200 hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
        >
          <LogOut size={18} strokeWidth={1.8} className="shrink-0" />
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}

/* ---------- Sidebar shell ---------- */

export default function Sidebar({ open, onClose }) {
  const reduceMotion = useReducedMotion();
  const [createOpen, setCreateOpen] = useState(false);

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.45, ease: EASE };

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const openCreateDialog = () => setCreateOpen(true);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.button
            key="sidebar-backdrop"
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
            className="fixed inset-0 z-40 bg-[var(--overlay)]"
          />
        )}

        {open && (
          <motion.aside
            key="sidebar-drawer"
            id="taskflow-sidebar"
            role="dialog"
            aria-modal="true"
            aria-label="TaskFlow sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={transition}
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.35, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80 || info.velocity.x < -500) {
                onClose();
              }
            }}
            style={{
              width: `min(${SIDEBAR_WIDTH}px, calc(100vw - 2.5rem))`,
            }}
            className="fixed inset-y-0 left-0 z-50 border-r border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-md)]"
          >
            <SidebarPanel
              open={open}
              onClose={onClose}
              onCreate={openCreateDialog}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      <CreateWorkspaceDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </>
  );
}
