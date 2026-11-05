
import { motion, useReducedMotion } from "framer-motion";

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]";

const spring = {
    type: "spring",
    stiffness: 480,
    damping: 30,
    mass: 0.65,
};

export default function HamburgerButton({
    open,
    onClick,
    controls,
    className = "",
}) {
    const reduceMotion = useReducedMotion();

    const transition = reduceMotion
        ? { duration: 0 }
        : spring;

    const barColor = "var(--primary)";

    return (
        <motion.button
            type="button"
            onClick={onClick}
            aria-label={open ? "Close sidebar" : "Open sidebar"}
            aria-expanded={open}
            aria-controls={controls}
            aria-haspopup="true"
            title={open ? "Close sidebar" : "Open sidebar"}
            whileHover={reduceMotion ? undefined : { scale: 1.06 }}
            whileTap={reduceMotion ? undefined : { scale: 0.92 }}
            className={`relative z-[60] grid size-11 shrink-0 place-items-center rounded-xl border-0 bg-transparent p-0 text-[var(--primary)] shadow-none outline-none transition-colors hover:bg-transparent ${focusRing} ${className}`}
            style={{
                backgroundColor: "transparent",
                border: "none",
                boxShadow: "none",
            }}
        >
            {/* Animated menu icon */}
            <span
                aria-hidden="true"
                className="relative block size-6"
            >
                {/* Top bar */}
                <motion.span
                    initial={false}
                    animate={
                        open
                            ? {
                                x: "-50%",
                                y: 0,
                                rotate: 45,
                                width: 24,
                            }
                            : {
                                x: "-50%",
                                y: -7,
                                rotate: 0,
                                width: 18,
                            }
                    }
                    transition={transition}
                    className="absolute left-1/2 top-1/2 block h-[2.5px] rounded-full"
                    style={{
                        backgroundColor: barColor,
                        transformOrigin: "center",
                    }}
                />

                {/* Middle bar */}
                <motion.span
                    initial={false}
                    animate={
                        open
                            ? {
                                x: "-50%",
                                y: 0,
                                scaleX: 0,
                                opacity: 0,
                                width: 24,
                            }
                            : {
                                x: "-50%",
                                y: 0,
                                scaleX: 1,
                                opacity: 1,
                                width: 24,
                            }
                    }
                    transition={
                        reduceMotion
                            ? { duration: 0 }
                            : { duration: 0.18, ease: "easeInOut" }
                    }
                    className="absolute left-1/2 top-1/2 block h-[2.5px] rounded-full"
                    style={{
                        backgroundColor: barColor,
                        transformOrigin: "center",
                    }}
                />

                {/* Bottom bar */}
                <motion.span
                    initial={false}
                    animate={
                        open
                            ? {
                                x: "-50%",
                                y: 0,
                                rotate: -45,
                                width: 24,
                            }
                            : {
                                x: "-50%",
                                y: 7,
                                rotate: 0,
                                width: 14,
                            }
                    }
                    transition={transition}
                    className="absolute left-1/2 top-1/2 block h-[2.5px] rounded-full"
                    style={{
                        backgroundColor: barColor,
                        transformOrigin: "center",
                    }}
                />
            </span>
        </motion.button>
    );
}
