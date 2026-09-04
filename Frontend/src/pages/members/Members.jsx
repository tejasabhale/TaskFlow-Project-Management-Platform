import { useEffect, useState } from "react";
import {
  FiMoreHorizontal,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiUserCheck,
  FiX,
} from "react-icons/fi";
import { useWorkspace } from "../../hooks/useWorkspace";
import {
  getWorkspaceMembers,
  removeWorkspaceMember,
  updateMemberRole,
} from "../../services/workspace.service";

const Members = () => {
  const { activeWorkspace } = useWorkspace();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openMenu, setOpenMenu] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  const fetchMembers = async () => {
    if (!activeWorkspace?._id) {
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getWorkspaceMembers(activeWorkspace._id);
      const memberList = response.data || [];

      setMembers(Array.isArray(memberList) ? memberList : []);
    } catch (error) {
      console.error("Failed to fetch workspace members:", error);
      setError("Failed to load members. Please try again.");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [activeWorkspace?._id]);

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const formatRole = (role) => {
    if (!role) return "Member";

    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleRemoveMember = async (member) => {
    const userId = member?.user?._id;

    if (!userId || !activeWorkspace?._id) return;

    const confirmed = window.confirm(
      `Are you sure you want to remove ${member.user.fullName} from this workspace?`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setOpenMenu(null);

      await removeWorkspaceMember(activeWorkspace._id, userId);

      setMembers((currentMembers) =>
        currentMembers.filter((item) => item.user?._id !== userId),
      );
    } catch (error) {
      console.error("Failed to remove member:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to remove member. Please try again.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openRoleModal = (member) => {
    setSelectedMember(member);
    setSelectedRole(member.role);
    setOpenMenu(null);
    setShowRoleModal(true);
  };

  const handleRoleUpdate = async () => {
    if (!selectedMember?.user?._id || !activeWorkspace?._id || !selectedRole) {
      return;
    }

    try {
      setActionLoading(true);

      await updateMemberRole(
        activeWorkspace._id,
        selectedMember.user._id,
        selectedRole,
      );

      setMembers((currentMembers) =>
        currentMembers.map((member) =>
          member.user?._id === selectedMember.user._id
            ? { ...member, role: selectedRole }
            : member,
        ),
      );

      setShowRoleModal(false);
      setSelectedMember(null);
    } catch (error) {
      console.error("Failed to update member role:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to update member role. Please try again.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Members</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your workspace members.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <FiPlus size={17} />
          Invite Member
        </button>
      </div>

      {/* Workspace */}
      {activeWorkspace && (
        <div className="mb-5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Workspace
          </p>

          <p className="mt-1 text-sm font-medium text-gray-800">
            {activeWorkspace.name}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>

          <button
            type="button"
            onClick={fetchMembers}
            className="flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-900"
          >
            <FiRefreshCw size={15} />
            Retry
          </button>
        </div>
      )}

      {/* Members */}
      <div className="overflow-visible rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="divide-y divide-gray-100">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />

                  <div>
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                    <div className="mt-2 h-3 w-44 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>

                <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <FiUserCheck size={20} className="text-gray-500" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-gray-900">
              No members found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-gray-500">
              This workspace doesn't have any members yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {members.map((member) => {
              const user = member.user;

              return (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-5"
                >
                  {/* User */}
                  <div className="flex min-w-0 items-center gap-4">
                    {user?.avatar?.url ? (
                      <img
                        src={user.avatar.url}
                        alt={user.fullName || "Member"}
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                        {getInitials(user?.fullName)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {user?.fullName || "Unknown User"}
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-500">
                        {user?.email || "No email"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="relative ml-4 flex shrink-0 items-center gap-4">
                    <span className="hidden rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 sm:block">
                      {formatRole(member.role)}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu(openMenu === member._id ? null : member._id)
                      }
                      disabled={actionLoading}
                      className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FiMoreHorizontal size={18} />
                    </button>

                    {openMenu === member._id && (
                      <div className="absolute right-0 top-9 z-20 w-44 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg">
                        <button
                          type="button"
                          onClick={() => openRoleModal(member)}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <FiUserCheck size={15} />
                          Change Role
                        </button>

                        {member.role !== "owner" && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member)}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          >
                            <FiTrash2 size={15} />
                            Remove Member
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Change Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Change Role
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update the role of{" "}
                  {selectedMember?.user?.fullName || "this member"}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedMember(null);
                }}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-2">
              {["admin", "member"].map((role) => (
                <label
                  key={role}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 ${
                    selectedRole === role
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200"
                  }`}
                >
                  <span className="text-sm font-medium text-gray-800">
                    {formatRole(role)}
                  </span>

                  <input
                    type="radio"
                    name="member-role"
                    value={role}
                    checked={selectedRole === role}
                    onChange={(event) => setSelectedRole(event.target.value)}
                    className="h-4 w-4"
                  />
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedMember(null);
                }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRoleUpdate}
                disabled={actionLoading}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? "Updating..." : "Update Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
