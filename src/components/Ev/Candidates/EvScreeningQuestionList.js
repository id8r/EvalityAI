/* src/components/Ev/Candidates/EvScreeningQuestionList.js | Read-only screening question cards (shared) | Sree | 2026-06-30 */

"use client";

import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

// Renders a numbered list of screening questions as cards: "Question N" + the question + an optional hint note.
// Used by the Manual Pre-Screening sheet for both the Standard and AI question sets (same card treatment).
const QUESTION_CARD = "rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] p-4";

function EvScreeningQuestionList({ questions = [], showNote = true, className }) {
  if (!questions.length) {
    return <p className="px-1 text-[13px] text-[var(--fx-text-muted)]">No questions configured.</p>;
  }
  return (
    <div className={cn("space-y-3", className)}>
      {questions.map((item, index) => (
        <div key={item.id ?? index} className={QUESTION_CARD}>
          <p className="text-[12px] font-medium text-[var(--fx-text-muted)]">Question {index + 1}</p>
          <p className="mt-1.5 text-[14px] leading-[22px] text-[var(--fx-text)]">{item.question}</p>
          {showNote && item.note ? <p className="mt-2 text-[13px] leading-[20px] text-[var(--fx-text-muted)]">{item.note}</p> : null}
        </div>
      ))}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvScreeningQuestionList };
/* - - - - - - - - - - - - - - - - */
