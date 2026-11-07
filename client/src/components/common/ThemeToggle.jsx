import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme.js";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]";

export default function ThemeToggle({
  className = "",
  size = 18,
  showLabel = false,
}) {
  const { isDark, toggleTheme, themePreference } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode (currently ${themePreference} mode)`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition-colors duration-200 hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] ${focusRing} ${className}`}
    >
      {isDark ? (
        <Sun size={size} className="text-[var(--primary)] transition-transform duration-200 hover:rotate-45" aria-hidden="true" />
      ) : (
        <Moon size={size} className="text-[var(--primary)] transition-transform duration-200 hover:-rotate-12" aria-hidden="true" />
      )}
      {showLabel && (
        <span className="text-sm font-medium">
          {isDark ? "Light mode" : "Dark mode"}
        </span>
      )}
    </button>
  );
}
