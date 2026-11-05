import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { gsap } from "gsap";

import {
    ArrowRight,
    Check,
    Eye,
    EyeOff,
    Loader2,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";

/* ---------------------------------------------------------------
   Typography
---------------------------------------------------------------- */

const DISPLAY_FONT_ID = "login-display-font";

const DISPLAY_FONT_URL =
    "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&display=swap";

const displayFont = {
    fontFamily:
        '"Bricolage Grotesque", "Manrope", ui-sans-serif, system-ui, sans-serif',
};

const accentLinkStyle = {
    color: "var(--primary-text)",
};

const inputClass =
    "h-12 w-full rounded-lg border px-4 text-base sm:text-sm " +
    "bg-[var(--surface)] text-[var(--text)] border-[var(--border)] " +
    "hover:border-[var(--border-strong)] " +
    "placeholder:text-[var(--text-subtle)] " +
    "disabled:cursor-not-allowed disabled:opacity-60";

/* Tasks shown in the welcome panel */

const TASKS = [
    { label: "Review pull request #42", when: "Today" },
    { label: "Send sprint notes to the team", when: "Today" },
    { label: "Plan next week's priorities", when: "Fri" },
    { label: "Book the design review", when: "Mon" },
];

const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    // Use authentication state and login function from AuthProvider.
    const {
        login,
        isAuthenticated,
        loading: authLoading,
    } = useAuth();

    const notice = location.state?.message || "";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [capsLock, setCapsLock] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const rootRef = useRef(null);
    const formRef = useRef(null);

    /* Keep the last message so the banner can fade out without going blank */

    const message = error || notice;

    const lastMessage = useRef({
        text: "",
        isError: false,
    });

    if (message) {
        lastMessage.current = {
            text: message,
            isError: Boolean(error),
        };
    }

    /* Redirect users who are already authenticated */

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate("/dashboard", { replace: true });
        }
    }, [authLoading, isAuthenticated, navigate]);

    /* Load the heading font once */

    useEffect(() => {
        if (document.getElementById(DISPLAY_FONT_ID)) return;

        const link = document.createElement("link");

        link.id = DISPLAY_FONT_ID;
        link.rel = "stylesheet";
        link.href = DISPLAY_FONT_URL;

        document.head.appendChild(link);
    }, []);

    /* Page-load sequence + looping task list */

    useLayoutEffect(() => {
        const root = rootRef.current;

        if (!root) return;

        const ctx = gsap.context(() => {
            const rows = gsap.utils.toArray("[data-task]");
            const fills = gsap.utils.toArray("[data-fill]");
            const checks = gsap.utils.toArray("[data-check]");
            const strikes = gsap.utils.toArray("[data-strike]");
            const labels = gsap.utils.toArray("[data-label]");

            // Reduced motion: show a calm static state.
            if (prefersReducedMotion()) {
                gsap.set(fills, {
                    scale: (i) => (i < 2 ? 1 : 0),
                });

                gsap.set(checks, {
                    opacity: (i) => (i < 2 ? 1 : 0),
                    scale: 1,
                });

                gsap.set(strikes, {
                    scaleX: (i) => (i < 2 ? 1 : 0),
                });

                gsap.set(labels, {
                    opacity: (i) => (i < 2 ? 0.5 : 1),
                });

                return;
            }

            // Entrance animation.
            const intro = gsap.timeline({
                defaults: {
                    ease: "power4.out",
                },
            });

            intro
                .from("[data-line]", {
                    yPercent: 110,
                    duration: 1.1,
                    stagger: 0.12,
                })
                .from(
                    "[data-fade]",
                    {
                        y: 16,
                        opacity: 0,
                        duration: 0.9,
                        stagger: 0.1,
                    },
                    0.45
                )
                .from(
                    rows,
                    {
                        y: 24,
                        opacity: 0,
                        duration: 0.8,
                        stagger: 0.08,
                    },
                    0.6
                )
                .from(
                    "[data-reveal]",
                    {
                        y: 26,
                        opacity: 0,
                        duration: 0.9,
                        stagger: 0.07,
                    },
                    0.2
                );

            // Task-list animation.
            gsap.set(fills, { scale: 0 });
            gsap.set(checks, { opacity: 0, scale: 0.4 });
            gsap.set(strikes, { scaleX: 0 });

            const loop = gsap.timeline({
                repeat: -1,
                delay: 2.2,
            });

            rows.forEach((_, i) => {
                const t = i * 0.9;

                loop
                    .to(
                        fills[i],
                        {
                            scale: 1,
                            duration: 0.35,
                            ease: "back.out(2.2)",
                        },
                        t
                    )
                    .to(
                        checks[i],
                        {
                            opacity: 1,
                            scale: 1,
                            duration: 0.25,
                            ease: "back.out(2)",
                        },
                        t + 0.1
                    )
                    .to(
                        strikes[i],
                        {
                            scaleX: 1,
                            duration: 0.45,
                            ease: "power2.out",
                        },
                        t + 0.15
                    )
                    .to(
                        labels[i],
                        {
                            opacity: 0.5,
                            duration: 0.35,
                        },
                        t + 0.15
                    );
            });

            const resetAt = rows.length * 0.9 + 1.8;

            loop
                .to(
                    fills,
                    {
                        scale: 0,
                        duration: 0.4,
                        ease: "power2.in",
                    },
                    resetAt
                )
                .to(
                    checks,
                    {
                        opacity: 0,
                        scale: 0.4,
                        duration: 0.25,
                    },
                    resetAt
                )
                .to(
                    strikes,
                    {
                        scaleX: 0,
                        duration: 0.4,
                        ease: "power2.in",
                    },
                    resetAt
                )
                .to(
                    labels,
                    {
                        opacity: 1,
                        duration: 0.4,
                    },
                    resetAt
                )
                .to({}, { duration: 0.8 });
        }, root);

        return () => ctx.revert();
    }, []);

    /* Shake when sign-in fails */

    useEffect(() => {
        if (!error || prefersReducedMotion() || !formRef.current) {
            return;
        }

        gsap.fromTo(
            formRef.current,
            { x: -8 },
            {
                x: 0,
                duration: 0.7,
                ease: "elastic.out(1, 0.25)",
            }
        );
    }, [error]);

    /* Login submission */

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) return;

        setError("");

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            setError("Enter your email address and password.");
            return;
        }

        try {
            setLoading(true);

            // Authenticate through AuthProvider.
            // This also updates the global user state.
            await login({
                email: normalizedEmail,
                password,
            });

            // Redirect after successful authentication.
            navigate("/dashboard", {
                replace: true,
            });
        } catch (err) {
            const responseData = err.response?.data;
            const verificationData = responseData?.data;

            if (verificationData?.requiresVerification) {
                navigate("/verify-otp", {
                    state: {
                        email:
                            verificationData.email ||
                            normalizedEmail,
                    },
                    replace: true,
                });

                return;
            }

            if (!err.response) {
                setError(
                    "Can't reach the server. Check your connection and try again."
                );

                return;
            }

            setError(
                responseData?.message ||
                "We couldn't sign you in. Check your email and password, then try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleKeyEvent = (event) => {
        setCapsLock(
            event.getModifierState?.("CapsLock") ?? false
        );
    };

    const iconBase =
        "absolute inset-0 transition-all duration-200 ease-out";

    return (
        <main
            ref={rootRef}
            className="grid min-h-[calc(100dvh-4rem)] bg-[var(--background)] text-[var(--text)] lg:grid-cols-[1.1fr_1fr]"
        >
            {/* Welcome panel */}

            <aside className="hidden flex-col justify-between gap-12 overflow-hidden border-r border-[var(--border)] bg-[var(--primary-soft)] p-12 lg:flex xl:p-16">
                <div>
                    <h2
                        className="max-w-lg text-5xl font-extrabold leading-[1.05] tracking-tight xl:text-6xl"
                        style={displayFont}
                    >
                        <span className="block overflow-hidden pb-2">
                            <span data-line className="block">
                                Pick up where
                            </span>
                        </span>

                        <span className="block overflow-hidden pb-2">
                            <span
                                data-line
                                className="block text-[var(--primary-text)]"
                            >
                                you left off.
                            </span>
                        </span>
                    </h2>

                    <p
                        data-fade
                        className="mt-4 max-w-sm text-base leading-7 text-[var(--text-muted)]"
                    >
                        Your tasks, projects and deadlines are right
                        where you left them.
                    </p>
                </div>

                <ul
                    aria-hidden="true"
                    className="w-full max-w-md divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"
                >
                    {TASKS.map((task) => (
                        <li
                            key={task.label}
                            data-task
                            className="flex items-center gap-3.5 px-4 py-3.5"
                        >
                            <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-md border border-[var(--border-strong)]">
                                <span
                                    data-fill
                                    className="absolute inset-0 bg-[var(--primary)]"
                                />

                                <Check
                                    data-check
                                    size={13}
                                    strokeWidth={3}
                                    className="absolute left-1/2 top-1/2 -ml-[6.5px] -mt-[6.5px] text-[var(--text-inverse)]"
                                />
                            </span>

                            <span
                                data-label
                                className="relative min-w-0 flex-1 truncate text-sm font-medium"
                            >
                                {task.label}

                                <span
                                    data-strike
                                    className="absolute left-0 top-1/2 h-px w-full origin-left bg-current"
                                />
                            </span>

                            <span className="shrink-0 text-xs text-[var(--text-subtle)]">
                                {task.when}
                            </span>
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Login form */}

            <section className="flex items-center justify-center bg-[var(--surface)] px-5 py-10 sm:px-8 sm:py-14">
                <div ref={formRef} className="w-full max-w-md">
                    <div data-reveal>
                        <h1
                            className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-4xl xl:text-5xl"
                            style={displayFont}
                        >
                            Welcome back
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)] sm:text-base">
                            Sign in to see what's on your plate today.
                        </p>
                    </div>

                    {/* Message banner */}

                    <div
                        role={
                            lastMessage.current.isError
                                ? "alert"
                                : "status"
                        }
                        className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${message
                                ? "mt-6 grid-rows-[1fr] opacity-100"
                                : "mt-0 grid-rows-[0fr] opacity-0"
                            }`}
                    >
                        <div className="overflow-hidden">
                            <p
                                id="login-error"
                                className={`rounded-lg px-4 py-3 text-sm leading-5 ${lastMessage.current.isError
                                        ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                                        : "bg-[var(--info-soft)] text-[var(--info)]"
                                    }`}
                            >
                                {lastMessage.current.text}
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        aria-busy={loading}
                        className="mt-8 space-y-5"
                    >
                        {/* Email */}

                        <div data-reveal>
                            <label
                                htmlFor="login-email"
                                className="text-sm font-semibold"
                            >
                                Email address
                            </label>

                            <input
                                id="login-email"
                                name="email"
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                autoCapitalize="none"
                                spellCheck={false}
                                autoFocus
                                placeholder="you@example.com"
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);

                                    if (error) {
                                        setError("");
                                    }
                                }}
                                disabled={loading}
                                aria-invalid={Boolean(error)}
                                aria-describedby={
                                    error ? "login-error" : undefined
                                }
                                className={`${inputClass} mt-2`}
                                required
                            />
                        </div>

                        {/* Password */}

                        <div data-reveal>
                            <div className="flex items-center justify-between gap-3">
                                <label
                                    htmlFor="login-password"
                                    className="text-sm font-semibold"
                                >
                                    Password
                                </label>

                                <Link
                                    to="/forgot-password"
                                    className="text-sm font-medium hover:underline"
                                    style={accentLinkStyle}
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <div className="relative mt-2">
                                <input
                                    id="login-password"
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) => {
                                        setPassword(event.target.value);

                                        if (error) {
                                            setError("");
                                        }
                                    }}
                                    onKeyUp={handleKeyEvent}
                                    onKeyDown={handleKeyEvent}
                                    onBlur={() => setCapsLock(false)}
                                    disabled={loading}
                                    aria-invalid={Boolean(error)}
                                    aria-describedby={
                                        error ? "login-error" : undefined
                                    }
                                    className={`${inputClass} pr-12`}
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((current) => !current)
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    aria-pressed={showPassword}
                                    className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
                                >
                                    <span className="relative block h-[18px] w-[18px]">
                                        <Eye
                                            size={18}
                                            className={`${iconBase} ${showPassword
                                                    ? "-rotate-45 scale-50 opacity-0"
                                                    : "rotate-0 scale-100 opacity-100"
                                                }`}
                                        />

                                        <EyeOff
                                            size={18}
                                            className={`${iconBase} ${showPassword
                                                    ? "rotate-0 scale-100 opacity-100"
                                                    : "rotate-45 scale-50 opacity-0"
                                                }`}
                                        />
                                    </span>
                                </button>
                            </div>

                            {/* Caps Lock warning */}

                            <div
                                className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${capsLock
                                        ? "grid-rows-[1fr] opacity-100"
                                        : "grid-rows-[0fr] opacity-0"
                                    }`}
                            >
                                <p
                                    role="status"
                                    className="overflow-hidden pt-2 text-xs text-[var(--warning)]"
                                >
                                    {capsLock ? "Caps Lock is on." : ""}
                                </p>
                            </div>
                        </div>

                        {/* Submit */}

                        <div data-reveal>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary group inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in

                                        <ArrowRight
                                            size={15}
                                            className="transition-transform duration-200 group-hover:translate-x-1"
                                        />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <p
                        data-reveal
                        className="mt-8 text-sm text-[var(--text-muted)]"
                    >
                        New to TaskFlow?{" "}

                        <Link
                            to="/register"
                            className="font-semibold hover:underline"
                            style={accentLinkStyle}
                        >
                            Create an account
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
}