/* src/components/Ev/Candidates/EvCandidatePreview.js | Shared Resume / Background tabbed preview for a candidate | Sree | 2026-06-30 */

"use client";

import { useMemo, useRef, useState } from "react";
import { Calendar, FileText, History, Info, Upload } from "lucide-react";

import { FxBadge, FxPdfViewer, FxSectionHeader } from "@/components/FxUI/DataDisplay";
import { FxButton } from "@/components/FxUI/Forms";
import { FxTabs } from "@/components/FxUI/Navigation";
import { buildResumeFromUpload, isPdfResume, registerLocalResume, resolveResumeUrl } from "@/lib/EvResume";
import { candidateHistoricJobs, stageLabel } from "@/lib/EvSelectors";
import { APP_SHORT_NAME } from "@/lib/FxConstants";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  The single Resume / Background tabbed card used by BOTH the Recommend-Candidates and Candidate-Details sheets.
  Two height modes via `fill`:
    fill={false} (default) → the card flows to its content height; Resume runs autoHeight (fit-width, page flows)
                             and the PARENT scrolls. Used inside a scrolling preview column.
    fill={true}            → the card fills its parent (flex-1) with an internal scroll; Resume is a fixed-height
                             viewer. Used inside a fixed read pane.
  `allowUpload` turns the empty Resume state into an upload affordance: the file is registered as a session blob
  keyed by candidate id (never persisted) so it previews at once, and `onUploadResume(candidate, meta)` lets the
  caller persist the metadata-only resume object.
*/

// ---- Styling (top of file) ----
const CARD = "rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)]";
const SECTION_TITLE = "text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--fx-text-muted)]";
const BODY_TEXT = "text-[13px] leading-[21px] text-[var(--fx-text)]";
const PREVIEW_TABS = [{ value: "resume", label: "Resume" }, { value: "background", label: "Background" }];

// Short absolute date, e.g. "13 Jun 2026".
function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// Stacked label-above-value (mirrors the CanCard field) — legible for long values, no right-edge truncation.
function DetailField({ label, value, align = "left" }) {
  return (
    <div className={cn("space-y-0.5", align === "right" && "text-right")}>
      <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--fx-text-muted)]">{label}</p>
      <p className="text-[13px] leading-[18px] text-[var(--fx-text)]">{value}</p>
    </div>
  );
}

// Always-open referral card: job title, then Applied / Last updated on opposite edges, result below (plain text).
function ReferralCard({ entry }) {
  return (
    <div className={cn("space-y-2.5 p-3", CARD)}>
      <p className="truncate text-[13px] font-semibold text-[var(--fx-text)]" title={entry.jobTitle}>{entry.jobTitle}</p>
      <div className="flex items-start justify-between gap-3">
        <DetailField label="Applied" value={formatDate(entry.appliedAt)} />
        <DetailField label="Last updated" value={formatDate(entry.updatedAt)} align="right" />
      </div>
      {/* Result spans the card width (label left, value right) — one glance in a small card. */}
      <div className="flex items-center justify-between gap-3 border-t border-[var(--fx-border)] pt-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--fx-text-muted)]">Result</span>
        <span className={cn("text-[13px] font-medium text-[var(--fx-text)]", entry.active && "text-[var(--fx-primary)]")}>
          {entry.clientStatus || stageLabel(entry.stage)}
        </span>
      </div>
    </div>
  );
}

// AI summary detail: profile + Evality timeline + "in another queue" info + chronological referral history.
function BackgroundPanel({ candidate }) {
  const history = useMemo(() => candidateHistoricJobs(candidate.id), [candidate.id]);
  const activeCount = history.filter((entry) => entry.active).length;
  const extracted = candidate.resume?.extracted;
  const summary = extracted?.summary || "No AI summary on file for this candidate yet.";
  const skills = extracted?.skills ?? [];
  const currentRole = [candidate.currentTitle, candidate.currentCompany].filter(Boolean).join(" at ");

  return (
    <div className="space-y-5">
      <section className="space-y-1.5">
        <div className={SECTION_TITLE}>AI Summary</div>
        <p className={BODY_TEXT}>{summary}</p>
      </section>

      <section className="space-y-1.5">
        <div className={SECTION_TITLE}>Snapshot</div>
        <div className="space-y-3">
          <DetailField label="Current" value={currentRole || "Not captured."} />
          <DetailField label="Location" value={candidate.location || "Not captured."} />
        </div>
        {skills.length ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {skills.map((skill) => (
              <FxBadge key={skill} tone="neutral" variant="soft" size="sm">{skill}</FxBadge>
            ))}
          </div>
        ) : null}
      </section>

      {/* Provenance — when the candidate entered the system + last touch. */}
      <section className="flex items-center gap-2 rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] px-3 py-2.5">
        <Calendar className="size-4 shrink-0 text-[var(--fx-text-muted)]" />
        <p className="text-[12px] leading-[18px] text-[var(--fx-text-muted)]">
          In {APP_SHORT_NAME} since <span className="font-medium text-[var(--fx-text)]">{formatDate(candidate.createdAt)}</span>
          {" · last updated "}
          <span className="font-medium text-[var(--fx-text)]">{formatDate(candidate.updatedAt)}</span>
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 border-b border-[var(--fx-border)] pb-2">
          <History className="size-[18px] text-[var(--fx-text-muted)]" />
          <h4 className="text-[14px] font-semibold text-[var(--fx-text)]">Referral History</h4>
        </div>
        {history.length ? (
          <div className="grid grid-cols-2 gap-2.5">
            {/* "in another queue" sits at the grid's top, full width — the count lives here, not in the header. */}
            {activeCount ? (
              <div className="col-span-2 flex items-start gap-2 rounded-[10px] border border-[color:color-mix(in_srgb,var(--fx-primary)_30%,var(--fx-border))] bg-[color:color-mix(in_srgb,var(--fx-primary)_8%,var(--fx-surface))] px-3 py-2.5">
                <Info className="mt-0.5 size-4 shrink-0 text-[var(--fx-primary)]" />
                <p className="text-[12px] leading-[18px] text-[var(--fx-text)]">
                  Currently in {activeCount} other {activeCount === 1 ? "job's" : "jobs'"} pipeline — already under process elsewhere.
                </p>
              </div>
            ) : null}
            {history.map((entry) => (
              <ReferralCard key={entry.applicationId} entry={entry} />
            ))}
          </div>
        ) : (
          <p className={cn(BODY_TEXT, "text-[var(--fx-text-muted)]")}>Not referred to any other roles yet.</p>
        )}
      </section>
    </div>
  );
}

// ---- Resume views ----
function ResumeDropzone({ fill, onPick, onFiles }) {
  const [dragging, setDragging] = useState(false);
  return (
    <div className={cn("p-4", fill && "h-full")}>
      <div
        role="button"
        tabIndex={0}
        onClick={onPick}
        onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && onPick()}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); onFiles(event.dataTransfer.files); }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed px-6 py-7 text-center transition-colors",
          fill ? "h-full" : "min-h-[240px]",
          dragging ? "border-[var(--fx-primary)] bg-[var(--fx-surface-selected)]" : "border-[var(--fx-border)] bg-[var(--fx-bg-soft)] hover:bg-[var(--fx-surface-hover)]",
        )}
      >
        <Upload className="size-7 text-[var(--fx-primary)]" />
        <p className="mt-3 text-[14px] font-medium text-[var(--fx-text)]">No resume on file</p>
        <p className="mt-1 text-[13px] text-[var(--fx-text-muted)]">Upload this candidate&apos;s resume (PDF) to preview it.</p>
        <div className="mt-4">
          <FxButton size="sm" onClick={(event) => { event.stopPropagation(); onPick(); }}>Upload resume</FxButton>
        </div>
      </div>
    </div>
  );
}

function ResumeMessage({ fill }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-1 px-4 py-10 text-center", fill ? "h-full" : "min-h-[240px]")}>
      <FileText className="mb-1 size-6 text-[var(--fx-text-muted)]" />
      <p className="text-[14px] font-medium text-[var(--fx-text)]">No resume on file</p>
      <p className="text-[13px] text-[var(--fx-text-muted)]">This candidate has no resume yet.</p>
    </div>
  );
}

// ---- The shared preview card ----
function EvCandidatePreview({ candidate, fill = false, defaultTab = "resume", resumeOnly = false, allowUpload = false, onUploadResume }) {
  // Callers key this component by candidate id, so internal state (tab, optimistic upload) resets per candidate
  // via remount — no reset effect needed.
  const [tab, setTab] = useState(defaultTab);
  const [localResume, setLocalResume] = useState(null); // optimistic upload so the preview shows before the parent persists
  const inputRef = useRef(null);

  function handleFiles(fileList) {
    const file = fileList?.[0];
    if (!file || !candidate) return;
    registerLocalResume(candidate.id, file); // session blob keyed by candidate id — resolveResumeUrl picks it up
    const meta = buildResumeFromUpload(file);
    setLocalResume(meta);
    onUploadResume?.(candidate, meta); // caller persists the metadata-only resume object
  }

  if (!candidate) return null;

  const resume = localResume ?? candidate.resume;
  const resumeUrl = isPdfResume(resume) ? resolveResumeUrl(resume, candidate.id) : null;
  const resumeText = (resume?.text || resume?.extracted?.summary || "").trim();
  const showResume = resumeOnly || tab === "resume";

  return (
    <div className={cn(CARD, fill && "flex min-h-0 flex-1 flex-col overflow-hidden")}>
      {resumeOnly ? (
        <FxSectionHeader title="Resume" className={cn("rounded-t-[12px]", fill ? "flex-none" : "sticky top-0 z-[2]")} />
      ) : (
        <div className={cn("rounded-t-[12px] border-b border-[var(--fx-border)] bg-[var(--fx-surface-subtle)] px-3 py-2", fill ? "flex-none" : "sticky top-0 z-[2]")}>
          <FxTabs variant="segmented" value={tab} onValueChange={setTab} tabs={PREVIEW_TABS} />
        </div>
      )}

      <div className={cn(fill && "min-h-0 flex-1 overflow-hidden")}>
        {!showResume ? (
          <div className={cn("p-4", fill && "h-full overflow-y-auto")}>
            <BackgroundPanel candidate={candidate} />
          </div>
        ) : resumeUrl ? (
          <FxPdfViewer
            file={resumeUrl}
            showToolbar
            autoHeight={!fill}
            className={cn("border-0", fill ? "h-full rounded-none" : "overflow-hidden rounded-none rounded-b-[12px]")}
          />
        ) : resumeText ? (
          <div className={cn("p-4", fill && "h-full overflow-y-auto")}>
            <pre className="whitespace-pre-wrap break-words font-sans text-[13px] leading-[21px] text-[var(--fx-text)]">{resumeText}</pre>
          </div>
        ) : allowUpload ? (
          <ResumeDropzone fill={fill} onPick={() => inputRef.current?.click()} onFiles={handleFiles} />
        ) : (
          <ResumeMessage fill={fill} />
        )}
      </div>

      {allowUpload ? (
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(event) => { handleFiles(event.target.files); event.target.value = ""; }}
        />
      ) : null}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvCandidatePreview };
/* - - - - - - - - - - - - - - - - */
