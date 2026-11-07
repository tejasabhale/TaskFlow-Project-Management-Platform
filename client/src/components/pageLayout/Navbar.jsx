import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun, ArrowUpRight, LogOut, LayoutDashboard } from "lucide-react";

import { useAuth } from "../../hooks/useAuth.js";
import { useTheme } from "../../hooks/useTheme.js";

/* Scroll to the top using Lenis when available, otherwise native scrolling */
const scrollToTop = ({ smooth = false } = {}) => {
  if (window.lenis) {
    window.lenis.scrollTo(0, { immediate: !smooth });
    return;
  }

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: smooth ? "smooth" : "instant",
  });
};

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Pricing", to: "/pricing" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
];

const GITHUB_URL = "https://github.com/tejasabhale";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]";

/* index.css sets an unlayered color on <a>, so link colors are applied inline */
const primaryButtonStyle = {
  backgroundColor: "var(--primary)",
  color: "var(--text-inverse)",
};

const isLinkActive = (pathname, to) =>
  to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);

/* Pill button with a text-roll hover */
const RollLink = ({ to, onClick, children }) => (
  <Link
    to={to}
    onClick={onClick}
    style={primaryButtonStyle}
    className={`group relative hidden h-10 items-center overflow-hidden whitespace-nowrap rounded-full px-5 text-sm font-semibold sm:inline-flex ${FOCUS} focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]`}
  >
    <span
      aria-hidden="true"
      className={`absolute inset-0 translate-y-full rounded-full bg-[var(--primary-hover)] transition-transform duration-500 ${EASE} group-hover:translate-y-0 group-focus-visible:translate-y-0`}
    />

    <span className="relative block h-5 overflow-hidden leading-5">
      <span
        className={`block transition-transform duration-500 ${EASE} group-hover:-translate-y-full group-focus-visible:-translate-y-full`}
      >
        {children}
      </span>

      <span
        aria-hidden="true"
        className={`absolute left-0 top-full block whitespace-nowrap transition-transform duration-500 ${EASE} group-hover:-translate-y-full group-focus-visible:-translate-y-full`}
      >
        {children}
      </span>
    </span>
  </Link>
);

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [wipeOrigin, setWipeOrigin] = useState("calc(100% - 40px) 40px");
  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
    show: false,
    animate: false,
  });

  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, loading, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const linkRefs = useRef({});
  const barRef = useRef(null);
  const toggleRef = useRef(null);
  const menuRef = useRef(null);
  const wasOpen = useRef(false);

  const isAdmin = user?.role === "admin";
  const dashboardPath = isAdmin ? "/admin" : "/dashboard";

  /* ---------- Close the menu on route change ---------- */
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  /* ---------- Scroll: condensed state + progress ---------- */
  useEffect(() => {
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      setScrolled(y > 20);

      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${p})`;
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [location.pathname]);

  /* ---------- Sliding indicator ---------- */
  const activeKey =
    NAV_LINKS.find((link) => isLinkActive(location.pathname, link.to))?.to ??
    null;

  const targetKey = hovered ?? activeKey;

  const measure = useCallback(() => {
    const el = targetKey ? linkRefs.current[targetKey] : null;

    if (!el || el.offsetWidth === 0) {
      setIndicator((prev) => ({ ...prev, show: false }));
      return;
    }

    setIndicator((prev) => ({
      left: el.offsetLeft,
      width: el.offsetWidth,
      show: true,
      animate: prev.show,
    }));
  }, [targetKey]);

  useLayoutEffect(() => {
    measure();
  }, [measure, scrolled]);

  useEffect(() => {
    window.addEventListener("resize", measure);

    if (document.fonts?.ready) {
      document.fonts.ready.then(measure);
    }

    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  /* ---------- Mobile menu: resize, Escape and focus trap ---------- */
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };

    const onKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false);

      if (event.key === "Tab" && menuOpen && menuRef.current) {
        const nodes = [
          toggleRef.current,
          ...menuRef.current.querySelectorAll(
            "a[href], button:not([disabled])"
          ),
        ].filter(Boolean);

        const first = nodes[0];
        const last = nodes[nodes.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  /* ---------- Scroll lock + focus management ---------- */
  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (!menuOpen) {
      if (wasOpen.current) {
        if (window.innerWidth < 1024) toggleRef.current?.focus();
        wasOpen.current = false;
      }

      return undefined;
    }

    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    html.classList.add("mobile-menu-open");
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    window.lenis?.stop?.();

    const focusFrame = window.requestAnimationFrame(() => {
      menuRef.current?.querySelector('a[href]:not([tabindex="-1"])')?.focus();
    });

    wasOpen.current = true;

    return () => {
      window.cancelAnimationFrame(focusFrame);

      html.classList.remove("mobile-menu-open");
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;

      window.lenis?.start?.();
    };
  }, [menuOpen]);

  /* ---------- Handlers ---------- */
  const closeMenu = () => setMenuOpen(false);

  const toggleMenu = () => {
    const rect = toggleRef.current?.getBoundingClientRect();

    if (rect) {
      setWipeOrigin(
        `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`
      );
    }

    setMenuOpen((open) => !open);
  };

  /*
   * Nav link click: close the mobile menu and scroll to the top.
   * - Different page: ScrollToTop jumps to the top when the route changes.
   * - Same page: the route does not change, so scroll to the top smoothly here.
   */
  const handleNavClick = (to) => () => {
    closeMenu();

    if (location.pathname === to) {
      scrollToTop({ smooth: true });
    }
  };

  const handleLogout = async () => {
    closeMenu();

    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Hide scrollbars while the mobile menu is open (page and menu stay scrollable/locked as before) */}
      <style>{`
        html.mobile-menu-open,
        html.mobile-menu-open body {
          overflow: hidden !important;
          scrollbar-width: none !important;
          scrollbar-gutter: auto !important;
          -ms-overflow-style: none !important;
        }

        html.mobile-menu-open::-webkit-scrollbar,
        html.mobile-menu-open body::-webkit-scrollbar,
        #mobile-menu::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        #mobile-menu {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
      `}</style>

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 h-16 w-full">
        <div
          className={`flex h-full justify-center border-b transition-[padding,background-color,border-color,backdrop-filter] duration-500 ${EASE} ${scrolled ? "px-3 pt-2 sm:px-6" : "px-0 pt-0"
            } ${scrolled || menuOpen
              ? "border-transparent bg-transparent"
              : "border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md"
            }`}
        >
          <div
            className={`relative w-full overflow-hidden border transition-all duration-500 ${EASE} ${scrolled ? "max-w-6xl rounded-[2rem]" : "max-w-7xl rounded-none"
              } ${menuOpen
                ? "border-transparent bg-transparent shadow-none"
                : scrolled
                  ? "border-[var(--border)] bg-[var(--surface)]/75 shadow-[var(--shadow-md)] backdrop-blur-xl"
                  : "border-transparent bg-transparent"
              }`}
          >
            <nav
              aria-label="Main navigation"
              className={`grid grid-cols-[1fr_auto] items-center gap-3 transition-all duration-500 ${EASE} lg:grid-cols-[1fr_auto_1fr] ${scrolled
                  ? "h-14 pl-4 pr-2 sm:pl-5 sm:pr-2.5"
                  : "h-16 px-5 sm:px-8 lg:px-12"
                }`}
            >
              {/* Brand */}
              <Link
                to="/"
                onClick={handleNavClick("/")}
                aria-label="TaskFlow home"
                style={{ color: "var(--text)" }}
                className={`group flex min-w-0 items-center gap-2.5 justify-self-start rounded-full ${FOCUS}`}
              >
                <img
                  src="/taskflow-logo.svg"
                  alt=""
                  aria-hidden="true"
                  draggable="false"
                  className={`w-auto shrink-0 select-none object-contain transition-all duration-500 ${EASE} group-hover:scale-105 ${scrolled ? "h-8" : "h-9"
                    }`}
                />

                <span className="whitespace-nowrap text-lg font-extrabold tracking-tight sm:text-xl">
                  Task<span className="text-[var(--primary)]">Flow</span>
                </span>
              </Link>

              {/* Desktop links with sliding indicator */}
              <div
                onMouseLeave={() => setHovered(null)}
                className="relative hidden items-center lg:flex"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 h-9 -translate-y-1/2 rounded-full bg-[var(--primary-soft)]"
                  style={{
                    left: indicator.left,
                    width: indicator.width,
                    opacity: indicator.show ? 1 : 0,
                    transition: indicator.animate
                      ? "left 500ms cubic-bezier(0.22,1,0.36,1), width 500ms cubic-bezier(0.22,1,0.36,1), opacity 300ms"
                      : "opacity 300ms",
                  }}
                />

                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    ref={(el) => {
                      linkRefs.current[link.to] = el;
                    }}
                    to={link.to}
                    end={link.to === "/"}
                    onClick={handleNavClick(link.to)}
                    onMouseEnter={() => setHovered(link.to)}
                    onFocus={() => setHovered(link.to)}
                    onBlur={() => setHovered(null)}
                    style={({ isActive }) => ({
                      color: isActive
                        ? "var(--primary-text)"
                        : "var(--text-muted)",
                    })}
                    className={`relative flex h-9 items-center rounded-full px-4 text-sm font-medium tracking-tight transition-colors duration-300 hover:!text-[var(--text)] ${FOCUS}`}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>

              {/* Right side */}
              <div className="flex shrink-0 items-center gap-1.5 justify-self-end sm:gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--text)] ${FOCUS}`}
                >
                  {isDark ? <Sun size={17} /> : <Moon size={17} />}
                </button>

                {!loading &&
                  (isAuthenticated ? (
                    <>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className={`hidden h-10 items-center gap-1.5 rounded-full border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text-muted)] transition-colors duration-200 hover:border-[var(--danger)]/30 hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] lg:inline-flex ${FOCUS}`}
                      >
                        <LogOut size={15} />
                        Log out
                      </button>

                      <RollLink to={dashboardPath} onClick={closeMenu}>
                        {isAdmin ? "Admin dashboard" : "Dashboard"}
                      </RollLink>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        style={{ color: "var(--text)" }}
                        className={`hidden h-10 items-center rounded-full px-4 text-sm font-medium transition-colors duration-200 hover:bg-[var(--surface-muted)] lg:inline-flex ${FOCUS}`}
                      >
                        Log in
                      </Link>

                      <RollLink to="/register" onClick={closeMenu}>
                        Get started
                      </RollLink>
                    </>
                  ))}

                {/* Mobile toggle */}
                <button
                  ref={toggleRef}
                  type="button"
                  onClick={toggleMenu}
                  aria-expanded={menuOpen}
                  aria-controls="mobile-menu"
                  aria-label={menuOpen ? "Close menu" : "Open menu"}
                  className={`relative h-10 w-10 shrink-0 rounded-full border transition-colors duration-500 lg:hidden ${FOCUS} ${menuOpen
                      ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-text)]"
                      : "border-[var(--border-strong)] text-[var(--text)]"
                    }`}
                >
                  <span
                    className={`absolute left-1/2 top-1/2 block h-[1.5px] w-5 bg-current transition-transform duration-500 ${EASE}`}
                    style={{
                      transform: menuOpen
                        ? "translate(-50%, 0) rotate(45deg)"
                        : "translate(-50%, -4px) rotate(0deg)",
                    }}
                  />
                  <span
                    className={`absolute left-1/2 top-1/2 block h-[1.5px] w-5 bg-current transition-transform duration-500 ${EASE}`}
                    style={{
                      transform: menuOpen
                        ? "translate(-50%, 0) rotate(-45deg)"
                        : "translate(-50%, 4px) rotate(0deg)",
                    }}
                  />
                </button>
              </div>
            </nav>

            {/* Scroll progress */}
            <span
              ref={barRef}
              aria-hidden="true"
              className={`absolute bottom-0 left-0 h-[2px] w-full origin-left bg-[var(--primary)] transition-opacity duration-300 ${menuOpen ? "opacity-0" : "opacity-100"
                }`}
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>
      </header>

      {/* ================= MOBILE MENU ================= */}
      <div
        ref={menuRef}
        id="mobile-menu"
        data-lenis-prevent
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-40 flex flex-col overflow-y-auto overscroll-contain bg-[var(--background)] text-[var(--text)] transition-[clip-path,visibility] duration-700 ${EASE} lg:hidden ${menuOpen ? "visible" : "invisible"
          }`}
        style={{
          clipPath: menuOpen
            ? `circle(150% at ${wipeOrigin})`
            : `circle(0px at ${wipeOrigin})`,
        }}
      >
        {/* Soft glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-72"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--primary) 14%, transparent), transparent 70%)",
          }}
        />

        <nav
          aria-label="Mobile navigation"
          className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col items-stretch justify-center gap-1 px-6 pb-4 pt-24 text-center sm:px-10"
        >
          {NAV_LINKS.map((link, i) => {
            const isActive = activeKey === link.to;

            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                tabIndex={menuOpen ? 0 : -1}
                onClick={handleNavClick(link.to)}
                aria-current={isActive ? "page" : undefined}
                style={{
                  color: isActive ? "var(--primary-text)" : "var(--text)",
                  transitionDelay: menuOpen ? `${280 + i * 70}ms` : "0ms",
                }}
                className={`group flex items-center justify-center gap-3 border-b border-[var(--border)] py-3.5 text-3xl font-bold tracking-tight transition-all duration-700 sm:py-4 sm:text-4xl ${EASE} hover:!text-[var(--primary-text)] focus-visible:!text-[var(--primary-text)] focus-visible:outline-none ${menuOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                  }`}
              >
                <span aria-hidden="true" className="h-2 w-2 shrink-0" />

                <span>{link.label}</span>

                <span
                  aria-hidden="true"
                  className={`h-2 w-2 shrink-0 rounded-full bg-[var(--primary)] transition-transform duration-300 ${isActive
                      ? "scale-100"
                      : "scale-0 group-hover:scale-100 group-focus-visible:scale-100"
                    }`}
                />
              </NavLink>
            );
          })}
        </nav>

        {/* Menu footer */}
        <div
          className={`relative mx-auto w-full max-w-2xl px-6 pt-4 transition-all duration-700 sm:px-10 ${EASE} ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          style={{
            transitionDelay: menuOpen
              ? `${280 + NAV_LINKS.length * 70}ms`
              : "0ms",
            paddingBottom: "max(2rem, env(safe-area-inset-bottom, 0px))",
          }}
        >
          {!loading && (
            <div className="grid grid-cols-2 gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to={dashboardPath}
                    tabIndex={menuOpen ? 0 : -1}
                    onClick={closeMenu}
                    style={primaryButtonStyle}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors hover:!bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    tabIndex={menuOpen ? 0 : -1}
                    onClick={handleLogout}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] px-4 text-sm font-semibold text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    tabIndex={menuOpen ? 0 : -1}
                    onClick={closeMenu}
                    style={{ color: "var(--text)" }}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-sm font-semibold transition-colors hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
                  >
                    Log in
                  </Link>

                  <Link
                    to="/register"
                    tabIndex={menuOpen ? 0 : -1}
                    onClick={closeMenu}
                    style={primaryButtonStyle}
                    className="inline-flex min-h-12 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors hover:!bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-4 text-xs text-[var(--text-subtle)]">
            <span>
              © TaskFlow {new Date().getFullYear()}. All rights reserved.
            </span>

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              tabIndex={menuOpen ? 0 : -1}
              style={{ color: "var(--text)" }}
              className="inline-flex items-center gap-1 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
            >
              GitHub
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;