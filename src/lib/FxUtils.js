/* src/lib/FxUtils.js | Project utility exports | Sree | 2026-06-25 */

export { cn } from "@/lib/utils";

export function FxStatusMeta(job) {
  const isDraft = job?.core?.status === "draft";
  const missingEvaluationContext = job?.core?.status === "published" && !String(job?.evaluationConfig?.evaluationContext ?? "").trim();
  if (isDraft) {
    return { label: "Draft", tone: "warning", toneClassName: "bg-[var(--fx-warning)]", missingEvaluationContext: false };
  }
  if (missingEvaluationContext) {
    return { label: "Published\nEvaluation context missing", tone: "danger", toneClassName: "bg-[var(--fx-danger)]", missingEvaluationContext: true };
  }
  return { label: "Published", tone: "success", toneClassName: "bg-[var(--fx-success)]", missingEvaluationContext: false };
}
/* - - - - - - - - - - - - - - - - */

// Score → semantic tone: green ≥80, orange ≥60, red below. Accepts numbers or "64%" strings;
// non-numeric returns `fallback` (e.g. "primary" for an unscored pill, "neutral" for plain text).
export function scoreTone(value, fallback = "neutral") {
  const n = parseFloat(String(value ?? ""));
  if (!Number.isFinite(n)) return fallback;
  if (n >= 80) return "success";
  if (n >= 60) return "warning";
  return "danger";
}

// Clamp a numeric percentage into 0–100 (non-numeric → 0).
export function clampPct(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

// "64%" / "66.67%" — passes strings through, trims trailing zeros (≤2 decimals), "—" when not numeric.
export function formatPct(value) {
  if (typeof value === "string") return value;
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return `${Number(Number(value).toFixed(2))}%`;
}
/* - - - - - - - - - - - - - - - - */
