/* src/components/Ev/Candidates/EvCandidateProgress.js | Compact candidate stage tracker | Sree | 2026-06-29 */

"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  A compact "where is this candidate right now" tracker. Reads at a glance, costs little vertical space.

    <EvCandidateProgress current="interviewing" dates={{ unscreened: "2026-06-10", pre_screened: "2026-06-12", ... }} />

  - `current`   key of the stage the candidate is in (rendered as in-progress). Reaching the last stage = done.
  - `dates`     map of stepKey → completion date (string | Date); rendered under each cleared stage.
  - `steps`     override the stage list. Each: { key, label, date?, status? }. Defaults to the 6 hiring stages.
  - `orientation` "horizontal" (default, tiny height) | "vertical" (single-line rows for narrow columns).
  status (auto unless set per step): complete · current · upcoming · rejected.
*/

const DEFAULT_STEPS = [
  { key: "unscreened", label: "Unscreened" },
  { key: "pre_screened", label: "Pre-Screened" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interviewing", label: "Interviewing" },
  { key: "offered", label: "Offered" },
  { key: "joined", label: "Joined" },
];

const NODE_BASE = "relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full";

/*
  Stage visuals live here so line and node colors are easy to tweak in one place.
  - COMPLETE: historical/completed stage
  - CURRENT: active stage
  - UPCOMING: future stage
  - REJECTED: explicit rejected stage
*/
const STAGE_LINE_COLOR_COMPLETE = "bg-[var(--fx-border-old)]";
const STAGE_LINE_COLOR_PENDING = "bg-[var(--fx-border)]";
const STAGE_NODE_COMPLETE = cn(NODE_BASE, "bg-[var(--fx-success-old)] text-white");
const STAGE_NODE_REJECTED = cn(NODE_BASE, "bg-[var(--fx-danger)] text-white");
const STAGE_NODE_CURRENT = cn(NODE_BASE, "border-2 border-[var(--fx-accent)] bg-[var(--fx-surface)]");
const STAGE_NODE_UPCOMING = cn(NODE_BASE, "border border-[var(--fx-border-strong)] bg-[var(--fx-surface)]");
const STAGE_LABEL_UPCOMING = "text-[var(--fx-text-muted)]";
const STAGE_LABEL_ACTIVE = "text-[var(--fx-text)]";
const STAGE_SUBLABEL_CURRENT = "font-medium text-[var(--fx-primary)]";
const STAGE_SUBLABEL_OTHERS = "text-[var(--fx-text-muted)]";

function formatDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
}

// current wins; otherwise infer from the run of leading stages that already have a date.
function resolveCurrentIndex(steps, current, dates) {
  if (current) {
    const idx = steps.findIndex((step) => step.key === current);
    if (idx >= 0) return idx;
  }
  let idx = 0;
  for (const step of steps) {
    if (step.date ?? dates?.[step.key]) idx += 1;
    else break;
  }
  return Math.min(idx, steps.length - 1);
}

function deriveItems(steps, current, dates) {
  const currentIndex = resolveCurrentIndex(steps, current, dates);
  const lastIndex = steps.length - 1;
  return steps.map((step, index) => {
    let status = step.status;
    if (!status) {
      if (index < currentIndex) status = "complete";
      else if (index === currentIndex) status = index === lastIndex ? "complete" : "current"; // final stage reached = done
      else status = "upcoming";
    }
    return { ...step, status, date: step.date ?? dates?.[step.key] ?? null, isLast: index === lastIndex };
  });
}

function StepNode({ status, className }) {
  if (status === "complete") {
    return (
      <span className={cn(STAGE_NODE_COMPLETE, className)}>
        <Check className="size-3" strokeWidth={3} />
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className={cn(STAGE_NODE_REJECTED, className)}>
        <X className="size-3" strokeWidth={3} />
      </span>
    );
  }
  if (status === "current") {
    return (
      <span className={cn(STAGE_NODE_CURRENT, className)}>
        <span className="size-[8px] rounded-full bg-[var(--fx-accent)]" />
      </span>
    );
  }
  return (
    <span className={cn(STAGE_NODE_UPCOMING, className)}>
      <span className="size-[5px] rounded-full bg-[var(--fx-border-strong)]" />
    </span>
  );
}

function captionSub(item) {
  if (item.status === "current") return "In progress";
  if (item.status === "rejected") return formatDate(item.date) ?? "Rejected";
  return formatDate(item.date) ?? "—";
}

function EvCandidateProgress({ steps = DEFAULT_STEPS, current, dates, orientation = "horizontal", className }) {
  const items = deriveItems(steps, current, dates);

  if (orientation === "vertical") {
    return (
      <ol className={cn("flex flex-col", className)}>
        {items.map((item) => (
          <li key={item.key} className="relative flex gap-3 pb-3 last:pb-0">
            {!item.isLast ? (
              // Vertical connector: this is the line that draws from a stage node down to the next stage.
              // Completed stages use `--fx-border-old`; incomplete stages use the neutral border token.
              <span
                aria-hidden="true"
                className={cn("absolute left-[9px] top-5 bottom-0 w-[2px]", item.status === "complete" ? STAGE_LINE_COLOR_COMPLETE : STAGE_LINE_COLOR_PENDING)}
              />
            ) : null}
            <StepNode status={item.status} />
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2 pt-[2px]">
              <span className={cn("truncate text-[12px] font-medium leading-[16px]", item.status === "upcoming" ? STAGE_LABEL_UPCOMING : STAGE_LABEL_ACTIVE)} title={item.label}>
                {item.label}
              </span>
              {/* Stage sublabel: date or status text shown to the right of the stage label. */}
              <span className={cn("shrink-0 text-[11px] leading-[16px]", STAGE_SUBLABEL_OTHERS)}>{captionSub(item)}</span>
            </div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className={cn("flex w-full items-start", className)}>
      {items.map((item) => (
        <li key={item.key} className="relative flex min-w-0 flex-1 flex-col items-center">
          {!item.isLast ? (
            // Horizontal connector: this is the line between stage circles in the top row.
            // Completed stages use `--fx-border-old`; pending stages use the neutral border token.
            <span
              aria-hidden="true"
              className={cn("absolute left-1/2 top-[9px] h-[2px] w-full", item.status === "complete" ? "bg-[var(--fx-border-old)]" : "bg-[var(--fx-border)]")}
            />
          ) : null}
          <StepNode status={item.status} />
          <div className="mt-2 w-full px-1 text-center">
            {/* Stage label: the stage name under each circle. */}
            <div className={cn("truncate text-[11px] font-medium leading-[14px]", item.status === "upcoming" ? STAGE_LABEL_UPCOMING : STAGE_LABEL_ACTIVE)} title={item.label}>
              {item.label}
            </div>
            {/* Stage sublabel: date/current state under the stage label. */}
            <div className={cn("mt-0.5 truncate text-[10px] leading-[13px]", item.status === "current" ? STAGE_SUBLABEL_CURRENT : STAGE_SUBLABEL_OTHERS)}>
              {captionSub(item)}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvCandidateProgress, DEFAULT_STEPS as EV_CANDIDATE_PROGRESS_STEPS };
/* - - - - - - - - - - - - - - - - */
