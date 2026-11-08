import { useLayoutEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EASE, steps } from "./aboutData";

gsap.registerPlugin(ScrollTrigger);

function Step({ step, index }) {
    const ref = useRef(null);
    // becomes active once the step passes the middle of the screen, and stays active
    const active = useInView(ref, { margin: "0px 0px -50% 0px", once: true });

    return (
        <li ref={ref} className="relative pb-16 pl-14 last:pb-0">
            <motion.span
                animate={active ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                transition={{ duration: 0.45, ease: EASE }}
                className={`absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold transition-colors duration-300 ${active
                        ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                        : "border-[var(--border-strong)] bg-[var(--background)] text-[var(--text-muted)]"
                    }`}
            >
                {index + 1}
            </motion.span>

            <h3 className="text-2xl font-bold tracking-tight text-[var(--text)]">
                {step.title}
            </h3>
            <p className="mt-3 max-w-lg text-base leading-8 text-[var(--text-muted)]">
                {step.description}
            </p>
        </li>
    );
}

function Steps() {
    const listRef = useRef(null);
    const lineRef = useRef(null);
    const fillRef = useRef(null);

    useLayoutEffect(() => {
        const list = listRef.current;
        const line = lineRef.current;

        // The line runs from the centre of the first circle to the centre of
        // the last one, so it stops at step 3 instead of trailing below it.
        const measure = () => {
            const items = list.querySelectorAll("li");
            const first = items[0];
            const last = items[items.length - 1];
            const circleCenter = 18; // h-9 circle = 36px, so half is 18px

            line.style.top = `${first.offsetTop + circleCenter}px`;
            line.style.height = `${last.offsetTop - first.offsetTop}px`;
        };

        measure();

        const ctx = gsap.context(() => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(fillRef.current, { scaleY: 1 });
                return;
            }

            gsap.fromTo(
                fillRef.current,
                { scaleY: 0 },
                {
                    scaleY: 1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: line,
                        start: "top 55%",
                        end: "bottom 55%",
                        scrub: true,
                    },
                }
            );
        }, list);

        // re-measure if the layout changes (resize, font load, etc.)
        const observer = new ResizeObserver(() => {
            measure();
            ScrollTrigger.refresh();
        });
        observer.observe(list);

        return () => {
            observer.disconnect();
            ctx.revert();
        };
    }, []);

    return (
        <ol ref={listRef} className="relative">
            {/* track + scroll-driven fill, ending at the last step's circle */}
            <span
                ref={lineRef}
                aria-hidden="true"
                className="absolute left-[17px] w-px bg-[var(--border)]"
            >
                <span
                    ref={fillRef}
                    className="absolute inset-0 origin-top"
                    style={{ backgroundColor: "var(--primary)" }}
                />
            </span>

            {steps.map((step, index) => (
                <Step key={step.title} step={step} index={index} />
            ))}
        </ol>
    );
}

export default function HowItWorks() {
    return (
        <section className="px-5 py-24 sm:px-8 sm:py-32">
            <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
                <div className="lg:sticky lg:top-28 lg:self-start">
                    <h2 className="max-w-md text-2xl font-extrabold leading-tight tracking-[-0.04em] min-[400px]:text-3xl sm:text-4xl">
                        From a goal to a finished task in three steps
                    </h2>
                    <p className="mt-5 max-w-sm text-base leading-8 text-[var(--text-muted)]">
                        The structure is simple on purpose: a workspace holds
                        projects, and projects hold tasks.
                    </p>
                </div>

                <Steps />
            </div>
        </section>
    );
}