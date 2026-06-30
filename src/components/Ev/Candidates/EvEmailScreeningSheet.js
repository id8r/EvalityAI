/* src/components/Ev/Candidates/EvEmailScreeningSheet.js | Email Pre-Screening sheet (resume | email draft) | Sree | 2026-06-30 */

"use client";

import { useState } from "react";

import { FxAiButton, FxButton, FxInput, FxRichTextEditor } from "@/components/FxUI/Forms";
import { FxSheet } from "@/components/FxUI/Overlays/FxSheet";
import { EvCandidatePreview } from "@/components/Ev/Candidates/EvCandidatePreview";
import { buildEmailHtml } from "@/lib/EvScreening";
import { useScreeningExpanded } from "@/lib/useScreeningExpanded";
/* - - - - - - - - - - - - - - - - */

/*
  Email Pre-Screening — opened from the Unscreened "Email Pre-Screen" action. Left = our shared resume preview;
  right = recipient + subject + a rich-text email the recruiter can write or seed via "Generate Using AI" (the AI
  draft is realistic HTML with a screening-form link). Footer shows the sent context · Cancel · Send (marks attempt).
*/
function formatSentDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function EvEmailScreeningSheet({ open, onOpenChange, row, job, onSend }) {
  const candidate = row?.candidate ?? null;
  const roleTitle = job?.core?.title ?? "this role";
  const [expanded, setExpanded] = useScreeningExpanded();
  const [to, setTo] = useState(candidate?.email ?? "");
  const [subject, setSubject] = useState(`Pre-Screening Questions for ${roleTitle}`);
  const [body, setBody] = useState("");

  const sentCount = row?.emailScreeningCount ?? 0;
  const lastSent = formatSentDate(row?.emailScreeningStartedAt);
  const canSend = Boolean(to.trim() && body.trim());

  return (
    <FxSheet open={open} onOpenChange={onOpenChange} side="right" size="xl" expandable expanded={expanded} onExpandedChange={setExpanded}>
      <FxSheet.Header title="Email Pre-Screening" />
      {row ? (
        <>
          <FxSheet.Body className="flex min-h-0 flex-col overflow-hidden">
            <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]">
              {/* Email needs the resume only — no Background tab here. */}
              <EvCandidatePreview candidate={candidate} fill resumeOnly />
              <div className="hidden w-px bg-[var(--fx-border)] lg:block" />

              <div className="flex min-h-0 flex-col gap-4">
                <FxInput label="To" type="email" value={to} onChange={(event) => setTo(event.target.value)} clearable={false} />
                <FxInput label="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} clearable={false} />
                <div className="flex justify-end">
                  <FxAiButton onClick={() => setBody(buildEmailHtml(candidate, roleTitle))}>Generate Using AI</FxAiButton>
                </div>
                {/* fill → composer takes the remaining height; when there's send history below, it shrinks to fit. */}
                <FxRichTextEditor value={body} onChange={setBody} placeholder="Write the email — or generate a draft with AI…" minHeight={200} fill />
                {/* Older context — only when at least one email has gone out (counter mirrors the JW email icon). */}
                {sentCount > 0 ? (
                  <div className="flex-none rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] px-3 py-2.5">
                    <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--fx-text-muted)]">Email history</p>
                    <p className="mt-0.5 text-[13px] leading-[20px] text-[var(--fx-text)]">
                      {lastSent ? `Last sent ${lastSent} · ` : ""}{sentCount} {sentCount === 1 ? "email" : "emails"} sent
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </FxSheet.Body>

          <FxSheet.Footer
            footerStart={
              <FxButton variant="outline" size="md" onClick={() => onOpenChange?.(false)}>Cancel</FxButton>
            }
          >
            <FxButton variant="primary" size="md" className="min-w-[120px]" disabled={!canSend} onClick={() => onSend?.(row, { to, subject, body })}>Send</FxButton>
          </FxSheet.Footer>
        </>
      ) : (
        <FxSheet.Body />
      )}
    </FxSheet>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvEmailScreeningSheet };
/* - - - - - - - - - - - - - - - - */
