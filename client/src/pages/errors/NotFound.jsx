import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface-muted)] text-[var(--primary)]">
        <HelpCircle size={32} />
      </div>

      <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--text)] sm:text-4xl">
        404 — Page Not Found
      </h1>

      <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">
        The page you are looking for doesn't exist or has been moved to another route in TaskFlow.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-xs font-bold text-white hover:opacity-90 transition-opacity"
        >
          <ArrowLeft size={15} />
          <span>Go to Dashboard</span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] transition-colors"
        >
          <span>Homepage</span>
        </Link>
      </div>
    </div>
  );
}
