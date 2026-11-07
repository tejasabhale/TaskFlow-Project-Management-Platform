import { motion } from "framer-motion";
import { topics } from "./contactData";

/** Radio-style chips. The orange pill slides between options (framer layoutId). */
export default function TopicPicker({ value, onChange }) {
    return (
        <div role="radiogroup" aria-label="Topic" className="flex flex-wrap gap-2">
            {topics.map((topic) => {
                const active = topic === value;

                return (
                    <button
                        key={topic}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => onChange(topic)}
                        className={`relative rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${active
                                ? "border-transparent text-white"
                                : "border-[var(--border)] bg-transparent text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--text)]"
                            }`}
                    >
                        {active && (
                            <motion.span
                                layoutId="topic-pill"
                                className="absolute inset-0 rounded-full"
                                style={{ backgroundColor: "var(--primary)" }}
                                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                            />
                        )}
                        <span className="relative z-10">{topic}</span>
                    </button>
                );
            })}
        </div>
    );
}