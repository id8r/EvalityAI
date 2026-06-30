/* src/components/Ev/Candidates/EvManualScreeningSheet.js | Manual Pre-Screening sheet (candidate + resume | screening tabs) | Sree | 2026-06-30 */

"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { FxButton, FxInput, FxTextarea } from "@/components/FxUI/Forms";
import { FxSheet } from "@/components/FxUI/Overlays/FxSheet";
import { FxTabs } from "@/components/FxUI/Navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EvCandidateCard } from "@/components/Ev/Candidates/EvCandidateCard";
import { EvResumePanel } from "@/components/Ev/Candidates/EvResumePanel";
import { EvScreeningQuestionList } from "@/components/Ev/Candidates/EvScreeningQuestionList";
import { DEFAULT_SCREENING_QUESTIONS, buildAiScreeningQuestions } from "@/lib/EvScreening";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Manual Pre-Screening — opened from the Unscreened "Manual Pre-Screen" action. Two columns:
    left  = candidate card (Fit Score) + resume (collapsible via the header toggle)
    right = "Standard Screening Questions" (default — Standard is free) and "AI Generated Questions" tabs
  Header Previous/Next traverse the candidate list. Footer: Reject (confirm dialog upstream) · Move to Prescreen.
  Per-candidate form state resets via a `key` remount from the parent.
*/

const FIELD_LABEL = "text-[13px] font-medium text-[var(--fx-text-muted)]";
const PREVIEW_TABS = [
  { value: "standard", label: "Standard Screening Questions" }, // default — Standard avoids AI cost
  { value: "ai", label: "AI Generated Questions" },
];

function salaryToInput(money) {
  const amount = money?.amount;
  return amount == null ? "" : Number(amount).toLocaleString("en-IN");
}

// Inline radio row (Yes/No, Specific Date/Availability) — the FxRadioGroupField card style is too heavy here.
function InlineRadio({ value, onValueChange, options }) {
  return (
    <RadioGroup value={value} onValueChange={onValueChange} className="flex flex-row flex-wrap items-center gap-x-6 gap-y-2">
      {options.map((option) => (
        <label key={option.value} className="flex cursor-pointer items-center gap-2">
          <RadioGroupItem value={option.value} />
          <span className="text-[14px] leading-[20px] text-[var(--fx-text)]">{option.label}</span>
        </label>
      ))}
    </RadioGroup>
  );
}

// Initial Standard-tab form for a candidate (prefilled from the row). State is lifted to the sheet so the values
// can be persisted on "Move to Prescreen".
function initStandardForm(row) {
  return {
    interested: "yes",
    joinBy: row?.availabilityDays != null ? "days" : "date",
    joinDate: "",
    joinDays: row?.availabilityDays != null ? String(row.availabilityDays) : "",
    currentSalary: salaryToInput(row?.currentSalary),
    salaryExpectation: salaryToInput(row?.expectedSalary),
    fitScore: row?.matchScore == null ? "" : String(row.matchScore),
    note: "",
  };
}

function StandardScreening({ form, setField }) {
  return (
    <div className="space-y-5">
      <div className="space-y-5 rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] p-4">
        <div className="space-y-2">
          <p className="text-[14px] leading-[20px] text-[var(--fx-text)]">Is the candidate interested in the role?</p>
          <InlineRadio value={form.interested} onValueChange={(value) => setField("interested", value)} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
        </div>

        <div className="space-y-2">
          <p className="text-[14px] leading-[20px] text-[var(--fx-text)]">By when can the candidate join?</p>
          <InlineRadio value={form.joinBy} onValueChange={(value) => setField("joinBy", value)} options={[{ value: "date", label: "Specific Date" }, { value: "days", label: "Availability in Days" }]} />
          {form.joinBy === "date" ? (
            <FxInput type="date" value={form.joinDate} onChange={(event) => setField("joinDate", event.target.value)} clearable={false} className="w-[220px]" />
          ) : (
            <div className="flex items-center gap-2">
              <FxInput type="number" min={0} value={form.joinDays} onChange={(event) => setField("joinDays", event.target.value)} clearable={false} className="w-[96px]" inputClassName="text-center" />
              <span className="text-[14px] text-[var(--fx-text-muted)]">Days</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <p className={FIELD_LABEL}>Current Salary</p>
            <FxInput value={form.currentSalary} onChange={(event) => setField("currentSalary", event.target.value)} clearable={false} inputClassName="text-right" />
          </div>
          <div className="space-y-1.5">
            <p className={FIELD_LABEL}>Salary Expectation</p>
            <FxInput value={form.salaryExpectation} onChange={(event) => setField("salaryExpectation", event.target.value)} clearable={false} inputClassName="text-right" />
          </div>
        </div>

        <div className="space-y-1.5">
          <p className={FIELD_LABEL}>Fit Score</p>
          <FxInput value={form.fitScore} onChange={(event) => setField("fitScore", event.target.value)} clearable={false} inputClassName="text-right" />
        </div>

        <div className="space-y-1.5">
          <p className={FIELD_LABEL}>Recruiter Notes</p>
          <FxTextarea value={form.note} onChange={(event) => setField("note", event.target.value)} rows={4} placeholder="Add notes from the conversation" />
        </div>
      </div>

      {/* Same standard question set as job creation (read-only here) — no hint notes, just the questions. */}
      <EvScreeningQuestionList questions={DEFAULT_SCREENING_QUESTIONS} showNote={false} />
    </div>
  );
}

function EvManualScreeningSheet({ open, onOpenChange, row, rows = [], onNavigate, onReject, onMoveToPrescreen, job }) {
  const [tab, setTab] = useState("standard");
  const [showLeft, setShowLeft] = useState(true);
  // Standard-tab form lifted here (sheet is keyed by row id upstream → re-inits per candidate).
  const [form, setForm] = useState(() => initStandardForm(row));
  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const candidate = row?.candidate ?? null;
  const index = row ? rows.findIndex((item) => item.id === row.id) : -1;
  const hasPrev = index > 0;
  const hasNext = index >= 0 && index < rows.length - 1;
  const fitValue = row?.matchScore == null ? "—" : `${row.matchScore}%`;
  const aiQuestions = useMemo(() => buildAiScreeningQuestions(job?.core?.title), [job?.core?.title]);

  const headerActions = (
    <>
      {/* Previous/Next traverse the candidate list (Manual only). */}
      <FxButton variant="ghost" size="sm" disabled={!hasPrev} onClick={() => hasPrev && onNavigate?.(rows[index - 1])}>
        <ArrowLeft className="size-4" />
        Previous
      </FxButton>
      <FxButton variant="ghost" size="sm" disabled={!hasNext} onClick={() => hasNext && onNavigate?.(rows[index + 1])}>
        Next
        <ArrowRight className="size-4" />
      </FxButton>
      <button
        type="button"
        aria-label={showLeft ? "Collapse resume" : "Expand resume"}
        title={showLeft ? "Collapse resume" : "Expand resume"}
        onClick={() => setShowLeft((current) => !current)}
        className="flex size-8 items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
      >
        {showLeft ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
      </button>
    </>
  );

  return (
    <FxSheet open={open} onOpenChange={onOpenChange} side="right" size="xl" expandable>
      <FxSheet.Header title="Manual Pre-Screening" actions={headerActions} />
      {row ? (
        <>
          <FxSheet.Body className="flex min-h-0 flex-col overflow-hidden">
            <div className={cn("grid min-h-0 flex-1 gap-4", showLeft ? "lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]" : "lg:grid-cols-1")}>
              {showLeft ? (
                <div className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1">
                  <EvCandidateCard candidate={candidate} application={row.app} mode="summary" score={{ label: "Fit Score", value: fitValue }} />
                  <EvResumePanel candidate={candidate} />
                </div>
              ) : null}
              {showLeft ? <div className="hidden w-px bg-[var(--fx-border)] lg:block" /> : null}

              <div className="flex min-h-0 flex-col overflow-hidden rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)]">
                <div className="flex-none border-b border-[var(--fx-border)] px-4 py-2.5">
                  <FxTabs variant="underlined" value={tab} onValueChange={setTab} tabs={PREVIEW_TABS} />
                </div>
                {/* Both rendered, inactive hidden — toggling tabs keeps the Standard form's entered values. */}
                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                  <div className={tab === "standard" ? undefined : "hidden"}>
                    <StandardScreening form={form} setField={setField} />
                  </div>
                  <div className={tab === "ai" ? undefined : "hidden"}>
                    <EvScreeningQuestionList questions={aiQuestions} />
                  </div>
                </div>
              </div>
            </div>
          </FxSheet.Body>

          <FxSheet.Footer
            footerStart={
              <FxButton variant="destructive" size="md" onClick={() => onReject?.(row)}>Reject</FxButton>
            }
          >
            <FxButton variant="primary" size="md" className="min-w-[160px]" onClick={() => onMoveToPrescreen?.(row, form)}>Move to Prescreen</FxButton>
          </FxSheet.Footer>
        </>
      ) : (
        <FxSheet.Body />
      )}
    </FxSheet>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvManualScreeningSheet };
/* - - - - - - - - - - - - - - - - */
