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
    initial: prefersReducedMotion ? false : { opacity: 0, y: 18 },
    whileInView: prefersReducedMotion ? undefined : { opacity: 1, y: 0 },
    viewport: {
      once: false,
      amount: 0.15,
    },
    transition: {
      duration: 0.55,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  });

  return (
    <footer className="relative isolate mt-auto overflow-hidden border-t border-[var(--border)] bg-[var(--background)] text-[var(--text)]">
      {/* Background pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(var(--border-strong) 0.8px, transparent 0.8px)",
          backgroundSize: "24px 24px",
          maskImage: "linear-gradient(to bottom, black, transparent 90%)",
        }}
      />

      {/* Soft theme-colored glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-80 w-[600px] max-w-full -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, color-mix(in srgb, var(--primary) 10%, transparent), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Main footer */}
        <div className="grid gap-12 py-14 sm:py-16 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-16 lg:py-20">
          {/* Brand and description */}
          <motion.div {...reveal()}>
            <Link
              to="/"
              aria-label="TaskFlow home"
              className="inline-flex items-center gap-2.5"
              style={{ color: "var(--text)" }}
            >
              <CheckSquare
                size={23}
                strokeWidth={1.9}
                className="text-[var(--primary)]"
              />

              <span className="text-xl font-bold tracking-tight">TaskFlow</span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--text-muted)]">
              Less time managing work. More time making progress. Bring your
              tasks and projects together in one clear workspace.
            </p>

            {/* Product capabilities */}
            <div className="mt-6 flex flex-col gap-3">
              {footerFeatures.map(({ label, Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 text-xs text-[var(--text-subtle)] sm:text-sm"
                >
                  <Icon
                    size={15}
                    strokeWidth={1.8}
                    className="shrink-0 text-[var(--primary)]"
                  />
                  {label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Navigation columns */}
          {Object.entries(footerLinks).map(([heading, links], index) => (
            <motion.div key={heading} {...reveal((index + 1) * 0.08)}>
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-subtle)]">
                {heading}
              </h2>

              <nav
                aria-label={`${heading} links`}
                className="flex flex-col items-start gap-4"
              >
                {links.map(({ label, to }) => (
                  <Link
                    key={label}
                    to={to}
                    className="group inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--primary)]"
                  >
                    {label}
                    <ArrowRight
                      size={13}
                      className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
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

          <div className="flex items-center justify-between gap-5 sm:justify-end">
            <span className="text-xs text-[var(--text-subtle)]">
              Plan less. Achieve more.
            </span>

            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-xs font-medium text-[var(--text-muted)] transition-colors duration-200 hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] hover:text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]"
            >
              Back to top
              <ArrowUp size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
