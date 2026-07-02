/* src/lib/EvInterview.js | Interview scheduling model — options + deterministic mock availability | Sree | 2026-07-01 */

/*
  Scheduling data + a deterministic mock availability engine (no Google/Outlook logic). Everything is derived
  from (dateKey, duration, seed, now) so it's stable across renders — the recruiter sees the same "booked"
  slots every time for a given candidate/day. The single seam for a real provider later is getDayAvailability():
  swap its body for a fetch and keep the { bookedIntervals, slots, availableCount } shape.
*/

export const ROUND_OPTIONS = ["Screening", "Round 1", "Round 2", "Technical", "Managerial", "HR Round", "Final"];

// Seeded recent interviewers — powers the email type-ahead + a sensible default. Single-recruiter path for now;
// swap this for a real team roster when the company/multi-user flow lands (the sheet reads it via one prop seam).
export const RECENT_INTERVIEWERS = [
  { name: "Rejith", email: "rejith@evality.ai", phone: "+91 98765 43210" },
  { name: "Priya Nair", email: "priya@evality.ai", phone: "+91 90041 55221" },
  { name: "Akhil Menon", email: "akhil@evality.ai", phone: "+91 90880 33417" },
  { name: "Harish Rao", email: "harish@evality.ai", phone: "" },
  { name: "Meera Iyer", email: "meera@evality.ai", phone: "" },
];

export const INTERVIEW_MODES = [
  { value: "remote", label: "Remote" },
  { value: "in_person", label: "In-person" },
  { value: "phone", label: "Phone" },
];

export const DURATION_OPTIONS = [
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "60 min" },
  { value: "90", label: "90 min" },
];
export const DEFAULT_DURATION = 60;

export const TIMEZONES = [
  { value: "Asia/Kolkata", label: "IST · Asia/Kolkata" },
  { value: "Asia/Dubai", label: "GST · Asia/Dubai" },
  { value: "Asia/Singapore", label: "SGT · Asia/Singapore" },
  { value: "Europe/London", label: "GMT · Europe/London" },
  { value: "America/New_York", label: "ET · America/New_York" },
  { value: "America/Los_Angeles", label: "PT · America/Los_Angeles" },
];
export const DEFAULT_TIMEZONE = "Asia/Kolkata";

// Default business hours (minutes from midnight). Evening group only appears if `end` extends past 18:00.
export const BUSINESS_HOURS = { start: 9 * 60, end: 18 * 60 };
const SLOT_STEP = 30; // half-hour slot starts
const MOCK_BOOKED_DURATION = 60; // each seeded existing interview blocks an hour
const HORIZON_DAYS = 90; // how far ahead we look for the first open day

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MOCK_ROUNDS = ["Screening", "Round 1", "Technical", "Managerial"];
const MOCK_INTERVIEWERS = ["Rejith", "Priya", "Akhil", "Harish", "Meera"];

/* - - - - date helpers (key = "YYYY-MM-DD", built from explicit parts to dodge tz drift) - - - - */
const pad = (n) => String(n).padStart(2, "0");
export function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
function keyToParts(key) {
  const [y, m, d] = key.split("-").map(Number);
  return { y, m: m - 1, d };
}
function dateFromKey(key) {
  const { y, m, d } = keyToParts(key);
  return new Date(y, m, d); // local midnight (args → lint-safe)
}
export function monthKeyOf(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-01`;
}
export function addMonths(monthKey, delta) {
  const { y, m } = keyToParts(monthKey);
  return monthKeyOf(new Date(y, m + delta, 1));
}
// 6×7 grid of Date objects covering the month `monthKey` sits in (leading/trailing days included).
export function monthGrid(monthKey) {
  const { y, m } = keyToParts(monthKey);
  const startWeekday = new Date(y, m, 1).getDay();
  return Array.from({ length: 42 }, (_, i) => new Date(y, m, 1 - startWeekday + i));
}
export const weekdayLabels = WEEKDAYS;

/* - - - - time formatting - - - - */
export function formatClock(min) {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const meridiem = h24 >= 12 ? "PM" : "AM";
  const h12 = ((h24 + 11) % 12) + 1;
  return `${h12}:${pad(m)} ${meridiem}`;
}
// "10:00 – 11:00 AM" (drops the first meridiem when both ends share it).
export function formatSlotRange(start, durationMin) {
  const end = start + durationMin;
  const a = formatClock(start);
  const b = formatClock(end);
  const sameMeridiem = a.slice(-2) === b.slice(-2);
  return `${sameMeridiem ? a.slice(0, -3) : a}–${b}`;
}
export function formatDayLong(key) {
  const dt = dateFromKey(key);
  return `${WEEKDAYS[dt.getDay()]}, ${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
}

/* - - - - deterministic hashing - - - - */
function hashKey(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function slotGroup(startMin, endHour) {
  if (startMin < 12 * 60) return "Morning";
  if (endHour > 18 * 60 && startMin >= 17 * 60) return "Evening";
  return "Afternoon";
}
export const SLOT_GROUP_ORDER = ["Morning", "Afternoon", "Evening"];

// Seeded existing interviews for a day (0–3, stable). Powers the day-cell dots + the "existing interviews" peek.
function bookedIntervalsForDay(dateKey, seed) {
  const { start, end } = BUSINESS_HOURS;
  const grid = [];
  for (let t = start; t + MOCK_BOOKED_DURATION <= end; t += SLOT_STEP) grid.push(t);
  const count = hashKey(`${dateKey}|${seed}`) % 4; // 0..3
  const seen = new Set();
  const intervals = [];
  for (let i = 0; i < count; i += 1) {
    const h = hashKey(`${dateKey}#${seed}#${i}`);
    const startMin = grid[h % grid.length];
    if (seen.has(startMin)) continue;
    seen.add(startMin);
    intervals.push({
      start: startMin,
      end: startMin + MOCK_BOOKED_DURATION,
      timeLabel: formatSlotRange(startMin, MOCK_BOOKED_DURATION),
      round: MOCK_ROUNDS[h % MOCK_ROUNDS.length],
      interviewer: MOCK_INTERVIEWERS[(h >> 3) % MOCK_INTERVIEWERS.length],
    });
  }
  return intervals.sort((a, b) => a.start - b.start);
}

/*
  Availability for one day. Slots come from business hours + duration (not a rigid 9–5 table); a slot is
  `disabled` when it overlaps a seeded interview or (for today) has already passed — disabled, never hidden,
  so the recruiter sees why fewer slots are open. Swap this body for a real provider later; keep the shape.
*/
export function getDayAvailability(dateKey, { now, durationMin = DEFAULT_DURATION, seed = "" } = {}) {
  const { start, end } = BUSINESS_HOURS;
  const today = new Date(now);
  const todayKey = toDateKey(today);
  const isPast = dateKey < todayKey;
  const isToday = dateKey === todayKey;
  const nowMinutes = today.getHours() * 60 + today.getMinutes();

  const booked = bookedIntervalsForDay(dateKey, seed);
  const slots = [];
  for (let t = start; t + durationMin <= end; t += SLOT_STEP) {
    const overlaps = booked.some((b) => t < b.end && t + durationMin > b.start);
    const passed = isToday && t <= nowMinutes;
    slots.push({
      start: t,
      label: formatClock(t),
      group: slotGroup(t, end),
      disabled: isPast || overlaps || passed,
    });
  }
  const availableCount = slots.filter((s) => !s.disabled).length;
  return { dateKey, isPast, isToday, bookedIntervals: booked, slots, availableCount };
}

// First upcoming day (from today) that has at least one open slot at the given duration.
export function firstAvailableDateKey(now, { seed = "", durationMin = DEFAULT_DURATION } = {}) {
  const base = new Date(now);
  for (let i = 0; i < HORIZON_DAYS; i += 1) {
    const day = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    const key = toDateKey(day);
    if (getDayAvailability(key, { now, durationMin, seed }).availableCount > 0) return key;
  }
  return toDateKey(base);
}

/* - - - - output builders - - - - */
// Compact string stored on the Application + shown in the Interview table's "Schedule Details" column.
export function buildScheduleDetails({ dateKey, slotStart, durationMin, timezone }) {
  if (dateKey == null || slotStart == null) return "";
  const tz = TIMEZONES.find((t) => t.value === timezone)?.label?.split(" · ")[0] ?? "";
  return `${formatDayLong(dateKey)} · ${formatSlotRange(slotStart, durationMin)}${tz ? ` ${tz}` : ""}`;
}

// Live confirmation parts for the sheet (so the entities can be bolded); null until interviewer + date + slot are set.
export function confirmLineParts({ round, mode, candidateName, dateKey, slotStart, durationMin, timezone, hasInterviewer }) {
  if (!hasInterviewer || dateKey == null || slotStart == null) return null;
  return {
    round: round || "interview",
    mode: INTERVIEW_MODES.find((m) => m.value === mode)?.label ?? "",
    who: candidateName || "",
    date: formatDayLong(dateKey),
    time: formatClock(slotStart),
    duration: durationMin,
    tz: TIMEZONES.find((t) => t.value === timezone)?.label?.split(" · ")[0] ?? "",
  };
}

/* - - - - Round Board — candidate interview journey (rounds[] + typed work-item cards) - - - - */

export const ITEM_TYPES = [
  { value: "interview", label: "Interview" },
  { value: "task", label: "Task" },
  { value: "decision", label: "Decision" },
  { value: "note", label: "Note" },
  { value: "feedback", label: "Feedback" },
];

// Decision outcome drives the round marker, the derived journey status, and the round's next-action CTA.
export const DECISION_OUTCOMES = [
  { value: "advance", label: "Advance", tone: "success" },
  { value: "hold", label: "Hold", tone: "warning" },
  { value: "reject", label: "Reject", tone: "danger" },
  { value: "offer", label: "Offer", tone: "primary" },
];

// Interviewer feedback recommendation scale (feedback item payload.recommendation).
export const RECOMMENDATIONS = [
  { value: "strong_yes", label: "Strong Yes", tone: "success" },
  { value: "yes", label: "Yes", tone: "success" },
  { value: "no", label: "No", tone: "danger" },
  { value: "strong_no", label: "Strong No", tone: "danger" },
];

const RECOMMENDATION_LABEL_BY_VALUE = Object.fromEntries(RECOMMENDATIONS.map((item) => [item.value, item.label]));
const RECOMMENDATION_TONE_BY_VALUE = {
  strong_yes: "success",
  yes: "success",
  no: "warning",
  strong_no: "danger",
};

const DONE_INTERVIEW_STATUSES = ["done", "cancelled"];

// Latest decision outcome in a round ("advance" | "hold" | "reject"), else null. Rounds store no outcome of their own.
export function roundOutcome(round) {
  const decisions = (round?.items ?? []).filter((it) => it.type === "decision" && it.payload?.outcome);
  return decisions.length ? decisions[decisions.length - 1].payload.outcome : null;
}

function flattenRoundItems(rounds, type) {
  return rounds.flatMap((round, roundIndex) =>
    (round.items ?? [])
      .filter((item) => item.type === type)
      .map((item) => ({ ...item, roundId: round.id, roundName: round.name, roundOrder: roundIndex + 1 })),
  );
}

export function latestInterviewItem(rounds = []) {
  const items = flattenRoundItems(rounds, "interview");
  return items.length ? [...items].sort((a, b) => new Date(a.createdAt ?? 0) - new Date(b.createdAt ?? 0)).at(-1) : null;
}

export function latestFeedbackItem(rounds = []) {
  const items = flattenRoundItems(rounds, "feedback");
  return items.length ? [...items].sort((a, b) => new Date(a.createdAt ?? 0) - new Date(b.createdAt ?? 0)).at(-1) : null;
}

export function feedbackRecommendationLabel(value) {
  return RECOMMENDATION_LABEL_BY_VALUE[value] ?? "Pending";
}

export function feedbackRecommendationTone(value) {
  return RECOMMENDATION_TONE_BY_VALUE[value] ?? "subtle";
}

// Journey status derived from rounds. A reject here does NOT evict — the bucket move stays an explicit recruiter action.
export function interviewStatus(rounds = []) {
  if (!rounds.length) return "not_started";
  for (let i = rounds.length - 1; i >= 0; i -= 1) {
    const outcome = roundOutcome(rounds[i]);
    if (outcome === "reject") return "rejected";
    if (outcome === "hold") return "on_hold";
    if (outcome === "advance") return "in_progress";
  }
  return "in_progress";
}

// A dated item is overdue when its due date has passed and it isn't already resolved.
export function isItemOverdue(item, todayKey) {
  if (!item?.dueDate || !todayKey) return false;
  if (item.type === "task" && item.status === "done") return false;
  if (item.type === "interview" && DONE_INTERVIEW_STATUSES.includes(item.status)) return false;
  return item.dueDate < todayKey;
}

// Header-strip signals (each carries roundId so the strip can scroll the recruiter to the exact round). Pure.
export function journeyAttention(rounds = [], todayKey) {
  const overdue = [];
  const awaiting = [];
  rounds.forEach((round) => {
    const items = round.items ?? [];
    items.forEach((it) => { if (isItemOverdue(it, todayKey)) overdue.push({ id: it.id, title: it.title, roundId: round.id, roundName: round.name }); });
    // "Awaiting decision" is only actionable once the interview is concluded (done) or feedback exists — not while it's still upcoming.
    const concluded = items.some((it) => it.type === "interview" && it.status === "done") || items.some((it) => it.type === "feedback");
    if (concluded && !roundOutcome(round)) awaiting.push({ roundId: round.id, roundName: round.name });
  });
  return { overdue, awaiting, awaitingDecision: awaiting.length };
}

/* - - - - Journey orientation — "where is the candidate + what's the next move?" (all pure) - - - - */

// The active round the recruiter is working = the last column. null when the journey is empty.
export function currentRound(rounds = []) {
  return rounds.length ? rounds[rounds.length - 1] : null;
}

// A round's human state + badge tone, derived from its items (rounds store no state of their own).
export function roundState(round, todayKey) {
  const outcome = roundOutcome(round);
  if (outcome) {
    const meta = DECISION_OUTCOMES.find((o) => o.value === outcome);
    return { key: outcome, label: meta?.label ?? outcome, tone: meta?.tone ?? "neutral" };
  }
  const items = round?.items ?? [];
  if (!items.length) return { key: "empty", label: "Not started", tone: "subtle" };
  if (items.some((it) => isItemOverdue(it, todayKey))) return { key: "overdue", label: "Overdue", tone: "danger" };
  const interviews = items.filter((it) => it.type === "interview");
  if (interviews.length) {
    const done = interviews.some((it) => it.status === "done") || items.some((it) => it.type === "feedback");
    return done ? { key: "awaiting_decision", label: "Awaiting decision", tone: "warning" } : { key: "scheduled", label: "Scheduled", tone: "primary" };
  }
  return { key: "in_progress", label: "In progress", tone: "primary" };
}

// Items still needing action — feeds the round's pending count.
export function roundPendingItems(round, todayKey) {
  return (round?.items ?? []).filter((it) => {
    if (it.type === "task") return it.status !== "done";
    if (it.type === "feedback") return it.status !== "submitted";
    if (it.type === "interview") return !["done", "cancelled"].includes(it.status);
    if (it.type === "decision") return !it.payload?.outcome;
    return isItemOverdue(it, todayKey); // notes only surface if dated + overdue
  });
}

/*
  The single strongest next action for a round, so the board can render one guiding CTA instead of a freeform
  task board. Outcome-driven once a decision exists; otherwise walks the schedule → feedback → decision lifecycle.
*/
export function roundPrimaryAction(round, isLast) {
  const outcome = roundOutcome(round);
  if (outcome === "advance") return isLast ? { key: "create_next_round", label: "Create next round" } : null;
  if (outcome === "offer") return { key: "move_to_offered", label: "Move to Offered" };
  if (outcome === "reject") return { key: "reject_candidate", label: "Reject Candidate" };
  if (outcome === "hold") return { key: "add_task", label: "Add follow-up task" };
  const items = round?.items ?? [];
  if (!items.length) return { key: "add_interview", label: "Schedule interview" };
  if (items.some((it) => it.type === "interview") && !items.some((it) => it.type === "feedback")) return { key: "record_feedback", label: "Record feedback" };
  if (!items.some((it) => it.type === "decision")) return { key: "record_decision", label: "Record decision" };
  return null;
}

// Board-level "next recommended action" for the header — the earliest round with an open primary action.
export function nextActionHint(journey) {
  const rounds = journey?.rounds ?? [];
  if (!rounds.length) return { label: "Add the first round to begin", roundId: null, action: { key: "add_round", label: "Add round" } };
  const lastId = rounds[rounds.length - 1].id;
  for (const round of rounds) {
    const action = roundPrimaryAction(round, round.id === lastId);
    if (action) return { label: `${action.label} · ${round.name}`, roundId: round.id, action };
  }
  return { label: "Journey up to date", roundId: lastId, action: null };
}

/* - - - - Planned journey + table overview (shared by the journey sheet and the Interviewing table) - - - - */

// Default planned journey (until job-config / round-setup drives it).
export const PLANNED_ROUNDS = ["Recruiter Screen", "Portfolio Review", "Leadership Round", "Final Round"];

// A stored round name wins only if it's a real label (has letters, not a generic "Round N"); else the plan name.
export function roundDisplayName(index, actual) {
  const stored = actual?.name?.trim();
  if (stored && /[a-z]/i.test(stored) && !/^round\s*\d+$/i.test(stored)) return stored;
  return PLANNED_ROUNDS[index] ?? `Round ${index + 1}`;
}

// Short day label without the year — "Wed, 8 Jul".
export function formatDayShort(key) {
  const dt = dateFromKey(key);
  return `${WEEKDAYS[dt.getDay()]}, ${dt.getDate()} ${MONTHS[dt.getMonth()]}`;
}

/*
  Compact status view of a candidate's journey for the Interviewing TABLE (not the full lifecycle). Reflects the
  ACTIVE slot: the last actual round, or — once that round is Advanced — the next planned slot ("Ready to schedule").
*/
export function interviewOverview(journey) {
  const rounds = journey?.rounds ?? [];
  const lastIdx = rounds.length - 1;
  const lastOutcome = lastIdx >= 0 ? roundOutcome(rounds[lastIdx]) : null;
  const activeIndex = rounds.length === 0 ? 0 : lastOutcome === "advance" ? rounds.length : lastIdx;
  const activeRound = rounds[activeIndex] ?? null;
  const ordinal = activeIndex + 1;
  const roundName = roundDisplayName(activeIndex, activeRound);

  const interview = activeRound ? [...(activeRound.items ?? [])].reverse().find((it) => it.type === "interview") ?? null : null;
  const feedback = activeRound ? [...(activeRound.items ?? [])].reverse().find((it) => it.type === "feedback") ?? null : null;
  const outcome = activeRound ? roundOutcome(activeRound) : null;

  const p = interview?.payload ?? {};
  const scheduled = Boolean(interview && p.dateKey);
  const whenLabel = scheduled ? [formatDayShort(p.dateKey), p.slotStart != null ? formatClock(p.slotStart) : ""].filter(Boolean).join(" · ") : "";
  const modeMeta = INTERVIEW_MODES.find((m) => m.value === p.mode);
  const whereText = p.where?.link || p.where?.address || p.where?.number || "";
  const modeLabel = modeMeta ? `${modeMeta.label}${whereText ? ` · ${whereText}` : ""}` : "";
  const person = (p.interviewers ?? [])[0] ?? null;

  let nextActionLabel = "";
  if (!activeRound) nextActionLabel = `Schedule Round ${ordinal}`;
  else if (outcome === "offer") nextActionLabel = "Move to Offered";
  else if (outcome === "reject") nextActionLabel = "Reject Candidate";
  else if (outcome === "hold") nextActionLabel = "Add follow-up task";
  else if (!interview) nextActionLabel = "Schedule interview";
  else if (interview.status !== "done") nextActionLabel = "Mark completed";
  else if (!feedback) nextActionLabel = "Record feedback";
  else if (!outcome) nextActionLabel = "Record decision";

  let feedbackState = "pending"; // scheduled/upcoming
  if (feedback) feedbackState = "view";
  else if (interview && interview.status === "done") feedbackState = "record";

  return { roundName, ordinal, scheduled, whenLabel, modeLabel, interviewerName: person?.name ?? "", interviewerEmail: person?.email ?? "", nextActionLabel, feedbackState, feedback, round: activeRound };
}

// One interview card synthesized from the legacy flat single-interview object. Deterministic id → idempotent normalize.
function interviewItemFromFlat(iv) {
  return {
    id: "itm_seed_interview",
    type: "interview",
    title: `${iv.stage || "Round 1"} Interview`, // reads as an event ("Technical Interview"), not a duplicate round label

    assigneeId: null,
    dueDate: iv.date ?? null,
    flagged: false,
    links: [],
    status: "scheduled",
    createdAt: iv.scheduledAt ?? null,
    payload: {
      mode: iv.mode ?? null,
      dateKey: iv.date ?? null,
      slotStart: iv.slotStart ?? null,
      durationMin: iv.durationMin ?? null,
      timezone: iv.timezone ?? null,
      interviewers: iv.interviewers ?? [],
      where: iv.where ?? null,
      notes: iv.notes ?? "",
      sharePacket: iv.sharePacket ?? null,
      scheduleDetails: iv.scheduleDetails ?? "",
    },
  };
}

/*
  Read adapter: fold whatever shape `app.interview` is in into the canonical journey { status, rounds, summary }.
  Idempotent + pure (only deterministic seed ids). The board always reads through this, so the frozen Schedule
  sheet can keep writing flat fields — they surface as a synthesized first round until the Phase 2 write path lands.
*/
export function normalizeInterview(interview) {
  const iv = interview ?? {};
  const rounds = Array.isArray(iv.rounds) ? iv.rounds : [];
  if (rounds.length) return { status: interviewStatus(rounds), rounds, summary: iv.summary ?? "" };
  if (iv.date || iv.scheduleDetails || iv.stage) {
    const round = { id: "rnd_seed", order: 1, name: iv.stage || "Round 1", createdAt: iv.scheduledAt ?? null, items: [interviewItemFromFlat(iv)] };
    return { status: interviewStatus([round]), rounds: [round], summary: iv.summary ?? "" };
  }
  return { status: "not_started", rounds: [], summary: iv.summary ?? "" };
}

function interviewerLabelOf(item) {
  return (item?.payload?.interviewers ?? []).map((p) => p.name || p.email).filter(Boolean).join(", ");
}

/*
  Flat mirror the Interview table columns still read (interview.stage/scheduleDetails/interviewer/recommendation/
  feedback). Recomputed on every board write so the table needs zero changes while rounds[] stays the source of truth.
*/
export function deriveInterviewSummary(rounds = []) {
  const lastInterview = latestInterviewItem(rounds);
  const lastFeedback = latestFeedbackItem(rounds);
  const currentRound = rounds[rounds.length - 1] ?? null;
  return {
    stage: currentRound?.name ?? "",
    scheduleDetails: lastInterview?.payload?.scheduleDetails ?? "",
    interviewer: interviewerLabelOf(lastInterview),
    recommendation: lastFeedback ? feedbackRecommendationLabel(lastFeedback.payload?.recommendation) : "",
    feedback: lastFeedback ? "View" : "",
  };
}
