import React from "react";
import { Route, Routes } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import Home from "../pages/home/Home";

import NotFound from "../pages/errors/NotFound";
import Tasks from "../pages/tasks/Tasks";
import Projects from "../pages/projects/Projects";
import Overview from "../pages/overview/Overview";
import Members from "../pages/members/Members";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyOtp from "../pages/auth/VerifyOtp";
import TaskDetails from "../pages/tasks/TaskDetails";
import ProjectDetails from "../pages/projects/ProjectDetails";
import MemberDetails from "../pages/members/MemberDetails";

const AppRoutes = ({ user, logout }) => {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
      </Route>

      {/* Dashboard routes with a shared layout */}
      <Route element={<DashboardLayout user={user} onLogout={logout} />}>
        <Route path="/dashboard" element={<Overview />} />
        <Route path="/dashboard/tasks" element={<Tasks />} />
        <Route path="/dashboard/tasks/:taskId" element={<TaskDetails />} />
        <Route path="/dashboard/projects" element={<Projects />} />
        <Route path="/dashboard/projects/:projectId" element={<ProjectDetails />} />
        <Route path="/dashboard/members" element={<Members />} />
        <Route path="/dashboard/members/:userId" element={<MemberDetails />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
