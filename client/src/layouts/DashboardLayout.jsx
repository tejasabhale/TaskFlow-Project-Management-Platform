import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import AppTopbar from "../components/dashboard/AppTopbar";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 md:flex-row">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar />

        {/* Selected Page Renders Here */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}