import {
    ArrowUpRight,
    Bell,
    Check,
    CheckCircle2,
    Circle,
    FolderKanban,
    LayoutDashboard,
    ListTodo,
    MoreHorizontal,
    Plus,
    Search,
    TrendingUp,
    Users,
} from "lucide-react";

const tasks = [
    {
        title: "Finalize landing page",
        category: "Design",
        completed: true,
    },
    {
        title: "Review project proposal",
        category: "Work",
        completed: false,
    },
    {
        title: "Prepare weekly report",
        category: "Planning",
        completed: false,
    },
];

const CATEGORY_STYLES = {
    Design: { backgroundColor: "var(--primary-soft)", color: "var(--primary)" },
    Work: { backgroundColor: "var(--info-soft)", color: "var(--info)" },
    Planning: { backgroundColor: "var(--warning-soft)", color: "var(--warning)" },
};

const NAV_ITEMS = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard, end: true },
    { name: "Tasks", path: "/dashboard/tasks", icon: ListTodo },
    { name: "Projects", path: "/dashboard/projects", icon: FolderKanban },
    { name: "Members", path: "/dashboard/members", icon: Users },
];

// Static preview: the first item is shown as the active page.
const ACTIVE_PATH = "/dashboard";

const CHART = [38, 58, 45, 78, 60, 88, 72];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DashboardPreview = () => {
    return (
        <>
            {/* Dashboard preview */}
            <div
                id="hero-preview"
                className="hero-dashboard relative z-10 mx-auto mt-14 w-[calc(100%-24px)] max-w-[1050px] sm:mt-16 sm:w-[calc(100%-64px)]"
            >
                <div className="rounded-[1.75rem] border border-[var(--border-strong)] bg-[var(--surface-muted)] p-1.5 sm:p-2">
                    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                        {/* Application toolbar */}
                        <div className="flex h-14 items-center justify-between gap-3 border-b border-[var(--border)] px-4 sm:px-6">
                            <div className="flex shrink-0 items-center gap-2.5">
                                <img
                                    src="/taskflow-logo.svg"
                                    alt=""
                                    aria-hidden="true"
                                    className="h-6 w-6 shrink-0 object-contain"
                                />
                                <span className="text-xs font-extrabold tracking-tight text-[var(--text)] sm:text-sm">
                                    TaskFlow
                                </span>
                            </div>

                            <div className="hidden h-9 w-full max-w-[280px] items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-[11px] text-[var(--text-subtle)] sm:flex">
                                <Search size={13} />
                                Search tasks and projects...
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text-muted)]">
                                    <Bell size={14} />
                                </span>

                                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[10px] font-bold text-[var(--text)]">
                                    TF
                                </div>
                            </div>
                        </div>

                        <div className="grid min-w-0 grid-cols-1 md:grid-cols-[195px_minmax(0,1fr)]">
                            {/* Sidebar */}
                            <aside className="hidden flex-col border-r border-[var(--border)] bg-[var(--background)] p-4 md:flex">
                                <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.16em] text-[var(--text-subtle)]">
                                    WORKSPACE
                                </p>

                                <div className="space-y-1">
                                    {NAV_ITEMS.map(({ name, path, icon: Icon }) => {
                                        const active = path === ACTIVE_PATH;

                                        return (
                                            <div
                                                key={path}
                                                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs ${active
                                                    ? "bg-[var(--primary-soft)] font-bold text-[var(--primary)]"
                                                    : "font-medium text-[var(--text-muted)]"
                                                    }`}
                                            >
                                                <Icon size={15} />
                                                {name}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-auto pt-6">
                                    <div className="flex items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5">
                                        <div
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold"
                                            style={{ backgroundColor: "var(--primary)", color: "#ffffff" }}
                                        >
                                            TF
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-[11px] font-bold text-[var(--text)]">
                                                My workspace
                                            </p>
                                            <p className="mt-0.5 truncate text-[10px] text-[var(--text-subtle)]">
                                                Personal space
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </aside>

                            {/* Main dashboard */}
                            <div className="min-w-0 p-4 sm:p-6">
                                <div className="mb-6 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-subtle)]">
                                            WORKSPACE OVERVIEW
                                        </p>

                                        <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-lg font-extrabold tracking-[-0.03em] text-[var(--text)] sm:text-2xl">
                                            Your dashboard
                                        </h2>

                                        <p className="mt-1 text-[11px] font-normal text-[var(--text-muted)] sm:text-xs">
                                            A little progress goes a long way.
                                        </p>
                                    </div>

                                    <span
                                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-[11px] font-bold"
                                        style={{ backgroundColor: "var(--primary)", color: "#ffffff" }}
                                    >
                                        <Plus size={13} strokeWidth={3} />
                                        New task
                                    </span>
                                </div>

                                {/* Statistics */}
                                <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3.5 sm:p-4">
                                        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold text-[var(--text-muted)] sm:text-xs">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--surface)] text-[var(--text-muted)]">
                                                <ListTodo size={13} />
                                            </span>
                                            Total tasks
                                        </div>

                                        <p className="text-2xl font-extrabold tabular-nums tracking-tight text-[var(--text)]">
                                            12
                                        </p>

                                        <p className="mt-1 text-[10px] font-normal text-[var(--text-subtle)]">
                                            In your workspace
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3.5 sm:p-4">
                                        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold text-[var(--text-muted)] sm:text-xs">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--surface)]">
                                                <CheckCircle2
                                                    size={13}
                                                    className="text-[var(--success)]"
                                                />
                                            </span>
                                            Completed
                                        </div>

                                        <p className="text-2xl font-extrabold tabular-nums tracking-tight text-[var(--text)]">
                                            08
                                        </p>

                                        <p className="mt-1 text-[10px] font-normal text-[var(--text-subtle)]">
                                            Tasks finished
                                        </p>
                                    </div>

                                    <div className="col-span-2 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3.5 sm:p-4 lg:col-span-1">
                                        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold text-[var(--text-muted)] sm:text-xs">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--surface)]">
                                                <TrendingUp
                                                    size={13}
                                                    className="text-[var(--primary)]"
                                                />
                                            </span>
                                            Weekly progress
                                        </div>

                                        <p className="text-2xl font-extrabold tabular-nums tracking-tight text-[var(--text)]">
                                            76%
                                        </p>

                                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                                            <div
                                                className="hero-progress-fill h-full rounded-full"
                                                style={{
                                                    width: "76%",
                                                    backgroundColor: "var(--primary)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Task list and weekly chart */}
                                <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                                    <div className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3.5 sm:p-4">
                                        <div className="mb-3 flex items-center justify-between px-0.5">
                                            <h3 className="text-xs font-bold text-[var(--text)] sm:text-sm">
                                                Today&apos;s tasks
                                            </h3>

                                            <MoreHorizontal
                                                size={16}
                                                className="text-[var(--text-subtle)]"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            {tasks.map((task) => (
                                                <div
                                                    key={task.title}
                                                    className="flex h-12 min-w-0 items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3"
                                                >
                                                    <span
                                                        className="flex h-4 w-4 shrink-0 items-center justify-center"
                                                        style={
                                                            task.completed
                                                                ? undefined
                                                                : { color: "var(--text-subtle)" }
                                                        }
                                                    >
                                                        {task.completed ? (
                                                            <span
                                                                className="flex h-4 w-4 items-center justify-center rounded-full"
                                                                style={{
                                                                    backgroundColor: "var(--primary)",
                                                                    color: "#ffffff",
                                                                }}
                                                            >
                                                                <Check size={10} strokeWidth={3.5} />
                                                            </span>
                                                        ) : (
                                                            <Circle size={14} />
                                                        )}
                                                    </span>

                                                    <span
                                                        className={`min-w-0 flex-1 truncate text-[11px] font-semibold sm:text-xs ${task.completed
                                                            ? "text-[var(--text-muted)] line-through"
                                                            : "text-[var(--text)]"
                                                            }`}
                                                    >
                                                        {task.title}
                                                    </span>

                                                    <span
                                                        className="hidden shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:inline-flex"
                                                        style={CATEGORY_STYLES[task.category]}
                                                    >
                                                        {task.category}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Weekly productivity chart */}
                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3.5 sm:p-4">
                                        <div className="mb-4 flex items-center justify-between gap-2 px-0.5">
                                            <h3 className="text-xs font-bold text-[var(--text)] sm:text-sm">
                                                Focus this week
                                            </h3>

                                            <ArrowUpRight
                                                size={15}
                                                className="text-[var(--primary)]"
                                            />
                                        </div>

                                        <div className="flex h-[105px] items-end justify-around gap-2 px-1">
                                            {CHART.map((height, index) => (
                                                <div
                                                    key={index}
                                                    className="w-full max-w-6 rounded-md"
                                                    style={{
                                                        height: `${height}%`,
                                                        backgroundColor:
                                                            index === 5
                                                                ? "var(--primary)"
                                                                : "var(--border-strong)",
                                                    }}
                                                />
                                            ))}
                                        </div>

                                        <div className="mt-3 flex justify-between px-1 text-[10px] font-medium text-[var(--text-subtle)]">
                                            {DAYS.map((day) => (
                                                <span key={day}>{day}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom divider */}
            <div
                className="relative z-10 mx-auto mt-8 h-px max-w-7xl sm:mt-12"
                style={{
                    background:
                        "linear-gradient(to right, transparent, var(--border), transparent)",
                }}
            />
        </>
    )
}

export default DashboardPreview