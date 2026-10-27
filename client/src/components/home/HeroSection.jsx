import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  CheckSquare,
  Circle,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  MoreHorizontal,
  Plus,
  Search,
  TrendingUp,
} from "lucide-react";

const tasks = [
  {
    title: "Finalize landing page",
    category: "Design",
    completed: true,
  },
  {
    title: "Review project proposal",
    category: "Work",
    completed: false,
  },
  {
    title: "Prepare weekly report",
    category: "Planning",
    completed: false,
  },
];

const primaryButtonStyle = {
  backgroundColor: "var(--primary)",
  color: "var(--text-inverse)",
};

export default function HeroSection() {
  const heroRef = useRef(null);

  useEffect(() => {
    const root = heroRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          defaults: { ease: "power3.out" },
        })
        .from(".hero-reveal", {
          opacity: 0,
          y: 18,
          duration: 0.65,
          stagger: 0.1,
        })
        .from(
          ".hero-dashboard",
          {
            opacity: 0,
            y: 28,
            duration: 0.8,
          },
          "-=0.25",
        )
        .fromTo(
          ".hero-progress-fill",
          { width: "0%" },
          {
            width: "76%",
            duration: 1,
            ease: "power2.out",
          },
          "-=0.25",
        );

      gsap.to(".hero-glow", {
        opacity: 0.8,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative isolate overflow-hidden bg-[var(--background)] text-[var(--text)]"
    >
      {/* Background pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(
              color-mix(in srgb, var(--text-subtle) 45%, transparent) 0.8px,
              transparent 0.9px
            ),
            repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 25px,
              color-mix(in srgb, var(--border) 38%, transparent) 26px
            )
          `,
          backgroundSize: "37px 37px, 26px 100%",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 48%, transparent 100%)",
          opacity: 0.45,
        }}
      />

      {/* Background glow */}
      <div
        aria-hidden="true"
        className="hero-glow pointer-events-none absolute inset-x-0 top-0 z-0 h-[570px] opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 50% 75%, color-mix(in srgb, var(--primary) 20%, transparent), transparent 68%)",
        }}
      />

      {/* Curved horizon */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[470px] z-0 h-[850px] w-[140vw] -translate-x-1/2 rounded-[50%] sm:top-[430px] sm:h-[1050px] sm:w-[150vw]"
        style={{
          borderTop:
            "1px solid color-mix(in srgb, var(--primary) 65%, var(--border))",
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--primary) 17%, transparent) 0%, color-mix(in srgb, var(--primary) 7%, transparent) 19%, color-mix(in srgb, var(--background) 92%, transparent) 47%, var(--background) 68%)",
          boxShadow:
            "0 -16px 60px color-mix(in srgb, var(--primary) 10%, transparent)",
        }}
      />

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-5 pb-0 pt-20 text-center sm:px-8 sm:pt-24 md:pt-28">
        {/* Headline */}
        <h1 className="hero-reveal max-w-5xl text-[42px] font-extrabold leading-[1.08] tracking-[-0.055em] sm:text-6xl md:text-7xl lg:text-[76px]">
          Plan Less.
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(110deg, var(--text) 5%, var(--text-muted) 95%)",
            }}
          >
            Achieve More.
          </span>
        </h1>

        {/* Description */}
        <p className="hero-reveal mt-6 max-w-2xl text-sm font-normal leading-7 text-[var(--text-muted)] sm:text-base sm:leading-8 md:text-lg">
          Organize your tasks, manage your projects, and keep your priorities in
          focus. TaskFlow brings everything together so you can spend less time
          planning and more time making progress.
        </p>

        {/* CTA buttons */}
        <div className="hero-reveal relative z-20 mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Link
            to="/register"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-transparent px-7 py-3 text-sm font-semibold shadow-lg transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]"
            style={primaryButtonStyle}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor =
                "var(--primary-hover)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = "var(--primary)";
            }}
          >
            Get Started Free
            <ArrowRight size={16} />
          </Link>

          <a
            href="#features"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-7 py-3 text-sm font-semibold transition-colors duration-200 hover:bg-[var(--surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]"
            style={{ color: "var(--text)" }}
          >
            Explore Features
          </a>
        </div>

        {/* Supporting text */}
        <div className="hero-reveal mt-8 flex items-center gap-2 text-xs font-medium text-[var(--text-subtle)] sm:text-sm">
          <CheckCircle2 size={15} className="shrink-0 text-[var(--success)]" />
          Your tasks. Your projects. One clear view.
        </div>
      </div>

      {/* Feature labels */}
      <div className="relative z-10 mx-auto mt-16 max-w-3xl px-5 sm:mt-20">
        <p className="mb-5 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-subtle)] sm:text-xs">
          Everything you need to stay on track
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-4 sm:gap-x-10">
          {[
            { name: "Tasks", Icon: ListTodo },
            { name: "Projects", Icon: FolderKanban },
            { name: "Planning", Icon: CalendarDays },
            { name: "Productivity", Icon: TrendingUp },
          ].map(({ name, Icon }) => (
            <div
              key={name}
              className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] sm:text-sm"
            >
              <Icon size={16} />
              {name}
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard preview */}
      <div
        id="hero-preview"
        className="hero-dashboard relative z-10 mx-auto mt-14 w-[calc(100%-24px)] max-w-[1050px] sm:mt-16 sm:w-[calc(100%-64px)]"
      >
        <div className="rounded-[19px] border border-[var(--border)] bg-[var(--surface-muted)] p-1 sm:rounded-[23px] sm:p-1.5">
          <div className="overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)] sm:rounded-[18px]">
            {/* Application toolbar */}
            <div className="flex h-14 items-center justify-between gap-3 border-b border-[var(--border)] px-4 sm:px-6">
              <div className="flex shrink-0 items-center gap-2">
                <CheckSquare size={18} className="text-[var(--primary)]" />
                <span className="text-xs font-bold tracking-tight text-[var(--text)] sm:text-sm">
                  TaskFlow
                </span>
              </div>

              <div className="hidden h-8 w-full max-w-[270px] items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-[10px] text-[var(--text-subtle)] sm:flex">
                <Search size={13} />
                Search tasks and projects...
              </div>

              <div className="flex items-center gap-3">
                <Bell size={16} className="text-[var(--text-muted)]" />

                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[9px] font-bold text-[var(--text)]">
                  TF
                </div>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 md:grid-cols-[185px_minmax(0,1fr)]">
              {/* Sidebar */}
              <aside className="hidden flex-col border-r border-[var(--border)] bg-[var(--surface-muted)] p-4 md:flex">
                <p className="mb-4 px-2 text-[9px] font-bold tracking-[0.17em] text-[var(--text-subtle)]">
                  WORKSPACE
                </p>

                <div className="mb-1 flex items-center gap-2 rounded-lg bg-[var(--primary-soft)] px-3 py-2.5 text-xs font-semibold text-[var(--primary)]">
                  <LayoutDashboard size={15} />
                  Overview
                </div>

                <div className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium text-[var(--text-muted)]">
                  <ListTodo size={15} />
                  My tasks
                  <span className="ml-auto text-[10px] text-[var(--text-subtle)]">
                    4
                  </span>
                </div>

                <div className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium text-[var(--text-muted)]">
                  <FolderKanban size={15} />
                  Projects
                </div>

                <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium text-[var(--text-muted)]">
                  <CalendarDays size={15} />
                  Calendar
                </div>

                <div className="mt-auto border-t border-[var(--border)] pt-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[10px] font-bold text-[var(--primary)]">
                      TF
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold text-[var(--text)]">
                        My workspace
                      </p>
                      <p className="mt-0.5 text-[9px] text-[var(--text-subtle)]">
                        Personal space
                      </p>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main dashboard */}
              <div className="min-w-0 p-4 sm:p-6">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--text-subtle)]">
                      WORKSPACE OVERVIEW
                    </p>

                    <h2 className="text-lg font-bold tracking-tight text-[var(--text)] sm:text-xl">
                      Your dashboard
                    </h2>

                    <p className="mt-1 text-[10px] font-normal text-[var(--text-muted)] sm:text-xs">
                      A little progress goes a long way.
                    </p>
                  </div>

                  <span
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[10px] font-semibold"
                    style={primaryButtonStyle}
                  >
                    <Plus size={13} />
                    New task
                  </span>
                </div>

                {/* Statistics */}
                <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4">
                    <div className="mb-3 flex items-center gap-2 text-[10px] font-medium text-[var(--text-muted)] sm:text-xs">
                      <ListTodo size={14} />
                      Total tasks
                    </div>

                    <p className="text-2xl font-bold tracking-tight text-[var(--text)]">
                      12
                    </p>

                    <p className="mt-1 text-[9px] font-normal text-[var(--text-subtle)]">
                      In your workspace
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4">
                    <div className="mb-3 flex items-center gap-2 text-[10px] font-medium text-[var(--text-muted)] sm:text-xs">
                      <CheckCircle2
                        size={14}
                        className="text-[var(--success)]"
                      />
                      Completed
                    </div>

                    <p className="text-2xl font-bold tracking-tight text-[var(--text)]">
                      08
                    </p>

                    <p className="mt-1 text-[9px] font-normal text-[var(--text-subtle)]">
                      Tasks finished
                    </p>
                  </div>

                  <div className="col-span-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4 lg:col-span-1">
                    <div className="mb-3 flex items-center gap-2 text-[10px] font-medium text-[var(--text-muted)] sm:text-xs">
                      <TrendingUp size={14} className="text-[var(--primary)]" />
                      Weekly progress
                    </div>

                    <p className="text-2xl font-bold tracking-tight text-[var(--text)]">
                      76%
                    </p>

                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                      <div
                        className="hero-progress-fill h-full rounded-full"
                        style={{
                          width: "76%",
                          backgroundColor: "var(--primary)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Task list and weekly chart */}
                <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-xs font-bold text-[var(--text)] sm:text-sm">
                        Today's tasks
                      </h3>

                      <MoreHorizontal
                        size={16}
                        className="text-[var(--text-subtle)]"
                      />
                    </div>

                    <div className="divide-y divide-[var(--border)]">
                      {tasks.map((task) => (
                        <div
                          key={task.title}
                          className="flex min-w-0 items-center gap-2.5 py-3"
                        >
                          <span
                            className="flex h-4 w-4 shrink-0 items-center justify-center"
                            style={{
                              color: task.completed
                                ? "var(--success)"
                                : "var(--text-subtle)",
                            }}
                          >
                            {task.completed ? (
                              <Check size={12} />
                            ) : (
                              <Circle size={14} />
                            )}
                          </span>

                          <span
                            className={`min-w-0 flex-1 truncate text-[10px] font-medium sm:text-xs ${
                              task.completed
                                ? "text-[var(--text-subtle)] line-through"
                                : "text-[var(--text)]"
                            }`}
                          >
                            {task.title}
                          </span>

                          <span
                            className="hidden shrink-0 rounded px-2 py-1 text-[9px] font-semibold sm:inline-flex"
                            style={{
                              backgroundColor:
                                task.category === "Design"
                                  ? "var(--primary-soft)"
                                  : task.category === "Work"
                                    ? "var(--info-soft)"
                                    : "var(--warning-soft)",
                              color:
                                task.category === "Design"
                                  ? "var(--primary)"
                                  : task.category === "Work"
                                    ? "var(--info)"
                                    : "var(--warning)",
                            }}
                          >
                            {task.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weekly productivity chart */}
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <div className="mb-5 flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold text-[var(--text)] sm:text-sm">
                        Focus this week
                      </h3>

                      <ArrowUpRight
                        size={15}
                        className="text-[var(--primary)]"
                      />
                    </div>

                    <div className="flex h-[105px] items-end justify-around gap-2 border-b border-[var(--border)] px-1">
                      {[38, 58, 45, 78, 60, 88, 72].map((height, index) => (
                        <div
                          key={index}
                          className="w-full max-w-6 rounded-t-sm"
                          style={{
                            height: `${height}%`,
                            backgroundColor:
                              index === 5
                                ? "var(--primary)"
                                : "var(--border-strong)",
                          }}
                        />
                      ))}
                    </div>

                    <div className="mt-3 flex justify-between text-[9px] font-medium text-[var(--text-subtle)]">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom divider */}
      <div className="relative z-10 mx-auto mt-8 h-px max-w-7xl bg-gradient-to-r from-transparent via-[var(--border)] to-transparent sm:mt-12" />
    </section>
  );
}
