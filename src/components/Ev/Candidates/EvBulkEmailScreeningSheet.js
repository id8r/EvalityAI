/* src/components/Ev/Candidates/EvBulkEmailScreeningSheet.js | Bulk Email Pre-Screening (list · resume · per-candidate composer) | Sree | 2026-06-30 */

"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

import { FxAiButton, FxButton, FxInput, FxRichTextEditor } from "@/components/FxUI/Forms";
import { FxSheet } from "@/components/FxUI/Overlays/FxSheet";
import { EvCandidatePreview } from "@/components/Ev/Candidates/EvCandidatePreview";
import { buildEmailHtml } from "@/lib/EvScreening";
import { useScreeningExpanded } from "@/lib/useScreeningExpanded";
import { cn, scoreTone } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Bulk Email Pre-Screening — opened from the Unscreened bulk "Email Pre-Screening" action. Three panes:
    list (selected candidates + CV match) · resume · per-candidate composer.
  Previous/Next traverse the selection; each candidate keeps its own draft (compose or "Generate Using AI").
  Collapsing the left panes brings the candidate + score into the composer header. Send = mark all as emailed
  (bumps each candidate's email count in the table); if any draft is still empty, Send jumps to it first.
*/
const FIELD_LABEL = "w-[60px] shrink-0 text-[13px] font-medium text-[var(--fx-text-muted)]";
const SCORE_TONE_TEXT = {
  success: "text-[var(--fx-success)]",
  warning: "text-[var(--fx-warning)]",
  danger: "text-[var(--fx-danger)]",
  primary: "text-[var(--fx-primary)]",
  neutral: "text-[var(--fx-text)]",
};
const scoreText = (value) => SCORE_TONE_TEXT[scoreTone(value, "neutral")] ?? SCORE_TONE_TEXT.neutral;
const scoreLabel = (value) => (value == null ? "—" : `${value}%`);

function EvBulkEmailScreeningSheet({ open, onOpenChange, rows = [], job, onSend }) {
  const roleTitle = job?.core?.title ?? "this role";
  const [expanded, setExpanded] = useScreeningExpanded();
  const [showPanes, setShowPanes] = useState(true); // left list + resume; collapse to focus the composer
  const [hiddenIds, setHiddenIds] = useState([]);
  const [activeId, setActiveId] = useState(rows[0]?.id ?? null);
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

  // Two distinct view controls:
  //  · Expand/Restore (the diagonal arrows) → the RÉSUMÉ pane: full = candidates + CV + compose; restored = candidates + compose.
  //  · Focus composer (the panel icon)      → drops the candidate LIST too, leaving just the composer (score moves to its header).
  const showList = showPanes;
  const showResume = showPanes && expanded;

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
  function handleSend() {
    // Nudge: if any candidate is still unwritten, jump to the first empty one instead of sending blanks.
    const unfilled = visible.find((row) => !(drafts[row.id]?.body || "").trim());
    if (unfilled) {
      setActiveId(unfilled.id);
      setShowPanes(false);
      return;
    }
    onSend?.(visible);
  }

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
      {/* Focus composer — drops the list (and résumé); the candidate + score move into the composer header. */}
      <button
        type="button"
        aria-label={showPanes ? "Focus composer" : "Show candidates"}
        title={showPanes ? "Focus composer" : "Show candidates"}
        onClick={() => setShowPanes((current) => !current)}
        className="flex size-8 items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
      >
        {showPanes ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
      </button>
    </>
  );

  return (
    <FxSheet open={open} onOpenChange={onOpenChange} side="right" size="xl" expandable expanded={expanded} onExpandedChange={setExpanded}>
      <FxSheet.Header title="Email Pre-Screening" actions={headerActions} />
      {active ? (
        <FxSheet.Panes>
          {showList ? (
            <FxSheet.Pane role="secondary" width="280px" className="p-0">
              <div className="flex h-full min-h-0 flex-col gap-2 overflow-y-auto p-3">
                {visible.map((row) => {
                  const isActive = row.id === active.id;
                  return (
                    <div
                      key={row.id}
                      className={cn(
                        "flex items-start justify-between gap-2 rounded-[10px] border px-3 py-2.5 transition-colors",
                        isActive ? "border-[var(--fx-primary)] bg-[var(--fx-surface)] shadow-sm" : "border-transparent hover:bg-[var(--fx-surface)]",
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
              {/* Collapsed → bring the candidate + CV match into the composer header (parity with the old UI). */}
              {!showPanes ? (
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[16px] font-semibold text-[var(--fx-text)]">{active.candidateName}</p>
                  <p className={cn("text-[14px] font-semibold", scoreText(active.matchScore))}>CV Match {scoreLabel(active.matchScore)}</p>
                </div>
              ) : null}

              <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] p-4">
                <div className="flex items-center gap-3">
                  <label htmlFor="bulk-email-to" className={FIELD_LABEL}>To</label>
                  <FxInput id="bulk-email-to" type="email" value={draft.to} onChange={(event) => setField("to", event.target.value)} clearable={false} className="flex-1" />
                </div>
                <div className="flex items-center gap-3">
                  <label htmlFor="bulk-email-subject" className={FIELD_LABEL}>Subject</label>
                  <FxInput id="bulk-email-subject" value={draft.subject} onChange={(event) => setField("subject", event.target.value)} clearable={false} className="flex-1" />
                </div>
                <div className="flex justify-end">
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
          <FxButton variant="outline" size="md" onClick={() => onOpenChange?.(false)}>Cancel</FxButton>
        }
      >
        <FxButton variant="primary" size="md" className="min-w-[140px]" disabled={!visible.length} onClick={handleSend}>
          Send to {visible.length || "All"}
        </FxButton>
      </FxSheet.Footer>
    </FxSheet>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvBulkEmailScreeningSheet };
/* - - - - - - - - - - - - - - - - */
