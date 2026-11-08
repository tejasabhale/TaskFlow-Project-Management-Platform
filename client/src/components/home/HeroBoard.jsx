import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

const COLUMNS = ["To do", "In progress", "Done"];

const TASKS = [
    { id: "checklist", title: "Launch checklist", due: "Mon" },
    { id: "owners", title: "Assign owners", due: "Tue" },
    { id: "publish", title: "Publish page", due: "Fri" },
];

// Column of each task, frame by frame (0 = To do, 1 = In progress, 2 = Done).
// Exactly one task moves per frame.
const FRAMES = [
    [0, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
    [2, 1, 0],
    [2, 1, 1],
    [2, 2, 1],
    [2, 2, 2],
];

const LAST_FRAME = FRAMES.length - 1;

const INITIAL_DELAY_MS = 1900; // let the page-load animation finish first
const RESUME_DELAY_MS = 400; // short beat after scrolling back into view
const STEP_MS = 1400; // time between forward moves
const HOLD_MS = 1500; // pause on the finished board
const REVERSE_MS = 1000; // duration of the reverse (reset) glide
const REVERSE_STAGGER = 0.1; // seconds between each card starting its way back

const FORWARD = { duration: 0.9, ease: [0.4, 0, 0.2, 1] }; // smooth in-out, no bounce
const REVERSE = { duration: REVERSE_MS / 1000, ease: [0.4, 0, 0.2, 1] };

const REST = { scale: 1 };
const LIFT = { scale: [1, 1.035, 1] };

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sample board: tasks move from To do to Done on their own, one at a time.
 * Framer Motion's shared layout animation glides each card between columns.
 * When everything is done, all cards glide back to their original positions
 * (reverse animation), then the loop starts again.
 *
 * The loop only runs while the board is on screen and the tab is visible.
 * When it leaves the viewport it pauses, and it resumes from the same frame.
 *
 * Columns do not clip their content and a moving card sits above everything
 * else, so the full movement between columns is always visible.
 *
 * Size is constant: every card has the same fixed height and every column has one
 * fixed height that fits all three cards, so the board never grows or shrinks.
 */
export default function HeroBoard() {
    const reduce = usePrefersReducedMotion();
    const rootRef = useRef(null);
    const [frame, setFrame] = useState(reduce ? 3 : 0);
    const [moved, setMoved] = useState([]); // indexes of tasks that changed column
    const [reversing, setReversing] = useState(false);
    const [inView, setInView] = useState(false);
    const [tabVisible, setTabVisible] = useState(true);

    const frameRef = useRef(frame);
    const hasStarted = useRef(false);

    // Is the board on screen?
    useEffect(() => {
        const node = rootRef.current;
        if (!node) return undefined;

        if (typeof IntersectionObserver === "undefined") {
            setInView(true);
            return undefined;
        }

        const observer = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { threshold: 0.25 }
        );
        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    // Is the browser tab visible?
    useEffect(() => {
        const onChange = () => setTabVisible(!document.hidden);
        onChange();
        document.addEventListener("visibilitychange", onChange);
        return () => document.removeEventListener("visibilitychange", onChange);
    }, []);

    const running = inView && tabVisible;

    // The loop. Cleanup cancels it, and the next run picks up from frameRef.
    useEffect(() => {
        if (reduce || !running) return undefined;

        let cancelled = false;

        const goTo = (next, isReverse) => {
            const from = FRAMES[frameRef.current];
            const to = FRAMES[next];
            setMoved(to.map((col, i) => (col !== from[i] ? i : -1)).filter((i) => i >= 0));
            setReversing(isReverse);
            frameRef.current = next;
            setFrame(next);
        };

        (async () => {
            await wait(hasStarted.current ? RESUME_DELAY_MS : INITIAL_DELAY_MS);
            hasStarted.current = true;

            while (!cancelled) {
                if (frameRef.current < LAST_FRAME) {
                    // forward: one task at a time
                    goTo(frameRef.current + 1, false);
                    await wait(STEP_MS);
                } else {
                    // hold the finished board, then every card glides back to To do
                    await wait(HOLD_MS);
                    if (cancelled) return;

                    goTo(0, true);
                    await wait(REVERSE_MS + REVERSE_STAGGER * 1000 * (TASKS.length - 1) + 900);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [reduce, running]);

    const placement = FRAMES[frame];
    const doneCount = placement.filter((col) => col === 2).length;

    return (
        <div
            ref={rootRef}
            data-hero-board
            className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
            role="img"
            aria-label="Sample TaskFlow board where tasks move from To do to Done"
        >
            {/* workspace / project */}
            <div className="flex h-14 items-center justify-between gap-4 border-b border-[var(--border)] px-6">
                <div className="flex min-w-0 items-center gap-2.5">
                    <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-extrabold"
                        style={{ backgroundColor: "var(--primary)", color: "#ffffff" }}
                    >
                        D
                    </span>
                    <p className="truncate text-sm text-[var(--text-muted)]">
                        Design team /{" "}
                        <span className="font-bold text-[var(--text)]">Website relaunch</span>
                    </p>
                </div>
                <span className="shrink-0 text-xs text-[var(--text-muted)]">Sample</span>
            </div>

            {/* columns (no overflow clipping, so cards are visible all the way between columns) */}
            <div className="grid grid-cols-3 gap-2 p-2.5 min-[380px]:gap-2.5 min-[380px]:p-3 sm:gap-3 sm:p-5">
                {COLUMNS.map((name, columnIndex) => {
                    const cards = TASKS.filter((_, i) => placement[i] === columnIndex);

                    return (
                        <div
                            key={name}
                            className="h-[20.5rem] rounded-xl bg-[var(--background)] p-2 sm:p-3"
                        >
                            <div className="mb-3 flex h-4 items-center justify-between px-0.5">
                                <div className="flex items-center gap-1.5">
                                    <span
                                        aria-hidden="true"
                                        className="h-2 w-2 rounded-full border transition-colors duration-500"
                                        style={{
                                            borderColor:
                                                columnIndex === 0 ? "var(--border-strong)" : "var(--primary)",
                                            backgroundColor:
                                                columnIndex === 2 ? "var(--primary)" : "transparent",
                                        }}
                                    />
                                    <span className="text-[11px] font-bold text-[var(--text)] sm:text-xs">{name}</span>
                                </div>
                                <span className="text-[11px] tabular-nums text-[var(--text-muted)] sm:text-xs">
                                    {cards.length}
                                </span>
                            </div>

                            <ul className="space-y-2">
                                {cards.map((task) => {
                                    const index = TASKS.indexOf(task);
                                    const done = columnIndex === 2;
                                    const moving = moved.includes(index);

                                    // on reverse, the last task leaves first, so the cards peel back in order
                                    const reverseDelay = (TASKS.length - 1 - index) * REVERSE_STAGGER;

                                    return (
                                        <motion.li
                                            key={task.id}
                                            layout
                                            layoutId={task.id}
                                            animate={moving ? LIFT : REST}
                                            transition={{
                                                layout: reversing
                                                    ? { ...REVERSE, delay: reverseDelay }
                                                    : FORWARD,
                                                scale: reversing
                                                    ? { ...REVERSE, delay: reverseDelay }
                                                    : FORWARD,
                                            }}
                                            // moving cards render in front of every column and card
                                            style={{ zIndex: moving ? 50 : 1 }}
                                            className="relative flex h-[5.25rem] flex-col justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2.5 sm:p-3"
                                        >
                                            <p
                                                className={`line-clamp-2 text-[11px] sm:text-xs font-semibold leading-snug transition-colors duration-700 ${done ? "text-[var(--text-muted)]" : "text-[var(--text)]"
                                                    }`}
                                            >
                                                {task.title}
                                            </p>

                                            <div className="flex h-4 items-center justify-between">
                                                <span className="text-[11px] tabular-nums text-[var(--text-muted)]">
                                                    {task.due}
                                                </span>

                                                {/* check pops in after landing in Done, and shrinks away on reverse */}
                                                <motion.span
                                                    initial={false}
                                                    animate={{ scale: done ? 1 : 0, opacity: done ? 1 : 0 }}
                                                    transition={
                                                        done
                                                            ? {
                                                                type: "spring",
                                                                stiffness: 420,
                                                                damping: 24,
                                                                delay: 0.6,
                                                            }
                                                            : {
                                                                duration: 0.3,
                                                                ease: "easeIn",
                                                                delay: reversing ? reverseDelay : 0,
                                                            }
                                                    }
                                                    className="flex h-4 w-4 items-center justify-center rounded-full"
                                                    style={{ backgroundColor: "var(--primary)", color: "#ffffff" }}
                                                >
                                                    <Check size={10} strokeWidth={3.5} />
                                                </motion.span>
                                            </div>
                                        </motion.li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </div>

            {/* progress, derived from the cards above */}
            <div className="flex h-14 items-center gap-4 border-t border-[var(--border)] px-6">
                <span className="shrink-0 text-xs tabular-nums text-[var(--text-muted)]">
                    {doneCount} of {TASKS.length} done
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: "var(--primary)" }}
                        animate={{ width: `${(doneCount / TASKS.length) * 100}%` }}
                        transition={
                            reversing
                                ? { duration: REVERSE_MS / 1000, ease: [0.4, 0, 0.2, 1] }
                                : { duration: 0.9, ease: [0.4, 0, 0.2, 1], delay: 0.2 }
                        }
                    />
                </div>
            </div>
        </div>
    );
}