import { useCallback, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUp, Mail } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const GITHUB_URL = "https://github.com/tejasabhale";
const CONTACT_EMAIL = "abhaletejas4@gmail.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/tejas-abhale-50743128a/";
const X_URL = "https://x.com/Tejas55451";

/* Brand icons as inline SVG (lucide-react no longer ships brand logos) */
function LinkedinIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GithubIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function XIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

function EmailIcon({ size = 18 }) {
  return <Mail size={size} strokeWidth={2} aria-hidden="true" />;
}

const footerLinks = {
  Product: [
    { label: "Features", to: "/#features" },
    { label: "Dashboard", to: "/dashboard" },
    { label: "Tasks", to: "/dashboard/tasks" },
    { label: "Projects", to: "dashboard/projects" },
    { label: "Members", to: "dashboard/members" },
  ],
  Company: [
    { label: "About", to: "/about" },
    { label: "Pricing", to: "/pricing" },
    { label: "FAQ", to: "/faq" },
    { label: "Blog", to: "/blog" },
    { label: "Contact", to: "/contact" },
  ],
};

const socialLinks = [
  { label: "LinkedIn", href: LINKEDIN_URL, icon: LinkedinIcon },
  { label: "GitHub", href: GITHUB_URL, icon: GithubIcon },
  { label: "X", href: X_URL, icon: XIcon },
  {
    label: "Email",
    href: `mailto:${CONTACT_EMAIL}`,
    icon: EmailIcon,
    sameTab: true,
  },
];

const legalLinks = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms & Conditions", to: "/terms" },
];

const linkClass =
  "group -mx-2 inline-flex min-h-8 items-center gap-2 rounded-lg px-2 text-xs text-[var(--text-muted)]! transition-colors duration-200 hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]! focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]";

const socialClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-muted)]! transition-colors duration-200 hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white! focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]";

const legalClass =
  "rounded-md text-[11px] text-[var(--text-subtle)]! transition-colors duration-200 hover:text-[var(--primary)]! focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]";

const headingClass =
  "mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]";

export default function Footer() {
  const footerRef = useRef(null);
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();

  // Scroll to an element using Lenis when available.
  const scrollToId = useCallback((id) => {
    const element = document.getElementById(id);

    if (!element) return;

    if (window.lenis?.scrollTo) {
      window.lenis.scrollTo(element, {
        offset: -64,
        duration: 0.8,
      });
    } else {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  // Handle hash navigation from the footer.
  const handleHashLink = (event, to) => {
    if (!to.includes("#")) return;

    event.preventDefault();

    const [path, id] = to.split("#");
    const targetPath = path || "/";

    if (pathname === targetPath) {
      scrollToId(id);
    } else {
      navigate(to);
    }
  };

  // Scroll to the target after React Router changes the route.
  useEffect(() => {
    if (!hash) return;

    const id = decodeURIComponent(hash.slice(1));

    const frame = window.requestAnimationFrame(() => {
      scrollToId(id);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname, hash, scrollToId]);

  // Compact footer reveal animation.
  useEffect(() => {
    const footer = footerRef.current;

    if (
      !footer ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-footer-reveal]",
        {
          autoAlpha: 0,
          y: 10,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.06,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footer,
            start: "top 94%",
            once: true,
          },
        },
      );
    }, footer);

    return () => context.revert();
  }, []);

  const scrollToTop = () => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (window.lenis?.scrollTo) {
      window.lenis.scrollTo(0, {
        immediate: reducedMotion,
        duration: reducedMotion ? 0 : 0.8,
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    }
  };

  return (
    <footer
      ref={footerRef}
      className="relative mt-auto w-full border-t border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)]"
    >
      {/* Main footer: full width, no outer margin */}
      <div className="grid w-full grid-cols-2 gap-2.5 p-2.5 sm:grid-cols-3 sm:gap-3 sm:p-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        {/* Brand */}
        <div
          data-footer-reveal
          className="col-span-2 flex min-w-0 flex-col justify-center rounded-xl px-4 py-5 sm:col-span-3 sm:px-5 lg:col-span-1"
        >
          <Link
            to="/"
            aria-label="TaskFlow home"
            className="inline-flex items-center gap-2.5 self-start"
            style={{ color: "var(--text)" }}
          >
            <img
              src="/taskflow-logo.svg"
              alt=""
              aria-hidden="true"
              className="size-8 shrink-0 object-contain"
            />

            <span className="font-['Plus_Jakarta_Sans',sans-serif] text-lg font-extrabold tracking-[-0.045em]">
              Task
              <span className="text-[var(--primary)]">Flow</span>
            </span>
          </Link>

          <p className="mt-3 max-w-xs text-xs leading-6 text-[var(--text-muted)]">
            Less time managing work. More time making progress.
            Bring your tasks and projects together in one clear
            workspace.
          </p>
        </div>

        {/* Navigation: each column is a panel, like the board columns */}
        {Object.entries(footerLinks).map(([heading, links]) => (
          <div
            key={heading}
            data-footer-reveal
            className="min-w-0 rounded-xl bg-[var(--background)] p-3.5 sm:p-4"
          >
            <h2 className={headingClass}>
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full border border-[var(--primary)]"
              />
              {heading}
            </h2>

            <nav
              aria-label={`${heading} links`}
              className="flex flex-col items-start gap-0.5"
            >
              {links.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={(event) => handleHashLink(event, to)}
                  className={linkClass}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        ))}

        {/* Connect: social icons */}
        <div
          data-footer-reveal
          className="col-span-2 min-w-0 rounded-xl bg-[var(--background)] p-3.5 sm:col-span-1 sm:p-4"
        >
          <h2 className={headingClass}>
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full border border-[var(--primary)]"
            />
            Connect
          </h2>

          <div
            aria-label="Social links"
            className="flex flex-wrap items-center gap-2"
          >
            {socialLinks.map(({ label, href, icon: Icon, sameTab }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                title={label}
                {...(!sameTab && {
                  target: "_blank",
                  rel: "noopener noreferrer",
                })}
                className={socialClass}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar: full width */}
      <div
        data-footer-reveal
        className="flex w-full flex-col gap-4 border-t border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <p className="text-[11px] text-[var(--text-subtle)]">
            © {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>

          <nav aria-label="Legal" className="flex gap-4">
            {legalLinks.map(({ label, to }) => (
              <Link key={label} to={to} className={legalClass}>
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <button
          type="button"
          onClick={scrollToTop}
          className="group inline-flex min-h-9 shrink-0 items-center gap-2 self-start rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-xs font-bold text-[var(--text-muted)] transition-colors duration-200 hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)] sm:self-auto"
        >
          Back to top

          <ArrowUp
            size={13}
            className="transition-transform duration-200 group-hover:-translate-y-0.5"
          />
        </button>
      </div>
    </footer>
  );
}