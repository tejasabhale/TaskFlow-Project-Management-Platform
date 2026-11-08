import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Loader2, ShieldCheck } from "lucide-react";

import {
    resendOtp as resendOtpRequest,
    verifyOtp as verifyOtpRequest,
} from "../../services/auth.service.js";
import AuthLayout, {
    AuthBanner,
    accentLinkStyle,
    primaryButtonClass,
    primaryButtonStyle,
} from "./AuthLayout";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds, matches the API cooldown
const EMPTY_CODE = Array(OTP_LENGTH).fill("");

const otpBoxClass =
    "h-12 sm:h-14 w-full min-w-0 rounded-xl border text-center text-xl min-[400px]:text-2xl font-bold tabular-nums " +
    "bg-[var(--background)] text-[var(--text)] border-[var(--border)] " +
    "hover:border-[var(--border-strong)] " +
    "disabled:cursor-not-allowed disabled:opacity-60";

export default function VerifyOtp() {
    const navigate = useNavigate();
    const location = useLocation();

    /* Register and Login both pass the email through router state */
    const email = location.state?.email || "";

    const [digits, setDigits] = useState(EMPTY_CODE);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [verified, setVerified] = useState(false);
    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const inputsRef = useRef([]);

    /* Nothing to verify without an email: send people back to sign in */
    useEffect(() => {
        if (!email) navigate("/login", { replace: true });
    }, [email, navigate]);

    /* Resend countdown */
    useEffect(() => {
        if (cooldown <= 0) return;
        const id = setTimeout(() => setCooldown((current) => current - 1), 1000);
        return () => clearTimeout(id);
    }, [cooldown]);

    /* Continue into the app after a successful verification */
    useEffect(() => {
        if (!verified) return;

        // verify-otp signs the user in (cookies are set by the API). A full
        // load lets AuthProvider restore the session from /auth/session.
        const id = setTimeout(() => {
            window.location.replace("/dashboard");
        }, 1400);

        return () => clearTimeout(id);
    }, [verified]);

    const focusInput = (index) => {
        const input = inputsRef.current[index];
        if (input) {
            input.focus();
            input.select();
        }
    };

    const clearMessages = () => {
        if (error) setError("");
        if (notice) setNotice("");
    };

    const submit = async (code) => {
        if (loading || verified) return;

        setError("");
        setNotice("");

        if (code.length !== OTP_LENGTH) {
            setError(`Enter the ${OTP_LENGTH}-digit code from your email.`);
            return;
        }

        try {
            setLoading(true);

            await verifyOtpRequest(email, code);

            setVerified(true);
        } catch (err) {
            setDigits(EMPTY_CODE);

            if (!err.response) {
                setError("Can't reach the server. Check your connection and try again.");
            } else {
                const apiMessage =
                    err.response?.data?.message ||
                    "We couldn't verify that code. Please try again.";

                const needsNewCode =
                    err.response.status === 429 || /expired|no otp/i.test(apiMessage);

                setError(
                    needsNewCode ? `${apiMessage} Request a new code below.` : apiMessage
                );
            }

            // Wait for the inputs to re-enable before moving focus.
            setTimeout(() => focusInput(0), 0);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (index, event) => {
        const value = event.target.value.replace(/\D/g, "");

        clearMessages();

        if (!value) {
            setDigits((current) => {
                const next = [...current];
                next[index] = "";
                return next;
            });
            return;
        }

        const next = [...digits];
        next[index] = value.slice(-1);
        setDigits(next);

        if (index < OTP_LENGTH - 1) {
            focusInput(index + 1);
        }

        if (next.every(Boolean)) {
            submit(next.join(""));
        }
    };

    const handleKeyDown = (index, event) => {
        if (event.key === "Backspace" && !digits[index] && index > 0) {
            event.preventDefault();

            setDigits((current) => {
                const next = [...current];
                next[index - 1] = "";
                return next;
            });

            focusInput(index - 1);
        }

        if (event.key === "ArrowLeft" && index > 0) {
            event.preventDefault();
            focusInput(index - 1);
        }

        if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
            event.preventDefault();
            focusInput(index + 1);
        }
    };

    const handlePaste = (event) => {
        const pasted = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, OTP_LENGTH);

        if (!pasted) return;

        event.preventDefault();
        clearMessages();

        const next = [...EMPTY_CODE];
        pasted.split("").forEach((char, i) => {
            next[i] = char;
        });
        setDigits(next);

        if (pasted.length === OTP_LENGTH) {
            submit(pasted);
        } else {
            focusInput(pasted.length);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        submit(digits.join(""));
    };

    const handleResend = async () => {
        if (resending || loading || cooldown > 0) return;

        setError("");
        setNotice("");

        try {
            setResending(true);

            await resendOtpRequest(email);

            setDigits(EMPTY_CODE);
            setCooldown(RESEND_COOLDOWN);
            setNotice("We sent you a new code. The previous one no longer works.");
            focusInput(0);
        } catch (err) {
            if (!err.response) {
                setError("Can't reach the server. Check your connection and try again.");
            } else {
                // Keep the countdown in sync when the API says to wait.
                if (err.response.status === 429) setCooldown(RESEND_COOLDOWN);

                setError(
                    err.response?.data?.message ||
                    "We couldn't send a new code. Please try again."
                );
            }
        } finally {
            setResending(false);
        }
    };

    if (!email) return null;

    const busy = loading || resending;
    const code = digits.join("");

    /* ---------- Confirmation ---------- */
    if (verified) {
        return (
            <AuthLayout
                stateKey="done"
                icon={<Check size={24} strokeWidth={3} />}
                iconTone="success"
                title="Email verified"
                subtitle="You're signed in. Taking you to your dashboard..."
            >
                <p role="status" className="sr-only">
                    Email verified. Redirecting to your dashboard.
                </p>
            </AuthLayout>
        );
    }

    /* ---------- Form ---------- */
    return (
        <AuthLayout
            stateKey="form"
            icon={<ShieldCheck size={22} />}
            title="Verify your email"
            subtitle={
                <>
                    Enter the 6-digit code we sent to{" "}
                    <span className="break-all font-semibold text-[var(--text)]">{email}</span>
                    . It expires in 5 minutes.
                </>
            }
            error={error}
            footer={
                <>
                    Wrong email?{" "}
                    <Link
                        to="/register"
                        className="font-semibold hover:underline"
                        style={accentLinkStyle}
                    >
                        Create a new account
                    </Link>
                </>
            }
        >
            <AuthBanner
                id="otp-message"
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
                    <label
                        htmlFor="otp-0"
                        id="otp-label"
                        className="text-sm font-semibold"
                    >
                        Verification code
                    </label>

                    <div
                        role="group"
                        aria-labelledby="otp-label"
                        className="mt-2 grid grid-cols-6 gap-2 sm:gap-2.5"
                    >
                        {digits.map((digit, i) => (
                            <input
                                key={i}
                                id={`otp-${i}`}
                                ref={(node) => {
                                    inputsRef.current[i] = node;
                                }}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                autoComplete={i === 0 ? "one-time-code" : "off"}
                                maxLength={1}
                                autoFocus={i === 0}
                                value={digit}
                                onChange={(event) => handleChange(i, event)}
                                onKeyDown={(event) => handleKeyDown(i, event)}
                                onPaste={handlePaste}
                                onFocus={(event) => event.target.select()}
                                disabled={busy}
                                aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
                                aria-invalid={Boolean(error)}
                                aria-describedby={error ? "otp-message" : undefined}
                                className={otpBoxClass}
                            />
                        ))}
                    </div>
                </div>

                <div data-reveal>
                    <button
                        type="submit"
                        disabled={busy || code.length !== OTP_LENGTH}
                        className={primaryButtonClass}
                        style={primaryButtonStyle}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Verify email
                                <ArrowRight
                                    size={15}
                                    className="transition-transform duration-200 group-hover:translate-x-1"
                                />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div
                data-reveal
                className="mt-6 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-sm text-[var(--text-muted)]"
            >
                <span>Didn&apos;t get a code?</span>

                {cooldown > 0 ? (
                    <span aria-live="polite" className="tabular-nums">
                        Resend in {cooldown}s
                    </span>
                ) : (
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 font-semibold hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                        style={accentLinkStyle}
                    >
                        {resending && <Loader2 size={13} className="animate-spin" />}
                        {resending ? "Sending..." : "Send a new code"}
                    </button>
                )}
            </div>
        </AuthLayout>
    );
}