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
    y: 24,
  },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
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
      // Move the background more slowly than the page scroll.
      // ScrollTrigger reverses this naturally when scrolling upward.
      gsap.fromTo(
        pattern,
        { y: 0 },
        {
          y: 65,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      );

      // Subtle scroll-linked movement for the theme-colored glow.
      gsap.fromTo(
        glow,
        {
          y: -25,
          scale: 0.96,
        },
        {
          y: 45,
          scale: 1.05,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const getRevealProps = (delay = 0, amount = 0.2) => ({
    initial: prefersReducedMotion ? false : "hidden",
    whileInView: prefersReducedMotion ? undefined : "visible",
    custom: delay,
    variants: revealVariants,
    viewport: {
      once: false,
      amount,
    },
  });

  return (
    <section
      ref={sectionRef}
      id="features"
      aria-labelledby="features-heading"
      className="relative isolate overflow-hidden bg-[var(--background)] py-20 text-[var(--text)] sm:py-24 lg:py-28"
    >
      {/* Scroll-responsive background pattern */}
      <div
        aria-hidden="true"
        className="features-background-pattern pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: `
            radial-gradient(
              var(--border-strong) 0.8px,
              transparent 0.8px
            ),
            linear-gradient(
              90deg,
              color-mix(in srgb, var(--border) 25%, transparent) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "24px 24px, 48px 100%",
          maskImage:
            "linear-gradient(to bottom, transparent, black 18%, black 72%, transparent)",
          opacity: 0.35,
        }}
      />

      {/* Theme-aware background glow */}
      <div
        aria-hidden="true"
        className="features-background-glow pointer-events-none absolute -top-32 left-1/2 -z-10 h-80 w-[700px] max-w-full -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, color-mix(in srgb, var(--primary) 10%, transparent), transparent 70%)",
        }}
      />

      {/* Main container */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section heading */}
        <motion.div
          {...getRevealProps(0, 0.25)}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-xs font-semibold text-[var(--text-muted)]">
            <Zap size={14} className="text-[var(--primary)]" />
            BUILT FOR BETTER WORK
          </div>

          <h2
            id="features-heading"
            className="text-3xl font-bold leading-tight tracking-[-0.045em] sm:text-4xl md:text-5xl"
          >
            Everything you need.
            <br className="hidden sm:block" />{" "}
            <span className="text-[var(--primary)]">Nothing you don't.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm font-normal leading-7 text-[var(--text-muted)] sm:text-base sm:leading-8">
            Good work starts with a clear mind. TaskFlow brings your tasks,
            projects, and priorities together in one simple workspace.
          </p>
        </motion.div>

        {/* Feature cards */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.number}
                {...getRevealProps((index % 3) * 0.08, 0.18)}
                className="group relative flex min-h-[235px] flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-colors duration-200 hover:border-[var(--border-strong)] sm:p-7"
              >
                {/* Card top row */}
                <div className="mb-7 flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] transition-colors duration-200 group-hover:bg-[var(--primary)] group-hover:text-[var(--text-inverse)]">
                    <Icon size={21} strokeWidth={1.8} />
                  </div>

                  <span className="font-mono text-xs text-[var(--text-subtle)]">
                    {feature.number}
                  </span>
                </div>

                {/* Card content */}
                <div className="flex-1">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--text-subtle)]">
                    {feature.label}
                  </p>

                  <h3 className="text-lg font-bold tracking-tight text-[var(--text)]">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm font-normal leading-7 text-[var(--text-muted)]">
                    {feature.description}
                  </p>
                </div>

                {/* Subtle corner indicator */}
                <div className="absolute right-6 top-[76px] text-[var(--text-subtle)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:right-7">
                  <ArrowUpRight size={16} />
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Closing statement */}
        <motion.div
          {...getRevealProps(0, 0.15)}
          className="mt-10 flex flex-col items-center justify-center gap-3 border-t border-[var(--border)] pt-7 text-center sm:flex-row sm:gap-4"
        >
          <CheckCircle2 size={18} className="text-[var(--success)]" />

          <p className="text-sm font-medium text-[var(--text-muted)]">
            Less time managing tasks. More time making progress.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
