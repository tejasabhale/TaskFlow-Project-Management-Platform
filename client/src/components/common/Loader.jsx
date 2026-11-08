import { motion, useReducedMotion } from "framer-motion";

/*
 * Full-screen skeleton loader, shimmer style.
 * Crisp placeholder blocks with a light sweep moving across each one.
 * Uses the theme variables from index.css, so it follows light and dark mode.
 */

function Bone({ className = "" }) {
    const reduced = useReducedMotion();

    return (
        <div
            className={`relative overflow-hidden rounded-lg bg-[var(--border)] ${className}`}
        >
            {!reduced && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--surface)] to-transparent opacity-70"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                        duration: 1.4,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            )}
        </div>
    );
}

function Loader({ label = "Loading" }) {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="fixed inset-0 z-[100] flex min-h-[100dvh] flex-col overflow-hidden bg-[var(--background)]"
        >
            <span className="sr-only">{label}</span>

            <div aria-hidden="true" className="flex h-full w-full flex-col">
                {/* Top bar */}
                <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <Bone className="h-9 w-9 rounded-full" />
                        <Bone className="h-4 w-28" />
                    </div>
                    <div className="flex items-center gap-3">
                        <Bone className="hidden h-4 w-20 sm:block" />
                        <Bone className="h-9 w-9 rounded-full" />
                    </div>
                </div>

                <div className="flex min-h-0 flex-1">
                    {/* Sidebar (hidden on small screens) */}
                    <div className="hidden w-60 shrink-0 space-y-3 border-r border-[var(--border)] p-4 md:block">
                        <Bone className="h-10 w-full rounded-xl" />
                        <Bone className="h-10 w-full rounded-xl" />
                        <Bone className="h-10 w-full rounded-xl" />
                        <Bone className="h-10 w-full rounded-xl" />
                        <Bone className="h-10 w-3/4 rounded-xl" />
                    </div>

                    {/* Main content */}
                    <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
                        {/* Page title + action */}
                        <div className="flex items-center justify-between">
                            <div className="w-1/2 space-y-2.5">
                                <Bone className="h-6 w-2/3" />
                                <Bone className="h-3 w-1/2" />
                            </div>
                            <Bone className="h-10 w-28 rounded-xl" />
                        </div>

                        {/* Stat blocks */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <Bone className="h-24 rounded-2xl" />
                            <Bone className="h-24 rounded-2xl" />
                            <Bone className="hidden h-24 rounded-2xl sm:block" />
                        </div>

                        {/* List rows */}
                        <div className="flex-1 space-y-3">
                            <Bone className="h-14 w-full rounded-xl" />
                            <Bone className="h-14 w-full rounded-xl" />
                            <Bone className="h-14 w-full rounded-xl" />
                            <Bone className="h-14 w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Loader;