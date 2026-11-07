import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import Loader from "../components/common/Loader";
import Privacy from "../pages/privacy/Privacy";
import Terms from "../pages/terms/Terms";
import FAQ from "../pages/faq/FAQ";
import About from "../pages/about/About";
import Contact from "../pages/contact/Contact";
import Pricing from "../pages/pricing/Pricing";

// Lazy load route pages for performance & code splitting
const Home = lazy(() => import("../pages/home/Home"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const VerifyOtp = lazy(() => import("../pages/auth/VerifyOtp"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));

const Overview = lazy(() => import("../pages/overview/Overview"));
const Tasks = lazy(() => import("../pages/tasks/Tasks"));
const TaskDetails = lazy(() => import("../pages/tasks/TaskDetails"));
const Projects = lazy(() => import("../pages/projects/Projects"));
const ProjectDetails = lazy(() => import("../pages/projects/ProjectDetails"));
const Members = lazy(() => import("../pages/members/Members"));
const MemberDetails = lazy(() => import("../pages/members/MemberDetails"));
const Profile = lazy(() => import("../pages/profile/Profile"));
const NotFound = lazy(() => import("../pages/errors/NotFound"));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
          </Route>
        </Route>

        {/* Dashboard routes with a shared layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Overview />} />
            <Route path="/dashboard/tasks" element={<Tasks />} />
            <Route path="/dashboard/tasks/:taskId" element={<TaskDetails />} />
            <Route path="/dashboard/projects" element={<Projects />} />
            <Route
              path="/dashboard/projects/:projectId"
              element={<ProjectDetails />}
            />
            <Route path="/dashboard/members" element={<Members />} />
            <Route
              path="/dashboard/members/:userId"
              element={<MemberDetails />}
            />
            <Route path="/dashboard/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
