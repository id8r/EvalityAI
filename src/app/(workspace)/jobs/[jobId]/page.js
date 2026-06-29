"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  CalendarClock,
  Check,
  ChevronDown,
  CircleUserRound,
  ClipboardCheck,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Mail,
  Minus,
  PencilLine,
  PhoneCall,
  RotateCcw,
  Share2,
  UserRoundX,
  Users,
} from "lucide-react";

import { FxAiButton, FxButton, FxIconButton, FxToolbarSearch } from "@/components/FxUI/Forms";
import { FxPageToolbar, FxWorkspaceTableFrame } from "@/components/FxUI/Layout";
import { FxTabs } from "@/components/FxUI/Navigation";
import {
  FxTable,
  FxActionsCell,
  FxColumnManager,
  FxCellDot,
  FxLinkCell,
  FxScoreCell,
  FxTextCell,
  FxSalaryRangeCell,
  FxPdfViewer,
  useFxTable,
} from "@/components/FxUI/DataDisplay";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EvJobCreateSheet } from "@/components/Ev/Jobs/EvJobCreateSheet";
import { EvAddCandidatesSheet } from "@/components/Ev/Candidates/EvAddCandidatesSheet";
import { FxConfirmDialog } from "@/components/FxUI/Overlays/FxConfirmDialog";
import { EvStartPreScreeningSheet } from "@/components/Ev/Candidates/EvStartPreScreeningSheet";
import { FxSheet } from "@/components/FxUI/Overlays/FxSheet";
import {
  createApplication,
  getApplicationsByJob,
  getCandidate,
  getCandidates,
  getJob,
  setApplicationStage,
  updateApplication,
  updateJob,
} from "@/lib/EvData";
import { employmentTypeLabel, experienceLabel, jobLocationLabel, stageLabel } from "@/lib/EvSelectors";
import { formatMoney } from "@/lib/EvFormat";
import { isPdfResume, resolveResumeUrl } from "@/lib/EvResume";
import { FxPanel } from "@/components/FxUI/Layout/FxPanel";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { ROUTES } from "@/lib/FxConstants";
import { cn, FxStatusMeta } from "@/lib/FxUtils";
import { useEvData } from "@/lib/useEvData";

/* ============================================================================
   JOB WORKSPACE — tweak the look/behaviour of every stage bucket from here.
   Fx primitives own the UI; this file owns the per-stage PRODUCT config.
   ========================================================================= */

const NEW_RESUME_DAYS = 2; // candidates newer than this get the blue "new" accent + drive the Fresh filter
// Per-row left accent for fresh candidates. `rowClassName` styles the row's first cell (sticky left edge).
const NEW_ROW_CLASS =
  "[&>td:first-child]:relative [&>td:first-child]:before:pointer-events-none [&>td:first-child]:before:absolute " +
  "[&>td:first-child]:before:inset-y-0 [&>td:first-child]:before:left-0 [&>td:first-child]:before:w-[3px] " +
  "[&>td:first-child]:before:bg-[var(--fx-primary)]";

// Column id sets reused across stages.
const SHARED_COLUMNS = ["name", "phone", "score", "experience", "currentSalary", "expectedSalary", "email", "availability"];
const INTERVIEW_COLUMNS = ["name", "phone", "scheduleDetails", "interviewer", "interviewStage", "recommendation", "feedback"];

/*
  Action descriptors — referenced by id from each stage's inline / bulk / kebab lists.
  `run(h, rows)` dispatches to the page handlers (h). `tone`: accent | danger | neutral. `sep`: kebab separator before.
*/
const ACTION_DEFS = {
  view: { icon: Eye, label: "View Candidate", tone: "neutral", run: (h, r) => h.openDetail("candidate", r[0]) },
  open: { icon: Eye, label: "Open Candidate", tone: "neutral", run: (h, r) => h.openDetail("candidate", r[0]) },
  resume: { icon: FileText, label: "View Resume", tone: "neutral", run: (h, r) => h.openDetail("resume", r[0]) },
  download: { icon: Download, label: "Download Resume", tone: "accent", run: (h, r) => h.download(r) },
  prescreen: { icon: Mail, label: "Start Pre-Screening", tone: "accent", run: (h, r) => h.startPreScreen(r) },
  preScreenResult: { icon: ClipboardCheck, label: "View Pre-Screen Result", tone: "neutral", run: (h, r) => h.openDetail("preScreenResult", r[0]) },
  share: { icon: Share2, label: "Share for Review", tone: "accent", run: (h, r) => h.openDetail("share", r[0]) },
  shortlist: { icon: Check, label: "Shortlist", tone: "accent", run: (h, r) => h.move(r, "shortlisted", "Shortlisted") },
  schedule: { icon: CalendarClock, label: "Schedule", tone: "neutral", run: (h, r) => h.openDetail("schedule", r[0]) },
  onHold: { icon: Minus, label: "On Hold", tone: "neutral", run: (h, r) => h.onHold(r) },
  drop: { icon: UserRoundX, label: "Drop Candidate", tone: "danger", run: (h, r) => h.drop(r) },
  reject: { icon: Ban, label: "Reject", tone: "danger", run: (h, r) => h.reject(r) },
  rejectCandidate: { icon: Ban, label: "Reject Candidate", tone: "danger", sep: true, run: (h, r) => h.reject(r) },
  moveToPrescreened: { icon: RotateCcw, label: "Move to Pre-Screened", tone: "accent", run: (h, r) => h.move(r, "prescreened", "Moved to Pre-Screened") },
  moveToShortlisted: { icon: ArrowRight, label: "Move to Shortlisted", tone: "neutral", run: (h, r) => h.move(r, "shortlisted", "Moved to Shortlisted") },
  moveBackPrescreened: { icon: RotateCcw, label: "Move back to Pre-Screened", tone: "neutral", run: (h, r) => h.move(r, "prescreened", "Moved to Pre-Screened") },
  interviewWorkspace: { icon: ExternalLink, label: "Interview Workspace", tone: "neutral", run: (h, r) => h.openDetail("interview", r[0]) },
};

/*
  Per-stage config. columns = ordered column ids; scoreLabel/scoreKind = the Match/Fit score column header + what
  clicking it opens; selectable = checkbox selection + bulk bar; dot = client-status dot before the name;
  inline = right-aligned quick actions; bulk = toolbar actions (enabled once rows are selected); kebab = row menu.
*/
const STAGE_CONFIG = {
  unscreened: {
    columns: SHARED_COLUMNS, scoreLabel: "Match Score", scoreKind: "cvMatch", selectable: true, defaultSort: null,
    inline: ["view", "prescreen"], bulk: ["prescreen", "reject", "download"], kebab: ["view", "resume", "download", "rejectCandidate"],
  },
  prescreened: {
    columns: SHARED_COLUMNS, scoreLabel: "Fit Score", scoreKind: "preScreenResult", selectable: true, defaultSort: { key: "score", direction: "desc" },
    inline: ["view", "share"], bulk: ["share", "shortlist", "drop", "reject"], kebab: ["view", "resume", "preScreenResult", "share", "download", "drop", "rejectCandidate"],
  },
  shortlisted: {
    columns: SHARED_COLUMNS, scoreLabel: "Fit Score", scoreKind: "preScreenResult", selectable: true, defaultSort: { key: "score", direction: "desc" },
    inline: ["schedule", "view"], bulk: ["onHold", "drop", "reject"], kebab: ["open", "resume", "preScreenResult", "schedule", "download", "drop", "moveBackPrescreened", "rejectCandidate"],
  },
  interviewing: {
    columns: INTERVIEW_COLUMNS, dot: true, selectable: false, defaultSort: null,
    inline: ["interviewWorkspace"], bulk: [], kebab: ["view", "resume", "download", "rejectCandidate"],
  },
  offered: {
    columns: SHARED_COLUMNS, scoreLabel: "Fit Score", scoreKind: "preScreenResult", dot: true, selectable: false, defaultSort: null,
    inline: ["view"], bulk: [], kebab: ["view", "resume", "download", "rejectCandidate"],
  },
  joined: {
    columns: SHARED_COLUMNS, scoreLabel: "Fit Score", scoreKind: "preScreenResult", dot: true, selectable: false, defaultSort: null,
    inline: ["view"], bulk: [], kebab: ["view", "resume", "download", "rejectCandidate"],
  },
  dropped: {
    columns: SHARED_COLUMNS, scoreLabel: "Fit Score", scoreKind: "preScreenResult", selectable: false, defaultSort: null,
    inline: ["view"], bulk: [], kebab: ["view", "resume", "download", "rejectCandidate"],
  },
  rejected: {
    columns: SHARED_COLUMNS, scoreLabel: "Fit Score", scoreKind: "preScreenResult", selectable: true, defaultSort: null,
    inline: ["moveToPrescreened"], bulk: ["moveToPrescreened", "moveToShortlisted", "download"], kebab: ["view", "resume", "download", "moveToPrescreened", "moveToShortlisted"],
  },
};

// Placeholder detail sheets — the open/route is wired now; the detailed content lands in the next pass.
const DETAIL_META = {
  candidate: { title: (r) => r?.candidateName ?? "Candidate", desc: "Candidate workspace" },
  cvMatch: { title: () => "CV Match Breakdown", desc: "How this candidate matches the role" },
  preScreenResult: { title: () => "Pre-Screen Result", desc: "Screening summary & answers" },
  resume: { title: (r) => `${r?.candidateName ?? "Candidate"} — Resume`, desc: "Resume preview" },
  schedule: { title: () => "Schedule Interview", desc: "Set up an interview" },
  share: { title: () => "Share for Review", desc: "Send candidates to the client" },
  interview: { title: () => "Interview Workspace", desc: "Interview details & feedback" },
  feedback: { title: () => "Interview Feedback", desc: "Interviewer feedback" },
};

const WORKSPACE_TABS = [
  { value: "unscreened", label: stageLabel("unscreened") },
  { value: "prescreened", label: stageLabel("pre_screened") },
  { value: "shortlisted", label: stageLabel("shortlisted") },
  { value: "interviewing", label: stageLabel("interviewing") },
  { value: "offered", label: stageLabel("offered") },
  { value: "joined", label: stageLabel("joined") },
  { value: "dropped", label: stageLabel("dropped") },
  { value: "rejected", label: stageLabel("rejected") },
];

const TAB_LABEL_BY_VALUE = Object.fromEntries(WORKSPACE_TABS.map((tab) => [tab.value, tab.label]));
const TAB_VALUES = new Set(WORKSPACE_TABS.map((tab) => tab.value));
const TAB_ALIASES = {
  pre_screened: "prescreened",
  screened: "prescreened",
  sentToClient: "interviewing",
  shared: "interviewing",
  all: "unscreened",
};

const AGE_FILTERS = [
  { value: "all", label: "All candidates" },
  { value: "fresh", label: "Fresh" },
  { value: "15_days", label: "15 days" },
  { value: "30_days", label: "30 days" },
  { value: "2_months", label: "2 months" },
  { value: "3_months", label: "3 months" },
];

const AGE_FILTER_LABEL_BY_VALUE = Object.fromEntries(AGE_FILTERS.map((item) => [item.value, item.label]));
const AGE_FILTER_ORDER = ["all", "fresh", "15_days", "30_days", "2_months", "3_months"];

function resolveTab(value) {
  const key = String(value ?? "").trim();
  if (!key) return "unscreened";
  return TAB_ALIASES[key] ?? (TAB_VALUES.has(key) ? key : "unscreened");
}

function tabQueryValue(value) {
  const key = resolveTab(value);
  return key === "prescreened" ? "prescreened" : key;
}

function stageForApplication(app) {
  const stage = String(app?.stage ?? "unscreened");
  if (stage === "pre_screened" || stage === "screened") return "prescreened";
  if (stage === "shared" || stage === "sentToClient") return "interviewing";
  if (stage === "rejected" && String(app?.clientStatus ?? "").trim() === "Candidate Dropped Off") return "dropped";
  if (TAB_VALUES.has(stage)) return stage;
  return "unscreened";
}

function matchesSearch(candidate, app, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [candidate?.name, candidate?.email, candidate?.currentTitle, candidate?.currentCompany, candidate?.location, app?.id, app?.clientStatus]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(q));
}

function ageInDays(appliedAt, now) {
  const time = new Date(appliedAt).getTime();
  if (Number.isNaN(time)) return Infinity;
  return Math.floor(Math.max(0, now - time) / 86400000);
}

function matchesAgeFilter(appliedAt, filter, now) {
  if (filter === "all") return true;
  const diffDays = ageInDays(appliedAt, now);
  if (filter === "fresh") return diffDays <= NEW_RESUME_DAYS;
  if (filter === "15_days") return diffDays < 15;
  if (filter === "30_days") return diffDays < 30;
  if (filter === "2_months") return diffDays < 60;
  if (filter === "3_months") return diffDays < 90;
  return true;
}

function scoreTone(value) {
  if (value == null) return "primary";
  if (value >= 80) return "success";
  if (value >= 60) return "warning";
  return "danger";
}

function statusToneForStage(stage) {
  if (stage === "prescreened" || stage === "shortlisted" || stage === "joined") return "success";
  if (stage === "interviewing" || stage === "offered") return "warning";
  if (stage === "dropped" || stage === "rejected") return "danger";
  return "subtle";
}

function workspaceEmptyCopy(tab) {
  const label = TAB_LABEL_BY_VALUE[tab] ?? "Unscreened";
  return {
    title: `No ${label.toLowerCase()} candidates yet`,
    body:
      tab === "unscreened"
        ? "Add candidates to this job and they will appear here first."
        : `Candidates will show up here once they move into ${label}.`,
  };
}

function MetaField({ label, value }) {
  return (
    <div className="min-w-0 space-y-1">
      <div className="text-[12px] font-medium leading-[16px] text-[var(--fx-text-muted)]">{label}</div>
      <div className="truncate text-[14px] font-medium leading-[22px] text-[var(--fx-text)]">{value}</div>
    </div>
  );
}

function questionFormatLabel(value) {
  if (value === "cv_and_prescreen") return "CV + AI pre-screening";
  if (value === "prescreen_only") return "Standard Questions Only";
  return "—";
}

function EmptyState({ tab, onAddCandidates }) {
  const copy = workspaceEmptyCopy(tab);
  return (
    <div className="flex min-h-full items-center justify-center px-6 py-8">
      <div className="max-w-[440px] space-y-4 text-center">
        <div className="mx-auto flex size-[52px] items-center justify-center rounded-full bg-[var(--fx-bg-soft)] text-[var(--fx-primary)]">
          <Users className="size-[22px]" />
        </div>
        <div className="space-y-2">
          <p className={FX_TYPOGRAPHY.sectionTitle}>{copy.title}</p>
          <p className={cn(FX_TYPOGRAPHY.body, "text-[var(--fx-text-muted)]")}>{copy.body}</p>
        </div>
        {tab === "unscreened" ? (
          <div className="flex justify-center">
            <FxButton onClick={onAddCandidates}>Add Candidates</FxButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AgeFilterDropdown({ value, onChange, counts }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <FxButton variant="outline" size="sm" className="whitespace-nowrap">
          <Filter className="size-4" />
          <span>{AGE_FILTER_LABEL_BY_VALUE[value] ?? AGE_FILTER_LABEL_BY_VALUE.all}</span>
          <ChevronDown className="size-4" />
        </FxButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        {AGE_FILTER_ORDER.map((option) => (
          <DropdownMenuItem
            key={option}
            onSelect={(event) => {
              event.preventDefault();
              onChange(option);
            }}
            className={cn("flex items-center justify-between gap-3", value === option && "bg-[var(--fx-surface-selected)]")}
          >
            <span className="truncate">{AGE_FILTER_LABEL_BY_VALUE[option]}</span>
            <span className="text-[var(--fx-text-muted)]">{counts[option] ?? 0}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BulkIconButton({ icon: Icon, label, onClick, disabled = false, tone = "neutral" }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <FxIconButton
          variant="ghost"
          size="sm"
          aria-label={label}
          title={label}
          disabled={disabled}
          onClick={onClick}
          className={cn(tone === "danger" ? "text-[var(--fx-danger)]" : tone === "accent" ? "text-[var(--fx-primary)]" : "text-[var(--fx-text-muted)]")}
        >
          <Icon className="size-4" />
        </FxIconButton>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function downloadCandidateResumeFile(candidate, jobTitle = "") {
  if (!candidate) return;
  const resumeText = [
    candidate.candidateName ?? candidate.name ?? "Candidate",
    candidate.currentTitle || "",
    candidate.currentCompany || "",
    candidate.email || candidate.candidateEmail || "—",
    candidate.phone || "—",
    `Match Score: ${candidate.matchScore != null ? `${candidate.matchScore}%` : "—"}`,
    `Job: ${jobTitle || "—"}`,
  ]
    .filter(Boolean)
    .join("\n");
  const blob = new Blob([resumeText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${String(candidate.candidateName ?? candidate.name ?? "candidate").replace(/\s+/g, "-").toLowerCase()}-resume.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

/* ---------- columns: assembled from a stage config + the page handlers (DRY across all stages) ---------- */
function buildStageColumns(config, h) {
  const phoneCell = (row) =>
    row.phone ? (
      <a
        href={`tel:${String(row.phone).replace(/[^\d+]/g, "")}`}
        className="truncate text-[var(--fx-text)] hover:text-[var(--fx-primary)]"
        onClick={(event) => event.stopPropagation()}
      >
        {String(row.phone)}
      </a>
    ) : (
      <span className="text-[var(--fx-text-muted)]">—</span>
    );

  const library = {
    name: {
      key: "name", header: "Name", sticky: "left", locked: true, grow: 1, minWidth: 220, width: 280, sortable: true,
      sortAccessor: (row) => row.candidateName ?? "",
      cell: (row) => (
        <FxLinkCell value={row.candidateName} tone="primary" indicator={config.dot ? statusToneForStage(row.stage) : undefined} onClick={() => h.openDetail("candidate", row)} />
      ),
    },
    phone: { key: "phone", header: "Phone", width: 160, minWidth: 140, sortable: false, cell: phoneCell },
    score: {
      key: "score", header: config.scoreLabel ?? "Score", width: 120, minWidth: 104, align: "center", sortable: true, sortType: "number",
      sortAccessor: (row) => row.matchScore,
      cell: (row) => <FxScoreCell value={row.matchScore} tone={scoreTone(row.matchScore)} onClick={() => h.openDetail(config.scoreKind ?? "preScreenResult", row)} />,
    },
    experience: {
      key: "experience", header: "Experience", width: 112, minWidth: 100, align: "center", sortable: true, sortType: "number",
      cell: (row) => <span className="tabular-nums text-[var(--fx-text)]">{row.experience != null && row.experience !== "" ? `${row.experience}y` : "—"}</span>,
    },
    currentSalary: {
      key: "currentSalary", header: "Current CTC", width: 138, minWidth: 128, align: "right", sortable: true, sortType: "number",
      sortAccessor: (row) => row.currentSalary?.amount ?? row.currentSalary ?? null,
      cell: (row) => (
        <span className="tabular-nums text-[var(--fx-text)]">
          {row.currentSalary?.amount != null || Number.isFinite(Number(row.currentSalary)) ? formatMoney(row.currentSalary?.amount ?? row.currentSalary, row.currentSalaryCurrency) : "—"}
        </span>
      ),
    },
    expectedSalary: {
      key: "expectedSalary", header: "Expected CTC", width: 138, minWidth: 128, align: "right", sortable: true, sortType: "number",
      sortAccessor: (row) => row.expectedSalary?.amount ?? row.expectedSalary ?? null,
      cell: (row) => (
        <span className="tabular-nums text-[var(--fx-text)]">
          {row.expectedSalary?.amount != null || Number.isFinite(Number(row.expectedSalary)) ? formatMoney(row.expectedSalary?.amount ?? row.expectedSalary, row.expectedSalaryCurrency) : "—"}
        </span>
      ),
    },
    email: {
      key: "email", header: "Email", width: 240, minWidth: 220, grow: 1, sortable: false, defaultVisible: false,
      cell: (row) => <span className="truncate text-[var(--fx-text)]">{row.email || "—"}</span>,
    },
    availability: {
      key: "availability", header: "Availability", width: 124, minWidth: 112, align: "center", sortable: true, sortType: "number",
      sortAccessor: (row) => row.availabilityDays,
      cell: (row) => <span className="text-[var(--fx-text)]">{row.availabilityDays == null ? "—" : `${row.availabilityDays} days`}</span>,
    },
    // interviewing-only columns (data wires in with the Interview Workspace sheet; structure faithful to old)
    scheduleDetails: { key: "scheduleDetails", header: "Schedule Details", width: 200, minWidth: 160, sortable: false, cell: (row) => <FxTextCell value={row.interview?.scheduleDetails} muted /> },
    interviewer: { key: "interviewer", header: "Interviewer", width: 150, minWidth: 120, sortable: false, cell: (row) => <FxTextCell value={row.interview?.interviewer} /> },
    interviewStage: { key: "interviewStage", header: "Stage", width: 90, minWidth: 80, align: "center", sortable: false, cell: (row) => <FxTextCell value={row.interview?.stage} muted /> },
    recommendation: { key: "recommendation", header: "Recommendation", width: 150, minWidth: 120, align: "center", sortable: false, cell: (row) => <FxTextCell value={row.interview?.recommendation} muted /> },
    feedback: {
      key: "feedback", header: "Feedback", width: 130, minWidth: 110, align: "center", sortable: false,
      cell: (row) => <FxLinkCell value={row.interview?.feedback ?? "View"} onClick={() => h.openDetail("feedback", row)} />,
    },
  };

  const columns = config.columns.map((id) => library[id]).filter(Boolean);

  if (config.inline?.length) {
    columns.push({
      key: "actions", header: "Actions", width: 104, minWidth: 96, maxWidth: 140, align: "right", sticky: "right", locked: true, hideable: false, sortable: false,
      cell: (row) => (
        <FxActionsCell
          inline={config.inline.map((id) => {
            const action = ACTION_DEFS[id];
            return { key: id, icon: action.icon, label: action.label, tone: action.tone === "danger" ? "danger" : undefined, onClick: () => action.run(h, [row]) };
          })}
        />
      ),
    });
  }

  if (config.kebab?.length) {
    columns.push({
      key: "menuActions", header: "", width: 56, minWidth: 56, maxWidth: 56, align: "center", sticky: "right", locked: true, hideable: false, sortable: false,
      cell: (row) => (
        <FxActionsCell
          items={config.kebab.map((id) => {
            const action = ACTION_DEFS[id];
            return { key: id, icon: action.icon, label: action.label, tone: action.tone === "danger" ? "danger" : undefined, separatorBefore: action.sep, onClick: () => action.run(h, [row]) };
          })}
          menuLabel={`Row actions for ${row.candidateName}`}
        />
      ),
    });
  }

  return columns;
}

/* ---------- one stage's table — remounted per tab (key) so sort/selection reset cleanly ---------- */
function StageTable({ config, rows, handlers, selectedRowKeys, onSelectedRowKeysChange }) {
  const columns = buildStageColumns(config, handlers);
  const table = useFxTable({
    rows,
    columns,
    enableRowSelection: config.selectable,
    selectedRowKeys,
    onSelectedRowKeysChange,
    defaultSort: config.defaultSort,
  });
  return (
    <FxTable
      controller={table}
      getRowId={(row) => row.id}
      className="h-full min-h-0"
      surfaceClassName="rounded-none border-0 bg-transparent"
      sortable
      stickyHeader
      scrollX
      rowClassName={(row) => (row.isNew ? NEW_ROW_CLASS : undefined)}
      columnManager={<FxColumnManager controller={table} variant="icon" align="right" />}
      emptyMessage="No candidates yet."
    />
  );
}

function DetailBody({ kind, row }) {
  if (!row) return null;
  if (kind === "resume") {
    const url = isPdfResume(row.candidate?.resume) ? resolveResumeUrl(row.candidate?.resume, row.candidate?.id) : null;
    return url ? (
      <div className="h-full min-h-[60vh]">
        <FxPdfViewer file={url} showToolbar className="h-full" />
      </div>
    ) : (
      <div className="rounded-[12px] border border-dashed border-[var(--fx-border)] p-6 text-center text-[13px] text-[var(--fx-text-muted)]">No resume on file for this candidate.</div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="space-y-1 rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4">
        <div className="text-[15px] font-medium text-[var(--fx-text)]">{row.candidateName}</div>
        <div className="text-[13px] text-[var(--fx-text-muted)]">{[row.currentTitle, row.currentCompany].filter(Boolean).join(" · ") || "—"}</div>
        <div className="text-[13px] text-[var(--fx-text-muted)]">{row.email || "—"}</div>
        <div className="text-[13px] text-[var(--fx-text-muted)]">{row.phone ?? "—"}</div>
      </div>
      <div className="rounded-[12px] border border-dashed border-[var(--fx-border)] p-4 text-[13px] text-[var(--fx-text-muted)]">
        This view is being built next — the interaction and routing are wired; detailed content lands in the next pass.
      </div>
    </div>
  );
}

export default function JobWorkspacePage() {
  const ready = useEvData();
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [ageFilter, setAgeFilter] = useState("all");
  const [now] = useState(() => Date.now());
  const [isEditJobOpen, setIsEditJobOpen] = useState(false);
  const [addCandidatesOpen, setAddCandidatesOpen] = useState(false);
  const [addCandidatesMode, setAddCandidatesMode] = useState("add");
  const [addCandidatesKey, setAddCandidatesKey] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [detail, setDetail] = useState({ open: false, kind: "candidate", row: null });
  const [startPreScreeningOpen, setStartPreScreeningOpen] = useState(false);
  const [startPreScreeningRows, setStartPreScreeningRows] = useState([]);
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
  const [rejectRowsState, setRejectRowsState] = useState([]);

  const jobId = String(params?.jobId ?? "");
  const requestedTab = searchParams.get("tab");
  const activeTab = resolveTab(requestedTab);
  const config = STAGE_CONFIG[activeTab] ?? STAGE_CONFIG.unscreened;

  useEffect(() => {
    if (!requestedTab) {
      const next = new URLSearchParams(searchParams.toString());
      next.set("tab", "unscreened");
      router.replace(`${pathname}?${next.toString()}`);
      return;
    }
    if (resolveTab(requestedTab) === requestedTab) return;
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", tabQueryValue(activeTab));
    router.replace(`${pathname}?${next.toString()}`);
  }, [activeTab, pathname, requestedTab, router, searchParams]);

  const job = ready ? getJob(jobId) : null;
  const applications = ready ? getApplicationsByJob(jobId) : [];
  const location = job ? jobLocationLabel(job.roleSpec) : "—";
  const employmentType = job ? employmentTypeLabel(job.roleSpec?.employmentType) : "—";
  const experience = job ? experienceLabel(job.roleSpec) : "—";
  const questionFormat = job ? questionFormatLabel(job.screeningConfig?.questionFormat) : "—";
  const salaryCurrency = job?.roleSpec?.salaryRange?.currency ?? "INR";

  const stageRows = applications
    .map((app) => {
      const candidate = getCandidate(app.candidateId);
      const stage = stageForApplication(app);
      const currentSalary = candidate?.currentSalary ?? null;
      const expectedSalary = candidate?.expectedSalary ?? null;
      return {
        id: app.id,
        app,
        candidate,
        stage,
        clientStatus: app.clientStatus ?? null,
        interview: app.interview ?? null,
        isNew: ageInDays(app.appliedAt, now) <= NEW_RESUME_DAYS,
        candidateName: candidate?.name ?? "Unknown candidate",
        matchScore: app?.qualification?.matchScore ?? candidate?.matchScore ?? null,
        experience: candidate?.experience ?? candidate?.jobContext?.experienceYears ?? candidate?.yearsOfExperience ?? null,
        phone: candidate?.phone ?? candidate?.contact?.phone ?? null,
        email: candidate?.email ?? "—",
        candidateEmail: candidate?.email ?? "—",
        currentTitle: candidate?.currentTitle ?? "",
        currentCompany: candidate?.currentCompany ?? "",
        location: candidate?.location ?? "—",
        currentSalary,
        currentSalaryCurrency: currentSalary?.currency ?? candidate?.salaryCurrency ?? salaryCurrency,
        expectedSalary,
        expectedSalaryCurrency: expectedSalary?.currency ?? candidate?.salaryCurrency ?? salaryCurrency,
        availabilityDays: candidate?.availabilityDays ?? candidate?.jobContext?.availabilityDays ?? null,
        appliedAt: app.appliedAt,
        updatedAt: app.updatedAt,
      };
    })
    .filter((row) => row.stage === activeTab)
    .filter((row) => matchesSearch(row.candidate, row.app, searchTerm));

  const candidateRows = stageRows.filter((row) => matchesAgeFilter(row.appliedAt, ageFilter, now));
  const selectedCandidateRows = candidateRows.filter((row) => selectedRowKeys.includes(row.id));

  const tabCounts = Object.fromEntries(WORKSPACE_TABS.map((tab) => [tab.value, 0]));
  for (const app of applications) {
    const stage = stageForApplication(app);
    if (tabCounts[stage] != null) tabCounts[stage] += 1;
  }

  const ageCounts = { all: stageRows.length, fresh: 0, "15_days": 0, "30_days": 0, "2_months": 0, "3_months": 0 };
  for (const row of stageRows) {
    const diffDays = ageInDays(row.appliedAt, now);
    if (diffDays <= NEW_RESUME_DAYS) ageCounts.fresh += 1;
    if (diffDays < 15) ageCounts["15_days"] += 1;
    if (diffDays < 30) ageCounts["30_days"] += 1;
    if (diffDays < 60) ageCounts["2_months"] += 1;
    if (diffDays < 90) ageCounts["3_months"] += 1;
  }

  // Pool for the Add/Recommend sheet: candidates not already attached to this job.
  const appliedCandidateIds = new Set(applications.map((app) => app.candidateId));
  const candidatePool = ready ? getCandidates().filter((candidate) => !candidate.archivedAt && !appliedCandidateIds.has(candidate.id)) : [];

  function changeTab(value) {
    const nextTab = resolveTab(value);
    setSelectedRowKeys([]); // selection is per-bucket
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", tabQueryValue(nextTab));
    router.push(`${pathname}?${next.toString()}`);
  }

  function openAddCandidates(mode) {
    setAddCandidatesMode(mode);
    setAddCandidatesKey((current) => current + 1); // remount → fresh sheet state per open
    setAddCandidatesOpen(true);
  }

  function handlePickCandidate(candidate) {
    createApplication({ jobId, candidateId: candidate.id, source: "manual" });
    toast.success(`${candidate.name} added`, { description: `Added to ${job?.core?.title ?? "this job"}.` });
  }

  function handleUploadResumes(files, meta) {
    // Demo: previewed in-session from a blob; only metadata would be persisted (no binary in LocalStorage).
    toast.success(`${meta?.fileName ?? "Resume"} ready to preview`, { description: "Preview is session-only — only file details are saved in this demo." });
  }

  const dedupeRows = (rows) => Array.from(new Map(rows.map((row) => [row.id, row])).values());

  // Empty selection falls back to "act on what's visible" so bulk + single-row paths share one resolver.
  const resolveActionRows = (rows) => {
    const nextRows = Array.isArray(rows) ? rows.filter(Boolean) : [];
    if (nextRows.length) return dedupeRows(nextRows);
    return dedupeRows(selectedCandidateRows.length ? selectedCandidateRows : candidateRows);
  };

  const notify = (rows, message) => {
    setSelectedRowKeys([]);
    toast.success(message, { description: `${rows.length} candidate${rows.length === 1 ? "" : "s"} updated.` });
  };

  const moveRows = (rows, stage, label) => {
    const next = resolveActionRows(rows);
    if (!next.length) return;
    next.forEach((row) => {
      updateApplication(row.id, { clientStatus: null }); // clearing keeps dropped→other moves clean
      setApplicationStage(row.id, stage);
    });
    notify(next, label);
  };

  const dropRows = (rows) => {
    const next = resolveActionRows(rows);
    if (!next.length) return;
    next.forEach((row) => {
      updateApplication(row.id, { clientStatus: "Candidate Dropped Off" });
      setApplicationStage(row.id, "rejected");
    });
    notify(next, "Candidates dropped");
  };

  const holdRows = (rows) => {
    const next = resolveActionRows(rows);
    if (!next.length) return;
    next.forEach((row) => updateApplication(row.id, { clientStatus: "On Hold" }));
    notify(next, "Candidates put on hold");
  };

  const handleDownloadRows = (rows) => {
    const next = resolveActionRows(rows);
    if (!next.length) return;
    next.forEach((row) => downloadCandidateResumeFile(row, job?.core?.title ?? ""));
    toast.success("Resume download prepared", { description: `${next.length} candidate${next.length === 1 ? "" : "s"} exported.` });
  };

  const handleOpenStartPreScreening = (rows) => {
    const next = resolveActionRows(rows);
    if (!next.length) return;
    setStartPreScreeningRows(next);
    setStartPreScreeningOpen(true);
  };

  const handleConfirmStartPreScreening = () => {
    moveRows(startPreScreeningRows, "prescreened", "Candidates moved to Pre-Screened");
    setStartPreScreeningOpen(false);
    setStartPreScreeningRows([]);
  };

  const handleOpenRejectConfirm = (rows) => {
    const next = resolveActionRows(rows);
    if (!next.length) return;
    setRejectRowsState(next);
    setRejectConfirmOpen(true);
  };

  const handleConfirmReject = () => {
    moveRows(rejectRowsState, "rejected", "Candidates rejected");
    setRejectConfirmOpen(false);
    setRejectRowsState([]);
  };

  // Handler bag passed into the stage config actions.
  const handlers = {
    openDetail: (kind, row) => setDetail({ open: true, kind, row }),
    download: handleDownloadRows,
    startPreScreen: handleOpenStartPreScreening,
    reject: handleOpenRejectConfirm,
    move: moveRows,
    drop: dropRows,
    onHold: holdRows,
  };

  if (!ready) {
    return <div className="px-6 py-8 md:px-8">Loading job workspace...</div>;
  }

  if (!job) {
    return (
      <div className="px-6 py-6 md:px-8">
        <Link href={ROUTES.jobs} className="inline-flex items-center gap-2 text-[14px] font-medium text-[var(--fx-text-muted)] hover:text-[var(--fx-text)]">
          <ArrowLeft className="size-4" />
          All Jobs
        </Link>
        <FxPanel className="mt-4 rounded-[16px]">
          <div className="flex items-start gap-3">
            <CircleUserRound className="mt-0.5 size-[18px] text-[var(--fx-text-muted)]" />
            <div className="space-y-2">
              <h2 className={FX_TYPOGRAPHY.cardTitle}>Job not found</h2>
              <p className={cn(FX_TYPOGRAPHY.body, "text-[var(--fx-text-muted)]")}>This job may have been deleted or the route is invalid.</p>
            </div>
          </div>
        </FxPanel>
      </div>
    );
  }

  const showBulk = config.selectable && config.bulk?.length > 0;
  const detailMeta = DETAIL_META[detail.kind] ?? DETAIL_META.candidate;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full min-h-0 flex-col gap-5 px-6 py-6 md:px-8">
        <FxPanel className="rounded-[16px]">
          {/* Job header / summary action row [Sree] */}
          <div className="flex flex-col gap-5 pb-[16px] xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <FxCellDot tone={FxStatusMeta(job).tone} title={FxStatusMeta(job).label} />
                <h1 className={cn(FX_TYPOGRAPHY.title, "min-w-0 truncate text-[var(--fx-text)]")}>{job.core.title}</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <FxAiButton size="sm" onClick={() => openAddCandidates("recommend")}>
                Recommend Candidates
              </FxAiButton>
              <FxButton variant="ghost" size="sm">
                <PhoneCall className="size-4" />
                Call Preview
              </FxButton>
              <FxButton variant="ghost" size="sm">
                <Share2 className="size-4" />
                Share Job
              </FxButton>
              <FxButton variant="ghost" size="sm" onClick={() => setIsEditJobOpen(true)}>
                <PencilLine className="size-4" />
                Edit Job
              </FxButton>
            </div>
          </div>

          <div className="flex flex-wrap gap-y-6 border-t border-[var(--fx-border-light)] px-6 py-4">
            <div className="pr-10"><MetaField label="Experience" value={experience} /></div>
            <div className="pr-10"><MetaField label="Employment Type" value={employmentType} /></div>
            <div className="pr-10">
              <MetaField label="Salary Range" value={<FxSalaryRangeCell range={job.roleSpec?.salaryRange} compact={false} />} />
            </div>
            <div className="pr-10"><MetaField label="Positions" value={String(job.roleSpec?.positions ?? 0)} /></div>
            <div className="pr-10"><MetaField label="Location" value={location} /></div>
            <div className="pr-10"><MetaField label="Publish Date" value={job.core.publishedAt ? new Date(job.core.publishedAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "Draft"} /></div>
            <div className="pr-10"><MetaField label="Question Format" value={questionFormat} /></div>
          </div>
        </FxPanel>

        <div className="flex min-h-0 flex-1 flex-col gap-4 pt-[24px]">
          <FxTabs
            variant="rounded"
            value={activeTab}
            onValueChange={changeTab}
            tabs={WORKSPACE_TABS.map((tab) => ({ ...tab, count: tabCounts[tab.value] ?? 0 }))}
            className="w-fit"
          />

          <FxWorkspaceTableFrame
            toolbar={
              <FxPageToolbar divider className="px-0">
                <FxPageToolbar.Row className="px-4 py-3">
                  <FxPageToolbar.Start>
                    <AgeFilterDropdown value={ageFilter} onChange={setAgeFilter} counts={ageCounts} />
                  </FxPageToolbar.Start>

                  <FxPageToolbar.End>
                    {showBulk ? (
                      <div className="hidden items-center gap-1 md:flex">
                        {config.bulk.map((id) => {
                          const action = ACTION_DEFS[id];
                          return (
                            <BulkIconButton
                              key={id}
                              icon={action.icon}
                              label={action.label}
                              tone={action.tone}
                              disabled={!selectedCandidateRows.length}
                              onClick={() => action.run(handlers, selectedCandidateRows)}
                            />
                          );
                        })}
                      </div>
                    ) : null}
                    <FxToolbarSearch
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search candidates"
                      className="w-full sm:w-[240px]"
                    />
                    <FxButton size="sm" onClick={() => openAddCandidates("add")}>Add Candidates</FxButton>
                  </FxPageToolbar.End>
                </FxPageToolbar.Row>
              </FxPageToolbar>
            }
          >
            {candidateRows.length ? (
              <StageTable
                key={activeTab}
                config={config}
                rows={candidateRows}
                handlers={handlers}
                selectedRowKeys={selectedRowKeys}
                onSelectedRowKeysChange={setSelectedRowKeys}
              />
            ) : (
              <EmptyState tab={activeTab} onAddCandidates={() => openAddCandidates("add")} />
            )}
          </FxWorkspaceTableFrame>
        </div>
      </div>

      <EvJobCreateSheet
        key={job.core.id}
        open={isEditJobOpen}
        initialJob={job}
        onOpenChange={setIsEditJobOpen}
        onCreate={(jobPayload, status) => {
          updateJob(job.core.id, jobPayload);
          if (status === "published") router.replace(`${pathname}?tab=${tabQueryValue(activeTab)}`);
        }}
      />
      <EvAddCandidatesSheet
        key={addCandidatesKey}
        open={addCandidatesOpen}
        onOpenChange={setAddCandidatesOpen}
        mode={addCandidatesMode}
        job={job}
        candidates={candidatePool}
        onPick={handlePickCandidate}
        onUpload={handleUploadResumes}
      />
      <EvStartPreScreeningSheet
        open={startPreScreeningOpen}
        onOpenChange={(open) => {
          setStartPreScreeningOpen(open);
          if (!open) setStartPreScreeningRows([]);
        }}
        candidates={startPreScreeningRows}
        onConfirm={handleConfirmStartPreScreening}
      />
      <FxConfirmDialog
        open={rejectConfirmOpen}
        onOpenChange={(open) => {
          setRejectConfirmOpen(open);
          if (!open) setRejectRowsState([]);
        }}
        title={`Reject ${rejectRowsState.length === 1 ? "candidate" : "candidates"}?`}
        description={
          rejectRowsState.length === 1
            ? `This will move "${rejectRowsState[0]?.candidateName ?? "this candidate"}" to the Rejected bucket.`
            : `This will move ${rejectRowsState.length} selected candidates to the Rejected bucket.`
        }
        confirmLabel="Reject"
        tone="danger"
        onConfirm={handleConfirmReject}
      />
      <FxSheet
        open={detail.open}
        onOpenChange={(open) => setDetail((current) => ({ ...current, open }))}
        side="right"
        size={detail.kind === "resume" ? "lg" : "md"}
        title={detailMeta.title(detail.row)}
        description={detailMeta.desc}
      >
        <DetailBody kind={detail.kind} row={detail.row} />
      </FxSheet>
    </TooltipProvider>
  );
}
