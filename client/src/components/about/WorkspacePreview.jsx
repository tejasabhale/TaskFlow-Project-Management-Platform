import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
import { EASE, previewTasks } from "./aboutData";

/** Hero preview: workspace > project > tasks, ticking itself off. */
export default function WorkspacePreview() {
    const reduce = usePrefersReducedMotion();
    const [done, setDone] = useState(reduce ? 2 : 0);
    const total = previewTasks.length;

    useEffect(() => {
        if (reduce) return undefined;

        let interval;
        const start = setTimeout(() => {
            setDone(1);
            interval = setInterval(() => {
                setDone((current) => (current >= total ? 0 : current + 1));
            }, 1700);
        }, 1800);

        return () => {
            clearTimeout(start);
            clearInterval(interval);
        };
    }, [reduce, total]);

    const list = {
        hidden: {},
        show: { transition: { staggerChildren: 0.09, delayChildren: 0.55 } },
    };
    const row = {
        hidden: { opacity: 0, x: -12 },
        show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
    };

    return (
        <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
            aria-label="Example of a TaskFlow project"
        >
            {/* workspace */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                    <span
                        className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-extrabold"
                        style={{ backgroundColor: "var(--primary)", color: "#ffffff" }}
                    >
                        D
                    </span>
                    <span className="text-sm font-bold text-[var(--text)]">
                        Design team
                    </span>
                </div>
                <span className="text-xs text-[var(--text-muted)]">
                    Sample workspace
                </span>
            </div>

            <div className="px-5 pb-5 pt-4">
                {/* project */}
                <p className="text-base font-bold tracking-tight text-[var(--text)]">
                    Website relaunch
                </p>

                {/* tasks */}
                <motion.ul
                    variants={list}
                    initial={reduce ? "show" : "hidden"}
                    animate="show"
                    className="relative mt-4 space-y-1 border-l border-[var(--border)] pl-4"
                >
                    {previewTasks.map((task, index) => {
                        const checked = index < done;

                        return (
                            <motion.li
                                key={task.title}
                                variants={row}
                                className="flex items-center gap-3 rounded-lg px-2 py-2.5"
                            >
                                <span
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${checked
                                        ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                                        : "border-[var(--border-strong)] text-transparent"
                                        }`}
                                >
                                    {checked && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 500,
                                                damping: 18,
                                            }}
                                            className="flex"
                                        >
                                            <Check size={12} strokeWidth={3} />
                                        </motion.span>
                                    )}
                                </span>

                                <span
                                    className={`flex-1 text-sm transition-colors duration-300 ${checked
                                        ? "text-[var(--text-muted)] line-through"
                                        : "font-medium text-[var(--text)]"
                                        }`}
                                >
                                    {task.title}
                                </span>

                                <span className="text-xs tabular-nums text-[var(--text-muted)]">
                                    {task.due}
                                </span>
                            </motion.li>
                        );
                    })}
                </motion.ul>

                {/* progress, derived from the checked tasks above */}
                <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-xs text-[var(--text-muted)]">
                        <span>
                            {done} of {total} tasks done
                        </span>
                        <span className="tabular-nums">
                            {Math.round((done / total) * 100)}%
                        </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                        <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: "var(--primary)" }}
                            animate={{ width: `${(done / total) * 100}%` }}
                            transition={{ duration: 0.6, ease: EASE }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}