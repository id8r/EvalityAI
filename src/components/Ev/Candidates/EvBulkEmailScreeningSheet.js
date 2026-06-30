/* src/components/Ev/Candidates/EvBulkEmailScreeningSheet.js | Bulk Email Pre-Screening (list · resume · per-candidate composer) | Sree | 2026-06-30 */

"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, FileText, Users, X } from "lucide-react";

import { FxAiButton, FxButton, FxIconToggle, FxInput, FxRichTextEditor } from "@/components/FxUI/Forms";
import { FxSheet } from "@/components/FxUI/Overlays/FxSheet";
import { FxConfirmDialog } from "@/components/FxUI/Overlays/FxConfirmDialog";
import { EvCandidatePreview } from "@/components/Ev/Candidates/EvCandidatePreview";
import { buildEmailHtml } from "@/lib/EvScreening";
import { useScreeningExpanded } from "@/lib/useScreeningExpanded";
import { cn, scoreToneTextClass } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Bulk Email Pre-Screening — opened from the Unscreened bulk "Email Pre-Screening" action. Up to three panes:
    candidate list (+ CV match) · résumé · per-candidate composer.
  Three single-responsibility view controls, each independent of the others:
    👥 Users  → show/hide the candidate LIST
    📄 File   → show/hide the RÉSUMÉ pane
    ⤢ (FxSheet expandable) → sheet WIDTH only
  The composer always carries a compact candidate header (name + CV match). Previous/Next traverse the selection;
  each candidate keeps its own draft. Send marks all as emailed (bumps each table count); an empty draft flags
  itself (composer warning + list ring) instead of sending blank.
*/
const FIELD_LABEL = "w-[60px] shrink-0 text-[13px] font-medium text-[var(--fx-text-muted)]";
const scoreText = (value) => scoreToneTextClass(value, "neutral");
const scoreLabel = (value) => (value == null ? "—" : `${value}%`);

function EvBulkEmailScreeningSheet({ open, onOpenChange, rows = [], job, onSend }) {
  const roleTitle = job?.core?.title ?? "this role";
  const [expanded, setExpanded] = useScreeningExpanded(); // ⤢ sheet width only
  const [showList, setShowList] = useState(true); // 👥 candidate list
  const [showResume, setShowResume] = useState(true); // 📄 résumé pane
  const [hiddenIds, setHiddenIds] = useState([]);
  const [activeId, setActiveId] = useState(rows[0]?.id ?? null);
  const [attemptedSend, setAttemptedSend] = useState(false); // once true, empty drafts flag themselves until written
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  // Per-candidate drafts, seeded once from the selection (sheet is keyed by the selection upstream → resets per open).
  const [drafts, setDrafts] = useState(() =>
    Object.fromEntries(rows.map((row) => [row.id, { to: row.email ?? "", subject: `Pre-Screening Questions for ${roleTitle}`, body: "" }])),
  );

  const visible = rows.filter((row) => !hiddenIds.includes(row.id));
  const active = visible.find((row) => row.id === activeId) ?? visible[0] ?? null;
  const index = active ? visible.findIndex((row) => row.id === active.id) : -1;
  const hasPrev = index > 0;
  const hasNext = index >= 0 && index < visible.length - 1;
  const draft = active ? drafts[active.id] ?? { to: "", subject: "", body: "" } : { to: "", subject: "", body: "" };

  function setField(field, value) {
    if (!active) return;
    setDrafts((prev) => ({ ...prev, [active.id]: { ...(prev[active.id] ?? {}), [field]: value } }));
  }
  function remove(id) {
    setHiddenIds((current) => (current.includes(id) ? current : [...current, id]));
    if (id === active?.id) {
      const next = visible.find((row) => row.id !== id);
      setActiveId(next?.id ?? null);
    }
  }
  const isUnfilled = (row) => !(drafts[row.id]?.body || "").trim();

  function handleSend() {
    // Don't send blanks — surface the first unwritten candidate in place (no pane shift); it flags itself via the
    // composer warning + the list highlight until it has content.
    const unfilled = visible.find(isUnfilled);
    if (unfilled) {
      setAttemptedSend(true);
      setActiveId(unfilled.id);
      return;
    }
    onSend?.(visible);
  }

  // Confirm before discarding written drafts on close.
  const hasDraft = visible.some((row) => (drafts[row.id]?.body || "").trim());
  function handleOpenChange(next) {
    if (!next && hasDraft) {
      setConfirmDiscard(true);
      return;
    }
    onOpenChange?.(next);
  }

  const warnActive = attemptedSend && active != null && isUnfilled(active); // current candidate needs a draft

  const headerActions = (
    <>
      <FxButton variant="ghost" size="sm" disabled={!hasPrev} onClick={() => hasPrev && setActiveId(visible[index - 1]?.id)}>
        <ArrowLeft className="size-4" />
        Previous
      </FxButton>
      <FxButton variant="ghost" size="sm" disabled={!hasNext} onClick={() => hasNext && setActiveId(visible[index + 1]?.id)}>
        Next
        <ArrowRight className="size-4" />
      </FxButton>
      {/* 👥 candidate list · 📄 résumé — each toggles only its own pane. ⤢ (width) is FxSheet's built-in. */}
      <FxIconToggle icon={Users} pressed={showList} onClick={() => setShowList((current) => !current)} label={showList ? "Hide candidates" : "Show candidates"} />
      <FxIconToggle icon={FileText} pressed={showResume} onClick={() => setShowResume((current) => !current)} label={showResume ? "Hide résumé" : "Show résumé"} />
    </>
  );

  return (
    <FxSheet open={open} onOpenChange={handleOpenChange} side="right" size="xl" expandable expanded={expanded} onExpandedChange={setExpanded}>
      <FxSheet.Header title="Email Pre-Screening" actions={headerActions} />
      {active ? (
        <FxSheet.Panes>
          {showList ? (
            <FxSheet.Pane role="secondary" width="280px" className="p-0">
              <div className="flex h-full min-h-0 flex-col gap-2 overflow-y-auto p-3">
                {visible.map((row) => {
                  const isActive = row.id === active.id;
                  const needsDraft = attemptedSend && isUnfilled(row); // flag candidates still missing a draft
                  return (
                    <div
                      key={row.id}
                      className={cn(
                        "flex items-start justify-between gap-2 rounded-[10px] border px-3 py-2.5 transition-colors",
                        isActive ? "border-[var(--fx-primary)] bg-[var(--fx-surface)] shadow-sm" : "border-transparent hover:bg-[var(--fx-surface)]",
                        needsDraft && "ring-1 ring-inset ring-[var(--fx-danger)]",
                      )}
                    >
                      <button type="button" onClick={() => setActiveId(row.id)} className="min-w-0 flex-1 text-left">
                        <p className="truncate text-[14px] font-medium leading-[18px] text-[var(--fx-text)]">{row.candidateName}</p>
                        <p className={cn("text-[13px] font-semibold leading-[18px]", scoreText(row.matchScore))}>{scoreLabel(row.matchScore)}</p>
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove ${row.candidateName}`}
                        onClick={() => remove(row.id)}
                        className="inline-flex size-5 shrink-0 items-center justify-center rounded-[4px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-danger)]"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </FxSheet.Pane>
          ) : null}

          {showResume ? (
            <FxSheet.Pane role="primary" className="p-0">
              <div className="flex h-full min-h-0 flex-col p-4">
                <EvCandidatePreview key={active.id} candidate={active.candidate} fill resumeOnly />
              </div>
            </FxSheet.Pane>
          ) : null}

          {/* Composer — secondary share alongside the résumé (3-pane), else primary (fills). */}
          <FxSheet.Pane role={showResume ? "secondary" : "primary"} width={showResume ? "46%" : undefined} className="p-0">
            <div className="flex h-full min-h-0 flex-col gap-4 p-4">
              {/* Always-on candidate context — name + CV match stay visible regardless of pane visibility. */}
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[16px] font-semibold text-[var(--fx-text)]">{active.candidateName}</p>
                <p className={cn("text-[14px] font-semibold", scoreText(active.matchScore))}>CV Match {scoreLabel(active.matchScore)}</p>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] p-4">
                <div className="flex items-center gap-3">
                  <label htmlFor="bulk-email-to" className={FIELD_LABEL}>To</label>
                  <FxInput id="bulk-email-to" type="email" value={draft.to} onChange={(event) => setField("to", event.target.value)} clearable={false} className="flex-1" />
                </div>
                <div className="flex items-center gap-3">
                  <label htmlFor="bulk-email-subject" className={FIELD_LABEL}>Subject</label>
                  <FxInput id="bulk-email-subject" value={draft.subject} onChange={(event) => setField("subject", event.target.value)} clearable={false} className="flex-1" />
                </div>
                <div className="flex items-center justify-end gap-2.5">
                  {/* Red marker by Generate when Send found this candidate empty — write or generate before sending. */}
                  {warnActive ? (
                    <span className="flex items-center gap-2 text-[12px] font-medium text-[var(--fx-danger)]">
                      <span aria-hidden="true" className="h-4 w-[3px] shrink-0 rounded-full bg-[var(--fx-danger)]" />
                      Write or generate this email before sending
                    </span>
                  ) : null}
                  <FxAiButton onClick={() => setField("body", buildEmailHtml(active.candidate, roleTitle))}>Generate Using AI</FxAiButton>
                </div>
                <FxRichTextEditor value={draft.body} onChange={(html) => setField("body", html)} placeholder="Write the email — or generate a draft with AI…" minHeight={200} fill />
              </div>
            </div>
          </FxSheet.Pane>
        </FxSheet.Panes>
      ) : (
        <FxSheet.Body>
          <div className="flex h-full items-center justify-center text-[14px] text-[var(--fx-text-muted)]">No candidates selected.</div>
        </FxSheet.Body>
      )}

      <FxSheet.Footer
        footerStart={
          <FxButton variant="outline" size="md" onClick={() => handleOpenChange(false)}>Cancel</FxButton>
        }
      >
        <FxButton variant="primary" size="md" className="min-w-[140px]" disabled={!visible.length} onClick={handleSend}>
          Send to {visible.length || "All"}
        </FxButton>
      </FxSheet.Footer>

      <FxConfirmDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        title="Discard these drafts?"
        description="You have unsent email drafts. Closing now will discard them."
        confirmLabel="Discard"
        tone="danger"
        onConfirm={() => { setConfirmDiscard(false); onOpenChange?.(false); }}
      />
    </FxSheet>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvBulkEmailScreeningSheet };
/* - - - - - - - - - - - - - - - - */
