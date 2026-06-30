/* src/components/Ev/Candidates/EvEmailScreeningSheet.js | Email Pre-Screening sheet (resume | email draft) | Sree | 2026-06-30 */

"use client";

import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { FxAiButton, FxButton, FxInput, FxRichTextEditor } from "@/components/FxUI/Forms";
import { FxSheet } from "@/components/FxUI/Overlays/FxSheet";
import { EvResumePanel } from "@/components/Ev/Candidates/EvResumePanel";
import { buildEmailHtml } from "@/lib/EvScreening";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Email Pre-Screening — opened from the Unscreened "Email Pre-Screen" action. Left = resume (collapsible);
  right = recipient + subject + an email template the recruiter can hand-write or seed via "Generate Using AI".
  Footer: Cancel · Send (Send marks the attempt + bumps the badge upstream). Per-candidate state resets via key.
*/
function EvEmailScreeningSheet({ open, onOpenChange, row, job, onSend }) {
  const candidate = row?.candidate ?? null;
  const roleTitle = job?.core?.title ?? "this role";
  const [showLeft, setShowLeft] = useState(true);
  const [to, setTo] = useState(candidate?.email ?? "");
  const [subject, setSubject] = useState(`Pre-Screening Questions for ${roleTitle}`);
  const [body, setBody] = useState("");

  const headerActions = (
    <button
      type="button"
      aria-label={showLeft ? "Collapse resume" : "Expand resume"}
      title={showLeft ? "Collapse resume" : "Expand resume"}
      onClick={() => setShowLeft((current) => !current)}
      className="flex size-8 items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
    >
      {showLeft ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
    </button>
  );

  return (
    <FxSheet open={open} onOpenChange={onOpenChange} side="right" size="xl" expandable>
      <FxSheet.Header title="Email Pre-Screening" actions={headerActions} />
      {row ? (
        <>
          <FxSheet.Body className="flex min-h-0 flex-col overflow-hidden">
            <div className={cn("grid min-h-0 flex-1 gap-4", showLeft ? "lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]" : "lg:grid-cols-1")}>
              {showLeft ? <EvResumePanel candidate={candidate} fill /> : null}
              {showLeft ? <div className="hidden w-px bg-[var(--fx-border)] lg:block" /> : null}

              <div className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-0.5">
                <FxInput label="To" type="email" value={to} onChange={(event) => setTo(event.target.value)} clearable={false} />
                <FxInput label="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} clearable={false} />
                <div className="flex justify-end">
                  <FxAiButton onClick={() => setBody(buildEmailHtml(candidate, roleTitle))}>Generate Using AI</FxAiButton>
                </div>
                <FxRichTextEditor
                  value={body}
                  onChange={setBody}
                  placeholder="Write the email — or generate a draft with AI…"
                  minHeight={320}
                />
              </div>
            </div>
          </FxSheet.Body>

          <FxSheet.Footer
            footerStart={
              <FxButton variant="outline" size="md" onClick={() => onOpenChange?.(false)}>Cancel</FxButton>
            }
          >
            <FxButton variant="primary" size="md" className="min-w-[120px]" disabled={!to.trim()} onClick={() => onSend?.(row, { to, subject, body })}>Send</FxButton>
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
