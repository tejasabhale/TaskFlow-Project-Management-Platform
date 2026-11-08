import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
    ArrowRight,
    ArrowUpRight,
    CalendarDays,
    Check,
    ChevronDown,
    ChevronRight,
    CircleHelp,
    FileText,
    FolderKanban,
    LifeBuoy,
    ListTodo,
    LockKeyhole,
    Mail,
    MessageCircle,
    Search,
    ShieldCheck,
    UserRound,
    Users,
    X,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const CONTACT_EMAIL = "abhaletejas4@gmail.com";

/* =========================================================
   ANIMATION VARIANTS
========================================================= */

const fadeUp = {
    hidden: {
        opacity: 0,
        y: 22,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.09,
        },
    },
};

const faqItemVariants = {
    hidden: {
        opacity: 0,
        y: 12,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.35,
            ease: "easeOut",
        },
    },
};

/* =========================================================
   FAQ DATA
========================================================= */

const categories = [
    "All questions",
    "Getting started",
    "Workspaces",
    "Tasks & projects",
    "Account & security",
];

const categoryIcons = {
    "All questions": CircleHelp,
    "Getting started": LifeBuoy,
    Workspaces: Users,
    "Tasks & projects": ListTodo,
    "Account & security": ShieldCheck,
};

const faqData = [
    {
        id: "getting-started-1",
        category: "Getting started",
        question: "What is TaskFlow?",
        answer:
            "TaskFlow is a workspace-based project management platform that helps individuals and teams organize projects, manage tasks, track deadlines and collaborate from one place. It brings your everyday work into a structured and manageable workspace.",
        icon: FolderKanban,
    },
    {
        id: "getting-started-2",
        category: "Getting started",
        question: "How do I get started with TaskFlow?",
        answer:
            "Create an account using the registration page. After signing in, you can access your dashboard, create a workspace, organize projects and start adding tasks. You can gradually invite your team and build your workflow around your requirements.",
        icon: CircleHelp,
    },
    {
        id: "getting-started-3",
        category: "Getting started",
        question: "Do I need a separate workspace for every project?",
        answer:
            "No. A workspace can contain multiple related projects. You can organize your work by team, organization or purpose and keep different projects within the same workspace.",
        icon: FolderKanban,
    },
    {
        id: "workspaces-1",
        category: "Workspaces",
        question: "What is a workspace?",
        answer:
            "A workspace is a shared environment where a team can manage its projects, tasks and members. It provides a common place to organize work while keeping access and permissions structured.",
        icon: Users,
    },
    {
        id: "workspaces-2",
        category: "Workspaces",
        question: "How do I create a workspace?",
        answer:
            "Sign in to TaskFlow and open the Workspaces section. Use the Create Workspace option, enter the workspace details and complete the creation process. Available actions may depend on your account permissions.",
        icon: FolderKanban,
    },
    {
        id: "workspaces-3",
        category: "Workspaces",
        question: "Can I invite other people to my workspace?",
        answer:
            "Yes. Workspace owners and administrators can manage workspace membership and invite eligible team members. Members can access workspace information according to their assigned permissions.",
        icon: Users,
    },
    {
        id: "workspaces-4",
        category: "Workspaces",
        question: "What are the different workspace roles?",
        answer:
            "TaskFlow supports role-based workspace access. Owners have workspace-level control, administrators can manage permitted workspace operations, and members work with the projects and tasks available to them. Specific permissions depend on the role configuration.",
        icon: ShieldCheck,
    },
    {
        id: "tasks-1",
        category: "Tasks & projects",
        question: "How do I create a project?",
        answer:
            "Open the relevant workspace and navigate to its Projects section. Use the project creation option to enter a name and other available details. Once created, you can organize tasks under that project.",
        icon: FolderKanban,
    },
    {
        id: "tasks-2",
        category: "Tasks & projects",
        question: "Can I assign tasks to team members?",
        answer:
            "Yes. Workspace owners and administrators can manage task assignments where permitted. Members can view and manage tasks assigned to them according to their permissions.",
        icon: ListTodo,
    },
    {
        id: "tasks-3",
        category: "Tasks & projects",
        question: "Can I set deadlines for tasks?",
        answer:
            "Yes. Tasks can have due dates to help teams organize their work and track deadlines. You can also use the Calendar section to view scheduled tasks and keep track of upcoming work.",
        icon: CalendarDays,
    },
    {
        id: "tasks-4",
        category: "Tasks & projects",
        question: "Can I upload attachments to tasks?",
        answer:
            "TaskFlow supports task attachments where the feature is available. You can use attachments to associate relevant documents and files with your work. Upload availability may depend on file type, size and your access permissions.",
        icon: FileText,
    },
    {
        id: "tasks-5",
        category: "Tasks & projects",
        question: "Can I track the progress of my tasks?",
        answer:
            "Yes. Task statuses help you understand which items are waiting to be started, currently being worked on or completed. You can use project and task views to keep track of your team's progress.",
        icon: Check,
    },
    {
        id: "account-1",
        category: "Account & security",
        question: "How does TaskFlow manage account security?",
        answer:
            "TaskFlow uses authentication and role-based access controls to help protect accounts and workspace resources. You should also use a strong password, keep your credentials private and notify the team if you suspect unauthorized account access.",
        icon: LockKeyhole,
    },
    {
        id: "account-2",
        category: "Account & security",
        question: "What should I do if I cannot sign in?",
        answer:
            "First, check that your email address and password are correct. Use the password recovery option on the sign-in page if it is available. If you continue experiencing issues, contact our support email with a description of the problem. Never share your password.",
        icon: ShieldCheck,
    },
    {
        id: "account-3",
        category: "Account & security",
        question: "Can I request deletion of my account?",
        answer:
            "You can contact our team to request account deletion and the handling of associated personal information. Requests are subject to identity verification, applicable legal requirements and our Privacy Policy.",
        icon: UserRound,
    },
    {
        id: "account-4",
        category: "Account & security",
        question: "Where can I read about how my information is used?",
        answer:
            "Visit our Privacy Policy page to understand what information TaskFlow may collect, how it is used, how workspace access works and what privacy choices may be available to you.",
        icon: FileText,
        link: {
            label: "Read Privacy Policy",
            to: "/privacy",
        },
    },
];

/* =========================================================
   FAQ ACCORDION ITEM
========================================================= */

function FAQItem({
    item,
    index,
    isOpen,
    onToggle,
    reducedMotion,
}) {
    const Icon = item.icon;
    const answerId = `faq-answer-${item.id}`;

    return (
        <motion.article
            variants={faqItemVariants}
            layout={!reducedMotion}
            className={`border-b border-[var(--border)] last:border-b-0 ${isOpen ? "bg-[var(--surface-muted)]/60" : ""
                }`}
        >
            <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={onToggle}
                className="group flex min-h-[76px] w-full items-center gap-4 px-4 py-5 text-left transition-colors hover:bg-[var(--surface-muted)]/60 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--focus)]"
            >
                <span className="hidden w-7 shrink-0 font-mono text-[10px] font-semibold text-[var(--text-subtle)] sm:block">
                    {String(index + 1).padStart(2, "0")}
                </span>

                <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors"
                    style={{
                        backgroundColor: isOpen
                            ? "color-mix(in srgb, var(--primary) 13%, var(--surface))"
                            : "var(--surface-muted)",
                        color: isOpen
                            ? "var(--primary)"
                            : "var(--text-muted)",
                    }}
                >
                    <Icon size={17} strokeWidth={1.8} />
                </span>

                <span className="min-w-0 flex-1">
                    <span
                        className={`block text-sm font-semibold leading-6 transition-colors sm:text-[15px] ${isOpen
                            ? "text-[var(--primary)]"
                            : "text-[var(--text)]"
                            }`}
                    >
                        {item.question}
                    </span>

                    <span className="mt-1 block text-[10px] font-medium text-[var(--text-subtle)]">
                        {item.category}
                    </span>
                </span>

                <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition-colors group-hover:border-[var(--primary)] group-hover:text-[var(--primary)]"
                    style={
                        isOpen
                            ? {
                                borderColor: "var(--primary)",
                                color: "var(--primary)",
                            }
                            : undefined
                    }
                >
                    <motion.span
                        animate={{
                            rotate: isOpen ? 180 : 0,
                        }}
                        transition={{
                            duration: reducedMotion ? 0 : 0.25,
                            ease: "easeOut",
                        }}
                    >
                        <ChevronDown size={16} />
                    </motion.span>
                </span>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        id={answerId}
                        key="answer"
                        initial={
                            reducedMotion
                                ? { opacity: 1 }
                                : { height: 0, opacity: 0 }
                        }
                        animate={{
                            height: "auto",
                            opacity: 1,
                        }}
                        exit={{
                            height: reducedMotion ? "auto" : 0,
                            opacity: 0,
                        }}
                        transition={{
                            height: {
                                duration: reducedMotion ? 0 : 0.3,
                                ease: [0.22, 1, 0.36, 1],
                            },
                            opacity: {
                                duration: reducedMotion ? 0 : 0.2,
                            },
                        }}
                        className="overflow-hidden"
                    >
                        <div className="pb-6 pl-[4.25rem] pr-5 sm:pl-[6.75rem] sm:pr-8">
                            <p className="max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
                                {item.answer}
                            </p>

                            {item.link && (
                                <Link
                                    to={item.link.to}
                                    className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[var(--primary)] transition-colors hover:text-[var(--primary-hover)]"
                                >
                                    {item.link.label}
                                    <ArrowUpRight size={14} />
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.article>
    );
}

/* =========================================================
   FAQ PAGE
========================================================= */

export default function FAQ() {
    const pageRef = useRef(null);

    const [activeCategory, setActiveCategory] = useState("All questions");
    const [searchQuery, setSearchQuery] = useState("");
    const [openId, setOpenId] = useState(null);

    const reducedMotion = useReducedMotion();

    /* -----------------------------------------------------
       GSAP — INDIVIDUAL SCROLL REVEALS
    ----------------------------------------------------- */

    useEffect(() => {
        const page = pageRef.current;

        if (!page || reducedMotion) return;

        const context = gsap.context(() => {
            const elements = gsap.utils.toArray(
                "[data-faq-gsap]",
                page,
            );

            elements.forEach((element) => {
                gsap.fromTo(
                    element,
                    {
                        autoAlpha: 0,
                        y: 24,
                    },
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.65,
                        ease: "power3.out",
                        overwrite: "auto",
                        scrollTrigger: {
                            trigger: element,
                            start: "top 92%",
                            once: true,
                        },
                    },
                );
            });
        }, page);

        return () => context.revert();
    }, [reducedMotion]);

    /* -----------------------------------------------------
       FILTER FAQS
    ----------------------------------------------------- */

    const filteredFAQs = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return faqData.filter((item) => {
            const matchesCategory =
                activeCategory === "All questions" ||
                item.category === activeCategory;

            const matchesSearch =
                !query ||
                item.question.toLowerCase().includes(query) ||
                item.answer.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query);

            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchQuery]);

    /* -----------------------------------------------------
       EVENT HANDLERS
    ----------------------------------------------------- */

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        setOpenId(null);
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
        setOpenId(null);
    };

    const clearFilters = () => {
        setActiveCategory("All questions");
        setSearchQuery("");
        setOpenId(null);
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <main
            ref={pageRef}
            className="min-h-screen bg-[var(--background)] text-[var(--text)]"
        >
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8 lg:py-12">

                {/* =================================================
                    HERO SECTION (no container, sits on page background)
                ================================================= */}

                <motion.header
                    initial={reducedMotion ? false : "hidden"}
                    animate="visible"
                    variants={staggerContainer}
                    className="relative grid lg:grid-cols-[1fr_360px]"
                >
                    <motion.div
                        variants={fadeUp}
                        className="relative z-10 py-6 sm:py-8 lg:py-10 lg:pr-12"
                    >
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--primary)]">
                            <MessageCircle size={14} />
                            Help center
                        </div>

                        <h1 className="max-w-2xl text-3xl font-extrabold leading-[1.12] tracking-[-0.04em] min-[400px]:text-4xl sm:text-5xl sm:tracking-[-0.055em] lg:text-[58px]">
                            Questions?
                            <br />

                            <span style={{ color: "var(--primary)" }}>
                                We've got answers.
                            </span>
                        </h1>

                        <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">
                            Everything you need to know about using TaskFlow,
                            managing your workspace, organizing projects and
                            getting the most out of your team's workflow.
                        </p>

                        <motion.div
                            variants={fadeUp}
                            className="mt-8 flex flex-wrap items-center gap-3"
                        >
                            <a
                                href="#faq-list"
                                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-transparent bg-[var(--primary)] px-5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]"
                                style={{ color: "#ffffff" }}
                            >
                                Explore FAQs
                                <ArrowRight
                                    size={15}
                                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                                />
                            </a>

                            <a
                                href="/contact"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                            >
                                Contact support
                                <Mail size={14} />
                            </a>
                        </motion.div>
                    </motion.div>

                    {/* Overview panel: divider line only, no box */}

                    <motion.div
                        variants={fadeUp}
                        className="border-t border-[var(--border)] pt-8 lg:border-l lg:border-t-0 lg:py-10 lg:pl-10"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                                    Help at a glance
                                </p>

                                <h2 className="mt-1 text-lg font-bold tracking-tight">
                                    Find your way around.
                                </h2>
                            </div>

                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-xl"
                                style={{
                                    backgroundColor:
                                        "color-mix(in srgb, var(--primary) 10%, var(--surface))",
                                    color: "var(--primary)",
                                }}
                            >
                                <LifeBuoy size={19} />
                            </div>
                        </div>

                        <div className="space-y-0">
                            {[
                                {
                                    icon: FolderKanban,
                                    title: "Projects & tasks",
                                    description:
                                        "Organize projects and manage everyday work.",
                                },
                                {
                                    icon: Users,
                                    title: "Team collaboration",
                                    description:
                                        "Understand workspaces, members and roles.",
                                },
                                {
                                    icon: ShieldCheck,
                                    title: "Accounts & security",
                                    description:
                                        "Learn about account access and privacy.",
                                },
                            ].map((item, index) => {
                                const Icon = item.icon;

                                return (
                                    <motion.div
                                        key={item.title}
                                        initial={
                                            reducedMotion
                                                ? false
                                                : { opacity: 0, x: 15 }
                                        }
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                        }}
                                        transition={{
                                            duration: 0.4,
                                            delay: reducedMotion
                                                ? 0
                                                : 0.3 + index * 0.12,
                                        }}
                                        className={`flex gap-3 py-4 ${index !== 0
                                            ? "border-t border-[var(--border)]"
                                            : ""
                                            }`}
                                    >
                                        <div
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "color-mix(in srgb, var(--primary) 9%, var(--surface))",
                                                color: "var(--primary)",
                                            }}
                                        >
                                            <Icon size={17} />
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold">
                                                {item.title}
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                                                {item.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                </motion.header>

                {/* =================================================
                    FAQ MAIN SECTION
                ================================================= */}

                <section
                    id="faq-list"
                    className="mt-12 scroll-mt-24 sm:mt-16"
                >
                    {/* Section heading */}

                    <div
                        data-faq-gsap
                        className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
                    >
                        <div>
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                                Frequently asked questions
                            </p>

                            <h2 className="text-2xl font-extrabold tracking-[-0.045em] sm:text-3xl">
                                How can we help?
                            </h2>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
                                Browse common questions or search for
                                something specific.
                            </p>
                        </div>

                        <p className="text-xs text-[var(--text-subtle)]">
                            {filteredFAQs.length}{" "}
                            {filteredFAQs.length === 1
                                ? "answer"
                                : "answers"}{" "}
                            found
                        </p>
                    </div>

                    {/* Search */}

                    <div
                        data-faq-gsap
                        className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4"
                    >
                        <label
                            htmlFor="faq-search"
                            className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]"
                        >
                            Search the help center
                        </label>

                        <div className="flex min-h-12 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 transition-colors focus-within:border-[var(--primary)]">
                            <Search
                                size={18}
                                className="shrink-0 text-[var(--text-subtle)]"
                            />

                            <input
                                id="faq-search"
                                type="search"
                                value={searchQuery}
                                onChange={handleSearch}
                                placeholder="Search questions, features or topics..."
                                className="h-11 min-w-0 flex-1 border-0! bg-transparent! text-sm outline-none! ring-0! shadow-none!"
                            />

                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    aria-label="Clear search"
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--primary)]"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category filters */}

                    <div data-faq-gsap className="mt-6">
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
                            Browse by category
                        </p>

                        <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
                            <div className="flex min-w-max gap-2">
                                {categories.map((category) => {
                                    const Icon = categoryIcons[category];
                                    const isActive =
                                        activeCategory === category;

                                    return (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() =>
                                                handleCategoryChange(category)
                                            }
                                            aria-pressed={isActive}
                                            className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-4 text-xs font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] ${isActive
                                                ? "border-[var(--primary)]"
                                                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                                }`}
                                            style={
                                                isActive
                                                    ? {
                                                        backgroundColor:
                                                            "var(--primary)",
                                                        color: "#ffffff",
                                                        borderColor:
                                                            "var(--primary)",
                                                    }
                                                    : undefined
                                            }
                                        >
                                            <Icon size={14} />
                                            {category}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Accordion */}

                    <div
                        data-faq-gsap
                        className="mt-5 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
                    >
                        <AnimatePresence mode="wait">
                            {filteredFAQs.length > 0 ? (
                                <motion.div
                                    key={`${activeCategory}-${searchQuery}`}
                                    initial={
                                        reducedMotion
                                            ? false
                                            : { opacity: 0, y: 8 }
                                    }
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        y: -5,
                                    }}
                                    transition={{
                                        duration: reducedMotion ? 0 : 0.2,
                                    }}
                                >
                                    {filteredFAQs.map((item, index) => (
                                        <FAQItem
                                            key={item.id}
                                            item={item}
                                            index={index}
                                            isOpen={openId === item.id}
                                            reducedMotion={reducedMotion}
                                            onToggle={() =>
                                                setOpenId((current) =>
                                                    current === item.id
                                                        ? null
                                                        : item.id,
                                                )
                                            }
                                        />
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={
                                        reducedMotion
                                            ? false
                                            : { opacity: 0, y: 8 }
                                    }
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center px-6 py-16 text-center"
                                >
                                    <div
                                        className="flex h-12 w-12 items-center justify-center rounded-2xl"
                                        style={{
                                            backgroundColor:
                                                "color-mix(in srgb, var(--primary) 10%, var(--surface))",
                                            color: "var(--primary)",
                                        }}
                                    >
                                        <Search size={21} />
                                    </div>

                                    <h3 className="mt-5 text-base font-bold">
                                        No matching questions
                                    </h3>

                                    <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--text-muted)]">
                                        We couldn't find an answer matching
                                        your search. Try another keyword or
                                        explore a different category.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-4 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                    >
                                        Clear filters
                                        <X size={14} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* =================================================
                    CONTACT SUPPORT
                ================================================= */}

                <section
                    data-faq-gsap
                    className="mt-8 grid gap-6 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10"
                >
                    <div className="flex items-start gap-4">
                        <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                            style={{
                                backgroundColor:
                                    "color-mix(in srgb, var(--primary) 10%, var(--surface))",
                                color: "var(--primary)",
                            }}
                        >
                            <MessageCircle size={22} />
                        </div>

                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                                Still need help?
                            </p>

                            <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                                Can't find your answer?
                            </h2>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
                                Have a question that isn't covered here?
                                Reach out to our team and tell us how we
                                can help.
                            </p>
                        </div>
                    </div>

                    <a
                        href="/contact"
                        className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl px-6 text-sm font-semibold text-white transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]"
                        style={{
                            backgroundColor: "var(--primary)",
                            color: "#ffffff",
                        }}
                    >
                        Contact support

                        <ArrowUpRight
                            size={16}
                            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                    </a>
                </section>

                {/* =================================================
                    BOTTOM LINKS
                ================================================= */}

                <div
                    data-faq-gsap
                    className="mt-7 flex flex-col gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between"
                >
                    <p className="text-xs text-[var(--text-subtle)]">
                        Need more information about TaskFlow?
                    </p>

                    <div className="flex flex-wrap items-center gap-5">
                        <Link
                            to="/privacy"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]"
                        >
                            Privacy Policy
                            <ArrowUpRight size={12} />
                        </Link>

                        <Link
                            to="/terms"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]"
                        >
                            Terms & Conditions
                            <ArrowUpRight size={12} />
                        </Link>

                        <Link
                            to="/"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary-hover)]"
                        >
                            <ArrowRight size={13} />
                            Back to TaskFlow
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}