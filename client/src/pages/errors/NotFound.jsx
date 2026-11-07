import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Compass, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Go back if there is history, otherwise fall back to the dashboard
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/dashboard", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--text)]">
      {/* Brand bar */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-4 sm:h-16 sm:px-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-base font-extrabold tracking-tight !text-[var(--text)] sm:text-lg"
          >
            <img
              src="/taskflow-logo.svg"
              alt=""
              className="h-8 w-auto max-w-[3rem] object-contain"
              draggable="false"
            />
            TaskFlow
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
        <section
          aria-labelledby="not-found-title"
          className="card w-full max-w-lg p-6 text-center shadow-[var(--shadow-md)] sm:p-10"
        >
          <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary-text)] sm:h-16 sm:w-16">
            <Compass className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2} />
          </span>

          <p className="mb-2 text-sm font-semibold text-[var(--primary-text)]">
            Error 404
          </p>
          <h1
            id="not-found-title"
            className="mb-3 text-2xl font-extrabold tracking-tight sm:text-3xl"
          >
            Page not found
          </h1>
          <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
            The page you&rsquo;re looking for doesn&rsquo;t exist or may have
            been moved. Check the address or return to your workspace.
          </p>

          {/* Requested path */}
          <div className="mb-8 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-left">
            <p className="mb-0.5 text-xs font-semibold text-[var(--text-subtle)]">
              Requested address
            </p>
            <p className="break-all text-sm font-semibold text-[var(--text)]">
              {pathname}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleBack}
              className="btn-secondary inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back
            </button>
            <Link
              to="/dashboard"
              className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold !text-[var(--text-inverse)] hover:!text-[var(--text-inverse)] sm:w-auto"
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to dashboard
            </Link>
          </div>
        </section>
      </main>

      <footer className="px-4 pb-6 text-center text-xs text-[var(--text-subtle)]">
        &copy; {new Date().getFullYear()} TaskFlow
      </footer>
    </div>
  );
}