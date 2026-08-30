import { useNavigate } from "react-router-dom";

import { FiSearch, FiBell, FiHelpCircle, FiMenu } from "react-icons/fi";

const Topbar = ({ onMenuClick }) => {
  const navigate = useNavigate();

  const handleNotificationClick = () => {
    navigate("/notifications");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleHelpClick = () => {
    navigate("/help");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      {/* ==================== LEFT ==================== */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 lg:hidden"
          aria-label="Open menu"
        >
          <FiMenu size={20} />
        </button>

        {/* Search */}
        <div className="relative hidden w-72 sm:block">
          <FiSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search tasks, projects..."
            className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-14 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
          />

          <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-400 md:block">
            ⌘ K
          </span>
        </div>
      </div>

      {/* ==================== RIGHT ==================== */}
      <div className="flex items-center gap-1">
        {/* Mobile Search */}
        <button
          type="button"
          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 sm:hidden"
          aria-label="Search"
        >
          <FiSearch size={20} />
        </button>

        {/* Help */}
        <button
          type="button"
          onClick={handleHelpClick}
          className="hidden rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 sm:block"
          aria-label="Help"
        >
          <FiHelpCircle size={20} />
        </button>

        {/* Notifications */}
        <button
          type="button"
          onClick={handleNotificationClick}
          className="relative rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          aria-label="Notifications"
        >
          <FiBell size={20} />

          {/* Unread Indicator */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="mx-2 hidden h-7 w-px bg-gray-200 sm:block" />

        {/* Profile */}
        <button
          type="button"
          onClick={handleProfileClick}
          className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-gray-50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
            TA
          </div>

          <span className="hidden text-sm font-medium text-gray-700 md:block">
            Tejas
          </span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
