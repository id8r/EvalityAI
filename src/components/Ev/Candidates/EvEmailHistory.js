/* src/components/Ev/Candidates/EvEmailHistory.js | Compact send-history timeline for email pre-screening | Sree | 2026-06-30 */

"use client";

import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

// "30 Jun 2026, 3:45 pm" — date + time so same-day sends are distinguishable.
function formatSentAt(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
}

// Timeline of sends — newest on top with a filled dot, older as a muted thread. `entries` = array of ISO timestamps.
function EvEmailHistory({ entries = [] }) {
  if (!entries.length) {
    return <p className="text-[13px] text-[var(--fx-text-muted)]">No emails sent yet.</p>;
  }
  return (
    <div className="rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 py-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fx-text-muted)]">Email history</p>
        <span className="rounded-full bg-[var(--fx-surface-hover)] px-2 py-0.5 text-[11px] font-medium text-[var(--fx-text-muted)]">{entries.length} sent</span>
      </div>
      <ol className="mt-2.5">
        {entries.map((at, index) => {
          const isLatest = index === 0;
          const isLast = index === entries.length - 1;
          return (
            <li key={`${at}-${index}`} className="relative flex items-start gap-3 pb-3 last:pb-0">
              {!isLast ? <span aria-hidden="true" className="absolute bottom-0 left-[3px] top-[14px] w-px bg-[var(--fx-border)]" /> : null}
              <span
                className={cn(
                  "relative z-[1] mt-[5px] size-[7px] shrink-0 rounded-full",
                  isLatest ? "bg-[var(--fx-primary)]" : "border border-[var(--fx-border-strong)] bg-[var(--fx-surface)]",
                )}
              />
              <div className="flex min-w-0 flex-1 items-baseline justify-between gap-2">
                <span className="text-[13px] leading-[18px] text-[var(--fx-text)]">{formatSentAt(at) ?? "—"}</span>
                {isLatest ? <span className="shrink-0 text-[11px] font-medium text-[var(--fx-primary)]">Latest</span> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvEmailHistory };
/* - - - - - - - - - - - - - - - - */
