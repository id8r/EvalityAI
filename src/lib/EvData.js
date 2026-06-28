/* src/lib/EvData.js | Ev domain accessors + CRUD over EvStore (no UI logic) | Sree | 2026-06-28 */

import { getCollection, setCollection } from "@/lib/EvStore";
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
// Move to a new stage and append to stageHistory.
export function setApplicationStage(id, stage, actorId = null) {
  const app = getApplication(id);
  if (!app) return null;
  const stageHistory = [...(app.stageHistory ?? []), { stage, at: nowIso(), actorId }];
  return updateApplication(id, { stage, stageHistory });
}
/* - - - - - - - - - - - - - - - - */
