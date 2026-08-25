import { ArrowRight, CheckCircle2, Circle, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";

const tasks = [
  {
    id: 1,
    title: "Design landing page",
    project: "TaskFlow Website",
    status: "Completed",
  },
  {
    id: 2,
    title: "Implement authentication",
    project: "TaskFlow Backend",
    status: "In Progress",
  },
  {
    id: 3,
    title: "Create dashboard UI",
    project: "TaskFlow Website",
    status: "Pending",
  },
  {
    id: 4,
    title: "Review project structure",
    project: "TaskFlow",
    status: "In Progress",
  },
];

const statusConfig = {
  Completed: {
    icon: CheckCircle2,
    className:
      "bg-[#ECFDF5] text-[#047857] dark:bg-[#16382B] dark:text-[#6EE7B7]",
  },
  "In Progress": {
    icon: Clock3,
    className:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400",
  },
  Pending: {
    icon: Circle,
    className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  },
};

export default function RecentTasks() {
  return (
    <section className="rounded-2xl border border-[#D9F2E3] bg-white shadow-sm dark:border-[#1E4A38] dark:bg-[#10251D]">
      <div className="flex items-center justify-between gap-4 border-b border-[#D9F2E3] px-5 py-4 dark:border-[#1E4A38]">
        <div className="min-w-0">
          <h2 className="font-semibold text-[#17201B] dark:text-[#ECFDF5]">
            Recent Tasks
          </h2>

          <p className="mt-1 text-xs text-[#6B7C73] dark:text-[#789A8A]">
            Your latest task activity
          </p>
        </div>

        <Link
          to="/tasks"
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[#10B981] hover:text-[#059669] dark:text-[#34D399] dark:hover:text-[#6EE7B7]"
        >
          <span className="hidden sm:inline">View all</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="divide-y divide-[#D9F2E3] dark:divide-[#1E4A38]">
        {tasks.map((task) => {
          const config = statusConfig[task.status];
          const Icon = config.icon;

          return (
            <div
              key={task.id}
              className="flex items-center gap-3 px-5 py-4 sm:gap-4"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.className}`}
              >
                <Icon size={17} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#17201B] dark:text-[#ECFDF5]">
                  {task.title}
                </p>

                <p className="mt-1 truncate text-xs text-[#6B7C73] dark:text-[#789A8A]">
                  {task.project}
                </p>
              </div>

              <span className="hidden shrink-0 text-xs font-medium text-[#6B7C73] md:block dark:text-[#789A8A]">
                {task.status}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
