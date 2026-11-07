
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
    ArrowLeft,
    ArrowUpRight,
    Ban,
    ChevronRight,
    FileText,
    FolderKanban,
    KeyRound,
    Mail,
    RefreshCw,
    Scale,
    ShieldCheck,
    Upload,
    UserRound,
    AlertTriangle,
    Server,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const LAST_UPDATED = "7 November 2026";
const CONTACT_EMAIL = "abhaletejas4@gmail.com";

/* =========================================================
   FRAMER MOTION VARIANTS
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
    { id: "agreement", label: "Agreement to these terms" },
    { id: "eligibility", label: "Eligibility and accounts" },
    { id: "workspaces", label: "Workspaces and collaboration" },
    { id: "content", label: "Your content and ownership" },
    { id: "acceptable-use", label: "Acceptable use" },
    { id: "uploads", label: "Files and attachments" },
    { id: "third-party", label: "Third-party services" },
    { id: "availability", label: "Service availability" },
    { id: "payments", label: "Paid features" },
    { id: "termination", label: "Suspension and termination" },
    { id: "disclaimer", label: "Disclaimers" },
    { id: "liability", label: "Limitation of liability" },
    { id: "changes", label: "Changes to these terms" },
    { id: "contact", label: "Contact us" },
];

const overviewItems = [
    {
        icon: UserRound,
        title: "Your account",
        description: "Keep your account information accurate and secure.",
    },
    {
        icon: FolderKanban,
        title: "Your workspace",
        description: "Collaborate responsibly with your team.",
    },
    {
        icon: ShieldCheck,
        title: "Your responsibilities",
        description: "Use TaskFlow lawfully and respectfully.",
    },
];

const accountItems = [
    {
        title: "Accurate information",
        description:
            "Provide accurate and up-to-date information when creating and maintaining your account.",
    },
    {
        title: "Account security",
        description:
            "Keep your login credentials confidential and take reasonable steps to prevent unauthorized access.",
    },
    {
        title: "Account activity",
        description:
            "You are responsible for activity carried out through your account, subject to applicable law.",
    },
    {
        title: "Unauthorized access",
        description:
            "Notify us promptly if you suspect that your account has been compromised or accessed without permission.",
    },
];

const workspaceItems = [
    {
        title: "Workspace ownership",
        description:
            "Workspace owners may manage workspace settings, members, projects and permissions.",
    },
    {
        title: "Member permissions",
        description:
            "Your ability to view, create, edit or delete workspace content depends on your assigned role and permissions.",
    },
    {
        title: "Shared information",
        description:
            "Content shared within a workspace may be accessible to other members who have the necessary permissions.",
    },
    {
        title: "Invitations",
        description:
            "Only invite individuals who are authorized to access the relevant workspace and its information.",
    },
];

const acceptableUseItems = [
    {
        title: "No unlawful activity",
        description:
            "Do not use TaskFlow to engage in activities that violate applicable laws or regulations.",
    },
    {
        title: "No unauthorized access",
        description:
            "Do not attempt to access another person's account, workspace or information without authorization.",
    },
    {
        title: "No harmful activity",
        description:
            "Do not upload malware, distribute malicious code or interfere with the security and operation of the service.",
    },
    {
        title: "No service disruption",
        description:
            "Do not abuse application endpoints, overload infrastructure or attempt to disrupt the experience of other users.",
    },
    {
        title: "Respect others",
        description:
            "Do not use the platform to harass, threaten, impersonate or unlawfully harm others.",
    },
    {
        title: "No misuse",
        description:
            "Do not copy, reverse engineer, exploit or misuse the application except where applicable law permits it.",
    },
];

const userRightsItems = [
    {
        title: "Your ownership",
        description:
            "You retain ownership of the content you create or upload, to the extent you own the relevant rights.",
    },
    {
        title: "Permission to operate",
        description:
            "You grant TaskFlow a limited permission to host, store, process, display and transmit your content as necessary to provide the service.",
    },
    {
        title: "Your responsibility",
        description:
            "You must have the rights and permissions necessary to upload, share and use the content you provide.",
    },
    {
        title: "Content management",
        description:
            "You are responsible for managing your content and maintaining copies of important information where appropriate.",
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

function TermsSection({
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
                            Terms & conditions
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
            aria-label="Terms and conditions sections"
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
   TERMS PAGE
========================================================= */

export default function Terms() {
    const pageRef = useRef(null);
    const reducedMotion = useReducedMotion();

    /* -----------------------------------------------------
       GSAP — SCROLL REVEALS
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

    const motionInitial = reducedMotion ? false : "hidden";

    return (
        <main
            ref={pageRef}
            className="min-h-screen bg-[var(--background)] text-[var(--text)]"
        >
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8 lg:py-12">

                {/* =================================================
                    HERO — NO BREADCRUMB
                ================================================= */}

                <motion.header
                    initial={motionInitial}
                    animate="visible"
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
                            <Scale size={14} />
                            Legal / Terms
                        </div>

                        <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.12] tracking-[-0.055em] sm:text-5xl lg:text-[58px]">
                            Clear expectations.
                            <br />

                            <span style={{ color: "var(--primary)" }}>
                                Better collaboration.
                            </span>
                        </h1>

                        <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">
                            These terms explain the rules and responsibilities
                            that apply when you use TaskFlow. Please take a
                            moment to understand how the platform works and
                            what is expected from everyone.
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
                                14 sections
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
                                    How TaskFlow works.
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
                                <Scale size={19} />
                            </div>
                        </div>

                        <div className="space-y-0">
                            {overviewItems.map((item, index) => {
                                const Icon = item.icon;

                                return (
                                    <motion.div
                                        key={item.title}
                                        initial={
                                            reducedMotion
                                                ? false
                                                : { opacity: 0, x: 15 }
                                        }
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.45,
                                            delay: reducedMotion
                                                ? 0
                                                : 0.3 + index * 0.12,
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
                    whileInView="visible"
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
                            whileInView="visible"
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
                            whileInView="visible"
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
                                    Have a question?
                                </p>
                            </div>

                            <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                                Need help understanding these terms? Get in
                                touch with our team.
                            </p>

                            <a
                                href={`mailto:${CONTACT_EMAIL}`}
                                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline"
                            >
                                Contact us
                                <ArrowUpRight size={13} />
                            </a>
                        </motion.div>
                    </aside>

                    {/* Terms article */}

                    <div className="min-w-0">

                        {/* Introduction */}

                        <motion.div
                            initial={motionInitial}
                            whileInView="visible"
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
                                <FileText size={20} />
                            </div>

                            <div>
                                <h2 className="text-sm font-bold">
                                    Before you get started
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                                    By accessing or using TaskFlow, you agree
                                    to comply with these Terms and Conditions.
                                    If you do not agree with them, please do
                                    not use the platform.
                                </p>
                            </div>
                        </motion.div>

                        {/* Terms sections — GSAP */}

                        <article className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">

                            <TermsSection
                                id="agreement"
                                number="01"
                                title="Agreement to these terms"
                                description="These terms govern your access to and use of TaskFlow."
                                icon={FileText}
                            >
                                <p>
                                    TaskFlow is a project and task management
                                    platform designed to help individuals and
                                    teams organize work, manage projects and
                                    collaborate through shared workspaces.
                                </p>

                                <p>
                                    By creating an account, accessing the
                                    application or using its features, you
                                    acknowledge that you have read and agree
                                    to these Terms and Conditions and the
                                    applicable Privacy Policy.
                                </p>

                                <p>
                                    These terms apply to all users, including
                                    workspace owners, administrators and
                                    members.
                                </p>
                            </TermsSection>

                            <TermsSection
                                id="eligibility"
                                number="02"
                                title="Eligibility and accounts"
                                description="You are responsible for maintaining your account and its security."
                                icon={KeyRound}
                            >
                                <DetailList items={accountItems} />

                                <p className="mt-5">
                                    You must have the legal capacity required
                                    under applicable law to enter into a
                                    binding agreement to use TaskFlow. If you
                                    access the service on behalf of an
                                    organization, you must be authorized to
                                    accept these terms on its behalf.
                                </p>
                            </TermsSection>

                            <TermsSection
                                id="workspaces"
                                number="03"
                                title="Workspaces and collaboration"
                                description="Workspace features allow teams to organize and manage shared work."
                                icon={FolderKanban}
                            >
                                <DetailList items={workspaceItems} />

                                <p className="mt-5">
                                    Workspace owners and administrators are
                                    responsible for managing access appropriately
                                    and should review member permissions
                                    periodically.
                                </p>
                            </TermsSection>

                            <TermsSection
                                id="content"
                                number="04"
                                title="Your content and ownership"
                                description="You retain ownership of content you create or upload, subject to the rights of others."
                                icon={Upload}
                            >
                                <DetailList items={userRightsItems} />

                                <p className="mt-5">
                                    The permission granted to TaskFlow is
                                    limited to what is reasonably necessary
                                    to provide, maintain, secure and support
                                    the features you use. It does not transfer
                                    ownership of your content to TaskFlow.
                                </p>

                                <p>
                                    TaskFlow's software, interface, branding,
                                    design and other original platform
                                    materials remain the property of their
                                    respective rights holders and may not be
                                    reused without authorization.
                                </p>
                            </TermsSection>

                            <TermsSection
                                id="acceptable-use"
                                number="05"
                                title="Acceptable use"
                                description="Use TaskFlow responsibly and do not interfere with other users or the service."
                                icon={Ban}
                            >
                                <p>
                                    You agree not to use TaskFlow for activities
                                    that are unlawful, harmful, deceptive or
                                    unauthorized.
                                </p>

                                <DetailList items={acceptableUseItems} />

                                <p className="mt-5">
                                    We may investigate suspected violations and
                                    take reasonable action where necessary to
                                    protect the platform and its users.
                                </p>
                            </TermsSection>

                            <TermsSection
                                id="uploads"
                                number="06"
                                title="Files and attachments"
                                description="TaskFlow may allow you to upload documents and files to your workspace."
                                icon={Upload}
                            >
                                <p>
                                    You are responsible for ensuring that
                                    files you upload are lawful, appropriate
                                    and do not violate another person's
                                    intellectual property, privacy or other
                                    rights.
                                </p>

                                <p>
                                    Do not upload malicious files, harmful
                                    software or content intended to compromise
                                    the security of TaskFlow or its users.
                                </p>

                                <p>
                                    You should maintain independent copies
                                    of important files and information.
                                    Availability of uploaded files may depend
                                    on storage providers and service
                                    configuration.
                                </p>
                            </TermsSection>

                            <TermsSection
                                id="third-party"
                                number="07"
                                title="Third-party services"
                                description="Some features may depend on services and infrastructure provided by third parties."
                                icon={Server}
                            >
                                <p>
                                    TaskFlow may rely on external providers
                                    for infrastructure, hosting, database
                                    services, file storage, email delivery
                                    and other operational requirements.
                                </p>

                                <p>
                                    These third-party services may have
                                    their own terms, policies and availability
                                    conditions. Your use of an external service
                                    may be subject to its applicable terms.
                                </p>

                                <p>
                                    We are not responsible for the independent
                                    policies or operations of third-party
                                    providers, except to the extent required
                                    by applicable law.
                                </p>
                            </TermsSection>

                            <TermsSection
                                id="availability"
                                number="08"
                                title="Service availability and changes"
                                description="We aim to keep TaskFlow useful and accessible, but uninterrupted availability cannot be guaranteed."
                                icon={RefreshCw}
                            >
                                <p>
                                    TaskFlow may be updated, maintained,
                                    modified or temporarily unavailable due
                                    to technical issues, security requirements,
                                    maintenance or circumstances beyond our
                                    reasonable control.
                                </p>

                                <p>
                                    We may add, modify, suspend or discontinue
                                    features as the platform evolves. Where
                                    reasonably practicable, we will provide
                                    notice of significant changes.
                                </p>
                            </TermsSection>

                            <TermsSection
                                id="payments"
                                number="09"
                                title="Paid features"
                                description="Additional commercial terms may apply if paid plans or services are introduced."
                                icon={Scale}
                            >
                                <p>
                                    If TaskFlow offers paid features,
                                    subscriptions or other commercial
                                    services, their prices, billing frequency,
                                    applicable taxes and payment conditions
                                    will be presented separately before
                                    purchase.
                                </p>

                                <p>
                                    Any applicable cancellation, renewal,
                                    refund and billing rules will be provided
                                    at the relevant point of purchase or in
                                    additional service terms.
                                </p>

                                <p>
                                    Where additional paid-service terms
                                    conflict with these general terms, the
                                    specific terms will apply to the relevant
                                    paid service to the extent of that
                                    conflict.
                                </p>
                            </TermsSection>

                            <TermsSection
                                id="termination"
                                number="10"
                                title="Suspension and termination"
                                description="Access to TaskFlow may be restricted in certain circumstances."
                                icon={AlertTriangle}
                            >
                                <p>
                                    We may suspend, restrict or terminate
                                    access where reasonably necessary if a
                                    user violates these terms, creates a
                                    security risk, engages in unlawful
                                    activity or threatens the operation
                                    of the platform or other users.
                                </p>

                                <p>
                                    Where appropriate and legally permitted,
                                    we will attempt to provide notice and
                                    an opportunity to address the issue.
                                </p>

                                <p>
                                    You may stop using TaskFlow at any time.
                                    Account closure and related data handling
                                    are subject to the applicable Privacy
                                    Policy and legal obligations.
                                </p>
                            </TermsSection>

                            <TermsSection
                                id="disclaimer"
                                number="11"
                                title="Disclaimers"
                                description="TaskFlow is provided subject to applicable legal protections and limitations."
                                icon={ShieldCheck}
                            >
                                <p>
                                    To the extent permitted by applicable law,
                                    TaskFlow is provided on an as-available
                                    basis. We do not guarantee that every
                                    feature will always be uninterrupted,
                                    error-free or suitable for every
                                    particular purpose.
                                </p>

                                <p>
                                    TaskFlow is a productivity and project
                                    management tool. You remain responsible
                                    for decisions made using information
                                    stored in or generated through the
                                    application.
                                </p>

                                <p>
                                    Nothing in these terms excludes
                                    warranties or rights that cannot
                                    legally be excluded under applicable law.
                                </p>
                            </TermsSection>

                            <TermsSection
                                id="liability"
                                number="12"
                                title="Limitation of liability"
                                description="Liability is subject to applicable legal requirements."
                                icon={Scale}
                            >
                                <p>
                                    To the maximum extent permitted by
                                    applicable law, TaskFlow and its
                                    operators will not be liable for
                                    indirect, incidental, special or
                                    consequential losses arising from
                                    the use of or inability to use the
                                    platform.
                                </p>

                                <p>
                                    This may include loss of profits,
                                    business opportunities, data or
                                    goodwill, where such limitations
                                    are legally permitted.
                                </p>

                                <p>
                                    Nothing in these terms excludes
                                    liability that cannot be excluded
                                    or limited under applicable law,
                                    including liability for fraud or
                                    intentional wrongdoing where applicable.
                                </p>
                            </TermsSection>

                            <TermsSection
                                id="changes"
                                number="13"
                                title="Changes to these terms"
                                description="These terms may be revised as TaskFlow develops."
                                icon={RefreshCw}
                            >
                                <p>
                                    We may update these Terms and Conditions
                                    to reflect changes to the platform,
                                    business operations or applicable
                                    legal requirements.
                                </p>

                                <p>
                                    Updated terms will be published on
                                    this page with a revised last-updated
                                    date. Significant changes may be
                                    communicated through the application
                                    or other appropriate channels.
                                </p>

                                <p>
                                    Your continued use of TaskFlow after
                                    updated terms become effective will
                                    be subject to applicable law and
                                    any required acceptance process.
                                </p>
                            </TermsSection>

                            <TermsSection
                                id="contact"
                                number="14"
                                title="Contact us"
                                description="For questions about these terms, account responsibilities or platform usage, contact us."
                                icon={Mail}
                            >
                                <p>
                                    If you have questions, need clarification
                                    or want to raise a concern regarding
                                    these Terms and Conditions, please
                                    contact us.
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
                            </TermsSection>
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
                                        Thanks for being part of TaskFlow.
                                    </p>

                                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                                        Better work starts with better
                                        collaboration.
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
