import { Bell, Menu, X } from "lucide-react";

import useAuth from "../../hooks/useAuth";

export default function DashboardHeader({ onMenuClick, isSidebarOpen }) {
  const { user } = useAuth();

  const displayName = user?.fullName || user?.userName || "User";

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#D9F2E3] bg-white/95 px-4 backdrop-blur sm:px-6 dark:border-[#1E4A38] dark:bg-[#10251D]/95">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#52635A] transition hover:bg-[#ECFDF5] hover:text-[#047857] dark:text-[#A7C4B5] dark:hover:bg-[#16382B] dark:hover:text-[#6EE7B7]"
        >
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className="min-w-0">
          <p className="text-xs text-[#6B7C73] sm:text-sm dark:text-[#789A8A]">
            Welcome back
          </p>

          <h1 className="truncate text-base font-bold text-[#17201B] sm:text-lg dark:text-[#ECFDF5]">
            {displayName}
          </h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2.5 text-[#52635A] transition hover:bg-[#ECFDF5] hover:text-[#047857] dark:text-[#A7C4B5] dark:hover:bg-[#16382B] dark:hover:text-[#6EE7B7]"
        >
          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#10B981] dark:bg-[#34D399]" />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ECFDF5] text-sm font-bold text-[#047857] sm:h-10 sm:w-10 dark:bg-[#16382B] dark:text-[#6EE7B7]">
          {initial}
        </div>
      </div>
    </header>
  );
}
