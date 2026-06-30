/* src/components/Ev/Candidates/EvEmailScreeningSheet.js | Email Pre-Screening sheet (resume | email draft) | Sree | 2026-06-30 */

"use client";

import { useState } from "react";

import { FxAiButton, FxButton, FxInput, FxRichTextEditor } from "@/components/FxUI/Forms";
import { FxSheet } from "@/components/FxUI/Overlays/FxSheet";
import { FxConfirmDialog } from "@/components/FxUI/Overlays/FxConfirmDialog";
import { EvCandidatePreview } from "@/components/Ev/Candidates/EvCandidatePreview";
import { buildEmailHtml } from "@/lib/EvScreening";
import { useScreeningExpanded } from "@/lib/useScreeningExpanded";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Email Pre-Screening — opened from the Unscreened "Email Pre-Screen" action. Two panes (full-height divider via
  FxSheet.Panes): left = resume only; right = To/Subject/composer bound as one group, with the send history below.
  "Generate Using AI" seeds a realistic HTML draft. Footer: Cancel · Send (marks the attempt; bumps the JW badge).
  Closing with a drafted email asks to discard first.
*/
// "30 Jun 2026, 3:45 pm" — date + time so same-day sends are distinguishable.
function formatSentAt(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
}

// Compact timeline of sends — latest on top with a filled dot, older as a muted thread. No repeated labels.
function EmailHistory({ entries }) {
  return (
    <div className="flex-none rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 py-3">
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

const FIELD_LABEL = "w-[60px] shrink-0 text-[13px] font-medium text-[var(--fx-text-muted)]";

function EvEmailScreeningSheet({ open, onOpenChange, row, job, onSend, onReject }) {
  const candidate = row?.candidate ?? null;
  const roleTitle = job?.core?.title ?? "this role";
  const [expanded, setExpanded] = useScreeningExpanded();
  const [to, setTo] = useState(candidate?.email ?? "");
  const [subject, setSubject] = useState(`Pre-Screening Questions for ${roleTitle}`);
  const [body, setBody] = useState("");
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const sentHistory = [...(row?.emailScreeningHistory ?? [])].reverse(); // newest first
  const canSend = Boolean(to.trim() && body.trim());

  // Closing with a drafted email confirms first; everything else closes straight through.
  function handleOpenChange(next) {
    if (!next && body.trim()) {
      setConfirmDiscard(true);
      return;
    }
    onOpenChange?.(next);
  }

  return (
    <FxSheet open={open} onOpenChange={handleOpenChange} side="right" size="xl" expandable expanded={expanded} onExpandedChange={setExpanded}>
      <FxSheet.Header title="Email Pre-Screening" />
      {row ? (
        <FxSheet.Panes>
          {/* Left — resume only (no Background tab here). */}
          <FxSheet.Pane role="primary" className="p-0">
            <div className="flex h-full min-h-0 flex-col p-4">
              <EvCandidatePreview candidate={candidate} fill resumeOnly />
            </div>
          </FxSheet.Pane>

          {/* Right — To/Subject/composer bound in one group; send history sits below it. */}
          <FxSheet.Pane role="secondary" width="50%" className="p-0">
            <div className="flex h-full min-h-0 flex-col gap-4 p-4">
              <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] p-4">
                {/* Labels inline-left to save vertical space. */}
                <div className="flex items-center gap-3">
                  <label htmlFor="email-to" className={FIELD_LABEL}>To</label>
                  <FxInput id="email-to" type="email" value={to} onChange={(event) => setTo(event.target.value)} clearable={false} className="flex-1" />
                </div>
                <div className="flex items-center gap-3">
                  <label htmlFor="email-subject" className={FIELD_LABEL}>Subject</label>
                  <FxInput id="email-subject" value={subject} onChange={(event) => setSubject(event.target.value)} clearable={false} className="flex-1" />
                </div>
                <div className="flex justify-end">
                  <FxAiButton onClick={() => setBody(buildEmailHtml(candidate, roleTitle))}>Generate Using AI</FxAiButton>
                </div>
                <FxRichTextEditor value={body} onChange={setBody} placeholder="Write the email — or generate a draft with AI…" minHeight={200} fill />
              </div>

              {/* Older context — a timeline of sends (counter mirrors the JW email icon). Hidden until first send. */}
              {sentHistory.length ? <EmailHistory entries={sentHistory} /> : null}
            </div>
          </FxSheet.Pane>
        </FxSheet.Panes>
      ) : (
        <FxSheet.Body />
      )}

      <FxSheet.Footer
        footerStart={
          <FxButton variant="outline" size="md" onClick={() => handleOpenChange(false)}>Cancel</FxButton>
        }
      >
        {/* Reject in-context — after repeated unanswered emails, reject without leaving the sheet. */}
        <FxButton variant="destructiveOutline" size="md" onClick={() => onReject?.(row)}>Reject</FxButton>
        <FxButton variant="primary" size="md" className="min-w-[120px]" disabled={!canSend} onClick={() => onSend?.(row, { to, subject, body })}>Send</FxButton>
      </FxSheet.Footer>

      <FxConfirmDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        title="Discard this email?"
        description="Your draft hasn't been sent. Closing now will discard it."
        confirmLabel="Discard"
        tone="danger"
        onConfirm={() => { setConfirmDiscard(false); onOpenChange?.(false); }}
      />
    </FxSheet>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvEmailScreeningSheet };
/* - - - - - - - - - - - - - - - - */
