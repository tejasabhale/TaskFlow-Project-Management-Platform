import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  CheckCircle2,
  Mail,
  TriangleAlert,
} from "lucide-react";
gsap.registerPlugin(ScrollTrigger);
const GITHUB_URL = "https://github.com/tejasabhale";
const CONTACT_EMAIL = "abhaletejas4@gmail.com";
const footerLinks = {
  Product: [
    { label: "Features", to: "/#features" },
    { label: "Dashboard", to: "/" },
    { label: "Tasks", to: "/tasks" },
    { label: "Projects", to: "/projects" },
    { label: "Calendar", to: "/calendar" },
  ],
  Company: [
    { label: "About", to: "/about" },
    { label: "Pricing", to: "/pricing" },
    { label: "FAQ", to: "/faq" },
    { label: "Blog", to: "/blog" },
    { label: "Contact", to: "/contact" },
  ],
  Connect: [
    { label: "Email us", to: `mailto:${CONTACT_EMAIL}`, external: true, same: true },
    { label: "GitHub", to: GITHUB_URL, external: true },
    { label: "Sign in", to: "/login" },
    { label: "Get started", to: "/register" },
  ],
};
const legalLinks = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms & Conditions", to: "/terms" },
];
const primaryButtonStyle = {
  backgroundColor: "var(--primary)",
  color: "var(--text-inverse)",
};
/* index.css sets an unlayered color on <a>, so link colors use important utilities */
const linkClass =
  "group flex min-h-11 w-full items-center justify-between gap-3 border-b border-[var(--border)] py-3 text-sm text-[var(--text-muted)]! transition-colors duration-200 last:border-b-0 hover:text-[var(--primary-text)]! focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]";
const legalClass =
  "text-xs text-[var(--text-subtle)]! transition-colors duration-200 hover:text-[var(--primary-text)]! focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export default function Footer() {
  const footerRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | success | error
  /* Scroll reveal (GSAP + ScrollTrigger, plays once) */
  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    const mm = gsap.matchMedia(footer);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set("[data-footer-reveal]", { opacity: 0, y: 16 });
      ScrollTrigger.batch("[data-footer-reveal]", {
        start: "top 92%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
            overwrite: true,
          }),
      });
    });
    return () => mm.revert();
  }, []);
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
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (window.lenis) {
      window.lenis.scrollTo(el, { offset: -64, duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  /* Makes "/#features" actually scroll, on the home page and from other pages */
  const handleHashLink = (event, to) => {
    if (!to.includes("#") || to.startsWith("http")) return;
    const [path, hash] = to.split("#");
    const targetPath = path || "/";
    event.preventDefault();
    if (pathname === targetPath) {
      scrollToId(hash);
    } else {
      navigate(targetPath);
      window.setTimeout(() => scrollToId(hash), 350);
    }
  };
  const handleSubscribe = (event) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setStatus("error");
      return;
    }
    // TODO: send `email.trim()` to your newsletter endpoint here.
    setStatus("success");
    setEmail("");
  };
  return (
    <footer
      ref={footerRef}
      className="dark relative isolate mt-auto overflow-hidden border-t border-[var(--border)] bg-[var(--background)] text-[var(--text)]"
    >
      {/* Subtle editorial background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(var(--border-strong) 0.7px, transparent 0.8px)",
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(to bottom, black, transparent 85%)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent 85%)",
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
        {/* Call to action strip */}
        <div
          data-footer-reveal
          className="flex flex-col gap-6 border-b border-[var(--border)] py-10 sm:flex-row sm:items-center sm:justify-between sm:py-14"
        >
          <div className="min-w-0">
            <p className="mb-2 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-subtle)] sm:text-[11px]">
              <span className="h-1.5 w-1.5 bg-[var(--primary)]" />
              Get started
            </p>
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-bold leading-tight tracking-[-0.04em] sm:text-3xl lg:text-4xl">
              Bridge the gap between to-dos and{" "}
              <span className="font-['Instrument_Serif',serif] font-normal italic tracking-[-0.015em] text-[var(--primary)]">
                progress.
              </span>
            </h2>
          </div>
          <Link
            to="/register"
            className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-3 border border-transparent px-7 py-3 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]"
            style={primaryButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--primary-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--primary)";
            }}
          >
            Get Started Free
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>
        {/* Main footer */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12 sm:py-16 lg:grid-cols-[1.7fr_1fr_1fr_1fr] lg:gap-10 lg:py-20">
          {/* Brand, description and newsletter */}
          <div data-footer-reveal className="min-w-0 sm:col-span-2 lg:col-span-1">

            <Link
              to="/"
              aria-label="TaskFlow home"
              className="group inline-flex items-center gap-3"
              style={{ color: "var(--text)" }}
            >
              <img
                src="/taskflow-logo.svg"
                alt=""
                aria-hidden="true"
                className="size-10 shrink-0 object-contain"
              />

              <span className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold tracking-[-0.045em]">
                Task<span className="text-[var(--primary)]">Flow</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--text-muted)]">
              Less time managing work. More time making progress. Bring your
              tasks and projects together in one clear workspace.
            </p>
            {/* Newsletter */}
            <form
              onSubmit={handleSubscribe}
              noValidate
              className="mt-7 max-w-sm border-t border-[var(--border)] pt-5"
            >
              <label
                htmlFor="footer-email"
                className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-subtle)] sm:text-[11px]"
              >
                <Mail size={13} className="text-[var(--primary)]" />
                Subscribe to our updates
              </label>
              <div className="flex">
                <input
                  id="footer-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status !== "idle") setStatus("idle");
                  }}
                  aria-invalid={status === "error"}
                  aria-describedby="footer-email-status"
                  className="min-h-11 min-w-0 flex-1 rounded-none! border-r-0 px-3 text-sm"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border border-transparent px-4 text-sm font-semibold transition-colors duration-200"
                  style={primaryButtonStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--primary-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--primary)";
                  }}
                >
                  Subscribe
                  <ArrowRight size={14} />
                </button>
              </div>
              <p
                id="footer-email-status"
                role="status"
                aria-live="polite"
                className="mt-3 min-h-5 text-xs"
              >
                {status === "success" && (
                  <span className="inline-flex items-center gap-2 text-[var(--success)]">
                    <CheckCircle2 size={14} />
                    Done! Thanks for subscribing.
                  </span>
                )}
                {status === "error" && (
                  <span className="inline-flex items-center gap-2 text-[var(--danger)]">
                    <TriangleAlert size={14} />
                    Please enter a valid email address.
                  </span>
                )}
              </p>
            </form>
          </div>
          {/* Navigation columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading} data-footer-reveal className="min-w-0">
              <h2 className="mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-subtle)] sm:text-[11px]">
                <span className="h-1.5 w-1.5 bg-[var(--primary)]" />
                {heading}
              </h2>
              <nav
                aria-label={`${heading} links`}
                className="flex flex-col items-start"
              >
                {links.map(({ label, to, external, same }) =>
                  external ? (
                    <a
                      key={label}
                      href={to}
                      {...(same ? {} : { target: "_blank", rel: "noreferrer" })}
                      className={linkClass}
                    >
                      <span>{label}</span>
                      <ArrowUpRight
                        size={14}
                        className="shrink-0 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                      />
                    </a>
                  ) : (
                    <Link
                      key={label}
                      to={to}
                      onClick={(e) => handleHashLink(e, to)}
                      className={linkClass}
                    >
                      <span>{label}</span>
                      <ArrowRight
                        size={14}
                        className="shrink-0 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                      />
                    </Link>
                  ),
                )}
              </nav>
            </div>
          ))}
        </div>
        {/* Bottom bar */}
        <div
          data-footer-reveal
          className="flex flex-col gap-5 border-t border-[var(--border)] py-6 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <p className="mb-0 text-xs leading-6 text-[var(--text-subtle)]">
              © {new Date().getFullYear()} TaskFlow. All rights reserved.
            </p>
            <nav aria-label="Legal" className="flex items-center gap-5">
              {legalLinks.map(({ label, to }) => (
                <Link key={label} to={to} className={legalClass}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-5 lg:justify-end">
            <span className="text-xs text-[var(--text-subtle)]">
              Plan less. Achieve more.
            </span>
            <button
              type="button"
              onClick={scrollToTop}
              className="group inline-flex min-h-10 shrink-0 items-center gap-3 border border-[var(--border)] bg-[var(--surface)] px-4 text-xs font-medium text-[var(--text-muted)] transition-colors duration-200 hover:border-[var(--primary)] hover:text-[var(--primary-text)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]"
            >
              Back to top
              <ArrowUp
                size={14}
                className="transition-transform duration-200 group-hover:-translate-y-0.5"
              />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
