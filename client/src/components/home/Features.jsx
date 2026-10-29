
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowUpRight,
  CheckCircle2,
  FolderKanban,
  CalendarClock,
  ChartNoAxesCombined,
  ListTodo,
  SlidersHorizontal,
  Target,
  Zap,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    number: "01",
    title: "Organize your tasks",
    description:
      "Keep every task in one place. Set priorities, update statuses, and turn a long to-do list into a clear plan.",
    icon: ListTodo,
    label: "Task management",
  },
  {
    number: "02",
    title: "Manage projects",
    description:
      "Break larger goals into manageable tasks and keep all your project work organized in one workspace.",
    icon: FolderKanban,
    label: "Project organization",
  },
  {
    number: "03",
    title: "Stay ahead of deadlines",
    description:
      "Keep track of due dates and upcoming work so important tasks don't get lost in the shuffle.",
    icon: CalendarClock,
    label: "Deadline tracking",
  },
  {
    number: "04",
    title: "Track your progress",
    description:
      "See completed work, monitor your productivity, and understand how you're progressing toward your goals.",
    icon: ChartNoAxesCombined,
    label: "Productivity insights",
  },
  {
    number: "05",
    title: "Focus on what matters",
    description:
      "Prioritize meaningful work, reduce distractions, and spend your time on the tasks that move you forward.",
    icon: Target,
    label: "Smart prioritization",
  },
  {
    number: "06",
    title: "Make it your own",
    description:
      "Keep your workspace comfortable with a clean interface, thoughtful controls, and light and dark themes.",
    icon: SlidersHorizontal,
    label: "Personalized workspace",
  },
];

const revealVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function Features() {
  const sectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || prefersReducedMotion) return;

    const pattern = section.querySelector(".features-background-pattern");
    const glow = section.querySelector(".features-background-glow");

    const ctx = gsap.context(() => {
      if (pattern) {
        gsap.fromTo(
          pattern,
          { y: 0 },
          {
            y: 45,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          },
        );
      }

      if (glow) {
        gsap.fromTo(
          glow,
          {
            y: -20,
            scale: 0.98,
          },
          {
            y: 30,
            scale: 1.04,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          },
        );
      }
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const getRevealProps = (delay = 0, amount = 0.2) => ({
    initial: prefersReducedMotion ? false : "hidden",
    whileInView: prefersReducedMotion ? undefined : "visible",
    custom: delay,
    variants: revealVariants,
    viewport: {
      once: true,
      amount,
    },
  });

  return (
    <section
      ref={sectionRef}
      id="features"
      aria-labelledby="features-heading"
      className="relative isolate overflow-hidden border-y border-[var(--border)] bg-[var(--background)] py-20 text-[var(--text)] sm:py-24 lg:py-28"
    >
      {/* Subtle editorial background */}
      <div
        aria-hidden="true"
        className="features-background-pattern pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: `
            radial-gradient(
              color-mix(in srgb, var(--border-strong) 70%, transparent) 0.7px,
              transparent 0.8px
            ),
            linear-gradient(
              90deg,
              color-mix(in srgb, var(--border) 22%, transparent) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "28px 28px, 56px 100%",
          maskImage:
            "linear-gradient(to bottom, transparent, black 14%, black 82%, transparent)",
          opacity: 0.35,
        }}
      />

      {/* Theme-aware glow */}
      <div
        aria-hidden="true"
        className="features-background-glow pointer-events-none absolute -top-32 left-1/2 -z-10 h-80 w-[680px] max-w-full -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse, color-mix(in srgb, var(--primary) 9%, transparent), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Section heading */}
        <motion.div
          {...getRevealProps(0, 0.25)}
          className="grid gap-6 border-b border-[var(--border)] pb-8 sm:grid-cols-[100px_minmax(0,1fr)] sm:gap-8 sm:pb-10"
        >
          <div className="flex items-start gap-3 pt-1">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[var(--primary)]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--text-subtle)] sm:text-[11px]">
              Features
            </span>
          </div>

          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              <Zap size={13} className="text-[var(--primary)]" />
              Built for better work
            </div>

            <h2
              id="features-heading"
              className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl font-bold leading-[1.1] tracking-[-0.045em] sm:text-4xl md:text-5xl"
            >
              Everything you need.
              <br className="hidden sm:block" />{" "}
              <span className="font-['Instrument_Serif',serif] font-normal italic tracking-[-0.015em] text-[var(--primary)]">
                Nothing you don&apos;t.
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--text-muted)] sm:text-base sm:leading-8">
              Good work starts with a clear mind. TaskFlow brings your tasks,
              projects, and priorities together in one simple workspace.
            </p>
          </div>
        </motion.div>

        {/* Feature cards */}
        <div className="mt-8 grid grid-cols-1 gap-0 border-l border-t border-[var(--border)] sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.number}
                {...getRevealProps((index % 3) * 0.07, 0.15)}
                className="group relative flex min-h-[250px] min-w-0 flex-col border-b border-r border-[var(--border)] bg-[var(--surface)] p-5 transition-colors duration-200 hover:bg-[var(--surface-muted)] sm:p-6 lg:p-7"
              >
                {/* Number and icon */}
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center border border-[var(--border)] bg-[var(--background)] text-[var(--primary)] transition-colors duration-200 group-hover:border-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-[var(--text-inverse)]">
                    <Icon size={20} strokeWidth={1.7} />
                  </div>

                  <span className="font-mono text-xs tabular-nums text-[var(--text-subtle)]">
                    / {feature.number}
                  </span>
                </div>

                {/* Card content */}
                <div className="flex-1">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
                    {feature.label}
                  </p>

                  <h3 className="max-w-sm font-['Plus_Jakarta_Sans',sans-serif] text-lg font-bold leading-snug tracking-[-0.025em] text-[var(--text)] sm:text-xl">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                    {feature.description}
                  </p>
                </div>

                {/* Corner indicator */}
                <div className="pointer-events-none absolute right-6 top-6 text-[var(--primary)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <ArrowUpRight size={16} />
                </div>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 h-px w-0 bg-[var(--primary)] transition-[width] duration-300 ease-out group-hover:w-full" />
              </motion.article>
            );
          })}
        </div>

        {/* Closing statement */}
        <motion.div
          {...getRevealProps(0, 0.15)}
          className="mt-8 flex flex-col items-start gap-4 border-b border-[var(--border)] py-6 sm:flex-row sm:items-center sm:gap-5"
        >
          <CheckCircle2
            size={19}
            className="shrink-0 text-[var(--success)]"
          />

          <p className="text-sm font-medium leading-6 text-[var(--text-muted)]">
            Less time managing tasks. More time making progress.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
