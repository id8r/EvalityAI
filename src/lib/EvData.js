/* src/lib/EvData.js | Ev domain accessors + CRUD over EvStore (no UI logic) | Sree | 2026-06-28 */

import { getCollection, setCollection } from "@/lib/EvStore";
import { normalizeInterview, deriveInterviewSummary, interviewStatus } from "@/lib/EvInterview";
/* - - - - - - - - - - - - - - - - */

function nowIso() {
  return new Date().toISOString();
}

function genId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 46656).toString(36)}`;
}

/* ---------- Users ---------- */
export function getUsers() {
  return getCollection("users");
}
export function getUser(id) {
  return getUsers().find((user) => user.id === id) ?? null;
}
export function getUserByEmail(email) {
  return getUsers().find((user) => user.email === email) ?? null;
}
export function updateUser(id, patch) {
  setCollection("users", getUsers().map((user) => (user.id === id ? { ...user, ...patch, updatedAt: nowIso() } : user)));
  return getUser(id);
}

/* ---------- Settings (singleton object) ---------- */
export function getSettings() {
  return getCollection("settings");
}
export function updateSettings(patch) {
  const next = { ...getSettings(), ...patch, updatedAt: nowIso() };
  setCollection("settings", next);
  return next;
}
// Shallow-merge into a named group: company / workspace / screeningDefaults / email / calendar / credits.
export function updateSettingsGroup(group, patch) {
  const settings = getSettings();
  const next = { ...settings, [group]: { ...(settings[group] ?? {}), ...patch }, updatedAt: nowIso() };
  setCollection("settings", next);
  return next;
}

/* ---------- Clients ---------- */
export function getClients() {
  return getCollection("clients");
}
export function getClient(id) {
  return getClients().find((client) => client.id === id) ?? null;
}
export function createClient(data = {}) {
  const client = { id: genId("cli"), archivedAt: null, createdAt: nowIso(), updatedAt: nowIso(), ...data };
  setCollection("clients", [...getClients(), client]);
  return client;
}
export function updateClient(id, patch) {
  setCollection("clients", getClients().map((client) => (client.id === id ? { ...client, ...patch, updatedAt: nowIso() } : client)));
  return getClient(id);
}
export function archiveClient(id) {
  return updateClient(id, { archivedAt: nowIso() });
}
export function restoreClient(id) {
  return updateClient(id, { archivedAt: null });
}
export function deleteClient(id) {
  setCollection("clients", getClients().filter((client) => client.id !== id));
}

/* ---------- Jobs (nested: core / roleSpec / content / screeningConfig / evaluationConfig) ---------- */
export function getJobs() {
  return getCollection("jobs");
}
export function getJob(id) {
  return getJobs().find((job) => job.core?.id === id) ?? null;
}
// Merge a patch into a named group; always bumps core.updatedAt.
export function updateJobGroup(id, group, patch) {
  setCollection(
    "jobs",
    getJobs().map((job) => {
      if (job.core?.id !== id) return job;
      const merged = { ...job, [group]: { ...(job[group] ?? {}), ...patch } };
      merged.core = { ...merged.core, updatedAt: nowIso() };
      return merged;
    }),
  );
  return getJob(id);
}
export function updateJob(id, nextJob = {}) {
  const current = getJob(id);
  if (!current) return null;
  const merged = {
    ...current,
    ...nextJob,
    core: {
      ...(current.core ?? {}),
      ...(nextJob.core ?? {}),
      id,
      updatedAt: nowIso(),
    },
    roleSpec: { ...(current.roleSpec ?? {}), ...(nextJob.roleSpec ?? {}) },
    content: { ...(current.content ?? {}), ...(nextJob.content ?? {}) },
    screeningConfig: { ...(current.screeningConfig ?? {}), ...(nextJob.screeningConfig ?? {}) },
    evaluationConfig: { ...(current.evaluationConfig ?? {}), ...(nextJob.evaluationConfig ?? {}) },
  };
  setCollection("jobs", getJobs().map((job) => (job.core?.id === id ? merged : job)));
  return getJob(id);
}
export function archiveJob(id) {
  return updateJobGroup(id, "core", { archivedAt: nowIso() });
}
export function restoreJob(id) {
  return updateJobGroup(id, "core", { archivedAt: null });
}
export function createJob(input = {}) {
  const id = genId("job");
  const job = {
    core: { archivedAt: null, status: "draft", clientId: null, ...(input.core ?? {}), id, createdAt: nowIso(), updatedAt: nowIso() },
    roleSpec: input.roleSpec ?? {},
    content: input.content ?? {},
    screeningConfig: input.screeningConfig ?? {},
    evaluationConfig: input.evaluationConfig ?? {},
  };
  setCollection("jobs", [...getJobs(), job]);
  return job;
}
export function deleteJob(id) {
  setCollection("jobs", getJobs().filter((job) => job.core?.id !== id));
  setCollection("applications", getApplications().filter((app) => app.jobId !== id));
}

/* ---------- Candidates ---------- */
export function getCandidates() {
  return getCollection("candidates");
}
export function getCandidate(id) {
  return getCandidates().find((candidate) => candidate.id === id) ?? null;
}
export function createCandidate(data = {}) {
  const candidate = { id: genId("cand"), archivedAt: null, createdAt: nowIso(), updatedAt: nowIso(), ...data };
  setCollection("candidates", [...getCandidates(), candidate]);
  return candidate;
}
export function updateCandidate(id, patch) {
  setCollection("candidates", getCandidates().map((candidate) => (candidate.id === id ? { ...candidate, ...patch, updatedAt: nowIso() } : candidate)));
  return getCandidate(id);
}
export function archiveCandidate(id) {
  return updateCandidate(id, { archivedAt: nowIso() });
}
export function restoreCandidate(id) {
  return updateCandidate(id, { archivedAt: null });
}

/* ---------- Applications (candidate × job; nested qualification/screening/evaluation/clientShare/interview/outcome) ---------- */
export function getApplications() {
  return getCollection("applications");
}
export function getApplication(id) {
  return getApplications().find((app) => app.id === id) ?? null;
}
export function getApplicationsByJob(jobId) {
  return getApplications().filter((app) => app.jobId === jobId);
}
export function getApplicationsByCandidate(candidateId) {
  return getApplications().filter((app) => app.candidateId === candidateId);
}
export function createApplication(data = {}) {
  const at = nowIso();
  const app = {
    id: genId("app"),
    candidateId: null,
    jobId: null,
    stage: "unscreened",
    clientStatus: null,
    source: "manual",
    appliedAt: at,
    viewedAt: null,
    createdAt: at,
    updatedAt: at,
    stageHistory: [{ stage: "unscreened", at, actorId: null }],
    qualification: { matchScore: null, trustScore: "", expectedSalary: { amount: null, currency: "" }, availability: { mode: "days", days: null, commuteComfortable: false } },
    screening: { status: "pending", mode: "", answers: [], completedAt: null, manual: { completedAt: null, notes: "" }, email: { startedAt: null, attemptCount: 0, message: "" } },
    evaluation: { cvMatchBreakdown: { overallScore: null, sections: [] } },
    clientShare: { sharedAt: null, recipients: [], message: "", mode: "", includes: [] },
    interview: { status: "not_started", rounds: [], summary: "" },
    outcome: { rejectionReason: null, rejectionNote: "" },
    activity: [],
    notes: [],
    ...data,
  };
  setCollection("applications", [...getApplications(), app]);
  return app;
}
export function updateApplication(id, patch) {
  setCollection("applications", getApplications().map((app) => (app.id === id ? { ...app, ...patch, updatedAt: nowIso() } : app)));
  return getApplication(id);
}
// Stamp the first time a recruiter opens this candidate (clears the "new/unviewed" marker). Idempotent.
export function markApplicationViewed(id) {
  const app = getApplication(id);
  if (!app || app.viewedAt) return app;
  return updateApplication(id, { viewedAt: nowIso() });
}
// One-time healing of legacy/invalid application data. Idempotent — only writes when something actually changes.
// Currently: the old bug wrote the stage "interview" (no such bucket → showed as Unscreened); map it to "interviewing".
export function migrateApplications() {
  const apps = getApplications();
  let changed = false;
  const next = apps.map((app) => {
    if (app.stage !== "interview") return app;
    changed = true;
    const stageHistory = (app.stageHistory ?? []).map((h) => (h.stage === "interview" ? { ...h, stage: "interviewing" } : h));
    return { ...app, stage: "interviewing", stageHistory };
  });
  if (changed) setCollection("applications", next);
  return changed;
}

// Move to a new stage and append to stageHistory.
export function setApplicationStage(id, stage, actorId = null) {
  const app = getApplication(id);
  if (!app) return null;
  const stageHistory = [...(app.stageHistory ?? []), { stage, at: nowIso(), actorId }];
  return updateApplication(id, { stage, stageHistory });
}

/* ---------- Interview Round Board (candidate journey; rounds[] = source of truth) ---------- */
// Single write path: persist the journey + recompute the flat mirror the Interview table reads.
function persistInterviewRounds(id, rounds, summary = "") {
  return updateApplication(id, { interview: { status: interviewStatus(rounds), rounds, summary, ...deriveInterviewSummary(rounds) } });
}
export function getInterviewJourney(id) {
  return normalizeInterview(getApplication(id)?.interview);
}
export function interviewAddRound(id, name) {
  const { rounds, summary } = getInterviewJourney(id);
  const round = { id: genId("rnd"), order: rounds.length + 1, name: name?.trim() || `Round ${rounds.length + 1}`, createdAt: nowIso(), items: [] };
  return persistInterviewRounds(id, [...rounds, round], summary);
}
export function interviewUpdateRound(id, roundId, patch) {
  const { rounds, summary } = getInterviewJourney(id);
  return persistInterviewRounds(id, rounds.map((r) => (r.id === roundId ? { ...r, ...patch } : r)), summary);
}
export function interviewRemoveRound(id, roundId) {
  const { rounds, summary } = getInterviewJourney(id);
  const next = rounds.filter((r) => r.id !== roundId).map((r, i) => ({ ...r, order: i + 1 }));
  return persistInterviewRounds(id, next, summary);
}
export function interviewAddItem(id, roundId, data = {}) {
  const { rounds, summary } = getInterviewJourney(id);
  const item = { id: genId("itm"), type: "task", title: "", assigneeId: null, dueDate: null, flagged: false, links: [], status: null, createdAt: nowIso(), payload: {}, ...data };
  return persistInterviewRounds(id, rounds.map((r) => (r.id === roundId ? { ...r, items: [...(r.items ?? []), item] } : r)), summary);
}
export function interviewUpdateItem(id, itemId, patch) {
  const { rounds, summary } = getInterviewJourney(id);
  return persistInterviewRounds(id, rounds.map((r) => ({ ...r, items: (r.items ?? []).map((it) => (it.id === itemId ? { ...it, ...patch } : it)) })), summary);
}
export function interviewRemoveItem(id, itemId) {
  const { rounds, summary } = getInterviewJourney(id);
  return persistInterviewRounds(id, rounds.map((r) => ({ ...r, items: (r.items ?? []).filter((it) => it.id !== itemId) })), summary);
}
// v1 move (no drag lib): shift an item to an adjacent round. dir = -1 (left) | +1 (right).
export function interviewMoveItem(id, itemId, dir) {
  const { rounds, summary } = getInterviewJourney(id);
  const fromIdx = rounds.findIndex((r) => (r.items ?? []).some((it) => it.id === itemId));
  const toIdx = fromIdx + dir;
  if (fromIdx < 0 || toIdx < 0 || toIdx >= rounds.length) return getApplication(id);
  const item = rounds[fromIdx].items.find((it) => it.id === itemId);
  const next = rounds.map((r, i) => {
    if (i === fromIdx) return { ...r, items: r.items.filter((it) => it.id !== itemId) };
    if (i === toIdx) return { ...r, items: [...(r.items ?? []), item] };
    return r;
  });
  return persistInterviewRounds(id, next, summary);
}

// Map the Schedule sheet's submit payload → an interview item's payload.
function interviewPayloadFrom(p = {}) {
  return {
    mode: p.mode ?? null,
    dateKey: p.dateKey ?? null,
    slotStart: p.slotStart ?? null,
    durationMin: p.durationMin ?? null,
    timezone: p.timezone ?? null,
    interviewers: p.interviewers ?? [],
    where: p.where ?? null,
    notes: p.notes ?? "",
    sharePacket: p.sharePacket ?? null,
    scheduleDetails: p.scheduleDetails ?? "",
  };
}
function newInterviewItem(roundName, p) {
  return { id: genId("itm"), type: "interview", title: `${roundName} Interview`, assigneeId: null, dueDate: p.dateKey ?? null, flagged: false, links: [], status: "scheduled", createdAt: nowIso(), payload: p };
}

// Schedule-sheet write path (reschedule = keep prior slot as history; missing itemId = add an interview to the round).
export function interviewUpsertInterview(id, roundId, itemId, payload, { keepHistory = true } = {}) {
  const { rounds, summary } = getInterviewJourney(id);
  const p = interviewPayloadFrom(payload);
  const next = rounds.map((r) => {
    if (r.id !== roundId) return r;
    let matched = false;
    const items = (r.items ?? []).map((it) => {
      if (it.id !== itemId || it.type !== "interview") return it;
      matched = true;
      const prev = it.payload ?? {};
      const history = keepHistory && prev.dateKey
        ? [...(prev.history ?? []), { dateKey: prev.dateKey, slotStart: prev.slotStart, durationMin: prev.durationMin, timezone: prev.timezone, at: nowIso() }]
        : (prev.history ?? []);
      return { ...it, status: "rescheduled", dueDate: p.dateKey ?? it.dueDate, payload: { ...prev, ...p, history } };
    });
    if (!matched) items.push(newInterviewItem(r.name, p));
    return { ...r, items };
  });
  return persistInterviewRounds(id, next, summary);
}

// Create the next round (after an Advance) with its interview already scheduled.
export function interviewCreateNextRound(id, name, payload) {
  const { rounds, summary } = getInterviewJourney(id);
  const roundName = name?.trim() || `Round ${rounds.length + 1}`;
  const round = { id: genId("rnd"), order: rounds.length + 1, name: roundName, createdAt: nowIso(), items: [newInterviewItem(roundName, interviewPayloadFrom(payload))] };
  return persistInterviewRounds(id, [...rounds, round], summary);
}

// Ensure a round exists at a given slot index (fills any gaps with empty rounds) and return its id.
// Lets the recruiter schedule/fill rounds in any order — no locking to a strict sequence.
export function interviewEnsureRoundAt(id, index) {
  const { rounds, summary } = getInterviewJourney(id);
  if (index < rounds.length) return rounds[index].id;
  const next = [...rounds];
  for (let i = rounds.length; i <= index; i += 1) {
    next.push({ id: genId("rnd"), order: i + 1, name: `Round ${i + 1}`, createdAt: nowIso(), items: [] });
  }
  persistInterviewRounds(id, next, summary);
  return next[index].id;
}

// Record interviewer feedback for a round (one per round for v1 — re-recording replaces it).
export function interviewRecordFeedback(id, roundId, { submittedBy = null, recommendation, notes = "" } = {}) {
  const { rounds, summary } = getInterviewJourney(id);
  const next = rounds.map((r) => {
    if (r.id !== roundId) return r;
    const items = (r.items ?? []).filter((it) => it.type !== "feedback");
    items.push({ id: genId("itm"), type: "feedback", title: "Feedback", assigneeId: submittedBy, dueDate: null, flagged: false, links: [], status: "submitted", createdAt: nowIso(), payload: { recommendation, notes, byInterviewerId: submittedBy } });
    return { ...r, items };
  });
  return persistInterviewRounds(id, next, summary);
}

// Record a single decision for a round (one per round — re-deciding replaces it). Drives roundOutcome + the lifecycle.
export function interviewRecordDecision(id, roundId, outcome, note = "") {
  const { rounds, summary } = getInterviewJourney(id);
  const next = rounds.map((r) => {
    if (r.id !== roundId) return r;
    const items = (r.items ?? []).filter((it) => it.type !== "decision");
    items.push({ id: genId("itm"), type: "decision", title: "Decision", assigneeId: null, dueDate: null, flagged: false, links: [], status: null, createdAt: nowIso(), payload: { outcome, note } });
    return { ...r, items };
  });
  return persistInterviewRounds(id, next, summary);
}
// Append a recruiter note (job-specific) to the application.
export function addApplicationNote(id, text, actorId = null) {
  const app = getApplication(id);
  if (!app) return null;
  const note = { id: genId("note"), text, at: nowIso(), editedAt: null, actorId };
  return updateApplication(id, { notes: [...(app.notes ?? []), note] });
}
// Edit a note's text (records editedAt; keeps the original `at`).
export function updateApplicationNote(id, noteId, text) {
  const app = getApplication(id);
  if (!app) return null;
  const notes = (app.notes ?? []).map((note) => (note.id === noteId ? { ...note, text, editedAt: nowIso() } : note));
  return updateApplication(id, { notes });
}
// Remove a note.
export function deleteApplicationNote(id, noteId) {
  const app = getApplication(id);
  if (!app) return null;
  return updateApplication(id, { notes: (app.notes ?? []).filter((note) => note.id !== noteId) });
}
/* - - - - - - - - - - - - - - - - */
