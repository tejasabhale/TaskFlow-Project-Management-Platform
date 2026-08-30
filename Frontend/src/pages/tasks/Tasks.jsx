import { FiPlus, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Tasks = () => {
  const navigate = useNavigate();

  const tasks = [
    {
      id: "1",
      title: "Design landing page",
      project: "Website Redesign",
      priority: "High",
      status: "In Progress",
      due: "Today",
    },
    {
      id: "2",
      title: "Complete authentication API",
      project: "TaskFlow",
      priority: "High",
      status: "To Do",
      due: "Today",
    },
    {
      id: "3",
      title: "Create dashboard UI",
      project: "TaskFlow",
      priority: "Medium",
      status: "In Progress",
      due: "Tomorrow",
    },
    {
      id: "4",
      title: "Write documentation",
      project: "Website Redesign",
      priority: "Low",
      status: "Completed",
      due: "Sep 3",
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Tasks</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage the tasks assigned to you.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white">
          <FiPlus size={17} />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {["All", "To Do", "In Progress", "Completed"].map((filter, index) => (
            <button
              key={filter}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm ${
                index === 0
                  ? "bg-black text-white"
                  : "border bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <FiSearch
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            placeholder="Search tasks..."
            className="w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm outline-none"
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="overflow-hidden rounded-xl border bg-white">
        {tasks.map((task, index) => (
          <button
            key={task.id}
            onClick={() => navigate(`/tasks/${task.id}`)}
            className={`flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-gray-50 ${
              index !== tasks.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-5 w-5 shrink-0 rounded-full border border-gray-300" />

              <div className="min-w-0">
                <h3 className="truncate text-sm font-medium text-gray-900">
                  {task.title}
                </h3>

                <p className="mt-1 text-xs text-gray-500">{task.project}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <span className="hidden rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 md:inline-block">
                {task.priority}
              </span>

              <span className="hidden text-xs text-gray-500 sm:inline-block">
                {task.due}
              </span>

              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                {task.status}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
