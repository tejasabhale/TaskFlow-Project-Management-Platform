import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, LogIn } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import AuthLayout, {
    AuthBanner,
    PasswordInput,
    accentLinkStyle,
    inputClass,
    primaryButtonClass,
    primaryButtonStyle,
} from "./AuthLayout";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    // Use authentication state and login function from AuthProvider.
    const { login, isAuthenticated, loading: authLoading } = useAuth();

    const notice = location.state?.message || "";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [capsLock, setCapsLock] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /* Redirect users who are already authenticated */
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate("/dashboard", { replace: true });
        }
    }, [authLoading, isAuthenticated, navigate]);

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
            await login({ email: normalizedEmail, password });

            // Redirect after successful authentication.
            navigate("/dashboard", { replace: true });
        } catch (err) {
            const responseData = err.response?.data;
            const verificationData = responseData?.data;

            if (verificationData?.requiresVerification) {
                navigate("/verify-otp", {
                    state: { email: verificationData.email || normalizedEmail },
                    replace: true,
                });

                return;
            }

            if (!err.response) {
                setError("Can't reach the server. Check your connection and try again.");
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
        setCapsLock(event.getModifierState?.("CapsLock") ?? false);
    };

    return (
        <AuthLayout
            icon={<LogIn size={22} />}
            title="Welcome back"
            subtitle="Sign in to see what's on your plate today."
            error={error}
            footer={
                <>
                    New to TaskFlow?{" "}
                    <Link
                        to="/register"
                        className="font-semibold hover:underline"
                        style={accentLinkStyle}
                    >
                        Create an account
                    </Link>
                </>
            }
        >
            <AuthBanner
                id="login-error"
                text={error || notice}
                variant={error ? "error" : "info"}
            />

            <form
                onSubmit={handleSubmit}
                noValidate
                aria-busy={loading}
                className="mt-8 space-y-5"
            >
                <div data-reveal>
                    <label htmlFor="login-email" className="text-sm font-semibold">
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
                            if (error) setError("");
                        }}
                        disabled={loading}
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? "login-error" : undefined}
                        className={`${inputClass} mt-2`}
                        required
                    />
                </div>

                <div data-reveal>
                    <div className="flex items-center justify-between gap-3">
                        <label htmlFor="login-password" className="text-sm font-semibold">
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

                    <PasswordInput
                        id="login-password"
                        name="password"
                        value={password}
                        onChange={(event) => {
                            setPassword(event.target.value);
                            if (error) setError("");
                        }}
                        onKeyUp={handleKeyEvent}
                        onKeyDown={handleKeyEvent}
                        onBlur={() => setCapsLock(false)}
                        show={showPassword}
                        onToggle={() => setShowPassword((current) => !current)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        disabled={loading}
                        invalid={Boolean(error)}
                        describedBy={error ? "login-error" : undefined}
                        toggleLabel="password"
                    />

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

                <div data-reveal>
                    <button type="submit" disabled={loading} className={primaryButtonClass}
                        style={primaryButtonStyle}>
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
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
        </AuthLayout>
    );
}