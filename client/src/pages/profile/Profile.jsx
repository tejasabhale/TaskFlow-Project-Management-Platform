
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    ArrowLeft,
    AtSign,
    BadgeCheck,
    CalendarDays,
    Check,
    CircleAlert,
    Clock,
    ImagePlus,
    Mail,
    Pencil,
    Phone,
    RefreshCw,
    ShieldCheck,
    UserRound,
} from "lucide-react";

import {
    getMyProfile,
    getUserProfileById,
    updateMyProfile,
} from "../../services/profile.service.js";
import { useAuth } from "../../hooks/useAuth.js";

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]";

const pageClass =
    "w-full min-h-full min-w-0 space-y-6 p-4 sm:space-y-7 sm:p-6 lg:p-8";

const cardClass =
    "rounded-xl border border-[var(--border)] bg-[var(--surface)]";

const sectionLabelClass =
    "text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-subtle)]";

const fieldClass =
    "mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm " +
    "text-[var(--text)] outline-none transition " +
    "placeholder:text-[var(--text-subtle)] " +
    "focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus,var(--primary))]/30 " +
    "disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] " +
    "px-3.5 py-2.5 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--surface-muted)] " +
    "disabled:cursor-not-allowed disabled:opacity-50 " +
    focusRing;

const primaryButtonClass =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm " +
    "font-medium text-white transition hover:brightness-110 " +
    "disabled:cursor-not-allowed disabled:opacity-50 " +
    focusRing;

const allowedAvatarTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const maxAvatarSize = 5 * 1024 * 1024;

const getInitials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("") || "U";

function unwrapProfile(response) {
    let result = response?.data ?? response;

    if (result?.data) result = result.data;
    if (result?.user) result = result.user;

    return result;
}

const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message ||
    error?.message ||
    fallback;

const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const formatRole = (role = "") =>
    role
        ? role.charAt(0).toUpperCase() + role.slice(1)
        : "User";

/* ---------------------------------------------------------------
   Small building blocks
---------------------------------------------------------------- */

function Badge({ icon: Icon, children, tone = "primary" }) {
    const tones = {
        primary:
            "bg-[var(--primary-soft)] text-[var(--primary)] ring-[var(--primary)]/25",
        muted:
            "bg-[var(--surface-muted)] text-[var(--text-muted)] ring-[var(--border)]",
    };

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
        >
            <Icon size={12} strokeWidth={2.2} aria-hidden="true" />
            {children}
        </span>
    );
}

function DetailItem({ icon: Icon, label, children }) {
    return (
        <div
            className={`flex h-full min-w-0 items-center gap-3 p-4 transition-colors duration-200 hover:border-[var(--primary)] ${cardClass}`}
        >
            <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]"
            >
                <Icon size={18} strokeWidth={1.8} />
            </span>

            <div className="min-w-0 flex-1">
                <p className={sectionLabelClass}>{label}</p>

                <div className="mt-0.5 truncate text-sm font-semibold text-[var(--text)]">
                    {children}
                </div>
            </div>
        </div>
    );
}

function FormField({ label, id, hint, icon: Icon, ...props }) {
    return (
        <div className="min-w-0">
            <label
                htmlFor={id}
                className="flex items-center gap-1.5 text-sm font-medium text-[var(--text)]"
            >
                {Icon && (
                    <Icon
                        size={14}
                        aria-hidden="true"
                        className="text-[var(--text-muted)]"
                    />
                )}

                {label}
            </label>

            <input
                {...props}
                id={id}
                className={fieldClass}
            />

            {hint && (
                <p className="mt-1.5 text-xs text-[var(--text-muted)]">
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
            <div className={`w-full p-5 sm:p-6 lg:p-8 ${cardClass}`}>
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                    <div
                        className={`size-20 shrink-0 rounded-full sm:size-24 ${pulse}`}
                    />

                    <div className="flex-1 space-y-2">
                        <div className={`h-5 w-40 rounded-lg ${pulse}`} />
                        <div className={`h-3.5 w-24 rounded-lg ${pulse}`} />
                        <div className={`h-5 w-32 rounded-full ${pulse}`} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className={`flex items-center gap-3 p-4 ${cardClass}`}
                    >
                        <div className={`size-10 shrink-0 rounded-full ${pulse}`} />

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

/* ---------------------------------------------------------------
   Full-screen Edit Profile Page
---------------------------------------------------------------- */

function EditProfilePage({ profile, onBack, onSaved }) {
    const [form, setForm] = useState({
        fullName: profile.fullName || "",
        userName: profile.userName || "",
        mobileNo: profile.mobileNo || "",
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(
        profile.avatar?.url || ""
    );

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [avatarFailed, setAvatarFailed] = useState(false);

    /* Local avatar preview */
    useEffect(() => {
        if (!avatarFile) {
            setAvatarPreview(profile.avatar?.url || "");
            return undefined;
        }

        const objectUrl = URL.createObjectURL(avatarFile);

        setAvatarPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [avatarFile, profile.avatar?.url]);

    const updateField = (name) => (event) => {
        const value =
            name === "mobileNo"
                ? event.target.value.replace(/\D/g, "").slice(0, 10)
                : name === "userName"
                    ? event.target.value.toLowerCase().replace(/\s/g, "")
                    : event.target.value;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    /* Avatar upload validation */
    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!allowedAvatarTypes.includes(file.type)) {
            setError("Please select a JPG, PNG, or WebP image.");
            event.target.value = "";
            return;
        }

        if (file.size > maxAvatarSize) {
            setError("Avatar image must be 5 MB or smaller.");
            event.target.value = "";
            return;
        }

        setError("");
        setAvatarFailed(false);
        setAvatarFile(file);
    };

    /* Save profile */
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

        const changes = {};

        if (fullName !== (profile.fullName || "")) {
            changes.fullName = fullName;
        }

        if (userName !== (profile.userName || "")) {
            changes.userName = userName;
        }

        if (mobileNo !== (profile.mobileNo || "")) {
            changes.mobileNo = mobileNo;
        }

        if (Object.keys(changes).length === 0 && !avatarFile) {
            onBack();
            return;
        }

        const payload = new FormData();

        Object.entries(changes).forEach(([key, value]) => {
            payload.append(key, value);
        });

        if (avatarFile) {
            payload.append("avatar", avatarFile);
        }

        try {
            setSaving(true);

            const response = await updateMyProfile(payload);

            onSaved(unwrapProfile(response));
        } catch (requestError) {
            setError(
                getErrorMessage(
                    requestError,
                    "Unable to update profile. Please try again."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className={`${pageClass} [animation:profile-in_0.3s_ease-out_both] motion-reduce:[animation:none]`}
        >
            <style>
                {`
                    @keyframes profile-in {
                        from {
                            opacity: 0;
                            transform: translateY(6px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}
            </style>

            {/* Page header */}
            <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="min-w-0">
                        <h1 className="text-2xl min-[400px]:text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
                            Edit profile
                        </h1>

                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            Manage your personal information and profile picture.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onBack}
                    disabled={saving}
                    className={`${secondaryButtonClass} hidden sm:inline-flex`}
                >
                    <ArrowLeft size={15} />
                    Back to profile
                </button>
            </header>

            {/* Edit form */}
            <form
                onSubmit={handleSubmit}
                className="space-y-5"
            >
                {error && (
                    <div
                        role="alert"
                        className="flex items-start gap-3 rounded-xl border border-[var(--danger)]/25 bg-[var(--danger-soft)] px-4 py-3.5 text-sm leading-5 text-[var(--danger)]"
                    >
                        <CircleAlert
                            size={17}
                            className="mt-0.5 shrink-0"
                        />
                        <span>{error}</span>
                    </div>
                )}

                {/* Profile picture */}
                <section className={`p-5 sm:p-6 lg:p-7 ${cardClass}`}>
                    <div className="mb-5">
                        <h2 className="font-semibold text-[var(--text)]">
                            Profile picture
                        </h2>

                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            Upload an image to personalize your account.
                        </p>
                    </div>

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <Avatar
                            src={avatarFailed ? "" : avatarPreview}
                            name={profile.fullName || profile.userName}
                            onError={() => setAvatarFailed(true)}
                            className="size-24 rounded-full text-2xl ring-4 ring-[var(--surface-muted)]"
                        />

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <input
                                    id="edit-avatar"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleAvatarChange}
                                    disabled={saving}
                                    className="sr-only"
                                />

                                <label
                                    htmlFor="edit-avatar"
                                    className={`${secondaryButtonClass} cursor-pointer`}
                                >
                                    <ImagePlus size={16} />
                                    {avatarFile ? "Change image" : "Upload image"}
                                </label>

                                {avatarFile && (
                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={() => {
                                            setAvatarFile(null);
                                            setAvatarFailed(false);
                                        }}
                                        className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text)] disabled:opacity-50"
                                    >
                                        Remove selection
                                    </button>
                                )}
                            </div>

                            <p className="mt-3 break-all text-xs text-[var(--text-muted)]">
                                {avatarFile
                                    ? avatarFile.name
                                    : "JPG, PNG, or WebP. Maximum size: 5 MB."}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Personal information */}
                <section className={`p-5 sm:p-6 lg:p-7 ${cardClass}`}>
                    <div className="mb-6">
                        <h2 className="font-semibold text-[var(--text)]">
                            Personal information
                        </h2>

                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            Update your name, username and contact number.
                        </p>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                        <FormField
                            id="edit-full-name"
                            label="Full name"
                            icon={UserRound}
                            type="text"
                            value={form.fullName}
                            onChange={updateField("fullName")}
                            minLength={2}
                            maxLength={100}
                            autoComplete="name"
                            required
                        />

                        <FormField
                            id="edit-user-name"
                            label="Username"
                            icon={AtSign}
                            type="text"
                            value={form.userName}
                            onChange={updateField("userName")}
                            minLength={3}
                            maxLength={30}
                            autoComplete="username"
                            hint="3 to 30 characters, no spaces."
                            required
                        />

                        <FormField
                            id="edit-mobile"
                            label="Mobile number"
                            icon={Phone}
                            type="tel"
                            inputMode="numeric"
                            value={form.mobileNo}
                            onChange={updateField("mobileNo")}
                            placeholder="10 digit number"
                            autoComplete="tel-national"
                            hint="Enter a valid 10 digit mobile number."
                            required
                        />

                        {/* Read-only email */}
                        <div className="min-w-0">
                            <label
                                htmlFor="edit-email"
                                className="flex items-center gap-1.5 text-sm font-medium text-[var(--text)]"
                            >
                                <Mail
                                    size={14}
                                    aria-hidden="true"
                                    className="text-[var(--text-muted)]"
                                />
                                Email address
                            </label>

                            <input
                                id="edit-email"
                                type="email"
                                value={profile.email || ""}
                                readOnly
                                disabled
                                className={fieldClass}
                                placeholder="Not available"
                            />

                            <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                                Email cannot be changed here.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Account information */}
                <section className={`p-5 sm:p-6 lg:p-7 ${cardClass}`}>
                    <div className="mb-5">
                        <h2 className="font-semibold text-[var(--text)]">
                            Account information
                        </h2>

                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            These details are managed by your workspace account.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <DetailItem icon={ShieldCheck} label="Account role">
                            {formatRole(profile.role)}
                        </DetailItem>

                        <DetailItem icon={CalendarDays} label="Member since">
                            {formatDate(profile.createdAt)}
                        </DetailItem>

                        <DetailItem icon={BadgeCheck} label="Verification">
                            {profile.isVerified ? "Verified" : "Not verified"}
                        </DetailItem>
                    </div>
                </section>

                {/* Form actions */}
                <footer className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-end">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={saving}
                        className={`${secondaryButtonClass} sm:min-w-28`}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className={`${primaryButtonClass} sm:min-w-36`}
                    >
                        {saving ? (
                            <>
                                <RefreshCw
                                    size={15}
                                    className="animate-spin"
                                />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Check size={16} />
                                Save changes
                            </>
                        )}
                    </button>
                </footer>
            </form>
        </div>
    );
}

/* ---------------------------------------------------------------
   Profile Page
---------------------------------------------------------------- */

export default function Profile() {
    const { userId } = useParams();
    const { updateUser } = useAuth();

    const isOwnProfile = !userId;

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const [avatarFailed, setAvatarFailed] = useState(false);

    const [editOpen, setEditOpen] = useState(false);
    const [notice, setNotice] = useState("");

    /* Load profile */
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
                        "Unable to load profile. Please try again."
                    )
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            cancelled = true;
        };
    }, [userId, reloadKey]);

    /* Auto-dismiss success notification */
    useEffect(() => {
        if (!notice) return undefined;

        const timer = setTimeout(() => setNotice(""), 3500);

        return () => clearTimeout(timer);
    }, [notice]);

    const retry = useCallback(
        () => setReloadKey((key) => key + 1),
        []
    );

    const handleBack = useCallback(
        () => setEditOpen(false),
        []
    );

    const handleSaved = useCallback((updatedProfile) => {
        if (updatedProfile && typeof updatedProfile === "object") {
            setProfile((current) => ({
                ...current,
                ...updatedProfile,
            }));

            if (isOwnProfile && updateUser) {
                updateUser(updatedProfile);
            }

            setAvatarFailed(false);
        }

        setEditOpen(false);
        setNotice("Profile updated successfully.");
    }, [isOwnProfile, updateUser]);

    if (loading) {
        return <ProfileSkeleton />;
    }

    if (error || !profile) {
        return (
            <div
                className={`${pageClass} flex min-h-[60vh] items-center justify-center`}
            >
                <div
                    role="alert"
                    className={`flex w-full max-w-md flex-col items-center px-5 py-8 text-center ${cardClass}`}
                >
                    <span className="flex size-11 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--danger,#dc2626)]">
                        <CircleAlert size={21} />
                    </span>

                    <h2 className="mt-3 text-base font-semibold text-[var(--text)]">
                        Could not load profile
                    </h2>

                    <p className="mt-1.5 text-sm leading-6 text-[var(--text-muted)]">
                        {error || "Profile details are not available."}
                    </p>

                    <button
                        type="button"
                        onClick={retry}
                        className={`mt-4 ${primaryButtonClass}`}
                    >
                        <RefreshCw size={15} />
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    /*
     * Show the full-page editor instead of opening a modal.
     */
    if (editOpen && isOwnProfile) {
        return (
            <EditProfilePage
                profile={profile}
                onBack={handleBack}
                onSaved={handleSaved}
            />
        );
    }

    const displayName =
        profile.fullName ||
        profile.userName ||
        "Unnamed user";

    const avatarUrl = avatarFailed
        ? ""
        : profile.avatar?.url || "";

    const isAdmin = profile.role === "admin";

    return (
        <div
            className={`${pageClass} [animation:profile-in_0.4s_ease-out_both] motion-reduce:[animation:none]`}
        >
            <style>
                {`
                    @keyframes profile-in {
                        from {
                            opacity: 0;
                            transform: translateY(8px);
                        }
                        to {
                            opacity: 1;
                            transform: none;
                        }
                    }
                `}
            </style>

            {/* Page heading */}
            <section>
                <h1 className="text-2xl min-[400px]:text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
                    Profile
                </h1>

                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {isOwnProfile
                        ? "Your personal and account details."
                        : "Member details and account information."}
                </p>
            </section>

            {/* Success notification */}
            {notice && (
                <div
                    role="status"
                    className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm"
                    style={{
                        color: "var(--success, #187044)",
                        borderColor:
                            "color-mix(in srgb, var(--success, #187044) 35%, transparent)",
                        background:
                            "color-mix(in srgb, var(--success, #187044) 10%, transparent)",
                    }}
                >
                    <Check size={16} aria-hidden="true" />
                    {notice}
                </div>
            )}

            {/* Profile header */}
            <section
                aria-labelledby="profile-name"
                className={`w-full p-5 sm:p-6 lg:p-8 ${cardClass}`}
            >
                <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                        <Avatar
                            src={avatarUrl}
                            name={displayName}
                            onError={() => setAvatarFailed(true)}
                            className="size-20 rounded-full text-xl ring-4 ring-[var(--surface-muted)] sm:size-24 sm:text-2xl"
                        />

                        <div className="min-w-0">
                            <h2
                                id="profile-name"
                                className="break-words text-xl font-semibold tracking-tight text-[var(--text)] sm:text-2xl lg:text-3xl"
                            >
                                {displayName}
                            </h2>

                            {profile.userName && (
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    @{profile.userName}
                                </p>
                            )}

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <Badge
                                    icon={isAdmin ? ShieldCheck : UserRound}
                                >
                                    {formatRole(profile.role)}
                                </Badge>

                                {profile.isVerified ? (
                                    <Badge icon={BadgeCheck}>
                                        Verified
                                    </Badge>
                                ) : (
                                    <Badge icon={Clock} tone="muted">
                                        Not verified
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {isOwnProfile && (
                        <button
                            type="button"
                            onClick={() => setEditOpen(true)}
                            className={`${secondaryButtonClass} self-start sm:shrink-0`}
                        >
                            <Pencil size={15} />
                            Edit profile
                        </button>
                    )}
                </div>
            </section>

            {/* Account details */}
            <section
                aria-labelledby="profile-details-heading"
                className="w-full min-w-0"
            >
                <div className="mb-4">
                    <h3
                        id="profile-details-heading"
                        className="font-semibold text-[var(--text)] sm:text-lg"
                    >
                        Account details
                    </h3>

                    <p className="mt-1 text-xs text-[var(--text-muted)] sm:text-sm">
                        Your contact information and account activity.
                    </p>
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    <DetailItem icon={UserRound} label="Full name">
                        {profile.fullName || "Not available"}
                    </DetailItem>

                    <DetailItem icon={AtSign} label="Username">
                        {profile.userName
                            ? `@${profile.userName}`
                            : "Not available"}
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
        </div>
    );
}
