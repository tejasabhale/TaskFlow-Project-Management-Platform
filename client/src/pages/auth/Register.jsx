import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  CheckSquare,
  Eye,
  EyeOff,
} from "lucide-react";

import { registerUser } from "../../services/auth.service.js";

const inputClass =
  "mt-2 w-full rounded-lg border px-3.5 py-3 text-sm " +
  "outline-none transition-colors focus-visible:outline-2 " +
  "focus-visible:outline-[var(--focus)] placeholder:text-[var(--text-muted)]";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

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
    setError("");

    const fullName = formData.fullName.trim();
    const userName = formData.userName.trim();
    const email = formData.email.trim().toLowerCase();
    const mobileNo = formData.mobileNo.trim();
    const { password, confirmPassword } = formData;

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
    <main
      className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10 sm:px-6"
      style={{
        backgroundColor: "var(--bg, #f7faf9)",
        color: "var(--text)",
      }}
    >
      <div
        className="grid w-full max-w-5xl overflow-hidden rounded-2xl border lg:grid-cols-2"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        {/* Welcome Panel */}
        <aside
          className="hidden flex-col justify-between border-r p-10 lg:flex xl:p-12"
          style={{
            backgroundColor: "var(--surface-muted)",
            borderColor: "var(--border)",
          }}
        >
          <div>
            <div
              className="mb-10 inline-flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "var(--primary-soft, #e1f2ef)",
                color: "var(--primary)",
              }}
            >
              <CheckSquare size={25} strokeWidth={1.8} />
            </div>

            <p
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: "var(--primary)" }}
            >
              Get started
            </p>

            <h1 className="mt-4 max-w-sm text-4xl font-semibold leading-tight tracking-tight">
              Bring your work together.
            </h1>

            <p
              className="mt-5 max-w-sm text-sm leading-7"
              style={{ color: "var(--text-muted)" }}
            >
              Create your TaskFlow account to organize tasks, manage projects,
              and collaborate with your team.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {[
              "A clear view of your tasks",
              "Projects organized in one place",
              "Collaborate through shared workspaces",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2
                  size={18}
                  strokeWidth={1.8}
                  style={{ color: "var(--primary)" }}
                />

                <span
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-12 text-xs" style={{ color: "var(--text-muted)" }}>
            Start organized. Stay focused.
          </p>
        </aside>

        {/* Registration Form */}
        <section className="p-6 sm:p-10 xl:p-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-7 lg:hidden">
              <div
                className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: "var(--primary-soft, #e1f2ef)",
                  color: "var(--primary)",
                }}
              >
                <CheckSquare size={22} />
              </div>

              <p
                className="text-xs font-semibold uppercase tracking-[0.16em]"
                style={{ color: "var(--primary)" }}
              >
                TaskFlow
              </p>
            </div>

            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Create your account
            </h2>

            <p
              className="mt-2 text-sm leading-6"
              style={{ color: "var(--text-muted)" }}
            >
              Enter your details to get started with TaskFlow.
            </p>

            {/* Workspace membership information */}
            <div
              className="mt-5 rounded-lg border px-4 py-3"
              style={{
                backgroundColor: "var(--surface-muted)",
                borderColor: "var(--border)",
              }}
            >
              <p className="text-sm font-medium">
                Joining a team?
              </p>

              <p
                className="mt-1 text-xs leading-5"
                style={{ color: "var(--text-muted)" }}
              >
                Verify your email after registering. A workspace owner or admin
                can then add you to their workspace using your registered email
                address.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-lg border px-4 py-3 text-sm leading-5"
                style={{
                  borderColor: "#dc7777",
                  backgroundColor: "var(--surface)",
                  color: "#c24141",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div>
                <label htmlFor="fullName" className="text-sm font-medium">
                  Full name
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  autoCapitalize="words"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={inputClass}
                  style={{
                    backgroundColor: "var(--surface)",
                    color: "var(--text)",
                    borderColor: "var(--border)",
                  }}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="userName" className="text-sm font-medium">
                    Username
                  </label>

                  <input
                    id="userName"
                    name="userName"
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    placeholder="Choose a username"
                    value={formData.userName}
                    onChange={handleChange}
                    className={inputClass}
                    style={{
                      backgroundColor: "var(--surface)",
                      color: "var(--text)",
                      borderColor: "var(--border)",
                    }}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="mobileNo" className="text-sm font-medium">
                    Mobile number
                  </label>

                  <input
                    id="mobileNo"
                    name="mobileNo"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Mobile number"
                    value={formData.mobileNo}
                    onChange={handleChange}
                    className={inputClass}
                    style={{
                      backgroundColor: "var(--surface)",
                      color: "var(--text)",
                      borderColor: "var(--border)",
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-email" className="text-sm font-medium">
                  Email address
                </label>

                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  style={{
                    backgroundColor: "var(--surface)",
                    color: "var(--text)",
                    borderColor: "var(--border)",
                  }}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="register-password"
                  className="text-sm font-medium"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="register-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${inputClass} pr-12`}
                    style={{
                      backgroundColor: "var(--surface)",
                      color: "var(--text)",
                      borderColor: "var(--border)",
                    }}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 rounded p-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <p
                  className="mt-2 text-xs leading-5"
                  style={{ color: "var(--text-muted)" }}
                >
                  At least 8 characters, including uppercase, lowercase, number,
                  and special character (@$!%*?&).
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter your password again"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`${inputClass} pr-12`}
                    style={{
                      backgroundColor: "var(--surface)",
                      color: "var(--text)",
                      borderColor: "var(--border)",
                    }}
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 rounded p-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "#ffffff",
                }}
              >
                {loading ? "Creating account..." : "Create Account"}

                {!loading && <ArrowRight size={17} />}
              </button>

              <p
                className="pt-1 text-center text-xs leading-5"
                style={{ color: "var(--text-muted)" }}
              >
                You will need to verify your email before using your account.
              </p>
            </form>

            <p
              className="mt-6 text-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold no-underline hover:underline"
                style={{ color: "var(--primary)" }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}