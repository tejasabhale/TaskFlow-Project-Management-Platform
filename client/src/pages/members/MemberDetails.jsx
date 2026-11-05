import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { gsap } from "gsap";
import {
    ArrowLeft,
    AlertCircle,
    AtSign,
    CalendarDays,
    Loader2,
    Mail,
    Phone,
    ShieldCheck,
    UserRound,
} from "lucide-react";

import { getUserProfileById } from "../../services/profile.service.js";

/* Same loader id as the other pages, so the font is only added once */
const DISPLAY_FONT_ID = "login-display-font";
const DISPLAY_FONT_URL =
    "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&display=swap";

const displayFont = {
    fontFamily:
        '"Bricolage Grotesque", "Manrope", ui-sans-serif, system-ui, sans-serif',
};

/* Same page wrapper spacing as the Projects and Tasks pages, so all pages line up */
const pageWrap =
    "mx-auto w-full max-w-5xl min-w-0 space-y-6 px-4 py-6 text-[var(--text)] sm:space-y-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9";

const panel = "rounded-xl border border-[var(--border)] bg-[var(--surface)]";
const panelHeader = "border-b border-[var(--border)] px-5 py-5 sm:px-6";
const panelBody = "px-5 py-5 sm:px-6";

const btnPrimary =
    "btn-primary inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold whitespace-nowrap active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

/* ---------- helpers ---------- */

function formatDate(value) {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not available";

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

function getInitials(name) {
    return (
        name
            ?.trim()
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() || "M"
    );
}

/* ---------- small components ---------- */

/**
 * "All members" back link (same effect as the Projects and Tasks pages).
 * The color is driven by a CSS variable because index.css sets an unlayered
 * color on <a>, which would otherwise override a normal hover:text-* class.
 */
function BackLink({ to = "/dashboard/members", children = "All members" }) {
    return (
        <Link
            to={to}
            style={{ color: "var(--back-link-color, var(--text))" }}
            className="group inline-flex items-center gap-2 rounded-sm text-sm font-medium transition-colors duration-200 outline-none hover:[--back-link-color:var(--primary-text)] focus-visible:[--back-link-color:var(--primary-text)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)] motion-reduce:transition-none"
        >
            <ArrowLeft
                size={16}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:-translate-x-1 group-focus-visible:-translate-x-1 motion-reduce:transition-none"
            />

            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-[position:left_100%] bg-no-repeat pb-0.5 transition-[background-size] duration-300 ease-out group-hover:bg-[length:100%_1.5px] group-focus-visible:bg-[length:100%_1.5px] motion-reduce:transition-none">
                {children}
            </span>
        </Link>
    );
}

function MetadataItem({ icon: Icon, label, children }) {
    return (
        <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--text-muted)]">
                <Icon size={17} aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-xs text-[var(--text-muted)]">{label}</p>
                <div className="mt-0.5 break-words text-sm font-semibold [overflow-wrap:anywhere]">
                    {children}
                </div>
            </div>
        </div>
    );
}

/* ---------- page ---------- */

export default function MemberDetails() {
    const { userId } = useParams();
    const rootRef = useRef(null);

    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (document.getElementById(DISPLAY_FONT_ID)) return;
        const link = document.createElement("link");
        link.id = DISPLAY_FONT_ID;
        link.rel = "stylesheet";
        link.href = DISPLAY_FONT_URL;
        document.head.appendChild(link);
    }, []);

    const hasMember = Boolean(member);

    /* One quiet fade when the page first shows. Nothing else moves on its own. */
    useLayoutEffect(() => {
        const root = rootRef.current;
        if (
            !root ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            return;
        }

        const ctx = gsap.context(() => {
            gsap.from(root, {
                opacity: 0,
                y: 10,
                duration: 0.5,
                ease: "power3.out",
                clearProps: "transform,opacity",
            });
        }, root);

        return () => ctx.revert();
    }, [hasMember]);

    const loadMember = useCallback(async () => {
        if (!userId) {
            setError("Member ID is missing.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await getUserProfileById(userId);
            setMember(response.data);
        } catch (err) {
            setMember(null);
            setError(
                err?.response?.data?.message || "Unable to load member details."
            );
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadMember();
    }, [loadMember]);

    /* ---------- loading / not found ---------- */

    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center gap-3 px-4 text-sm text-[var(--text-muted)]">
                <Loader2 size={18} className="animate-spin text-[var(--primary)]" />
                Loading member details...
            </div>
        );
    }

    if (error || !member) {
        return (
            <div className={`${pageWrap} max-w-3xl`}>
                <BackLink />

                <section className={`${panel} p-5 sm:p-8`}>
                    <AlertCircle size={26} className="text-[var(--danger)]" />

                    <h1
                        className="mt-3 text-xl font-bold tracking-tight"
                        style={displayFont}
                    >
                        Unable to display member
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                        {error || "This member could not be found."}
                    </p>

                    <button
                        type="button"
                        onClick={loadMember}
                        className={`${btnPrimary} mt-5`}
                    >
                        Try again
                    </button>
                </section>
            </div>
        );
    }

    /* ---------- derived values ---------- */

    const role = member.role || "user";

    const details = [
        { label: "Full name", value: member.fullName || "Not provided", icon: UserRound },
        {
            label: "Username",
            value: member.userName ? `@${member.userName}` : "Not provided",
            icon: AtSign,
        },
        { label: "Email address", value: member.email || "Not provided", icon: Mail },
        { label: "Mobile number", value: member.mobileNo || "Not provided", icon: Phone },
        { label: "Account role", value: <span className="capitalize">{role}</span>, icon: ShieldCheck },
        { label: "Joined on", value: formatDate(member.createdAt), icon: CalendarDays },
    ];

    return (
        <div ref={rootRef} className={pageWrap}>
            {/* Heading */}
            <header className="space-y-4">
                <BackLink />

                <div className="min-w-0">
                    <h1
                        className="break-words text-3xl font-bold tracking-tight [overflow-wrap:anywhere] sm:text-4xl"
                        style={displayFont}
                    >
                        Member details
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                        View member profile and account information.
                    </p>
                </div>
            </header>

            {/* Profile */}
            <section className={`${panel} overflow-hidden`}>
                <div className={`${panelHeader} flex flex-col gap-5 sm:flex-row sm:items-center`}>
                    {member.avatar?.url ? (
                        <img
                            src={member.avatar.url}
                            alt={member.fullName || "Member avatar"}
                            className="size-20 shrink-0 rounded-2xl border border-[var(--border)] object-cover"
                        />
                    ) : (
                        <div
                            aria-hidden="true"
                            className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl font-bold text-[var(--primary-text)]"
                            style={displayFont}
                        >
                            {getInitials(member.fullName)}
                        </div>
                    )}

                    <div className="min-w-0 flex-1">
                        <h2
                            className="break-words text-xl font-bold tracking-tight [overflow-wrap:anywhere]"
                            style={displayFont}
                        >
                            {member.fullName || "Unnamed member"}
                        </h2>

                        <p className="mt-1 break-words text-sm text-[var(--text-muted)]">
                            @{member.userName || "unknown"}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-semibold capitalize text-[var(--primary-text)]">
                                {role}
                            </span>

                            <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${member.isVerified
                                    ? "bg-[var(--success-soft)] text-[var(--success)]"
                                    : "bg-[var(--warning-soft)] text-[var(--warning)]"
                                    }`}
                            >
                                {member.isVerified ? "Verified account" : "Not verified"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={panelBody}>
                    <h3 className="font-semibold">Account information</h3>

                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {details.map(({ label, value, icon }) => (
                            <MetadataItem key={label} icon={icon} label={label}>
                                {value}
                            </MetadataItem>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}