import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
