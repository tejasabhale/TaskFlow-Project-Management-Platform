
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
      localStorage.setItem("taskflow-theme", isDark ? "dark" : "light");
    } catch {
      // Theme switching still works if storage is unavailable.
    }
  }, [isDark]);

  const iconButtonClass =
    "inline-flex h-10 w-10 shrink-0 items-center justify-center " +
    "border border-[var(--border)] text-[var(--text-muted)] " +
    "transition-colors duration-200 " +
    "hover:border-[var(--primary)] hover:bg-[var(--surface-muted)] " +
    "hover:text-[var(--primary)] " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "focus-visible:outline-[var(--focus)]";

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--surface)]"
    >
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-5 sm:h-[72px] sm:px-8 lg:px-12">
        {/* Brand */}
        <Link
          to="/"
          aria-label="TaskFlow home"
          className="group flex min-w-0 shrink-0 items-center gap-3 no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]"
          style={{ color: "var(--text)" }}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--border)] bg-[var(--surface-muted)] transition-colors duration-200 group-hover:border-[var(--primary)] group-hover:bg-[var(--primary-soft)]">
            <CheckSquare
              size={21}
              strokeWidth={1.8}
              className="text-[var(--primary)]"
            />
          </span>

          <span className="flex min-w-0 flex-col">
            <span className="font-['Plus_Jakarta_Sans',sans-serif] text-base font-bold tracking-[-0.035em] sm:text-lg">
              TaskFlow
            </span>

            <span className="mt-0.5 hidden text-[9px] font-mono uppercase tracking-[0.14em] text-[var(--text-subtle)] sm:block">
              Plan with purpose
            </span>
          </span>
        </Link>

        {/* Authentication and theme actions */}
        <nav
          aria-label="Account navigation"
          className="flex shrink-0 items-center gap-2 sm:gap-3"
        >
          {/* Sign In */}
          <Link
            to="/login"
            className="inline-flex h-10 items-center justify-center px-3 text-xs font-semibold text-[var(--text)] no-underline transition-colors duration-200 hover:text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] sm:px-4 sm:text-sm"
          >
            Sign In
          </Link>

          {/* Sign Up */}
          <Link
            to="/register"
            className="group inline-flex h-10 items-center justify-center gap-2 border border-[var(--primary)] px-3 text-xs font-semibold no-underline transition-colors duration-200 hover:border-[var(--primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] sm:gap-3 sm:px-5 sm:text-sm"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--text-inverse)",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor =
                "var(--primary-hover)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = "var(--primary)";
            }}
          >
            Sign Up

            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              ↗
            </span>
          </Link>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setIsDark((current) => !current)}
            aria-label={
              isDark ? "Switch to light mode" : "Switch to dark mode"
            }
            aria-pressed={isDark}
            title={isDark ? "Light mode" : "Dark mode"}
            className={iconButtonClass}
          >
            {isDark ? (
              <Sun size={18} strokeWidth={1.8} />
            ) : (
              <Moon size={18} strokeWidth={1.8} />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
