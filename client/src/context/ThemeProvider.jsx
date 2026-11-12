import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { flushSync } from "react-dom";
import ThemeContext from "./ThemeContext.jsx";

const THEME_STORAGE_KEY = "theme";
const VALID_PREFERENCES = new Set(["light", "dark", "system"]);

function getStoredPreference() {
  if (typeof window === "undefined") return "system";

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);

    if (stored && VALID_PREFERENCES.has(stored)) {
      return stored;
    }
  } catch {
    // localStorage may be unavailable.
  }

  return "system";
}

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

function applyThemeToDOM(resolvedTheme) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const isDark = resolvedTheme === "dark";

  root.classList.toggle("dark", isDark);
  root.style.colorScheme = resolvedTheme;
}

export function ThemeProvider({ children }) {
  const [themePreference, setThemePreferenceState] = useState(
    getStoredPreference,
  );

  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  const resolvedTheme = useMemo(() => {
    if (themePreference === "light") return "light";
    if (themePreference === "dark") return "dark";

    return systemTheme;
  }, [themePreference, systemTheme]);

  // Apply the theme before the browser paints the updated UI.
  useLayoutEffect(() => {
    applyThemeToDOM(resolvedTheme);
  }, [resolvedTheme]);

  // Listen to operating system theme changes.
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

  // Synchronize theme preferences across browser tabs.
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleStorage = (event) => {
      if (event.key !== THEME_STORAGE_KEY) return;

      const nextPref = event.newValue;

      if (nextPref && VALID_PREFERENCES.has(nextPref)) {
        setThemePreferenceState(nextPref);
      } else if (!nextPref) {
        setThemePreferenceState("system");
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Set an explicit theme preference.
  const setThemePreference = useCallback((nextPref) => {
    if (!VALID_PREFERENCES.has(nextPref)) return;

    setThemePreferenceState(nextPref);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextPref);
    } catch {
      // Ignore storage errors.
    }
  }, []);

  // Animated theme toggle using the View Transition API.
  // `origin` is { x, y } in viewport px (usually the toggle button's center).
  const toggleTheme = useCallback(
    (origin) => {
      if (typeof document === "undefined") return;

      const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
      const root = document.documentElement;

      const prefersReducedMotion =
        window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ??
        false;

      const canAnimate =
        typeof document.startViewTransition === "function" &&
        !prefersReducedMotion;

      const updateTheme = () => {
        flushSync(() => {
          setThemePreferenceState(nextTheme);
          applyThemeToDOM(nextTheme);
        });

        try {
          localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        } catch {
          // Ignore storage errors.
        }
      };

      // Fallback for unsupported browsers or reduced-motion settings.
      if (!canAnimate) {
        updateTheme();
        return;
      }

      // Circular reveal origin.
      if (Number.isFinite(origin?.x) && Number.isFinite(origin?.y)) {
        root.style.setProperty("--theme-origin-x", `${origin.x}px`);
        root.style.setProperty("--theme-origin-y", `${origin.y}px`);
      } else {
        root.style.setProperty("--theme-origin-x", "50vw");
        root.style.setProperty("--theme-origin-y", "50vh");
      }

      // Direction flag read by the CSS (dark → light = reversed animation).
      root.dataset.themeTransition =
        nextTheme === "light" ? "dark-to-light" : "light-to-dark";

      const cleanup = () => {
        root.style.removeProperty("--theme-origin-x");
        root.style.removeProperty("--theme-origin-y");
        delete root.dataset.themeTransition;
      };

      try {
        const transition = document.startViewTransition(updateTheme);

        transition.finished.then(cleanup, cleanup);
      } catch {
        cleanup();
        updateTheme();
      }
    },
    [resolvedTheme],
  );

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