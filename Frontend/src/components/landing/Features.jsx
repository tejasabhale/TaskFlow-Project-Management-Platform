import {
  CheckSquare,
  FolderKanban,
  Users,
  BarChart3,
  Bell,
  LayoutDashboard,
} from "lucide-react";

const features = [
  {
    icon: CheckSquare,
    title: "Task Management",
    description:
      "Create, organize, prioritize, and track tasks so nothing important gets missed.",
  },
  {
    icon: FolderKanban,
    title: "Project Organization",
    description:
      "Keep related tasks together and manage multiple projects from one organized workspace.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Work together with your team, assign responsibilities, and keep everyone aligned.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Monitor project progress and understand what has been completed and what still needs attention.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Stay informed about important updates, assignments, deadlines, and activity.",
  },
  {
    icon: LayoutDashboard,
    title: "Centralized Dashboard",
    description:
      "Get a clear overview of your work, projects, tasks, and productivity in one place.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="bg-white py-20 sm:py-24 dark:bg-[#0B1C15]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-2 text-sm font-semibold text-[#047857] dark:border-[#2D5A47] dark:bg-[#16382B] dark:text-[#6EE7B7]">
            Powerful Features
          </span>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#17201B] sm:text-4xl lg:text-5xl dark:text-[#ECFDF5]">
            Everything you need to
            <span className="text-[#10B981] dark:text-[#34D399]">
              {" "}
              stay productive
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-[#52635A] sm:text-lg dark:text-[#A7C4B5]">
            TaskFlow brings your tasks, projects, team, and progress together in
            one simple and organized workspace.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group rounded-2xl border border-[#D9F2E3] bg-[#F8FFFA] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#A7F3D0] hover:shadow-lg dark:border-[#1E4A38] dark:bg-[#10251D] dark:hover:border-[#2D5A47]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#10B981] transition duration-300 group-hover:bg-[#10B981] group-hover:text-white dark:bg-[#16382B] dark:text-[#34D399] dark:group-hover:bg-[#34D399] dark:group-hover:text-[#07130F]">
                  <Icon size={23} strokeWidth={2} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#17201B] dark:text-[#ECFDF5]">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#64756C] dark:text-[#A7C4B5]">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
