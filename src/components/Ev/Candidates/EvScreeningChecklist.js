/* src/components/Ev/Candidates/EvScreeningChecklist.js | Screening questions as a tick-off checklist | Sree | 2026-06-30 */

"use client";

import { Check } from "lucide-react";

import { FxSectionHeader } from "@/components/FxUI/DataDisplay";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  The standard screening questions as a recruiter checklist — tick each one off as it's asked on the call.
  Container + progress header + slim bar; checked rows get a primary tick and struck-through text. Controlled
  (`checked` = array of question ids, `onToggle(id)`). Pass `readOnly` to render a non-interactive review
  (e.g. inside the Pre-Screen Result sheet) — no buttons, no hover, just the covered state.
*/
function RowInner({ checked, text }) {
  return (
    <>
      <span
        className={cn(
          "mt-[1px] flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors",
          checked ? "border-[var(--fx-primary)] bg-[var(--fx-primary)] text-[var(--fx-primary-foreground)]" : "border-[var(--fx-border-strong)] bg-[var(--fx-surface)] group-hover:border-[var(--fx-primary)]",
        )}
      >
        {checked ? <Check className="size-3" strokeWidth={3} /> : null}
      </span>
      <span className={cn("text-[14px] leading-[20px]", checked ? "text-[var(--fx-text-muted)] line-through" : "text-[var(--fx-text)]")}>{text}</span>
    </>
  );
}

function EvScreeningChecklist({ questions = [], checked = [], onToggle, readOnly = false, title = "Pre-Screening Questions to ask" }) {
  const total = questions.length;
  const done = questions.filter((item) => checked.includes(item.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="overflow-hidden rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)]">
      <FxSectionHeader
        title={title}
        actions={<span className="text-[12px] font-medium tabular-nums text-[var(--fx-text-muted)]">{done} / {total} covered</span>}
      />
      {/* Progress thread. */}
      <div className="h-[3px] w-full bg-[var(--fx-surface-hover)]">
        <div className="h-full rounded-r-full bg-[var(--fx-primary)] transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>

      <ul className="divide-y divide-[var(--fx-border)]">
        {questions.map((item, index) => {
          const isChecked = checked.includes(item.id);
          return (
            <li key={item.id ?? index}>
              {readOnly ? (
                <div className="flex w-full items-start gap-3 px-4 py-3">
                  <RowInner checked={isChecked} text={item.question} />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onToggle?.(item.id)}
                  aria-pressed={isChecked}
                  className="group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--fx-surface-hover)]"
                >
                  <RowInner checked={isChecked} text={item.question} />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvScreeningChecklist };
/* - - - - - - - - - - - - - - - - */
