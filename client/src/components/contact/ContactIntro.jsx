import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ArrowUpRight } from "lucide-react";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
import MaskedLine from "../about/MaskedLine";
import { EASE } from "../about/aboutData";
import { EMAIL } from "./contactData";

export default function ContactIntro() {
    const reduce = usePrefersReducedMotion();
    const detailsRef = useRef(null);

    // contact rows settle in right after the headline (gsap)
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                return;
            }

            gsap.from("[data-detail]", {
                autoAlpha: 0,
                y: 18,
                duration: 0.7,
                ease: "power3.out",
                stagger: 0.1,
                delay: 0.7,
                clearProps: "all",
            });
        }, detailsRef);

        return () => ctx.revert();
    }, []);

    return (
        <div>
            <h1 className="max-w-xl text-4xl font-extrabold leading-[1.1] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                <MaskedLine reduce={reduce}>Questions, feedback</MaskedLine>
                <MaskedLine reduce={reduce} delay={0.08}>
                    or a problem?
                </MaskedLine>
                <MaskedLine reduce={reduce} delay={0.16}>
                    Tell us.
                </MaskedLine>
            </h1>

            <motion.p
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
                className="mt-7 max-w-md text-base leading-8 text-[var(--text-muted)] sm:text-lg"
            >
                Send us a message about TaskFlow. If you only need a quick
                answer, the FAQ covers workspaces, roles and tasks.
            </motion.p>

            <dl ref={detailsRef} className="mt-12 max-w-md border-t border-[var(--border)]">
                <div
                    data-detail
                    className="grid gap-1 border-b border-[var(--border)] py-5 sm:grid-cols-[6rem_1fr] sm:gap-6"
                >
                    <dt className="text-sm text-[var(--text-muted)]">Email</dt>
                    <dd>
                        <a
                            href={`mailto:${EMAIL}`}
                            className="break-all text-base font-bold text-[var(--text)] transition-colors hover:text-[var(--primary)]"
                        >
                            {EMAIL}
                        </a>
                    </dd>
                </div>

                <div
                    data-detail
                    className="grid gap-1 border-b border-[var(--border)] py-5 sm:grid-cols-[6rem_1fr] sm:gap-6"
                >
                    <dt className="text-sm text-[var(--text-muted)]">Answers</dt>
                    <dd>
                        <Link
                            to="/faq"
                            className="inline-flex items-center gap-1.5 text-base font-bold text-[var(--text)] transition-colors hover:text-[var(--primary)]"
                        >
                            Read the FAQ
                            <ArrowUpRight size={16} />
                        </Link>
                    </dd>
                </div>
            </dl>
        </div>
    );
}