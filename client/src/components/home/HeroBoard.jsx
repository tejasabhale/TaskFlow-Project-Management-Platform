import { useEffect, useState } from "react";
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

const STEP_MS = 1300; // time between moves
const MOVE = { duration: 0.8, ease: [0.32, 0.72, 0, 1] }; // smooth ease-out, no bounce

const LIFT = {
    scale: [1, 1.04, 1],
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sample board: tasks move from To do to Done on their own, one at a time.
 * Framer Motion's shared layout animation glides each card between columns.
 * When everything is done the board fades out, resets while hidden, and fades back in.
 *
 * Size is constant: every card has the same fixed height and every column has one
 * fixed height that fits all three cards, so the board never grows or shrinks.
 */
export default function HeroBoard() {
    const reduce = usePrefersReducedMotion();
    const [frame, setFrame] = useState(reduce ? 3 : 0);
    const [visible, setVisible] = useState(true);
    const [instant, setInstant] = useState(false);

    useEffect(() => {
        if (reduce) return undefined;

        let cancelled = false;

        (async () => {
            await wait(1900); // let the page-load animation finish first

            while (!cancelled) {
                for (let i = 1; i < FRAMES.length; i += 1) {
                    setFrame(i);
                    await wait(STEP_MS);
                    if (cancelled) return;
                }

                await wait(1400); // hold the finished board
                if (cancelled) return;

                setVisible(false); // fade out...
                await wait(450);
                if (cancelled) return;

                setInstant(true); // ...reset without any card travelling...
                setFrame(0);
                await wait(80);
                setInstant(false);
                setVisible(true); // ...and fade back in
                await wait(1100);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [reduce]);

    const placement = FRAMES[frame];
    const previous = FRAMES[Math.max(frame - 1, 0)];
    const movedIndex =
        frame > 0 && !instant ? placement.findIndex((col, i) => col !== previous[i]) : -1;

    const doneCount = placement.filter((col) => col === 2).length;

    return (
        <div
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

            {/* columns */}
            <motion.div
                animate={{ opacity: visible ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-3 gap-2.5 p-4 sm:gap-3 sm:p-5"
            >
                {COLUMNS.map((name, columnIndex) => {
                    const cards = TASKS.filter((_, i) => placement[i] === columnIndex);

                    return (
                        <div
                            key={name}
                            className="h-[20.5rem] overflow-hidden rounded-xl bg-[var(--background)] p-2.5 sm:p-3"
                        >
                            <div className="mb-3 flex h-4 items-center justify-between px-0.5">
                                <div className="flex items-center gap-1.5">
                                    <span
                                        aria-hidden="true"
                                        className="h-2 w-2 rounded-full border"
                                        style={{
                                            borderColor:
                                                columnIndex === 0 ? "var(--border-strong)" : "var(--primary)",
                                            backgroundColor:
                                                columnIndex === 2 ? "var(--primary)" : "transparent",
                                        }}
                                    />
                                    <span className="text-xs font-bold text-[var(--text)]">{name}</span>
                                </div>
                                <span className="text-xs tabular-nums text-[var(--text-muted)]">
                                    {cards.length}
                                </span>
                            </div>

                            <ul className="space-y-2">
                                {cards.map((task) => {
                                    const index = TASKS.indexOf(task);
                                    const done = columnIndex === 2;
                                    const moving = index === movedIndex;

                                    return (
                                        <motion.li
                                            key={task.id}
                                            layout
                                            layoutId={task.id}
                                            animate={moving ? LIFT : { scale: 1 }}
                                            transition={{
                                                layout: instant ? { duration: 0 } : MOVE,
                                                scale: { duration: 0.8, ease: "easeInOut" },
                                            }}
                                            style={{ zIndex: moving ? 10 : 0 }}
                                            className="relative flex h-[5.25rem] flex-col justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3"
                                        >
                                            <p
                                                className={`line-clamp-2 text-xs font-semibold leading-snug transition-colors duration-500 ${done ? "text-[var(--text-muted)]" : "text-[var(--text)]"
                                                    }`}
                                            >
                                                {task.title}
                                            </p>

                                            <div className="flex h-4 items-center justify-between">
                                                <span className="text-[11px] tabular-nums text-[var(--text-muted)]">
                                                    {task.due}
                                                </span>

                                                {/* check pops in once the card has landed in Done */}
                                                <motion.span
                                                    initial={false}
                                                    animate={{ scale: done ? 1 : 0, opacity: done ? 1 : 0 }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 500,
                                                        damping: 20,
                                                        delay: done ? 0.55 : 0,
                                                    }}
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
            </motion.div>

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
                        transition={instant ? { duration: 0 } : { duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
                    />
                </div>
            </div>
        </div>
    );
}