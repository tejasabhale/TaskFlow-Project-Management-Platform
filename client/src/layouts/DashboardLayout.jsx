import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import AppTopbar from "../components/dashboard/AppTopbar";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface-muted)] text-[var(--text)]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area: topbar stays fixed, only the content scrolls */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar />

        <main
          id="main-content"
          className="flex-1 overflow-y-auto overscroll-contain scroll-smooth"
        >
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}