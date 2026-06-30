/* src/lib/EvSelectors.js | Ev derived values (read-only) over EvData — never stored | Sree | 2026-06-28 */

import { getApplications, getClient, getJob, getJobs } from "@/lib/EvData";
/* - - - - - - - - - - - - - - - - */

// Enum → human labels (display only; tokens stay canonical in the data).
const EMPLOYMENT_TYPE_LABELS = { full_time: "Full-time", part_time: "Part-time", contract: "Contract", internship: "Internship", temporary: "Temporary" };
const WORKPLACE_TYPE_LABELS = { on_site: "On-site", remote: "Remote", hybrid: "Hybrid" };

export const APPLICATION_STAGES = ["unscreened", "pre_screened", "shortlisted", "interviewing", "offered", "joined", "dropped", "rejected"];
const STAGE_LABELS = {
  unscreened: "Unscreened",
  pre_screened: "Pre-Screened",
  shortlisted: "Shortlisted",
  interviewing: "Interviewing",
  offered: "Offered",
  joined: "Joined",
  dropped: "Dropped",
  rejected: "Rejected",
};

export function stageLabel(stage) {
  return STAGE_LABELS[stage] ?? stage ?? "";
}
export function employmentTypeLabel(token) {
  return EMPLOYMENT_TYPE_LABELS[token] ?? token ?? "";
}
export function workplaceTypeLabel(token) {
  return WORKPLACE_TYPE_LABELS[token] ?? token ?? "";
}
/* - - - - - - - - - - - - - - - - */

// --- Job stage counts (from Applications) ---
export function jobStageCounts(jobId) {
  const counts = Object.fromEntries(APPLICATION_STAGES.map((stage) => [stage, 0]));
  for (const app of getApplications()) {
    if (app.jobId === jobId && counts[app.stage] != null) counts[app.stage] += 1;
  }
  return counts;
}
export function jobCandidateCount(jobId) {
  return getApplications().filter((app) => app.jobId === jobId).length;
}

// --- Job client name (clientId → client.name; null = internal / my_company job) ---
export function jobClientName(job) {
  const clientId = job?.core?.clientId;
  if (!clientId) return null;
  return getClient(clientId)?.name ?? null;
}

// --- Location / experience labels (money lives in EvFormat — the single source of truth) ---
export function jobLocationLabel(roleSpec) {
  if (!roleSpec) return "—";
  if (roleSpec.workplaceType === "remote") return "Remote";
  const place = [roleSpec.locality, roleSpec.city].filter(Boolean).join(", ");
  const mode = workplaceTypeLabel(roleSpec.workplaceType);
  if (place && mode) return `${place} · ${mode}`;
  return place || mode || "—";
}
export function experienceLabel(roleSpec) {
  const from = roleSpec?.experienceFrom;
  const to = roleSpec?.experienceTo;
  if (from == null && to == null) return "—";
  if (from != null && to != null) return `${from}–${to} yrs`;
  return from != null ? `${from}+ yrs` : `${to} yrs`;
}

// Stages where the candidate is still being actively considered (i.e. "in another job's queue").
const ACTIVE_STAGES = new Set(["unscreened", "pre_screened", "shortlisted", "interviewing", "offered"]);
export function isActiveStage(stage) {
  return ACTIVE_STAGES.has(stage);
}

// --- Candidate historic jobs (their applications joined to jobs), newest first ---
export function candidateHistoricJobs(candidateId) {
  return getApplications()
    .filter((app) => app.candidateId === candidateId)
    .map((app) => {
      const job = getJob(app.jobId);
      if (!job) return null;
      return {
        applicationId: app.id,
        jobId: job.core.id,
        jobTitle: job.core.title,
        stage: app.stage,
        clientStatus: app.clientStatus,
        appliedAt: app.appliedAt ?? app.createdAt ?? null,
        updatedAt: app.updatedAt ?? null,
        active: isActiveStage(app.stage),
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.appliedAt ?? 0) - new Date(a.appliedAt ?? 0));
}

// --- Client rollups (openJobs / candidates / lastActivity) ---
export function clientRollups(clientId) {
  const jobs = getJobs().filter((job) => job.core?.clientId === clientId);
  const jobIds = new Set(jobs.map((job) => job.core.id));
  const openJobs = jobs.filter((job) => job.core.status === "published" && !job.core.archivedAt).length;
  const apps = getApplications().filter((app) => jobIds.has(app.jobId));
  const candidates = new Set(apps.map((app) => app.candidateId)).size;
  const timestamps = [...jobs.map((job) => job.core.updatedAt), ...apps.map((app) => app.updatedAt)].filter(Boolean).sort();
  return { openJobs, totalJobs: jobs.length, candidates, lastActivity: timestamps.length ? timestamps[timestamps.length - 1] : null };
}
/* - - - - - - - - - - - - - - - - */
