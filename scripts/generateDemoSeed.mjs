/* scripts/generateDemoSeed.mjs | Regenerates canonical demo seed (candidates + applications) | Sree | 2026-06-29
   Run: node scripts/generateDemoSeed.mjs
   - Candidate = reusable, mostly-static profile (NO workflow state).
   - Application = all job-specific workflow state (stage, screening sub-status, JD match, trust, expected CTC, availability, applied date).
   - Deterministic (seeded PRNG) so re-runs produce stable output. Tweak the CONFIG block to reshape the demo. */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "public", "data");

/* ============================ CONFIG (tweak here) ============================ */
const NOW = new Date("2026-06-29T09:00:00Z").getTime();
const DAY = 86400000;

// Applications created per job, per bucket. Sum must be <= candidate pool size (unique candidate per app within a job).
const DIST = { unscreened: 5, pre_screened: 3, shortlisted: 2, interviewing: 2, offered: 1, joined: 1, dropped: 1, rejected: 2 };
// Unscreened screening sub-states cycled across the unscreened apps of each job.
const UNSCREENED_SUBSTATES = ["pending", "in_queue", "in_progress", "processing", "rescheduled", "failed"];
// Per job, how many unscreened apps get a "recent" applied date (drives the blue "new" row highlight). <= NEW within 2 days.
const RECENT_PER_JOB = 2;
// JD match-score band per bucket (realistic: later stages skew higher, rejected lower).
const SCORE_BANDS = {
  unscreened: [45, 92], pre_screened: [60, 95], shortlisted: [70, 96], interviewing: [72, 97],
  offered: [78, 97], joined: [80, 98], dropped: [50, 82], rejected: [34, 70],
};
const AVAILABILITY_DAYS = [0, 15, 30, 45, 60, 90];
const SOURCES = ["upload", "manual", "referral", "portal", "linkedin"];
/* ============================================================================ */

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const ri = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min;
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
function shuffled(rng, arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const iso = (ms) => new Date(ms).toISOString();
const round = (n, step = 50000) => Math.round(n / step) * step;

/* ---------- candidates: keep the original résumé-backed ones, append a static pool ----------
   Idempotent: rebuild from the original seed candidates only (they carry a real `resume`); the
   generated pool below is résumé-less, so re-running never double-appends. */
const existingCandidates = JSON.parse(readFileSync(join(DATA, "EvCandidates.json"), "utf8")).filter((c) => c.resume);

const NEW_CANDIDATE_SEEDS = [
  ["Karthik Subramanian", "Backend Engineer", "Flipkart", 7.4, 3200000, "Bengaluru"],
  ["Ananya Ghosh", "Product Manager", "Swiggy", 8.1, 3800000, "Bengaluru"],
  ["Rohan Deshpande", "QA Automation Engineer", "PhonePe", 5.6, 1900000, "Pune"],
  ["Sneha Reddy", "DevOps Engineer", "Zerodha", 6.3, 2700000, "Hyderabad"],
  ["Aman Gupta", "Data Engineer", "Myntra", 7.0, 3000000, "Bengaluru"],
  ["Divya Krishnan", "Machine Learning Engineer", "CRED", 5.9, 3100000, "Bengaluru"],
  ["Vikram Singh", "Engineering Manager", "Freshworks", 11.2, 5200000, "Chennai"],
  ["Pooja Bhatia", "Android Developer", "Dream11", 4.8, 2000000, "Mumbai"],
  ["Siddharth Jain", "iOS Developer", "Groww", 5.2, 2200000, "Bengaluru"],
  ["Neha Agarwal", "Full Stack Developer", "Razorpay", 6.1, 2500000, "Bengaluru"],
  ["Manish Patel", "Site Reliability Engineer", "Postman", 8.6, 3600000, "Bengaluru"],
  ["Ritika Sharma", "Data Scientist", "Meesho", 6.7, 2900000, "Bengaluru"],
  ["Harish Kumar", "Business Analyst", "Zoho", 4.3, 1500000, "Chennai"],
  ["Tanvi Mehta", "Product Designer", "Cult.fit", 7.8, 3300000, "Bengaluru"],
  ["Aakash Nair", "UI/UX Designer", "Unacademy", 4.1, 1600000, "Bengaluru"],
  ["Shreya Pillai", "Technical Program Manager", "Atlassian", 9.5, 4600000, "Bengaluru"],
  ["Gaurav Malhotra", "Cloud Architect", "Nutanix", 12.4, 5800000, "Pune"],
  ["Ishita Banerjee", "Cybersecurity Analyst", "Druva", 5.5, 2400000, "Pune"],
  ["Deepak Chauhan", "Database Administrator", "Oracle", 9.1, 3400000, "Hyderabad"],
  ["Lakshmi Menon", "Solutions Architect", "MongoDB", 10.7, 5400000, "Bengaluru"],
  ["Farhan Sheikh", "Talent Acquisition Specialist", "Darwinbox", 5.0, 1400000, "Hyderabad"],
  ["Megha Joshi", "Customer Success Manager", "Chargebee", 6.4, 2300000, "Chennai"],
  ["Aditya Verma", "Finance Analyst", "Razorpay", 4.6, 1700000, "Bengaluru"],
  ["Kavya Rao", "Senior Frontend Engineer", "Notion", 6.8, 3000000, "Bengaluru"],
];

const newCandidates = NEW_CANDIDATE_SEEDS.map((seed, i) => {
  const [name, title, company, exp, salary, location] = seed;
  const n = existingCandidates.length + i + 1;
  const id = `cand_${String(n).padStart(3, "0")}`;
  const slug = name.toLowerCase().replace(/[^a-z]+/g, ".");
  return {
    id,
    name,
    email: `${slug}@example.com`,
    phone: `+91 98765${String(2000 + n).padStart(5, "0")}`,
    currentCompany: company,
    currentTitle: title,
    totalExperienceYears: exp,
    currentSalary: { amount: salary, currency: "INR" },
    location,
    resume: null, // résumé PDFs only exist for the original 8; viewer degrades gracefully otherwise
    source: "upload",
    archivedAt: null,
    createdById: "usr_001",
    createdAt: iso(NOW - ri(mulberry32(n * 7 + 3), 30, 180) * DAY),
    updatedAt: iso(NOW),
  };
});

const candidates = [...existingCandidates, ...newCandidates];
const candidateIds = candidates.map((c) => c.id);

/* ---------- applications: one bucket-balanced spread per job ---------- */
const jobsRaw = JSON.parse(readFileSync(join(DATA, "EvJobs.json"), "utf8"));
const jobs = (Array.isArray(jobsRaw) ? jobsRaw : jobsRaw.jobs ?? jobsRaw.data ?? []).map((j) => ({
  id: j.core?.id ?? j.id,
  currency: j.roleSpec?.salaryRange?.currency ?? "INR",
}));

const STAGE_FOR_BUCKET = {
  unscreened: "unscreened", pre_screened: "pre_screened", shortlisted: "shortlisted", interviewing: "interviewing",
  offered: "offered", joined: "joined", dropped: "rejected", rejected: "rejected",
};
const CHAIN = {
  unscreened: ["unscreened"],
  pre_screened: ["unscreened", "pre_screened"],
  shortlisted: ["unscreened", "pre_screened", "shortlisted"],
  interviewing: ["unscreened", "pre_screened", "shortlisted", "interviewing"],
  offered: ["unscreened", "pre_screened", "shortlisted", "interviewing", "offered"],
  joined: ["unscreened", "pre_screened", "shortlisted", "interviewing", "offered", "joined"],
  rejected: ["unscreened", "pre_screened", "rejected"],
  dropped: ["unscreened", "pre_screened", "shortlisted", "rejected"],
};
const trustFor = (rng, bucket) => {
  if (["shortlisted", "interviewing", "offered", "joined"].includes(bucket)) return pick(rng, ["high", "high", "medium"]);
  if (["rejected", "dropped"].includes(bucket)) return pick(rng, ["low", "medium"]);
  return pick(rng, ["high", "medium", "medium", "low"]);
};
const REJECT_REASONS = ["Compensation mismatch", "Notice period too long", "Insufficient depth in core stack", "Role on hold by client", "Better aligned candidate selected"];
const INTERVIEWERS = ["Rejith", "Anita Desai", "Vikram Rao", "Sana Khan"];
const RECS = ["Proceed", "Strong Yes", "On the fence", "Hold"];

const applications = [];
let appSeq = 0;

jobs.forEach((job, jobIndex) => {
  const rng = mulberry32(1000 + jobIndex * 97);
  const pool = shuffled(rng, candidateIds);
  let cursor = 0;
  let unscreenedCount = 0;

  for (const [bucket, count] of Object.entries(DIST)) {
    for (let k = 0; k < count; k += 1) {
      const candidateId = pool[cursor % pool.length];
      cursor += 1;
      appSeq += 1;
      const id = `app_${String(appSeq).padStart(4, "0")}`;
      const stage = STAGE_FOR_BUCKET[bucket];

      // applied date: a few unscreened are recent (drive the "new" highlight); others spread over ~90 days.
      let appliedMs;
      if (bucket === "unscreened" && unscreenedCount < RECENT_PER_JOB) appliedMs = NOW - ri(rng, 0, 2) * DAY;
      else appliedMs = NOW - ri(rng, 3, 90) * DAY;
      if (bucket === "unscreened") unscreenedCount += 1;

      const [lo, hi] = SCORE_BANDS[bucket];
      const screeningMode = pick(rng, ["email", "manual", "ai_call"]);
      // Some email-screened pre-screened candidates have no computed fit score yet — drives the "No Fit Score" filter.
      let matchScore = ri(rng, lo, hi);
      if (bucket === "pre_screened" && screeningMode === "email" && rng() < 0.5) matchScore = null;
      const cand = candidates.find((c) => c.id === candidateId);
      const expectedSalary = round((cand?.currentSalary?.amount ?? 2000000) * (1.1 + rng() * 0.3));

      // stage history spaced from applied date toward now
      const chain = CHAIN[bucket];
      const span = Math.max(1, NOW - appliedMs);
      const stageHistory = chain.map((s, i) => ({ stage: s, at: iso(appliedMs + Math.floor((span * i) / chain.length)), actorId: "usr_001" }));

      const isUnviewedFresh = bucket === "unscreened" && rng() < 0.5;
      const app = {
        id,
        candidateId,
        jobId: job.id,
        stage,
        clientStatus: bucket === "dropped" ? "Candidate Dropped Off" : "",
        source: pick(rng, SOURCES),
        appliedAt: iso(appliedMs),
        viewedAt: isUnviewedFresh ? null : iso(appliedMs + DAY),
        createdAt: iso(appliedMs),
        updatedAt: iso(NOW),
        stageHistory,
        qualification: {
          matchScore,
          trustScore: trustFor(rng, bucket),
          expectedSalary: { amount: expectedSalary, currency: job.currency },
          availability: { mode: "days", days: pick(rng, AVAILABILITY_DAYS), commuteComfortable: rng() < 0.7 },
        },
        screening: {
          status: bucket === "unscreened" ? UNSCREENED_SUBSTATES[k % UNSCREENED_SUBSTATES.length] : "passed",
          mode: screeningMode,
          completedAt: bucket === "unscreened" ? null : iso(appliedMs + 2 * DAY),
        },
        interview:
          bucket === "interviewing"
            ? {
                status: "scheduled",
                scheduleDetails: `${pick(rng, ["Mon", "Tue", "Wed", "Thu", "Fri"])}, ${ri(rng, 1, 28)} Jul · ${pick(rng, ["10:00 AM", "11:30 AM", "2:00 PM", "4:30 PM"])} · Google Meet`,
                interviewer: pick(rng, INTERVIEWERS),
                stage: pick(rng, ["1 / 3", "2 / 3", "Final"]),
                recommendation: pick(rng, RECS),
                feedback: "View",
                rounds: [],
                summary: "",
              }
            : { status: "not_started", rounds: [], summary: "" },
        outcome:
          bucket === "rejected" || bucket === "dropped"
            ? { rejectionReason: pick(rng, REJECT_REASONS), rejectionNote: "" }
            : { rejectionReason: null, rejectionNote: "" },
        activity: [],
        notes: [],
      };
      applications.push(app);
    }
  }
});

writeFileSync(join(DATA, "EvCandidates.json"), JSON.stringify(candidates, null, 2) + "\n");
writeFileSync(join(DATA, "EvApplications.json"), JSON.stringify(applications, null, 2) + "\n");

// summary
const byBucket = {};
for (const a of applications) {
  const b = a.stage === "rejected" ? (a.clientStatus === "Candidate Dropped Off" ? "dropped" : "rejected") : a.stage;
  byBucket[b] = (byBucket[b] ?? 0) + 1;
}
const recent = applications.filter((a) => NOW - new Date(a.appliedAt).getTime() <= 2 * DAY).length;
console.log(`candidates: ${candidates.length} (kept ${existingCandidates.length} + added ${newCandidates.length})`);
console.log(`applications: ${applications.length} across ${jobs.length} jobs`);
console.log("by bucket:", byBucket);
console.log(`recent (<=2d, drive "new" highlight): ${recent}`);
