/* src/components/Ev/Candidates/EvRejectCandidateDialog.js | Reject-with-note dialog (all reject flows) | Sree | 2026-06-29 */

"use client";

import { useState } from "react";

import { FxDialog } from "@/components/FxUI/Overlays/FxDialog";
import { FxButton, FxTextarea } from "@/components/FxUI/Forms";
/* - - - - - - - - - - - - - - - - */

// Reject confirmation that captures a rejection note. `candidates` = the row(s) being rejected; emits onConfirm(note).
// Remount per open (key) for fresh state — the dialog owns no persistence.
function EvRejectCandidateDialog({ open, onOpenChange, candidates = [], onConfirm }) {
  const [note, setNote] = useState("");
  const count = candidates.length;
  const many = count > 1;
  const who = many ? `these ${count} candidates` : candidates[0]?.candidateName ?? "this candidate";

  return (
    <FxDialog
      open={open}
      onOpenChange={onOpenChange}
      title={many ? "Reject Candidates" : "Reject Candidate"}
      description={
        <>
          Add a note for why <span className="font-medium text-[var(--fx-text)]">{who}</span> {many ? "are" : "is"} being rejected for this job.
        </>
      }
      footer={
        <>
          <FxButton variant="ghost" onClick={() => onOpenChange?.(false)}>
            Cancel
          </FxButton>
          <FxButton variant="destructive" onClick={() => onConfirm?.(note.trim())}>
            Save and Reject
          </FxButton>
        </>
      }
    >
      <FxTextarea
        label="Rejection Notes"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Leave notes about the rejection reason..."
        rows={5}
      />
    </FxDialog>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvRejectCandidateDialog };
/* - - - - - - - - - - - - - - - - */
