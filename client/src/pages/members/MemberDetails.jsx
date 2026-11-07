
import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
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
    RefreshCw,
    ShieldCheck,
    UserRound,
} from "lucide-react";

import { getUserProfileById } from "../../services/profile.service.js";

/* Same loader id as other pages */
const DISPLAY_FONT_ID = "login-display-font";
const DISPLAY_FONT_URL =
    "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&display=swap";

const displayFont = {
    fontFamily:
        '"Bricolage Grotesque", "Manrope", ui-sans-serif, system-ui, sans-serif',
};

/* Full available dashboard width */
const pageWrap =
    "w-full min-h-full min-w-0 space-y-6 p-4 text-[var(--text)] sm:space-y-7 sm:p-6 lg:p-8";

const panel = "rounded-xl border border-[var(--border)] bg-[var(--surface)]";

const panelHeader =
    "border-b border-[var(--border)] px-5 py-5 sm:px-6 lg:px-7";

const panelBody = "px-5 py-5 sm:px-6 sm:py-6 lg:px-7";

const btnPrimary =
    "btn-primary inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold whitespace-nowrap active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

/* ---------- Helpers ---------- */

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

/* Handle different API response structures */
function unwrapMember(response) {
    let result = response?.data ?? response;

    if (result?.data) result = result.data;
    if (result?.user) result = result.user;

    return result;
}

/* ---------- Small components ---------- */

/* All members link with orange hover effect */
function BackLink({
    to = "/dashboard/members",
    children = "All members",
}) {
    return (
        <Link
            to={to}
            style={{
                color: "var(--back-link-color, var(--text))",
            }}
            className="
                group inline-flex items-center gap-2 rounded-sm
                text-sm font-medium outline-none
                transition-colors duration-200
                hover:[--back-link-color:#f97316]
                focus-visible:[--back-link-color:#f97316]
                focus-visible:outline-2
                focus-visible:outline-offset-4
                focus-visible:outline-[var(--focus)]
                motion-reduce:transition-none
            "
        >
            <ArrowLeft
                size={16}
                aria-hidden="true"
                className="
                    transition-transform duration-200
                    group-hover:-translate-x-1
                    group-focus-visible:-translate-x-1
                    motion-reduce:transition-none
                "
            />

            <span
                className="
                    bg-[linear-gradient(currentColor,currentColor)]
                    bg-[length:0%_1.5px]
                    bg-[position:left_100%]
                    bg-no-repeat pb-0.5
                    transition-[background-size] duration-300 ease-out
                    group-hover:bg-[length:100%_1.5px]
                    group-focus-visible:bg-[length:100%_1.5px]
                    motion-reduce:transition-none
                "
            >
                {children}
            </span>
        </Link>
    );
}

function MetadataItem({ icon: Icon, label, children }) {
    return (
        <div className="flex h-full min-w-0 items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors duration-200 hover:border-[var(--primary)]">
            <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--text-muted)]">
                <Icon size={17} aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[var(--text-muted)]">
                    {label}
                </p>

                <div className="mt-1 break-words text-sm font-semibold text-[var(--text)] [overflow-wrap:anywhere]">
                    {children}
                </div>
            </div>
        </div>
    );
}

function MemberAvatar({ member }) {
    const [imageFailed, setImageFailed] = useState(false);

    const avatarUrl = imageFailed ? "" : member.avatar?.url;

    return avatarUrl ? (
        <img
            src={avatarUrl}
            alt={member.fullName || "Member avatar"}
            onError={() => setImageFailed(true)}
            className="size-20 shrink-0 rounded-2xl border border-[var(--border)] object-cover sm:size-24"
        />
    ) : (
        <div
            aria-hidden="true"
            className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl font-bold text-[var(--primary)] sm:size-24"
            style={displayFont}
        >
            {getInitials(member.fullName)}
        </div>
    );
}

/* ---------- Page ---------- */

export default function MemberDetails() {
    const { userId } = useParams();
    const rootRef = useRef(null);

    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    const hasMember = Boolean(member);

    /* Load display font once */
    useEffect(() => {
        if (document.getElementById(DISPLAY_FONT_ID)) return;

        const link = document.createElement("link");
        link.id = DISPLAY_FONT_ID;
        link.rel = "stylesheet";
        link.href = DISPLAY_FONT_URL;

        document.head.appendChild(link);
    }, []);

    /* One quiet entrance animation */
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

    /* Load member details */
    useEffect(() => {
        let cancelled = false;

        const loadMember = async () => {
            if (!userId) {
                setMember(null);
                setError("Member ID is missing.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await getUserProfileById(userId);

                if (cancelled) return;

                const data = unwrapMember(response);

                if (!data || typeof data !== "object") {
                    throw new Error("Member details were not returned.");
                }

                setMember(data);
            } catch (err) {
                if (cancelled) return;

                setMember(null);

                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load member details."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadMember();

        return () => {
            cancelled = true;
        };
    }, [userId, reloadKey]);

    const retry = () => {
        setReloadKey((current) => current + 1);
    };

    /* ---------- Loading ---------- */

    if (loading) {
        return (
            <div
                className={`${pageWrap} flex min-h-[60vh] items-center justify-center`}
                role="status"
                aria-live="polite"
            >
                <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                    <Loader2
                        size={19}
                        className="animate-spin text-[var(--primary)]"
                    />
                    Loading member details...
                </div>
            </div>
        );
    }

    /* ---------- Error / Not found ---------- */

    if (error || !member) {
        return (
            <div className={`${pageWrap} flex min-h-[60vh] flex-col`}>
                <BackLink />

                <div className="flex flex-1 items-center justify-center">
                    <section
                        role="alert"
                        className={`${panel} w-full max-w-md p-6 text-center sm:p-8`}
                    >
                        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--danger-soft)] text-[var(--danger)]">
                            <AlertCircle size={24} />
                        </div>

                        <h1
                            className="mt-4 text-xl font-bold tracking-tight"
                            style={displayFont}
                        >
                            Unable to display member
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                            {error || "This member could not be found."}
                        </p>

                        <button
                            type="button"
                            onClick={retry}
                            className={`${btnPrimary} mt-5`}
                        >
                            <RefreshCw size={15} />
                            Try again
                        </button>
                    </section>
                </div>
            </div>
        );
    }

    /* ---------- Derived values ---------- */

    const role = member.role || "user";

    const details = [
        {
            label: "Full name",
            value: member.fullName || "Not provided",
            icon: UserRound,
        },
        {
            label: "Username",
            value: member.userName
                ? `@${member.userName}`
                : "Not provided",
            icon: AtSign,
        },
        {
            label: "Email address",
            value: member.email || "Not provided",
            icon: Mail,
        },
        {
            label: "Mobile number",
            value: member.mobileNo || "Not provided",
            icon: Phone,
        },
        {
            label: "Account role",
            value: <span className="capitalize">{role}</span>,
            icon: ShieldCheck,
        },
        {
            label: "Joined on",
            value: formatDate(member.createdAt),
            icon: CalendarDays,
        },
    ];

    /* ---------- Full-width member details ---------- */

    return (
        <div
            ref={rootRef}
            className={`${pageWrap} [animation:member-details-in_0.4s_ease-out_both] motion-reduce:[animation:none]`}
        >
            <style>
                {`
                    @keyframes member-details-in {
                        from {
                            opacity: 0;
                            transform: translateY(8px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}
            </style>

            {/* Page heading */}
            <header className="space-y-4 border-b border-[var(--border)] pb-6">
                <BackLink />

                <div className="min-w-0">
                    <h1
                        className="break-words text-3xl font-bold tracking-tight sm:text-4xl"
                        style={displayFont}
                    >
                        Member details
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                        View member profile and account information.
                    </p>
                </div>
            </header>

            {/* Full-width profile card */}
            <section className={`${panel} w-full min-w-0 overflow-hidden`}>
                {/* Member identity */}
                <div
                    className={`${panelHeader} flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center`}
                >
                    <MemberAvatar member={member} />

                    <div className="min-w-0 flex-1">
                        <h2
                            className="break-words text-xl font-bold tracking-tight [overflow-wrap:anywhere] sm:text-2xl"
                            style={displayFont}
                        >
                            {member.fullName || "Unnamed member"}
                        </h2>

                        <p className="mt-1 break-words text-sm text-[var(--text-muted)]">
                            @{member.userName || "unknown"}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-semibold capitalize text-[var(--primary)]">
                                {role}
                            </span>

                            <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${member.isVerified
                                        ? "bg-[var(--success-soft)] text-[var(--success)]"
                                        : "bg-[var(--warning-soft)] text-[var(--warning)]"
                                    }`}
                            >
                                {member.isVerified
                                    ? "Verified account"
                                    : "Not verified"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Account information */}
                <div className={panelBody}>
                    <div className="mb-5">
                        <h3 className="text-base font-semibold text-[var(--text)]">
                            Account information
                        </h3>

                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            Member contact details and account information.
                        </p>
                    </div>

                    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {details.map(({ label, value, icon }) => (
                            <MetadataItem
                                key={label}
                                icon={icon}
                                label={label}
                            >
                                {value}
                            </MetadataItem>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
