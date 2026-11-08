import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import {
    CalendarClock,
    ChartNoAxesCombined,
    Check,
    FolderKanban,
    ListTodo,
    SlidersHorizontal,
    Target,
    Users,
} from "lucide-react";

const included = [
    {
        title: "Task management",
        description:
            "Set priorities, update statuses, and turn a long list into a clear plan.",
        icon: ListTodo,
    },
    {
        title: "Projects",
        description:
            "Break larger goals into tasks and keep project work in one workspace.",
        icon: FolderKanban,
    },
    {
        title: "Deadline tracking",
        description: "Keep due dates and upcoming work in view.",
        icon: CalendarClock,
    },
    {
        title: "Progress tracking",
        description:
            "See completed work and how you are moving toward your goals.",
        icon: ChartNoAxesCombined,
    },
    {
        title: "Prioritization",
        description: "Put your time into the tasks that move you forward.",
        icon: Target,
    },
    {
        title: "Workspaces and members",
        description: "Organize work by workspace and see who is part of it.",
        icon: Users,
    },
    {
        title: "Light and dark themes",
        description: "A clean interface that fits the way you like to work.",
        icon: SlidersHorizontal,
    },
];

const perks = ["No credit card needed", "No trial period", "No paid tiers"];

const questions = [
    {
        question: "Is anything locked behind a paid plan?",
        answer:
            "No. Every feature listed here is included for everyone who signs up.",
    },
    {
        question: "Do I need a credit card?",
        answer: "No. Create an account and start planning right away.",
    },
    {
        question: "How do I get started?",
        answer:
            "Create a free account, set up a workspace, and add your first project.",
    },
];

/** Headline line that slides up from behind a mask (animated by gsap below). */
function Line({ children }) {
    return (
        <span className="block overflow-hidden pb-[0.2em] -mb-[0.2em]">
            <span data-line className="block">
                {children}
            </span>
        </span>
    );
}

function CheckBadge() {
    return (
        <span
            aria-hidden="true"
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
            style={{
                backgroundColor: "var(--primary)",
                color: "var(--text-inverse)",
            }}
        >
            <Check size={10} strokeWidth={3.5} />
        </span>
    );
}

export default function Pricing() {
    const pageRef = useRef(null);

    // One page-load sequence: headline lines, then copy, with the plan content rising alongside.
    useLayoutEffect(() => {
        const root = pageRef.current;
        if (!root) return undefined;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return undefined;
        }

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.from("[data-line]", { yPercent: 110, duration: 0.9, stagger: 0.1 })
                .from(
                    "[data-pricing-fade]",
                    { opacity: 0, y: 16, duration: 0.65, stagger: 0.1, clearProps: "all" },
                    "-=0.5"
                )
                .from(
                    "[data-pricing-panel]",
                    { opacity: 0, y: 28, duration: 0.9, clearProps: "all" },
                    0.35
                );
        }, root);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={pageRef}
            id="pricing"
            aria-labelledby="pricing-heading"
            className="relative isolate flex min-h-[calc(100svh-4rem)] w-full items-center overflow-hidden border-b border-[var(--border)] bg-[var(--background)] py-12 text-[var(--text)] sm:py-16 lg:py-20"
        >
            {/* faint dot grid, fades out toward the edges */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 opacity-70 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_50%_30%,black,transparent_70%)]"
            />

            <div className="relative z-10 w-full px-5 sm:px-8 lg:px-12">
                {/* Heading */}
                <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
                    <h1
                        id="pricing-heading"
                        className="text-[32px] font-extrabold leading-[1.12] tracking-[-0.045em] min-[400px]:text-[40px] sm:text-5xl sm:leading-[1.05] sm:tracking-[-0.05em] lg:text-6xl"
                    >
                        <Line>Every feature</Line>
                        <Line>
                            is <span className="text-[var(--primary)]">free.</span>
                        </Line>
                    </h1>

                    <p
                        data-pricing-fade
                        className="mt-5 max-w-xl text-base leading-7 text-[var(--text-muted)] sm:mt-6 sm:text-lg sm:leading-8"
                    >
                        TaskFlow has one plan, and everything is in it. No trial clock, no
                        paid tiers, and no feature held back for later.
                    </p>
                </div>

                {/* Plan and features. One centered column on mobile and tablet, two columns on desktop. */}
                <div
                    data-pricing-panel
                    className="mx-auto mt-10 grid w-full max-w-2xl gap-10 sm:mt-14 lg:max-w-none lg:grid-cols-[0.78fr_1.22fr] lg:gap-0"
                >
                    {/* Plan */}
                    <div className="flex flex-col lg:pr-12">
                        <div className="flex items-center gap-2.5">
                            <img
                                src="/taskflow-logo.svg"
                                alt=""
                                aria-hidden="true"
                                className="h-6 w-auto shrink-0 object-contain"
                            />
                            <p className="text-sm font-bold text-[var(--text)]">
                                TaskFlow plan
                            </p>
                        </div>

                        <p className="mt-5 text-6xl font-extrabold leading-none tracking-[-0.05em] text-[var(--text)] sm:mt-6 sm:text-7xl">
                            Free
                        </p>

                        <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--text-muted)]">
                            One plan with everything included. Sign up, create a
                            workspace, and start planning.
                        </p>

                        <ul className="mt-6 space-y-2.5 border-t border-[var(--border)] pt-6 sm:mt-8">
                            {perks.map((perk) => (
                                <li
                                    key={perk}
                                    className="flex items-center gap-2.5 text-sm font-medium text-[var(--text)]"
                                >
                                    <CheckBadge />
                                    {perk}
                                </li>
                            ))}
                        </ul>

                        <Link
                            to="/register"
                            className="group relative mt-8 inline-flex min-h-12 w-full items-center justify-center overflow-hidden rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-7 py-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)] sm:w-auto sm:self-start lg:mt-auto"
                        >
                            {/* black fill slides up from the bottom on hover */}
                            <span
                                aria-hidden="true"
                                className="absolute inset-0 translate-y-full bg-black transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-0 motion-reduce:transition-none"
                            />
                            <span className="relative z-10 text-white transition-colors duration-300 ease-out group-hover:text-[var(--primary)] motion-reduce:transition-none">
                                Get Started Free
                            </span>
                        </Link>
                    </div>

                    {/* Included features */}
                    <div className="border-t border-[var(--border)] pt-10 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-base font-extrabold tracking-[-0.02em] text-[var(--text)] sm:text-lg">
                                Everything included
                            </h2>
                            <span className="shrink-0 rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--primary-text)]">
                                All free
                            </span>
                        </div>

                        <ul className="mt-2 divide-y divide-[var(--border)]">
                            {included.map(({ title, description, icon: Icon }) => (
                                <li
                                    key={title}
                                    className="flex min-w-0 items-center gap-3.5 py-4"
                                >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--primary)]">
                                        <Icon size={18} strokeWidth={1.8} />
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-bold text-[var(--text)]">
                                            {title}
                                        </h3>
                                        <p className="mt-0.5 text-[13px] leading-6 text-[var(--text-muted)]">
                                            {description}
                                        </p>
                                    </div>

                                    <CheckBadge />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Questions: stacked with dividers on mobile, three columns from md */}
                <div
                    data-pricing-fade
                    className="mx-auto mt-10 grid w-full max-w-2xl divide-y divide-[var(--border)] border-t border-[var(--border)] sm:mt-14 md:max-w-none md:grid-cols-3 md:divide-x md:divide-y-0"
                >
                    {questions.map(({ question, answer }) => (
                        <div
                            key={question}
                            className="py-6 md:px-8 md:first:pl-0 md:last:pr-0"
                        >
                            <h3 className="text-sm font-extrabold tracking-[-0.015em] text-[var(--text)]">
                                {question}
                            </h3>
                            <p className="mt-2 text-sm leading-7 text-[var(--text-muted)] md:max-w-xs">
                                {answer}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}