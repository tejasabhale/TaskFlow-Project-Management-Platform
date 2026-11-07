import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Paragraph whose words light up as you scroll past it (gsap + ScrollTrigger). */
export default function ScrollWords({ text, className = "" }) {
    const ref = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const words = gsap.utils.toArray("[data-word]");

            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(words, { opacity: 1 });
                return;
            }

            gsap.fromTo(
                words,
                { opacity: 0.18 },
                {
                    opacity: 1,
                    ease: "none",
                    stagger: 0.12,
                    scrollTrigger: {
                        trigger: ref.current,
                        start: "top 80%",
                        end: "bottom 50%",
                        scrub: true,
                    },
                }
            );
        }, ref);

        return () => ctx.revert();
    }, []);

    return (
        <p ref={ref} className={className}>
            {text.split(" ").map((word, i) => (
                <span
                    key={`${word}-${i}`}
                    data-word
                    className="mr-[0.25em] inline-block"
                >
                    {word}
                </span>
            ))}
        </p>
    );
}