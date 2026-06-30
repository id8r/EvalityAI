/* src/components/Ev/Candidates/EvAddCandidatesSheet.js | Add / Recommend candidates to a job (one reusable sheet) | Sree | 2026-06-30 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, FileText, PanelLeftClose, PanelLeftOpen, Upload, X } from "lucide-react";

import { FxButton, FxToolbarSearch } from "@/components/FxUI/Forms";
import { FxPdfViewer } from "@/components/FxUI/DataDisplay";
import { FxSheet } from "@/components/FxUI/Overlays/FxSheet";
import { FxTabs } from "@/components/FxUI/Navigation";
import { EvCandidateCard } from "@/components/Ev/Candidates/EvCandidateCard";
import { EvCandidatePreview } from "@/components/Ev/Candidates/EvCandidatePreview";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { buildResumeFromUpload, formatFileSize } from "@/lib/EvResume";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  ONE sheet, TWO entry points — same title ("Add Candidates to Job") and identical body; `mode` only sets
  the landing tab:
    mode="recommend" → lands on the Candidates tab (AI button).
    mode="add"       → lands on the Upload tab.

  Candidates tab = pick from the pool (collapsible list with age filter + search) and preview the chosen
  candidate via EvCandidatePreview (Resume / Background). Upload tab = drop a PDF to preview (session-only).
*/

// ---- Config + styling (kept at top per FxCodingConventions) ----
const AGE_FILTERS = [
  { key: "any", label: "Any time", days: null }, // default — never hide the whole pool behind a date window
  { key: "15_days", label: "Last 15 days", days: 15 },
  { key: "30_days", label: "Last 30 days", days: 30 },
  { key: "2_months", label: "Last 2 months", days: 60 },
  { key: "3_months", label: "Last 3 months", days: 90 },
];
const DEFAULT_AGE_FILTER = "any";
const ENTRY_TABS = [{ value: "candidates", label: "Candidates" }, { value: "upload", label: "Upload" }];
const CARD = "rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)]";

// ---- Small utils ----
function ageInDays(value) {
  const ts = new Date(value).getTime();
  if (Number.isNaN(ts)) return null;
  return Math.floor(Math.max(0, Date.now() - ts) / 86400000);
}

function matchesQuery(candidate, query) {
  return [candidate.name, candidate.email, candidate.currentTitle, candidate.currentCompany]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function EmptyHint({ icon: Icon = FileText, title, detail, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-1 px-4 py-10 text-center", className)}>
      {Icon ? <Icon className="mb-1 size-6 text-[var(--fx-text-muted)]" /> : null}
      <p className="text-[14px] font-medium text-[var(--fx-text)]">{title}</p>
      {detail ? <p className="text-[13px] text-[var(--fx-text-muted)]">{detail}</p> : null}
    </div>
  );
}

// ---- Candidate list pane (left) ----
function AgeFilterMenu({ value, onChange }) {
  const label = AGE_FILTERS.find((filter) => filter.key === value)?.label ?? AGE_FILTERS[0].label;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* filled bg so it reads as a control against the soft list panel */}
        <FxButton variant="outline" size="sm" className="w-full justify-between bg-[var(--fx-surface)]">
          <span className="truncate">{label}</span>
          <ChevronDown className="size-3.5 shrink-0" />
        </FxButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {AGE_FILTERS.map((filter) => (
          <DropdownMenuItem key={filter.key} onSelect={() => onChange(filter.key)}>
            {filter.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CandidateRow({ candidate, selected, onSelect, onRemove }) {
  const subtitle = [candidate.currentTitle, candidate.currentCompany].filter(Boolean).join(" · ") || candidate.email;
  return (
    <li
      className={cn(
        "flex items-start justify-between gap-2 rounded-[10px] px-3 py-3 transition-colors",
        selected ? "bg-[var(--fx-surface)] shadow-sm" : "hover:bg-[var(--fx-surface)]",
      )}
    >
      <button type="button" onClick={() => onSelect(candidate.id)} className="flex min-w-0 flex-1 flex-col items-start text-left">
        <span className="w-full truncate text-[13px] font-medium leading-[18px] text-[var(--fx-text)]">{candidate.name}</span>
        <span className="w-full truncate text-[12px] leading-[16px] text-[var(--fx-text-muted)]">{subtitle}</span>
      </button>
      <button
        type="button"
        aria-label={`Remove ${candidate.name}`}
        onClick={() => onRemove(candidate.id)}
        className="inline-flex size-5 shrink-0 items-center justify-center rounded-[4px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-danger)]"
      >
        <X className="size-3.5" />
      </button>
    </li>
  );
}

function CandidateListPane({ items, selectedId, onSelect, onRemove, searchTerm, onSearchChange, ageFilter, onAgeFilterChange }) {
  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)]">
      <div className="border-b border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] p-2">
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-2">
          <AgeFilterMenu value={ageFilter} onChange={onAgeFilterChange} />
          <FxToolbarSearch className="sm:w-full" placeholder="Search" value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {items.length ? (
          <ul className="space-y-2">
            {items.map((candidate) => (
              <CandidateRow key={candidate.id} candidate={candidate} selected={candidate.id === selectedId} onSelect={onSelect} onRemove={onRemove} />
            ))}
          </ul>
        ) : (
          <EmptyHint icon={null} title="No matches" detail="Adjust the filter or clear the search." className="h-full" />
        )}
      </div>
    </div>
  );
}

// ---- Upload tab (owns its own blob lifecycle) ----
function UploadPane({ onUpload }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState(null); // session-only blob — never persisted; revoked on change/unmount

  useEffect(() => () => url && URL.revokeObjectURL(url), [url]);

  function accept(fileList) {
    const next = fileList?.[0];
    if (!next) return;
    if (url) URL.revokeObjectURL(url);
    setFile(next);
    setUrl(URL.createObjectURL(next));
    onUpload?.(fileList, buildResumeFromUpload(next));
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3 rounded-[16px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5">
      {url ? (
        <>
          <div className="flex flex-none items-center justify-between gap-3 rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="size-4 shrink-0 text-[var(--fx-primary)]" />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-[var(--fx-text)]">{file?.name}</p>
                <p className="truncate text-[12px] text-[var(--fx-text-muted)]">
                  {[formatFileSize(file?.size), file?.type || "application/pdf"].filter(Boolean).join(" · ")} · preview is session-only
                </p>
              </div>
            </div>
            <FxButton variant="outline" size="sm" onClick={() => inputRef.current?.click()}>Replace</FxButton>
          </div>
          <div className="min-h-0 flex-1">
            <FxPdfViewer file={url} showToolbar className="h-full" />
          </div>
        </>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && inputRef.current?.click()}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); accept(event.dataTransfer.files); }}
          className={cn(
            "mx-auto flex min-h-[280px] w-full max-w-[420px] cursor-pointer flex-col items-center justify-center rounded-[16px] border border-dashed px-6 py-7 text-center transition-colors",
            dragging ? "border-[var(--fx-primary)] bg-[var(--fx-surface-selected)]" : "border-[var(--fx-border)] bg-[var(--fx-bg-soft)] hover:bg-[var(--fx-surface-hover)]",
          )}
        >
          <Upload className="size-7 text-[var(--fx-primary)]" />
          <p className="mt-3 text-[14px] font-medium leading-[22px] text-[var(--fx-text)]">Upload a resume (PDF)</p>
          <div className="mt-4">
            <FxButton size="sm" onClick={(event) => { event.stopPropagation(); inputRef.current?.click(); }}>Upload</FxButton>
          </div>
          <p className="mt-3 text-[13px] leading-[20px] text-[var(--fx-text-muted)]">Drag &amp; drop a PDF to preview it. Only file details are saved in this demo.</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(event) => { accept(event.target.files); event.target.value = ""; }}
      />
    </section>
  );
}

// ---- Sheet (orchestrates state + layout) ----
function EvAddCandidatesSheet({ open, onOpenChange, mode = "add", job, candidates = [], onPick, onUpload }) {
  void job; // reserved — JD-aware scoring will use it later
  const isRecommend = mode === "recommend";
  const title = "Add Candidates to Job"; // one title for both entry points; mode only drives the landing tab

  // State resets per open via a `key` remount from the parent (no reset effect needed).
  const [activeTab, setActiveTab] = useState(isRecommend ? "candidates" : "upload");
  const [searchTerm, setSearchTerm] = useState("");
  const [ageFilter, setAgeFilter] = useState(DEFAULT_AGE_FILTER);
  const [selectedId, setSelectedId] = useState(null);
  const [hiddenIds, setHiddenIds] = useState([]);
  const [showListPane, setShowListPane] = useState(true);

  // Single-pass filter: age window → search → not-removed.
  const visible = useMemo(() => {
    const limit = AGE_FILTERS.find((filter) => filter.key === ageFilter)?.days ?? null;
    const query = searchTerm.trim().toLowerCase();
    const hidden = new Set(hiddenIds);
    return candidates.filter((candidate) => {
      if (hidden.has(candidate.id)) return false;
      if (limit != null) {
        const days = ageInDays(candidate.createdAt);
        if (days == null || days > limit) return false;
      }
      if (query && !matchesQuery(candidate, query)) return false;
      return true;
    });
  }, [candidates, ageFilter, searchTerm, hiddenIds]);

  // selected always resolves to a valid row (falls back to the first) — no selection-sync effect needed.
  const selected = visible.find((candidate) => candidate.id === selectedId) ?? visible[0] ?? null;
  const selectedIndex = selected ? visible.findIndex((candidate) => candidate.id === selected.id) : -1;
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex >= 0 && selectedIndex < visible.length - 1;

  function hide(id) {
    setHiddenIds((current) => (current.includes(id) ? current : [...current, id]));
  }
  function step(delta) {
    const next = visible[selectedIndex + delta];
    if (next) setSelectedId(next.id);
  }
  function pick() {
    if (!selected) return;
    onPick?.(selected);
    hide(selected.id);
  }

  const onCandidates = activeTab === "candidates";
  const headerActions = onCandidates ? (
    <>
      {selected && visible.length > 1 ? (
        <>
          <FxButton variant="ghost" size="sm" disabled={!hasPrev} onClick={() => step(-1)}>Previous</FxButton>
          <FxButton variant="ghost" size="sm" disabled={!hasNext} onClick={() => step(1)}>Next</FxButton>
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

  return (
    <FxSheet open={open} onOpenChange={onOpenChange} size={showListPane ? "xl" : "md"}>
      <FxSheet.Header title={title} actions={headerActions} />
      <FxSheet.Toolbar className="border-b-0 pb-0">
        <FxTabs variant="rounded" value={activeTab} onValueChange={setActiveTab} tabs={ENTRY_TABS} />
      </FxSheet.Toolbar>

      <FxSheet.Body className="flex min-h-0 flex-col overflow-hidden">
        {activeTab === "upload" ? (
          <UploadPane onUpload={onUpload} />
        ) : (
          <div className={cn("grid min-h-0 flex-1 gap-3", showListPane ? "lg:grid-cols-[300px_1px_minmax(0,1fr)]" : "lg:grid-cols-1")}>
            {showListPane ? (
              <CandidateListPane
                items={visible}
                selectedId={selected?.id ?? null}
                onSelect={setSelectedId}
                onRemove={hide}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                ageFilter={ageFilter}
                onAgeFilterChange={setAgeFilter}
              />
            ) : null}
            {showListPane ? <div className="hidden w-px bg-[var(--fx-border)] lg:block" /> : null}

            {/* Preview column — the single scroll surface; content flows to natural height with sticky tabs. */}
            <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
              {selected ? (
                <>
                  {/* compact card keeps the identity slim so the Resume/Background gets the height */}
                  <EvCandidateCard candidate={selected} mode="compact" />
                  <EvCandidatePreview key={selected.id} candidate={selected} />
                </>
              ) : (
                <div className={cn("flex flex-1 items-center justify-center", CARD)}>
                  <EmptyHint title="No candidate selected" detail="No matches for the current filter and search." />
                </div>
              )}
            </div>
          </div>
        )}
      </FxSheet.Body>

      <FxSheet.Footer
        footerStart={
          <FxButton variant="outline" size="sm" onClick={() => onOpenChange?.(false)}>Close</FxButton>
        }
      >
        <FxButton variant="destructiveOutline" size="sm" disabled={!selected || !onCandidates} onClick={() => selected && hide(selected.id)}>Ignore</FxButton>
        <FxButton size="sm" className="min-w-[116px]" disabled={!selected || !onCandidates} onClick={pick}>Add to Job</FxButton>
      </FxSheet.Footer>
    </FxSheet>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvAddCandidatesSheet };
/* - - - - - - - - - - - - - - - - */
