/* src/components/Ev/Candidates/EvRecordFeedbackDialog.js | Record-feedback editor for the interview journey | Sree | 2026-07-01 */

"use client";

import { useEffect, useState } from "react";

import { FxButton, FxCombobox, FxTextarea } from "@/components/FxUI/Forms";
import { FxDialog } from "@/components/FxUI/Overlays/FxDialog";
import { RECOMMENDATIONS, RECENT_INTERVIEWERS } from "@/lib/EvInterview";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  V1 interviewer-feedback editor: submitted-by + recommendation (Strong Yes / Yes / No / Strong No) + notes.
  Save writes a single feedback item into the round (EvData.interviewRecordFeedback); the round then reads
  "Feedback submitted" and the lifecycle's next required step becomes Record decision. "Submitted by" is a
  by-NAME combobox seeded with the round's scheduled interviewer(s) + recent interviewers, and stays typeable.
*/
function EvRecordFeedbackDialog({ open, onOpenChange, roundName, interviewers = [], defaultSubmittedBy = "", initialRecommendation = null, initialNote = "", onSave }) {
  const submitterOptions = Array.from(new Set([...interviewers.map((p) => p?.name).filter(Boolean), ...RECENT_INTERVIEWERS.map((p) => p.name)]));
  const [submittedBy, setSubmittedBy] = useState(defaultSubmittedBy);
  const [recommendation, setRecommendation] = useState(initialRecommendation);
  const [notes, setNotes] = useState(initialNote);

  useEffect(() => {
    if (!open) return;
    // Seed from existing feedback so "Change feedback" opens on the current values (parity with Change decision).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSubmittedBy(defaultSubmittedBy || "");
    setRecommendation(initialRecommendation ?? null);
    setNotes(initialNote ?? "");
  }, [open, defaultSubmittedBy, initialRecommendation, initialNote]);

  function save() {
    if (!recommendation) return;
    onSave?.({ submittedBy: submittedBy || null, recommendation, notes: notes.trim() });
  }

  return (
    <FxDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Record feedback"
      description={roundName ? `Interviewer feedback for ${roundName}` : undefined}
      footer={
        <>
          <FxButton variant="outline" size="md" onClick={() => onOpenChange?.(false)}>Cancel</FxButton>
          <FxButton variant="primary" size="md" disabled={!recommendation} onClick={save}>Save feedback</FxButton>
        </>
      }
    >
      <div className="space-y-3.5">
        <div>
          <span className="mb-1 block text-[12px] font-medium text-[var(--fx-text-muted)]">Submitted by</span>
          <FxCombobox size="md" options={submitterOptions} value={submittedBy} onChange={setSubmittedBy} createLabel="Add name" placeholder="Select or type a name" />
        </div>
        <div>
          <span className="mb-1 block text-[12px] font-medium text-[var(--fx-text-muted)]">Recommendation</span>
          <div className="grid grid-cols-2 gap-2">
            {RECOMMENDATIONS.map((option) => {
              const active = recommendation === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRecommendation(option.value)}
                  className={cn(
                    "rounded-[10px] border px-3 py-2 text-[13px] font-semibold transition-colors",
                    active
                      ? "border-[color:color-mix(in_srgb,var(--fx-primary)_45%,var(--fx-border))] bg-[var(--fx-surface-selected)] text-[var(--fx-primary)]"
                      : "border-[var(--fx-border)] bg-[var(--fx-surface)] text-[var(--fx-text)] hover:bg-[var(--fx-surface-hover)]",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <span className="mb-1 block text-[12px] font-medium text-[var(--fx-text-muted)]">Notes</span>
          <FxTextarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Interviewer notes (optional)…" />
        </div>
      </div>
    </FxDialog>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvRecordFeedbackDialog };
/* - - - - - - - - - - - - - - - - */
