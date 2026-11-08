
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    RefreshCw,
    Users,
    UserPlus,
    Search,
    ChevronDown,
    Check,
    Mail,
    ShieldCheck,
} from "lucide-react";

import { useWorkspace } from "../../hooks/useWorkspace.js";
import {
    addWorkspaceMember,
    updateWorkspaceMemberRole,
    removeWorkspaceMember,
} from "../../services/workspace.service.js";

const getId = (value) => {
    if (!value) return "";

    if (typeof value === "object") {
        return String(value._id || value.id || value.userId || "");
    }

    return String(value);
};

const getMemberUser = (member) =>
    member?.user || member?.member || member;

const getMemberName = (member) =>
    member?.fullName ||
    member?.name ||
    member?.userName ||
    member?.username ||
    "Unnamed member";

const roleDescriptions = {
    member: "Can view and work on tasks in this workspace.",
    admin: "Can also add and manage members in this workspace.",
};

/* ---------------------------------------------------------------
   Shared theme styles
---------------------------------------------------------------- */

const pageClass =
    "w-full min-w-0 space-y-6 p-4 sm:space-y-7 sm:p-6 lg:p-8";

const cardClass =
    "rounded-xl border border-[var(--border)] bg-[var(--surface)]";

const fieldStyle = {
    background: "var(--surface)",
    color: "var(--text)",
    borderColor: "var(--border)",
};

const focusRing =
    "focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus,var(--primary))]/30";

const inputClass =
    `h-11 w-full rounded-xl border px-3.5 text-sm ${focusRing}`;

const secondaryButtonClass =
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] " +
    "bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text)] " +
    "transition-colors duration-150 hover:bg-[var(--surface-muted)] " +
    "disabled:cursor-not-allowed disabled:opacity-50 " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]";

const primaryButtonClass =
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold " +
    "text-white transition-colors duration-150 hover:brightness-110 " +
    "disabled:cursor-not-allowed disabled:opacity-50 " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]";

/* ---------------------------------------------------------------
   Custom themed dropdown
---------------------------------------------------------------- */

function Dropdown({
    id,
    value,
    options,
    onChange,
    ariaLabel,
    placeholder = "Select",
    className = "",
}) {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const rootRef = useRef(null);
    const menuRef = useRef(null);

    const selectedIndex = options.findIndex(
        (option) => String(option.value) === String(value)
    );

    const selected = options[selectedIndex];

    /* Close on outside click */
    useEffect(() => {
        if (!open) return undefined;

        const handlePointerDown = (event) => {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);

        return () => {
            document.removeEventListener(
                "pointerdown",
                handlePointerDown
            );
        };
    }, [open]);

    /* Keep active option visible */
    useEffect(() => {
        if (!open || activeIndex < 0) return;

        menuRef.current
            ?.querySelector(`[data-index="${activeIndex}"]`)
            ?.scrollIntoView({ block: "nearest" });
    }, [open, activeIndex]);

    const openMenu = () => {
        if (options.length === 0) return;

        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
        setOpen(true);
    };

    const choose = (option) => {
        onChange(option.value);
        setOpen(false);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Escape") {
            setOpen(false);
            return;
        }

        if (event.key === "Tab") {
            setOpen(false);
            return;
        }

        if (
            event.key === "ArrowDown" ||
            event.key === "ArrowUp"
        ) {
            event.preventDefault();

            if (!open) {
                openMenu();
                return;
            }

            const step = event.key === "ArrowDown" ? 1 : -1;

            setActiveIndex(
                (previous) =>
                    (previous + step + options.length) % options.length
            );

            return;
        }

        if (event.key === "Home" && open) {
            event.preventDefault();
            setActiveIndex(0);
            return;
        }

        if (event.key === "End" && open) {
            event.preventDefault();
            setActiveIndex(options.length - 1);
            return;
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();

            if (!open) {
                openMenu();
            } else if (options[activeIndex]) {
                choose(options[activeIndex]);
            }
        }
    };

    return (
        <div
            ref={rootRef}
            className={`relative min-w-0 ${className}`}
        >
            <button
                id={id}
                type="button"
                role="combobox"
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open && id ? `${id}-listbox` : undefined}
                onClick={() => (open ? setOpen(false) : openMenu())}
                onKeyDown={handleKeyDown}
                className={`${inputClass} flex items-center justify-between gap-2 text-left font-medium`}
                style={fieldStyle}
            >
                <span className="truncate">
                    {selected?.label || placeholder}
                </span>

                <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={`shrink-0 text-[var(--text-muted)] transition-transform duration-150 ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {open && (
                <ul
                    ref={menuRef}
                    id={id ? `${id}-listbox` : undefined}
                    role="listbox"
                    className="absolute left-0 top-full z-[60] mt-1.5 max-h-60 w-full min-w-[180px] overflow-y-auto overscroll-contain rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1"
                    style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        boxShadow: "none",
                    }}
                >
                    {options.map((option, index) => {
                        const isSelected =
                            String(option.value) === String(value);

                        const isActive = index === activeIndex;

                        return (
                            <li
                                key={option.value}
                                data-index={index}
                                role="option"
                                aria-selected={isSelected}
                                onMouseEnter={() =>
                                    setActiveIndex(index)
                                }
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    choose(option);
                                }}
                                className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-100 ${isSelected
                                        ? "bg-[var(--primary-soft)] font-semibold text-[var(--primary)]"
                                        : isActive
                                            ? "bg-[var(--surface-muted)] font-medium text-[var(--text)]"
                                            : "font-medium text-[var(--text)]"
                                    }`}
                            >
                                <span className="truncate">
                                    {option.label}
                                </span>

                                {isSelected && (
                                    <Check
                                        size={15}
                                        aria-hidden="true"
                                        className="shrink-0"
                                    />
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

/* ---------------------------------------------------------------
   Members Page
---------------------------------------------------------------- */

export default function Members() {
    const navigate = useNavigate();

    const {
        currentWorkspace,
        currentWorkspaceId,
        refreshWorkspaces,
        loading,
        error: workspaceError,
        canManageMembers,
        isOwner,
        isAdmin,
    } = useWorkspace();

    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showAddForm, setShowAddForm] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");
    const [adding, setAdding] = useState(false);

    /* Reset form and messages when active workspace changes */
    useEffect(() => {
        setSearch("");
        setShowAddForm(false);
        setEmail("");
        setRole("member");
        setError("");
        setSuccess("");
    }, [currentWorkspaceId]);

    const members = currentWorkspace?.members || [];

    /* Role options */
    const roleOptions = [
        { value: "member", label: "Member" },
        ...(isOwner ? [{ value: "admin", label: "Admin" }] : []),
    ];

    /* Filter members */
    const filteredMembers = members.filter((item) => {
        const member = getMemberUser(item);
        const name = getMemberName(member).toLowerCase();
        const memberEmail = (member?.email || "").toLowerCase();
        const memberRole = (item?.role || "member").toLowerCase();
        const query = search.toLowerCase().trim();

        return (
            name.includes(query) ||
            memberEmail.includes(query) ||
            memberRole.includes(query)
        );
    });

    const closeAddForm = () => {
        setShowAddForm(false);
        setEmail("");
        setRole("member");
    };

    /* Refresh workspace members */
    const handleRefresh = async () => {
        setRefreshing(true);
        setError("");
        setSuccess("");

        try {
            await refreshWorkspaces();
        } catch (err) {
            setError(
                err.message || "Unable to refresh workspace members."
            );
        } finally {
            setRefreshing(false);
        }
    };

    /* Open member profile */
    const handleViewMember = (member) => {
        const memberId = getId(member);

        if (!memberId) {
            setError(
                "Member ID is unavailable. Unable to open the profile."
            );
            return;
        }

        navigate(
            `/dashboard/members/${encodeURIComponent(memberId)}`
        );
    };

    /* Add member */
    const handleAddMember = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!currentWorkspaceId) {
            setError("No active workspace found.");
            return;
        }

        if (!canManageMembers) {
            setError(
                "Only the workspace owner or an admin can add members."
            );
            return;
        }

        if (!email.trim()) {
            setError("Enter the member's email address.");
            return;
        }

        try {
            setAdding(true);

            await addWorkspaceMember(currentWorkspaceId, {
                email: email.trim(),
                role,
            });

            await refreshWorkspaces();

            closeAddForm();
            setSuccess("Member added successfully.");
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to add member."
            );
        } finally {
            setAdding(false);
        }
    };

    /* Role change handler */
    const handleRoleChange = async (memberId, newRole) => {
        try {
            setError("");
            setSuccess("");
            await updateWorkspaceMemberRole(currentWorkspaceId, memberId, newRole);
            await refreshWorkspaces();
            setSuccess(`Member role updated to ${newRole}.`);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to update member role."
            );
        }
    };

    /* Remove member handler */
    const handleRemoveMember = async (memberId, memberName) => {
        if (!window.confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) {
            return;
        }

        try {
            setError("");
            setSuccess("");
            await removeWorkspaceMember(currentWorkspaceId, memberId);
            await refreshWorkspaces();
            setSuccess(`${memberName} was removed from the workspace.`);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to remove member."
            );
        }
    };

    /* Loading state */
    if (loading) {
        return (
            <div
                className={pageClass}
                role="status"
                aria-live="polite"
            >
                <div className="space-y-4">
                    <div className="h-7 w-40 animate-pulse rounded-lg bg-[var(--surface-muted)]" />
                    <div className="h-20 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--surface)]" />
                    <div className="h-72 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--surface)]" />
                </div>

                <p className="sr-only">Loading members...</p>
            </div>
        );
    }

    return (
        <div
            className={pageClass}
            style={{ color: "var(--text)" }}
        >
            {/* ---------------------------------------------------
                Page header
            --------------------------------------------------- */}

            <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-subtle)]">
                        <span className="size-1.5 rounded-full bg-[var(--primary)]" />
                        Workspace management
                    </p>

                    <h1 className="text-2xl min-[400px]:text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
                        Members
                    </h1>

                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Manage people in{" "}
                        <span className="font-medium text-[var(--text)]">
                            {currentWorkspace?.name || "your workspace"}
                        </span>
                        .
                    </p>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={refreshing || !currentWorkspaceId}
                        className={secondaryButtonClass}
                    >
                        <RefreshCw
                            size={15}
                            className={refreshing ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>

                    {currentWorkspace && canManageMembers && (
                        <button
                            type="button"
                            aria-expanded={showAddForm}
                            onClick={() => {
                                setError("");
                                setSuccess("");

                                if (showAddForm) {
                                    closeAddForm();
                                } else {
                                    setShowAddForm(true);
                                }
                            }}
                            className={primaryButtonClass}
                            style={{ background: "var(--primary)" }}
                        >
                            {showAddForm ? (
                                "Cancel"
                            ) : (
                                <>
                                    <UserPlus size={16} />
                                    Add member
                                </>
                            )}
                        </button>
                    )}
                </div>
            </header>

            {/* ---------------------------------------------------
                Alerts
            --------------------------------------------------- */}

            {(error || workspaceError) && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-[var(--danger)]/25 bg-[var(--danger-soft)] px-4 py-3.5 text-sm leading-5 text-[var(--danger)]"
                >
                    <span className="flex-1">
                        {error || workspaceError}
                    </span>
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="flex items-center gap-2 rounded-xl border px-4 py-3.5 text-sm"
                    style={{
                        color: "var(--success, #187044)",
                        borderColor:
                            "color-mix(in srgb, var(--success, #187044) 35%, transparent)",
                        background:
                            "color-mix(in srgb, var(--success, #187044) 10%, transparent)",
                    }}
                >
                    <Check size={16} aria-hidden="true" />
                    {success}
                </div>
            )}

            {/* ---------------------------------------------------
                Add member form
            --------------------------------------------------- */}

            {showAddForm && canManageMembers && (
                <form
                    onSubmit={handleAddMember}
                    className={`overflow-visible ${cardClass}`}
                >
                    {/* Form header */}
                    <div className="flex items-center gap-3 border-b border-[var(--border)] p-4 sm:p-5">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                            <UserPlus size={18} aria-hidden="true" />
                        </div>

                        <div className="min-w-0">
                            <h2 className="font-semibold text-[var(--text)]">
                                Add a workspace member
                            </h2>

                            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                                Invite an existing TaskFlow user to{" "}
                                <span className="font-medium text-[var(--text)]">
                                    {currentWorkspace?.name || "this workspace"}
                                </span>
                                .
                            </p>
                        </div>
                    </div>

                    {/* Form fields */}
                    <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
                        <div className="min-w-0 space-y-1.5">
                            <label
                                htmlFor="member-email"
                                className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text)]"
                            >
                                <Mail
                                    size={14}
                                    aria-hidden="true"
                                    className="text-[var(--text-muted)]"
                                />
                                Email address
                            </label>

                            <input
                                id="member-email"
                                type="email"
                                required
                                autoFocus
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="member@example.com"
                                className={inputClass}
                                style={fieldStyle}
                                disabled={adding}
                            />

                            <p className="text-xs text-[var(--text-muted)]">
                                The person must already have a TaskFlow account.
                            </p>
                        </div>

                        <div className="min-w-0 space-y-1.5">
                            <label
                                htmlFor="member-role"
                                className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text)]"
                            >
                                <ShieldCheck
                                    size={14}
                                    aria-hidden="true"
                                    className="text-[var(--text-muted)]"
                                />
                                Workspace role
                            </label>

                            <Dropdown
                                id="member-role"
                                ariaLabel="Select workspace role"
                                value={role}
                                options={roleOptions}
                                onChange={setRole}
                                className="w-full"
                            />

                            <p className="text-xs text-[var(--text-muted)]">
                                {roleDescriptions[role]}
                            </p>
                        </div>
                    </div>

                    {/* Form footer */}
                    <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-5">
                        <button
                            type="button"
                            onClick={closeAddForm}
                            disabled={adding}
                            className={secondaryButtonClass}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={adding || !email.trim()}
                            className={primaryButtonClass}
                            style={{ background: "var(--primary)" }}
                        >
                            {adding ? (
                                <>
                                    <RefreshCw
                                        size={15}
                                        className="animate-spin"
                                    />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={16} />
                                    Add member
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* ---------------------------------------------------
                Members list
            --------------------------------------------------- */}

            <section className={`min-w-0 overflow-hidden ${cardClass}`}>
                {/* Members header and search */}
                <div className="flex flex-col gap-4 border-b border-[var(--border)] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="font-semibold text-[var(--text)]">
                                {currentWorkspace?.name || "Workspace members"}
                            </h2>

                            <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-medium text-[var(--text-muted)]">
                                {members.length}
                            </span>
                        </div>

                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            People who have access to this workspace.
                        </p>
                    </div>

                    <div className="relative w-full lg:max-w-xs">
                        <Search
                            size={16}
                            aria-hidden="true"
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]"
                        />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search members..."
                            aria-label="Search members"
                            className={`${inputClass} pl-10`}
                            style={fieldStyle}
                        />
                    </div>
                </div>

                {/* No active workspace */}
                {!currentWorkspace ? (
                    <div className="px-5 py-16 text-center">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--text-muted)]">
                            <Users size={22} />
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-[var(--text)]">
                            No active workspace
                        </h3>

                        <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[var(--text-muted)]">
                            Select or join a workspace from the dashboard workspace menu to view its members.
                        </p>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="px-5 py-16 text-center">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--text-muted)]">
                            <Users size={22} />
                        </div>

                        <p className="mt-3 text-sm font-semibold text-[var(--text)]">
                            {members.length === 0
                                ? "No members yet"
                                : "No members found"}
                        </p>

                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            {members.length === 0
                                ? "Add a member to get started."
                                : "Try searching with a different name or email."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px] text-left text-sm">
                            <thead>
                                <tr className="bg-[var(--surface-muted)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                                    <th className="px-4 py-3.5 font-semibold sm:px-5">
                                        Member
                                    </th>

                                    <th className="px-4 py-3.5 font-semibold sm:px-5">
                                        Email
                                    </th>

                                    <th className="px-4 py-3.5 font-semibold sm:px-5">
                                        Role
                                    </th>

                                    {canManageMembers && (
                                        <th className="px-4 py-3.5 font-semibold sm:px-5 text-right">
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {filteredMembers.map((item, index) => {
                                    const member = getMemberUser(item);
                                    const memberId = getId(member);
                                    const memberRole = item?.role || "member";
                                    const name = getMemberName(member);
                                    const initials =
                                        name.charAt(0).toUpperCase();

                                    return (
                                        <tr
                                            key={memberId || index}
                                            className="border-t border-[var(--border)] transition-colors duration-150 hover:bg-[var(--surface-muted)]"
                                        >
                                            {/* Member */}
                                            <td className="px-4 py-4 sm:px-5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleViewMember(member)
                                                    }
                                                    disabled={!memberId}
                                                    aria-label={`View details for ${name}`}
                                                    className="group flex items-center gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus,var(--primary))]/40 disabled:cursor-default"
                                                >
                                                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--primary-soft)] text-sm font-semibold text-[var(--primary)]">
                                                        {member?.avatar?.url ? (
                                                            <img
                                                                src={member.avatar.url}
                                                                alt=""
                                                                className="size-full object-cover"
                                                            />
                                                        ) : (
                                                            initials
                                                        )}
                                                    </div>

                                                    <span
                                                        className={`font-semibold text-[var(--text)] ${memberId
                                                                ? "group-hover:underline group-hover:underline-offset-4"
                                                                : ""
                                                            }`}
                                                    >
                                                        {name}
                                                    </span>
                                                </button>
                                            </td>

                                            {/* Email */}
                                            <td className="px-4 py-4 text-[var(--text-muted)] sm:px-5">
                                                <span className="block max-w-[260px] truncate">
                                                    {member?.email || "—"}
                                                </span>
                                            </td>

                                            {/* Role */}
                                            <td className="px-4 py-4 sm:px-5">
                                                <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-medium capitalize text-[var(--text-muted)]">
                                                    {memberRole}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            {canManageMembers && (
                                                <td className="px-4 py-4 sm:px-5 text-right">
                                                    {memberRole !== "owner" &&
                                                    (isOwner || (isAdmin && memberRole === "member")) ? (
                                                        <div className="flex items-center justify-end gap-3">
                                                            {isOwner && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleRoleChange(
                                                                            memberId,
                                                                            memberRole === "admin"
                                                                                ? "member"
                                                                                : "admin"
                                                                        )
                                                                    }
                                                                    className="text-xs font-semibold text-[var(--primary)] hover:underline focus:outline-none"
                                                                >
                                                                    {memberRole === "admin"
                                                                        ? "Make member"
                                                                        : "Make admin"}
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRemoveMember(memberId, name)
                                                                }
                                                                className="text-xs font-semibold text-[var(--danger)] hover:underline focus:outline-none"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-[var(--text-subtle)]">—</span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Table footer */}
                {currentWorkspace && filteredMembers.length > 0 && (
                    <div className="border-t border-[var(--border)] px-4 py-3 sm:px-5">
                        <p className="text-xs text-[var(--text-muted)]">
                            Showing {filteredMembers.length} of {members.length}{" "}
                            {members.length === 1 ? "member" : "members"}
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}
