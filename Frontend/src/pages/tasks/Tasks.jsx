import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getMyTasks } from "../../services/task.service";

const Tasks = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getMyTasks();
        const taskList = response.data || [];

        setTasks(Array.isArray(taskList) ? taskList : []);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setError("Failed to load tasks. Please try again.");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    const statusMap = {
      "To Do": "toDo",
      "In Progress": "inProgress",
      Completed: "completed",
    };

    return tasks.filter((task) => {
      const matchesFilter =
        activeFilter === "All" || task.status === statusMap[activeFilter];

      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query ||
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.project?.name?.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [tasks, activeFilter, searchQuery]);

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (char) => char.toUpperCase());
  };

  const formatPriority = (priority) => {
    if (!priority) return "Unknown";

    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return "No due date";

    const date = new Date(dueDate);

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filters = ["All", "To Do", "In Progress", "Completed"];

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

        <button
          onClick={() => navigate("/tasks/new")}
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <FiPlus size={17} />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Filters */}
        <div className="flex gap-2 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm ${
                activeFilter === filter
                  ? "bg-black text-white"
                  : "border bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <FiSearch
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-400"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-xl border bg-white py-12 text-center text-sm text-gray-500">
          Loading tasks...
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-12">
          <p className="text-sm text-red-500">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm font-medium text-gray-900 underline hover:text-gray-600"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-12">
          <p className="text-sm text-gray-500">
            {searchQuery
              ? "No tasks match your search."
              : activeFilter === "All"
                ? "No tasks assigned to you."
                : `No ${activeFilter.toLowerCase()} tasks found.`}
          </p>

          {!searchQuery && activeFilter === "All" && (
            <button
              onClick={() => navigate("/tasks/new")}
              className="mt-4 flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <FiPlus size={16} />
              Create Task
            </button>
          )}
        </div>
      )}

      {/* Tasks */}
      {!loading && !error && filteredTasks.length > 0 && (
        <div className="overflow-hidden rounded-xl border bg-white">
          {filteredTasks.map((task, index) => (
            <button
              key={task._id}
              onClick={() => navigate(`/tasks/${task._id}`)}
              className={`flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-gray-50 ${
                index !== filteredTasks.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
            >
              {/* Task Info */}
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-5 w-5 shrink-0 rounded-full border border-gray-300" />

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-medium text-gray-900">
                    {task.title}
                  </h3>

                  <p className="mt-1 truncate text-xs text-gray-500">
                    {task.project?.name || "No project"}
                  </p>
                </div>
              </div>

              {/* Task Meta */}
              <div className="flex shrink-0 items-center gap-4">
                {/* Priority */}
                <span className="hidden rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 md:inline-block">
                  {formatPriority(task.priority)}
                </span>

                {/* Due Date */}
                <span className="hidden text-xs text-gray-500 sm:inline-block">
                  {formatDueDate(task.dueDate)}
                </span>

                {/* Status */}
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                  {formatStatus(task.status)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;
