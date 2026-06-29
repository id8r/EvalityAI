/* src/components/Ev/Candidates/EvCvMatchBreakdown.js | Overall CV Match Score breakdown (presentational) | Sree | 2026-06-29 */

import { cn, clampPct, formatPct, scoreTone } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Body content for the "Overall CV Match Score" sheet (opened from Unscreened → Match Score cell).
  Presentational only — the candidate name/role belong to the sheet header, not this component.

    <EvCvMatchBreakdown overall="64%" scores={{ jdMatch: 66.67, companyDomain: 60, education: 70, ... }} />

  `overall`: number (→ "64%") or preformatted string. `scores`: a key→percent (0–100) map; keys match DIMENSIONS.
  Dimension labels + descriptions are fixed UI copy here; only the scores vary per candidate (passed in).
*/

const DIMENSIONS = [
  { key: "jdMatch", label: "JD Match", description: "This candidate meets some of the role requirements, but key skills or experience areas may need further validation during screening." },
  { key: "companyDomain", label: "Company Tier & Domain", description: "Measures alignment between the candidate's industry, domain experience, and the hiring context." },
  { key: "education", label: "Education", description: "Evaluates academic background and relevance to the role requirements." },
  { key: "communication", label: "Communication & Language", description: "Assesses written and verbal communication indicators available from the profile and resume." },
  { key: "culturalSoft", label: "Cultural & Soft Skills", description: "Estimates alignment with collaboration, ownership, adaptability, and workplace expectations." },
  { key: "bonus", label: "Bonus Attributes", description: "Additional strengths that may provide an advantage beyond the core role requirements." },
];

const FOOTER_NOTE = "Scores are intended to support recruiter decisions and should be considered alongside screening outcomes and candidate interactions.";

// Numbers stay a static color (the bar carries the tone) so the cards don't read gaudy.
const SCORE_NUMBER_CLASS = "text-[var(--fx-text)]";
// Bars are large filled areas, so soften them to ~70% of the tone (mixed with surface).
const TONE_BAR = {
  success: "bg-[color:color-mix(in_srgb,var(--fx-success)_70%,var(--fx-surface))]",
  warning: "bg-[color:color-mix(in_srgb,var(--fx-warning)_70%,var(--fx-surface))]",
  danger: "bg-[color:color-mix(in_srgb,var(--fx-danger)_70%,var(--fx-surface))]",
  neutral: "bg-[var(--fx-text-muted)]",
};

function ScoreBar({ value, tone }) {
  return (
    <div className="h-[6px] w-full overflow-hidden rounded-full bg-[var(--fx-bg-soft)]">
      <div className={cn("h-full rounded-full", TONE_BAR[tone])} style={{ width: `${clampPct(value)}%` }} />
    </div>
  );
}

// `showOverall` toggles the "Overall CV Match Score" header row — off when an identity card above already carries it.
function EvCvMatchBreakdown({ overall, scores = {}, showOverall = true, className }) {
  return (
    <div className={cn("space-y-4", className)}>
      {showOverall ? (
        <div className="flex items-center justify-between gap-3 px-1">
          <span className="text-[17px] font-semibold leading-[24px] text-[var(--fx-text)]">Overall CV Match Score</span>
          <span className="text-[17px] font-semibold leading-[24px] text-[var(--fx-text)]">{formatPct(overall)}</span>
        </div>
      ) : null}

      <div className="space-y-3">
        {DIMENSIONS.map((dim) => {
          const tone = scoreTone(scores[dim.key]);
          return (
            <div key={dim.key} className="space-y-2 rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-3.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[14px] font-medium leading-[20px] text-[var(--fx-text-subtle)]">{dim.label}</span>
                <span className={cn("text-[14px] font-medium leading-[20px] tabular-nums", SCORE_NUMBER_CLASS)}>{formatPct(scores[dim.key])}</span>
              </div>
              <ScoreBar value={scores[dim.key]} tone={tone} />
              <p className="text-[13px] leading-[20px] text-[var(--fx-text-muted)]">{dim.description}</p>
            </div>
          );
        })}
      </div>

      <p className="px-1 text-[13px] leading-[20px] text-[var(--fx-text-muted)]">{FOOTER_NOTE}</p>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvCvMatchBreakdown };
/* - - - - - - - - - - - - - - - - */
