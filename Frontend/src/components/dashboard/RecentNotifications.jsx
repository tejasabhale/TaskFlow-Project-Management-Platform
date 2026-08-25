import {
  ArrowRight,
  Bell,
  CheckCircle2,
  MessageSquare,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";

const notifications = [
  {
    id: 1,
    type: "task",
    title: "Task assigned to you",
    description: "You were assigned a new task in TaskFlow.",
    time: "10 min ago",
  },
  {
    id: 2,
    type: "comment",
    title: "New comment",
    description: "A teammate commented on your task.",
    time: "1 hour ago",
  },
  {
    id: 3,
    type: "project",
    title: "Project updated",
    description: "TaskFlow Website project was updated.",
    time: "3 hours ago",
  },
  {
    id: 4,
    type: "member",
    title: "New workspace member",
    description: "A new member joined your workspace.",
    time: "Yesterday",
  },
];

const notificationConfig = {
  task: {
    icon: CheckCircle2,
    className:
      "bg-[#ECFDF5] text-[#047857] dark:bg-[#16382B] dark:text-[#6EE7B7]",
  },
  comment: {
    icon: MessageSquare,
    className:
      "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400",
  },
  project: {
    icon: Bell,
    className:
      "bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400",
  },
  member: {
    icon: UserPlus,
    className:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400",
  },
};

export default function RecentNotifications() {
  return (
    <section className="overflow-hidden rounded-xl border border-[#D9F2E3] bg-white shadow-sm dark:border-[#1E4A38] dark:bg-[#10251D]">
      <div className="flex items-center justify-between gap-3 border-b border-[#D9F2E3] px-5 py-4 dark:border-[#1E4A38]">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[#17201B] sm:text-lg dark:text-[#ECFDF5]">
            Recent Notifications
          </h2>

          <p className="mt-1 text-xs text-[#6B7C73] dark:text-[#789A8A]">
            Latest activity from your workspace
          </p>
        </div>

        <Link
          to="/notifications"
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[#10B981] transition hover:text-[#059669] dark:text-[#34D399] dark:hover:text-[#6EE7B7]"
        >
          <span className="hidden sm:inline">View all</span>

          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="divide-y divide-[#D9F2E3] dark:divide-[#1E4A38]">
        {notifications.map((notification) => {
          const config = notificationConfig[notification.type];

          const Icon = config.icon;

          return (
            <Link
              key={notification.id}
              to="/notifications"
              className="flex items-start gap-3 px-5 py-4 transition hover:bg-[#F0FDF4] dark:hover:bg-[#16382B]"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.className}`}
              >
                <Icon size={17} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="truncate text-sm font-medium text-[#17201B] dark:text-[#ECFDF5]">
                    {notification.title}
                  </p>

                  <span className="shrink-0 text-[11px] text-[#789A8A]">
                    {notification.time}
                  </span>
                </div>

                <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#6B7C73] dark:text-[#789A8A]">
                  {notification.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
