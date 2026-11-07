import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

/** Wrapper that leans toward the cursor (framer-motion springs). */
export default function Magnetic({ children }) {
    const reduce = usePrefersReducedMotion();
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
    const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

    const handleMove = (event) => {
        if (reduce || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((event.clientX - rect.left - rect.width / 2) * 0.25);
        y.set((event.clientY - rect.top - rect.height / 2) * 0.25);
    };

    const reset = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            style={{ x: springX, y: springY }}
            onMouseMove={handleMove}
            onMouseLeave={reset}
            className="inline-block"
        >
            {children}
        </motion.div>
    );
}