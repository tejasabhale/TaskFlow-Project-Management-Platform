import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  ListTodo,
  TrendingUp,
} from "lucide-react";

const primaryButtonStyle = {
  backgroundColor: "var(--primary)",
  color: "var(--text-inverse)",
};

const FEATURES = [
  { name: "Tasks", Icon: ListTodo },
  { name: "Projects", Icon: FolderKanban },
  { name: "Planning", Icon: CalendarDays },
  { name: "Productivity", Icon: TrendingUp },
];

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
      gsap.from(".hero-reveal", {
        opacity: 0,
        y: 18,
        duration: 0.65,
        stagger: 0.1,
        ease: "power3.out",
      });

      gsap.to(".hero-glow", {
        opacity: 0.55,
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
      className="relative isolate flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden border-b border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
    >
      {/* Background pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(
              color-mix(in srgb, var(--text-subtle) 35%, transparent) 0.7px,
              transparent 0.9px
            ),
            repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 31px,
              color-mix(in srgb, var(--border) 28%, transparent) 32px
            )
          `,
          backgroundSize: "37px 37px, 32px 100%",
          maskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)",
          opacity: 0.4,
        }}
      />

      {/* Background glow */}
      <div
        aria-hidden="true"
        className="hero-glow pointer-events-none absolute inset-0 z-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, color-mix(in srgb, var(--primary) 15%, transparent), transparent 70%)",
        }}
      />

      {/* Hero content — single centered column, uniform spacing */}
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-7 px-5 py-16 text-center sm:gap-8 sm:px-8 sm:py-20">
        {/* Headline */}
        <h1 className="hero-reveal max-w-5xl font-['Plus_Jakarta_Sans',sans-serif] text-[44px] font-extrabold leading-[1.04] tracking-[-0.065em] sm:text-6xl md:text-7xl lg:text-[84px]">
          Plan Less.
          <br />
          <span className="font-['Instrument_Serif',serif] font-normal italic tracking-[-0.025em] text-[var(--primary)]">
            Achieve More.
          </span>
        </h1>

        {/* Description */}
        <p className="hero-reveal max-w-2xl text-sm font-normal leading-7 text-[var(--text-muted)] sm:text-base sm:leading-8 md:text-lg">
          Organize your tasks, manage your projects, and keep your priorities in
          focus. TaskFlow brings everything together so you can spend less time
          planning and more time making progress.
        </p>

        {/* CTA buttons */}
        <div className="hero-reveal relative z-20 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Link
            to="/register"
            className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-sm border border-transparent px-7 py-3 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]"
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
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>

          <a
            href="#features"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-[var(--border-strong)] bg-[var(--surface)] px-7 py-3 text-sm font-semibold transition-colors duration-200 hover:border-[var(--primary)] hover:bg-[var(--surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]"
            style={{ color: "var(--text)" }}
          >
            Explore Features
          </a>
        </div>

        {/* Supporting text */}
        <div className="hero-reveal flex items-center justify-center gap-2 text-xs font-medium text-[var(--text-subtle)] sm:text-sm">
          Your tasks. Your projects. One clear view.
        </div>

        {/* Feature labels */}
        <div className="hero-reveal flex w-full max-w-2xl flex-col items-center gap-5 border-t border-[var(--border)] pt-7 sm:pt-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-subtle)] sm:text-xs">
            Everything you need to stay on track
          </p>

          <div className="grid w-full grid-cols-2 justify-items-center gap-x-6 gap-y-4 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-10">
            {FEATURES.map(({ name, Icon }) => (
              <div
                key={name}
                className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] sm:text-sm"
              >
                <Icon size={16} className="text-[var(--primary)]" />
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}