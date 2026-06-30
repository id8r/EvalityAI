/* src/lib/EvScreening.js | Screening question source + demo synthesis (shared by job-create + manual pre-screen) | Sree | 2026-06-30 */

import { APP_SHORT_NAME } from "@/lib/FxConstants";

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

// Plain-text resume fallback when a candidate has no PDF on file (demo parity with the old product).
export function buildResumeText(candidate) {
  if (!candidate) return "";
  const years = candidate.totalExperienceYears ?? candidate.experience ?? null;
  const expLabel = years == null ? "experience" : `${years}+ years`;
  const role = candidate.currentTitle || "this role";
  const contact = [candidate.email, candidate.phone].filter(Boolean).join(" · ");
  const skills = candidate.resume?.extracted?.skills?.length ? candidate.resume.extracted.skills.join(" · ") : role;
  return [
    candidate.name ?? "Candidate",
    role,
    candidate.location || "Location not captured",
    contact,
    "",
    "Professional Summary",
    `${candidate.name ?? "This candidate"} brings ${expLabel} and a background aligned to ${role}.`,
    "",
    "Experience",
    `Current role: ${role}`,
    `Focus areas: ${role} delivery, stakeholder coordination, and execution.`,
    "",
    "Skills",
    skills,
    "",
    "Education",
    "Bachelor's degree or equivalent",
  ].join("\n");
}
