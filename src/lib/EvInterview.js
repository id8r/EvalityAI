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

// Decision outcome drives the round marker + the derived journey status (roundOutcome/interviewStatus).
export const DECISION_OUTCOMES = [
  { value: "advance", label: "Advance", tone: "success" },
  { value: "hold", label: "Hold", tone: "warning" },
  { value: "reject", label: "Reject", tone: "danger" },
];

const DONE_INTERVIEW_STATUSES = ["done", "cancelled"];

// Latest decision outcome in a round ("advance" | "hold" | "reject"), else null. Rounds store no outcome of their own.
export function roundOutcome(round) {
  const decisions = (round?.items ?? []).filter((it) => it.type === "decision" && it.payload?.outcome);
  return decisions.length ? decisions[decisions.length - 1].payload.outcome : null;
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

// Header-strip signals: overdue items + rounds that have an interview but no decision yet. Pure.
export function journeyAttention(rounds = [], todayKey) {
  const overdue = [];
  let awaitingDecision = 0;
  rounds.forEach((round) => {
    (round.items ?? []).forEach((it) => { if (isItemOverdue(it, todayKey)) overdue.push({ ...it, roundName: round.name }); });
    if ((round.items ?? []).some((it) => it.type === "interview") && !roundOutcome(round)) awaitingDecision += 1;
  });
  return { overdue, awaitingDecision };
}

// One interview card synthesized from the legacy flat single-interview object. Deterministic id → idempotent normalize.
function interviewItemFromFlat(iv) {
  return {
    id: "itm_seed_interview",
    type: "interview",
    title: iv.scheduleDetails || iv.stage || "Interview",
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
  const items = rounds.flatMap((r) => (r.items ?? []).map((it) => ({ ...it, roundName: r.name })));
  const lastInterview = items.filter((it) => it.type === "interview").slice(-1)[0] ?? null;
  const lastDecision = items.filter((it) => it.type === "decision" && it.payload?.outcome).slice(-1)[0] ?? null;
  const lastFeedback = items.filter((it) => it.type === "feedback").slice(-1)[0] ?? null;
  const currentRound = rounds[rounds.length - 1] ?? null;
  return {
    stage: currentRound?.name ?? "",
    scheduleDetails: lastInterview?.payload?.scheduleDetails ?? "",
    interviewer: interviewerLabelOf(lastInterview),
    recommendation: lastDecision ? DECISION_OUTCOMES.find((o) => o.value === lastDecision.payload.outcome)?.label ?? "" : "",
    feedback: lastFeedback ? (lastFeedback.status === "submitted" ? "View" : "Pending") : "",
  };
}
