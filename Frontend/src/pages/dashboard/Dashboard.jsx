import {
  FiArrowUpRight,
  FiCheckCircle,
  FiClock,
  FiFolder,
  FiMoreHorizontal,
  FiPlus,
  FiUsers,
} from "react-icons/fi";

const Dashboard = () => {
  const stats = [
    {
      label: "My Tasks",
      value: "24",
      description: "8 due this week",
      icon: FiCheckCircle,
    },
    {
      label: "Due Today",
      value: "5",
      description: "2 high priority",
      icon: FiClock,
    },
    {
      label: "Projects",
      value: "12",
      description: "7 active projects",
      icon: FiFolder,
    },
    {
      label: "Team Members",
      value: "8",
      description: "6 currently active",
      icon: FiUsers,
    },
  ];

  const tasks = [
    {
      title: "Design landing page",
      project: "Website Redesign",
      priority: "High",
      due: "Today",
    },
    {
      title: "Complete authentication API",
      project: "TaskFlow",
      priority: "High",
      due: "Today",
    },
    {
      title: "Create dashboard UI",
      project: "TaskFlow",
      priority: "Medium",
      due: "Tomorrow",
    },
    {
      title: "Write project documentation",
      project: "Website Redesign",
      priority: "Low",
      due: "Sep 3",
    },
  ];

  const projects = [
    {
      name: "Website Redesign",
      tasks: 18,
      progress: 75,
    },
    {
      name: "TaskFlow",
      tasks: 32,
      progress: 55,
    },
    {
      name: "Mobile Application",
      tasks: 21,
      progress: 35,
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Good morning, Tejas 👋
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Here's what needs your attention today.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
          <FiPlus size={17} />
          New Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>

                  <h2 className="mt-2 text-3xl font-semibold text-gray-900">
                    {stat.value}
                  </h2>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <Icon size={18} />
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Tasks + Upcoming */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Tasks */}
        <div className="rounded-xl border border-gray-200 bg-white xl:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-200 p-5">
            <div>
              <h2 className="font-semibold text-gray-900">My Tasks</h2>

              <p className="mt-1 text-xs text-gray-500">
                Tasks that need your attention
              </p>
            </div>

            <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
              View all
              <FiArrowUpRight size={15} />
            </button>
          </div>

          {tasks.map((task, index) => (
            <div
              key={task.title}
              className={`flex items-center justify-between gap-4 p-5 ${
                index !== tasks.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <button className="h-5 w-5 shrink-0 rounded-full border border-gray-300" />

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-medium text-gray-900">
                    {task.title}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">{task.project}</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-4">
                <span className="hidden rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 sm:inline-block">
                  {task.priority}
                </span>

                <span className="text-xs text-gray-500">{task.due}</span>

                <FiMoreHorizontal size={18} className="text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900">Upcoming</h2>

            <p className="mt-1 text-xs text-gray-500">Upcoming deadlines</p>
          </div>

          {[
            ["SEP 02", "Website Redesign", "Landing page"],
            ["SEP 04", "TaskFlow Backend", "API integration"],
            ["SEP 06", "Mobile Application", "Authentication"],
          ].map(([date, title, description]) => (
            <div
              key={title}
              className="border-b border-gray-100 p-5 last:border-0"
            >
              <p className="text-xs font-medium text-gray-400">{date}</p>

              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {title}
              </h3>

              <p className="mt-1 text-xs text-gray-500">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <div>
            <h2 className="font-semibold text-gray-900">Projects</h2>

            <p className="mt-1 text-xs text-gray-500">
              Overview of active projects
            </p>
          </div>

          <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
            View all
            <FiArrowUpRight size={15} />
          </button>
        </div>

        <div className="grid grid-cols-1 divide-y divide-gray-100 md:grid-cols-3 md:divide-x md:divide-y-0">
          {projects.map((project) => (
            <div key={project.name} className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  {project.name}
                </h3>

                <span className="text-xs text-gray-500">
                  {project.tasks} tasks
                </span>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between">
                  <span className="text-xs text-gray-500">Progress</span>

                  <span className="text-xs font-medium">
                    {project.progress}%
                  </span>
                </div>

                <div className="h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-gray-900"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
