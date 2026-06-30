/* src/components/Ev/Candidates/EvCandidateCard.js | Candidate decision card (minimal·compact·summary·full) | Sree | 2026-06-29 */

import { ChevronDown, History } from "lucide-react";

import { FxEditableField } from "@/components/FxUI/Forms";
import { FxBadge } from "@/components/FxUI/DataDisplay";
import { formatMoney } from "@/lib/EvFormat";
import { stageLabel } from "@/lib/EvSelectors";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn, scoreTone } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

// Presentational, composed of fixed regions: identity header (name) · primary metric (`score` = {label,value},
// top-right, colored by value) · property list · optional `footer`.
// Property list comes from EITHER:
//   - `fields` (composition): [{ label, value, align? }] — value may be a node (e.g. icon + text). Used to reuse
//     this card beyond candidate data (e.g. Pre-Screen Result: metric "Screening Score 71%" + screening fields).
//   - else the candidate registry by `mode` (additive): minimal = name (+ exp/location, score); compact = +Email·Phone;
//     summary = +Current/Expected CTC, Notice Period, CV Added Date; full = +Historic Applications.
// Email/Phone render as mailto/tel links; bordered={false} drops the frame. Editing (never persists; pencil on hover):
// with onEditField, Email+Phone editable by default (editable={false} → read-only), Name only with editableName.
// Data: candidate = person, application = job-specific, history = past apps (caller-supplied; accordion in full mode).

const FIELDS = {
  experience: { label: "Experience", get: (c) => formatYears(c?.totalExperienceYears) },
  location: { label: "Location", get: (c) => c?.location || null },
  email: { label: "Email", get: (c) => c?.email || null, href: (v) => `mailto:${v}` },
  phone: { label: "Phone", get: (c) => c?.phone || null, href: (v) => `tel:${String(v).replace(/[^\d+]/g, "")}` },
  currentCtc: { label: "Current CTC", get: (c) => formatSalary(c?.currentSalary) },
  expectedCtc: { label: "Expected CTC", get: (c, a) => formatSalary(a?.qualification?.expectedSalary) },
  notice: { label: "Notice Period", get: (c, a) => formatNotice(a?.qualification?.availability) },
  cvAdded: { label: "CV Added Date", get: (c, a) => formatDate(a?.appliedAt ?? c?.resume?.uploadedAt ?? c?.createdAt) },
};

// Facing pairs per mode — [leftField, rightField]. Name + experience + score render in the header, not here.
const MODE_PAIRS = {
  minimal: [],
  compact: [["email", "phone"]],
  summary: [["email", "phone"], ["currentCtc", "expectedCtc"], ["notice", "cvAdded"]],
  full: [["email", "phone"], ["currentCtc", "expectedCtc"], ["notice", "cvAdded"]],
};

// Result badge tone per final stage of a past application.
const HISTORY_STAGE_TONE = {
  unscreened: "neutral", pre_screened: "info", shortlisted: "info",
  interviewing: "warning", offered: "success", joined: "success",
  dropped: "danger", rejected: "danger",
};

const TONE_TEXT = {
  success: "text-[var(--fx-success)]",
  warning: "text-[var(--fx-warning)]",
  danger: "text-[var(--fx-danger)]",
  neutral: "text-[var(--fx-text)]",
};

function formatYears(years) {
  return years == null ? null : `${years} year${years === 1 ? "" : "s"}`;
}
function formatSalary(salary) {
  return salary?.amount == null ? null : formatMoney(salary.amount, salary.currency);
}
function formatNotice(availability) {
  const days = availability?.days;
  if (days == null) return null;
  return days <= 0 ? "Immediate" : `${days} day${days === 1 ? "" : "s"}`;
}
function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
const LABEL_CLASS = "text-[12px] font-medium leading-[16px] text-[var(--fx-text-muted)]";
const VALUE_CLASS = "text-[14px] leading-[22px] text-[var(--fx-text)]";
const SUB_CLASS = "text-[13px] leading-[18px] text-[var(--fx-text-muted)]";

function FieldCell({ fieldKey, candidate, application, align, canEdit, onEditField }) {
  const def = FIELDS[fieldKey];
  if (!def) return <div />;
  const value = def.get(candidate, application);
  const right = align === "right";
  const href = value ? def.href?.(value) : null; // email/phone become mailto:/tel: links

  if (canEdit) {
    return <FxEditableField label={def.label} value={value ?? ""} href={href} placeholder="N/A" align={align} pencil="left" onSave={(next) => onEditField(fieldKey, next)} />;
  }
  return (
    <div className={cn("flex min-w-0 flex-col gap-[2px]", right && "items-end")}>
      <span className={cn(LABEL_CLASS, right && "text-right")}>{def.label}</span>
      {href ? (
        <a href={href} title={typeof value === "string" ? value : undefined} className={cn("max-w-full truncate text-[14px] leading-[22px] text-[var(--fx-primary)] hover:underline", right && "text-right")}>
          {value}
        </a>
      ) : (
        <span className={cn(VALUE_CLASS, "max-w-full truncate", right && "text-right")} title={typeof value === "string" ? value : undefined}>{value ?? "N/A"}</span>
      )}
    </div>
  );
}

// Caller-supplied field (used via the `fields` prop) — a plain label/value pair; value may be a React node
// (e.g. an icon + text). No registry, no editing, no links — just piped-in content.
function CustomFieldCell({ field, align }) {
  const right = align === "right";
  return (
    <div className={cn("flex min-w-0 flex-col gap-[2px]", right && "items-end")}>
      <span className={cn(LABEL_CLASS, right && "text-right")}>{field.label}</span>
      <span className={cn(VALUE_CLASS, "max-w-full", right && "text-right")}>{field.value ?? "—"}</span>
    </div>
  );
}

// The whole section is one native <details> accordion (zero JS); expanded, each past application is a small card.
function HistorySection({ history }) {
  const count = history?.length ?? 0;
  return (
    <details className="overflow-hidden rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] [&[open]_.fx-chev]:rotate-180 [&[open]_summary]:border-[var(--fx-border)]">
      <summary className="flex cursor-pointer list-none items-center gap-2 border-b border-transparent px-3 py-2 transition-colors hover:bg-[var(--fx-surface-hover)] [&::-webkit-details-marker]:hidden">
        <History className="size-4 shrink-0 text-[var(--fx-text-muted)]" />
        <span className="text-[13px] font-semibold leading-[18px] text-[var(--fx-text)]">Historic Applications</span>
        {count ? (
          <span className="rounded-full border border-[var(--fx-border-light)] bg-[var(--fx-surface)] px-1.5 text-[11px] font-medium leading-[18px] tabular-nums text-[var(--fx-text-muted)]">{count}</span>
        ) : null}
        <ChevronDown className="fx-chev ml-auto size-4 shrink-0 text-[var(--fx-text-muted)] transition-transform" />
      </summary>
      {count ? (
        <div className="max-h-[320px] space-y-2 overflow-y-auto p-2.5">
          {history.map((item, index) => (
            <div
              key={`history-${item.applicationId ?? item.jobId ?? item.stage ?? item.jobTitle ?? index}`}
              className="rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-medium leading-[20px] text-[var(--fx-text)]">{item.jobTitle ?? "Untitled role"}</div>
                  {item.company ? <div className="truncate text-[12px] leading-[16px] text-[var(--fx-text-muted)]">{item.company}</div> : null}
                </div>
                {item.stage ? (
                  <FxBadge tone={HISTORY_STAGE_TONE[item.stage] ?? "neutral"} variant="outline" size="sm" className="shrink-0 rounded-[4px]">
                    {stageLabel(item.stage)}
                  </FxBadge>
                ) : null}
              </div>
              {item.appliedAt || item.updatedAt ? (
                <div className="mt-2 flex items-center justify-between gap-3 text-[12px] leading-[16px] text-[var(--fx-text-muted)]">
                  <span>{item.appliedAt ? `Applied ${formatDate(item.appliedAt)}` : ""}</span>
                  {item.updatedAt ? <span>Updated {formatDate(item.updatedAt)}</span> : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="p-3 text-[13px] text-[var(--fx-text-muted)]">No previous applications.</p>
      )}
    </details>
  );
}

function EvCandidateCard({ candidate, application, mode = "summary", score, fields, footer, onEditField, editable = true, editableName = false, history, bordered = true, className }) {
  const editing = typeof onEditField === "function";
  // Email/Phone editable by default (gate with editable={false}); Name only when editableName is set.
  const canEdit = (field) => {
    if (!editing) return false;
    if (field === "name") return Boolean(editableName);
    return editable && (field === "email" || field === "phone");
  };
  const pairs = MODE_PAIRS[mode] ?? MODE_PAIRS.summary;
  // Caller-supplied `fields` drive a composed card (e.g. Pre-Screen Result); the candidate identity subtitle is
  // suppressed since the property list isn't candidate-registry data.
  const subtitle = fields ? "" : [FIELDS.experience.get(candidate), FIELDS.location.get(candidate)].filter(Boolean).join(" · ");
  const nameClass = cn(FX_TYPOGRAPHY.title, "text-[var(--fx-text)]");

  return (
    <div className={cn(bordered && "rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-[16px]", className)}>
      <div className="space-y-5">
        {/* Header: name | score (row 1) and experience | score label (row 2), neatly aligned. */}
        <div className="space-y-0.5">
          <div className="flex items-baseline justify-between gap-4">
            <div className="min-w-0 flex-1">
              {canEdit("name") ? (
                <FxEditableField value={candidate?.name ?? ""} placeholder="N/A" onSave={(next) => onEditField("name", next)} valueClassName={nameClass} />
              ) : (
                <h3 className={cn(nameClass, "truncate")}>{candidate?.name || "Unnamed candidate"}</h3>
              )}
            </div>
            {score ? <span className={cn(FX_TYPOGRAPHY.title, "shrink-0 tabular-nums", TONE_TEXT[scoreTone(score.value)])}>{score.value}</span> : null}
          </div>

          {subtitle || score?.label ? (
            <div className="flex items-baseline justify-between gap-4">
              <span className={cn(SUB_CLASS, "min-w-0 flex-1 truncate")}>{subtitle}</span>
              {score?.label ? <span className={cn(SUB_CLASS, "shrink-0")}>{score.label}</span> : null}
            </div>
          ) : null}
        </div>

        {/* Property list — caller-supplied `fields` (composition), else the mode's registry pairs (candidate default). */}
        {fields ? (
          fields.length ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-[16px]">
              {/* Facing pairs like the registry grid: left column left-aligned, right column right-aligned. */}
              {fields.map((field, index) => (
                <CustomFieldCell key={field.label ?? index} field={field} align={field.align ?? (index % 2 === 0 ? "left" : "right")} />
              ))}
            </div>
          ) : null
        ) : pairs.length ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-[16px]">
            {pairs.flatMap(([left, right]) => [
              <FieldCell key={left} fieldKey={left} candidate={candidate} application={application} align="left" canEdit={canEdit(left)} onEditField={onEditField} />,
              <FieldCell key={right} fieldKey={right} candidate={candidate} application={application} align="right" canEdit={canEdit(right)} onEditField={onEditField} />,
            ])}
          </div>
        ) : null}

        {mode === "full" ? <HistorySection history={history} /> : null}
        {/* Optional footer/actions region. */}
        {footer || null}
      </div>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvCandidateCard };
/* - - - - - - - - - - - - - - - - */
