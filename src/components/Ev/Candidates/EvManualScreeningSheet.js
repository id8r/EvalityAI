/* src/components/Ev/Candidates/EvManualScreeningSheet.js | Manual screening sheet scaffold for JW actions | Sree | 2026-06-30 */

"use client";

import { FxButton } from "@/components/FxUI/Forms";
import { FxSheet } from "@/components/FxUI/Overlays/FxSheet";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

function EvManualScreeningSheet({
  open,
  onOpenChange,
  candidate,
  onConfirm,
  title = "Manual Screening",
  description = "Capture manual screening notes here. The full screening form can be filled in later.",
  confirmLabel = "Save",
}) {
  return (
    <FxSheet
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title={title}
      description={description}
      footerStart={
        <FxButton variant="ghost" size="md" onClick={() => onOpenChange?.(false)}>
          Cancel
        </FxButton>
      }
      footer={
        <FxButton
          variant="primary"
          size="md"
          onClick={() => {
            onConfirm?.();
          }}
        >
          {confirmLabel}
        </FxButton>
      }
    >
      <div className="space-y-4">
        <p className={cn("text-[14px] leading-[22px] text-[var(--fx-text-muted)]")}>
          {candidate ? `Manual screening for ${candidate.candidateName}.` : "Manual screening draft."}
        </p>
        <div className="space-y-2 rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-3">
          <p className="text-[13px] text-[var(--fx-text-muted)]">The form fields will be added here next.</p>
        </div>
      </div>
    </FxSheet>
  );
}
/* - - - - - - - - - - - - - - - - */

export { EvManualScreeningSheet };
