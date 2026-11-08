import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/* -------------------------------------------------------------------------- */
/* Data                                                                       */
/* -------------------------------------------------------------------------- */

const INITIAL_TASKS = [
    { id: "landing", title: "Finalize landing page", category: "Design", completed: true },
    { id: "proposal", title: "Review project proposal", category: "Work", completed: false },
    { id: "report", title: "Prepare weekly report", category: "Planning", completed: false },
];

// The task the simulated user "types" in.
const NEW_TASK = { id: "invoice", title: "Send client invoice", category: "Work", completed: false };

const BASE = { total: 12, done: 9 };

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
const HIGHLIGHT = 5; // the bar that grows as tasks get completed

const pad2 = (n) => String(Math.round(n)).padStart(2, "0");
const percent = (done, total) => Math.round((done / total) * 100);

const EASE_MOVE = [0.45, 0, 0.2, 1];

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Animated dashboard preview. A fake cursor "uses" the app on a loop:
 *   1. clicks New task and types a title
 *   2. ticks off two tasks
 * while the stats, progress bar, chart and notifications react.
 *
 * - GSAP: scroll-triggered intro, number counters, progress bar, chart bars
 * - Framer Motion: cursor, list animations, toast, press feedback
 * - The loop pauses while the preview is off screen; reduced motion shows a still preview.
 */
const DashboardPreview = () => {
    const reduce = usePrefersReducedMotion();

    // what React renders
    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const [typingId, setTypingId] = useState(null);
    const [toast, setToast] = useState(null);
    const [notified, setNotified] = useState(false);
    const [pressed, setPressed] = useState(false);

    // DOM handles
    const rootRef = useRef(null);
    const windowRef = useRef(null);
    const newBtnRef = useRef(null);
    const checkRefs = useRef({});
    const totalRef = useRef(null);
    const doneRef = useRef(null);
    const pctRef = useRef(null);
    const fillRef = useRef(null);
    const barRefs = useRef([]);

    // simulation bookkeeping (kept out of React state on purpose: no re-render per frame)
    const shown = useRef({ total: BASE.total, done: BASE.done, pct: percent(BASE.done, BASE.total) });
    const counterTweens = useRef({});
    const visible = useRef(true);
    const intro = useRef(null);
    if (!intro.current) {
        let resolve;
        const promise = new Promise((r) => {
            resolve = r;
        });
        intro.current = { promise, resolve };
    }

    // fake cursor
    const cx = useMotionValue(0);
    const cy = useMotionValue(0);
    const cursorOpacity = useMotionValue(0);
    const cursorScale = useMotionValue(1);
    const rippleScale = useMotionValue(0.4);
    const rippleOpacity = useMotionValue(0);

    /* -------- gsap number + progress helpers (write straight to the DOM) -------- */

    const tweenCounter = (key, el, to, format, duration = 0.8) => {
        if (!el) return;
        counterTweens.current[key]?.kill();
        const proxy = { v: shown.current[key] };
        counterTweens.current[key] = gsap.to(proxy, {
            v: to,
            duration,
            ease: "power2.out",
            onUpdate: () => {
                shown.current[key] = proxy.v;
                el.textContent = format(proxy.v);
            },
        });
    };

    const updateStats = (done, total, duration = 0.8) => {
        const pct = percent(done, total);
        tweenCounter("total", totalRef.current, total, pad2, duration);
        tweenCounter("done", doneRef.current, done, pad2, duration);
        tweenCounter("pct", pctRef.current, pct, (v) => `${Math.round(v)}%`, duration);
        gsap.to(fillRef.current, { width: `${pct}%`, duration, ease: "power2.out", overwrite: true });
    };

    /* ----------------------------- gsap intro ----------------------------- */

    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return undefined;

        if (reduce) {
            intro.current.resolve();
            return undefined;
        }

        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray("[data-sim-card]");
            const bars = barRefs.current.filter(Boolean);

            // start hidden / at zero
            gsap.set(windowRef.current, { autoAlpha: 0, y: 48 });
            gsap.set(cards, { autoAlpha: 0, y: 18 });
            gsap.set(bars, { scaleY: 0, transformOrigin: "bottom" });
            gsap.set(fillRef.current, { width: "0%" });
            shown.current = { total: 0, done: 0, pct: 0 };
            [totalRef, doneRef].forEach((ref) => {
                if (ref.current) ref.current.textContent = "00";
            });
            if (pctRef.current) pctRef.current.textContent = "0%";

            const tl = gsap.timeline({
                paused: true,
                defaults: { ease: "power3.out" },
                onComplete: () => intro.current.resolve(),
            });

            tl.to(windowRef.current, { autoAlpha: 1, y: 0, duration: 0.9, clearProps: "all" })
                .to(cards, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08, clearProps: "all" }, "-=0.45")
                .add(() => updateStats(BASE.done, BASE.total, 1.1), "-=0.5")
                .to(bars, { scaleY: 1, duration: 0.7, stagger: 0.05 }, "-=0.9");

            ScrollTrigger.create({
                trigger: root,
                start: "top 85%",
                once: true,
                onEnter: () => tl.play(),
            });

            // pause the simulation whenever the preview scrolls out of view
            ScrollTrigger.create({
                trigger: root,
                start: "top bottom",
                end: "bottom top",
                onToggle: (self) => {
                    visible.current = self.isActive;
                },
            });
        }, root);

        return () => ctx.revert();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reduce]);

    /* ------------------------------ simulation ------------------------------ */

    useEffect(() => {
        if (reduce) return undefined;

        let cancelled = false;
        const CANCEL = Symbol("cancel");

        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        // wait, then hold here while the preview is off screen
        const guard = async (ms = 0) => {
            if (ms) await sleep(ms);
            while (!visible.current && !cancelled) await sleep(250);
            if (cancelled) throw CANCEL;
        };

        const tween = (value, to, options) =>
            new Promise((resolve) => {
                animate(value, to, { ...options, onComplete: resolve });
            });

        // glide the cursor to an element (positions are measured each time, so it stays correct at any screen size)
        const moveTo = async (el, ax = 0.5, ay = 0.55) => {
            const win = windowRef.current;
            if (!el || !win) return;

            const w = win.getBoundingClientRect();
            const r = el.getBoundingClientRect();
            if (!r.width) return;

            const tx = r.left - w.left + r.width * ax;
            const ty = r.top - w.top + r.height * ay;
            const distance = Math.hypot(tx - cx.get(), ty - cy.get());
            const duration = Math.min(1.1, 0.45 + distance / 1000);

            await Promise.all([
                tween(cx, tx, { duration, ease: EASE_MOVE }),
                tween(cy, ty, { duration, ease: EASE_MOVE }),
            ]);
        };

        const click = async () => {
            rippleScale.set(0.4);
            rippleOpacity.set(0.45);
            tween(rippleScale, 2.2, { duration: 0.5, ease: "easeOut" });
            tween(rippleOpacity, 0, { duration: 0.5 });
            await tween(cursorScale, 0.8, { duration: 0.1 });
            await tween(cursorScale, 1, { duration: 0.14 });
        };

        const complete = (id, title) => {
            setTasks((current) => current.map((t) => (t.id === id ? { ...t, completed: true } : t)));
            setNotified(true);
            setToast(`${title} completed`);
            setTimeout(() => setToast(null), 1900);
        };

        const bumpBar = (completedCount) => {
            gsap.to(barRefs.current[HIGHLIGHT], {
                height: `${Math.min(100, CHART[HIGHLIGHT] + completedCount * 5)}%`,
                duration: 0.7,
                ease: "power3.out",
            });
        };

        const resetAll = () => {
            setTasks(INITIAL_TASKS);
            setTypingId(null);
            setToast(null);
            setNotified(false);
            updateStats(BASE.done, BASE.total, 0.9);
            gsap.to(barRefs.current[HIGHLIGHT], {
                height: `${CHART[HIGHLIGHT]}%`,
                duration: 0.9,
                ease: "power3.out",
            });
        };

        const cycle = async () => {
            let { done, total } = BASE;

            // cursor starts low and to the right, fades in
            const w = windowRef.current.getBoundingClientRect();
            cx.set(w.width * 0.7);
            cy.set(w.height * 0.78);
            await tween(cursorOpacity, 1, { duration: 0.3 });
            await guard(500);

            // 1. New task
            await moveTo(newBtnRef.current, 0.5, 0.5);
            await guard(150);
            setPressed(true);
            await click();
            setPressed(false);

            setTasks((current) => [{ ...NEW_TASK, title: "" }, ...current]);
            setTypingId(NEW_TASK.id);
            total += 1;
            updateStats(done, total);

            // type the title letter by letter
            for (let i = 1; i <= NEW_TASK.title.length; i += 1) {
                await guard(i === 1 ? 350 : 55);
                setTasks((current) =>
                    current.map((t) =>
                        t.id === NEW_TASK.id ? { ...t, title: NEW_TASK.title.slice(0, i) } : t
                    )
                );
            }
            setTypingId(null);
            await guard(800);

            // 2. complete "Review project proposal"
            await moveTo(checkRefs.current.proposal, 0.5, 0.5);
            await guard(150);
            await click();
            complete("proposal", "Review project proposal");
            done += 1;
            updateStats(done, total);
            bumpBar(1);
            await guard(1000);

            // 3. complete "Prepare weekly report"
            await moveTo(checkRefs.current.report, 0.5, 0.5);
            await guard(150);
            await click();
            complete("report", "Prepare weekly report");
            done += 1;
            updateStats(done, total);
            bumpBar(2);
            await guard(900);

            // cursor drifts away and fades out
            await Promise.all([
                tween(cx, w.width * 0.78, { duration: 0.9, ease: EASE_MOVE }),
                tween(cy, w.height * 0.85, { duration: 0.9, ease: EASE_MOVE }),
                tween(cursorOpacity, 0, { duration: 0.6 }),
            ]);

            // hold the finished state, then reset and go again
            await guard(2600);
            resetAll();
            await guard(1400);
        };

        (async () => {
            try {
                await intro.current.promise;
                await guard(600);
                while (!cancelled) await cycle();
            } catch (error) {
                if (error !== CANCEL) console.error(error);
            }
        })();

        return () => {
            cancelled = true;
            Object.values(counterTweens.current).forEach((t) => t?.kill());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reduce]);

    /* -------------------------------- render -------------------------------- */

    return (
        <>
            {/* Dashboard preview */}
            <div
                ref={rootRef}
                id="hero-preview"
                role="img"
                aria-label="Animated preview of the TaskFlow dashboard: a task is added and two tasks are completed"
                className="hero-dashboard relative z-10 mx-auto mt-14 w-[calc(100%-24px)] max-w-[1050px] sm:mt-16 sm:w-[calc(100%-64px)]"
            >
                <div className="rounded-[1.75rem] border border-[var(--border-strong)] bg-[var(--surface-muted)] p-1.5 sm:p-2">
                    <div
                        ref={windowRef}
                        className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
                    >
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
                                <span className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text-muted)]">
                                    <Bell size={14} />
                                    <AnimatePresence>
                                        {notified && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                                className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--surface)]"
                                                style={{ backgroundColor: "var(--primary)" }}
                                            />
                                        )}
                                    </AnimatePresence>
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

                                    <motion.span
                                        ref={newBtnRef}
                                        animate={{ scale: pressed ? 0.93 : 1 }}
                                        transition={{ duration: 0.12 }}
                                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-[11px] font-bold"
                                        style={{ backgroundColor: "var(--primary)", color: "#ffffff" }}
                                    >
                                        <Plus size={13} strokeWidth={3} />
                                        New task
                                    </motion.span>
                                </div>

                                {/* Statistics */}
                                <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
                                    <div
                                        data-sim-card
                                        className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3.5 sm:p-4"
                                    >
                                        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold text-[var(--text-muted)] sm:text-xs">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--surface)] text-[var(--text-muted)]">
                                                <ListTodo size={13} />
                                            </span>
                                            Total tasks
                                        </div>

                                        <p
                                            ref={totalRef}
                                            className="text-2xl font-extrabold tabular-nums tracking-tight text-[var(--text)]"
                                        >
                                            {pad2(BASE.total)}
                                        </p>

                                        <p className="mt-1 text-[10px] font-normal text-[var(--text-subtle)]">
                                            In your workspace
                                        </p>
                                    </div>

                                    <div
                                        data-sim-card
                                        className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3.5 sm:p-4"
                                    >
                                        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold text-[var(--text-muted)] sm:text-xs">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--surface)]">
                                                <CheckCircle2
                                                    size={13}
                                                    className="text-[var(--success)]"
                                                />
                                            </span>
                                            Completed
                                        </div>

                                        <p
                                            ref={doneRef}
                                            className="text-2xl font-extrabold tabular-nums tracking-tight text-[var(--text)]"
                                        >
                                            {pad2(BASE.done)}
                                        </p>

                                        <p className="mt-1 text-[10px] font-normal text-[var(--text-subtle)]">
                                            Tasks finished
                                        </p>
                                    </div>

                                    <div
                                        data-sim-card
                                        className="col-span-2 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3.5 sm:p-4 lg:col-span-1"
                                    >
                                        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold text-[var(--text-muted)] sm:text-xs">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--surface)]">
                                                <TrendingUp
                                                    size={13}
                                                    className="text-[var(--primary)]"
                                                />
                                            </span>
                                            Weekly progress
                                        </div>

                                        <p
                                            ref={pctRef}
                                            className="text-2xl font-extrabold tabular-nums tracking-tight text-[var(--text)]"
                                        >
                                            {percent(BASE.done, BASE.total)}%
                                        </p>

                                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                                            <div
                                                ref={fillRef}
                                                className="hero-progress-fill h-full rounded-full"
                                                style={{
                                                    width: `${percent(BASE.done, BASE.total)}%`,
                                                    backgroundColor: "var(--primary)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Task list and weekly chart */}
                                <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                                    <div
                                        data-sim-card
                                        className="min-h-[16.5rem] min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3.5 sm:p-4"
                                    >
                                        <div className="mb-3 flex items-center justify-between px-0.5">
                                            <h3 className="text-xs font-bold text-[var(--text)] sm:text-sm">
                                                Today&apos;s tasks
                                            </h3>

                                            <MoreHorizontal
                                                size={16}
                                                className="text-[var(--text-subtle)]"
                                            />
                                        </div>

                                        <ul className="space-y-2">
                                            <AnimatePresence initial={false} mode="popLayout">
                                                {tasks.map((task) => (
                                                    <motion.li
                                                        key={task.id}
                                                        layout
                                                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.98 }}
                                                        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                                                        className="flex h-12 min-w-0 items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3"
                                                    >
                                                        <span
                                                            ref={(el) => {
                                                                checkRefs.current[task.id] = el;
                                                            }}
                                                            className="flex h-4 w-4 shrink-0 items-center justify-center"
                                                            style={
                                                                task.completed
                                                                    ? undefined
                                                                    : { color: "var(--text-subtle)" }
                                                            }
                                                        >
                                                            {task.completed ? (
                                                                <motion.span
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                                                                    className="flex h-4 w-4 items-center justify-center rounded-full"
                                                                    style={{
                                                                        backgroundColor: "var(--primary)",
                                                                        color: "#ffffff",
                                                                    }}
                                                                >
                                                                    <Check size={10} strokeWidth={3.5} />
                                                                </motion.span>
                                                            ) : (
                                                                <Circle size={14} />
                                                            )}
                                                        </span>

                                                        <span
                                                            className={`min-w-0 flex-1 truncate text-[11px] font-semibold transition-colors duration-300 sm:text-xs ${task.completed
                                                                ? "text-[var(--text-muted)] line-through"
                                                                : "text-[var(--text)]"
                                                                }`}
                                                        >
                                                            {task.title}
                                                            {typingId === task.id && (
                                                                <motion.span
                                                                    aria-hidden="true"
                                                                    animate={{ opacity: [1, 0, 1] }}
                                                                    transition={{ duration: 0.9, repeat: Infinity }}
                                                                    className="ml-0.5 inline-block h-3 w-px translate-y-0.5 bg-[var(--text)]"
                                                                />
                                                            )}
                                                        </span>

                                                        <span
                                                            className="hidden shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:inline-flex"
                                                            style={CATEGORY_STYLES[task.category]}
                                                        >
                                                            {task.category}
                                                        </span>
                                                    </motion.li>
                                                ))}
                                            </AnimatePresence>
                                        </ul>
                                    </div>

                                    {/* Weekly productivity chart */}
                                    <div
                                        data-sim-card
                                        className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--background)] p-3.5 sm:p-4"
                                    >
                                        <div className="mb-4 flex items-center justify-between gap-2 px-0.5">
                                            <h3 className="text-xs font-bold text-[var(--text)] sm:text-sm">
                                                Focus this week
                                            </h3>

                                            <ArrowUpRight
                                                size={15}
                                                className="text-[var(--primary)]"
                                            />
                                        </div>

                                        <div className="mt-auto">
                                            <div className="flex h-[105px] items-end justify-around gap-2 px-1 sm:h-[120px]">
                                                {CHART.map((height, index) => (
                                                    <div
                                                        key={index}
                                                        ref={(el) => {
                                                            barRefs.current[index] = el;
                                                        }}
                                                        className="w-full max-w-6 rounded-md"
                                                        style={{
                                                            height: `${height}%`,
                                                            backgroundColor:
                                                                index === HIGHLIGHT
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

                        {/* Toast */}
                        <AnimatePresence>
                            {toast && (
                                <motion.div
                                    key={toast}
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    className="pointer-events-none absolute bottom-3 left-1/2 z-20 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] py-2 pl-2.5 pr-4 text-[11px] font-semibold text-[var(--text)] shadow-lg shadow-black/10 sm:bottom-4"
                                >
                                    <span
                                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                                        style={{ backgroundColor: "var(--primary)", color: "#ffffff" }}
                                    >
                                        <Check size={10} strokeWidth={3.5} />
                                    </span>
                                    <span className="truncate">{toast}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Simulated cursor (hidden when reduced motion is on) */}
                        {!reduce && (
                            <motion.div
                                aria-hidden="true"
                                style={{ x: cx, y: cy, opacity: cursorOpacity }}
                                className="pointer-events-none absolute left-0 top-0 z-30"
                            >
                                <motion.span
                                    style={{
                                        scale: rippleScale,
                                        opacity: rippleOpacity,
                                        backgroundColor: "var(--primary)",
                                    }}
                                    className="absolute -left-3 -top-3 h-6 w-6 rounded-full"
                                />
                                <motion.svg
                                    style={{ scale: cursorScale, originX: 0, originY: 0 }}
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    className="relative drop-shadow-md"
                                >
                                    <path
                                        d="M3 2l0 14.5 4-3.8 2.9 6.3 2.6-1.2-2.9-6.2H16.5z"
                                        fill="var(--text)"
                                        stroke="var(--surface)"
                                        strokeWidth="1.4"
                                        strokeLinejoin="round"
                                    />
                                </motion.svg>
                            </motion.div>
                        )}
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
    );
};

export default DashboardPreview;