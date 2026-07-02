/* src/components/Ev/Candidates/EvInterviewFeedbackViewSheet.js | Read-only interview feedback view | Sree | 2026-07-02 */

"use client";

import { FxButton } from "@/components/FxUI/Forms";
import { FxBadge } from "@/components/FxUI/DataDisplay";
import { FxSheet } from "@/components/FxUI/Overlays/FxSheet";
import { getInterviewJourney } from "@/lib/EvData";
import { interviewOverview, feedbackRecommendationLabel, feedbackRecommendationTone } from "@/lib/EvInterview";
/* - - - - - - - - - - - - - - - - */

/*
  Read-only feedback view opened from the Interviewing table's Feedback → "View". Recording/editing happens only
  inside the Interview Workspace — this sheet just surfaces the recorded feedback + a jump to the workspace.
*/
function formatSubmitted(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return "—";
  }
}

function Row({ label, children }) {
  return (
    <div className="flex gap-3 border-b border-[var(--fx-border-light)] py-2.5 last:border-0">
      <dt className="w-[120px] shrink-0 text-[13px] text-[var(--fx-text-muted)]">{label}</dt>
      <dd className="min-w-0 flex-1 text-[13px] text-[var(--fx-text)]">{children}</dd>
    </div>
  );
}

function EvInterviewFeedbackViewSheet({ open, onOpenChange, row, onOpenWorkspace }) {
  const overview = row?.id ? interviewOverview(getInterviewJourney(row.id)) : null;
  const feedback = overview?.feedback ?? null;
  const payload = feedback?.payload ?? {};

  return (
    <FxSheet open={open} onOpenChange={onOpenChange} side="right" size="md" title="Interview Feedback" description={row?.candidateName ?? undefined}>
      {feedback ? (
        <div className="px-1 py-1">
          <dl>
            <Row label="Candidate">{row?.candidateName ?? "—"}</Row>
            <Row label="Round">{overview?.roundName ?? "—"}</Row>
            <Row label="Interviewer">{payload.byInterviewerId || "—"}</Row>
            <Row label="Recommendation">
              <FxBadge tone={feedbackRecommendationTone(payload.recommendation)} variant="soft" size="sm">{feedbackRecommendationLabel(payload.recommendation)}</FxBadge>
            </Row>
            <Row label="Submitted">{formatSubmitted(feedback.createdAt)}</Row>
            <Row label="Notes">{payload.notes ? <span className="whitespace-pre-wrap">{payload.notes}</span> : <span className="text-[var(--fx-text-muted)]">—</span>}</Row>
          </dl>
        </div>
      ) : (
        <div className="grid h-full place-items-center px-6 text-center">
          <p className="text-[14px] text-[var(--fx-text-muted)]">No feedback recorded for the current round yet.</p>
        </div>
      )}

      <FxSheet.Footer footerStart={<FxButton variant="outline" size="md" onClick={() => onOpenChange?.(false)}>Close</FxButton>}>
        <FxButton variant="primary" size="md" onClick={() => onOpenWorkspace?.(row)}>Open Interview Workspace</FxButton>
      </FxSheet.Footer>
    </FxSheet>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvInterviewFeedbackViewSheet };
/* - - - - - - - - - - - - - - - - */
