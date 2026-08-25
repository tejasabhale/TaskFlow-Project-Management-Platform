import {
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  ListTodo,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";

import StatCard from "../../components/dashboard/StatCard";
import TaskOverview from "../../components/dashboard/TaskOverview";
import MyWorkspaces from "../../components/dashboard/MyWorkspaces";
import RecentTasks from "../../components/dashboard/RecentTasks";
import RecentNotifications from "../../components/dashboard/RecentNotifications";
import RecentProjects from "../../components/dashboard/RecentProjects";

export default function Dashboard() {
  const { user } = useAuth();

  const displayName =
    user?.fullName?.trim() || user?.userName?.trim() || "there";

  return (
    <main className="min-w-0">
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        <section>
          <h1 className="text-2xl font-bold tracking-tight text-[#17201B] sm:text-3xl dark:text-[#ECFDF5]">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-[#6B7C73] sm:text-base dark:text-[#789A8A]">
            Here's an overview of your workspace activity, {displayName}.
          </p>
        </section>

        <section
          aria-label="Task statistics"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard
            title="Total Tasks"
            value="48"
            description="Across your workspaces"
            icon={ClipboardList}
          />

          <StatCard
            title="Completed"
            value="24"
            description="Tasks completed"
            icon={CheckCircle2}
          />

          <StatCard
            title="In Progress"
            value="16"
            description="Currently being worked on"
            icon={ListTodo}
          />

          <StatCard
            title="Projects"
            value="8"
            description="Active projects"
            icon={FolderKanban}
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="min-w-0 xl:col-span-2">
            <TaskOverview />
          </div>

          <div className="min-w-0">
            <MyWorkspaces />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="min-w-0">
            <RecentTasks />
          </div>

          <div className="min-w-0">
            <RecentNotifications />
          </div>
        </section>

        <section>
          <RecentProjects />
        </section>
      </div>
    </main>
  );
}
