/* src/components/Ev/Candidates/EvPreScreenResultSheet.js | Pre-Screen Result — read-only review (manual · email · AI) | Sree | 2026-06-30 */

"use client";

import { useState } from "react";
import { Play } from "lucide-react";

import { FxButton } from "@/components/FxUI/Forms";
import { FxSheet } from "@/components/FxUI/Overlays/FxSheet";
import { FxTabs } from "@/components/FxUI/Navigation";
import { EvCandidateCard } from "@/components/Ev/Candidates/EvCandidateCard";
import { EvCandidatePreview } from "@/components/Ev/Candidates/EvCandidatePreview";
import { EvEmailHistory } from "@/components/Ev/Candidates/EvEmailHistory";
import { EvScreeningChecklist } from "@/components/Ev/Candidates/EvScreeningChecklist";
import {
  DEFAULT_SCREENING_QUESTIONS,
  buildAiCallAnalysis,
  buildAiTranscript,
  buildVoiceRecording,
  screeningTypeMeta,
} from "@/lib/EvScreening";
import { formatMoney } from "@/lib/EvFormat";
import { useScreeningExpanded } from "@/lib/useScreeningExpanded";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Pre-Screen Result — opened from the Fit Score pill / kebab. READ-ONLY review of how a candidate was screened;
  never a screening form. Three variants by `screening.mode`:
    manual → Details Retrieved (everything captured + covered-questions checklist). No résumé pane.
    email  → Details Retrieved (mostly "Not answered") + Email History timeline. Résumé pane.
    ai     → Details Retrieved + AI Call Analysis + Transcript + Voice Recording (all demo-synthesized). Résumé pane.
  Footer: Reject (reject-with-note upstream) · Shortlist (move to Shortlisted upstream).
*/
const CARD = "rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)]";
const NOT_ANSWERED = ["Not answered", "Not entered"];

function capitalize(value) {
  const text = String(value ?? "");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "—";
}
function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function formatTime(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function money(amountOrObj, currency) {
  if (amountOrObj == null) return null;
  if (typeof amountOrObj === "object") return amountOrObj.amount != null ? formatMoney(amountOrObj.amount, amountOrObj.currency) : null;
  return formatMoney(amountOrObj, currency ?? "INR");
}

// The "Details Retrieved" field set varies by how the candidate was screened.
function detailFields(row, mode) {
  const app = row?.app ?? {};
  const q = app.qualification ?? {};
  const manual = app.screening?.manual ?? {};
  const availDays = q.availability?.days;
  const availLabel = availDays != null ? `${availDays} days` : q.availability?.date || "Not answered";
  const fit = row?.matchScore != null ? `${row.matchScore}%` : "Not answered";
  const currentCtc = money(row?.currentSalary) ?? "Not answered";
  const expectedCtc = money(row?.expectedSalary) ?? "Not answered";

  if (mode === "manual") {
    // Recruiter notes are surfaced in their own section below, not as a grid field.
    return [
      { label: "Interested", value: manual.interested ? (manual.interested === "yes" ? "Yes" : "No") : "Not answered" },
      { label: "Availability", value: availLabel },
      { label: "Current CTC", value: money(manual.currentSalary, row?.currentSalary?.currency) ?? currentCtc },
      { label: "Expected CTC", value: expectedCtc },
      { label: "Fit Score", value: fit },
    ];
  }
  if (mode === "ai_call" || mode === "ai") {
    return [
      { label: "Interested", value: "Yes" },
      { label: "Notice Period", value: availDays != null ? `${availDays} days` : "Not answered" },
      { label: "Location Preference", value: "Not answered" },
      { label: "Current CTC", value: currentCtc },
      { label: "Expected CTC", value: expectedCtc },
      { label: "Current Company", value: row?.currentCompany || "Not answered" },
    ];
  }
  return [
    { label: "Interested", value: "Not answered" },
    { label: "Notice Period", value: "Not answered" },
    { label: "Current CTC", value: "Not answered" },
    { label: "Expected CTC", value: "Not answered" },
    { label: "Current Company", value: "Not answered" },
  ];
}

// Read-only recruiter notes — the running notes from the candidate (incl. the Unscreened stage) plus, for
// manual, the note captured on the screening call. Newest first.
function recruiterNotes(row, mode) {
  const app = row?.app ?? {};
  const notes = (app.notes ?? []).map((note) => ({ text: note.text, at: note.at, label: null }));
  const callNote = mode === "manual" ? app.screening?.manual?.note?.trim() : "";
  if (callNote) notes.push({ text: callNote, at: app.screening?.completedAt ?? null, label: "From screening call" });
  return notes.filter((note) => note.text?.trim()).sort((a, b) => new Date(b.at ?? 0) - new Date(a.at ?? 0));
}

function RecruiterNotes({ notes }) {
  return (
    <div className={cn(CARD, "p-4")}>
      <p className="text-[13px] font-semibold text-[var(--fx-text)]">Recruiter Notes</p>
      {notes.length ? (
        <ul className="mt-3 space-y-2">
          {notes.map((note, index) => (
            <li key={index} className="rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] p-3">
              <p className="whitespace-pre-wrap text-[14px] leading-[20px] text-[var(--fx-text)]">{note.text}</p>
              {note.at || note.label ? (
                <p className="mt-1 text-[11px] text-[var(--fx-text-muted)]">
                  {note.label ? `${note.label} · ` : ""}
                  {[formatDate(note.at), formatTime(note.at)].filter(Boolean).join(", ") || "—"}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[13px] text-[var(--fx-text-muted)]">No recruiter notes added.</p>
      )}
    </div>
  );
}

function Field({ label, value }) {
  const muted = NOT_ANSWERED.includes(value);
  return (
    <div className="space-y-1">
      <p className="text-[13px] text-[var(--fx-text-muted)]">{label}</p>
      <p className={cn("text-[14px] leading-[20px]", muted ? "text-[var(--fx-text-muted)]" : "text-[var(--fx-text)]")}>{value}</p>
    </div>
  );
}

// Composes the shared candidate card: identity (name) + primary metric (Screening Score) + property list.
function SummaryCard({ row, mode }) {
  const meta = screeningTypeMeta(mode);
  const Icon = meta?.icon;
  const screening = row?.app?.screening ?? {};
  const fields = [
    {
      label: "Screening Type",
      value: (
        <span className="flex items-center gap-1.5">
          {Icon ? <Icon className="size-4 shrink-0 text-[var(--fx-primary)]" /> : null}
          {meta?.label ?? "—"}
        </span>
      ),
    },
    { label: "Screening Status", value: capitalize(screening.status) },
    { label: "Screening Date", value: formatDate(screening.completedAt) ?? "—" },
    ...(mode !== "manual" ? [{ label: "Screening Time", value: formatTime(screening.completedAt) ?? "—" }] : []),
  ];
  return (
    <EvCandidateCard
      candidate={row?.candidate}
      score={row?.matchScore != null ? { label: "Screening Score", value: `${row.matchScore}%` } : undefined}
      fields={fields}
    />
  );
}

function DetailsRetrieved({ row, mode }) {
  const fields = detailFields(row, mode);
  const covered = mode === "manual" ? row?.app?.screening?.manual?.coveredQuestions ?? [] : null;
  const notes = recruiterNotes(row, mode);
  return (
    <div className="space-y-5">
      <div className={cn(CARD, "p-4")}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {fields.map((field) => (
            <Field key={field.label} label={field.label} value={field.value} />
          ))}
        </div>
      </div>
      <RecruiterNotes notes={notes} />
      {/* readOnly → a reference list of which standard questions were covered, not an editable checklist. */}
      {covered ? <EvScreeningChecklist readOnly questions={DEFAULT_SCREENING_QUESTIONS} checked={covered} title="Covered Questions" /> : null}
    </div>
  );
}

function AiCallAnalysis({ row }) {
  const data = buildAiCallAnalysis(row);
  return (
    <div className="space-y-3">
      {data.dimensions.map((dim) => (
        <div key={dim.key} className={cn(CARD, "p-4")}>
          <div className="flex items-start justify-between gap-3">
            <p className="text-[15px] font-semibold text-[var(--fx-text)]">{dim.label}</p>
            <span className="shrink-0 text-[13px] font-medium tabular-nums text-[var(--fx-text-muted)]">Score: {dim.score}</span>
          </div>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--fx-text-muted)]">Justification</p>
          <p className="mt-1 text-[14px] leading-[22px] text-[var(--fx-text)]">{dim.justification}</p>
        </div>
      ))}
      <div className={cn(CARD, "p-4")}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-[15px] font-semibold text-[var(--fx-text)]">Summary</p>
          <span className="shrink-0 text-[13px] font-medium tabular-nums text-[var(--fx-text-muted)]">Overall Score: {data.summary.score}</span>
        </div>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--fx-text-muted)]">Summary</p>
        <p className="mt-1 text-[14px] leading-[22px] text-[var(--fx-text)]">{data.summary.text}</p>
      </div>
    </div>
  );
}

function Transcript({ row, job }) {
  const items = buildAiTranscript(row, job);
  return (
    <div className={cn(CARD, "divide-y divide-[var(--fx-border)]")}>
      {items.map((item, index) => (
        <div key={index} className="space-y-2 p-4">
          <div>
            <p className="text-[12px] font-medium text-[var(--fx-text-muted)]">Q{index + 1}</p>
            <p className="mt-0.5 text-[14px] leading-[22px] text-[var(--fx-text)]">{item.q}</p>
          </div>
          <div className="pl-4">
            <p className="text-[12px] font-medium text-[var(--fx-text-muted)]">A{index + 1}</p>
            {item.a ? (
              <p className="mt-0.5 text-[14px] leading-[22px] text-[var(--fx-text)]">{item.a}</p>
            ) : (
              <p className="mt-0.5 text-[14px] leading-[22px] text-[var(--fx-danger)]">No answer found for this question.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function VoiceRecording({ row }) {
  const data = buildVoiceRecording(row);
  const [selected, setSelected] = useState(null);
  return (
    <div className={cn(CARD, "p-4")}>
      <p className="text-[15px] font-semibold text-[var(--fx-text)]">Voice Recording</p>
      <div className="mt-3 flex items-center gap-3">
        {/* Demo player — non-functional (no audio in the demo). */}
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)] text-[var(--fx-text)]">
          <Play className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium text-[var(--fx-text)]">{data.title}</p>
          <p className="truncate text-[13px] text-[var(--fx-text-muted)]">{data.subtitle}</p>
        </div>
        <span className="shrink-0 text-[13px] tabular-nums text-[var(--fx-text-muted)]">{data.duration}</span>
      </div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--fx-surface-hover)]">
        <div className="h-full w-1/5 rounded-full bg-[var(--fx-primary)]" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {data.markers.map((marker) => {
          const isSelected = selected?.label === marker.label;
          return (
            <button
              key={marker.label}
              type="button"
              onClick={() => setSelected(marker)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors",
                isSelected ? "border-[var(--fx-primary)] bg-[var(--fx-surface-selected)] text-[var(--fx-primary)]" : "border-[var(--fx-border)] text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)]",
              )}
            >
              {marker.label}
            </button>
          );
        })}
      </div>
      {selected ? <p className="mt-2 text-[13px] text-[var(--fx-text-muted)]">{selected.label} marker selected at {selected.at}</p> : null}
    </div>
  );
}

function EvPreScreenResultSheet({ open, onOpenChange, row, job, onReject, onShortlist }) {
  const [expanded, setExpanded] = useScreeningExpanded();
  const [tab, setTab] = useState("details");

  const mode = row?.screeningMode ?? null;
  const isAi = mode === "ai_call" || mode === "ai";
  const isEmail = mode === "email";
  const candidate = row?.candidate ?? null;

  const tabs = isAi
    ? [
        { value: "details", label: "Details Retrieved" },
        { value: "analysis", label: "AI Call Analysis" },
        { value: "transcript", label: "Transcript" },
        { value: "voice", label: "Voice Recording" },
      ]
    : isEmail
      ? [
          { value: "details", label: "Details Retrieved" },
          { value: "emailHistory", label: "Email History" },
        ]
      : [{ value: "details", label: "Details Retrieved" }];
  const activeTab = tabs.some((item) => item.value === tab) ? tab : "details";
  const activeLabel = tabs.find((item) => item.value === activeTab)?.label ?? "";

  return (
    <FxSheet open={open} onOpenChange={onOpenChange} side="right" size="xl" expandable expanded={expanded} onExpandedChange={setExpanded}>
      <FxSheet.Header title="Pre-Screening Result" description={row ? `${row.candidateName} · ${activeLabel}` : undefined} />
      {row ? (
        <FxSheet.Panes>
          {/* Résumé pane on the left for every mode (manual included) — keeps the result column a sane width. */}
          <FxSheet.Pane role="secondary" width="40%" className="p-0">
            <div className="flex h-full min-h-0 flex-col p-4">
              <EvCandidatePreview key={candidate?.id} candidate={candidate} fill resumeOnly />
            </div>
          </FxSheet.Pane>

          <FxSheet.Pane role="primary">
            <div className="space-y-5">
              <SummaryCard row={row} mode={mode} />
              <FxTabs variant="underlined" value={activeTab} onValueChange={setTab} tabs={tabs} />
              {activeTab === "details" ? <DetailsRetrieved row={row} mode={mode} /> : null}
              {activeTab === "analysis" ? <AiCallAnalysis row={row} /> : null}
              {activeTab === "transcript" ? <Transcript row={row} job={job} /> : null}
              {activeTab === "voice" ? <VoiceRecording row={row} /> : null}
              {activeTab === "emailHistory" ? <EvEmailHistory entries={row.emailScreeningHistory ?? []} /> : null}
            </div>
          </FxSheet.Pane>
        </FxSheet.Panes>
      ) : (
        <FxSheet.Body />
      )}

      <FxSheet.Footer
        footerStart={
          <FxButton variant="destructive" size="md" onClick={() => onReject?.(row)}>Reject</FxButton>
        }
      >
        <FxButton variant="primary" size="md" className="min-w-[120px]" onClick={() => onShortlist?.(row)}>Shortlist</FxButton>
      </FxSheet.Footer>
    </FxSheet>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvPreScreenResultSheet };
/* - - - - - - - - - - - - - - - - */
