import { Navigate, Outlet, useLocation } from "react-router-dom";

import useAuth from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ECFDF5] dark:bg-[#07130F]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#A7F3D0] border-t-[#10B981] dark:border-[#2D5A47] dark:border-t-[#34D399]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
