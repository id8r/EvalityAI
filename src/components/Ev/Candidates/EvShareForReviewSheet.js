/* src/components/Ev/Candidates/EvShareForReviewSheet.js | Share candidate(s) for review — single + bulk | Sree | 2026-07-01 */

"use client";

import { useState } from "react";
import { FileText, Users, X } from "lucide-react";

import { FxAiButton, FxButton, FxIconToggle, FxInput, FxRadioGroupField, FxRichTextEditor } from "@/components/FxUI/Forms";
import { FxSheet } from "@/components/FxUI/Overlays/FxSheet";
import { FxConfirmDialog } from "@/components/FxUI/Overlays/FxConfirmDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { EvCandidatePreview } from "@/components/Ev/Candidates/EvCandidatePreview";
import { useScreeningExpanded } from "@/lib/useScreeningExpanded";
import { cn, scoreToneTextClass } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Share for Review — one sheet for the single (Actions → Share) and bulk (selection → Share) paths; the count is
  the only difference (title "Share Candidate/Candidates for Review", footer "Share"/"Share All"). Panes:
  candidate list (bulk only) · résumé preview · the share form (recipients, what-to-share, email). View controls
  follow the shared model: 👥 list · 📄 résumé · ⤢ width. Read-only preview of who's being shared; Share = mark
  each candidate shared (bumps the JW Share badge).
*/
const FIELD_LABEL = "text-[13px] font-medium text-[var(--fx-text-muted)]";
const SHARE_OPTIONS = [
  { value: "cv_only", label: "CV only", description: "Share candidate resumes and names only." },
  { value: "cv_details", label: "CV + selected details", description: "Choose which contact and screening details the hiring manager can see." },
];
const DETAIL_TOGGLES = [
  { key: "phone", label: "Include phone number" },
  { key: "email", label: "Include email address" },
  { key: "ctc", label: "Include CTC details" },
  { key: "summary", label: "Include screening summary" },
];

// Natural-sounding share note as HTML (bold on names/role); bulk lists every candidate so the reviewer sees who's in.
function buildShareEmailHtml(names, roleTitle) {
  const role = roleTitle?.trim() || "the role";
  const single = names.length === 1;
  const lead = single
    ? `I'd like to share <strong>${names[0]}</strong> for your review for the <strong>${role}</strong> position. Their résumé is attached, along with the details noted below.`
    : `I'd like to share the following <strong>${names.length} candidates</strong> for your review for the <strong>${role}</strong> position. Their résumés are attached, along with the details noted below.`;
  const list = single ? "" : `<ul>${names.map((name) => `<li><strong>${name}</strong></li>`).join("")}</ul>`;
  return [
    `<p>Hi,</p>`,
    `<p>${lead}</p>`,
    list,
    `<p>Please take a look and share your feedback at your convenience.</p>`,
    `<p>Best regards,</p>`,
  ].filter(Boolean).join("");
}

function ShareCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 py-2 transition-colors hover:bg-[var(--fx-surface-hover)] has-[[data-state=checked]]:border-[var(--fx-primary)] has-[[data-state=checked]]:bg-[var(--fx-surface-selected)]">
      <Checkbox checked={checked} onCheckedChange={(value) => onChange(Boolean(value))} />
      <span className="text-[14px] leading-[18px] text-[var(--fx-text)]">{label}</span>
    </label>
  );
}

function EvShareForReviewSheet({ open, onOpenChange, rows = [], job, onShare }) {
  const roleTitle = job?.core?.title ?? "this role";
  const [expanded, setExpanded] = useScreeningExpanded(); // ⤢ sheet width (shared, persisted)
  const [showList, setShowList] = useState(true);
  const [showResume, setShowResume] = useState(true);
  const [hiddenIds, setHiddenIds] = useState([]);
  const [activeId, setActiveId] = useState(rows[0]?.id ?? null);
  const [recipients, setRecipients] = useState("");
  const [shareMode, setShareMode] = useState("cv_details");
  const [include, setInclude] = useState({ phone: false, email: false, ctc: false, summary: true });
  const [emailBody, setEmailBody] = useState("");
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const visible = rows.filter((row) => !hiddenIds.includes(row.id));
  const active = visible.find((row) => row.id === activeId) ?? visible[0] ?? null;
  const bulk = visible.length > 1;
  const listPane = bulk && showList;

  const title = bulk ? "Share Candidates for Review" : "Share Candidate for Review";
  const shareLabel = bulk ? "Share All" : "Share";
  const emailPlaceholder = bulk
    ? `Sharing ${visible.length} candidates for review.`
    : `Sharing ${visible[0]?.candidateName ?? "candidate"} for review.`;
  const canShare = Boolean(visible.length && recipients.trim());
  const dirty = Boolean(recipients.trim() || emailBody.trim());

  function remove(id) {
    setHiddenIds((current) => (current.includes(id) ? current : [...current, id]));
    if (id === active?.id) setActiveId(visible.find((row) => row.id !== id)?.id ?? null);
  }
  function generate() {
    setEmailBody(buildShareEmailHtml(visible.map((row) => row.candidateName), roleTitle));
  }
  function handleOpenChange(next) {
    if (!next && dirty) {
      setConfirmDiscard(true);
      return;
    }
    onOpenChange?.(next);
  }
  function handleShare() {
    onShare?.(visible, { recipients, shareMode, include: shareMode === "cv_details" ? include : {}, emailBody });
  }

  const headerActions = (
    <>
      {bulk ? <FxIconToggle icon={Users} pressed={showList} onClick={() => setShowList((v) => !v)} label={showList ? "Hide candidates" : "Show candidates"} /> : null}
      <FxIconToggle icon={FileText} pressed={showResume} onClick={() => setShowResume((v) => !v)} label={showResume ? "Hide résumé" : "Show résumé"} />
    </>
  );

  return (
    <FxSheet open={open} onOpenChange={handleOpenChange} side="right" size="xl" expandable expanded={expanded} onExpandedChange={setExpanded}>
      <FxSheet.Header title={title} actions={headerActions} />
      {active ? (
        <FxSheet.Panes>
          {listPane ? (
            <FxSheet.Pane role="secondary" width="260px" className="p-0">
              <div className="flex h-full min-h-0 flex-col gap-2 overflow-y-auto p-3">
                {visible.map((row) => {
                  const isActive = row.id === active.id;
                  return (
                    <div key={row.id} className={cn("flex items-start justify-between gap-2 rounded-[10px] border px-3 py-2.5 transition-colors", isActive ? "border-[var(--fx-primary)] bg-[var(--fx-surface)] shadow-sm" : "border-transparent hover:bg-[var(--fx-surface)]")}>
                      <button type="button" onClick={() => setActiveId(row.id)} className="min-w-0 flex-1 text-left">
                        <p className="truncate text-[14px] font-medium leading-[18px] text-[var(--fx-text)]">{row.candidateName}</p>
                        <p className={cn("text-[13px] font-semibold leading-[18px]", scoreToneTextClass(row.matchScore))}>{row.matchScore == null ? "—" : `${row.matchScore}%`}</p>
                      </button>
                      <button type="button" aria-label={`Remove ${row.candidateName}`} onClick={() => remove(row.id)} className="inline-flex size-5 shrink-0 items-center justify-center rounded-[4px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-danger)]">
                        <X className="size-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </FxSheet.Pane>
          ) : null}

          {showResume ? (
            <FxSheet.Pane role="primary" className="p-0">
              <div className="flex h-full min-h-0 flex-col p-4">
                <EvCandidatePreview key={active.id} candidate={active.candidate} fill resumeOnly />
              </div>
            </FxSheet.Pane>
          ) : null}

          {/* Share form — shared across all selected candidates. */}
          <FxSheet.Pane role={showResume ? "secondary" : "primary"} width={showResume ? "42%" : undefined} className="p-0">
            <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto px-4 pt-4 pb-8">
              <div className="flex-none space-y-1.5">
                <label htmlFor="share-to" className={FIELD_LABEL}>To</label>
                <FxInput id="share-to" value={recipients} onChange={(event) => setRecipients(event.target.value)} clearable={false} placeholder="reviewer@company.com, hiring.manager@company.com" />
              </div>

              <div className="flex-none space-y-2.5 rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] px-3.5 py-3">
                <p className="text-[14px] font-medium text-[var(--fx-text)]">What should be shared?</p>
                <FxRadioGroupField value={shareMode} onValueChange={setShareMode} options={SHARE_OPTIONS} />
                {shareMode === "cv_details" ? (
                  <div className="grid grid-cols-2 gap-2">
                    {DETAIL_TOGGLES.map((toggle) => (
                      <ShareCheckbox key={toggle.key} label={toggle.label} checked={include[toggle.key]} onChange={(value) => setInclude((prev) => ({ ...prev, [toggle.key]: value }))} />
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Composer fills the remaining height (bottom-32px on enter) and can be dragged taller via the corner grip. */}
              <div className="flex min-h-0 flex-1 flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="share-email" className={FIELD_LABEL}>Email</label>
                  <FxAiButton onClick={generate}>Generate Email</FxAiButton>
                </div>
                <FxRichTextEditor value={emailBody} onChange={setEmailBody} placeholder={emailPlaceholder} minHeight={180} fill resizable />
              </div>
            </div>
          </FxSheet.Pane>
        </FxSheet.Panes>
      ) : (
        <FxSheet.Body>
          <div className="flex h-full items-center justify-center text-[14px] text-[var(--fx-text-muted)]">No candidates to share.</div>
        </FxSheet.Body>
      )}

      <FxSheet.Footer
        footerStart={<FxButton variant="outline" size="md" onClick={() => handleOpenChange(false)}>Cancel</FxButton>}
      >
        <FxButton variant="primary" size="md" className="min-w-[120px]" disabled={!canShare} onClick={handleShare}>{shareLabel}</FxButton>
      </FxSheet.Footer>

      <FxConfirmDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        title="Discard this share?"
        description="Your recipients and message haven't been sent. Closing now will discard them."
        confirmLabel="Discard"
        tone="danger"
        onConfirm={() => { setConfirmDiscard(false); onOpenChange?.(false); }}
      />
    </FxSheet>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvShareForReviewSheet };
/* - - - - - - - - - - - - - - - - */
