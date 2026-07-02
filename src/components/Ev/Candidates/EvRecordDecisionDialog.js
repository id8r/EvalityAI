/* src/components/Ev/Candidates/EvRecordDecisionDialog.js | Record-decision editor for the interview journey | Sree | 2026-07-01 */

"use client";

import { useEffect, useState } from "react";

import { FxButton, FxTextarea } from "@/components/FxUI/Forms";
import { FxDialog } from "@/components/FxUI/Overlays/FxDialog";
import { DECISION_OUTCOMES } from "@/lib/EvInterview";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Small editor for recording a round's decision. Four recruiter outcomes (Advance / Hold / Reject / Offer) + an
  optional note. Save writes a single decision into the round (EvData.interviewRecordDecision); the journey's
  lifecycle then reacts — Advance clears the round + readies the next, Hold/Reject/Offer surface the matching next
  action WITHOUT auto-acting (the recruiter confirms Reject/Offer separately).
*/
const OUTCOME_HELP = {
  advance: "Candidate clears this round and moves to the next.",
  hold: "Pause this candidate — you can add a follow-up task.",
  reject: "Recommend rejecting — you'll confirm before it's final.",
  offer: "Recommend an offer — you'll confirm the move to Offered.",
};

function EvRecordDecisionDialog({ open, onOpenChange, roundName, initialOutcome = null, initialNote = "", onSave }) {
  const [outcome, setOutcome] = useState(initialOutcome);
  const [note, setNote] = useState(initialNote);

  useEffect(() => {
    if (!open) return;
    // Seed from the existing decision so "Change decision" opens on the current choice.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOutcome(initialOutcome ?? null);
    setNote(initialNote ?? "");
  }, [open, initialOutcome, initialNote]);

  function save() {
    if (!outcome) return;
    onSave?.(outcome, note.trim());
  }

  return (
    <FxDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Record decision"
      description={roundName ? `Outcome for ${roundName}` : undefined}
      footer={
        <>
          <FxButton variant="outline" size="md" onClick={() => onOpenChange?.(false)}>Cancel</FxButton>
          <FxButton variant="primary" size="md" disabled={!outcome} onClick={save}>Save decision</FxButton>
        </>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {DECISION_OUTCOMES.map((option) => {
            const active = outcome === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setOutcome(option.value)}
                className={cn(
                  "flex flex-col items-start gap-0.5 rounded-[10px] border px-3 py-2.5 text-left transition-colors",
                  active
                    ? "border-[color:color-mix(in_srgb,var(--fx-primary)_45%,var(--fx-border))] bg-[var(--fx-surface-selected)]"
                    : "border-[var(--fx-border)] bg-[var(--fx-surface)] hover:bg-[var(--fx-surface-hover)]",
                )}
              >
                <span className={cn("text-[13px] font-semibold", active ? "text-[var(--fx-primary)]" : "text-[var(--fx-text)]")}>{option.label}</span>
                <span className="text-[11.5px] leading-[15px] text-[var(--fx-text-muted)]">{OUTCOME_HELP[option.value]}</span>
              </button>
            );
          })}
        </div>
        <FxTextarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Optional note — context for this decision…" />
      </div>
    </FxDialog>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvRecordDecisionDialog };
/* - - - - - - - - - - - - - - - - */
