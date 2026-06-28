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
