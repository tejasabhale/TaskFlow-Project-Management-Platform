import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  FiHome,
  FiFolder,
  FiCheckSquare,
  FiUsers,
  FiGrid,
  FiSettings,
  FiPlus,
  FiChevronDown,
  FiCheck,
  FiBell,
  FiLogOut,
} from "react-icons/fi";

import SidebarItem from "./SidebarItem";
import useAuth from "../../../hooks/useAuth";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { BRAND } from "../../../constants/brand";

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const {
    workspaces,
    activeWorkspace,
    changeWorkspace,
    loading: workspaceLoading,
  } = useWorkspace();

  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsWorkspaceOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Select workspace
  const handleWorkspaceSelect = (workspace) => {
    changeWorkspace(workspace);
    setIsWorkspaceOpen(false);
  };

  // New task
  const handleNewTask = () => {
    navigate("/tasks/new");
  };

  // Logout
  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  // User information
  const fullName = user?.fullName || user?.userName || user?.name || "User";

  const email = user?.email || "";

  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  // Workspace initials
  const getWorkspaceInitials = (name) => {
    if (!name) return "W";

    return (
      name
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "W"
    );
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* ==================== LOGO ==================== */}
      <div className="flex h-16 items-center border-b border-gray-200 px-5">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2.5 rounded-lg outline-none focus:ring-2 focus:ring-gray-300"
        >
          <img
            src={BRAND.logo}
            alt={`${BRAND.name} logo`}
            className="block h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
          />

          <span className="text-lg font-semibold tracking-tight text-gray-900">
            TaskFlow
          </span>
        </NavLink>
      </div>

      {/* ==================== WORKSPACE SELECTOR ==================== */}
      <div ref={dropdownRef} className="relative px-3 pt-4">
        <button
          type="button"
          onClick={() => setIsWorkspaceOpen((prev) => !prev)}
          disabled={workspaceLoading || !activeWorkspace}
          className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition hover:bg-gray-50 disabled:cursor-not-allowed"
        >
          <div className="flex min-w-0 items-center gap-3">
            {/* Workspace Avatar */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs font-semibold text-gray-700">
              {workspaceLoading
                ? "..."
                : getWorkspaceInitials(activeWorkspace?.name)}
            </div>

            {/* Workspace Details */}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {workspaceLoading
                  ? "Loading..."
                  : activeWorkspace?.name || "No workspace"}
              </p>

              <p className="truncate text-xs text-gray-500">
                {workspaceLoading
                  ? "Please wait"
                  : activeWorkspace
                    ? "Workspace"
                    : "Create a workspace"}
              </p>
            </div>
          </div>

          <FiChevronDown
            size={16}
            className={`shrink-0 text-gray-400 transition-transform ${
              isWorkspaceOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* ==================== DROPDOWN ==================== */}
        {isWorkspaceOpen && !workspaceLoading && (
          <div className="absolute left-3 right-3 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            {/* Header */}
            <div className="border-b border-gray-100 px-3 py-2.5">
              <p className="text-[11px] font-semibold tracking-wider text-gray-400">
                YOUR WORKSPACES
              </p>
            </div>

            {/* Workspace List */}
            <div className="max-h-64 overflow-y-auto p-1.5">
              {workspaces.length === 0 ? (
                <div className="px-3 py-4 text-center">
                  <p className="text-xs text-gray-500">No workspaces found.</p>
                </div>
              ) : (
                workspaces.map((workspace) => {
                  const isActive = activeWorkspace?._id === workspace._id;

                  return (
                    <button
                      key={workspace._id}
                      type="button"
                      onClick={() => handleWorkspaceSelect(workspace)}
                      className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition ${
                        isActive ? "bg-gray-100" : "hover:bg-gray-50"
                      }`}
                    >
                      {/* Workspace Avatar */}
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${
                          isActive
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {getWorkspaceInitials(workspace.name)}
                      </div>

                      {/* Workspace Details */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {workspace.name}
                        </p>

                        <p className="truncate text-xs text-gray-500">
                          Workspace
                        </p>
                      </div>

                      {/* Selected */}
                      {isActive && (
                        <FiCheck size={16} className="shrink-0 text-gray-900" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Manage Workspaces */}
            <div className="border-t border-gray-100 p-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsWorkspaceOpen(false);
                  navigate("/workspace");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-dashed border-gray-300">
                  <FiPlus size={16} />
                </div>

                <span>Manage workspaces</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== NEW TASK ==================== */}
      <div className="px-3 pt-4">
        <button
          type="button"
          onClick={handleNewTask}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <FiPlus size={17} />

          <span>New Task</span>
        </button>
      </div>

      {/* ==================== NAVIGATION ==================== */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {/* Workspace */}
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Workspace
        </p>

        <div className="space-y-1">
          <SidebarItem to="/dashboard" icon={FiHome} label="Dashboard" end />

          <SidebarItem to="/projects" icon={FiFolder} label="Projects" />

          <SidebarItem to="/tasks" icon={FiCheckSquare} label="Tasks" />

          <SidebarItem to="/members" icon={FiUsers} label="Members" />

          <SidebarItem
            to="/notifications"
            icon={FiBell}
            label="Notifications"
          />
        </div>

        {/* Manage */}
        <p className="mb-2 mt-7 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Manage
        </p>

        <div className="space-y-1">
          <SidebarItem to="/workspace" icon={FiGrid} label="Workspace" />

          <SidebarItem to="/settings" icon={FiSettings} label="Settings" />
        </div>
      </nav>

      {/* ==================== USER ==================== */}
      <div className="border-t border-gray-200 p-3">
        {/* Profile */}
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-gray-50"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {fullName}
            </p>

            <p className="truncate text-xs text-gray-500">{email}</p>
          </div>
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiLogOut size={17} />

          <span>{loggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
