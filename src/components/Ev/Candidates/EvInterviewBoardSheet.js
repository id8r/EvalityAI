/* src/components/Ev/Candidates/EvInterviewBoardSheet.js | Interview Round Board — guided candidate journey | Sree | 2026-07-01 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, ArrowLeft, ArrowRight, CalendarClock, CheckSquare, Flag, Gavel,
  MessageSquare, MoreHorizontal, Plus, StickyNote, Trash2, Video, X,
} from "lucide-react";

import { FxButton, FxInput, FxSelect, FxEditableField } from "@/components/FxUI/Forms";
import { FxBadge } from "@/components/FxUI/DataDisplay";
import { FxSheet } from "@/components/FxUI/Overlays/FxSheet";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ITEM_TYPES, DECISION_OUTCOMES, RECENT_INTERVIEWERS, isItemOverdue, journeyAttention,
  currentRound, roundState, roundPendingItems, roundPrimaryAction, nextActionHint, toDateKey, formatDayLong,
} from "@/lib/EvInterview";
import {
  getInterviewJourney, interviewAddRound, interviewRemoveRound, interviewUpdateRound,
  interviewAddItem, interviewUpdateItem, interviewRemoveItem, interviewMoveItem,
} from "@/lib/EvData";
import { jobClientName } from "@/lib/EvSelectors";
import { useScreeningExpanded } from "@/lib/useScreeningExpanded";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Candidate-level Round Board — a GUIDED interview journey, not a freeform task board. Columns = ordered rounds;
  cards = typed work-items (interview · task · decision · note · feedback). Orientation is the point: the header
  answers "where is the candidate + what's next", each column shows its own state + one strong CTA, and the
  attention strip is clickable (scrolls to the exact pending round). Round outcome/state/next-action are all derived
  (EvInterview) — the recruiter never sets state by hand. Reads the journey live from the store each render (`row`
  is a stale snapshot); every mutation writes through EvData. v1 has no drag — items move via the card kebab.
  Rich editors (reschedule via EvScheduleInterviewSheet, feedback form) land next pass; here the CTAs route to the
  quick-add composer or the end-state handlers passed from the page.
*/
const TYPE_META = {
  interview: { icon: Video, label: "Interview", tint: "text-[var(--fx-primary)]", accent: "var(--fx-primary)" },
  task: { icon: CheckSquare, label: "Task", tint: "text-[var(--fx-text-muted)]", accent: "var(--fx-border)" },
  decision: { icon: Gavel, label: "Decision", tint: "text-[var(--fx-info)]", accent: "var(--fx-border)" },
  note: { icon: StickyNote, label: "Note", tint: "text-[var(--fx-text-muted)]", accent: "var(--fx-border)" },
  feedback: { icon: MessageSquare, label: "Feedback", tint: "text-[var(--fx-info)]", accent: "var(--fx-info)" },
};
const OUTCOME_TOKEN = { advance: "success", hold: "warning", reject: "danger", offer: "primary" };
const ASSIGNEE_OPTIONS = [{ value: "", label: "Unassigned" }, ...RECENT_INTERVIEWERS.map((p) => ({ value: p.email, label: p.name }))];
const CANVAS = "h-full min-h-0 bg-[var(--fx-surface-subtle)]";
const COLUMN = "flex w-[340px] shrink-0 flex-col rounded-[14px] border border-[var(--fx-border)] bg-[var(--fx-surface)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]";
const KEBAB = "grid size-6 shrink-0 place-items-center rounded-[6px] text-[var(--fx-text-muted)] opacity-0 transition-opacity hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)] focus:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100";
const CHIP = "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors";
const emptyComposer = { roundId: null, type: "task", title: "", dueDate: "", assigneeId: "" };

const initialsOf = (name = "") => name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
const personByEmail = (email) => RECENT_INTERVIEWERS.find((p) => p.email === email) ?? null;

// Left-accent colour: flagged → amber; decision → its outcome tone; else the type accent.
function cardAccent(item) {
  if (item.flagged) return "var(--fx-warning)";
  if (item.type === "decision") return item.payload?.outcome ? `var(--fx-${OUTCOME_TOKEN[item.payload.outcome]})` : "var(--fx-border)";
  return TYPE_META[item.type]?.accent ?? "var(--fx-border)";
}

function EvInterviewBoardSheet({ open, onOpenChange, row, job, onMoveToOffered, onRejectCandidate, initialAction = null }) {
  const appId = row?.id ?? null;
  const [expanded, setExpanded] = useScreeningExpanded(); // ⤢ shared, persisted sheet width
  const [composer, setComposer] = useState(emptyComposer);
  const [highlightId, setHighlightId] = useState(null);
  const columnRefs = useRef({});
  const highlightTimer = useRef(null);

  const journey = appId ? getInterviewJourney(appId) : { status: "not_started", rounds: [], summary: "" };
  const rounds = useMemo(() => journey.rounds ?? [], [journey.rounds]);
  const todayKey = toDateKey(new Date());
  const attention = journeyAttention(rounds, todayKey);
  const cur = currentRound(rounds);
  const hint = nextActionHint(journey);
  const initialComposerKey = `${open ? "open" : "closed"}:${initialAction ?? ""}:${cur?.id ?? ""}`;
  const initialComposerApplied = useRef("");

  const focusRound = useCallback((roundId, itemId) => {
    columnRefs.current[roundId]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    if (!itemId) return;
    setHighlightId(itemId);
    window.clearTimeout(highlightTimer.current);
    highlightTimer.current = window.setTimeout(() => setHighlightId(null), 1800);
  }, []);
  const openComposer = useCallback((roundId, type = "task") => {
    setComposer({ ...emptyComposer, roundId, type });
    focusRound(roundId);
  }, [focusRound]);
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

  useEffect(() => {
    if (!open || !initialAction) {
      initialComposerApplied.current = "";
      return;
    }
    const roundId = cur?.id ?? rounds[0]?.id ?? null;
    if (!roundId) return;
    if (initialComposerApplied.current === initialComposerKey) return;
    initialComposerApplied.current = initialComposerKey;
    openComposer(roundId, initialAction);
  }, [open, initialAction, cur?.id, rounds, initialComposerKey, openComposer]);
  // Route a round's derived next-action to the right handler (composer for now; rich editors land next pass).
  function runRoundAction(round, action) {
    switch (action?.key) {
      case "add_round": case "create_next_round": interviewAddRound(appId); break;
      case "move_to_offered": onMoveToOffered?.(row); break;
      case "reject_candidate": onRejectCandidate?.(row); break;
      case "add_task": openComposer(round?.id, "task"); break;
      case "add_interview": openComposer(round?.id, "interview"); break;
      case "record_feedback": openComposer(round?.id, "feedback"); break;
      case "record_decision": openComposer(round?.id, "decision"); break;
      default: break;
    }
  }

  const jobTitle = job?.core?.title ?? "";
  const client = jobClientName(job);

  return (
    <FxSheet open={open} onOpenChange={onOpenChange} side="right" size="xl" expandable expanded={expanded} onExpandedChange={setExpanded}>
      <FxSheet.Header title="Interview Journey" description={[row?.candidateName, jobTitle, client].filter(Boolean).join(" · ") || undefined} />

      {/* Context bar — where the candidate is + what's next (only meaningful once a journey exists). */}
      {rounds.length ? (
        <div className="flex flex-none flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--fx-border)] bg-[var(--fx-surface)] px-5 py-3">
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-[var(--fx-text-muted)]">Current round</span>
            <span className="font-semibold text-[var(--fx-text)]">{cur?.name ?? "—"}</span>
            {cur ? <StateBadge state={roundState(cur, todayKey)} /> : null}
            {cur && roundPendingItems(cur, todayKey).length ? <FxBadge tone="subtle" variant="soft" size="xs">{roundPendingItems(cur, todayKey).length} pending</FxBadge> : null}
          </div>
          <div className="flex-1" />
          {row?.matchScore != null ? <FxBadge tone="primary" variant="soft" size="sm">Fit {row.matchScore}%</FxBadge> : null}
          {/* Subtle global hint (not a button) — tells the recruiter what matters most; the round footer is where they act. */}
          <button type="button" onClick={() => hint.roundId && focusRound(hint.roundId)} className="text-[13px] text-[var(--fx-text-muted)] transition-colors hover:text-[var(--fx-text)]">
            {hint.action ? <>Next: <span className="font-medium text-[var(--fx-text)]">{hint.action.label}</span></> : hint.label}
          </button>
        </div>
      ) : null}

      {/* Attention strip — clickable; each chip scrolls to the exact pending round/card. */}
      {attention.overdue.length || attention.awaiting.length ? (
        <div className="flex flex-none flex-wrap items-center gap-2 border-b border-[var(--fx-border)] bg-[var(--fx-surface)] px-5 py-2">
          <AlertTriangle className="size-4 text-[var(--fx-warning)]" />
          {attention.overdue.map((o) => (
            <button key={`od-${o.id}`} type="button" onClick={() => focusRound(o.roundId, o.id)} className={cn(CHIP, "border-[color:color-mix(in_srgb,var(--fx-danger)_35%,var(--fx-border))] bg-[color:color-mix(in_srgb,var(--fx-danger)_10%,var(--fx-surface))] text-[var(--fx-danger)] hover:bg-[color:color-mix(in_srgb,var(--fx-danger)_16%,var(--fx-surface))]")}>
              <AlertTriangle className="size-3" /> {o.title} · {o.roundName}
            </button>
          ))}
          {attention.awaiting.map((a) => (
            <button key={`aw-${a.roundId}`} type="button" onClick={() => focusRound(a.roundId)} className={cn(CHIP, "border-[color:color-mix(in_srgb,var(--fx-warning)_40%,var(--fx-border))] bg-[color:color-mix(in_srgb,var(--fx-warning)_10%,var(--fx-surface))] text-[var(--fx-warning)] hover:bg-[color:color-mix(in_srgb,var(--fx-warning)_16%,var(--fx-surface))]")}>
              <Gavel className="size-3" /> Decision · {a.roundName}
            </button>
          ))}
        </div>
      ) : null}

      <FxSheet.Body className="p-0">
        <div className={CANVAS}>
          {rounds.length ? (
            <div className="flex h-full min-h-0 items-stretch gap-5 overflow-x-auto p-6">
              {rounds.map((round, idx) => (
                <RoundColumn
                  key={round.id}
                  columnRef={(node) => { columnRefs.current[round.id] = node; }}
                  round={round}
                  todayKey={todayKey}
                  isLast={idx === rounds.length - 1}
                  canMoveLeft={idx > 0}
                  canMoveRight={idx < rounds.length - 1}
                  highlightId={highlightId}
                  composer={composer.roundId === round.id ? composer : null}
                  onComposerChange={setComposer}
                  onOpenComposer={() => openComposer(round.id)}
                  onSubmitComposer={submitComposer}
                  onRunAction={(action) => runRoundAction(round, action)}
                  onRenameRound={(name) => interviewUpdateRound(appId, round.id, { name })}
                  onRemoveRound={() => interviewRemoveRound(appId, round.id)}
                  onUpdateItem={(itemId, patch) => interviewUpdateItem(appId, itemId, patch)}
                  onRemoveItem={(itemId) => interviewRemoveItem(appId, itemId)}
                  onMoveItem={(itemId, dir) => interviewMoveItem(appId, itemId, dir)}
                />
              ))}
              <button
                type="button"
                onClick={() => interviewAddRound(appId)}
                className="flex w-[240px] shrink-0 flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-[var(--fx-border)] text-[13px] font-medium text-[var(--fx-text-muted)] transition-colors hover:border-[color:color-mix(in_srgb,var(--fx-primary)_45%,var(--fx-border))] hover:text-[var(--fx-text)]"
              >
                <Plus className="size-4" /> Add round
              </button>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-[14px] text-[var(--fx-text-muted)]">No rounds yet. Start this candidate&apos;s interview journey.</p>
              <FxButton variant="primary" size="md" onClick={() => interviewAddRound(appId, "Round 1")}>
                <Plus className="size-4" /> Add first round
              </FxButton>
            </div>
          )}
        </div>
      </FxSheet.Body>

      <FxSheet.Footer footerStart={<JourneyStatus status={journey.status} />}>
        <FxButton variant="outline" size="md" className="min-w-[100px]" onClick={() => onOpenChange?.(false)}>Close</FxButton>
      </FxSheet.Footer>
    </FxSheet>
  );
}

function StateBadge({ state }) {
  return <FxBadge tone={state.tone} variant="soft" size="xs" dot>{state.label}</FxBadge>;
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

function RoundColumn({ columnRef, round, todayKey, isLast, canMoveLeft, canMoveRight, highlightId, composer, onComposerChange, onOpenComposer, onSubmitComposer, onRunAction, onRenameRound, onRemoveRound, onUpdateItem, onRemoveItem, onMoveItem }) {
  const items = round.items ?? [];
  const state = roundState(round, todayKey);
  const pending = roundPendingItems(round, todayKey).length;
  const primary = roundPrimaryAction(round, isLast);
  return (
    <div ref={columnRef} className={cn(COLUMN, "group/col")}>
      {/* Header — round name (inline-edit) · pending count · state/outcome · remove-on-hover. */}
      <div className="flex flex-none items-center gap-2 border-b border-[var(--fx-border)] px-4 py-3">
        <div className="min-w-0 flex-1">
          <FxEditableField value={round.name} onSave={onRenameRound} valueClassName="text-[14px] font-semibold text-[var(--fx-text)]" />
        </div>
        {pending ? <FxBadge tone="subtle" variant="soft" size="xs">{pending}</FxBadge> : null}
        <StateBadge state={state} />
        <button type="button" aria-label="Remove round" onClick={onRemoveRound} className={cn(KEBAB, "group-hover/col:opacity-100")}><X className="size-3.5" /></button>
      </div>

      {/* Cards. */}
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3">
        {items.map((item) => (
          <RoundCard
            key={item.id}
            item={item}
            todayKey={todayKey}
            highlighted={highlightId === item.id}
            canMoveLeft={canMoveLeft}
            canMoveRight={canMoveRight}
            onUpdate={(patch) => onUpdateItem(item.id, patch)}
            onRemove={() => onRemoveItem(item.id)}
            onMove={(dir) => onMoveItem(item.id, dir)}
          />
        ))}

        {!items.length && !composer ? (
          <p className="px-1 py-2 text-[12.5px] leading-[18px] text-[var(--fx-text-muted)]">No items yet. Add interview, task, decision, note, or feedback.</p>
        ) : null}

        {composer ? (
          <ItemComposer composer={composer} onChange={onComposerChange} onSubmit={onSubmitComposer} onCancel={() => onComposerChange({ ...composer, roundId: null })} />
        ) : (
          <button type="button" onClick={onOpenComposer} className="flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1.5 text-[13px] font-medium text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]">
            <Plus className="size-3.5" /> Add item
          </button>
        )}
      </div>

      {/* One strong guiding CTA for this round. */}
      {primary ? (
        <div className="flex-none border-t border-[var(--fx-border)] p-2.5">
          <FxButton variant="outline" size="sm" className="w-full" onClick={() => onRunAction(primary)}>{primary.label}</FxButton>
        </div>
      ) : null}
    </div>
  );
}

function RoundCard({ item, todayKey, highlighted, canMoveLeft, canMoveRight, onUpdate, onRemove, onMove }) {
  const meta = TYPE_META[item.type] ?? TYPE_META.task;
  const Icon = meta.icon;
  const overdue = isItemOverdue(item, todayKey);
  const person = item.assigneeId ? personByEmail(item.assigneeId) : null;
  const subtitle = item.type === "interview" ? item.payload?.scheduleDetails : "";
  const showMeta = item.dueDate || item.type === "decision" || person;
  return (
    <div
      style={{ borderLeftColor: cardAccent(item) }}
      className={cn(
        "group space-y-2 rounded-[10px] border border-l-[3px] border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 py-2.5 transition-all hover:bg-[var(--fx-surface-hover)]",
        item.flagged && "bg-[color:color-mix(in_srgb,var(--fx-warning)_6%,var(--fx-surface))]",
        highlighted && "ring-2 ring-[var(--fx-primary)] ring-offset-1 ring-offset-[var(--fx-surface)]",
      )}
    >
      {/* Title row — type chip · type label + title · flag · kebab. */}
      <div className="flex items-start gap-2">
        <span className={cn("mt-[1px] grid size-6 shrink-0 place-items-center rounded-[6px] bg-[var(--fx-surface-subtle)]", meta.tint)}><Icon className="size-3.5" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--fx-text-muted)]">{meta.label}</p>
          <FxEditableField value={item.title} onSave={(next) => onUpdate({ title: next })} valueClassName="text-[13px] font-medium text-[var(--fx-text)]" />
          {subtitle ? <p className="mt-0.5 truncate text-[12px] text-[var(--fx-text-muted)]">{subtitle}</p> : null}
        </div>
        {item.flagged ? <Flag className="mt-0.5 size-3.5 shrink-0 fill-[var(--fx-warning)] text-[var(--fx-warning)]" /> : null}
        <CardMenu item={item} canMoveLeft={canMoveLeft} canMoveRight={canMoveRight} onUpdate={onUpdate} onRemove={onRemove} onMove={onMove} />
      </div>

      {/* Meta — decision outcome control (drives the round marker) · due badge · assignee. */}
      {showMeta ? (
        <div className="flex items-center gap-2 pl-8">
          {item.type === "decision" ? (
            <FxSelect size="sm" options={[{ value: "", label: "Set outcome…" }, ...DECISION_OUTCOMES]} value={item.payload?.outcome ?? ""} onChange={(value) => onUpdate({ payload: { ...item.payload, outcome: value || null } })} />
          ) : null}
          {item.dueDate ? (
            <FxBadge tone={overdue ? "danger" : "subtle"} variant="soft" size="xs">
              {overdue ? <AlertTriangle className="size-3" /> : <CalendarClock className="size-3" />} {formatDayLong(item.dueDate)}
            </FxBadge>
          ) : null}
          <div className="flex-1" />
          {person ? (
            <span className="inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[var(--fx-surface-selected)] text-[10px] font-semibold text-[var(--fx-primary)]" title={person.name}>{initialsOf(person.name)}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// Move / flag / delete tucked into a subtle kebab (no prominent arrow row per card).
function CardMenu({ item, canMoveLeft, canMoveRight, onUpdate, onRemove, onMove }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={KEBAB} aria-label="Card actions"><MoreHorizontal className="size-4" /></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem disabled={!canMoveLeft} onClick={() => onMove(-1)}><ArrowLeft className="size-4" /> Move to previous</DropdownMenuItem>
        <DropdownMenuItem disabled={!canMoveRight} onClick={() => onMove(1)}><ArrowRight className="size-4" /> Move to next</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onUpdate({ flagged: !item.flagged })}><Flag className="size-4" /> {item.flagged ? "Clear flag" : "Flag"}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onRemove} className="text-[var(--fx-danger)] focus:text-[var(--fx-danger)]"><Trash2 className="size-4" /> Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact inline add-card composer (collapsed to "+ Add item" until opened; CTAs can preset its type).
function ItemComposer({ composer, onChange, onSubmit, onCancel }) {
  const set = (patch) => onChange({ ...composer, ...patch });
  return (
    <div className="space-y-1.5 rounded-[10px] border border-[color:color-mix(in_srgb,var(--fx-primary)_32%,var(--fx-border))] bg-[var(--fx-surface)] p-2">
      <FxInput
        size="sm"
        autoFocus
        value={composer.title}
        onChange={(e) => set({ title: e.target.value })}
        onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); if (e.key === "Escape") onCancel(); }}
        clearable={false}
        placeholder="What needs to be done?"
      />
      <div className="grid grid-cols-2 gap-1.5">
        <FxSelect size="sm" options={ITEM_TYPES} value={composer.type} onChange={(value) => set({ type: value })} />
        <FxInput size="sm" type="date" value={composer.dueDate} onChange={(e) => set({ dueDate: e.target.value })} clearable={false} />
      </div>
      <div className="flex items-center gap-1.5">
        <div className="min-w-0 flex-1">
          <FxSelect size="sm" options={ASSIGNEE_OPTIONS} value={composer.assigneeId} onChange={(value) => set({ assigneeId: value })} />
        </div>
        <FxButton variant="ghost" size="sm" onClick={onCancel}>Cancel</FxButton>
        <FxButton variant="primary" size="sm" disabled={!composer.title.trim()} onClick={onSubmit}>Add</FxButton>
      </div>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvInterviewBoardSheet };
/* - - - - - - - - - - - - - - - - */
