import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Check,
  FolderKanban,
  CalendarClock,
  ChartNoAxesCombined,
  ListTodo,
  Moon,
  SlidersHorizontal,
  Sun,
  Target,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/* -------------------------------------------------------------------------- */
/* Shared animation helpers                                                   */
/* -------------------------------------------------------------------------- */

const EASE = [0.4, 0, 0.2, 1]; // smooth in-out, no bounce
const MOVE = { duration: 0.8, ease: EASE };

/**
 * Steps through 0..count-1 forever. Runs only while the scene is on screen and the
 * tab is visible, and resumes from the same step. The last step animates back to the
 * first, so the loop never snaps. With reduced motion it stays on the final step.
 */
function useCycle(count, ms) {
  const ref = useRef(null);
  const [reduce] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [step, setStep] = useState(reduce ? count - 1 : 0);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onChange = () => setTabVisible(!document.hidden);
    onChange();
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  const running = inView && tabVisible && !reduce;

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setStep((s) => (s + 1) % count), ms);
    return () => clearInterval(id);
  }, [running, count, ms]);

  return [ref, step];
}

/* Fixed-size frame so every card keeps the same height */
function Scene({ count, ms = 1400, children }) {
  const [ref, step] = useCycle(count, ms);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="mb-5 h-32 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"
    >
      {children(step)}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Scenes (each is a pure function of the current step)                       */
/* -------------------------------------------------------------------------- */

/* 01 · tasks tick off one by one */
const TASK_ROWS = ["Launch checklist", "Assign owners", "Publish page"];

function TasksScene() {
  return (
    <Scene count={4}>
      {(step) => (
        <div className="space-y-2">
          {TASK_ROWS.map((title, i) => {
            const done = i < step;

            return (
              <div
                key={title}
                className="flex h-7 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-2"
              >
                <span className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)]">
                  <motion.span
                    initial={false}
                    animate={{ scale: done ? 1 : 0, opacity: done ? 1 : 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 24 }}
                    className="absolute -inset-px flex items-center justify-center rounded-full"
                    style={{ backgroundColor: "var(--primary)", color: "#ffffff" }}
                  >
                    <Check size={9} strokeWidth={3.5} />
                  </motion.span>
                </span>

                <span
                  className={`truncate text-[11px] font-semibold transition-colors duration-500 ${done
                      ? "text-[var(--text-muted)] line-through"
                      : "text-[var(--text)]"
                    }`}
                >
                  {title}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Scene>
  );
}

/* 02 · project bars fill up */
const PROJECT_ROWS = ["Website relaunch", "Mobile app", "Q4 report"];
const PROJECT_PROGRESS = [
  [25, 10, 0],
  [60, 35, 20],
  [100, 70, 55],
  [100, 100, 90],
];

function ProjectsScene() {
  return (
    <Scene count={PROJECT_PROGRESS.length}>
      {(step) => (
        <div className="space-y-3">
          {PROJECT_ROWS.map((name, i) => {
            const value = PROJECT_PROGRESS[step][i];

            return (
              <div key={name}>
                <div className="mb-1 flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-[var(--text)]">{name}</span>
                  <span className="tabular-nums text-[var(--text-muted)]">{value}%</span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                  <motion.div
                    initial={false}
                    animate={{ width: `${value}%` }}
                    transition={MOVE}
                    className="h-full rounded-full"
                    style={{ backgroundColor: "var(--primary)" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Scene>
  );
}

/* 03 · a marker steps across the week toward the due day */
const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DUE_DAY = 3;

function DeadlinesScene() {
  return (
    <Scene count={WEEK.length} ms={1200}>
      {(step) => {
        const chip =
          step === DUE_DAY
            ? "Due today"
            : step < DUE_DAY
              ? `Due in ${DUE_DAY - step}d`
              : "Completed";

        return (
          <div className="flex h-full flex-col justify-between">
            <div className="relative grid grid-cols-5">
              <motion.span
                aria-hidden="true"
                initial={false}
                animate={{ left: `${step * 20}%` }}
                transition={MOVE}
                className="absolute top-0 h-full w-1/5 rounded-lg"
                style={{ backgroundColor: "var(--primary-soft)" }}
              />

              {WEEK.map((day, i) => (
                <div
                  key={day}
                  className="relative flex flex-col items-center gap-2 py-2.5"
                >
                  <span
                    className={`text-[10px] font-semibold transition-colors duration-500 ${i === step ? "text-[var(--primary)]" : "text-[var(--text-subtle)]"
                      }`}
                  >
                    {day}
                  </span>
                  <span
                    className="h-2 w-2 rounded-full border"
                    style={{
                      borderColor:
                        i === DUE_DAY ? "var(--primary)" : "var(--border-strong)",
                      backgroundColor: i === DUE_DAY ? "var(--primary)" : "transparent",
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-[10px]">
              <span className="font-semibold text-[var(--text)]">Publish page</span>
              <span className="tabular-nums text-[var(--primary)]">{chip}</span>
            </div>
          </div>
        );
      }}
    </Scene>
  );
}

/* 04 · weekly bars grow and shrink */
const BAR_SETS = [
  [35, 55, 42, 70, 50, 80, 60],
  [50, 40, 68, 55, 78, 62, 85],
  [60, 72, 55, 85, 66, 90, 74],
  [45, 62, 70, 60, 88, 70, 95],
];

function ProgressScene() {
  return (
    <Scene count={BAR_SETS.length} ms={1500}>
      {(step) => (
        <div className="flex h-full flex-col">
          <div className="mb-2 flex items-center justify-between text-[10px]">
            <span className="font-semibold text-[var(--text)]">This week</span>
            <span className="tabular-nums text-[var(--text-muted)]">
              {Math.round(BAR_SETS[step].reduce((a, b) => a + b, 0) / BAR_SETS[step].length)}%
            </span>
          </div>

          <div className="flex flex-1 items-end justify-around gap-1.5">
            {BAR_SETS[step].map((height, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{ height: `${height}%` }}
                transition={MOVE}
                className="w-full max-w-5 rounded-md"
                style={{
                  backgroundColor:
                    i === BAR_SETS[step].length - 1
                      ? "var(--primary)"
                      : "var(--border-strong)",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </Scene>
  );
}

/* 05 · priorities reorder, the top one is the focus */
const FOCUS_ITEMS = {
  proposal: "Client proposal",
  report: "Weekly report",
  inbox: "Clear inbox",
};
const FOCUS_ORDERS = [
  ["proposal", "report", "inbox"],
  ["inbox", "proposal", "report"],
  ["report", "inbox", "proposal"],
];

function FocusScene() {
  return (
    <Scene count={FOCUS_ORDERS.length} ms={1700}>
      {(step) => (
        <div className="space-y-2">
          {FOCUS_ORDERS[step].map((id, index) => (
            <motion.div
              key={id}
              layout
              transition={MOVE}
              className={`flex h-7 items-center justify-between gap-2 rounded-md border bg-[var(--background)] px-2 transition-colors duration-500 ${index === 0 ? "border-[var(--primary)]" : "border-[var(--border)]"
                }`}
            >
              <span
                className={`truncate text-[11px] font-semibold transition-colors duration-500 ${index === 0 ? "text-[var(--text)]" : "text-[var(--text-muted)]"
                  }`}
              >
                {FOCUS_ITEMS[id]}
              </span>

              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold transition-opacity duration-500 ${index === 0 ? "opacity-100" : "opacity-0"
                  }`}
                style={{ backgroundColor: "var(--primary-soft)", color: "var(--primary)" }}
              >
                Focus
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </Scene>
  );
}

/* 06 · theme toggle flips a mini workspace between light and dark */
const THEMES = [
  { bg: "#ffffff", line: "#e5e7eb", text: "#111827", muted: "#9ca3af" },
  { bg: "#17171a", line: "#2a2a30", text: "#f4f4f5", muted: "#71717a" },
];

function ThemeScene() {
  return (
    <Scene count={2} ms={2000}>
      {(step) => {
        const dark = step === 1;
        const theme = THEMES[step];

        return (
          <div className="flex h-full items-center gap-3">
            {/* mini workspace */}
            <div
              className="h-full flex-1 rounded-lg border p-2.5 transition-colors duration-700"
              style={{ backgroundColor: theme.bg, borderColor: theme.line }}
            >
              <div
                className="mb-2 h-2 w-1/2 rounded-full transition-colors duration-700"
                style={{ backgroundColor: theme.text }}
              />
              <div
                className="mb-1.5 h-1.5 w-full rounded-full transition-colors duration-700"
                style={{ backgroundColor: theme.line }}
              />
              <div
                className="mb-3 h-1.5 w-3/4 rounded-full transition-colors duration-700"
                style={{ backgroundColor: theme.line }}
              />
              <div className="flex items-center gap-1.5">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: "var(--primary)" }}
                />
                <div
                  className="h-1.5 w-1/3 rounded-full transition-colors duration-700"
                  style={{ backgroundColor: theme.muted }}
                />
              </div>
            </div>

            {/* toggle */}
            <div className="flex shrink-0 flex-col items-center gap-2">
              <span className="text-[var(--text-subtle)]">
                {dark ? <Moon size={14} /> : <Sun size={14} />}
              </span>

              <span
                className="flex h-5 w-9 items-center rounded-full px-0.5 transition-colors duration-500"
                style={{
                  backgroundColor: dark ? "var(--primary)" : "var(--border-strong)",
                }}
              >
                <motion.span
                  initial={false}
                  animate={{ x: dark ? 16 : 0 }}
                  transition={MOVE}
                  className="h-4 w-4 rounded-full bg-white"
                />
              </span>
            </div>
          </div>
        );
      }}
    </Scene>
  );
}

/* -------------------------------------------------------------------------- */
/* Data                                                                       */
/* -------------------------------------------------------------------------- */

const features = [
  {
    number: "01",
    title: "Organize your tasks",
    description:
      "Keep every task in one place. Set priorities, update statuses, and turn a long to-do list into a clear plan.",
    icon: ListTodo,
    label: "Task management",
    Scene: TasksScene,
  },
  {
    number: "02",
    title: "Manage projects",
    description:
      "Break larger goals into manageable tasks and keep all your project work organized in one workspace.",
    icon: FolderKanban,
    label: "Project organization",
    Scene: ProjectsScene,
  },
  {
    number: "03",
    title: "Stay ahead of deadlines",
    description:
      "Keep track of due dates and upcoming work so important tasks don't get lost in the shuffle.",
    icon: CalendarClock,
    label: "Deadline tracking",
    Scene: DeadlinesScene,
  },
  {
    number: "04",
    title: "Track your progress",
    description:
      "See completed work, monitor your productivity, and understand how you're progressing toward your goals.",
    icon: ChartNoAxesCombined,
    label: "Productivity insights",
    Scene: ProgressScene,
  },
  {
    number: "05",
    title: "Focus on what matters",
    description:
      "Prioritize meaningful work, reduce distractions, and spend your time on the tasks that move you forward.",
    icon: Target,
    label: "Smart prioritization",
    Scene: FocusScene,
  },
  {
    number: "06",
    title: "Make it your own",
    description:
      "Keep your workspace comfortable with a clean interface, thoughtful controls, and light and dark themes.",
    icon: SlidersHorizontal,
    label: "Personalized workspace",
    Scene: ThemeScene,
  },
];

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

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
            const FeatureScene = feature.Scene;

            return (
              <article
                key={feature.number}
                className="feature-card group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 transition-[border-color] duration-300 hover:border-[var(--primary)] sm:p-6"
              >
                {/* Icon + number */}
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--primary)] transition-colors duration-300 group-hover:border-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white">
                    <Icon size={22} strokeWidth={1.8} />
                  </div>

                  <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-[var(--text-muted)] transition-colors duration-300 group-hover:border-transparent group-hover:bg-[var(--primary-soft)] group-hover:text-[var(--primary)]">
                    {feature.number}
                  </span>
                </div>

                {/* Animated preview, loops forever and pauses off screen */}
                <FeatureScene />

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