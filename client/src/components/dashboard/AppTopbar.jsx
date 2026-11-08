
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  UserRound,
} from "lucide-react";

import { useWorkspace } from "../../hooks/useWorkspace.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useTheme } from "../../hooks/useTheme.js";
import HamburgerButton from "./HamburgerButton.jsx";

const pageTitles = [
  { path: "/dashboard/tasks", title: "Tasks" },
  { path: "/dashboard/projects", title: "Projects" },
  { path: "/dashboard/members", title: "Members" },
  { path: "/dashboard/profile", title: "My Profile" },
];

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "U";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]";

const iconButtonClass =
  "flex size-10 shrink-0 items-center justify-center rounded-xl " +
  "border border-[var(--border)] bg-[var(--surface)] " +
  "text-[var(--text)] transition-colors duration-200 " +
  "hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] " +
  focusRing;

const menuItemClass =
  "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium " +
  "text-[var(--text)] transition-colors duration-150 " +
  "hover:bg-[var(--surface-muted)] " +
  "disabled:cursor-not-allowed disabled:opacity-60 " +
  focusRing;

export default function AppTopbar({ sidebarOpen, onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const { user, logout } = useAuth();
  const { currentWorkspace, loading: workspaceLoading } = useWorkspace();
  const { isDark: isDarkMode, toggleTheme } = useTheme();

  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const pageTitle =
    pageTitles.find(({ path }) =>
      location.pathname.startsWith(path)
    )?.title || "Overview";

  const displayName =
    user?.fullName || user?.userName || user?.name || "My Account";

  const email = user?.email || "";
  const initials = getInitials(displayName);

  const workspaceName = workspaceLoading
    ? "Loading workspace"
    : currentWorkspace?.name || "No workspace selected";

  /* Close menu on route change */
  useEffect(() => {
    setMenuOpen(false);
    setLogoutError("");
  }, [location.pathname]);

  /* Close account menu on outside click or Escape */
  useEffect(() => {
    if (!menuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleViewProfile = () => {
    setMenuOpen(false);
    navigate("/dashboard/profile");
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      await logout();
      setMenuOpen(false);
      navigate("/login", { replace: true });
    } catch {
      setLogoutError("Logout failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const titleMotion = reduceMotion
    ? {}
    : {
      initial: { opacity: 0, y: 6 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -6 },
      transition: { duration: 0.18, ease: "easeOut" },
    };

  return (
    <header className="sticky top-0 z-30 flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-[var(--surface)]/85 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <HamburgerButton
          open={sidebarOpen}
          onClick={onToggleSidebar}
          controls="taskflow-sidebar"
        />

        {/* Current page and workspace */}
        <div className="min-w-0 py-2">
          <p
            className="max-w-full truncate text-[11px] font-medium text-[var(--text-subtle)]"
            title={workspaceName}
          >
            {workspaceName}
          </p>

          <AnimatePresence mode="wait" initial={false}>
            <motion.h1
              key={pageTitle}
              {...titleMotion}
              className="mt-0.5 truncate text-base font-bold tracking-[-0.025em] text-[var(--text)] sm:text-lg"
            >
              {pageTitle}
            </motion.h1>
          </AnimatePresence>
        </div>
      </div>

      {/* Theme toggle + Account menu */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDarkMode ? "light" : "dark"} theme`}
          title={`Switch to ${isDarkMode ? "light" : "dark"} theme`}
          className={iconButtonClass}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDarkMode ? "sun" : "moon"}
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, rotate: -35, scale: 0.7 }
              }
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, rotate: 35, scale: 0.7 }
              }
              transition={{ duration: 0.18 }}
              className="flex items-center justify-center"
            >
              {isDarkMode ? (
                <Sun size={18} strokeWidth={1.8} />
              ) : (
                <Moon size={18} strokeWidth={1.8} />
              )}
            </motion.span>
          </AnimatePresence>
        </button>

        {/* Account menu */}
        <div ref={menuRef} className="relative">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => {
              setLogoutError("");
              setMenuOpen((open) => !open);
            }}
            aria-label="Open account menu"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls="profile-menu"
            title={displayName}
            className={`group inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 pr-2 text-left transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] sm:gap-2.5 sm:pl-2 ${focusRing} ${menuOpen
                ? "border-[var(--primary)] bg-[var(--surface-muted)]"
                : ""
              }`}
          >
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[11px] font-bold text-[var(--primary)] ring-1 ring-inset ring-[var(--border)] sm:size-9"
            >
              {initials}
            </span>

            <span className="hidden min-w-0 text-left sm:block">
              <span className="block max-w-36 truncate text-xs font-semibold text-[var(--text)]">
                {displayName}
              </span>

              <span className="mt-0.5 block max-w-36 truncate text-[11px] text-[var(--text-muted)]">
                {email || "Account settings"}
              </span>
            </span>

            <ChevronDown
              size={15}
              aria-hidden="true"
              className={`hidden shrink-0 text-[var(--text-muted)] transition-transform duration-200 sm:block ${menuOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                id="profile-menu"
                role="menu"
                aria-label="Account menu"
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, y: -6, scale: 0.97 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -6, scale: 0.97 }
                }
                transition={{
                  duration: 0.16,
                  ease: [0.32, 0.72, 0, 1],
                }}
                className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-1.5rem)] origin-top-right rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2.5 text-[var(--text)] shadow-[var(--shadow-md)]"
              >
                <div className="flex min-w-0 items-center gap-3 rounded-xl bg-[var(--surface-muted)] p-3">
                  <span
                    aria-hidden="true"
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-xs font-bold text-[var(--primary)] ring-1 ring-inset ring-[var(--border)]"
                  >
                    {initials}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--text)]">
                      {displayName}
                    </p>

                    {email && (
                      <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                        {email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleViewProfile}
                    className={menuItemClass}
                  >
                    <UserRound
                      size={17}
                      strokeWidth={1.8}
                      className="shrink-0"
                    />
                    View profile
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className={menuItemClass}
                  >
                    <LogOut
                      size={17}
                      strokeWidth={1.8}
                      className="shrink-0"
                    />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>

                {logoutError && (
                  <p
                    role="alert"
                    className="px-3 pb-1 pt-2 text-xs leading-5 text-[var(--danger)]"
                  >
                    {logoutError}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
