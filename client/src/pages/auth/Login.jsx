
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    CheckCircle2,
    Eye,
    EyeOff,
    ArrowRight,
    CheckSquare,
} from "lucide-react";
import { loginUser } from "../../services/auth.service.js";

const inputClass =
    "mt-2 w-full rounded-lg border px-3.5 py-3 text-sm " +
    "outline-none transition-colors focus-visible:outline-2 " +
    "focus-visible:outline-[var(--focus)] placeholder:text-[var(--text-muted)]";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);

            await loginUser({
                email: normalizedEmail,
                password,
            });

            navigate("/dashboard", { replace: true });;
        } catch (err) {
            const responseData = err.response?.data;
            const verificationData = responseData?.data;

            if (verificationData?.requiresVerification) {
                navigate("/verify-otp", {
                    state: {
                        email: verificationData.email || normalizedEmail,
                    },
                    replace: true,
                });
                return;
            }

            if (!err.response) {
                setError(
                    "Unable to connect to the server. Please check your connection and try again."
                );
                return;
            }

            setError(
                responseData?.message ||
                "Unable to sign in. Please check your credentials and try again."
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
                            Welcome back
                        </p>

                        <h1 className="mt-4 max-w-sm text-4xl font-semibold leading-tight tracking-tight">
                            Make room for work that matters.
                        </h1>

                        <p
                            className="mt-5 max-w-sm text-sm leading-7"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Keep your tasks organized, move projects forward, and stay on
                            top of your deadlines — all in one place.
                        </p>
                    </div>

                    <div className="mt-12 space-y-4">
                        {[
                            "Organize work in one place",
                            "Keep projects moving forward",
                            "Stay focused on your priorities",
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

                    <p
                        className="mt-12 text-xs"
                        style={{ color: "var(--text-muted)" }}
                    >
                        A clearer way to work.
                    </p>
                </aside>

                {/* Login Form */}
                <section className="p-6 sm:p-10 xl:p-12">
                    <div className="mx-auto w-full max-w-md">
                        <div className="mb-8 lg:hidden">
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
                            Sign in to your account
                        </h2>

                        <p
                            className="mt-2 text-sm leading-6"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Welcome back. Enter your details to continue.
                        </p>

                        {error && (
                            <div
                                role="alert"
                                aria-live="polite"
                                className="mt-6 rounded-lg border px-4 py-3 text-sm leading-5"
                                style={{
                                    borderColor: "#dc7777",
                                    backgroundColor: "var(--surface)",
                                    color: "#c24141",
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                            <div>
                                <label
                                    htmlFor="login-email"
                                    className="text-sm font-medium"
                                >
                                    Email address
                                </label>

                                <input
                                    id="login-email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
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
                                <div className="flex items-center justify-between gap-3">
                                    <label
                                        htmlFor="login-password"
                                        className="text-sm font-medium"
                                    >
                                        Password
                                    </label>

                                    <Link
                                        to="/forgot-password"
                                        className="text-xs font-medium no-underline hover:underline sm:text-sm"
                                        style={{ color: "var(--primary)" }}
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <div className="relative">
                                    <input
                                        id="login-password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
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
                                            setShowPassword((current) => !current)
                                        }
                                        aria-label={
                                            showPassword ? "Hide password" : "Show password"
                                        }
                                        aria-pressed={showPassword}
                                        className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 rounded p-1 focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        {showPassword ? (
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
                                {loading ? (
                                    "Signing in..."
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight size={17} />
                                    </>
                                )}
                            </button>
                        </form>

                        <p
                            className="mt-7 text-center text-sm"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className="font-semibold no-underline hover:underline"
                                style={{ color: "var(--primary)" }}
                            >
                                Create an account
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
