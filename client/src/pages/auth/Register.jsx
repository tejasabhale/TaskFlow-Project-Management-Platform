import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Loader2, UserPlus } from "lucide-react";

import { registerUser } from "../../services/auth.service.js";
import AuthLayout, {
  AuthBanner,
  PasswordInput,
  accentLinkStyle,
  inputClass,
  primaryButtonClass,
  primaryButtonStyle,
} from "./AuthLayout";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

const PASSWORD_RULES = [
  { label: "8+ characters", test: (p) => p.length >= 8 },
  { label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Number", test: (p) => /\d/.test(p) },
  { label: "Special character (@$!%*?&)", test: (p) => /[@$!%*?&]/.test(p) },
];

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

  const { password, confirmPassword } = formData;
  const hasConfirm = confirmPassword.length > 0;
  const passwordsMatch = password === confirmPassword;

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
    <AuthLayout
      icon={<UserPlus size={22} />}
      title="Create your account"
      subtitle="Enter your details to get started with TaskFlow."
      error={error}
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold hover:underline"
            style={accentLinkStyle}
          >
            Sign in
          </Link>
        </>
      }
    >
      <AuthBanner id="register-error" text={error} />

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

        {/* Team note: replaces the old "step 3" now that the side panel is gone */}
        <div
          data-reveal
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
        >
          <p className="text-sm font-semibold">Joining a team?</p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
            Verify your email after registering. A workspace owner or admin can
            then add you to their workspace using your registered email address.
          </p>
        </div>

        <div data-reveal>
          <button type="submit" disabled={loading} className={primaryButtonClass}
            style={primaryButtonStyle}>
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
            You&apos;ll need to verify your email before using your account.
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}