import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import ThemeContext from "./ThemeContext.jsx";

const THEME_STORAGE_KEY = "theme";
const VALID_PREFERENCES = new Set(["light", "dark", "system"]);

/**
 * Safely retrieve stored preference from localStorage.
 * Defaults to "system" when unconfigured or invalid.
 */
function getStoredPreference() {
  if (typeof window === "undefined") return "system";

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && VALID_PREFERENCES.has(stored)) {
      return stored;
    }
  } catch {
    // localStorage might be unavailable in sandboxed environments or private browsing
  }

  return "system";
}

/**
 * Check if the host OS/browser currently prefers dark mode.
 */
function getSystemTheme() {
  if (typeof window === "undefined") return "light";

  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

/**
 * Apply the resolved theme to the <html> root element.
 */
function applyThemeToDOM(resolvedTheme) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const isDark = resolvedTheme === "dark";

  root.classList.toggle("dark", isDark);
  root.style.colorScheme = resolvedTheme;
}

export function ThemeProvider({ children }) {
  const [themePreference, setThemePreferenceState] = useState(getStoredPreference);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  // Compute the resolved active theme
  const resolvedTheme = useMemo(() => {
    if (themePreference === "light") return "light";
    if (themePreference === "dark") return "dark";
    return systemTheme;
  }, [themePreference, systemTheme]);

  // Apply to DOM whenever resolved theme changes
  useEffect(() => {
    applyThemeToDOM(resolvedTheme);
  }, [resolvedTheme]);

  // Listen to OS system color scheme changes
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (event) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Listen to storage events to synchronize across browser tabs
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleStorage = (event) => {
      if (event.key === THEME_STORAGE_KEY) {
        const nextPref = event.newValue;
        if (nextPref && VALID_PREFERENCES.has(nextPref)) {
          setThemePreferenceState(nextPref);
        } else if (!nextPref) {
          setThemePreferenceState("system");
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Set explicit preference ("light", "dark", or "system")
  const setThemePreference = useCallback((nextPref) => {
    if (!VALID_PREFERENCES.has(nextPref)) return;

    setThemePreferenceState(nextPref);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextPref);
    } catch {
      // Ignore storage write errors (e.g. quota or security policy)
    }
  }, []);

  // Simple toggle between light and dark
  const toggleTheme = useCallback(() => {
    setThemePreference(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setThemePreference]);

  const value = useMemo(
    () => ({
      theme: resolvedTheme,
      themePreference,
      isDark: resolvedTheme === "dark",
      setThemePreference,
      toggleTheme,
    }),
    [resolvedTheme, themePreference, setThemePreference, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export default ThemeProvider;
