import { motion } from "framer-motion";
import { EASE } from "./aboutData";

/** Headline line that slides up from behind a mask (framer-motion). */
export default function MaskedLine({ children, delay = 0, reduce }) {
    return (
        <span className="block overflow-hidden pb-[0.2em] -mb-[0.2em]">
            <motion.span
                className="block"
                initial={reduce ? false : { y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.85, ease: EASE, delay }}
            >
                {children}
            </motion.span>
        </span>
    );
}