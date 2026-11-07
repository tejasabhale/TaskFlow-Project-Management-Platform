import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2, LockKeyhole } from "lucide-react";

import { resetPassword } from "../../services/auth.service.js";
import AuthLayout, {
  AuthBanner,
  PasswordInput,
  accentLinkStyle,
  primaryButtonClass,
  primaryButtonStyle,
} from "./AuthLayout";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const hasConfirm = confirmPassword.length > 0;
  const isMatch = Boolean(newPassword) && newPassword === confirmPassword;

  /* Live requirements, same pattern as the register page */
  const rules = [
    { label: "8+ characters", met: newPassword.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(newPassword) },
    { label: "Lowercase letter", met: /[a-z]/.test(newPassword) },
    { label: "Number", met: /\d/.test(newPassword) },
    { label: "Special character (@$!%*?&)", met: /[@$!%*?&]/.test(newPassword) },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setError("");

    if (!token) {
      setError("Reset token is missing from the URL.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      setError(
        "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special symbol (@$!%*?&)."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, newPassword, confirmPassword);
      setSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reset password. The link may be expired."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Confirmation ---------- */
  if (success) {
    return (
      <AuthLayout
        stateKey="done"
        icon={<Check size={24} strokeWidth={3} />}
        iconTone="success"
        title="Password updated"
        subtitle="Your password has been securely updated. You can now sign in with your new credentials."
      >
        <div data-reveal role="status" className="mt-8">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className={primaryButtonClass}
            style={primaryButtonStyle}
          >
            Continue to sign in
            <ArrowRight
              size={15}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </button>
        </div>
      </AuthLayout>
    );
  }

  /* ---------- Form ---------- */
  return (
    <AuthLayout
      stateKey="form"
      icon={<LockKeyhole size={22} />}
      title="Set a new password"
      subtitle="Choose a strong, unique password to protect your workspace."
      error={error}
      footer={
        <Link
          to="/login"
          className="group inline-flex items-center gap-1.5 font-semibold hover:underline"
          style={accentLinkStyle}
        >
          <ArrowLeft
            size={15}
            className="transition-transform duration-200 group-hover:-translate-x-1"
          />
          Back to sign in
        </Link>
      }
    >
      <AuthBanner id="reset-error" text={error} />

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-busy={loading}
        className="mt-8 space-y-5"
      >
        <div data-reveal>
          <label htmlFor="new-password" className="text-sm font-semibold">
            New password
          </label>

          <PasswordInput
            id="new-password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (error) setError("");
            }}
            show={showPassword}
            onToggle={() => setShowPassword((current) => !current)}
            placeholder="Create a strong password"
            autoComplete="new-password"
            disabled={loading}
            describedBy="reset-rules"
            toggleLabel="password"
          />

          <ul
            id="reset-rules"
            className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2"
          >
            {rules.map((rule) => (
              <li
                key={rule.label}
                className={`flex items-center gap-2 text-xs transition-colors duration-200 ${rule.met ? "text-[var(--success)]" : "text-[var(--text-subtle)]"
                  }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${rule.met
                    ? "border-[var(--success)] bg-[var(--success)] text-[var(--text-inverse)]"
                    : "border-[var(--border-strong)]"
                    }`}
                >
                  <Check
                    size={10}
                    strokeWidth={3.5}
                    className={`transition-all duration-200 ${rule.met ? "scale-100 opacity-100" : "scale-50 opacity-0"
                      }`}
                  />
                </span>
                {rule.label}
                <span className="sr-only">{rule.met ? " (done)" : " (required)"}</span>
              </li>
            ))}
          </ul>
        </div>

        <div data-reveal>
          <label htmlFor="confirm-password" className="text-sm font-semibold">
            Confirm new password
          </label>

          <PasswordInput
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error) setError("");
            }}
            show={showConfirm}
            onToggle={() => setShowConfirm((current) => !current)}
            placeholder="Enter your password again"
            autoComplete="new-password"
            disabled={loading}
            invalid={hasConfirm && !isMatch}
            describedBy="reset-confirm-status"
            toggleLabel="confirm password"
          />

          <div
            id="reset-confirm-status"
            aria-live="polite"
            className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${hasConfirm
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
              }`}
          >
            <p
              className={`overflow-hidden pt-2 text-xs transition-colors duration-200 ${isMatch ? "text-[var(--success)]" : "text-[var(--danger)]"
                }`}
            >
              {hasConfirm
                ? isMatch
                  ? "Passwords match."
                  : "Passwords don't match yet."
                : ""}
            </p>
          </div>
        </div>

        <div data-reveal>
          <button type="submit" disabled={loading} className={primaryButtonClass}
            style={primaryButtonStyle}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Updating password...
              </>
            ) : (
              <>
                Reset password
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </>
            )}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}