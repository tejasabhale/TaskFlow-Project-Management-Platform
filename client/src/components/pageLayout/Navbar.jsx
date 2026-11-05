import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import {
  ArrowRight,
  Moon,
  Sun,
  ArrowUpRight,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/features" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const GITHUB_URL = "https://github.com/tejasabhale";

const primaryButtonStyle = {
  backgroundColor: "var(--primary)",
  color: "var(--text-inverse)",
};

/* index.css sets an unlayered color on <a>, so link colors are applied inline */
const desktopLinkColor = ({ isActive }) => ({
  color: isActive ? "var(--primary-text)" : "var(--text-muted)",
});

const bigLinkColor = ({ isActive }) => ({
  color: isActive ? "var(--primary-text)" : "var(--text)",
});

function getInitialTheme() {
  if (typeof window === "undefined") return "light";

  try {
    const saved = localStorage.getItem("theme");

    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Storage may be unavailable in private browsing modes.
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);
  const [scrolled, setScrolled] = useState(false);

  const overlayRef = useRef(null);
  const topBarRef = useRef(null);
  const midBarRef = useRef(null);
  const botBarRef = useRef(null);
  const tlRef = useRef(null);

  const location = useLocation();

  /* Apply theme to <html> and persist it */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");

    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Keep the selected theme for this session if storage is unavailable.
    }
  }, [theme]);

  /* Close the menu on route change */
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  /* Escape closes the menu */
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Close the menu if the viewport grows to desktop size */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (event) => {
      if (event.matches) setMenuOpen(false);
    };

    mq.addEventListener("change", onChange);

    return () => mq.removeEventListener("change", onChange);
  }, []);

  /* Shadow once scrolled */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Lock page scroll while the full-screen menu is open */
  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  /* Build one paused GSAP timeline: overlay + bars + rows, all in sync */
  useLayoutEffect(() => {
    const overlay = overlayRef.current;

    if (!overlay) return undefined;

    const ctx = gsap.context(() => {
      const rows = overlay.querySelectorAll("[data-menu-row]");

      gsap.set(overlay, { yPercent: -100, visibility: "hidden" });
      gsap.set(topBarRef.current, { y: -6 });
      gsap.set(botBarRef.current, { y: 6 });

      const tl = gsap.timeline({
        paused: true,
        onReverseComplete: () => gsap.set(overlay, { visibility: "hidden" }),
      });

      tl.to(
        overlay,
        { yPercent: 0, duration: 0.9, ease: "expo.inOut" },
        0,
      )
        .to(
          topBarRef.current,
          { y: 0, rotation: 45, duration: 0.55, ease: "power3.inOut" },
          0,
        )
        .to(
          midBarRef.current,
          { scaleX: 0, opacity: 0, duration: 0.3, ease: "power2.in" },
          0,
        )
        .to(
          botBarRef.current,
          { y: 0, rotation: -45, duration: 0.55, ease: "power3.inOut" },
          0,
        )
        .fromTo(
          rows,
          { y: 56, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.07,
            ease: "power4.out",
          },
          0.3,
        );

      tlRef.current = tl;
    }, overlay);

    return () => {
      ctx.revert();
      tlRef.current = null;
    };
  }, []);

  /* Drive the timeline from state — interruptible in both directions */
  useEffect(() => {
    const tl = tlRef.current;
    const overlay = overlayRef.current;

    if (!tl || !overlay) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (menuOpen) {
      gsap.set(overlay, { visibility: "visible" });

      if (reduceMotion) {
        tl.progress(1);
      } else {
        tl.timeScale(1).play();
      }
    } else {
      if (tl.progress() === 0) return;

      if (reduceMotion) {
        tl.progress(0);
        gsap.set(overlay, { visibility: "hidden" });
      } else {
        tl.timeScale(1.5).reverse();
      }
    }
  }, [menuOpen]);

  const toggleTheme = () =>
    setTheme((current) => (current === "dark" ? "light" : "dark"));

  const closeMenu = () => setMenuOpen(false);

  const barClass =
    "absolute left-0 top-1/2 -mt-px block h-0.5 w-5 rounded-full bg-current will-change-transform";

  return (
    <>
      <header
        className={`sticky top-0 z-50 h-16 w-full border-b backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-500 ${menuOpen
          ? "border-transparent bg-transparent"
          : "border-[var(--border)] bg-[var(--surface)]/85"
          } ${scrolled && !menuOpen ? "shadow-[var(--shadow-sm)]" : ""}`}
      >
        <nav
          aria-label="Main navigation"
          className="mx-auto grid h-full max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-5 sm:px-8 md:grid-cols-[1fr_auto_1fr] lg:px-12"
        >
          {/* Logo */}

          <Link
            to="/"
            onClick={closeMenu}
            aria-label="TaskFlow home"
            className="flex min-w-0 items-center gap-2.5 justify-self-start"
            style={{ color: "var(--text)" }}
          >
            <img
              src="/taskflow-logo.svg"
              alt=""
              aria-hidden="true"
              className="size-9 shrink-0 object-contain"
            />

            <span className="whitespace-nowrap font-['Plus_Jakarta_Sans',sans-serif] text-lg font-bold tracking-[-0.045em] sm:text-xl">
              Task<span className="text-[var(--primary)]">Flow</span>
            </span>
          </Link>


          {/* Desktop links (centered) */}
          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  className="rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-[var(--surface-muted)]"
                  style={desktopLinkColor}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="flex items-center gap-2 justify-self-end">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <Link
              to="/login"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-[var(--surface-muted)] md:inline-flex"
              style={{ color: "var(--text)" }}
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="group hidden items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-200 md:inline-flex"
              style={primaryButtonStyle}
              onMouseEnter={(event) => {
                event.currentTarget.style.backgroundColor =
                  "var(--primary-hover)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.backgroundColor = "var(--primary)";
              }}
            >
              Get started
              <ArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>

            {/* Animated hamburger — mobile */}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className={`relative flex h-10 w-10 items-center justify-center rounded-lg border transition-colors duration-500 md:hidden ${menuOpen
                ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-text)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                }`}
            >
              <span aria-hidden="true" className="relative block h-5 w-5">
                <span ref={topBarRef} className={barClass} />
                <span ref={midBarRef} className={barClass} />
                <span ref={botBarRef} className={barClass} />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* True full-screen mobile menu */}
      <div
        ref={overlayRef}
        id="mobile-menu"
        data-lenis-prevent
        aria-hidden={!menuOpen}
        className="fixed inset-x-0 top-0 z-40 flex h-dvh flex-col overflow-y-auto bg-[var(--background)] px-5 pb-8 pt-24 will-change-transform sm:px-8 md:hidden"
        style={{ visibility: "hidden" }}
      >
        {/* Soft glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--primary) 14%, transparent), transparent 70%)",
          }}
        />

        <ul className="flex flex-col">
          {NAV_LINKS.map((link, index) => (
            <li
              key={link.to}
              data-menu-row
              className="border-b border-[var(--border)]"
            >
              <NavLink
                to={link.to}
                end={link.to === "/"}
                onClick={closeMenu}
                className="flex items-center justify-between py-5 text-4xl font-bold tracking-tight sm:text-5xl"
                style={bigLinkColor}
              >
                <span className="flex items-baseline gap-4">
                  <span className="font-mono text-xs font-medium tabular-nums text-[var(--text-subtle)]">
                    0{index + 1}
                  </span>
                  {link.label}
                </span>
                <ArrowUpRight
                  size={24}
                  className="text-[var(--text-subtle)]"
                />
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Menu actions */}
        <div data-menu-row className="mt-8 grid grid-cols-2 gap-3">
          <Link
            to="/login"
            onClick={closeMenu}
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-sm font-semibold"
            style={{ color: "var(--text)" }}
          >
            Log in
          </Link>

          <Link
            to="/register"
            onClick={closeMenu}
            className="inline-flex min-h-12 items-center justify-center rounded-lg px-4 text-sm font-semibold"
            style={primaryButtonStyle}
          >
            Get started
          </Link>
        </div>

        {/* Menu footer */}
        <div
          data-menu-row
          className="mt-auto flex items-center justify-between gap-4 pt-10 text-xs text-[var(--text-subtle)]"
        >
          <span>© TaskFlow {new Date().getFullYear()}. All rights reserved.</span>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold"
            style={{ color: "var(--text)" }}
          >
            GitHub
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </>
  );
};

export default Navbar;
