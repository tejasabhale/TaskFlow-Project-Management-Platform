import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { Eye, EyeOff } from "lucide-react";

/* ---------------------------------------------------------------
   Shared building blocks for every auth page (Login, Register,
   ForgotPassword, ResetPassword, VerifyOtp). Keeping them here
   is what keeps all five screens identical in size, spacing,
   type and motion.
---------------------------------------------------------------- */

/* Consistent primary font face (Manrope) */
export const headingFont = {
    fontFamily: "var(--font-sans)",
};

/* index.css sets an unlayered color on <a>, so link colors are inline */
export const accentLinkStyle = { color: "var(--primary-text)" };

export const inputClass =
    "h-12 w-full rounded-xl border px-4 text-base sm:text-sm " +
    "bg-[var(--background)] text-[var(--text)] border-[var(--border)] " +
    "hover:border-[var(--border-strong)] " +
    "placeholder:text-[var(--text-subtle)] " +
    "disabled:cursor-not-allowed disabled:opacity-60";

export const primaryButtonClass =
    "btn-primary group inline-flex h-12 w-full items-center justify-center gap-2 " +
    "rounded-xl px-4 text-sm font-bold active:scale-[0.98]";

/* Inline so it beats any color set on .btn-primary: white text on orange in light and dark */
export const primaryButtonStyle = { color: "#ffffff" };

export const secondaryButtonClass =
    "inline-flex h-12 w-full items-center justify-center rounded-xl border " +
    "border-[var(--border)] px-4 text-sm font-bold text-[var(--text)] " +
    "transition-colors duration-200 hover:border-[var(--border-strong)] " +
    "hover:bg-[var(--surface-muted)] active:scale-[0.98]";

export const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Message banner that slides open and closed without going blank */
export function AuthBanner({ text, variant = "error", id }) {
    const last = useRef({ text: "", variant });
    if (text) last.current = { text, variant };

    const { text: shownText, variant: shownVariant } = last.current;
    const isError = shownVariant === "error";

    return (
        <div
            role={isError ? "alert" : "status"}
            className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${text
                ? "mt-6 grid-rows-[1fr] opacity-100"
                : "mt-0 grid-rows-[0fr] opacity-0"
                }`}
        >
            <div className="overflow-hidden">
                <p
                    id={id}
                    className={`rounded-xl px-4 py-3 text-sm leading-5 ${isError
                        ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                        : "bg-[var(--info-soft)] text-[var(--info)]"
                        }`}
                >
                    {shownText}
                </p>
            </div>
        </div>
    );
}

/* Password input with an animated show/hide toggle */
export function PasswordInput({
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
    toggleLabel = "password",
    onKeyUp,
    onKeyDown,
    onBlur,
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
                onKeyUp={onKeyUp}
                onKeyDown={onKeyDown}
                onBlur={onBlur}
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

/**
 * One centred card for every auth screen.
 *
 * - icon:     lucide icon element shown above the title
 * - iconTone: "default" (outlined) or "success" (filled with the primary colour)
 * - title / subtitle: centred header copy (subtitle may contain elements)
 * - footer:   centred secondary line under the card (e.g. "Already have an account?")
 * - error:    when it becomes non-empty the card gives a small shake
 * - stateKey: change it (e.g. when a form turns into a confirmation) to replay the entrance
 */
export default function AuthLayout({
    icon,
    iconTone = "default",
    title,
    subtitle,
    footer,
    error = "",
    stateKey = "form",
    children,
}) {
    const rootRef = useRef(null);
    const cardRef = useRef(null);
    const firstRun = useRef(true);

    /* Entrance: card rises on first load; content reveals on every state change */
    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return undefined;

        const isFirst = firstRun.current;
        firstRun.current = false;

        const ctx = gsap.context(() => {
            if (prefersReducedMotion()) return;

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            if (isFirst) {
                tl.from("[data-card]", { y: 28, opacity: 0, duration: 0.9, clearProps: "all" }, 0);
            }

            tl.from("[data-line]", { yPercent: 110, duration: 0.8 }, 0.1).from(
                "[data-reveal]",
                { y: 16, opacity: 0, duration: 0.6, stagger: 0.06, clearProps: "all" },
                0.25
            );
        }, root);

        return () => ctx.revert();
    }, [stateKey]);

    /* Small shake when something is wrong */
    useEffect(() => {
        if (!error || prefersReducedMotion() || !cardRef.current) return;

        gsap.fromTo(
            cardRef.current,
            { x: -8 },
            { x: 0, duration: 0.7, ease: "elastic.out(1, 0.25)" }
        );
    }, [error]);

    return (
        /* 4rem = sticky navbar height */
        <main
            ref={rootRef}
            className="relative isolate flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden bg-[var(--background)] px-5 py-10 text-[var(--text)] sm:px-8 sm:py-14"
        >
            {/* faint dot grid, fades out toward the edges */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 opacity-70 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_50%_50%,black,transparent_70%)]"
            />

            <div className="relative z-10 w-full max-w-[30rem]">
                <div
                    ref={cardRef}
                    data-card
                    className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8"
                >
                    {/* Header */}
                    <header className="text-center">
                        {icon && (
                            <span
                                data-reveal
                                aria-hidden="true"
                                className={`mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border ${iconTone === "success"
                                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                                    : "border-[var(--border)] bg-[var(--background)] text-[var(--primary)]"
                                    }`}
                            >
                                {icon}
                            </span>
                        )}

                        <h1
                            className="text-2xl font-extrabold leading-[1.15] tracking-[-0.04em] min-[400px]:text-3xl sm:text-4xl"
                            style={headingFont}
                        >
                            <span className="block overflow-hidden pb-[0.2em] -mb-[0.2em]">
                                <span data-line className="block">
                                    {title}
                                </span>
                            </span>
                        </h1>

                        {subtitle && (
                            <p
                                data-reveal
                                className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--text-muted)] sm:text-base"
                            >
                                {subtitle}
                            </p>
                        )}
                    </header>

                    {children}
                </div>

                {footer && (
                    <div
                        data-reveal
                        className="mt-6 text-center text-sm text-[var(--text-muted)]"
                    >
                        {footer}
                    </div>
                )}
            </div>
        </main>
    );
}