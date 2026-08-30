import { FiCheck, FiTrash2 } from "react-icons/fi";

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      message: "Rahul assigned you a task.",
      time: "5 minutes ago",
      unread: true,
    },
    {
      id: 2,
      message: "Priya commented on your task.",
      time: "20 minutes ago",
      unread: true,
    },
    {
      id: 3,
      message: "Project deadline was updated.",
      time: "1 hour ago",
      unread: false,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Stay updated with your workspace activity.
          </p>
        </div>

        <button className="text-sm font-medium text-gray-600 hover:text-gray-900">
          Mark all as read
        </button>
      </div>

      <div className="max-w-3xl overflow-hidden rounded-xl border bg-white">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-center gap-4 border-b p-5 last:border-0"
          >
            <div
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                notification.unread ? "bg-blue-500" : "bg-gray-200"
              }`}
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-800">{notification.message}</p>

              <p className="mt-1 text-xs text-gray-400">{notification.time}</p>
            </div>

            <button
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              title="Mark as read"
            >
              <FiCheck size={16} />
            </button>

            <button
              className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
              title="Delete"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
