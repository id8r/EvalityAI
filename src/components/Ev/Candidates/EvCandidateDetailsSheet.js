/* src/components/Ev/Candidates/EvCandidateDetailsSheet.js | Candidate Details workspace sheet (read pane + action pane) | Sree | 2026-06-29 */

"use client";

import { useState } from "react";

import { FxSheet } from "@/components/FxUI/Overlays/FxSheet";
import { FxTabs } from "@/components/FxUI/Navigation";
import { FxBadge, FxPdfViewer, formatRelativeTime } from "@/components/FxUI/DataDisplay";
import { FxButton, FxTextarea } from "@/components/FxUI/Forms";
import { EvCandidateProgress } from "@/components/Ev/Candidates/EvCandidateProgress";
import { EvCandidateCard } from "@/components/Ev/Candidates/EvCandidateCard";
import { isPdfResume, resolveResumeUrl } from "@/lib/EvResume";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

// Composes EvCandidateProgress + a Background/Résumé read pane (left) and EvCandidateCard + recruiter notes (right).
// Pure composition — edits/notes are emitted via callbacks (onEditField, onSaveNote); the sheet owns no persistence.

const EYEBROW = "text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--fx-text-muted)]";
const SECTION_TITLE = "text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--fx-text-muted)]";
const BODY = "text-[14px] leading-[22px] text-[var(--fx-text)]";

function yearsLabel(years) {
  return years == null ? "experience" : `${years} year${years === 1 ? "" : "s"} of experience`;
}

// Use the résumé's extracted data when present; otherwise synthesize a short profile from candidate fields.
function buildBackground(candidate) {
  const extracted = candidate?.resume?.extracted;
  const role = [candidate?.currentTitle, candidate?.currentCompany].filter(Boolean).join(" at ");
  return {
    summary: extracted?.summary ?? `${candidate?.name ?? "This candidate"} brings ${yearsLabel(candidate?.totalExperienceYears)} aligned to ${candidate?.currentTitle ?? "this role"}.`,
    experience: extracted?.experience?.length ? extracted.experience : role ? [role] : [],
    skills: extracted?.skills ?? [],
    education: extracted?.education ?? [],
    synthesized: !extracted,
  };
}

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <div className={SECTION_TITLE}>{title}</div>
      {children}
    </div>
  );
}

function BackgroundPane({ candidate }) {
  const bg = buildBackground(candidate);
  return (
    <div className="space-y-5">
      <Section title="Professional Summary">
        <p className={BODY}>{bg.summary}</p>
      </Section>
      {bg.experience.length ? (
        <Section title="Experience">
          <ul className="space-y-1">
            {bg.experience.map((item, index) => (
              <li key={index} className={BODY}>{item}</li>
            ))}
          </ul>
        </Section>
      ) : null}
      {bg.skills.length ? (
        <Section title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {bg.skills.map((skill) => (
              <FxBadge key={skill} tone="neutral" variant="soft" size="sm">{skill}</FxBadge>
            ))}
          </div>
        </Section>
      ) : null}
      {bg.education.length ? (
        <Section title="Education">
          <ul className="space-y-1">
            {bg.education.map((item, index) => (
              <li key={index} className={BODY}>{item}</li>
            ))}
          </ul>
        </Section>
      ) : null}
      {bg.synthesized ? <p className="text-[12px] text-[var(--fx-text-muted)]">Synthesized from candidate data — no résumé on file.</p> : null}
    </div>
  );
}

function ResumePane({ candidate }) {
  const url = isPdfResume(candidate?.resume) ? resolveResumeUrl(candidate.resume, candidate.id) : null;
  if (!url) {
    return <div className="rounded-[10px] border border-dashed border-[var(--fx-border)] p-6 text-center text-[13px] text-[var(--fx-text-muted)]">No résumé on file for this candidate.</div>;
  }
  return (
    <div className="h-[560px]">
      <FxPdfViewer file={url} showToolbar className="h-full" />
    </div>
  );
}

function NotesPane({ notes, onSaveNote }) {
  const [draft, setDraft] = useState("");
  const trimmed = draft.trim();
  function save() {
    if (!trimmed) return;
    onSaveNote?.(trimmed);
    setDraft("");
  }
  return (
    <div className="space-y-3">
      <FxTextarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Add recruiter note..." rows={4} />
      <div className="flex justify-end">
        <FxButton size="sm" variant="secondary" disabled={!trimmed} onClick={save}>
          Save Note
        </FxButton>
      </div>
      {notes.length ? (
        <ul className="space-y-2">
          {[...notes].reverse().map((note, index) => (
            <li key={note.id ?? index} className="rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-3">
              <p className="whitespace-pre-wrap text-[14px] leading-[20px] text-[var(--fx-text)]">{note.text}</p>
              {note.at ? <p className="mt-1 text-[12px] text-[var(--fx-text-muted)]">{formatRelativeTime(note.at)}</p> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] text-[var(--fx-text-muted)]">No notes added yet.</p>
      )}
    </div>
  );
}

function EvCandidateDetailsSheet({ open, onOpenChange, row, onEditField, onSaveNote }) {
  const [tab, setTab] = useState("background");
  const candidate = row?.candidate;
  const app = row?.app;
  const scoreLabel = row?.stage === "unscreened" ? "CV Match Score" : "Fit Score";
  const dates = {};
  (app?.stageHistory ?? []).forEach((entry) => {
    if (entry?.stage && entry?.at) dates[entry.stage] = entry.at;
  });

  return (
    <FxSheet open={open} onOpenChange={onOpenChange} side="right" size="xl" expandable>
      <FxSheet.Header title="Candidate Details" />
      {row ? (
        <FxSheet.Panes>
          {/* Read pane — progress + background/résumé */}
          <FxSheet.Pane role="primary">
            <div className="space-y-6">
              <div>
                <div className={EYEBROW}>Candidate Progress</div>
                <div className="mt-3">
                  <EvCandidateProgress current={app?.stage} dates={dates} />
                </div>
              </div>

              <div className="space-y-3">
                <FxTabs
                  variant="segmented"
                  value={tab}
                  onValueChange={setTab}
                  tabs={[{ value: "background", label: "Background" }, { value: "resume", label: "Résumé" }]}
                />
                <div className="rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4">
                  {tab === "background" ? <BackgroundPane candidate={candidate} /> : <ResumePane candidate={candidate} />}
                </div>
              </div>
            </div>
          </FxSheet.Pane>

          {/* Action pane — summary card (editable) + recruiter notes */}
          <FxSheet.Pane role="secondary" width={440}>
            <div className="space-y-4">
              <EvCandidateCard
                candidate={candidate}
                application={app}
                mode="summary"
                score={{ label: scoreLabel, value: row.matchScore == null ? "—" : `${row.matchScore}%` }}
                onEditField={onEditField}
                editableName
              />
              <NotesPane notes={app?.notes ?? []} onSaveNote={onSaveNote} />
            </div>
          </FxSheet.Pane>
        </FxSheet.Panes>
      ) : (
        <FxSheet.Body />
      )}
    </FxSheet>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvCandidateDetailsSheet };
/* - - - - - - - - - - - - - - - - */
