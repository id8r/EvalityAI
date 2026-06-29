/* src/app/ds/ReviewCandidateCards.js | /ds demo: EvCandidateCard variants (client — owns the edit handler) | Sree | 2026-06-29 */

"use client";

import { EvCandidateCard } from "@/components/Ev/Candidates";
/* - - - - - - - - - - - - - - - - */

// onEditField is an event handler, so this wrapper is a Client Component (the /ds page is a Server Component).
function Demo({ label, className, children }) {
  return (
    <div className={className}>
      <p className="mb-2 text-[12px] font-medium text-[var(--fx-text-muted)]">{label}</p>
      {children}
    </div>
  );
}

function ReviewCandidateCards({ candidate, application, history }) {
  const onEditField = (field, value) => console.log("edit", field, value);
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Demo label="minimal · score only (CV Match header)">
        <EvCandidateCard candidate={candidate} mode="minimal" score={{ label: "CV Match Score", value: "64%" }} />
      </Demo>
      <Demo label="compact · email/phone editable">
        <EvCandidateCard candidate={candidate} mode="compact" onEditField={onEditField} />
      </Demo>
      <Demo label="summary · score + editable">
        <EvCandidateCard candidate={candidate} application={application} mode="summary" score={{ label: "Fit Score", value: "83%" }} onEditField={onEditField} />
      </Demo>
      <Demo label="summary · read-only (editable={false})">
        <EvCandidateCard candidate={candidate} application={application} mode="summary" onEditField={onEditField} editable={false} />
      </Demo>
      <Demo label="full · history accordion + name editable" className="lg:col-span-2">
        <div className="max-w-[480px]">
          <EvCandidateCard candidate={candidate} application={application} mode="full" score={{ label: "Match Score", value: "64%" }} history={history} onEditField={onEditField} editableName />
        </div>
      </Demo>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { ReviewCandidateCards };
/* - - - - - - - - - - - - - - - - */
