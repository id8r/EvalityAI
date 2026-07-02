/* src/components/Ev/Candidates/EvInterviewJourneySheet.js | Interview Workspace V2 — human interview journey | Sree | 2026-07-01 */

"use client";

import { useState } from "react";
import {
  BadgeCheck, CalendarClock, CalendarPlus, CheckCircle2, ClipboardCheck, ListPlus,
  MapPin, Phone, RefreshCw, Scale, Video, XCircle,
} from "lucide-react";

import { FxButton } from "@/components/FxUI/Forms";
import { FxBadge } from "@/components/FxUI/DataDisplay";
import { FxSheet } from "@/components/FxUI/Overlays/FxSheet";
import { EvRecordDecisionDialog } from "@/components/Ev/Candidates/EvRecordDecisionDialog";
import { EvRecordFeedbackDialog } from "@/components/Ev/Candidates/EvRecordFeedbackDialog";
import { getInterviewJourney, interviewUpdateItem, interviewAddItem, interviewRecordDecision, interviewRecordFeedback } from "@/lib/EvData";
import {
  roundOutcome, roundState, DECISION_OUTCOMES, RECOMMENDATIONS, RECENT_INTERVIEWERS,
  formatDayLong, formatSlotRange, toDateKey,
} from "@/lib/EvInterview";
import { jobClientName } from "@/lib/EvSelectors";
import { useScreeningExpanded } from "@/lib/useScreeningExpanded";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Interview Workspace V2 — a recruiter's mental model, not a board. One vertical journey answering, top to bottom:
  who is this candidate · which role/company · which round they're in · what happened · what's pending · what's next.
  The candidate's EXPECTED journey is always shown as planned round placeholders (PLANNED_ROUNDS); actual data from
  the normalized rounds[] fills each slot by position. Only the current round is expanded + actionable — future rounds
  are visible but quiet ("Not scheduled / Available after Round N is cleared"). Once a round is Advanced (Cleared),
  the next planned slot becomes the active "Schedule Round N" step. Actions are recruiter-specific and lifecycle-driven
  (Schedule → Complete → Feedback → Decision → Next round / Offer / Reject) — never generic task/decision/feedback types.
  Reads the store live (EvInterview/EvData, unchanged). Trivial transitions (mark completed, add note/task) are
  self-wired; deeper editors (feedback form, decision) arrive via callbacks, wired step by step.
*/
const PLANNED_ROUNDS = ["Recruiter Screen", "Portfolio Review", "Leadership Round", "Final Round"];
const MODE_META = { remote: { icon: Video, label: "Remote" }, in_person: { icon: MapPin, label: "In-person" }, phone: { icon: Phone, label: "Phone" } };
const OUTCOME_STATE = {
  advance: { label: "Cleared", tone: "success" },
  hold: { label: "On hold", tone: "warning" },
  reject: { label: "Reject recommended", tone: "danger" }, // decision recorded; candidate not rejected until confirmed
  offer: { label: "Offer recommended", tone: "primary" }, // decision recorded; not moved to Offered until confirmed
};
const STEP_META = {
  schedule: { label: "Schedule interview", icon: CalendarClock, variant: "primary" },
  reschedule: { label: "Reschedule", icon: CalendarClock, variant: "ghost" },
  mark_completed: { label: "Mark completed", icon: CheckCircle2, variant: "primary" },
  record_feedback: { label: "Record feedback", icon: ClipboardCheck, variant: "primary" },
  record_decision: { label: "Record decision", icon: Scale, variant: "primary" },
  schedule_next: { label: "Schedule next round", icon: CalendarPlus, variant: "primary" },
  schedule_reinterview: { label: "Schedule re-interview", icon: CalendarClock, variant: "ghost" },
  move_offered: { label: "Move to Offered", icon: BadgeCheck, variant: "primary" },
  reject: { label: "Reject Candidate", icon: XCircle, variant: "destructive" },
  add_task: { label: "Add follow-up task", icon: ListPlus, variant: "ghost" },
  change_decision: { label: "Change decision", icon: RefreshCw, variant: "ghost" },
};
const REC_META = Object.fromEntries(RECOMMENDATIONS.map((r) => [r.value, r]));
const OUTCOME_META = Object.fromEntries(DECISION_OUTCOMES.map((o) => [o.value, o]));
const personName = (email) => RECENT_INTERVIEWERS.find((p) => p.email === email)?.name ?? email ?? "";
const TONE_VAR = { success: "var(--fx-success)", warning: "var(--fx-warning)", danger: "var(--fx-danger)", primary: "var(--fx-primary)", info: "var(--fx-info)", subtle: "var(--fx-text-muted)", neutral: "var(--fx-text)" };

const initialsOf = (name = "") => name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
const interviewOf = (round) => [...(round?.items ?? [])].reverse().find((it) => it.type === "interview") ?? null;
const feedbackOf = (round) => [...(round?.items ?? [])].reverse().find((it) => it.type === "feedback") ?? null;
// A stored round name wins only if it's a real label — has letters and isn't a generic "Round N".
// This also guards against junk stored names (e.g. "1 / 3", bare numbers) ever rendering as a round title.
function planName(i, actual) {
  const stored = actual?.name?.trim();
  if (stored && /[a-z]/i.test(stored) && !/^round\s*\d+$/i.test(stored)) return stored;
  return PLANNED_ROUNDS[i] ?? `Round ${i + 1}`;
}
const resolveStep = (key, label) => ({ key, label: label ?? STEP_META[key].label, variant: STEP_META[key].variant, icon: STEP_META[key].icon });

/*
  The required next step is always primary; decisions are always editable (Change decision). Lifecycle:
  scheduled → mark completed → record feedback → record decision → outcome, then the outcome's next action.
  Note advance keeps only Change decision here — its "Schedule Round N" lives on the next (active) planned slot.
*/
function stepsFor(round) {
  const outcome = roundOutcome(round);
  const items = round?.items ?? [];
  const interview = interviewOf(round);
  const hasFeedback = items.some((it) => it.type === "feedback");
  // Decided — never a dead-end; always offer Change decision.
  // Change decision now lives in the decision summary block, so it's not repeated in the action row.
  if (outcome === "advance") return { primary: null, secondary: [] };
  if (outcome === "hold") return { primary: "add_task", secondary: ["schedule_reinterview"] };
  if (outcome === "reject") return { primary: "reject", secondary: [] };
  if (outcome === "offer") return { primary: "move_offered", secondary: [] };
  // Pre-decision lifecycle.
  if (!interview) return { primary: "schedule", secondary: [] };
  if (interview.status !== "done") return { primary: "mark_completed", secondary: ["reschedule"] };
  if (!hasFeedback) return { primary: "record_feedback", secondary: ["record_decision"] }; // decision stays secondary
  return { primary: "record_decision", secondary: [] }; // feedback in → decision is primary
}

// One plain-English sentence of what's happening in a round (no garbage strings when data is missing).
function nowSentence(round) {
  const outcome = roundOutcome(round);
  if (outcome === "advance") return "Cleared for the next round.";
  if (outcome === "hold") return "Candidate is on hold.";
  if (outcome === "reject") return "Rejection recommended. Final confirmation required.";
  if (outcome === "offer") return "Offer recommended. Final confirmation required.";
  const interview = interviewOf(round);
  if (!interview) return "No interview scheduled for this round yet.";
  const who = (interview.payload?.interviewers ?? []).map((i) => i.name || i.email).filter(Boolean).join(", ");
  const when = interview.payload?.dateKey ? formatDayLong(interview.payload.dateKey) : "";
  const time = interview.payload?.slotStart != null ? formatSlotRange(interview.payload.slotStart, interview.payload.durationMin ?? 60) : "";
  if (interview.status !== "done") {
    if (who && when) return `Interview with ${who} is scheduled for ${when}${time ? `, ${time}` : ""}.`;
    if (when) return `Interview is scheduled for ${when}${time ? `, ${time}` : ""}.`;
    if (who) return `Interview with ${who} is being scheduled.`;
    return "Interview scheduling in progress.";
  }
  if ((round.items ?? []).some((it) => it.type === "feedback")) return "Feedback recorded. Decision is pending.";
  return who ? `Interview completed. Feedback is pending from ${who}.` : "Interview completed. Feedback is pending.";
}

// Header Status = the human state label (interview detail lives in the round card body, not here).
const headerStatus = (active) => active.state?.label ?? "";

// Header Next = the primary action label (record_decision reads "Record your decision").
const nextPhrase = (primary) => (primary.key === "record_decision" ? "Record your decision" : primary.label);

function EvInterviewJourneySheet({ open, onOpenChange, row, job, onReschedule, onMoveToOffered, onRejectCandidate, initialAction = null }) {
  const appId = row?.id ?? null;
  const [expanded, setExpanded] = useScreeningExpanded();
  const [decisionRound, setDecisionRound] = useState(null); // the round whose decision editor is open
  const journey = appId ? getInterviewJourney(appId) : { status: "not_started", rounds: [] };
  const rounds = journey.rounds ?? [];
  const todayKey = toDateKey(new Date());
  const candidate = row?.candidate ?? null;
  const jobTitle = job?.core?.title ?? "";
  const client = jobClientName(job);

  // Active row = the last actual round, unless it's been Advanced (then the next planned slot is ready to schedule).
  const lastIdx = rounds.length - 1;
  const lastOutcome = lastIdx >= 0 ? roundOutcome(rounds[lastIdx]) : null;
  const activeIndex = rounds.length === 0 ? 0 : lastOutcome === "advance" ? rounds.length : lastIdx;
  const rowCount = Math.max(PLANNED_ROUNDS.length, activeIndex + 1);
  const latestActualRound = rounds[lastIdx] ?? null;
  const [feedbackRound, setFeedbackRound] = useState(() => (initialAction === "feedback" ? latestActualRound : null));

  function markCompleted(round) {
    const interview = interviewOf(round);
    if (interview) interviewUpdateItem(appId, interview.id, { status: "done" });
  }
  function addSecondary(type) {
    const round = rounds[activeIndex] ?? rounds[lastIdx];
    if (round) interviewAddItem(appId, round.id, { type, title: type === "note" ? "New note" : "New task", status: type === "task" ? "open" : null });
  }
  function runStep(round, key) {
    switch (key) {
      case "mark_completed": markCompleted(round); break;
      case "schedule": case "reschedule": case "schedule_reinterview": onReschedule?.({}); break;
      case "schedule_next": onReschedule?.({ nextRound: true }); break;
      case "record_feedback": case "change_feedback": setFeedbackRound(round); break;
      case "record_decision": case "change_decision": setDecisionRound(round); break;
      case "move_offered": onMoveToOffered?.(row); break;
      case "reject": onRejectCandidate?.(row); break;
      case "add_task": addSecondary("task"); break;
      default: break;
    }
  }

  function buildRow(i) {
    const actual = rounds[i] ?? null;
    const isActive = i === activeIndex;
    const ordinal = i + 1;
    const name = planName(i, actual);
    if (actual) {
      const outcome = roundOutcome(actual);
      const state = outcome ? OUTCOME_STATE[outcome] : roundState(actual, todayKey);
      // Actions for the active round AND any decided round (decided rounds must stay editable — never a dead-end).
      const steps = isActive || outcome ? stepsFor(actual) : null;
      const actions = steps ? { primary: steps.primary ? resolveStep(steps.primary) : null, secondary: steps.secondary.map((k) => resolveStep(k)) } : null;
      const feedback = [...(actual.items ?? [])].reverse().find((it) => it.type === "feedback") ?? null;
      const decision = [...(actual.items ?? [])].reverse().find((it) => it.type === "decision") ?? null;
      return { i, actual, ordinal, name, state, sentence: nowSentence(actual), interview: interviewOf(actual), feedback, decision, isActive, placeholder: false, actions };
    }
    if (isActive) {
      return { i, actual: null, ordinal, name, state: { label: "Ready to schedule", tone: "primary" }, sentence: i > 0 ? `Round ${i} cleared. Schedule ${planName(i, null)}.` : `Ready to schedule ${planName(i, null)}.`, interview: null, isActive: true, placeholder: true, actions: { primary: resolveStep("schedule_next", `Schedule Round ${i + 1}`), secondary: [] } };
    }
    return { i, actual: null, ordinal, name, state: { label: "Not scheduled", tone: "subtle" }, sentence: i > 0 ? `Available after Round ${i} is cleared.` : "Not scheduled yet.", interview: null, isActive: false, placeholder: true, actions: null };
  }
  const rows = Array.from({ length: rowCount }, (_, i) => buildRow(i));
  const active = rows[activeIndex];
  // Persistent current/next status — lives in the header (center-right, before expand/close), not the footer.
  const statusChip = (
    <span className="inline-flex min-w-0 max-w-[460px] items-center gap-2 rounded-[6px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-2.5 py-1 text-[12.5px] leading-[16px]">
      <span className="size-[7px] shrink-0 rounded-full" style={{ backgroundColor: TONE_VAR[active.state?.tone] ?? "var(--fx-text-muted)" }} />
      <span className="min-w-0 truncate">
        <span className="text-[var(--fx-text-muted)]">Current: </span>
        <span className="font-medium text-[var(--fx-primary)]">{planName(activeIndex, active.actual)}</span>
        {active.actions?.primary ? (
          <><span className="text-[var(--fx-text-muted)]"> · Next: </span><span className="font-medium text-[var(--fx-primary)]">{nextPhrase(active.actions.primary)}</span></>
        ) : (
          <><span className="text-[var(--fx-text-muted)]"> · Status: </span><span className="font-medium text-[var(--fx-primary)]">{active.state?.label}</span></>
        )}
      </span>
    </span>
  );

  return (
    <>
    <FxSheet open={open} onOpenChange={onOpenChange} side="right" size="lg" expandable expanded={expanded} onExpandedChange={setExpanded}>
      <FxSheet.Header title="Interview Workspace" actions={statusChip} />

      <FxSheet.Body className="p-0">
        <div className="h-full min-h-0 overflow-y-auto bg-[var(--fx-surface-subtle)]">
          <div className="mx-auto w-full max-w-[760px] space-y-4 px-6 py-6">
            {/* Who + role/company. */}
            <section className="flex items-start gap-4 rounded-[14px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--fx-surface-selected)] text-[15px] font-semibold text-[var(--fx-primary)]">{initialsOf(candidate?.name) || "?"}</span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[17px] font-semibold text-[var(--fx-text)]">{candidate?.name ?? row?.candidateName ?? "Candidate"}</h2>
                {candidate?.currentTitle || candidate?.currentCompany ? (
                  <p className="truncate text-[13px] text-[var(--fx-text-muted)]">{[candidate?.currentTitle, candidate?.currentCompany].filter(Boolean).join(" · ")}</p>
                ) : null}
                <p className="mt-1.5 text-[13px] text-[var(--fx-text)]">
                  Interviewing for <span className="font-semibold">{jobTitle || "—"}</span>{client ? <span className="text-[var(--fx-text-muted)]"> · {client}</span> : null}
                </p>
              </div>
              {row?.matchScore != null ? <FxBadge tone="primary" variant="soft" size="sm">Fit {row.matchScore}%</FxBadge> : null}
            </section>

            {/* At a glance — compact status card, deliberately lighter/smaller than the identity card above. */}
            <section className="rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] px-4 py-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fx-text-muted)]">Current round</p>
              <p className="mt-0.5 text-[14px] font-semibold text-[var(--fx-text)]">Round {activeIndex + 1} of {rowCount} — {planName(activeIndex, active.actual)}</p>
              <dl className="mt-2 space-y-1 text-[13px]">
                <div className="flex gap-2"><dt className="w-[48px] shrink-0 text-[var(--fx-text-muted)]">Status</dt><dd className="text-[var(--fx-text)]">{headerStatus(active)}</dd></div>
                {active.actions?.primary ? <div className="flex gap-2"><dt className="w-[48px] shrink-0 text-[var(--fx-text-muted)]">Next</dt><dd className="font-medium text-[var(--fx-text)]">{nextPhrase(active.actions.primary)}</dd></div> : null}
              </dl>
            </section>

            {/* The full expected journey. */}
            <section className="space-y-1">
              {rows.map((r, idx) => (
                <RoundStep key={r.i} row={r} last={idx === rows.length - 1} onRun={(key) => runStep(r.actual, key)} />
              ))}
            </section>
          </div>
        </div>
      </FxSheet.Body>

      {/* Footer keeps only Close, on the left. The current/next status now lives in the header. */}
      <FxSheet.Footer footerStart={<FxButton variant="outline" size="md" className="min-w-[100px]" onClick={() => onOpenChange?.(false)}>Close</FxButton>} />
    </FxSheet>

    <EvRecordDecisionDialog
      open={Boolean(decisionRound)}
      onOpenChange={(next) => { if (!next) setDecisionRound(null); }}
      roundName={decisionRound ? planName(rounds.indexOf(decisionRound), decisionRound) : ""}
      initialOutcome={decisionRound?.items ? ([...decisionRound.items].reverse().find((it) => it.type === "decision")?.payload?.outcome ?? null) : null}
      initialNote={decisionRound?.items ? ([...decisionRound.items].reverse().find((it) => it.type === "decision")?.payload?.note ?? "") : ""}
      onSave={(outcome, note) => { if (decisionRound) interviewRecordDecision(appId, decisionRound.id, outcome, note); setDecisionRound(null); }}
    />

    <EvRecordFeedbackDialog
      open={Boolean(feedbackRound)}
      onOpenChange={(next) => { if (!next) setFeedbackRound(null); }}
      roundName={feedbackRound ? planName(rounds.indexOf(feedbackRound), feedbackRound) : ""}
      interviewers={feedbackRound ? (interviewOf(feedbackRound)?.payload?.interviewers ?? []) : []}
      defaultSubmittedBy={feedbackRound ? (feedbackOf(feedbackRound)?.payload?.byInterviewerId ?? interviewOf(feedbackRound)?.payload?.interviewers?.[0]?.name ?? "") : ""}
      initialRecommendation={feedbackRound ? (feedbackOf(feedbackRound)?.payload?.recommendation ?? null) : null}
      initialNote={feedbackRound ? (feedbackOf(feedbackRound)?.payload?.notes ?? "") : ""}
      onSave={(data) => { if (feedbackRound) interviewRecordFeedback(appId, feedbackRound.id, data); setFeedbackRound(null); }}
    />
    </>
  );
}

function ActionButton({ action, ghost, onClick }) {
  const Icon = action.icon;
  return <FxButton variant={ghost ? "ghost" : action.variant} size="sm" onClick={onClick}><Icon className="size-4" />{action.label}</FxButton>;
}

function RoundStep({ row, last, onRun }) {
  const { ordinal, name, state, sentence, interview, feedback, decision, isActive, placeholder, actions } = row;
  const mode = interview?.payload?.mode ? MODE_META[interview.payload.mode] : null;
  const decOutcome = decision?.payload?.outcome ? OUTCOME_META[decision.payload.outcome] : null;
  const decColor = decOutcome ? (TONE_VAR[decOutcome.tone] ?? "var(--fx-text)") : "var(--fx-text)";
  return (
    <div className="flex gap-3">
      {/* Timeline spine. */}
      <div className="flex flex-col items-center pt-3">
        <span className={cn("size-3 shrink-0 rounded-full border-2", isActive ? "border-[var(--fx-primary)] bg-[var(--fx-primary)]" : placeholder ? "border-[var(--fx-border)] bg-[var(--fx-surface)]" : "border-[var(--fx-success)] bg-[var(--fx-success)]")} />
        {!last ? <span className="mt-1 w-px flex-1 bg-[var(--fx-border)]" /> : null}
      </div>

      <div className={cn(
        "mb-1 flex-1 rounded-[12px] border p-4",
        isActive ? "border-[color:color-mix(in_srgb,var(--fx-primary)_28%,var(--fx-border))] bg-[var(--fx-surface)]"
          : placeholder ? "border-dashed border-[var(--fx-border)] bg-transparent"
            : "border-[var(--fx-border)] bg-[var(--fx-surface)]",
      )}>
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-[14px] font-semibold">
            <span className="text-[var(--fx-text-muted)]">Round {ordinal} — </span>
            <span className="text-[var(--fx-primary)]">{name}</span>
          </p>
          <FxBadge tone={state?.tone} variant="soft" size="xs" dot>{state?.label}</FxBadge>
        </div>

        <p className="mt-1 text-[13px] text-[var(--fx-text-muted)]">{sentence}</p>

        {/* Interview facts — only for the active round (quiet elsewhere). */}
        {isActive && interview ? (
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-[var(--fx-text)]">
            {(interview.payload?.interviewers ?? []).length ? (
              <span className="text-[var(--fx-text-muted)]">with <span className="text-[var(--fx-text)]">{interview.payload.interviewers.map((i) => i.name || i.email).filter(Boolean).join(", ")}</span></span>
            ) : null}
            {interview.payload?.dateKey ? <span className="inline-flex items-center gap-1.5"><CalendarClock className="size-3.5 text-[var(--fx-text-muted)]" />{formatDayLong(interview.payload.dateKey)}{interview.payload.slotStart != null ? `, ${formatSlotRange(interview.payload.slotStart, interview.payload.durationMin ?? 60)}` : ""}</span> : null}
            {mode ? <span className="inline-flex items-center gap-1.5"><mode.icon className="size-3.5 text-[var(--fx-text-muted)]" />{mode.label}</span> : null}
          </div>
        ) : null}

        {/* Feedback summary — two-column (label+value | note), stacks on narrow. */}
        {feedback ? (
          <div className="mt-2.5 rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface-subtle)] px-3 py-2.5">
            <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[var(--fx-text-muted)]">Feedback</p>
                <p className="mt-1 text-[13px] text-[var(--fx-text)]">
                  <span className="font-medium">{REC_META[feedback.payload?.recommendation]?.label ?? "—"}</span>
                  {feedback.payload?.byInterviewerId ? <span className="text-[var(--fx-text-muted)]"> by {personName(feedback.payload.byInterviewerId)}</span> : null}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[var(--fx-text-muted)]">Feedback note</p>
                <p className={cn("mt-0.5 whitespace-pre-wrap text-[12.5px]", feedback.payload?.notes ? "text-[var(--fx-text)]" : "text-[var(--fx-text-muted)]")}>{feedback.payload?.notes || "—"}</p>
              </div>
            </div>
            <button type="button" onClick={() => onRun("change_feedback")} className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--fx-primary)] transition-colors hover:underline">
              <RefreshCw className="size-3" /> Change feedback
            </button>
          </div>
        ) : null}

        {/* Decision — two-column (label+outcome | note), stacks on narrow; matches the Feedback block treatment. */}
        {decision?.payload?.outcome ? (
          <div className="mt-2.5 rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface-subtle)] px-3 py-2.5">
            <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[var(--fx-text-muted)]">Decision</p>
                <div className="mt-1">
                  <span className="inline-flex items-center rounded-[6px] border-[0.5px] px-2 py-[3px] text-[12px] font-semibold" style={{ color: decColor, borderColor: `color-mix(in srgb, ${decColor} 45%, transparent)`, backgroundColor: `color-mix(in srgb, ${decColor} 12%, var(--fx-surface))` }}>{decOutcome?.label ?? "—"}</span>
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[var(--fx-text-muted)]">Decision note</p>
                <p className={cn("mt-0.5 whitespace-pre-wrap text-[12.5px]", decision.payload?.note ? "text-[var(--fx-text)]" : "text-[var(--fx-text-muted)]")}>{decision.payload?.note || "—"}</p>
              </div>
            </div>
            <button type="button" onClick={() => onRun("change_decision")} className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--fx-primary)] transition-colors hover:underline">
              <RefreshCw className="size-3" /> Change decision
            </button>
          </div>
        ) : null}

        {/* Actions — the current round, plus any decided round (kept editable so nothing dead-ends). */}
        {actions && (actions.primary || actions.secondary.length) ? (
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            {actions.primary ? <ActionButton action={actions.primary} onClick={() => onRun(actions.primary.key)} /> : null}
            {actions.secondary.map((a) => <ActionButton key={a.key} action={a} ghost onClick={() => onRun(a.key)} />)}
          </div>
        ) : null}
      </div>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvInterviewJourneySheet };
/* - - - - - - - - - - - - - - - - */
