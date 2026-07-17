import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Login from "../pages/auth/Login";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  if(loading){
    return <h1>Loading...</h1>
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
