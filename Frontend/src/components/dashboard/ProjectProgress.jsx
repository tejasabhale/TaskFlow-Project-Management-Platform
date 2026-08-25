import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const projects = [
  {
    id: 1,
    name: "TaskFlow Website",
    progress: 75,
    tasks: "12 / 16 tasks",
  },
  {
    id: 2,
    name: "TaskFlow Backend",
    progress: 60,
    tasks: "9 / 15 tasks",
  },
  {
    id: 3,
    name: "Mobile Application",
    progress: 35,
    tasks: "7 / 20 tasks",
  },
];

export default function ProjectProgress() {
  return (
    <section className="rounded-2xl border border-[#D9F2E3] bg-white shadow-sm dark:border-[#1E4A38] dark:bg-[#10251D]">
      <div className="flex items-center justify-between gap-4 border-b border-[#D9F2E3] px-5 py-4 dark:border-[#1E4A38]">
        <div className="min-w-0">
          <h2 className="font-semibold text-[#17201B] dark:text-[#ECFDF5]">
            Project Progress
          </h2>

          <p className="mt-1 text-xs text-[#6B7C73] dark:text-[#789A8A]">
            Current project completion
          </p>
        </div>

        <Link
          to="/projects"
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[#10B981] hover:text-[#059669] dark:text-[#34D399] dark:hover:text-[#6EE7B7]"
        >
          <span className="hidden sm:inline">View all</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="space-y-6 p-5">
        {projects.map((project) => (
          <div key={project.id}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#17201B] dark:text-[#ECFDF5]">
                  {project.name}
                </p>

                <p className="mt-1 text-xs text-[#6B7C73] dark:text-[#789A8A]">
                  {project.tasks}
                </p>
              </div>

              <span className="shrink-0 text-sm font-semibold text-[#047857] dark:text-[#6EE7B7]">
                {project.progress}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[#D9F2E3] dark:bg-[#16382B]">
              <div
                className="h-full rounded-full bg-[#10B981] transition-all dark:bg-[#34D399]"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
