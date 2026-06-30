/* src/lib/EvScreening.js | Screening question source + demo synthesis (shared by job-create + manual pre-screen) | Sree | 2026-06-30 */

import { Mail, Sparkles, Users } from "lucide-react";

import { APP_SHORT_NAME } from "@/lib/FxConstants";
import { formatMoney } from "@/lib/EvFormat";
/* - - - - - - - - - - - - - - - - */

// Single source of truth for how a screening method is shown (icon + label) — reused everywhere a "Manual /
// Email / AI Call" appears (Fit Score pill, Pre-Screen Result, etc.). Manual uses the people icon (matches the
// Unscreened "Manual Pre-Screen" action). `ai` is display-only; the seed uses "ai_call".
export const SCREENING_TYPES = {
  manual: { icon: Users, label: "Manual Call" },
  email: { icon: Mail, label: "Email Screened" },
  ai: { icon: Sparkles, label: "AI Call" },
};
export function screeningTypeMeta(mode) {
  if (mode === "ai" || mode === "ai_call") return SCREENING_TYPES.ai;
  return SCREENING_TYPES[mode] ?? null;
}

// Single source of truth for the STANDARD screening questions. Job creation seeds/edits from these; the Manual
// Pre-Screening sheet shows the same set read-only — so the two never drift.
export const DEFAULT_SCREENING_QUESTIONS = [
  { id: "availability", label: "Availability", question: "We must fill this role immediately, How soon can you join us?", note: "Capture near-term readiness quickly." },
  { id: "notice-period", label: "Notice Period", question: "What is your current notice period?", note: "Useful for prioritizing candidates in motion." },
  { id: "current-salary", label: "Current Salary", question: "What is your Current Annual Salary in INR?", note: "Use only when compensation alignment matters." },
  { id: "salary-expectation", label: "Salary Expectation", question: "What are your Salary Expectations?", note: "Keep this focused on the target range for the role." },
  { id: "job-location", label: "Job Location", question: "The Job Role is on-site based out of the selected location. Are you comfortable commuting to the location?", note: "Useful when commute or work setup fit matters." },
  { id: "current-company", label: "Current Company", question: "What is the name of the Current Company you are working with?", note: "Helpful when the current employer context matters." },
];

// Demo AI-tailored interview questions (no backend) — role-aware so the AI tab looks generated, not hardcoded.
// Kept on-demand (the AI tab is secondary) since real generation would cost.
export function buildAiScreeningQuestions(roleTitle) {
  const role = roleTitle?.trim() || "this role";
  return [
    { id: "ai-relevance", question: `Walk me through your experience most relevant to ${role}.`, note: "Listen for depth of ownership, tools used, and how closely the work matches the target role." },
    { id: "ai-scope", question: "What kind of projects have you handled end-to-end in your current or recent role?", note: "Look for practical scope, collaboration signals, and delivery responsibility." },
    { id: "ai-intent", question: "What would make you interested in exploring this opportunity further?", note: "Use this to gauge role fit, motivation, and whether the opportunity is aligned to candidate intent." },
  ];
}

function slugify(value) {
  return String(value ?? "candidate").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "candidate";
}

// Demo email pre-screening draft as RICH HTML (no backend) — seeds the "Generate Using AI" action with realistic
// copy: bold emphasis + a (non-functional) screening-form link the candidate would open to respond.
export function buildEmailHtml(candidate, roleTitle) {
  const firstName = candidate?.name?.trim()?.split(/\s+/)[0] || "there";
  const role = roleTitle?.trim() || "the role";
  const formUrl = `https://apply.${APP_SHORT_NAME.toLowerCase()}.ai/screening/${slugify(candidate?.name)}`;
  return [
    `<p>Hi <strong>${firstName}</strong>,</p>`,
    `<p>Thanks for your interest in the <strong>${role}</strong> position at <strong>${APP_SHORT_NAME}</strong>. We were impressed by your profile and would love to learn a little more about your fit and availability.</p>`,
    `<p>Please take <strong>2–3 minutes</strong> to complete a short pre-screening form covering your notice period, availability, and compensation expectations:</p>`,
    `<p><a href="${formUrl}">Open your pre-screening form →</a></p>`,
    `<p>This link is unique to you and expires in <strong>5 days</strong>. If anything is unclear, just reply to this email and we'll help.</p>`,
    `<p>Best regards,<br>The <strong>${APP_SHORT_NAME}</strong> Hiring Team</p>`,
  ].join("");
}

// ---- Demo AI-call RESULT synthesis (read-time, deterministic from the row) ----
// No AI-call workflow exists; for seeded `ai_call` apps we synthesize a believable result so the AI tabs aren't
// empty. Everything below is derived from the row's fit score / candidate fields — stable, no randomness.
const round1 = (n) => Math.round(n * 10) / 10;

export function buildAiCallAnalysis(row) {
  const base = row?.matchScore != null ? Math.max(2.6, Math.min(4.8, row.matchScore / 20 + 0.3)) : 4.0;
  const dimensions = [
    { key: "communication", label: "Communication", delta: 0.0, justification: "Candidate communicated clearly, stayed concise, and answered screening prompts without hesitation." },
    { key: "confidence", label: "Confidence", delta: -0.2, justification: "Candidate appeared comfortable discussing prior work, ownership, and decision-making in a recruiter call setting." },
    { key: "domain", label: "Domain Knowledge", delta: 0.2, justification: "Candidate demonstrated a strong working understanding of the role's technology stack and day-to-day workflows." },
    { key: "resumeReality", label: "Resume to Reality", delta: -0.1, justification: "Screening responses were largely consistent with the resume, with no major credibility gaps surfaced during the call." },
  ].map((dim) => ({ ...dim, score: round1(Math.max(1, Math.min(5, base + dim.delta))) }));
  const overall = round1(dimensions.reduce((sum, dim) => sum + dim.score, 0) / dimensions.length);
  return {
    dimensions,
    summary: { score: overall, text: "Strong candidate for further evaluation. Signals across communication, confidence, and domain understanding were consistently positive." },
  };
}

export function buildAiTranscript(row, job) {
  const name = row?.candidateName ?? "the candidate";
  const role = job?.core?.title ?? "this role";
  const days = row?.availabilityDays ?? row?.app?.qualification?.availability?.days ?? null;
  const current = row?.currentSalary?.amount ? formatMoney(row.currentSalary.amount, row.currentSalary.currency) : null;
  const expected = row?.expectedSalary?.amount ? formatMoney(row.expectedSalary.amount, row.expectedSalary.currency) : null;
  const comp = current || expected ? `Currently ${current ?? "—"}, looking for ${expected ?? "—"}.` : null;
  return [
    { q: `Hello, this is Shreya, an AI recruiter from ${APP_SHORT_NAME}. Am I speaking with ${name}?`, a: "Yes, where are you calling from?" },
    { q: `We're hiring for ${role}. Is this a good time to speak?`, a: "Yes, this works for me." },
    { q: `Can you describe a recent example of work that best matches the ${role} requirements?`, a: null },
    { q: "What is your current notice period?", a: days != null ? `${days} days` : "Around a month" },
    { q: "What is your current annual compensation and expected compensation for your next role?", a: comp },
    { q: "Are you comfortable with the role's location and work setup?", a: "Yes, that works for me." },
  ];
}

export function buildVoiceRecording() {
  return {
    title: "AI Screening Call",
    subtitle: "Recorded screening conversation",
    duration: "02:46",
    markers: [
      { label: "Q1", at: "00:08" },
      { label: "Q2", at: "00:24" },
      { label: "Q3", at: "00:52" },
      { label: "Q4", at: "01:20" },
      { label: "Q5", at: "01:48" },
      { label: "Q6", at: "02:20" },
    ],
  };
}
