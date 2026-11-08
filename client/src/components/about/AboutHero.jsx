import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
import { EASE } from "./aboutData";
import MaskedLine from "./MaskedLine";
import WorkspacePreview from "./WorkspacePreview";

export default function AboutHero() {
    const reduce = usePrefersReducedMotion();

    return (
        <section className="relative px-5 pb-24 pt-20 sm:px-8 sm:pb-32 sm:pt-28">
            {/* faint dot grid, fades out toward the edges */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_30%_30%,black,transparent_70%)]"
            />

            <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
                <div>
                    <h1 className="max-w-3xl text-3xl font-extrabold leading-[1.12] tracking-[-0.04em] min-[400px]:text-4xl sm:text-5xl sm:leading-[1.05] sm:tracking-[-0.045em] lg:text-6xl">
                        <MaskedLine reduce={reduce}>Work moves better</MaskedLine>
                        <MaskedLine reduce={reduce} delay={0.08}>
                            when everything
                        </MaskedLine>
                        <MaskedLine reduce={reduce} delay={0.16}>
                            is connected.
                        </MaskedLine>
                    </h1>

                    <motion.p
                        initial={reduce ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
                        className="mt-7 max-w-lg text-base leading-8 text-[var(--text-muted)] sm:text-lg"
                    >
                        TaskFlow is a project and task manager for teams. Give your
                        team a shared workspace, split the work into projects, and
                        give every task an owner and a due date.
                    </motion.p>

                    <motion.div
                        initial={reduce ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
                        className="mt-9 flex flex-wrap items-center gap-4"
                    >
                        <Link
                            to="/faq"
                            style={{ backgroundColor: "var(--primary)", color: "#ffffff" }}
                            className="inline-flex items-center rounded-xl px-6 py-3.5 text-sm font-bold transition-transform duration-200 hover:-translate-y-0.5"
                        >
                            Read the FAQ
                        </Link>

                        <a
                            href="mailto:abhaletejas4@gmail.com"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-6 py-3.5 text-sm font-bold text-[var(--text)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                        >
                            Email us
                            <ArrowUpRight size={16} />
                        </a>
                    </motion.div>
                </div>

                <div className="flex justify-center lg:justify-end">
                    <WorkspacePreview />
                </div>
            </div>
        </section>
    );
}