/* src/components/Ev/Candidates/EvAddCandidatesSheet.js | Add / Recommend candidates to a job (one reusable sheet) | Sree | 2026-06-29 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, FileText, PanelLeftClose, PanelLeftOpen, Upload, X } from "lucide-react";

import { FxButton, FxInput } from "@/components/FxUI/Forms";
import { FxPdfViewer } from "@/components/FxUI/DataDisplay";
import { FxSheet } from "@/components/FxUI/Overlays/FxSheet";
import { FxTabs } from "@/components/FxUI/Navigation";
import { EvCandidateCard } from "@/components/Ev/Candidates/EvCandidateCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buildResumeFromUpload, formatFileSize, isPdfResume, resolveResumeUrl } from "@/lib/EvResume";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  ONE reusable sheet for both entry points (parity with the old AddCandidatesDrawer):
  - mode="recommend" → title "Recommend Candidates", opens on the Candidates tab (with an age filter).
  - mode="add"       → title "Add Candidates", opens on the Upload tab.
  After opening, the Candidates/Upload tabs switch freely. Candidates tab = pick from the pool with a resume
  preview pane (collapsible); Upload tab = drop-zone placeholder. onPick adds the candidate to the job.
*/
const AGE_FILTERS = [
  { key: "15_days", label: "Last 15 days", days: 15 },
  { key: "30_days", label: "Last 30 days", days: 30 },
  { key: "2_months", label: "Last 2 months", days: 60 },
  { key: "3_months", label: "Last 3 months", days: 90 },
];

function ageInDays(value) {
  const ts = new Date(value).getTime();
  if (Number.isNaN(ts)) return null;
  return Math.floor(Math.max(0, Date.now() - ts) / 86400000);
}

function EvAddCandidatesSheet({ open, onOpenChange, mode = "add", job, candidates = [], onPick, onUpload }) {
  const fileInputRef = useRef(null);
  const isRecommend = mode === "recommend";
  const title = isRecommend ? "Recommend Candidates" : "Add Candidates";

  const [activeTab, setActiveTab] = useState(isRecommend ? "candidates" : "upload");
  const [searchTerm, setSearchTerm] = useState("");
  const [ageFilter, setAgeFilter] = useState("30_days");
  const [selectedId, setSelectedId] = useState(null);
  const [hiddenIds, setHiddenIds] = useState([]);
  const [showListPane, setShowListPane] = useState(true);
  const [previewTab, setPreviewTab] = useState("resume"); // résumé first — Background may run costly AI generation
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null); // session-only blob (never persisted; revoked on unmount)
  // State resets per open via a `key` remount from the parent (no reset effect needed).

  // Revoke the previous/last session blob URL when it changes or the sheet unmounts.
  useEffect(() => () => uploadedUrl && URL.revokeObjectURL(uploadedUrl), [uploadedUrl]);

  const ageFiltered = useMemo(() => {
    if (!isRecommend) return candidates;
    const limit = AGE_FILTERS.find((item) => item.key === ageFilter)?.days ?? 30;
    return candidates.filter((candidate) => {
      const days = ageInDays(candidate.createdAt);
      return days != null && days <= limit;
    });
  }, [candidates, isRecommend, ageFilter]);

  const searchFiltered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return ageFiltered;
    return ageFiltered.filter((candidate) =>
      [candidate.name, candidate.email, candidate.currentTitle, candidate.currentCompany]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [ageFiltered, searchTerm]);

  const visible = useMemo(() => searchFiltered.filter((candidate) => !hiddenIds.includes(candidate.id)), [searchFiltered, hiddenIds]);
  // selected always resolves to a valid row (falls back to the first), so no selection-sync effect is needed.
  const selected = visible.find((candidate) => candidate.id === selectedId) ?? visible[0] ?? null;
  const selectedIndex = visible.findIndex((candidate) => candidate.id === selected?.id);
  const hasPrev = visible.length > 1 && selectedIndex > 0;
  const hasNext = visible.length > 1 && selectedIndex >= 0 && selectedIndex < visible.length - 1;

  function hide(candidateId) {
    setHiddenIds((current) => (current.includes(candidateId) ? current : [...current, candidateId]));
  }

  function pick(candidate) {
    if (!candidate) return;
    onPick?.(candidate);
    hide(candidate.id);
  }

  function handleFiles(fileList) {
    const file = fileList?.[0];
    if (!file) return;
    // Session-only preview: blob URL stays in memory; only metadata would be persisted (buildResumeFromUpload).
    if (uploadedUrl) URL.revokeObjectURL(uploadedUrl);
    setUploadedFile(file);
    setUploadedUrl(URL.createObjectURL(file));
    onUpload?.(fileList, buildResumeFromUpload(file));
  }

  const ageFilterLabel = AGE_FILTERS.find((item) => item.key === ageFilter)?.label ?? "Last 30 days";

  const headerActions =
    activeTab === "candidates" && selected ? (
      <>
        {visible.length > 1 ? (
          <>
            <FxButton variant="ghost" size="sm" disabled={!hasPrev} onClick={() => hasPrev && setSelectedId(visible[selectedIndex - 1]?.id)}>
              Previous
            </FxButton>
            <FxButton variant="ghost" size="sm" disabled={!hasNext} onClick={() => hasNext && setSelectedId(visible[selectedIndex + 1]?.id)}>
              Next
            </FxButton>
          </>
        ) : null}
        <button
          type="button"
          aria-label={showListPane ? "Collapse list" : "Expand list"}
          title={showListPane ? "Collapse list" : "Expand list"}
          onClick={() => setShowListPane((current) => !current)}
          className="flex size-8 items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
        >
          {showListPane ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </>
    ) : null;

  const backgroundItems = selected
    ? [
        { label: "Current", value: [selected.currentTitle, selected.currentCompany].filter(Boolean).join(" at ") || "No current role captured yet." },
        { label: "Location", value: selected.location || "Not captured." },
        { label: "Skills", value: (selected.resume?.extracted?.skills ?? []).join(", ") || "No skills captured." },
        { label: "Summary", value: selected.resume?.extracted?.summary || "No summary on file." },
      ]
    : [];
  const resumePreviewUrl = isPdfResume(selected?.resume) ? resolveResumeUrl(selected?.resume, selected?.id) : null;
  const resumeText = (selected?.resume?.text || selected?.resume?.extracted?.summary || "").trim();

  return (
    <FxSheet open={open} onOpenChange={onOpenChange} size={showListPane ? "xl" : "md"}>
      <FxSheet.Header title={title} actions={headerActions} />
      <FxSheet.Toolbar className="border-b-0 pb-0">
        <FxTabs
          variant="rounded"
          value={activeTab}
          onValueChange={setActiveTab}
          tabs={[
            { value: "candidates", label: "Candidates" },
            { value: "upload", label: "Upload" },
          ]}
        />
      </FxSheet.Toolbar>

      <FxSheet.Body className="flex min-h-0 flex-col overflow-hidden">
        {activeTab === "upload" ? (
          <section className="flex min-h-0 flex-1 flex-col gap-3 rounded-[16px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5">
            {uploadedUrl ? (
              <>
                <div className="flex flex-none items-center justify-between gap-3 rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="size-4 shrink-0 text-[var(--fx-primary)]" />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-[var(--fx-text)]">{uploadedFile?.name}</p>
                      <p className="truncate text-[12px] text-[var(--fx-text-muted)]">
                        {[formatFileSize(uploadedFile?.size), uploadedFile?.type || "application/pdf"].filter(Boolean).join(" · ")} · preview is session-only
                      </p>
                    </div>
                  </div>
                  <FxButton variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Replace
                  </FxButton>
                </div>
                <div className="min-h-0 flex-1">
                  <FxPdfViewer file={uploadedUrl} showToolbar className="h-full" />
                </div>
              </>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && fileInputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  handleFiles(event.dataTransfer.files);
                }}
                className={cn(
                  "mx-auto flex min-h-[280px] w-full max-w-[420px] cursor-pointer flex-col items-center justify-center rounded-[16px] border border-dashed px-6 py-7 text-center transition-colors",
                  isDragging ? "border-[var(--fx-primary)] bg-[var(--fx-surface-selected)]" : "border-[var(--fx-border)] bg-[var(--fx-bg-soft)] hover:bg-[var(--fx-surface-hover)]",
                )}
              >
                <Upload className="size-7 text-[var(--fx-primary)]" />
                <p className="mt-3 text-[14px] font-medium leading-[22px] text-[var(--fx-text)]">Upload a resume (PDF)</p>
                <div className="mt-4">
                  <FxButton
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Upload
                  </FxButton>
                </div>
                <p className="mt-3 text-[13px] leading-[20px] text-[var(--fx-text-muted)]">Drag &amp; drop a PDF to preview it. Only file details are saved in this demo.</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(event) => {
                handleFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </section>
        ) : visible.length ? (
          <div className={cn("grid min-h-0 flex-1 gap-3", showListPane ? "lg:grid-cols-[300px_1px_minmax(0,1fr)]" : "lg:grid-cols-1")}>
            {/* Candidate list — floating card (parity with the old product) */}
            {showListPane ? (
              <div className="flex min-h-0 flex-col overflow-hidden rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)]">
                <div className="border-b border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] p-2">
                  {isRecommend ? (
                    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <FxButton variant="outline" size="sm" className="w-full justify-between">
                            <span className="truncate">{ageFilterLabel}</span>
                            <ChevronDown className="size-3.5 shrink-0" />
                          </FxButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[200px]">
                          {AGE_FILTERS.map((filter) => (
                            <DropdownMenuItem key={filter.key} onSelect={() => setAgeFilter(filter.key)}>
                              {filter.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <FxInput size="sm" clearable={false} placeholder={`Search ${ageFiltered.length}`} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
                    </div>
                  ) : (
                    <FxInput size="sm" clearable={false} placeholder={`Search ${visible.length} candidates`} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
                  )}
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-2">
                  <div className="space-y-2">
                    {visible.map((candidate) => {
                      const isSelected = selected?.id === candidate.id;
                      return (
                        <div
                          key={candidate.id}
                          className={cn(
                            "flex items-start justify-between gap-2 rounded-[10px] px-3 py-3 transition-colors",
                            isSelected ? "bg-[var(--fx-surface)] shadow-sm" : "bg-transparent hover:bg-[var(--fx-surface)]",
                          )}
                        >
                          <button type="button" onClick={() => setSelectedId(candidate.id)} className="flex min-w-0 flex-1 flex-col items-start text-left">
                            <span className="w-full truncate text-[13px] font-medium leading-[18px] text-[var(--fx-text)]">{candidate.name}</span>
                            <span className="w-full truncate text-[12px] leading-[16px] text-[var(--fx-text-muted)]">
                              {[candidate.currentTitle, candidate.currentCompany].filter(Boolean).join(" · ") || candidate.email}
                            </span>
                          </button>
                          <button
                            type="button"
                            aria-label={`Remove ${candidate.name}`}
                            onClick={() => hide(candidate.id)}
                            className="inline-flex size-5 shrink-0 items-center justify-center rounded-[4px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-danger)]"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Vertical divider between list and preview */}
            {showListPane ? <div className="hidden w-px bg-[var(--fx-border)] lg:block" /> : null}

            {/* Preview — candidate summary card + Background/Resume */}
            <div className="flex min-h-0 flex-col gap-3">
              {selected ? <EvCandidateCard candidate={selected} mode="summary" /> : null}

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)]">
                <div className="flex-none border-b border-[var(--fx-border)] px-3 py-2">
                  <FxTabs
                    variant="segmented"
                    value={previewTab}
                    onValueChange={setPreviewTab}
                    tabs={[
                      { value: "resume", label: "Résumé" },
                      { value: "background", label: "Background" },
                    ]}
                  />
                </div>
                {/* Single content surface — no inner card; each view fills the area. */}
                <div className="min-h-0 flex-1 overflow-hidden">
                  {previewTab === "background" ? (
                    <div className="h-full space-y-3 overflow-y-auto p-4">
                      {backgroundItems.map((item) => (
                        <div key={item.label} className="space-y-0.5">
                          <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--fx-text-muted)]">{item.label}</p>
                          <p className="text-[13px] leading-[20px] text-[var(--fx-text)]">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  ) : resumePreviewUrl ? (
                    <FxPdfViewer file={resumePreviewUrl} showToolbar className="h-full rounded-none border-0" />
                  ) : resumeText ? (
                    <div className="h-full overflow-y-auto p-4">
                      <pre className="whitespace-pre-wrap break-words font-sans text-[13px] leading-[21px] text-[var(--fx-text)]">{resumeText}</pre>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="space-y-2 text-center">
                        <FileText className="mx-auto size-6 text-[var(--fx-text-muted)]" />
                        <p className="text-[13px] text-[var(--fx-text-muted)]">No resume on file for this candidate.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[14px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-6 text-center">
            <p className="text-[14px] font-medium text-[var(--fx-text)]">No candidates found</p>
            <p className="mt-1 text-[13px] text-[var(--fx-text-muted)]">Try another name or switch to upload.</p>
          </div>
        )}
      </FxSheet.Body>

      <FxSheet.Footer
        footerStart={
          <FxButton variant="outline" size="sm" onClick={() => onOpenChange?.(false)}>
            Close
          </FxButton>
        }
      >
        <FxButton variant="destructiveOutline" size="sm" disabled={!selected || activeTab !== "candidates"} onClick={() => selected && hide(selected.id)}>
          Ignore
        </FxButton>
        <FxButton size="sm" className="min-w-[116px]" disabled={!selected || activeTab !== "candidates"} onClick={() => pick(selected)}>
          Add to Job
        </FxButton>
      </FxSheet.Footer>
    </FxSheet>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvAddCandidatesSheet };
/* - - - - - - - - - - - - - - - - */
