import React from 'react'
import {
    ArrowUpRight,
    Bell,
    CalendarDays,
    Check,
    CheckCircle2,
    CheckSquare,
    Circle,
    FolderKanban,
    LayoutDashboard,
    ListTodo,
    MoreHorizontal,
    Plus,
    Search,
    TrendingUp,
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

const primaryButtonStyle = {
    backgroundColor: "var(--primary)",
    color: "var(--text-inverse)",
};

const DashboardPreview = () => {
    return (
        <>
            {/* Dashboard preview */}
            <div
                id="hero-preview"
                className="hero-dashboard relative z-10 mx-auto mt-14 w-[calc(100%-24px)] max-w-[1050px] sm:mt-16 sm:w-[calc(100%-64px)]"
            >
                <div className="border border-[var(--border-strong)] bg-[var(--surface-muted)] p-1 sm:p-1.5">
                    <div className="overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
                        {/* Application toolbar */}
                        <div className="flex h-14 items-center justify-between gap-3 border-b border-[var(--border)] px-4 sm:px-6">
                            <div className="flex shrink-0 items-center gap-2">
                                <CheckSquare
                                    size={18}
                                    className="text-[var(--primary)]"
                                />
                                <span className="text-xs font-bold tracking-tight text-[var(--text)] sm:text-sm">
                                    TaskFlow
                                </span>
                            </div>

                            <div className="hidden h-8 w-full max-w-[270px] items-center gap-2 border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-[10px] text-[var(--text-subtle)] sm:flex">
                                <Search size={13} />
                                Search tasks and projects...
                            </div>

                            <div className="flex items-center gap-3">
                                <Bell
                                    size={16}
                                    className="text-[var(--text-muted)]"
                                />

                                <div className="flex h-7 w-7 items-center justify-center border border-[var(--border)] bg-[var(--surface-muted)] text-[9px] font-bold text-[var(--text)]">
                                    TF
                                </div>
                            </div>
                        </div>

                        <div className="grid min-w-0 grid-cols-1 md:grid-cols-[185px_minmax(0,1fr)]">
                            {/* Sidebar */}
                            <aside className="hidden flex-col border-r border-[var(--border)] bg-[var(--surface-muted)] p-4 md:flex">
                                <p className="mb-4 px-2 text-[9px] font-bold tracking-[0.17em] text-[var(--text-subtle)]">
                                    WORKSPACE
                                </p>

                                <div className="mb-1 flex items-center gap-2 border-l-2 border-[var(--primary)] bg-[var(--primary-soft)] px-3 py-2.5 text-xs font-semibold text-[var(--primary)]">
                                    <LayoutDashboard size={15} />
                                    Overview
                                </div>

                                <div className="mb-1 flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-[var(--text-muted)]">
                                    <ListTodo size={15} />
                                    My tasks
                                    <span className="ml-auto text-[10px] text-[var(--text-subtle)]">
                                        4
                                    </span>
                                </div>

                                <div className="mb-1 flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-[var(--text-muted)]">
                                    <FolderKanban size={15} />
                                    Projects
                                </div>

                                <div className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-[var(--text-muted)]">
                                    <CalendarDays size={15} />
                                    Calendar
                                </div>

                                <div className="mt-auto border-t border-[var(--border)] pt-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center border border-[var(--border)] bg-[var(--primary-soft)] text-[10px] font-bold text-[var(--primary)]">
                                            TF
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-semibold text-[var(--text)]">
                                                My workspace
                                            </p>
                                            <p className="mt-0.5 text-[9px] text-[var(--text-subtle)]">
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
                                        <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--text-subtle)]">
                                            WORKSPACE OVERVIEW
                                        </p>

                                        <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-lg font-bold tracking-tight text-[var(--text)] sm:text-xl">
                                            Your dashboard
                                        </h2>

                                        <p className="mt-1 text-[10px] font-normal text-[var(--text-muted)] sm:text-xs">
                                            A little progress goes a long way.
                                        </p>
                                    </div>

                                    <span
                                        className="inline-flex h-8 shrink-0 items-center gap-1.5 px-3 text-[10px] font-semibold"
                                        style={primaryButtonStyle}
                                    >
                                        <Plus size={13} />
                                        New task
                                    </span>
                                </div>

                                {/* Statistics */}
                                <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
                                    <div className="border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4">
                                        <div className="mb-3 flex items-center gap-2 text-[10px] font-medium text-[var(--text-muted)] sm:text-xs">
                                            <ListTodo size={14} />
                                            Total tasks
                                        </div>

                                        <p className="text-2xl font-bold tracking-tight text-[var(--text)]">
                                            12
                                        </p>

                                        <p className="mt-1 text-[9px] font-normal text-[var(--text-subtle)]">
                                            In your workspace
                                        </p>
                                    </div>

                                    <div className="border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4">
                                        <div className="mb-3 flex items-center gap-2 text-[10px] font-medium text-[var(--text-muted)] sm:text-xs">
                                            <CheckCircle2
                                                size={14}
                                                className="text-[var(--success)]"
                                            />
                                            Completed
                                        </div>

                                        <p className="text-2xl font-bold tracking-tight text-[var(--text)]">
                                            08
                                        </p>

                                        <p className="mt-1 text-[9px] font-normal text-[var(--text-subtle)]">
                                            Tasks finished
                                        </p>
                                    </div>

                                    <div className="col-span-2 border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4 lg:col-span-1">
                                        <div className="mb-3 flex items-center gap-2 text-[10px] font-medium text-[var(--text-muted)] sm:text-xs">
                                            <TrendingUp
                                                size={14}
                                                className="text-[var(--primary)]"
                                            />
                                            Weekly progress
                                        </div>

                                        <p className="text-2xl font-bold tracking-tight text-[var(--text)]">
                                            76%
                                        </p>

                                        <div className="mt-3 h-1 overflow-hidden bg-[var(--surface-muted)]">
                                            <div
                                                className="hero-progress-fill h-full"
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
                                    <div className="min-w-0 border border-[var(--border)] bg-[var(--surface)] p-4">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="text-xs font-bold text-[var(--text)] sm:text-sm">
                                                Today&apos;s tasks
                                            </h3>

                                            <MoreHorizontal
                                                size={16}
                                                className="text-[var(--text-subtle)]"
                                            />
                                        </div>

                                        <div className="divide-y divide-[var(--border)]">
                                            {tasks.map((task) => (
                                                <div
                                                    key={task.title}
                                                    className="flex min-w-0 items-center gap-2.5 py-3"
                                                >
                                                    <span
                                                        className="flex h-4 w-4 shrink-0 items-center justify-center"
                                                        style={{
                                                            color: task.completed
                                                                ? "var(--success)"
                                                                : "var(--text-subtle)",
                                                        }}
                                                    >
                                                        {task.completed ? (
                                                            <Check size={12} />
                                                        ) : (
                                                            <Circle size={14} />
                                                        )}
                                                    </span>

                                                    <span
                                                        className={`min-w-0 flex-1 truncate text-[10px] font-medium sm:text-xs ${task.completed
                                                            ? "text-[var(--text-subtle)] line-through"
                                                            : "text-[var(--text)]"
                                                            }`}
                                                    >
                                                        {task.title}
                                                    </span>

                                                    <span
                                                        className="hidden shrink-0 px-2 py-1 text-[9px] font-semibold sm:inline-flex"
                                                        style={{
                                                            backgroundColor:
                                                                task.category === "Design"
                                                                    ? "var(--primary-soft)"
                                                                    : task.category === "Work"
                                                                        ? "var(--info-soft)"
                                                                        : "var(--warning-soft)",
                                                            color:
                                                                task.category === "Design"
                                                                    ? "var(--primary)"
                                                                    : task.category === "Work"
                                                                        ? "var(--info)"
                                                                        : "var(--warning)",
                                                        }}
                                                    >
                                                        {task.category}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Weekly productivity chart */}
                                    <div className="border border-[var(--border)] bg-[var(--surface)] p-4">
                                        <div className="mb-5 flex items-center justify-between gap-2">
                                            <h3 className="text-xs font-bold text-[var(--text)] sm:text-sm">
                                                Focus this week
                                            </h3>

                                            <ArrowUpRight
                                                size={15}
                                                className="text-[var(--primary)]"
                                            />
                                        </div>

                                        <div className="flex h-[105px] items-end justify-around gap-2 border-b border-[var(--border)] px-1">
                                            {[38, 58, 45, 78, 60, 88, 72].map((height, index) => (
                                                <div
                                                    key={index}
                                                    className="w-full max-w-6"
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

                                        <div className="mt-3 flex justify-between text-[9px] font-medium text-[var(--text-subtle)]">
                                            <span>Mon</span>
                                            <span>Tue</span>
                                            <span>Wed</span>
                                            <span>Thu</span>
                                            <span>Fri</span>
                                            <span>Sat</span>
                                            <span>Sun</span>
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