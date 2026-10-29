import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, UserRound } from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import { useWorkspace } from "../../context/WorkspaceContext.jsx";

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

const menuItemClass =
  "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium " +
  "text-[var(--text-muted)] transition-colors duration-150 " +
  "hover:bg-[var(--surface-muted)] hover:text-[var(--text)] " +
  "disabled:cursor-not-allowed disabled:opacity-60 " +
  focusRing;

export default function AppTopbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentWorkspace, loading } = useWorkspace();

  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const pageTitle =
    pageTitles.find(({ path }) => location.pathname.startsWith(path))?.title ||
    "Overview";

  const displayName =
    user?.fullName || user?.userName || user?.name || "My Account";

  const email = user?.email || "";
  const initials = getInitials(displayName);

  const workspaceName = loading
    ? "Loading..."
    : currentWorkspace?.name || "No workspace selected";

  // Close the menu after navigating anywhere.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close on outside click or Escape while the menu is open.
  useEffect(() => {
    if (!menuOpen) return;

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

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
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

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)]/90 pl-16 pr-4 backdrop-blur supports-[backdrop-filter]:bg-[var(--surface)]/80 sm:pr-6 md:pl-8 lg:px-8">
      {/* Page title (left padding on mobile leaves room for the sidebar toggle) */}
      <div className="min-w-0">
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-subtle)]">
          {workspaceName}
        </p>
        <h1 className="truncate font-['Plus_Jakarta_Sans',sans-serif] text-lg font-bold tracking-[-0.03em] text-[var(--text)]">
          {pageTitle}
        </h1>
      </div>

      {/* Profile menu */}
      <div ref={menuRef} className="relative shrink-0">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Open profile menu"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls="profile-menu"
          title={displayName}
          className={`flex size-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-xs font-bold text-[var(--primary)] ring-1 ring-inset transition-[box-shadow,transform] duration-200 ease-out active:scale-95 motion-reduce:transition-none ${focusRing} ${menuOpen
              ? "ring-[var(--primary)]"
              : "ring-[var(--border)] hover:ring-[var(--primary)]"
            }`}
        >
          {initials}
        </button>

        <div
          id="profile-menu"
          role="menu"
          aria-label="Profile menu"
          aria-hidden={!menuOpen}
          className={`absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] origin-top-right rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text)] shadow-2xl transition-[opacity,transform,visibility] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${menuOpen
              ? "visible translate-y-0 scale-100 opacity-100"
              : "invisible -translate-y-1 scale-95 opacity-0"
            }`}
        >
          {/* Profile summary */}
          <div className="flex items-center gap-3 rounded-xl bg-[var(--surface-muted)] p-3">
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-sm font-bold text-[var(--primary)] ring-1 ring-inset ring-[var(--border)]"
            >
              {initials}
            </span>

            <div className="min-w-0">
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

          {/* Actions */}
          <div className="mt-2 space-y-0.5">
            <button
              type="button"
              role="menuitem"
              tabIndex={menuOpen ? 0 : -1}
              onClick={handleViewProfile}
              className={menuItemClass}
            >
              <UserRound size={18} strokeWidth={1.8} className="shrink-0" />
              View profile
            </button>

            <button
              type="button"
              role="menuitem"
              tabIndex={menuOpen ? 0 : -1}
              onClick={handleLogout}
              disabled={loggingOut}
              className={menuItemClass}
            >
              <LogOut size={18} strokeWidth={1.8} className="shrink-0" />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>

          {logoutError && (
            <p
              role="alert"
              className="px-3 pb-1 pt-2 text-xs leading-5 text-[var(--danger,#dc2626)]"
            >
              {logoutError}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}