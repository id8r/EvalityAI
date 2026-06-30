/* src/components/Ev/Candidates/EvCandidateDetailsSheet.js | Candidate Details workspace sheet (read pane + action pane) | Sree | 2026-06-30 */

"use client";

import { useState } from "react";
import { PencilLine, Trash2 } from "lucide-react";

import { FxSheet } from "@/components/FxUI/Overlays/FxSheet";
import { FxConfirmDialog } from "@/components/FxUI/Overlays/FxConfirmDialog";
import { FxButton, FxIconButton, FxTextarea } from "@/components/FxUI/Forms";
import { EvCandidateProgress } from "@/components/Ev/Candidates/EvCandidateProgress";
import { EvCandidateCard } from "@/components/Ev/Candidates/EvCandidateCard";
import { EvCandidatePreview } from "@/components/Ev/Candidates/EvCandidatePreview";
/* - - - - - - - - - - - - - - - - */

// Composes EvCandidateProgress + the shared Resume/Background preview (read pane) and EvCandidateCard +
// recruiter notes (action pane). Pure composition — edits/notes/resume are emitted via callbacks; no persistence here.

const EYEBROW = "text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--fx-text-muted)]";

// Absolute date + time for a saved note, e.g. "13 Jun 2026, 3:45 pm".
function formatNoteTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
}

function NoteRow({ note, onEditNote, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.text);
  function save() {
    const next = draft.trim();
    if (next && next !== note.text) onEditNote?.(note.id, next);
    setEditing(false);
  }
  if (editing) {
    return (
      <li className="space-y-2 rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-3">
        <FxTextarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} />
        <div className="flex justify-end gap-2">
          <FxButton size="xs" variant="ghost" onClick={() => { setDraft(note.text); setEditing(false); }}>Cancel</FxButton>
          <FxButton size="xs" variant="secondary" disabled={!draft.trim()} onClick={save}>Save</FxButton>
        </div>
      </li>
    );
  }
  return (
    <li className="group rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 whitespace-pre-wrap text-[14px] leading-[20px] text-[var(--fx-text)]">{note.text}</p>
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <FxIconButton size="xs" variant="ghost" aria-label="Edit note" onClick={() => { setDraft(note.text); setEditing(true); }}>
            <PencilLine className="size-3.5" />
          </FxIconButton>
          <FxIconButton size="xs" variant="ghost" aria-label="Delete note" className="hover:text-[var(--fx-danger)]" onClick={() => onDelete(note.id)}>
            <Trash2 className="size-3.5" />
          </FxIconButton>
        </div>
      </div>
      {note.at ? (
        <p className="mt-1 text-[11px] text-[var(--fx-text-muted)]">
          {formatNoteTime(note.at)}
          {note.editedAt ? ` · edited ${formatNoteTime(note.editedAt)}` : ""}
        </p>
      ) : null}
    </li>
  );
}

function NotesPane({ notes, onSaveNote, onEditNote, onDeleteNote }) {
  const [draft, setDraft] = useState("");
  const [deleteId, setDeleteId] = useState(null);
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
            <NoteRow key={`note-${note.id ?? note.at ?? note.createdAt ?? index}`} note={note} onEditNote={onEditNote} onDelete={setDeleteId} />
          ))}
        </ul>
      ) : (
        <p className="text-[13px] text-[var(--fx-text-muted)]">No notes added yet.</p>
      )}

      <FxConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(value) => { if (!value) setDeleteId(null); }}
        title="Delete note?"
        description="This recruiter note will be permanently removed."
        confirmLabel="Delete"
        tone="danger"
        onConfirm={() => { onDeleteNote?.(deleteId); setDeleteId(null); }}
      />
    </div>
  );
}

function EvCandidateDetailsSheet({ open, onOpenChange, row, onEditField, onSaveNote, onEditNote, onDeleteNote, onUploadResume }) {
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
          {/* Read pane — progress + the shared Resume/Background preview (fill mode). */}
          <FxSheet.Pane role="primary">
            <div className="flex h-full min-h-0 flex-col gap-6">
              <div className="flex-none">
                <div className={EYEBROW}>Candidate Progress</div>
                <div className="mt-3">
                  <EvCandidateProgress current={app?.stage} dates={dates} />
                </div>
              </div>
              <EvCandidatePreview key={candidate?.id} candidate={candidate} fill allowUpload onUploadResume={onUploadResume} />
            </div>
          </FxSheet.Pane>

          {/* Action pane — summary card (editable) + recruiter notes. width="50%" → equal split with the read pane. */}
          <FxSheet.Pane role="secondary" width="50%">
            <div className="space-y-4">
              <EvCandidateCard
                candidate={candidate}
                application={app}
                mode="summary"
                score={{ label: scoreLabel, value: row.matchScore == null ? "—" : `${row.matchScore}%` }}
                onEditField={onEditField}
                editableName
              />
              <NotesPane notes={app?.notes ?? []} onSaveNote={onSaveNote} onEditNote={onEditNote} onDeleteNote={onDeleteNote} />
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
