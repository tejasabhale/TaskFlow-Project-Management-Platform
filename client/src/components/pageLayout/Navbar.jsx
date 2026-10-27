
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckSquare, Sun, Moon } from "lucide-react";

function getInitialTheme() {
  if (typeof window === "undefined") return false;

  try {
    const savedTheme = localStorage.getItem("taskflow-theme");

    if (savedTheme) {
      return savedTheme === "dark";
    }
  } catch {
    // Fall back to system preference.
  }

  return (
    window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false
  );
}

export default function Navbar() {
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);

    try {
      localStorage.setItem(
        "taskflow-theme",
        isDark ? "dark" : "light",
      );
    } catch {
      // Theme switching still works if storage is unavailable.
    }
  }, [isDark]);

  const iconButtonClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg " +
    "text-[var(--text-muted)] transition-colors " +
    "hover:bg-[var(--surface-muted)] hover:text-[var(--text)] " +
    "focus-visible:outline-2 focus-visible:outline-[var(--focus)]";

  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to="/"
          aria-label="TaskFlow home"
          className="flex shrink-0 items-center gap-2.5 no-underline"
          style={{ color: "var(--text)" }}
        >
          <CheckSquare
            size={22}
            strokeWidth={1.9}
            className="text-[var(--primary)]"
          />

          <span className="text-lg font-bold tracking-tight">
            TaskFlow
          </span>
        </Link>

        {/* Authentication and Theme Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sign In */}
          <Link
            to="/login"
            className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium no-underline transition-colors hover:bg-[var(--surface-muted)] focus-visible:outline-2 focus-visible:outline-[var(--focus)] sm:px-4"
            style={{
              color: "var(--text)",
            }}
          >
            Sign In
          </Link>

          {/* Sign Up */}
          <Link
            to="/register"
            className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-semibold no-underline transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--focus)] sm:px-4"
            style={{
              backgroundColor: "var(--primary)",
              color: "#ffffff",
            }}
          >
            Sign Up
          </Link>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setIsDark((current) => !current)}
            aria-label={
              isDark ? "Switch to light mode" : "Switch to dark mode"
            }
            title={isDark ? "Light mode" : "Dark mode"}
            className={iconButtonClass}
          >
            {isDark ? (
              <Sun size={18} strokeWidth={1.8} />
            ) : (
              <Moon size={18} strokeWidth={1.8} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
