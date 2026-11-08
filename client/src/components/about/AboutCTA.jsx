import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
import { EASE } from "./aboutData";
import Magnetic from "./Magnetic";

gsap.registerPlugin(ScrollTrigger);

export default function AboutCTA() {
    const reduce = usePrefersReducedMotion();
    const sectionRef = useRef(null);
    const wordmarkRef = useRef(null);

    // oversized wordmark drifts sideways as the CTA scrolls through (gsap)
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                return;
            }

            gsap.fromTo(
                wordmarkRef.current,
                { xPercent: -6 },
                {
                    xPercent: 6,
                    ease: "none",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true,
                    },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="px-5 pb-16 sm:px-8 sm:pb-24">
            <motion.div
                initial={reduce ? false : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: EASE }}
                className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl px-6 pb-36 pt-12 sm:px-12 sm:pt-16 lg:px-16 lg:pb-48"
                style={{ backgroundColor: "var(--primary)", color: "#ffffff" }}
            >
                <div className="relative z-10 flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
                    <div className="max-w-2xl">
                        <h2 className="text-2xl font-extrabold leading-tight tracking-[-0.04em] text-white min-[400px]:text-3xl sm:text-4xl lg:text-5xl">
                            Have a question? Start with the FAQ.
                        </h2>
                        <p className="mt-5 max-w-xl text-base leading-7 text-white/85">
                            Most questions about workspaces, roles and tasks are
                            answered there. If yours is not, email us.
                        </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-3">
                        <Magnetic>
                            <Link
                                to="/faq"
                                style={{ color: "#c2410c" }}
                                className="inline-flex items-center rounded-xl bg-white px-6 py-3.5 text-sm font-bold"
                            >
                                Read the FAQ
                            </Link>
                        </Magnetic>

                        <Magnetic>
                            <a
                                href="mailto:abhaletejas4@gmail.com"
                                style={{ color: "#ffffff" }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-white/40 px-6 py-3.5 text-sm font-bold transition-colors hover:bg-white/10"
                            >
                                Email us
                                <ArrowUpRight size={16} />
                            </a>
                        </Magnetic>
                    </div>
                </div>

                {/* oversized wordmark, clipped by the card */}
                <span
                    ref={wordmarkRef}
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-[0.22em] left-0 select-none whitespace-nowrap text-[22vw] font-extrabold leading-none tracking-[-0.06em] text-white/[0.12] lg:text-[16rem]"
                >
                    TaskFlow
                </span>
            </motion.div>
        </section>
    );
}