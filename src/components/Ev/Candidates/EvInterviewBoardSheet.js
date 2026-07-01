/* src/components/Ev/Candidates/EvInterviewBoardSheet.js | Interview Round Board — candidate journey | Sree | 2026-07-01 */

"use client";

import { useState } from "react";
import {
  AlertTriangle, CalendarClock, CheckSquare, ChevronLeft, ChevronRight, Flag, Gavel,
  MessageSquare, Plus, StickyNote, Trash2, Video, X,
} from "lucide-react";

import { FxButton, FxIconButton, FxInput, FxSelect, FxEditableField } from "@/components/FxUI/Forms";
import { FxBadge } from "@/components/FxUI/DataDisplay";
import { FxSheet } from "@/components/FxUI/Overlays/FxSheet";
import {
  ITEM_TYPES, DECISION_OUTCOMES, RECENT_INTERVIEWERS,
  roundOutcome, isItemOverdue, journeyAttention, toDateKey, formatDayLong,
} from "@/lib/EvInterview";
import {
  getInterviewJourney, interviewAddRound, interviewRemoveRound, interviewUpdateRound,
  interviewAddItem, interviewUpdateItem, interviewRemoveItem, interviewMoveItem,
} from "@/lib/EvData";
import { useScreeningExpanded } from "@/lib/useScreeningExpanded";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Candidate-level Round Board (Kanban-inspired, not classic Kanban). Columns = ordered interview rounds; cards =
  typed work-items (interview · task · decision · note · feedback). Chronology stays primary (left→right); status
  lives on the cards. Round outcome is derived from Decision cards only. Reads the journey live from the store each
  render (the passed `row` is a stale snapshot); every mutation writes through EvData and bumps the store. v1 has no
  drag — items move between rounds via the ◀ ▶ controls. Interview scheduling reuse (EvScheduleInterviewSheet) is Phase 2.
*/
const TYPE_META = {
  interview: { icon: Video, label: "Interview", tone: "primary" },
  task: { icon: CheckSquare, label: "Task", tone: "neutral" },
  decision: { icon: Gavel, label: "Decision", tone: "info" },
  note: { icon: StickyNote, label: "Note", tone: "subtle" },
  feedback: { icon: MessageSquare, label: "Feedback", tone: "info" },
};
const OUTCOME_MARKER = { advance: "success", hold: "warning", reject: "danger" };
const ASSIGNEE_OPTIONS = [{ value: "", label: "Unassigned" }, ...RECENT_INTERVIEWERS.map((p) => ({ value: p.email, label: p.name }))];
const COLUMN = "flex w-[300px] shrink-0 flex-col rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)]";
const emptyComposer = { roundId: null, type: "task", title: "", dueDate: "", assigneeId: "" };

const initialsOf = (name = "") => name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
const personByEmail = (email) => RECENT_INTERVIEWERS.find((p) => p.email === email) ?? null;

function EvInterviewBoardSheet({ open, onOpenChange, row }) {
  const appId = row?.id ?? null;
  const [expanded, setExpanded] = useScreeningExpanded(); // ⤢ shared, persisted sheet width
  const [composer, setComposer] = useState(emptyComposer);

  const journey = appId ? getInterviewJourney(appId) : { status: "not_started", rounds: [], summary: "" };
  const rounds = journey.rounds ?? [];
  const todayKey = toDateKey(new Date());
  const attention = journeyAttention(rounds, todayKey);

  function openComposer(roundId) {
    setComposer({ ...emptyComposer, roundId });
  }
  function submitComposer() {
    if (!composer.roundId || !composer.title.trim()) return;
    interviewAddItem(appId, composer.roundId, {
      type: composer.type,
      title: composer.title.trim(),
      dueDate: composer.dueDate || null,
      assigneeId: composer.assigneeId || null,
      status: composer.type === "task" ? "open" : composer.type === "interview" ? "scheduled" : composer.type === "feedback" ? "pending" : null,
    });
    setComposer(emptyComposer);
  }

  return (
    <FxSheet open={open} onOpenChange={onOpenChange} side="right" size="xl" expandable expanded={expanded} onExpandedChange={setExpanded}>
      <FxSheet.Header title="Interview Journey" description={row?.candidateName ?? undefined} />

      {/* Attention strip — Kanban's "what's blocking?" folded into the journey (overdue + rounds awaiting a decision). */}
      {attention.overdue.length || attention.awaitingDecision ? (
        <div className="flex flex-none flex-wrap items-center gap-2 border-b border-[var(--fx-border)] bg-[var(--fx-bg-soft)] px-4 py-2.5">
          <AlertTriangle className="size-4 text-[var(--fx-warning)]" />
          {attention.overdue.length ? (
            <span className="text-[13px] text-[var(--fx-text)]">
              <span className="font-medium text-[var(--fx-danger)]">{attention.overdue.length} overdue</span>
              {" · "}{attention.overdue.map((it) => it.title).slice(0, 2).join(", ")}
            </span>
          ) : null}
          {attention.awaitingDecision ? (
            <span className="text-[13px] text-[var(--fx-text-muted)]">{attention.awaitingDecision} round{attention.awaitingDecision === 1 ? "" : "s"} awaiting decision</span>
          ) : null}
        </div>
      ) : null}

      <FxSheet.Body className="p-0">
        {rounds.length ? (
          <div className="flex h-full min-h-0 gap-4 overflow-x-auto p-4">
            {rounds.map((round, idx) => (
              <RoundColumn
                key={round.id}
                round={round}
                index={idx}
                lastIndex={rounds.length - 1}
                todayKey={todayKey}
                composer={composer.roundId === round.id ? composer : null}
                onComposerChange={setComposer}
                onOpenComposer={() => openComposer(round.id)}
                onSubmitComposer={submitComposer}
                onRenameRound={(name) => interviewUpdateRound(appId, round.id, { name })}
                onRemoveRound={() => interviewRemoveRound(appId, round.id)}
                onUpdateItem={(itemId, patch) => interviewUpdateItem(appId, itemId, patch)}
                onRemoveItem={(itemId) => interviewRemoveItem(appId, itemId)}
                onMoveItem={(itemId, dir) => interviewMoveItem(appId, itemId, dir)}
              />
            ))}
            {/* Add-round rail end. */}
            <div className="shrink-0 pr-1">
              <FxButton variant="outline" size="md" onClick={() => interviewAddRound(appId)}>
                <Plus className="size-4" /> Add round
              </FxButton>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-[14px] text-[var(--fx-text-muted)]">No rounds yet. Start this candidate&apos;s interview journey.</p>
            <FxButton variant="primary" size="md" onClick={() => interviewAddRound(appId, "Round 1")}>
              <Plus className="size-4" /> Add first round
            </FxButton>
          </div>
        )}
      </FxSheet.Body>

      <FxSheet.Footer footerStart={<JourneyStatus status={journey.status} />}>
        <FxButton variant="primary" size="md" className="min-w-[120px]" onClick={() => onOpenChange?.(false)}>Done</FxButton>
      </FxSheet.Footer>
    </FxSheet>
  );
}

function JourneyStatus({ status }) {
  const map = {
    not_started: { tone: "subtle", label: "Not started" },
    in_progress: { tone: "primary", label: "In progress" },
    on_hold: { tone: "warning", label: "On hold" },
    rejected: { tone: "danger", label: "Rejected" },
    cleared: { tone: "success", label: "Cleared" },
  };
  const meta = map[status] ?? map.not_started;
  return <FxBadge tone={meta.tone} variant="soft" size="sm" dot>{meta.label}</FxBadge>;
}

function RoundColumn({ round, index, lastIndex, todayKey, composer, onComposerChange, onOpenComposer, onSubmitComposer, onRenameRound, onRemoveRound, onUpdateItem, onRemoveItem, onMoveItem }) {
  const items = round.items ?? [];
  const outcome = roundOutcome(round);
  const markerTone = outcome ? OUTCOME_MARKER[outcome] : null;
  return (
    <div className={COLUMN}>
      {/* Column header — round name (inline-edit) · count · derived outcome marker · remove. */}
      <div className="flex flex-none items-center gap-2 border-b border-[var(--fx-border)] px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <FxEditableField value={round.name} onSave={onRenameRound} valueClassName="text-[14px] font-semibold text-[var(--fx-text)]" />
        </div>
        <FxBadge tone="subtle" variant="soft" size="xs">{items.length}</FxBadge>
        {markerTone ? <FxBadge tone={markerTone} variant="soft" size="xs">{DECISION_OUTCOMES.find((o) => o.value === outcome)?.label}</FxBadge> : null}
        <FxIconButton size="xs" variant="ghost" aria-label="Remove round" onClick={onRemoveRound}><X className="size-3.5" /></FxIconButton>
      </div>

      {/* Cards. */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2.5">
        {items.map((item) => (
          <RoundCard
            key={item.id}
            item={item}
            todayKey={todayKey}
            canMoveLeft={index > 0}
            canMoveRight={index < lastIndex}
            onUpdate={(patch) => onUpdateItem(item.id, patch)}
            onRemove={() => onRemoveItem(item.id)}
            onMove={(dir) => onMoveItem(item.id, dir)}
          />
        ))}

        {composer ? (
          <ItemComposer composer={composer} onChange={onComposerChange} onSubmit={onSubmitComposer} onCancel={() => onComposerChange({ ...composer, roundId: null })} />
        ) : (
          <button type="button" onClick={onOpenComposer} className="flex w-full items-center gap-1.5 rounded-[8px] border border-dashed border-[var(--fx-border)] px-3 py-2 text-[13px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]">
            <Plus className="size-3.5" /> Add item
          </button>
        )}
      </div>
    </div>
  );
}

function RoundCard({ item, todayKey, canMoveLeft, canMoveRight, onUpdate, onRemove, onMove }) {
  const meta = TYPE_META[item.type] ?? TYPE_META.task;
  const Icon = meta.icon;
  const overdue = isItemOverdue(item, todayKey);
  const person = item.assigneeId ? personByEmail(item.assigneeId) : null;
  return (
    <div className={cn("space-y-2 rounded-[10px] border bg-[var(--fx-surface)] px-3 py-2.5 transition-colors", item.flagged ? "border-[color:color-mix(in_srgb,var(--fx-danger)_35%,var(--fx-border))] bg-[color:color-mix(in_srgb,var(--fx-warning)_8%,var(--fx-surface))]" : "border-[var(--fx-border)]")}>
      {/* Title row. */}
      <div className="flex items-start gap-2">
        <Icon className="mt-[2px] size-4 shrink-0 text-[var(--fx-text-muted)]" />
        <div className="min-w-0 flex-1">
          <FxEditableField value={item.title} onSave={(next) => onUpdate({ title: next })} valueClassName="text-[13px] font-medium text-[var(--fx-text)]" />
        </div>
        {person ? (
          <span className="inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[var(--fx-surface-selected)] text-[10px] font-semibold text-[var(--fx-primary)]" title={person.name}>{initialsOf(person.name)}</span>
        ) : null}
      </div>

      {/* Badges — due (overdue tone), decision outcome. */}
      {(item.dueDate || item.type === "decision") ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {item.dueDate ? (
            <FxBadge tone={overdue ? "danger" : "subtle"} variant="soft" size="xs">
              {overdue ? <AlertTriangle className="size-3" /> : <CalendarClock className="size-3" />} {formatDayLong(item.dueDate)}
            </FxBadge>
          ) : null}
        </div>
      ) : null}

      {/* Decision cards carry the outcome control (drives the round marker). */}
      {item.type === "decision" ? (
        <FxSelect size="sm" options={[{ value: "", label: "Set outcome…" }, ...DECISION_OUTCOMES]} value={item.payload?.outcome ?? ""} onChange={(value) => onUpdate({ payload: { ...item.payload, outcome: value || null } })} />
      ) : null}

      {/* Controls: move between rounds · flag · delete. */}
      <div className="flex items-center gap-1 border-t border-[var(--fx-border-light)] pt-2">
        <FxIconButton size="xs" variant="ghost" aria-label="Move to previous round" disabled={!canMoveLeft} onClick={() => onMove(-1)}><ChevronLeft className="size-3.5" /></FxIconButton>
        <FxIconButton size="xs" variant="ghost" aria-label="Move to next round" disabled={!canMoveRight} onClick={() => onMove(1)}><ChevronRight className="size-3.5" /></FxIconButton>
        <FxIconButton size="xs" variant="ghost" aria-label={item.flagged ? "Clear flag" : "Flag"} onClick={() => onUpdate({ flagged: !item.flagged })}>
          <Flag className={cn("size-3.5", item.flagged && "fill-[var(--fx-danger)] text-[var(--fx-danger)]")} />
        </FxIconButton>
        <div className="flex-1" />
        <FxIconButton size="xs" variant="ghost" aria-label="Delete item" onClick={onRemove}><Trash2 className="size-3.5" /></FxIconButton>
      </div>
    </div>
  );
}

// Inline add-card composer (title · type · due · assignee) — mirrors the Jira "What needs to be done?" affordance.
function ItemComposer({ composer, onChange, onSubmit, onCancel }) {
  const set = (patch) => onChange({ ...composer, ...patch });
  return (
    <div className="space-y-2 rounded-[10px] border border-[color:color-mix(in_srgb,var(--fx-primary)_38%,var(--fx-border))] bg-[var(--fx-surface)] p-2.5">
      <FxInput
        size="sm"
        autoFocus
        value={composer.title}
        onChange={(e) => set({ title: e.target.value })}
        onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); if (e.key === "Escape") onCancel(); }}
        clearable={false}
        placeholder="What needs to be done?"
      />
      <div className="grid grid-cols-2 gap-2">
        <FxSelect size="sm" options={ITEM_TYPES} value={composer.type} onChange={(value) => set({ type: value })} />
        <FxSelect size="sm" options={ASSIGNEE_OPTIONS} value={composer.assigneeId} onChange={(value) => set({ assigneeId: value })} />
      </div>
      <FxInput size="sm" type="date" value={composer.dueDate} onChange={(e) => set({ dueDate: e.target.value })} clearable={false} />
      <div className="flex items-center justify-end gap-2">
        <FxButton variant="ghost" size="sm" onClick={onCancel}>Cancel</FxButton>
        <FxButton variant="primary" size="sm" disabled={!composer.title.trim()} onClick={onSubmit}>Add</FxButton>
      </div>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvInterviewBoardSheet };
/* - - - - - - - - - - - - - - - - */
