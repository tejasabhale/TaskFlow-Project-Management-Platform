import { ArrowRight, CheckCircle2, FolderKanban } from "lucide-react";
import { Link } from "react-router-dom";

const projects = [
  {
    id: 1,
    name: "TaskFlow Website",
    workspace: "TaskFlow",
    completedTasks: 12,
    totalTasks: 20,
    status: "In Progress",
  },
  {
    id: 2,
    name: "TaskFlow Backend",
    workspace: "TaskFlow",
    completedTasks: 8,
    totalTasks: 12,
    status: "In Progress",
  },
  {
    id: 3,
    name: "College Project",
    workspace: "College",
    completedTasks: 15,
    totalTasks: 15,
    status: "Completed",
  },
];

const statusConfig = {
  "In Progress": {
    className:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400",
  },
  Completed: {
    className:
      "bg-[#ECFDF5] text-[#047857] dark:bg-[#16382B] dark:text-[#6EE7B7]",
  },
};

export default function RecentProjects() {
  return (
    <section className="overflow-hidden rounded-xl border border-[#D9F2E3] bg-white shadow-sm dark:border-[#1E4A38] dark:bg-[#10251D]">
      <div className="flex items-center justify-between gap-4 border-b border-[#D9F2E3] px-5 py-4 dark:border-[#1E4A38]">
        <div>
          <h2 className="text-base font-semibold text-[#17201B] sm:text-lg dark:text-[#ECFDF5]">
            Recent Projects
          </h2>

          <p className="mt-1 text-xs text-[#6B7C73] dark:text-[#789A8A]">
            Your recently active projects
          </p>
        </div>

        <Link
          to="/projects"
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[#10B981] transition hover:text-[#059669] dark:text-[#34D399] dark:hover:text-[#6EE7B7]"
        >
          <span className="hidden sm:inline">View all</span>

          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="divide-y divide-[#D9F2E3] dark:divide-[#1E4A38]">
        {projects.map((project) => {
          const progress = Math.round(
            (project.completedTasks / project.totalTasks) * 100,
          );

          const status = statusConfig[project.status];

          return (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="block px-5 py-4 transition hover:bg-[#F0FDF4] dark:hover:bg-[#16382B]"
            >
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(220px,1.2fr)_minmax(250px,2fr)_auto] lg:items-center lg:gap-8">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#047857] dark:bg-[#16382B] dark:text-[#6EE7B7]">
                    <FolderKanban size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#17201B] dark:text-[#ECFDF5]">
                      {project.name}
                    </p>

                    <p className="mt-1 truncate text-xs text-[#6B7C73] dark:text-[#789A8A]">
                      {project.workspace}
                    </p>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-[#6B7C73] dark:text-[#789A8A]">
                      Progress
                    </span>

                    <span className="text-xs font-semibold text-[#17201B] dark:text-[#ECFDF5]">
                      {progress}%
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#ECFDF5] dark:bg-[#16382B]">
                    <div
                      className="h-full rounded-full bg-[#10B981] transition-all dark:bg-[#34D399]"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 lg:justify-end">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                  >
                    {project.status}
                  </span>

                  {project.completedTasks === project.totalTasks && (
                    <CheckCircle2
                      size={17}
                      className="text-[#10B981] dark:text-[#34D399]"
                    />
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
