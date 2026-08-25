import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Tasks",
    path: "/tasks",
    icon: CheckSquare,
  },
  {
    label: "Projects",
    path: "/projects",
    icon: FolderKanban,
  },
  {
    label: "Team",
    path: "/team",
    icon: Users,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

const LOGO_URL =
  "https://res.cloudinary.com/divpemj68/image/upload/v1786186539/Gemini_Generated_Image_3wa0y23wa0y23wa0_rx9ggr.png";

export default function DashboardSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#D9F2E3] bg-white shadow-lg transition-all duration-300 dark:border-[#1E4A38] dark:bg-[#10251D] lg:shadow-none ${
          isOpen
            ? "w-64 translate-x-0"
            : "w-64 -translate-x-full lg:w-20 lg:translate-x-0"
        }`}
      >
        <div
          className={`flex h-20 shrink-0 items-center border-b border-[#D9F2E3] dark:border-[#1E4A38] ${
            isOpen ? "justify-start px-5" : "justify-center px-2"
          }`}
        >
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex min-w-0 items-center"
            aria-label="Go to dashboard"
          >
            <img
              src={LOGO_URL}
              alt="TaskFlow"
              className="h-10 w-10 shrink-0 object-contain"
            />

            {isOpen && (
              <span className="ml-2 truncate text-xl font-bold tracking-tight text-[#17201B] dark:text-[#ECFDF5]">
                TaskFlow
              </span>
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                title={!isOpen ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-lg py-3 text-sm font-medium transition ${
                    isOpen ? "gap-3 px-3" : "justify-center px-2"
                  } ${
                    isActive
                      ? "bg-[#ECFDF5] text-[#047857] dark:bg-[#16382B] dark:text-[#6EE7B7]"
                      : "text-[#52635A] hover:bg-[#F0FDF4] hover:text-[#047857] dark:text-[#A7C4B5] dark:hover:bg-[#16382B] dark:hover:text-[#6EE7B7]"
                  }`
                }
              >
                <Icon size={19} className="shrink-0" />

                {isOpen && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-[#D9F2E3] p-3 dark:border-[#1E4A38]">
          <button
            type="button"
            onClick={handleLogout}
            title={!isOpen ? "Logout" : undefined}
            className={`flex w-full items-center rounded-lg py-3 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/20 ${
              isOpen ? "gap-3 px-3" : "justify-center px-2"
            }`}
          >
            <LogOut size={19} className="shrink-0" />

            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
