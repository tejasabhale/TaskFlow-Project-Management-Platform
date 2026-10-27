import { useLocation } from "react-router-dom";

export default function AppTopbar() {
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname.startsWith("/dashboard/tasks")) {
      return "Tasks";
    }

    if (location.pathname.startsWith("/dashboard/projects")) {
      return "Projects";
    }

    return "Overview";
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Page Title */}
      <div>
        <p className="text-xs text-slate-500">Workspace</p>
        <h1 className="text-lg font-semibold text-slate-900">
          {getPageTitle()}
        </h1>
      </div>

      {/* User Profile */}
      <button
        type="button"
        aria-label="User profile"
        className="flex size-9 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-800"
      >
        U
      </button>
    </header>
  );
}