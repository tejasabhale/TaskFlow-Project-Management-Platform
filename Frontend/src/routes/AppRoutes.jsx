import { Navigate, Route, Routes } from "react-router-dom";

import Home from "../pages/landing/Home";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyOTP from "../pages/auth/VerifyOtp";
import ForgotPassword from "../pages/auth/ForgotPassword";

import Dashboard from "../pages/dashboard/Dashboard";

import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";

import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import Projects from "../pages/projects/Projects";
import Tasks from "../pages/tasks/Tasks";
import Members from "../pages/members/Members";
import Workspace from "../pages/workspace/Workspace";
import Notifications from "../pages/notifications/Notifications";
import Settings from "../pages/settings/Settings";
import ProjectDetails from "../pages/projects/ProjectDetails";
import TaskDetails from "../pages/tasks/TaskDetails";
import { WorkspaceProvider } from "../providers/WorkspaceProvider";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <WorkspaceProvider>
              <DashboardLayout />
            </WorkspaceProvider>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />

          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/:taskId" element={<TaskDetails />} />

          <Route path="/members" element={<Members />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
