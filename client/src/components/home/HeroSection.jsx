import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import HeroBoard from "./HeroBoard";

/** Headline line that slides up from behind a mask (animated by gsap below). */
function Line({ children }) {
  return (
    <span className="block overflow-hidden pb-[0.1em]">
      <span data-line className="block">
        {children}
      </span>
    </span>
  );
}

export default function HeroSection() {
  const heroRef = useRef(null);

  // One page-load sequence: headline lines, then copy and buttons, with the board rising alongside.
  useLayoutEffect(() => {
    const root = heroRef.current;
    if (!root) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from("[data-line]", { yPercent: 110, duration: 0.9, stagger: 0.1 })
        .from(
          "[data-hero-fade]",
          { opacity: 0, y: 16, duration: 0.65, stagger: 0.1, clearProps: "all" },
          "-=0.5"
        )
        .from(
          "[data-hero-board]",
          { opacity: 0, y: 28, duration: 0.9, clearProps: "all" },
          0.25
        );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative isolate flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden border-b border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
    >
      {/* faint dot grid, fades out toward the edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-70 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_40%_50%,black,transparent_70%)]"
      />

      {/* two fixed-width columns, centred as a pair with a tight gap; spare room goes to the left/right edges */}
      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,34rem)_minmax(0,28rem)] lg:justify-center lg:gap-10 lg:px-12 lg:py-8">
        <div>
          <h1 className="max-w-3xl font-['Plus_Jakarta_Sans',sans-serif] text-[40px] font-extrabold leading-[1.05] tracking-[-0.055em] sm:text-5xl lg:text-6xl">
            <Line>Plan less.</Line>
            <Line>Achieve more.</Line>
          </h1>

          <p
            data-hero-fade
            className="mt-6 max-w-lg text-base leading-7 text-[var(--text-muted)] sm:text-lg sm:leading-8"
          >
            Organize your tasks, manage your projects, and keep your
            priorities in focus. TaskFlow brings everything together so
            you can spend less time planning and more time making
            progress.
          </p>

          <div
            data-hero-fade
            className="relative z-20 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              to="/register"
              className="group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-7 py-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]"
            >
              {/* black fill slides up from the bottom on hover */}
              <span
                aria-hidden="true"
                className="absolute inset-0 translate-y-full bg-black transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-0 motion-reduce:transition-none"
              />
              <span className="relative z-10 text-white transition-colors duration-300 ease-out group-hover:text-[var(--primary)] motion-reduce:transition-none">
                Get Started Free
              </span>
            </Link>

            <a
              href="#features"
              className="group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-7 py-3 text-sm font-bold transition-colors duration-300 hover:border-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)] motion-reduce:transition-none"
            >
              {/* orange fill slides down from the top on hover (opposite of the primary button) */}
              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-y-full bg-[var(--primary)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-0 motion-reduce:transition-none"
              />
              <span className="relative z-10 text-[var(--text)] transition-colors duration-300 ease-out group-hover:text-black motion-reduce:transition-none">
                Explore Features
              </span>
            </a>
          </div>
        </div>

        <div className="flex justify-center">
          <HeroBoard />
        </div>
      </div>
    </section>
  );
}