import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ArrowRight, Check, Eye, EyeOff, Loader2 } from "lucide-react";

import { registerUser } from "../../services/auth.service.js";

/* ---------------------------------------------------------------
   Typography: Bricolage Grotesque for headings, Manrope (index.css)
   for everything else. Same loader as Login.jsx (de-duplicated by id).
---------------------------------------------------------------- */
const DISPLAY_FONT_ID = "login-display-font";
const DISPLAY_FONT_URL =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&display=swap";

const displayFont = {
  fontFamily:
    '"Bricolage Grotesque", "Manrope", ui-sans-serif, system-ui, sans-serif',
};

/* index.css sets an unlayered color on <a>, so link colors are inline */
const accentLinkStyle = { color: "var(--primary-text)" };

const inputClass =
  "h-12 w-full rounded-lg border px-4 text-base sm:text-sm " +
  "bg-[var(--surface)] text-[var(--text)] border-[var(--border)] " +
  "hover:border-[var(--border-strong)] " +
  "placeholder:text-[var(--text-subtle)] " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

const PASSWORD_RULES = [
  { label: "8+ characters", test: (p) => p.length >= 8 },
  { label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Number", test: (p) => /\d/.test(p) },
  { label: "Special character (@$!%*?&)", test: (p) => /[@$!%*?&]/.test(p) },
];

/* What happens after signing up (a real sequence, so it is numbered) */
const STEPS = [
  {
    title: "Create your account",
    text: "Add your name, email and a strong password.",
  },
  {
    title: "Verify your email",
    text: "Enter the one-time code we send to your inbox.",
  },
  {
    title: "Join a workspace",
    text: "A workspace owner or admin adds you using your registered email.",
  },
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Password input with an animated show/hide toggle */
function PasswordInput({
  id,
  name,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
  autoComplete,
  disabled,
  invalid,
  describedBy,
  toggleLabel,
}) {
  const iconBase = "absolute inset-0 transition-all duration-200 ease-out";

  return (
    <div className="relative mt-2">
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={`${inputClass} pr-12`}
        required
      />

      <button
        type="button"
        onClick={onToggle}
        aria-label={show ? `Hide ${toggleLabel}` : `Show ${toggleLabel}`}
        aria-pressed={show}
        className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
      >
        <span className="relative block h-[18px] w-[18px]">
          <Eye
            size={18}
            className={`${iconBase} ${show ? "-rotate-45 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
              }`}
          />
          <EyeOff
            size={18}
            className={`${iconBase} ${show ? "rotate-0 scale-100 opacity-100" : "rotate-45 scale-50 opacity-0"
              }`}
          />
        </span>
      </button>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    email: "",
    mobileNo: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const rootRef = useRef(null);
  const formRef = useRef(null);

  /* Keep the last error so the banner can fade out without going blank */
  const lastError = useRef("");
  if (error) lastError.current = error;

  const { password, confirmPassword } = formData;
  const hasConfirm = confirmPassword.length > 0;
  const passwordsMatch = password === confirmPassword;

  /* Load the heading font once */
  useEffect(() => {
    if (document.getElementById(DISPLAY_FONT_ID)) return;
    const link = document.createElement("link");
    link.id = DISPLAY_FONT_ID;
    link.rel = "stylesheet";
    link.href = DISPLAY_FONT_URL;
    document.head.appendChild(link);
  }, []);

  /* Page-load sequence + looping steps (one GSAP context, cleaned up) */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const steps = gsap.utils.toArray("[data-step]");
      const fills = gsap.utils.toArray("[data-dotfill]");
      const checks = gsap.utils.toArray("[data-dotcheck]");
      const nums = gsap.utils.toArray("[data-dotnum]");
      const links = gsap.utils.toArray("[data-link]");

      /* Reduced motion: no movement, show the first step as done */
      if (prefersReducedMotion()) {
        gsap.set(fills, { scale: (i) => (i === 0 ? 1 : 0) });
        gsap.set(checks, { opacity: (i) => (i === 0 ? 1 : 0), scale: 1 });
        gsap.set(nums, { opacity: (i) => (i === 0 ? 0 : 1) });
        gsap.set(links, { scaleY: 0 });
        return;
      }

      /* 1. Entrance */
      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .from("[data-line]", { yPercent: 110, duration: 1.1, stagger: 0.12 })
        .from("[data-fade]", { y: 16, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.45)
        .from(steps, { y: 24, opacity: 0, duration: 0.8, stagger: 0.1 }, 0.6)
        .from("[data-reveal]", { y: 26, opacity: 0, duration: 0.9, stagger: 0.07 }, 0.2);

      /* 2. Steps: complete one by one, hold, reset, repeat */
      gsap.set(fills, { scale: 0 });
      gsap.set(checks, { opacity: 0, scale: 0.4 });
      gsap.set(links, { scaleY: 0 });

      const loop = gsap.timeline({ repeat: -1, delay: 2.2 });

      steps.forEach((_, i) => {
        const t = i * 1.1;
        loop
          .to(fills[i], { scale: 1, duration: 0.35, ease: "back.out(2.2)" }, t)
          .to(nums[i], { opacity: 0, duration: 0.2 }, t)
          .to(
            checks[i],
            { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2)" },
            t + 0.1
          );
        if (links[i]) {
          loop.to(links[i], { scaleY: 1, duration: 0.6, ease: "power2.inOut" }, t + 0.35);
        }
      });

      const resetAt = steps.length * 1.1 + 1.6;
      loop
        .to(fills, { scale: 0, duration: 0.4, ease: "power2.in" }, resetAt)
        .to(checks, { opacity: 0, scale: 0.4, duration: 0.25 }, resetAt)
        .to(nums, { opacity: 1, duration: 0.4 }, resetAt)
        .to(links, { scaleY: 0, duration: 0.4, ease: "power2.in" }, resetAt)
        .to({}, { duration: 0.8 });
    }, root);

    return () => ctx.revert();
  }, []);

  /* Small shake when something is wrong */
  useEffect(() => {
    if (!error || prefersReducedMotion() || !formRef.current) return;
    gsap.fromTo(
      formRef.current,
      { x: -8 },
      { x: 0, duration: 0.7, ease: "elastic.out(1, 0.25)" }
    );
  }, [error]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setError("");

    const fullName = formData.fullName.trim();
    const userName = formData.userName.trim();
    const email = formData.email.trim().toLowerCase();
    const mobileNo = formData.mobileNo.trim();

    if (
      !fullName ||
      !userName ||
      !email ||
      !mobileNo ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (!passwordRegex.test(password)) {
      setError(
        "Use at least 8 characters with an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&)."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const result = await registerUser({
        fullName,
        userName,
        email,
        mobileNo,
        password,
      });

      // Registration starts email verification.
      // Workspace membership is handled separately.
      navigate("/verify-otp", {
        state: {
          email: result.data?.email || email,
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    /* 4rem = sticky navbar height */
    <main
      ref={rootRef}
      className="grid min-h-[calc(100dvh-4rem)] bg-[var(--background)] text-[var(--text)] lg:grid-cols-[1.1fr_1fr]"
    >
      {/* ---------- Welcome panel (desktop only) ---------- */}
      <aside className="hidden flex-col justify-between gap-12 overflow-hidden border-r border-[var(--border)] bg-[var(--primary-soft)] p-12 lg:flex xl:p-16">
        <div>
          <h2
            className="max-w-lg text-5xl font-extrabold leading-[1.05] tracking-tight xl:text-6xl"
            style={displayFont}
          >
            <span className="block overflow-hidden pb-2">
              <span data-line className="block">
                Bring your work
              </span>
            </span>
            <span className="block overflow-hidden pb-2">
              <span data-line className="block text-[var(--primary-text)]">
                together.
              </span>
            </span>
          </h2>

          <p
            data-fade
            className="mt-4 max-w-sm text-base leading-7 text-[var(--text-muted)]"
          >
            Organize tasks, manage projects, and collaborate with your team.
          </p>
        </div>

        <ol className="w-full max-w-md">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              data-step
              className={`relative pl-12 ${i < STEPS.length - 1 ? "pb-8" : ""}`}
            >
              {/* Dot */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[var(--border-strong)] bg-[var(--surface)]"
              >
                <span
                  data-dotfill
                  className="absolute inset-0 rounded-full bg-[var(--primary)]"
                />
                <span
                  data-dotnum
                  className="relative text-xs font-bold text-[var(--text-muted)]"
                >
                  {i + 1}
                </span>
                <Check
                  data-dotcheck
                  size={15}
                  strokeWidth={3}
                  className="absolute text-[var(--text-inverse)]"
                />
              </span>

              {/* Connector */}
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 left-[15.5px] top-9 w-px bg-[var(--border-strong)]"
                >
                  <span
                    data-link
                    className="block h-full w-full origin-top bg-[var(--primary)]"
                  />
                </span>
              )}

              <p className="text-sm font-semibold leading-8">{step.title}</p>
              <p className="max-w-xs text-sm leading-6 text-[var(--text-muted)]">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </aside>

      {/* ---------- Form ---------- */}
      <section className="flex items-center justify-center bg-[var(--surface)] px-5 py-10 sm:px-8 sm:py-14">
        <div ref={formRef} className="w-full max-w-md">
          <div data-reveal>
            <h1
              className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-4xl xl:text-5xl"
              style={displayFont}
            >
              Create your account
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)] sm:text-base">
              Enter your details to get started with TaskFlow.
            </p>
          </div>

          {/* Team note (mobile / tablet; desktop shows it as step 3) */}
          <div
            data-reveal
            className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 lg:hidden"
          >
            <p className="text-sm font-semibold">Joining a team?</p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
              Verify your email after registering. A workspace owner or admin can
              then add you to their workspace using your registered email
              address.
            </p>
          </div>

          {/* Error banner: slides open and closed */}
          <div
            role="alert"
            className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${error
                ? "mt-6 grid-rows-[1fr] opacity-100"
                : "mt-0 grid-rows-[0fr] opacity-0"
              }`}
          >
            <div className="overflow-hidden">
              <p
                id="register-error"
                className="rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm leading-5 text-[var(--danger)]"
              >
                {lastError.current}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            aria-busy={loading}
            className="mt-8 space-y-5"
          >
            <div data-reveal>
              <label htmlFor="fullName" className="text-sm font-semibold">
                Full name
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                autoCapitalize="words"
                autoFocus
                placeholder="Your full name"
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "register-error" : undefined}
                className={`${inputClass} mt-2`}
                required
              />
            </div>

            <div data-reveal className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="userName" className="text-sm font-semibold">
                  Username
                </label>

                <input
                  id="userName"
                  name="userName"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="Choose a username"
                  value={formData.userName}
                  onChange={handleChange}
                  disabled={loading}
                  className={`${inputClass} mt-2`}
                  required
                />
              </div>

              <div>
                <label htmlFor="mobileNo" className="text-sm font-semibold">
                  Mobile number
                </label>

                <input
                  id="mobileNo"
                  name="mobileNo"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Mobile number"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  disabled={loading}
                  className={`${inputClass} mt-2`}
                  required
                />
              </div>
            </div>

            <div data-reveal>
              <label htmlFor="register-email" className="text-sm font-semibold">
                Email address
              </label>

              <input
                id="register-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className={`${inputClass} mt-2`}
                required
              />
            </div>

            <div data-reveal>
              <label htmlFor="register-password" className="text-sm font-semibold">
                Password
              </label>

              <PasswordInput
                id="register-password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                show={showPassword}
                onToggle={() => setShowPassword((current) => !current)}
                placeholder="Create a strong password"
                autoComplete="new-password"
                disabled={loading}
                describedBy="password-rules"
                toggleLabel="password"
              />

              {/* Live requirements */}
              <ul
                id="password-rules"
                className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2"
              >
                {PASSWORD_RULES.map((rule) => {
                  const met = rule.test(password);
                  return (
                    <li
                      key={rule.label}
                      className={`flex items-center gap-2 text-xs transition-colors duration-200 ${met ? "text-[var(--success)]" : "text-[var(--text-subtle)]"
                        }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${met
                            ? "border-[var(--success)] bg-[var(--success)] text-[var(--text-inverse)]"
                            : "border-[var(--border-strong)]"
                          }`}
                      >
                        <Check
                          size={10}
                          strokeWidth={3.5}
                          className={`transition-all duration-200 ${met ? "scale-100 opacity-100" : "scale-50 opacity-0"
                            }`}
                        />
                      </span>
                      {rule.label}
                      <span className="sr-only">{met ? " (done)" : " (required)"}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div data-reveal>
              <label htmlFor="confirmPassword" className="text-sm font-semibold">
                Confirm password
              </label>

              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((current) => !current)}
                placeholder="Enter your password again"
                autoComplete="new-password"
                disabled={loading}
                invalid={hasConfirm && !passwordsMatch}
                describedBy="confirm-status"
                toggleLabel="confirm password"
              />

              <div
                id="confirm-status"
                aria-live="polite"
                className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${hasConfirm
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                  }`}
              >
                <p
                  className={`overflow-hidden pt-2 text-xs transition-colors duration-200 ${passwordsMatch ? "text-[var(--success)]" : "text-[var(--danger)]"
                    }`}
                >
                  {hasConfirm
                    ? passwordsMatch
                      ? "Passwords match."
                      : "Passwords don't match yet."
                    : ""}
                </p>
              </div>
            </div>

            <div data-reveal>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary group inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs leading-5 text-[var(--text-muted)]">
                You'll need to verify your email before using your account.
              </p>
            </div>
          </form>

          <p data-reveal className="mt-8 text-sm text-[var(--text-muted)]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold hover:underline"
              style={accentLinkStyle}
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}