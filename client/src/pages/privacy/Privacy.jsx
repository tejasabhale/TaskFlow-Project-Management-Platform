
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
    ArrowLeft,
    ArrowUpRight,
    ChevronRight,
    Cookie,
    Database,
    FileText,
    FolderKanban,
    LockKeyhole,
    Mail,
    RefreshCw,
    Share2,
    ShieldCheck,
    UserRound,
    UserRoundCheck,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const LAST_UPDATED = "7 November 2026";
const CONTACT_EMAIL = "abhaletejas4@gmail.com";

/* =========================================================
   ANIMATION VARIANTS — FRAMER MOTION
========================================================= */

const fadeUp = {
    hidden: {
        opacity: 0,
        y: 24,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const fadeLeft = {
    hidden: {
        opacity: 0,
        x: 20,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
        },
    },
};

/* =========================================================
   PAGE DATA
========================================================= */

const sections = [
    { id: "information", label: "Information we collect" },
    { id: "usage", label: "How we use information" },
    { id: "workspaces", label: "Workspace visibility" },
    { id: "cookies", label: "Cookies and sessions" },
    { id: "sharing", label: "Information sharing" },
    { id: "retention", label: "Data retention" },
    { id: "security", label: "Data security" },
    { id: "rights", label: "Your privacy choices" },
    { id: "changes", label: "Policy updates" },
    { id: "contact", label: "Contact us" },
];

const overviewItems = [
    {
        icon: UserRound,
        title: "Account information",
        description: "Registration and authentication details.",
    },
    {
        icon: FolderKanban,
        title: "Workspace content",
        description: "Projects, tasks, comments and attachments.",
    },
    {
        icon: LockKeyhole,
        title: "Account access",
        description: "Sessions, permissions and security.",
    },
];

const collectItems = [
    {
        title: "Account information",
        description:
            "Your name, email address and authentication-related information when you register or use your account.",
    },
    {
        title: "Workspace information",
        description:
            "Workspace names, members, projects, tasks, descriptions, assignments, due dates and other content you create.",
    },
    {
        title: "Uploaded content",
        description:
            "Files and attachments that you voluntarily upload to your tasks and projects.",
    },
    {
        title: "Technical information",
        description:
            "Information such as browser details, device information, IP addresses and server logs where collected.",
    },
    {
        title: "Support communications",
        description:
            "Messages and information you provide when contacting us for help or feedback.",
    },
];

const usageItems = [
    {
        title: "Provide core functionality",
        description:
            "Create accounts, manage workspaces, organize projects and support team collaboration.",
    },
    {
        title: "Authenticate users",
        description:
            "Verify account access and maintain secure sessions.",
    },
    {
        title: "Send communications",
        description:
            "Respond to support requests and deliver necessary account-related notifications.",
    },
    {
        title: "Maintain security",
        description:
            "Identify suspicious activity and help prevent unauthorized access.",
    },
    {
        title: "Improve the application",
        description:
            "Troubleshoot technical issues and improve application reliability and usability.",
    },
];

const sharingItems = [
    {
        title: "Workspace members",
        description:
            "People who have authorized access to the relevant workspace or project.",
    },
    {
        title: "Service providers",
        description:
            "Hosting, database, email and file-storage providers where necessary to operate the service.",
    },
    {
        title: "Legal requirements",
        description:
            "Where disclosure is required by applicable laws or valid legal processes.",
    },
    {
        title: "Protection of rights",
        description:
            "Where reasonably necessary to protect users, the application or its legal rights.",
    },
];

const rightsItems = [
    {
        title: "Access",
        description:
            "Request information about the personal data associated with your account.",
    },
    {
        title: "Correction",
        description:
            "Request corrections to inaccurate or incomplete personal information.",
    },
    {
        title: "Deletion",
        description:
            "Request deletion of your personal information, subject to applicable requirements.",
    },
    {
        title: "Clarification",
        description:
            "Ask questions about how your information is collected, used or shared.",
    },
];

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function DetailList({ items }) {
    return (
        <ul className="mt-5 space-y-4">
            {items.map((item) => (
                <li key={item.title} className="flex gap-3">
                    <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: "var(--primary)" }}
                    />

                    <p className="text-sm leading-7 text-[var(--text-muted)]">
                        <strong className="font-semibold text-[var(--text)]">
                            {item.title}.
                        </strong>{" "}
                        {item.description}
                    </p>
                </li>
            ))}
        </ul>
    );
}

function PolicySection({
    id,
    number,
    title,
    description,
    icon: Icon,
    children,
}) {
    return (
        <section
            id={id}
            data-gsap-reveal
            className="scroll-mt-28 border-b border-[var(--border)] px-5 py-7 last:border-b-0 sm:px-8 sm:py-9"
        >
            <div className="flex items-start gap-4">
                <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                        backgroundColor:
                            "color-mix(in srgb, var(--primary) 10%, var(--surface))",
                        color: "var(--primary)",
                    }}
                >
                    <Icon size={19} strokeWidth={1.8} />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                        <span
                            className="font-mono text-[10px] font-semibold tracking-wider"
                            style={{ color: "var(--primary)" }}
                        >
                            {number}
                        </span>

                        <span className="h-px w-5 bg-[var(--border-strong)]" />

                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
                            Privacy policy
                        </span>
                    </div>

                    <h2 className="text-lg font-bold tracking-tight text-[var(--text)] sm:text-xl">
                        {title}
                    </h2>

                    {description && (
                        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                            {description}
                        </p>
                    )}

                    <div className="mt-3 space-y-4 text-sm leading-7 text-[var(--text-muted)]">
                        {children}
                    </div>
                </div>
            </div>
        </section>
    );
}

function TableOfContents({ mobile = false }) {
    return (
        <nav
            aria-label="Privacy policy sections"
            className={
                mobile
                    ? "flex min-w-max gap-2"
                    : "flex flex-col gap-1"
            }
        >
            {sections.map((section, index) => (
                <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={
                        mobile
                            ? "inline-flex min-h-9 items-center whitespace-nowrap rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-medium text-[var(--text-muted)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                            : "group flex min-h-9 items-center gap-3 rounded-lg px-3 py-2 text-xs text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--primary)]"
                    }
                >
                    {!mobile && (
                        <span className="font-mono text-[10px] text-[var(--text-subtle)]">
                            {String(index + 1).padStart(2, "0")}
                        </span>
                    )}

                    {section.label}

                    {mobile && (
                        <ChevronRight
                            size={12}
                            className="ml-1 opacity-50"
                        />
                    )}
                </a>
            ))}
        </nav>
    );
}

/* =========================================================
   PRIVACY PAGE
========================================================= */

export default function Privacy() {
    const pageRef = useRef(null);
    const reducedMotion = useReducedMotion();

    /* -----------------------------------------------------
       GSAP — SCROLL REVEAL
    ----------------------------------------------------- */

    useEffect(() => {
        const page = pageRef.current;

        if (!page || reducedMotion) return;

        const context = gsap.context(() => {
            const elements = gsap.utils.toArray(
                "[data-gsap-reveal]",
                page,
            );

            elements.forEach((element, index) => {
                gsap.fromTo(
                    element,
                    {
                        autoAlpha: 0,
                        y: 26,
                    },
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.7,
                        delay: index % 2 === 0 ? 0 : 0.04,
                        ease: "power3.out",
                        overwrite: "auto",
                        scrollTrigger: {
                            trigger: element,
                            start: "top 89%",
                            once: true,
                        },
                    },
                );
            });
        }, page);

        return () => context.revert();
    }, [reducedMotion]);

    /* -----------------------------------------------------
       FRAMER MOTION SETTINGS
    ----------------------------------------------------- */

    const motionInitial = reducedMotion ? false : "hidden";
    const motionVisible = reducedMotion ? "visible" : "visible";

    return (
        <main
            ref={pageRef}
            className="min-h-screen bg-[var(--background)] text-[var(--text)]"
        >
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8 lg:py-12">

                {/* =================================================
                    HERO SECTION — FRAMER MOTION
                ================================================= */}

                <motion.header
                    initial={motionInitial}
                    animate={motionVisible}
                    variants={staggerContainer}
                    className="relative grid overflow-hidden rounded-3xl border border-[var(--border)] lg:grid-cols-[1fr_360px]"
                    style={{
                        backgroundColor:
                            "color-mix(in srgb, var(--primary) 6%, var(--surface))",
                    }}
                >
                    <motion.div
                        variants={fadeUp}
                        className="relative z-10 px-6 py-9 sm:px-10 sm:py-12 lg:py-14"
                    >
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--primary)]">
                            <ShieldCheck size={14} />
                            Trust & transparency
                        </div>

                        <h1 className="max-w-2xl text-3xl font-extrabold leading-[1.12] tracking-[-0.04em] min-[400px]:text-4xl sm:text-5xl sm:tracking-[-0.055em] lg:text-[58px]">
                            Your work matters.
                            <br />

                            <span style={{ color: "var(--primary)" }}>
                                Your privacy does too.
                            </span>
                        </h1>

                        <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">
                            Understand what information TaskFlow handles,
                            why it is used, and the choices available to you.
                            Everything you need to know, in one place.
                        </p>

                        <div className="mt-7 flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-muted)]">
                                <FileText
                                    size={14}
                                    style={{ color: "var(--primary)" }}
                                />
                                Last updated: {LAST_UPDATED}
                            </span>

                            <span className="text-xs text-[var(--text-subtle)]">
                                10 policy sections
                            </span>
                        </div>
                    </motion.div>

                    {/* Overview panel */}

                    <motion.div
                        variants={fadeLeft}
                        className="border-t border-[var(--border)] bg-[var(--surface)]/70 p-6 sm:p-8 lg:border-l lg:border-t-0"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                                    At a glance
                                </p>

                                <h2 className="mt-1 text-lg font-bold tracking-tight">
                                    Your data, explained.
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
                                <LockKeyhole size={19} />
                            </div>
                        </div>

                        <div className="space-y-0">
                            {overviewItems.map((item, index) => {
                                const Icon = item.icon;

                                return (
                                    <motion.div
                                        key={item.title}
                                        initial={reducedMotion ? false : { opacity: 0, x: 15 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.45,
                                            delay: reducedMotion ? 0 : 0.3 + index * 0.12,
                                            ease: "easeOut",
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
                                            <p className="text-sm font-semibold text-[var(--text)]">
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
                    MOBILE TABLE OF CONTENTS
                ================================================= */}

                <motion.div
                    initial={motionInitial}
                    whileInView={reducedMotion ? undefined : "visible"}
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="mt-7 lg:hidden"
                >
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
                        Jump to section
                    </p>

                    <div className="-mx-4 overflow-x-auto px-4 pb-2">
                        <TableOfContents mobile />
                    </div>
                </motion.div>

                {/* =================================================
                    MAIN CONTENT
                ================================================= */}

                <div className="mt-8 grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">

                    {/* Desktop sidebar */}

                    <aside className="sticky top-24 hidden lg:block">
                        <motion.div
                            initial={motionInitial}
                            whileInView={reducedMotion ? undefined : "visible"}
                            viewport={{ once: true }}
                            variants={fadeUp}
                            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
                        >
                            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-subtle)]">
                                On this page
                            </p>

                            <TableOfContents />
                        </motion.div>

                        <motion.div
                            initial={motionInitial}
                            whileInView={reducedMotion ? undefined : "visible"}
                            viewport={{ once: true }}
                            variants={fadeUp}
                            transition={{ delay: 0.1 }}
                            className="mt-4 rounded-2xl border p-4"
                            style={{
                                borderColor:
                                    "color-mix(in srgb, var(--primary) 18%, var(--border))",
                                backgroundColor:
                                    "color-mix(in srgb, var(--primary) 7%, var(--surface))",
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <Mail
                                    size={16}
                                    style={{ color: "var(--primary)" }}
                                />

                                <p className="text-xs font-bold">
                                    Need help?
                                </p>
                            </div>

                            <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                                Have a question about your personal
                                information? Contact our team.
                            </p>

                            <a
                                href={`mailto:${CONTACT_EMAIL}`}
                                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline"
                            >
                                Get in touch
                                <ArrowUpRight size={13} />
                            </a>
                        </motion.div>
                    </aside>

                    {/* Policy article */}

                    <div className="min-w-0">

                        {/* Introduction */}

                        <motion.div
                            initial={motionInitial}
                            whileInView={reducedMotion ? undefined : "visible"}
                            viewport={{ once: true }}
                            variants={fadeUp}
                            className="mb-5 flex gap-4 rounded-2xl border p-5 sm:p-6"
                            style={{
                                borderColor:
                                    "color-mix(in srgb, var(--primary) 18%, var(--border))",
                                backgroundColor:
                                    "color-mix(in srgb, var(--primary) 6%, var(--surface))",
                            }}
                        >
                            <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                style={{
                                    backgroundColor:
                                        "color-mix(in srgb, var(--primary) 12%, var(--surface))",
                                    color: "var(--primary)",
                                }}
                            >
                                <ShieldCheck size={20} />
                            </div>

                            <div>
                                <h2 className="text-sm font-bold">
                                    About this policy
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                                    This Privacy Policy describes how TaskFlow
                                    may collect, use, store and share
                                    information when you access or use the
                                    platform. Please read it carefully.
                                </p>
                            </div>
                        </motion.div>

                        {/* Privacy sections — GSAP ScrollTrigger */}

                        <article className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">

                            <PolicySection
                                id="information"
                                number="01"
                                title="Information we collect"
                                description="The information we handle depends on how you use TaskFlow and which features you access."
                                icon={Database}
                            >
                                <DetailList items={collectItems} />
                            </PolicySection>

                            <PolicySection
                                id="usage"
                                number="02"
                                title="How we use information"
                                description="Information may be used for the following purposes:"
                                icon={FolderKanban}
                            >
                                <DetailList items={usageItems} />
                            </PolicySection>

                            <PolicySection
                                id="workspaces"
                                number="03"
                                title="Workspace visibility"
                                description="TaskFlow is designed to help people collaborate."
                                icon={UserRound}
                            >
                                <p>
                                    Information added to a shared workspace
                                    may be visible to other members who have
                                    permission to access that workspace.
                                </p>

                                <p>
                                    Workspace owners and administrators may
                                    have additional permissions to manage
                                    members, projects and tasks.
                                </p>

                                <p>
                                    Review workspace membership and access
                                    permissions before sharing files or
                                    other information.
                                </p>
                            </PolicySection>

                            <PolicySection
                                id="cookies"
                                number="04"
                                title="Cookies and sessions"
                                description="Cookies and browser storage may be used to support essential application functionality."
                                icon={Cookie}
                            >
                                <p>
                                    TaskFlow may use authentication cookies
                                    and similar browser storage to maintain
                                    user sessions, remember necessary
                                    application state and help protect
                                    account access.
                                </p>

                                <p>
                                    Blocking essential cookies or browser
                                    storage may affect your ability to sign
                                    in or use certain features.
                                </p>
                            </PolicySection>

                            <PolicySection
                                id="sharing"
                                number="05"
                                title="Information sharing"
                                description="Information may be shared where necessary for operating the service or meeting applicable obligations."
                                icon={Share2}
                            >
                                <DetailList items={sharingItems} />

                                <p className="mt-5">
                                    TaskFlow does not sell personal information.
                                    Service providers should only receive
                                    information necessary to perform their
                                    services.
                                </p>
                            </PolicySection>

                            <PolicySection
                                id="retention"
                                number="06"
                                title="Data retention"
                                description="Information is retained for legitimate service and operational purposes."
                                icon={Database}
                            >
                                <p>
                                    Retention periods may depend on the type
                                    of information, account status, security
                                    requirements and applicable legal
                                    obligations.
                                </p>

                                <p>
                                    You can contact us to request account or
                                    personal information deletion. Certain
                                    records may need to be retained where
                                    required by law or for legitimate
                                    security purposes.
                                </p>
                            </PolicySection>

                            <PolicySection
                                id="security"
                                number="07"
                                title="Data security"
                                description="Protecting account information and workspace content is important."
                                icon={ShieldCheck}
                            >
                                <p>
                                    We take reasonable technical and
                                    organizational measures intended to
                                    protect information against unauthorized
                                    access, alteration, disclosure and
                                    destruction.
                                </p>

                                <p>
                                    However, no internet-based service or
                                    electronic storage method can guarantee
                                    complete security. You should use a
                                    strong password and keep your account
                                    credentials confidential.
                                </p>
                            </PolicySection>

                            <PolicySection
                                id="rights"
                                number="08"
                                title="Your privacy choices"
                                description="Depending on your location and applicable privacy laws, you may have the following rights:"
                                icon={UserRoundCheck}
                            >
                                <DetailList items={rightsItems} />

                                <p className="mt-5">
                                    To make a privacy-related request, contact
                                    us through the email address below. We
                                    may need to verify your identity before
                                    processing certain requests.
                                </p>
                            </PolicySection>

                            <PolicySection
                                id="changes"
                                number="09"
                                title="Policy updates"
                                description="Our privacy practices may evolve as TaskFlow develops."
                                icon={RefreshCw}
                            >
                                <p>
                                    We may update this policy when our
                                    features, data practices or legal
                                    requirements change.
                                </p>

                                <p>
                                    Updated versions will be published on
                                    this page with a revised last-updated
                                    date. We encourage you to review this
                                    page periodically.
                                </p>
                            </PolicySection>

                            <PolicySection
                                id="contact"
                                number="10"
                                title="Contact us"
                                description="Questions, concerns or requests about your information are welcome."
                                icon={Mail}
                            >
                                <p>
                                    Contact us if you need clarification
                                    about this policy or want to submit a
                                    privacy-related request.
                                </p>

                                <a
                                    href={`mailto:${CONTACT_EMAIL}`}
                                    className="group mt-3 inline-flex min-h-11 items-center gap-3 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                >
                                    <Mail size={16} />

                                    {CONTACT_EMAIL}

                                    <ArrowUpRight
                                        size={14}
                                        className="text-[var(--text-subtle)] transition-colors group-hover:text-[var(--primary)]"
                                    />
                                </a>
                            </PolicySection>
                        </article>

                        {/* =================================================
                            CLOSING SECTION — GSAP
                        ================================================= */}

                        <div
                            data-gsap-reveal
                            className="mt-5 flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                    style={{
                                        backgroundColor:
                                            "color-mix(in srgb, var(--primary) 9%, var(--surface))",
                                        color: "var(--primary)",
                                    }}
                                >
                                    <ShieldCheck size={19} />
                                </div>

                                <div>
                                    <p className="text-sm font-bold">
                                        Thank you for using TaskFlow.
                                    </p>

                                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                                        Your work deserves a thoughtful
                                        workspace.
                                    </p>
                                </div>
                            </div>

                            <Link
                                to="/"
                                className="inline-flex min-h-10 items-center gap-2 self-start rounded-lg border border-[var(--border)] px-4 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] sm:self-auto"
                            >
                                <ArrowLeft size={14} />
                                Back to TaskFlow
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
