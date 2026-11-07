import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, KeyRound, Loader2, Mail } from "lucide-react";

import { forgotPassword } from "../../services/auth.service.js";
import AuthLayout, {
    AuthBanner,
    accentLinkStyle,
    inputClass,
    primaryButtonClass,
    primaryButtonStyle,
    secondaryButtonClass,
} from "./AuthLayout";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sentTo, setSentTo] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (loading) return;
        setError("");

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            setError("Enter your email address.");
            return;
        }

        if (!EMAIL_REGEX.test(normalizedEmail)) {
            setError("Enter a valid email address.");
            return;
        }

        try {
            setLoading(true);

            // The API always answers with the same message, whether or not an
            // account exists, so the confirmation below is worded the same way.
            await forgotPassword(normalizedEmail);

            setSentTo(normalizedEmail);
        } catch (err) {
            if (!err.response) {
                setError("Can't reach the server. Check your connection and try again.");
                return;
            }

            setError(
                err.response?.data?.message ||
                "We couldn't send the reset link. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleUseAnotherEmail = () => {
        setSentTo("");
        setEmail("");
        setError("");
    };

    /* ---------- Confirmation ---------- */
    if (sentTo) {
        return (
            <AuthLayout
                stateKey="sent"
                icon={<Mail size={22} />}
                title="Check your email"
                subtitle={
                    <>
                        If an account exists for{" "}
                        <span className="break-all font-semibold text-[var(--text)]">
                            {sentTo}
                        </span>
                        , we&apos;ve sent a link to reset your password. It works for 15 minutes.
                    </>
                }
            >
                <p
                    data-reveal
                    role="status"
                    className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-center text-xs leading-5 text-[var(--text-muted)]"
                >
                    Nothing in your inbox? Check your spam folder, or try a different address.
                </p>

                <div data-reveal className="mt-6 space-y-3">
                    <Link to="/login" className={primaryButtonClass}
                        style={primaryButtonStyle}>
                        Back to sign in
                        <ArrowRight
                            size={15}
                            className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                    </Link>

                    <button
                        type="button"
                        onClick={handleUseAnotherEmail}
                        className={secondaryButtonClass}
                    >
                        Use a different email
                    </button>
                </div>
            </AuthLayout>
        );
    }

    /* ---------- Form ---------- */
    return (
        <AuthLayout
            stateKey="form"
            icon={<KeyRound size={22} />}
            title="Reset your password"
            subtitle="Enter your email address and we'll send you a link to choose a new password."
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
            <AuthBanner id="forgot-error" text={error} />

            <form
                onSubmit={handleSubmit}
                noValidate
                aria-busy={loading}
                className="mt-8 space-y-5"
            >
                <div data-reveal>
                    <label htmlFor="forgot-email" className="text-sm font-semibold">
                        Email address
                    </label>

                    <input
                        id="forgot-email"
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
                        aria-describedby={error ? "forgot-error" : undefined}
                        className={`${inputClass} mt-2`}
                        required
                    />
                </div>

                <div data-reveal>
                    <button type="submit" disabled={loading} className={primaryButtonClass}
                        style={primaryButtonStyle}>
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Sending link...
                            </>
                        ) : (
                            <>
                                Send reset link
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