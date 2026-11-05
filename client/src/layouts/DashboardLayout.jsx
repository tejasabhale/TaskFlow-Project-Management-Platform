import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Lenis from "lenis";
import gsap from "gsap";
import "lenis/dist/lenis.css";

import Sidebar from "../components/dashboard/Sidebar";
import AppTopbar from "../components/dashboard/AppTopbar";

export default function DashboardLayout() {
  const location = useLocation();

  // One overlay drawer for every screen size; always starts closed.
  const [open, setOpen] = useState(false);

  const toggleSidebar = useCallback(() => setOpen((previous) => !previous), []);
  const closeSidebar = useCallback(() => setOpen(false), []);

  // Close the drawer after navigating.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Ctrl/Cmd + B toggles the sidebar.
  useEffect(() => {
    const handleShortcut = (event) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "b") {
        return;
      }

      const target = event.target;
      const editing =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

      if (editing) return;

      event.preventDefault();
      toggleSidebar();
    };

    window.addEventListener("keydown", handleShortcut);

    return () => window.removeEventListener("keydown", handleShortcut);
  }, [toggleSidebar]);

  /* ---------- Lenis for the dashboard's own scroll container ---------- */

  const mainRef = useRef(null);
  const contentRef = useRef(null);
  const lenisRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const lenis = new Lenis({
      wrapper: mainRef.current,
      content: contentRef.current,
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Start every page at the top.
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      mainRef.current?.scrollTo({ top: 0 });
    }
  }, [location.pathname]);

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-[var(--surface-muted)] text-[var(--text)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-lg focus:bg-[var(--surface)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--text)] focus:shadow-lg"
      >
        Skip to content
      </a>

      <Sidebar open={open} onClose={closeSidebar} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AppTopbar sidebarOpen={open} onToggleSidebar={toggleSidebar} />

        <main
          ref={mainRef}
          id="main-content"
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain"
        >
          <div
            ref={contentRef}
            className="mx-auto min-h-full w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8"
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}