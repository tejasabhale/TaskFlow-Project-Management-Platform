import { Inbox } from "lucide-react";

/**
 * Empty state for lists, tables and boards.
 *
 * - icon:            lucide icon component (default Inbox)
 * - title:           short headline
 * - description:     one or two sentences on what to do next
 * - action:          primary call to action (a button or link element)
 * - secondaryAction: optional quieter action beside it
 * - compact:         tighter version for small panels and cards
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description = "Items you create will appear here.",
  action,
  secondaryAction,
  compact = false,
}) {
  return (
    <div
      className={`relative isolate flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] text-center ${compact ? "min-h-48 px-5 py-8" : "min-h-72 px-6 py-12 sm:px-10"
        }`}
    >
      {/* faint dot grid, fades out toward the edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />

      {/* Icon tile with a soft halo */}
      <span
        aria-hidden="true"
        className={`relative flex items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--background)] text-[var(--primary)] ${compact ? "mb-4 h-12 w-12" : "mb-5 h-14 w-14"
          }`}
      >
        <span className="absolute -inset-2 -z-10 rounded-[1.25rem] bg-[var(--primary-soft)] opacity-70" />
        <Icon size={compact ? 22 : 26} strokeWidth={1.8} />
      </span>

      <h2
        className={`font-extrabold tracking-[-0.03em] text-[var(--text)] ${compact ? "text-base" : "text-lg sm:text-xl"
          }`}
      >
        {title}
      </h2>

      {description && (
        <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--text-muted)]">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div
          className={`flex flex-wrap items-center justify-center gap-3 ${compact ? "mt-5" : "mt-6"
            }`}
        >
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}