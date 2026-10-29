import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    AtSign,
    BadgeCheck,
    CalendarDays,
    Check,
    CircleAlert,
    Clock,
    Mail,
    Pencil,
    Phone,
    RefreshCw,
    ShieldCheck,
    UserRound,
    X,
} from "lucide-react";

import {
    getMyProfile,
    getUserProfileById,
    updateMyProfile,
} from "../../services/profile.service.js";

const motion =
    "duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none";

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]";

// The layout no longer pads the outlet, so the page pads itself.
const pageClass = "mx-auto w-full max-w-5xl space-y-4 p-4 sm:p-6";

const cardClass =
    "rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm";

const iconButtonClass =
    "flex size-9 shrink-0 items-center justify-center rounded-lg border border-transparent " +
    "text-[var(--text-muted)] transition-colors duration-200 " +
    "hover:bg-[var(--surface-muted)] hover:text-[var(--text)] " +
    focusRing;

const sectionLabelClass =
    "text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-subtle)]";

const fieldClass =
    "mt-1.5 w-full min-h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm " +
    "text-[var(--text)] outline-none transition-colors " +
    "placeholder:text-[var(--text-subtle)] hover:border-[var(--border-strong)] " +
    `focus:border-[var(--primary)] ${focusRing}`;

const getInitials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("") || "U";

// Backend responds with ApiResponse: { statusCode, data: user, message }
function unwrapProfile(response) {
    let result = response?.data ?? response;

    if (result?.data) result = result.data;
    if (result?.user) result = result.user;

    return result;
}

const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;

const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not available";

    return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const formatRole = (role = "") =>
    role ? role.charAt(0).toUpperCase() + role.slice(1) : "User";

/* ---------- Small building blocks ---------- */

function Badge({ icon: Icon, children, tone = "primary" }) {
    const tones = {
        primary:
            "bg-[var(--primary-soft)] text-[var(--primary)] ring-[var(--primary)]/25",
        muted:
            "bg-[var(--surface-muted)] text-[var(--text-muted)] ring-[var(--border)]",
    };

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${tones[tone]}`}
        >
            <Icon size={12} strokeWidth={2.2} aria-hidden="true" />
            {children}
        </span>
    );
}

function DetailItem({ icon: Icon, label, children }) {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm transition-[border-color,transform] duration-200 hover:-translate-y-px hover:border-[var(--primary)] motion-reduce:transition-none">
            <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]"
            >
                <Icon size={18} strokeWidth={1.8} />
            </span>

            <div className="min-w-0">
                <p className={sectionLabelClass}>{label}</p>
                <div className="mt-0.5 truncate text-sm font-semibold text-[var(--text)]">
                    {children}
                </div>
            </div>
        </div>
    );
}

function FormField({ label, id, hint, ...props }) {
    return (
        <div className="min-w-0">
            <label htmlFor={id} className="text-sm font-medium text-[var(--text)]">
                {label}
            </label>

            <input {...props} id={id} className={fieldClass} />

            {hint && (
                <p className="mt-1 text-xs leading-5 text-[var(--text-subtle)]">
                    {hint}
                </p>
            )}
        </div>
    );
}

function Avatar({ src, name, className = "", onError }) {
    return (
        <div
            className={`flex shrink-0 items-center justify-center overflow-hidden bg-[var(--primary-soft)] font-bold text-[var(--primary)] ${className}`}
        >
            {src ? (
                <img
                    src={src}
                    alt={`${name}'s avatar`}
                    onError={onError}
                    className="size-full object-cover"
                />
            ) : (
                <span aria-hidden="true">{getInitials(name)}</span>
            )}
        </div>
    );
}

function ProfileSkeleton() {
    const pulse =
        "animate-pulse bg-[var(--surface-muted)] motion-reduce:animate-none";

    return (
        <div
            className={pageClass}
            role="status"
            aria-live="polite"
            aria-label="Loading profile"
        >
            <div className={`overflow-hidden ${cardClass}`}>
                <div className={`h-24 ${pulse}`} />

                <div className="px-4 pb-4 sm:px-5">
                    <div
                        className={`-mt-10 size-20 rounded-2xl ring-4 ring-[var(--surface)] ${pulse}`}
                    />
                    <div className={`mt-3 h-5 w-40 rounded-lg ${pulse}`} />
                    <div className={`mt-2 h-3.5 w-24 rounded-lg ${pulse}`} />
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"
                    >
                        <div className={`size-10 rounded-xl ${pulse}`} />
                        <div className="flex-1 space-y-1.5">
                            <div className={`h-2.5 w-16 rounded ${pulse}`} />
                            <div className={`h-3.5 w-28 rounded ${pulse}`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ---------- Edit dialog ---------- */

function EditProfileDialog({ profile, onClose, onSaved }) {
    const [form, setForm] = useState({
        fullName: profile.fullName || "",
        userName: profile.userName || "",
        mobileNo: profile.mobileNo || "",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [shown, setShown] = useState(false);

    // Animate in after the first paint.
    useEffect(() => {
        const frame = requestAnimationFrame(() => setShown(true));

        return () => cancelAnimationFrame(frame);
    }, []);

    // Close on Escape (unless a save is in progress).
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape" && !saving) onClose();
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose, saving]);

    // Prevent background scrolling while the dialog is open.
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    const updateField = (name) => (event) => {
        const value =
            name === "mobileNo"
                ? event.target.value.replace(/\D/g, "").slice(0, 10)
                : name === "userName"
                    ? event.target.value.toLowerCase().replace(/\s/g, "")
                    : event.target.value;

        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const fullName = form.fullName.trim();
        const userName = form.userName.trim().toLowerCase();
        const mobileNo = form.mobileNo.trim();

        if (fullName.length < 2 || fullName.length > 100) {
            setError("Full name must be between 2 and 100 characters.");
            return;
        }

        if (userName.length < 3 || userName.length > 30) {
            setError("Username must be between 3 and 30 characters.");
            return;
        }

        if (!/^\d{10}$/.test(mobileNo)) {
            setError("Enter a valid 10 digit mobile number.");
            return;
        }

        // Only send what actually changed.
        const changes = {};

        if (fullName !== (profile.fullName || "")) changes.fullName = fullName;
        if (userName !== (profile.userName || "")) changes.userName = userName;
        if (mobileNo !== (profile.mobileNo || "")) changes.mobileNo = mobileNo;

        if (Object.keys(changes).length === 0) {
            onClose();
            return;
        }

        try {
            setSaving(true);

            const response = await updateMyProfile(changes);

            await onSaved(unwrapProfile(response));
        } catch (requestError) {
            setError(
                getErrorMessage(
                    requestError,
                    "Unable to update profile. Please try again.",
                ),
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/45 px-4 py-5 backdrop-blur-[2px] transition-opacity duration-200 sm:py-8 ${shown ? "opacity-100" : "opacity-0"
                }`}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) onClose();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-profile-title"
                className={`my-auto max-h-[calc(100dvh-2.5rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-[var(--text)] shadow-2xl transition-[opacity,transform] sm:p-5 ${motion} ${shown
                        ? "translate-y-0 scale-100 opacity-100"
                        : "translate-y-2 scale-[0.98] opacity-0"
                    }`}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2
                            id="edit-profile-title"
                            className="font-['Plus_Jakarta_Sans',sans-serif] text-lg font-bold tracking-[-0.035em]"
                        >
                            Edit profile
                        </h2>

                        <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                            Update your personal details.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close dialog"
                        className={`${iconButtonClass} -mr-1 -mt-1`}
                    >
                        <X size={18} />
                    </button>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mt-3 rounded-xl border border-[var(--danger,#dc2626)]/40 bg-[var(--surface-muted)] px-3 py-2 text-sm leading-6 text-[var(--danger,#dc2626)]"
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                    <FormField
                        id="edit-full-name"
                        label="Full name"
                        type="text"
                        value={form.fullName}
                        onChange={updateField("fullName")}
                        minLength={2}
                        maxLength={100}
                        autoComplete="name"
                        required
                        autoFocus
                    />

                    <div className="grid gap-3.5 sm:grid-cols-2">
                        <FormField
                            id="edit-user-name"
                            label="Username"
                            type="text"
                            value={form.userName}
                            onChange={updateField("userName")}
                            minLength={3}
                            maxLength={30}
                            autoComplete="username"
                            required
                        />

                        <FormField
                            id="edit-mobile"
                            label="Mobile number"
                            type="tel"
                            inputMode="numeric"
                            value={form.mobileNo}
                            onChange={updateField("mobileNo")}
                            placeholder="10 digit number"
                            autoComplete="tel-national"
                            required
                        />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-[var(--text)]">Email</p>
                        <p className="mt-1.5 truncate rounded-xl border border-dashed border-[var(--border)] px-3 py-2 text-sm text-[var(--text-muted)]">
                            {profile.email || "Not available"}
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-subtle)]">
                            Email can&apos;t be changed here.
                        </p>
                    </div>

                    <div className="flex flex-col-reverse gap-2.5 border-t border-[var(--border)] pt-3.5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className={`inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--text-inverse)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                        >
                            <Check size={16} />
                            {saving ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

/* ---------- Page ---------- */

export default function Profile() {
    // /dashboard/profile shows your own profile.
    // /dashboard/profile/:userId shows another user's profile.
    const { userId } = useParams();
    const isOwnProfile = !userId;

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const [avatarFailed, setAvatarFailed] = useState(false);

    const [editOpen, setEditOpen] = useState(false);
    const [notice, setNotice] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadProfile = async () => {
            setLoading(true);
            setError("");
            setAvatarFailed(false);
            setEditOpen(false);

            try {
                const response = userId
                    ? await getUserProfileById(userId)
                    : await getMyProfile();

                if (cancelled) return;

                const data = unwrapProfile(response);

                if (!data || typeof data !== "object") {
                    throw new Error("Profile details were not returned.");
                }

                setProfile(data);
            } catch (requestError) {
                if (cancelled) return;

                setProfile(null);
                setError(
                    getErrorMessage(
                        requestError,
                        "Unable to load profile. Please try again.",
                    ),
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadProfile();

        return () => {
            cancelled = true;
        };
    }, [userId, reloadKey]);

    // Hide the success message after a few seconds.
    useEffect(() => {
        if (!notice) return undefined;

        const timer = setTimeout(() => setNotice(""), 3500);

        return () => clearTimeout(timer);
    }, [notice]);

    const retry = useCallback(() => setReloadKey((key) => key + 1), []);

    const closeEditDialog = useCallback(() => setEditOpen(false), []);

    // The PATCH response returns the updated profile, so no extra request needed.
    const handleSaved = useCallback((updatedProfile) => {
        if (updatedProfile && typeof updatedProfile === "object") {
            setProfile((current) => ({ ...current, ...updatedProfile }));
        }

        setEditOpen(false);
        setNotice("Profile updated successfully.");
    }, []);

    if (loading) return <ProfileSkeleton />;

    if (error || !profile) {
        return (
            <div className={pageClass}>
                <div
                    role="alert"
                    className={`mx-auto flex max-w-sm flex-col items-center px-5 py-8 text-center ${cardClass}`}
                >
                    <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--danger,#dc2626)]">
                        <CircleAlert size={21} />
                    </span>

                    <h2 className="mt-3 font-['Plus_Jakarta_Sans',sans-serif] text-base font-bold tracking-[-0.03em] text-[var(--text)]">
                        Couldn&apos;t load profile
                    </h2>

                    <p className="mt-1.5 text-sm leading-6 text-[var(--text-muted)]">
                        {error || "Profile details are not available."}
                    </p>

                    <button
                        type="button"
                        onClick={retry}
                        className={`mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--text-inverse)] transition-opacity hover:opacity-90 ${focusRing}`}
                    >
                        <RefreshCw size={15} />
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    const displayName = profile.fullName || profile.userName || "Unnamed user";
    const avatarUrl = avatarFailed ? "" : profile.avatar?.url || "";
    const isAdmin = profile.role === "admin";

    return (
        <div
            className={`${pageClass} [animation:profile-in_0.4s_ease-out_both] motion-reduce:[animation:none]`}
        >
            {/* Entrance animation: always ends fully visible */}
            <style>{`@keyframes profile-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>

            {/* Success message */}
            {notice && (
                <div
                    role="status"
                    className="flex items-center gap-2 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary-soft)] px-3 py-2 text-sm font-medium text-[var(--primary)]"
                >
                    <Check size={16} aria-hidden="true" />
                    {notice}
                </div>
            )}

            {/* Header card */}
            <section
                aria-labelledby="profile-name"
                className={`overflow-hidden ${cardClass}`}
            >
                {/* Banner */}
                <div className="h-24 bg-gradient-to-r from-[var(--primary)] to-[color-mix(in_srgb,var(--primary)_40%,var(--surface))] sm:h-28" />

                <div className="px-4 pb-4 sm:px-5">
                    <div className="flex items-start justify-between gap-3">
                        <Avatar
                            src={avatarUrl}
                            name={displayName}
                            onError={() => setAvatarFailed(true)}
                            className="-mt-10 size-20 rounded-2xl text-xl shadow-sm ring-4 ring-[var(--surface)] sm:-mt-12 sm:size-24 sm:text-2xl"
                        />

                        {isOwnProfile && (
                            <button
                                type="button"
                                onClick={() => setEditOpen(true)}
                                className={`mt-3 inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] ${focusRing}`}
                            >
                                <Pencil size={15} />
                                Edit profile
                            </button>
                        )}
                    </div>

                    <div className="mt-3 min-w-0">
                        <h2
                            id="profile-name"
                            className="truncate font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold tracking-[-0.035em] text-[var(--text)]"
                        >
                            {displayName}
                        </h2>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            {profile.userName && (
                                <p className="truncate text-sm text-[var(--text-muted)]">
                                    @{profile.userName}
                                </p>
                            )}

                            <Badge icon={isAdmin ? ShieldCheck : UserRound}>
                                {formatRole(profile.role)}
                            </Badge>

                            {profile.isVerified ? (
                                <Badge icon={BadgeCheck}>Verified</Badge>
                            ) : (
                                <Badge icon={Clock} tone="muted">
                                    Not verified
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Details */}
            <section aria-labelledby="profile-details-heading">
                <h3
                    id="profile-details-heading"
                    className={`mb-2 px-1 ${sectionLabelClass}`}
                >
                    Account details
                </h3>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailItem icon={UserRound} label="Full name">
                        {profile.fullName || "Not available"}
                    </DetailItem>

                    <DetailItem icon={AtSign} label="Username">
                        {profile.userName ? `@${profile.userName}` : "Not available"}
                    </DetailItem>

                    <DetailItem icon={Mail} label="Email">
                        {profile.email ? (
                            <a
                                href={`mailto:${profile.email}`}
                                title={profile.email}
                                className={`rounded text-[var(--primary)] underline-offset-4 hover:underline ${focusRing}`}
                            >
                                {profile.email}
                            </a>
                        ) : (
                            "Not available"
                        )}
                    </DetailItem>

                    <DetailItem icon={Phone} label="Mobile">
                        {profile.mobileNo ? (
                            <a
                                href={`tel:${profile.mobileNo}`}
                                className={`rounded text-[var(--primary)] underline-offset-4 hover:underline ${focusRing}`}
                            >
                                {profile.mobileNo}
                            </a>
                        ) : (
                            "Not available"
                        )}
                    </DetailItem>

                    <DetailItem icon={CalendarDays} label="Member since">
                        {formatDate(profile.createdAt)}
                    </DetailItem>

                    <DetailItem icon={Clock} label="Last updated">
                        {formatDate(profile.updatedAt)}
                    </DetailItem>
                </div>
            </section>

            {!isOwnProfile && (
                <p className="px-1 text-xs text-[var(--text-subtle)]">
                    You are viewing another member&apos;s profile.
                </p>
            )}

            {editOpen && isOwnProfile && (
                <EditProfileDialog
                    profile={profile}
                    onClose={closeEditDialog}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}