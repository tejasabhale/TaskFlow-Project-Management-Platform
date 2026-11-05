import { Navigate, Outlet } from "react-router-dom";

import Loader from "../components/common/Loader";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = () => {
    const {
        loading,
        isAuthenticated,
        user,
    } = useAuth();

    if (loading) {
        return <Loader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Admin users should not access the regular dashboard.
    if (user?.role === "admin") {
        return <Navigate to="/admin" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;