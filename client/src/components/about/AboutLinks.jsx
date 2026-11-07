import { Link } from "react-router-dom";

export default function AboutLinks() {
    return (
        <section className="px-5 pb-10 sm:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-[var(--border)] pt-7 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-[var(--text-muted)]">
                    Looking for something specific?
                </p>

                <div className="flex flex-wrap items-center gap-5 text-xs font-semibold text-[var(--text-muted)]">
                    <Link to="/faq" className="transition-colors hover:text-[var(--primary)]">
                        FAQs
                    </Link>
                    <Link to="/privacy" className="transition-colors hover:text-[var(--primary)]">
                        Privacy Policy
                    </Link>
                    <Link to="/terms" className="transition-colors hover:text-[var(--primary)]">
                        Terms &amp; Conditions
                    </Link>
                </div>
            </div>
        </section>
    );
}