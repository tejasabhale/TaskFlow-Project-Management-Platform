import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { features } from "./aboutData";

gsap.registerPlugin(ScrollTrigger);

export default function Features() {
    const listRef = useRef(null);

    // one staggered reveal for the whole list (gsap)
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                return;
            }

            const items = gsap.utils.toArray("[data-feature]");
            gsap.set(items, { autoAlpha: 0, y: 24 });

            ScrollTrigger.create({
                trigger: listRef.current,
                start: "top 82%",
                once: true,
                onEnter: () =>
                    gsap.to(items, {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.7,
                        ease: "power3.out",
                        stagger: 0.08,
                    }),
            });
        }, listRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="border-t border-[var(--border)] bg-[var(--surface)] px-5 py-24 sm:px-8 sm:py-32">
            <div className="mx-auto max-w-7xl">
                <h2 className="max-w-2xl text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
                    What you can do in TaskFlow
                </h2>

                <ul ref={listRef} className="mt-12 border-t border-[var(--border)]">
                    {features.map((feature) => (
                        <li
                            key={feature.title}
                            data-feature
                            className="group relative grid gap-2 border-b border-[var(--border)] py-7 pl-0 transition-[padding] duration-300 hover:pl-5 sm:grid-cols-[1fr_1.4fr] sm:gap-10"
                        >
                            <span
                                aria-hidden="true"
                                className="absolute bottom-0 left-0 top-0 w-0.5 origin-top scale-y-0 transition-transform duration-300 group-hover:scale-y-100"
                                style={{ backgroundColor: "var(--primary)" }}
                            />
                            <h3 className="text-xl font-bold tracking-tight text-[var(--text)]">
                                {feature.title}
                            </h3>
                            <p className="max-w-xl text-base leading-7 text-[var(--text-muted)]">
                                {feature.description}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}