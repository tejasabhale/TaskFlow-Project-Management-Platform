
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUp,
  CheckSquare,
  ListTodo,
  FolderKanban,
  CalendarDays,
} from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Dashboard", to: "/" },
    { label: "Tasks", to: "/tasks" },
    { label: "Projects", to: "/projects" },
    { label: "Calendar", to: "/calendar" },
  ],
  Explore: [
    { label: "Features", to: "/#features" },
    { label: "Get started", to: "/register" },
    { label: "Sign in", to: "/login" },
  ],
};

const footerFeatures = [
  { label: "Task management", Icon: ListTodo },
  { label: "Project planning", Icon: FolderKanban },
  { label: "Daily organization", Icon: CalendarDays },
];

export default function Footer() {
  const prefersReducedMotion = useReducedMotion();

  const scrollToTop = () => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (window.lenis) {
      window.lenis.scrollTo(0, {
        immediate: reducedMotion,
        duration: reducedMotion ? 0 : 1.2,
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    }
  };

  const reveal = (delay = 0) => ({
    initial: prefersReducedMotion ? false : { opacity: 0, y: 16 },
    whileInView: prefersReducedMotion ? undefined : { opacity: 1, y: 0 },
    viewport: {
      once: false,
      amount: 0.15,
    },
    transition: {
      duration: 0.5,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  });

  return (
    <footer className="relative isolate mt-auto overflow-hidden border-t border-[var(--border)] bg-[var(--background)] text-[var(--text)]">
      {/* Subtle editorial background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(var(--border-strong) 0.7px, transparent 0.8px)",
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(to bottom, black, transparent 85%)",
        }}
      />

      {/* Restrained theme accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-80 w-[600px] max-w-full -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse, color-mix(in srgb, var(--primary) 7%, transparent), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Main footer */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12 sm:py-16 lg:grid-cols-12 lg:gap-8 lg:py-20">
          {/* Brand and description */}
          <motion.div
            {...reveal()}
            className="min-w-0 sm:col-span-2 lg:col-span-5"
          >
            <Link
              to="/"
              aria-label="TaskFlow home"
              className="group inline-flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]"
              style={{ color: "var(--text)" }}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--border)] bg-[var(--surface)] transition-colors duration-200 group-hover:border-[var(--primary)] group-hover:bg-[var(--primary-soft)]">
                <CheckSquare
                  size={22}
                  strokeWidth={1.8}
                  className="text-[var(--primary)]"
                />
              </span>

              <span className="text-xl font-bold tracking-[-0.04em]">
                TaskFlow
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--text-muted)]">
              Less time managing work. More time making progress. Bring your
              tasks and projects together in one clear workspace.
            </p>

            {/* Product capabilities */}
            <div className="mt-7 flex max-w-sm flex-col border-t border-[var(--border)] pt-4">
              {footerFeatures.map(({ label, Icon }) => (
                <div
                  key={label}
                  className="flex min-h-10 items-center gap-3 border-b border-[var(--border)] py-2.5 text-xs text-[var(--text-muted)] last:border-b-0 sm:text-sm"
                >
                  <Icon
                    size={16}
                    strokeWidth={1.7}
                    className="shrink-0 text-[var(--primary)]"
                  />

                  <span>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Navigation columns */}
          {Object.entries(footerLinks).map(([heading, links], index) => (
            <motion.div
              key={heading}
              {...reveal((index + 1) * 0.08)}
              className={`min-w-0 ${
                index === 0
                  ? "lg:col-span-3 lg:col-start-7"
                  : "lg:col-span-3 lg:col-start-10"
              }`}
            >
              <h2 className="mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-subtle)] sm:text-[11px]">
                <span className="h-1.5 w-1.5 bg-[var(--primary)]" />
                {heading}
              </h2>

              <nav
                aria-label={`${heading} links`}
                className="flex flex-col items-start"
              >
                {links.map(({ label, to }) => (
                  <Link
                    key={label}
                    to={to}
                    className="group flex min-h-11 w-full items-center justify-between gap-3 border-b border-[var(--border)] py-3 text-sm text-[var(--text-muted)] transition-colors duration-200 last:border-b-0 hover:text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
                  >
                    <span>{label}</span>

                    <ArrowRight
                      size={14}
                      className="shrink-0 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  </Link>
                ))}
              </nav>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <motion.div
          {...reveal()}
          className="flex flex-col gap-5 border-t border-[var(--border)] py-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="mb-0 text-xs leading-6 text-[var(--text-subtle)]">
            © {new Date().getFullYear()} TaskFlow. Built for better work.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-5 sm:justify-end">
            <span className="text-xs text-[var(--text-subtle)]">
              Plan less. Achieve more.
            </span>

            <button
              type="button"
              onClick={scrollToTop}
              className="group inline-flex min-h-10 shrink-0 items-center gap-3 border border-[var(--border)] bg-[var(--surface)] px-4 text-xs font-medium text-[var(--text-muted)] transition-colors duration-200 hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]"
            >
              Back to top

              <ArrowUp
                size={14}
                className="transition-transform duration-200 group-hover:-translate-y-0.5"
              />
            </button>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
