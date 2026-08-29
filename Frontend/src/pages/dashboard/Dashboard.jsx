import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>

          <p className="mt-1 text-slate-500">
            Welcome back! Here's what's happening with your workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg bg-red-500 px-5 py-2.5 font-medium text-white transition hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
