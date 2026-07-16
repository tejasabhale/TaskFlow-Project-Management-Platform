import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Login from "../pages/auth/Login";

function ProtectedRoute() {
  const isAuthenticated = false;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
