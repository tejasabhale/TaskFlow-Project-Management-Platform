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
import { useWorkspace } from "../../context/WorkspaceContext.jsx";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

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

/* ---------- Shared theme styles ---------- */

const fieldStyle = {
    background: "var(--surface)",
    color: "var(--text)",
    borderColor: "var(--border)",
};

const focusRing =
    "outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus,var(--primary))]/30";

const inputClass = `w-full rounded-lg border px-3 py-2.5 text-sm ${focusRing}`;

const secondaryButtonClass =
    "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus,var(--primary))]/40";

const primaryButtonClass =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus,var(--primary))]/40";

/* ---------- Custom themed dropdown ---------- */

function Dropdown({
    id,
    value,
    options,
    onChange,
    ariaLabel,
    placeholder = "Select",
    className = "",
    size = "md",
}) {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const rootRef = useRef(null);

    const selectedIndex = options.findIndex(
        (option) => String(option.value) === String(value)
    );
    const selected = options[selectedIndex];

    useEffect(() => {
        if (!open) return undefined;

        const handlePointerDown = (event) => {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        return () =>
            document.removeEventListener("mousedown", handlePointerDown);
    }, [open]);

    const openMenu = () => {
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

        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
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

        if ((event.key === "Enter" || event.key === " ") && open) {
            event.preventDefault();
            if (options[activeIndex]) choose(options[activeIndex]);
        }
    };

    return (
        <div ref={rootRef} className={`relative ${className}`}>
            <button
                id={id}
                type="button"
                role="combobox"
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => (open ? setOpen(false) : openMenu())}
                onKeyDown={handleKeyDown}
                className={`flex w-full items-center justify-between gap-2 rounded-lg border text-left text-sm font-medium ${focusRing} ${size === "sm" ? "px-3 py-2" : "px-3 py-2.5"
                    }`}
                style={fieldStyle}
            >
                <span className="truncate">
                    {selected?.label || placeholder}
                </span>

                <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={`shrink-0 transition-transform ${open ? "rotate-180" : ""
                        }`}
                    style={{ color: "var(--text-muted)" }}
                />
            </button>

            {open && (
                <ul
                    role="listbox"
                    className="absolute left-0 z-30 mt-1.5 max-h-60 w-full min-w-[200px] overflow-auto rounded-lg border p-1 shadow-lg"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                    }}
                >
                    {options.map((option, index) => {
                        const isSelected =
                            String(option.value) === String(value);
                        const isActive = index === activeIndex;

                        return (
                            <li
                                key={option.value}
                                role="option"
                                aria-selected={isSelected}
                                onMouseEnter={() => setActiveIndex(index)}
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    choose(option);
                                }}
                                className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm"
                                style={{
                                    color: isSelected
                                        ? "var(--primary)"
                                        : "var(--text)",
                                    fontWeight: isSelected ? 600 : 500,
                                    background: isSelected
                                        ? "var(--primary-soft)"
                                        : isActive
                                            ? "var(--surface-muted)"
                                            : "transparent",
                                }}
                            >
                                <span className="truncate">
                                    {option.label}
                                </span>

                                {isSelected && (
                                    <Check size={15} aria-hidden="true" />
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default function Members() {
    const navigate = useNavigate();

    const {
        workspaces,
        currentWorkspace,
        currentWorkspaceId,
        setCurrentWorkspace,
        refreshWorkspaces,
        loading,
        error: workspaceError,
        canManageMembers,
        isOwner,
    } = useWorkspace();

    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showAddForm, setShowAddForm] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        setSearch("");
        setShowAddForm(false);
        setEmail("");
        setRole("member");
        setError("");
        setSuccess("");
    }, [currentWorkspaceId]);

    const members = currentWorkspace?.members || [];

    const workspaceOptions = workspaces.map((workspace) => ({
        value: getId(workspace),
        label: workspace.name,
    }));

    const roleOptions = [
        { value: "member", label: "Member" },
        ...(isOwner ? [{ value: "admin", label: "Admin" }] : []),
    ];

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

    const handleRefresh = async () => {
        setRefreshing(true);
        setError("");
        setSuccess("");

        try {
            await refreshWorkspaces();
        } catch (err) {
            setError(err.message || "Unable to refresh workspace members.");
        } finally {
            setRefreshing(false);
        }
    };

    const handleViewMember = (member) => {
        const memberId = getId(member);

        if (!memberId) {
            setError("Member ID is unavailable. Unable to open the profile.");
            return;
        }

        navigate(`/dashboard/members/${encodeURIComponent(memberId)}`);
    };

    const handleAddMember = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!currentWorkspaceId) {
            setError("Please select a workspace.");
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

            const token =
                localStorage.getItem("accessToken") ||
                localStorage.getItem("token") ||
                localStorage.getItem("access_token");

            const response = await fetch(
                `${API_URL.replace(/\/$/, "")}/workspaces/${currentWorkspaceId}/members`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token
                            ? { Authorization: `Bearer ${token}` }
                            : {}),
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        role,
                    }),
                }
            );

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    result.error ||
                    "Unable to add member."
                );
            }

            await refreshWorkspaces();

            closeAddForm();
            setSuccess("Member added successfully.");
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <div
                className="p-6 text-sm"
                style={{ color: "var(--text-muted)" }}
            >
                Loading members...
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 sm:p-6" style={{ color: "var(--text)" }}>
            <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Members
                    </h1>

                    <p
                        className="mt-1 text-sm"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Manage people in your workspace.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Dropdown
                        ariaLabel="Select workspace"
                        value={currentWorkspaceId || ""}
                        options={workspaceOptions}
                        onChange={setCurrentWorkspace}
                        placeholder="Select workspace"
                        size="sm"
                        className="min-w-[200px]"
                    />

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className={secondaryButtonClass}
                        style={fieldStyle}
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
                                if (showAddForm) closeAddForm();
                                else setShowAddForm(true);
                            }}
                            className={primaryButtonClass}
                            style={{ background: "var(--primary)" }}
                        >
                            {showAddForm ? (
                                "Cancel"
                            ) : (
                                <>
                                    <UserPlus size={16} />
                                    Add Member
                                </>
                            )}
                        </button>
                    )}
                </div>
            </section>

            {(error || workspaceError) && (
                <div
                    role="alert"
                    className="rounded-lg border px-4 py-3 text-sm"
                    style={{
                        color: "var(--danger, #b42318)",
                        borderColor:
                            "color-mix(in srgb, var(--danger, #b42318) 35%, transparent)",
                        background:
                            "color-mix(in srgb, var(--danger, #b42318) 10%, transparent)",
                    }}
                >
                    {error || workspaceError}
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="rounded-lg border px-4 py-3 text-sm"
                    style={{
                        color: "var(--success, #187044)",
                        borderColor:
                            "color-mix(in srgb, var(--success, #187044) 35%, transparent)",
                        background:
                            "color-mix(in srgb, var(--success, #187044) 10%, transparent)",
                    }}
                >
                    {success}
                </div>
            )}

            {/* ---------- Add member card (matches members card styling) ---------- */}
            {showAddForm && canManageMembers && (
                <form
                    onSubmit={handleAddMember}
                    className="rounded-xl border"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center gap-3 border-b p-4"
                        style={{ borderColor: "var(--border)" }}
                    >
                        <div
                            className="flex size-10 shrink-0 items-center justify-center rounded-full"
                            style={{
                                color: "var(--primary)",
                                background: "var(--primary-soft)",
                            }}
                        >
                            <UserPlus size={18} aria-hidden="true" />
                        </div>

                        <div className="min-w-0">
                            <h2 className="font-semibold">
                                Add a workspace member
                            </h2>

                            <p
                                className="mt-0.5 text-sm"
                                style={{ color: "var(--text-muted)" }}
                            >
                                Invite an existing TaskFlow user to{" "}
                                <span
                                    className="font-medium"
                                    style={{ color: "var(--text)" }}
                                >
                                    {currentWorkspace?.name || "this workspace"}
                                </span>
                                .
                            </p>
                        </div>
                    </div>

                    {/* Fields */}
                    <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_240px] sm:p-5">
                        <div className="space-y-1.5">
                            <label
                                htmlFor="member-email"
                                className="flex items-center gap-1.5 text-sm font-medium"
                            >
                                <Mail
                                    size={14}
                                    aria-hidden="true"
                                    style={{ color: "var(--text-muted)" }}
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
                            />

                            <p
                                className="text-xs"
                                style={{ color: "var(--text-muted)" }}
                            >
                                The person must already have a TaskFlow account.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="member-role"
                                className="flex items-center gap-1.5 text-sm font-medium"
                            >
                                <ShieldCheck
                                    size={14}
                                    aria-hidden="true"
                                    style={{ color: "var(--text-muted)" }}
                                />
                                Workspace role
                            </label>

                            <Dropdown
                                id="member-role"
                                value={role}
                                options={roleOptions}
                                onChange={setRole}
                            />

                            <p
                                className="text-xs"
                                style={{ color: "var(--text-muted)" }}
                            >
                                {roleDescriptions[role]}
                            </p>
                        </div>
                    </div>

                    {/* Footer actions */}
                    <div
                        className="flex flex-col-reverse gap-2 rounded-b-xl border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-5"
                        style={{
                            borderColor: "var(--border)",
                            background: "var(--surface-muted)",
                        }}
                    >
                        <button
                            type="button"
                            onClick={closeAddForm}
                            disabled={adding}
                            className={secondaryButtonClass}
                            style={fieldStyle}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={adding}
                            className={primaryButtonClass}
                            style={{ background: "var(--primary)" }}
                        >
                            <UserPlus size={16} aria-hidden="true" />
                            {adding ? "Adding..." : "Add Member"}
                        </button>
                    </div>
                </form>
            )}

            <section
                className="overflow-hidden rounded-xl border"
                style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                }}
            >
                <div
                    className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between"
                    style={{ borderColor: "var(--border)" }}
                >
                    <div>
                        <h2 className="font-semibold">
                            {currentWorkspace?.name || "Workspace members"}
                        </h2>

                        <p
                            className="mt-1 text-sm"
                            style={{ color: "var(--text-muted)" }}
                        >
                            {members.length}{" "}
                            {members.length === 1 ? "member" : "members"}
                        </p>
                    </div>

                    <div className="relative w-full sm:max-w-xs">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            style={{ color: "var(--text-muted)" }}
                        />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search members..."
                            aria-label="Search members"
                            className={`w-full rounded-lg border py-2 pl-9 pr-3 text-sm ${focusRing}`}
                            style={fieldStyle}
                        />
                    </div>
                </div>

                {!currentWorkspace ? (
                    <div
                        className="p-10 text-center text-sm"
                        style={{ color: "var(--text-muted)" }}
                    >
                        No workspace found. Create or join a workspace first.
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="p-10 text-center">
                        <Users
                            size={26}
                            className="mx-auto"
                            style={{ color: "var(--text-muted)" }}
                        />

                        <p
                            className="mt-3 text-sm"
                            style={{ color: "var(--text-muted)" }}
                        >
                            {members.length === 0
                                ? "No members are listed in this workspace yet."
                                : "No members match your search."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px] text-left text-sm">
                            <thead>
                                <tr
                                    className="border-b"
                                    style={{
                                        color: "var(--text-muted)",
                                        borderColor: "var(--border)",
                                    }}
                                >
                                    <th className="px-4 py-3 font-medium">
                                        Member
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Email
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Role
                                    </th>
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
                                            className="border-b transition-colors last:border-b-0 hover:bg-[var(--surface-muted)]"
                                            style={{
                                                borderColor: "var(--border)",
                                            }}
                                        >
                                            <td className="px-4 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleViewMember(member)
                                                    }
                                                    disabled={!memberId}
                                                    aria-label={`View details for ${name}`}
                                                    className="group flex items-center gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus,var(--primary))]/40 disabled:cursor-default"
                                                >
                                                    <div
                                                        className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold"
                                                        style={{
                                                            color: "var(--primary)",
                                                            background:
                                                                "var(--primary-soft)",
                                                        }}
                                                    >
                                                        {member?.avatar?.url ? (
                                                            <img
                                                                src={member.avatar.url}
                                                                alt=""
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            initials
                                                        )}
                                                    </div>

                                                    <span
                                                        className={`font-medium ${memberId
                                                            ? "group-hover:underline group-hover:underline-offset-4"
                                                            : ""
                                                            }`}
                                                        style={{
                                                            color: "var(--text)",
                                                        }}
                                                    >
                                                        {name}
                                                    </span>
                                                </button>
                                            </td>

                                            <td
                                                className="px-4 py-4"
                                                style={{
                                                    color: "var(--text-muted)",
                                                }}
                                            >
                                                {member?.email || "—"}
                                            </td>

                                            <td className="px-4 py-4">
                                                <span
                                                    className="rounded-full px-2.5 py-1 text-xs font-medium capitalize"
                                                    style={{
                                                        color: "var(--text)",
                                                        background:
                                                            "var(--surface-muted)",
                                                    }}
                                                >
                                                    {memberRole}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}