import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import { Link } from "react-router-dom";

const workspaces = [
  {
    id: 1,
    name: "TaskFlow",
    description: "Productivity platform",
  },
  {
    id: 2,
    name: "College Project",
    description: "Academic workspace",
  },
  {
    id: 3,
    name: "Development",
    description: "Development workspace",
  },
];

export default function MyWorkspaces() {
  return (
    <section className="h-full overflow-hidden rounded-xl border border-[#D9F2E3] bg-white shadow-sm dark:border-[#1E4A38] dark:bg-[#10251D]">
      <div className="flex items-center justify-between gap-3 border-b border-[#D9F2E3] px-5 py-4 dark:border-[#1E4A38]">
        <div>
          <h2 className="text-base font-semibold text-[#17201B] sm:text-lg dark:text-[#ECFDF5]">
            My Workspaces
          </h2>

          <p className="mt-1 text-xs text-[#6B7C73] dark:text-[#789A8A]">
            Your active workspaces
          </p>
        </div>

        <Link
          to="/workspaces"
          className="flex items-center gap-1 text-sm font-semibold text-[#10B981] hover:text-[#059669] dark:text-[#34D399] dark:hover:text-[#6EE7B7]"
        >
          <span className="hidden sm:inline">View all</span>

          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="divide-y divide-[#D9F2E3] dark:divide-[#1E4A38]">
        {workspaces.map((workspace) => (
          <Link
            key={workspace.id}
            to={`/workspaces/${workspace.id}`}
            className="flex items-center gap-3 px-5 py-4 transition hover:bg-[#F0FDF4] dark:hover:bg-[#16382B]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#047857] dark:bg-[#16382B] dark:text-[#6EE7B7]">
              <BriefcaseBusiness size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#17201B] dark:text-[#ECFDF5]">
                {workspace.name}
              </p>

              <p className="mt-1 truncate text-xs text-[#6B7C73] dark:text-[#789A8A]">
                {workspace.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
