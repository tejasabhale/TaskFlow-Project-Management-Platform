
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    CheckCircle2,
    CheckSquare,
    Mail,
    RefreshCw,
    ShieldCheck,
} from "lucide-react";
import {
    verifyOtp as verifyEmailOtp,
    resendOtp,
} from "../../services/auth.service.js";

const inputClass =
    "mt-2 w-full rounded-lg border px-3.5 py-3 text-sm " +
    "outline-none transition-colors focus-visible:outline-2 " +
    "focus-visible:outline-[var(--focus)] placeholder:text-[var(--text-muted)]";

export default function VerifyOtp() {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState(
        location.state?.email || ""
    );
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = window.setTimeout(() => {
            setCooldown((current) => Math.max(0, current - 1));
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [cooldown]);

    const handleOtpChange = (event) => {
        const value = event.target.value.replace(/\D/g, "").slice(0, 6);
        setOtp(value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            setError("Please enter your email address.");
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            setError("Please enter the complete 6-digit OTP.");
            return;
        }

        try {
            setLoading(true);

            await verifyEmailOtp(normalizedEmail, otp);

            navigate("/", { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "OTP verification failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError("");
        setMessage("");

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            setError("Please enter your email address.");
            return;
        }

        try {
            setResending(true);

            await resendOtp(normalizedEmail);

            setOtp("");
            setCooldown(60);
            setMessage("A new verification code has been sent to your email.");
        } catch (err) {
            const status = err.response?.status;
            const responseMessage = err.response?.data?.message;

            if (status === 429) {
                setCooldown(60);
            }

            setError(
                responseMessage ||
                err.message ||
                "Unable to resend the OTP. Please try again."
            );
        } finally {
            setResending(false);
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
                            <ShieldCheck size={25} strokeWidth={1.8} />
                        </div>

                        <p
                            className="text-xs font-semibold uppercase tracking-[0.18em]"
                            style={{ color: "var(--primary)" }}
                        >
                            Account security
                        </p>

                        <h1 className="mt-4 max-w-sm text-4xl font-semibold leading-tight tracking-tight">
                            One small step to get started.
                        </h1>

                        <p
                            className="mt-5 max-w-sm text-sm leading-7"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Verify your email address to secure your account and get started
                            with your tasks and projects.
                        </p>
                    </div>

                    <div className="mt-12 space-y-4">
                        {[
                            "Verify your email address",
                            "Protect access to your account",
                            "Get started with TaskFlow",
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
                        Your work starts here.
                    </p>
                </aside>

                {/* OTP Verification Form */}
                <section className="flex items-center p-6 sm:p-10 xl:p-12">
                    <div className="mx-auto w-full max-w-md">
                        <div
                            className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                            style={{
                                backgroundColor: "var(--primary-soft, #e1f2ef)",
                                color: "var(--primary)",
                            }}
                        >
                            <Mail size={24} strokeWidth={1.8} />
                        </div>

                        <p
                            className="text-xs font-semibold uppercase tracking-[0.16em]"
                            style={{ color: "var(--primary)" }}
                        >
                            Email verification
                        </p>

                        <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                            Verify your email
                        </h2>

                        <p
                            className="mt-3 text-sm leading-6"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Enter the 6-digit verification code sent to your email address.
                            The code expires after 5 minutes.
                        </p>

                        {error && (
                            <div
                                role="alert"
                                className="mt-6 rounded-lg border px-4 py-3 text-sm leading-5"
                                style={{
                                    borderColor: "#dc7777",
                                    color: "#c24141",
                                    backgroundColor: "var(--surface)",
                                }}
                            >
                                {error}
                            </div>
                        )}

                        {message && (
                            <div
                                role="status"
                                className="mt-6 rounded-lg border px-4 py-3 text-sm leading-5"
                                style={{
                                    borderColor: "var(--primary)",
                                    color: "var(--primary)",
                                    backgroundColor: "var(--surface)",
                                }}
                            >
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                            <div>
                                <label
                                    htmlFor="verify-email"
                                    className="text-sm font-medium"
                                >
                                    Email address
                                </label>

                                <input
                                    id="verify-email"
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
                                <label
                                    htmlFor="verify-otp"
                                    className="text-sm font-medium"
                                >
                                    Verification code
                                </label>

                                <input
                                    id="verify-otp"
                                    name="otp"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    pattern="[0-9]{6}"
                                    maxLength={6}
                                    placeholder="Enter 6-digit code"
                                    value={otp}
                                    onChange={handleOtpChange}
                                    className={`${inputClass} text-center text-xl font-semibold tracking-[0.45em]`}
                                    style={{
                                        backgroundColor: "var(--surface)",
                                        color: "var(--text)",
                                        borderColor: "var(--border)",
                                    }}
                                    required
                                />

                                <p
                                    className="mt-2 text-xs"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    Check your inbox and spam folder for the email.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                style={{
                                    backgroundColor: "var(--primary)",
                                    color: "#ffffff",
                                }}
                            >
                                {loading ? "Verifying..." : "Verify Email"}
                                {!loading && <ArrowRight size={17} />}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p
                                className="text-sm"
                                style={{ color: "var(--text-muted)" }}
                            >
                                Didn't receive the code?
                            </p>

                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={resending || cooldown > 0}
                                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                                style={{ color: "var(--primary)" }}
                            >
                                <RefreshCw
                                    size={15}
                                    className={resending ? "animate-spin" : ""}
                                />

                                {resending
                                    ? "Sending code..."
                                    : cooldown > 0
                                        ? `Resend code in ${cooldown}s`
                                        : "Resend verification code"}
                            </button>
                        </div>

                        <p
                            className="mt-7 text-center text-sm"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Already verified?{" "}
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
