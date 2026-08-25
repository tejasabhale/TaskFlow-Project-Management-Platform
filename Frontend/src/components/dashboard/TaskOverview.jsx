import { AlertCircle, CheckCircle2, Clock3, ListTodo } from "lucide-react";

const taskStats = [
  {
    label: "Completed",
    value: 24,
    total: 48,
    icon: CheckCircle2,
    className: "text-[#047857] dark:text-[#6EE7B7]",
  },
  {
    label: "In Progress",
    value: 16,
    total: 48,
    icon: Clock3,
    className: "text-amber-600 dark:text-amber-400",
  },
  {
    label: "Pending",
    value: 6,
    total: 48,
    icon: ListTodo,
    className: "text-blue-600 dark:text-blue-400",
  },
  {
    label: "Overdue",
    value: 2,
    total: 48,
    icon: AlertCircle,
    className: "text-red-500 dark:text-red-400",
  },
];

export default function TaskOverview() {
  return (
    <section className="overflow-hidden rounded-xl border border-[#D9F2E3] bg-white shadow-sm dark:border-[#1E4A38] dark:bg-[#10251D]">
      <div className="border-b border-[#D9F2E3] px-5 py-4 dark:border-[#1E4A38]">
        <h2 className="text-base font-semibold text-[#17201B] sm:text-lg dark:text-[#ECFDF5]">
          Task Overview
        </h2>

        <p className="mt-1 text-xs text-[#6B7C73] dark:text-[#789A8A]">
          Current task distribution
        </p>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-2">
        {taskStats.map((item) => {
          const Icon = item.icon;
          const percentage = Math.round((item.value / item.total) * 100);

          return (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Icon size={17} className={item.className} />

                  <span className="text-sm font-medium text-[#52635A] dark:text-[#A7C4B5]">
                    {item.label}
                  </span>
                </div>

                <span className="text-sm font-semibold text-[#17201B] dark:text-[#ECFDF5]">
                  {item.value}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#ECFDF5] dark:bg-[#16382B]">
                <div
                  className="h-full rounded-full bg-[#10B981] transition-all dark:bg-[#34D399]"
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
