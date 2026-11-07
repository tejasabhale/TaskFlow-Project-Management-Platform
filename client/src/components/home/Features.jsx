import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FolderKanban,
  CalendarClock,
  ChartNoAxesCombined,
  ListTodo,
  SlidersHorizontal,
  Target,
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

export default function Features() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mm = gsap.matchMedia(section);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      /* Background parallax */
      gsap.fromTo(
        ".features-background-pattern",
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

      gsap.fromTo(
        ".features-background-glow",
        { y: -20, scale: 0.98 },
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

      /* Heading reveal */
      gsap.from(".features-reveal", {
        opacity: 0,
        y: 20,
        duration: 0.55,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".features-header",
          start: "top 85%",
          once: true,
        },
      });

      /* Cards reveal, staggered per batch */
      gsap.set(".feature-card", { opacity: 0, y: 20 });

      ScrollTrigger.batch(".feature-card", {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.07,
            ease: "power3.out",
            overwrite: true,
          }),
      });
    });

    return () => mm.revert();
  }, []);

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
          WebkitMaskImage:
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
        {/* Section heading — centered column */}
        <div className="features-header mx-auto flex max-w-3xl flex-col items-center gap-5 pb-10 text-center sm:pb-12">
          <h2
            id="features-heading"
            className="features-reveal font-['Plus_Jakarta_Sans',sans-serif] text-3xl font-extrabold leading-[1.1] tracking-[-0.045em] sm:text-4xl md:text-5xl"
          >
            Everything you need.
            <br className="hidden sm:block" />{" "}
            <span className="text-[var(--primary)]">Nothing you don&apos;t.</span>
          </h2>

          <p className="features-reveal max-w-xl text-sm leading-7 text-[var(--text-muted)] sm:text-base sm:leading-8">
            Good work starts with a clear mind. TaskFlow brings your tasks,
            projects, and priorities together in one simple workspace.
          </p>
        </div>

        {/* Feature cards — no outer container, same bg as the section, equal heights */}
        <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.number}
                className="feature-card group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 transition-[border-color] duration-300 hover:border-[var(--primary)] sm:p-6"
              >
                {/* Icon + number */}
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--primary)] transition-colors duration-300 group-hover:border-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white">
                    <Icon size={22} strokeWidth={1.8} />
                  </div>

                  <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-[var(--text-muted)] transition-colors duration-300 group-hover:border-transparent group-hover:bg-[var(--primary-soft)] group-hover:text-[var(--primary)]">
                    {feature.number}
                  </span>
                </div>

                {/* Card content */}
                <div className="flex flex-1 flex-col items-start">
                  <span className="mb-3 inline-flex rounded-full bg-[var(--surface)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                    {feature.label}
                  </span>

                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-lg font-extrabold leading-snug tracking-[-0.03em] text-[var(--text)] sm:text-xl">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom accent, fills like the board's progress bar */}
                <div className="mt-6 h-1 overflow-hidden rounded-full bg-[var(--border)]">
                  <div className="h-full w-0 rounded-full bg-[var(--primary)] transition-[width] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:w-full motion-reduce:transition-none" />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}