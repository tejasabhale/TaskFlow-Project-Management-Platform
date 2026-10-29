
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Users, UserPlus, Search } from "lucide-react";
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

            setEmail("");
            setRole("member");
            setShowAddForm(false);
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

                <div className="flex flex-wrap gap-2">
                    <select
                        aria-label="Select workspace"
                        value={currentWorkspaceId || ""}
                        onChange={(event) =>
                            setCurrentWorkspace(event.target.value)
                        }
                        className="rounded-lg border px-3 py-2 text-sm outline-none"
                        style={{
                            color: "var(--text)",
                            background: "var(--surface)",
                            borderColor: "var(--border)",
                        }}
                    >
                        {workspaces.map((workspace) => (
                            <option
                                key={getId(workspace)}
                                value={getId(workspace)}
                            >
                                {workspace.name}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
                        style={{
                            color: "var(--text)",
                            background: "var(--surface)",
                            borderColor: "var(--border)",
                        }}
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
                            onClick={() => {
                                setError("");
                                setSuccess("");
                                setShowAddForm((previous) => !previous);
                            }}
                            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
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
                        color: "#b42318",
                        borderColor: "#f2b8b5",
                        background: "#fff4f2",
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
                        color: "#187044",
                        borderColor: "#b7e4c7",
                        background: "#f0fff5",
                    }}
                >
                    {success}
                </div>
            )}

            {showAddForm && canManageMembers && (
                <form
                    onSubmit={handleAddMember}
                    className="max-w-xl space-y-4 rounded-xl border p-5"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                    }}
                >
                    <div>
                        <h2 className="text-lg font-semibold">
                            Add a workspace member
                        </h2>

                        <p
                            className="mt-1 text-sm"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Enter the email address of an existing TaskFlow
                            user.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="member-email"
                            className="block text-sm font-medium"
                        >
                            Email address
                        </label>

                        <input
                            id="member-email"
                            type="email"
                            required
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="member@example.com"
                            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                            style={{
                                background: "var(--surface)",
                                color: "var(--text)",
                                borderColor: "var(--border)",
                            }}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="member-role"
                            className="block text-sm font-medium"
                        >
                            Workspace role
                        </label>

                        <select
                            id="member-role"
                            value={role}
                            onChange={(event) => setRole(event.target.value)}
                            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                            style={{
                                background: "var(--surface)",
                                color: "var(--text)",
                                borderColor: "var(--border)",
                            }}
                        >
                            <option value="member">Member</option>
                            {isOwner && (
                                <option value="admin">Admin</option>
                            )}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={adding}
                        className="rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                        style={{ background: "var(--primary)" }}
                    >
                        {adding ? "Adding..." : "Add Member"}
                    </button>
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
                            className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none"
                            style={{
                                background: "var(--surface)",
                                color: "var(--text)",
                                borderColor: "var(--border)",
                            }}
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
                                            className="border-b last:border-b-0"
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
                                                    className="group flex items-center gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:cursor-default"
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
