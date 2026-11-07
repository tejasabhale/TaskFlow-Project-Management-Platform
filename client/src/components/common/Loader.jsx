import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

/*
 * TaskFlow loader: a tiny task list that completes itself, then resets.
 * One looping timeline drives every row and the progress bar, so they stay in sync.
 * Uses the theme variables from index.css, so it follows light and dark mode.
 */

const CYCLE = 4.2; // seconds per loop

// When each row completes, as a fraction of the cycle.
const DONE_AT = [0.16, 0.4, 0.64];
const SETTLE = 0.07; // how long a completion takes, as a fraction of the cycle
const RESET_START = 0.9;
const RESET_END = 0.98;

// Keyframes: 0 until the row completes, 1 until the reset, then back to 0.
const rowTimes = (done) => [0, done, done + SETTLE, RESET_START, RESET_END, 1];
const rowValues = [0, 0, 1, 1, 0, 0];

const loop = {
    duration: CYCLE,
    repeat: Infinity,
    ease: "easeInOut",
};

const ROWS = [
    { id: "a", width: "74%" },
    { id: "b", width: "52%" },
    { id: "c", width: "64%" },
];

// Progress bar keyframes: one third per completed row.
const barTimes = [
    0,
    DONE_AT[0],
    DONE_AT[0] + SETTLE,
    DONE_AT[1],
    DONE_AT[1] + SETTLE,
    DONE_AT[2],
    DONE_AT[2] + SETTLE,
    RESET_START,
    RESET_END,
    1,
];
const barValues = [0, 0, 33.33, 33.33, 66.66, 66.66, 100, 100, 0, 0];

function Loader({ fullScreen = true, label = "Loading your workspace" }) {
    const reduced = useReducedMotion();

    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className={
                fullScreen
                    ? "fixed inset-0 z-[100] flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[var(--background)] px-6"
                    : "flex w-full flex-col items-center justify-center px-4 py-12"
            }
        >
            <div className="flex w-full max-w-xs flex-col sm:max-w-sm">
                {/* Brand */}
                <div
                    aria-hidden="true"
                    className="mb-8 flex items-center justify-center gap-3 text-[var(--text)]"
                >
                    <img
                        src="/taskflow-logo.svg"
                        alt=""
                        className="h-10 w-auto max-w-[3.5rem] object-contain"
                        draggable="false"
                    />
                    <span className="text-2xl font-extrabold leading-none tracking-tight">
                        TaskFlow
                    </span>
                </div>

                {/* Task rows */}
                <ul aria-hidden="true" className="space-y-2.5">
                    {ROWS.map((row, index) => {
                        const times = rowTimes(DONE_AT[index]);
                        // With reduced motion, show a calm static state: first task done.
                        const staticOn = index === 0 ? 1 : 0;

                        return (
                            <li
                                key={row.id}
                                className="flex h-12 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 shadow-[var(--shadow-sm)]"
                            >
                                {/* Check circle */}
                                <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)]">
                                    <motion.span
                                        className="absolute -inset-px flex items-center justify-center rounded-full bg-[var(--primary)] text-[var(--text-inverse)]"
                                        initial={false}
                                        animate={
                                            reduced
                                                ? { scale: staticOn, opacity: staticOn }
                                                : { scale: rowValues, opacity: rowValues }
                                        }
                                        transition={
                                            reduced ? { duration: 0 } : { ...loop, times }
                                        }
                                    >
                                        <Check size={11} strokeWidth={3.5} />
                                    </motion.span>
                                </span>

                                {/* Title placeholder that fills as the task completes */}
                                <span className="flex-1">
                                    <span
                                        className="relative block h-2 overflow-hidden rounded-full bg-[var(--border)]"
                                        style={{ width: row.width }}
                                    >
                                        <motion.span
                                            className="absolute inset-0 origin-left rounded-full bg-[var(--primary)]"
                                            initial={false}
                                            animate={
                                                reduced ? { scaleX: staticOn } : { scaleX: rowValues }
                                            }
                                            transition={
                                                reduced ? { duration: 0 } : { ...loop, times }
                                            }
                                        />
                                    </span>
                                </span>
                            </li>
                        );
                    })}
                </ul>

                {/* Overall progress, in step with the rows */}
                <div
                    aria-hidden="true"
                    className="mt-6 h-1.5 overflow-hidden rounded-full bg-[var(--border)]"
                >
                    <motion.div
                        className="h-full rounded-full bg-[var(--primary)]"
                        initial={false}
                        animate={
                            reduced
                                ? { width: "33.33%" }
                                : { width: barValues.map((v) => `${v}%`) }
                        }
                        transition={
                            reduced ? { duration: 0 } : { ...loop, times: barTimes }
                        }
                    />
                </div>

                {/* Label */}
                <p className="mt-4 text-center text-sm font-semibold tracking-tight text-[var(--text-muted)]">
                    {label}
                </p>
            </div>
        </div>
    );
}

export default Loader;