/* src/components/Ev/Candidates/EvDropCandidateDialog.js | Drop-confirm dialog (single or bulk candidate drop) | Sree | 2026-07-01 */

"use client";

import { useState } from "react";

import { FxConfirmDialog } from "@/components/FxUI/Overlays/FxConfirmDialog";
import { FxTextarea } from "@/components/FxUI/Forms";
/* - - - - - - - - - - - - - - - - */

// Drop confirmation mirrors the reject flow and captures a note so the workspace can store the reason.
function EvDropCandidateDialog({ open, onOpenChange, candidates = [], onConfirm }) {
  const [note, setNote] = useState("");
  const count = candidates.length;
  const many = count > 1;
  const who = many ? `these ${count} candidates` : candidates[0]?.candidateName ?? "this candidate";

  return (
    <FxConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      className="max-w-[560px]"
      title={many ? "Drop Candidates" : "Drop Candidate"}
      description={
        <>
          Confirm dropping <span className="font-medium text-[var(--fx-text)]">{who}</span> from this job.
        </>
      }
      cancelLabel="Cancel"
      confirmLabel={many ? "Save and Drop" : "Save and Drop"}
      tone="danger"
      onConfirm={() => onConfirm?.(note.trim())}
    >
      <FxTextarea
        label="Drop Notes"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Leave notes about why the candidate was dropped..."
        rows={5}
      />
    </FxConfirmDialog>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvDropCandidateDialog };
/* - - - - - - - - - - - - - - - - */
