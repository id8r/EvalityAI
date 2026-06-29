/* src/components/FxUI/Overlays/FxStartPreScreeningSheet.js | Minimal pre-screening sheet scaffold for JW actions | Sree | 2026-06-29 */

"use client";

import { FxButton } from "@/components/FxUI/Forms";
import { FxSheet } from "@/components/FxUI/Overlays/FxSheet";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

function FxStartPreScreeningSheet({ open, onOpenChange, candidates = [], onConfirm }) {
  const count = candidates.length;

  return (
    <FxSheet
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title="Start Pre-Screening"
      description="Selected candidates will move into Pre-Screened. We can wire the full screening flow here next."
      footerStart={<span className="text-[13px] text-[var(--fx-text-muted)]">{count} candidate{count === 1 ? "" : "s"} selected</span>}
      footer={
        <FxButton
          variant="primary"
          size="md"
          onClick={() => {
            onConfirm?.();
          }}
        >
          Start Pre-Screening
        </FxButton>
      }
    >
      <div className="space-y-4">
        <p className={cn("text-[14px] leading-[22px] text-[var(--fx-text-muted)]")}>
          This is the current scaffold for the older screening flow. The next step is to plug in the detailed
          screening UI and email/pre-screen logic.
        </p>
        <div className="space-y-2 rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-3">
          {count ? (
            candidates.map((candidate) => (
              <div key={candidate.id} className="flex items-center justify-between gap-3 rounded-[8px] px-2 py-2">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-[var(--fx-text)]">{candidate.candidateName}</p>
                  <p className="truncate text-[12px] text-[var(--fx-text-muted)]">{candidate.email || candidate.candidateEmail || "—"}</p>
                </div>
                <span className="text-[12px] text-[var(--fx-text-muted)]">Unscreened</span>
              </div>
            ))
          ) : (
            <p className="text-[14px] text-[var(--fx-text-muted)]">No candidates selected.</p>
          )}
        </div>
      </div>
    </FxSheet>
  );
}
/* - - - - - - - - - - - - - - - - */

export { FxStartPreScreeningSheet };
/* - - - - - - - - - - - - - - - - */
