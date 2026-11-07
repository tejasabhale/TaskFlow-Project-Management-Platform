import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { Check, Mail, Send, User } from "lucide-react";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
import Magnetic from "../about/Magnetic";
import { EASE } from "../about/aboutData";
import { EMAIL, topics } from "./contactData";
import TopicPicker from "./TopicPicker";

const EMPTY = { name: "", email: "", message: "" };
const MAX_MESSAGE = 1000;

function validate(values) {
    const errors = {};
    if (!values.name.trim()) errors.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim()))
        errors.email = "Enter a valid email address.";
    if (values.message.trim().length < 10)
        errors.message = "Write at least 10 characters so we know how to help.";
    return errors;
}

/* ---------------------------- field building blocks ---------------------------- */

const boxBase =
    "relative rounded-xl border bg-[var(--background)] transition-[border-color] duration-200 focus-within:border-[var(--primary)]";

const inputBase =
    "w-full rounded-xl border-0 bg-transparent py-3.5 text-base text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]/70";

function Field({ id, label, error, icon: Icon, hint, children }) {
    return (
        <div data-field>
            <div className="mb-2 flex items-baseline justify-between gap-4">
                <label htmlFor={id} className="text-sm font-semibold text-[var(--text)]">
                    {label}
                </label>
                {hint}
            </div>

            <div
                className={`group ${boxBase} ${error ? "border-[#c2410c]" : "border-[var(--border)] hover:border-[var(--border-strong)]"
                    }`}
            >
                {Icon && (
                    <Icon
                        size={17}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors duration-200 group-focus-within:text-[var(--primary)]"
                    />
                )}
                {children}
            </div>

            <AnimatePresence initial={false}>
                {error && (
                    <motion.p
                        id={`${id}-error`}
                        role="alert"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 text-sm font-medium text-[#c2410c]"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ------------------------------------ form ------------------------------------ */

export default function ContactForm() {
    const reduce = usePrefersReducedMotion();
    const panelRef = useRef(null);
    const formRef = useRef(null);

    const [values, setValues] = useState(EMPTY);
    const [topic, setTopic] = useState(topics[0]);
    const [errors, setErrors] = useState({});
    const [sent, setSent] = useState(null); // holds what was sent, for the summary

    // fields settle in one after another on first load (gsap)
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                return;
            }

            gsap.from("[data-field]", {
                autoAlpha: 0,
                y: 20,
                duration: 0.65,
                ease: "power3.out",
                stagger: 0.08,
                delay: 0.65,
                clearProps: "all",
            });
        }, panelRef);

        return () => ctx.revert();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setValues((current) => ({ ...current, [name]: value }));
        if (errors[name]) {
            setErrors((current) => ({ ...current, [name]: undefined }));
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const nextErrors = validate(values);
        setErrors(nextErrors);

        const firstInvalid = Object.keys(nextErrors)[0];
        if (firstInvalid) {
            formRef.current?.elements[firstInvalid]?.focus();
            return;
        }

        // No backend endpoint yet, so open the visitor's email app with the message filled in.
        const subject = `[TaskFlow] ${topic} from ${values.name.trim()}`;
        const body = `${values.message.trim()}\n\nFrom: ${values.name.trim()} <${values.email.trim()}>`;

        window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(
            subject
        )}&body=${encodeURIComponent(body)}`;

        setSent({ subject, message: values.message.trim() });
    };

    const reset = () => {
        setValues(EMPTY);
        setErrors({});
        setTopic(topics[0]);
        setSent(null);
    };

    return (
        <motion.div
            ref={panelRef}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
            className="w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
        >
            {/* compose-window header: shows exactly where the message goes */}
            <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-6 py-4 sm:px-8">
                <div className="flex items-center gap-2.5">
                    <span
                        className="flex h-6 w-6 items-center justify-center rounded-md"
                        style={{ backgroundColor: "var(--primary)", color: "#ffffff" }}
                    >
                        <Mail size={13} />
                    </span>
                    <span className="text-sm font-bold text-[var(--text)]">New message</span>
                </div>
                <p className="truncate text-xs text-[var(--text-muted)]">
                    To: <span className="font-semibold text-[var(--text)]">{EMAIL}</span>
                </p>
            </div>

            <AnimatePresence mode="wait" initial={false}>
                {sent ? (
                    <motion.div
                        key="sent"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="px-6 py-10 sm:px-8 sm:py-12"
                    >
                        <div className="flex items-start gap-4">
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 16, delay: 0.1 }}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                                style={{ backgroundColor: "var(--primary)", color: "#ffffff" }}
                            >
                                <Check size={22} strokeWidth={3} />
                            </motion.span>

                            <div>
                                <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text)]">
                                    Your message is ready to send
                                </h2>
                                <p className="mt-2 max-w-md text-base leading-7 text-[var(--text-muted)]">
                                    Your email app should open with everything filled
                                    in. Press send there to finish. If nothing opened,
                                    email us at{" "}
                                    <a
                                        href={`mailto:${EMAIL}`}
                                        className="font-bold text-[var(--text)] underline underline-offset-4 hover:text-[var(--primary)]"
                                    >
                                        {EMAIL}
                                    </a>
                                    .
                                </p>
                            </div>
                        </div>

                        {/* what was prepared */}
                        <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--background)] p-5">
                            <p className="text-sm font-bold text-[var(--text)]">{sent.subject}</p>
                            <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-[var(--text-muted)]">
                                {sent.message}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={reset}
                            className="mt-6 rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-bold text-[var(--text)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                        >
                            Write another message
                        </button>
                    </motion.div>
                ) : (
                    <motion.form
                        key="form"
                        ref={formRef}
                        noValidate
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="space-y-6 px-6 py-7 sm:px-8 sm:py-8">
                            <div data-field>
                                <p className="mb-3 text-sm font-semibold text-[var(--text)]">
                                    What is this about?
                                </p>
                                <TopicPicker value={topic} onChange={setTopic} />
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <Field id="name" label="Name" icon={User} error={errors.name}>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        value={values.name}
                                        onChange={handleChange}
                                        aria-invalid={!!errors.name}
                                        aria-describedby={errors.name ? "name-error" : undefined}
                                        placeholder="Your name"
                                        className={`${inputBase} pl-11 pr-4`}
                                    />
                                </Field>

                                <Field id="email" label="Email" icon={Mail} error={errors.email}>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={values.email}
                                        onChange={handleChange}
                                        aria-invalid={!!errors.email}
                                        aria-describedby={errors.email ? "email-error" : undefined}
                                        placeholder="you@example.com"
                                        className={`${inputBase} pl-11 pr-4`}
                                    />
                                </Field>
                            </div>

                            <Field
                                id="message"
                                label="Message"
                                error={errors.message}
                                hint={
                                    <span className="text-xs tabular-nums text-[var(--text-muted)]">
                                        {values.message.length}/{MAX_MESSAGE}
                                    </span>
                                }
                            >
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={6}
                                    maxLength={MAX_MESSAGE}
                                    value={values.message}
                                    onChange={handleChange}
                                    aria-invalid={!!errors.message}
                                    aria-describedby={errors.message ? "message-error" : undefined}
                                    placeholder="Tell us what you need"
                                    className={`${inputBase} resize-none px-4`}
                                />
                            </Field>
                        </div>

                        {/* action bar */}
                        <div
                            data-field
                            className="flex flex-col-reverse gap-4 border-t border-[var(--border)] bg-[var(--background)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8"
                        >
                            <p className="max-w-[17rem] text-xs leading-5 text-[var(--text-muted)]">
                                This opens your email app with the message filled in.
                            </p>

                            <Magnetic>
                                <button
                                    type="submit"
                                    style={{ backgroundColor: "var(--primary)", color: "#ffffff" }}
                                    className="group inline-flex w-full items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] sm:w-auto"
                                >
                                    Send message
                                    <Send
                                        size={16}
                                        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1"
                                    />
                                </button>
                            </Magnetic>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </motion.div>
    );
}