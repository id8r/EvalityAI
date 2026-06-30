/* src/components/Ev/Candidates/EvResumePanel.js | Bordered "Resume" panel (PDF or synthesized text) | Sree | 2026-06-30 */

"use client";

import { FxPdfViewer } from "@/components/FxUI/DataDisplay";
import { isPdfResume, resolveResumeUrl } from "@/lib/EvResume";
import { buildResumeText } from "@/lib/EvScreening";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

// Shared "Resume" card for the screening sheets. PDF when available, else the synthesized text fallback.
//   fill={false} (default) → flows to content height (page autoHeight); the PARENT scrolls.
//   fill={true}            → fills its parent (flex-1) with an internal scroll.
function EvResumePanel({ candidate, fill = false, className }) {
  const url = isPdfResume(candidate?.resume) ? resolveResumeUrl(candidate.resume, candidate.id) : null;
  return (
    <div className={cn("rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)]", fill && "flex min-h-0 flex-1 flex-col overflow-hidden", className)}>
      <div className="flex-none border-b border-[var(--fx-border)] px-4 py-3">
        <p className="text-[14px] font-semibold text-[var(--fx-text)]">Resume</p>
      </div>
      {url ? (
        <FxPdfViewer
          file={url}
          showToolbar
          autoHeight={!fill}
          className={cn("border-0", fill ? "h-full rounded-none" : "overflow-hidden rounded-none rounded-b-[12px]")}
        />
      ) : (
        <div className={cn(fill && "min-h-0 flex-1 overflow-y-auto")}>
          <pre className="whitespace-pre-wrap break-words px-4 py-4 font-sans text-[13px] leading-[21px] text-[var(--fx-text)]">{buildResumeText(candidate)}</pre>
        </div>
      )}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvResumePanel };
/* - - - - - - - - - - - - - - - - */
