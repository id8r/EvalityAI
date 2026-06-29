"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  Ban,
  Download,
  Mail,
  PhoneCall,
  ChevronDown,
  CircleUserRound,
  Filter,
  PencilLine,
  Share2,
  Users,
} from "lucide-react";

import { FxAiButton, FxButton, FxIconButton, FxToolbarSearch } from "@/components/FxUI/Forms";
import { FxPageToolbar, FxWorkspaceTableFrame } from "@/components/FxUI/Layout";
import { FxTabs } from "@/components/FxUI/Navigation";
import { FxTable, FxDateCell, FxSalaryRangeCell, FxStackedCell, FxActionsCell, FxColumnManager, FxCellDot, useFxTable } from "@/components/FxUI/DataDisplay";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FxJobCreateSheet } from "@/components/FxUI/Overlays/FxJobCreateSheet";
import { FxAddCandidatesSheet } from "@/components/FxUI/Overlays/FxAddCandidatesSheet";
import { FxConfirmDialog } from "@/components/FxUI/Overlays/FxConfirmDialog";
import { FxDialog } from "@/components/FxUI/Overlays/FxDialog";
import { FxStartPreScreeningSheet } from "@/components/FxUI/Overlays/FxStartPreScreeningSheet";
import { createApplication, getApplicationsByJob, getCandidate, getCandidates, getJob, setApplicationStage, updateJob } from "@/lib/EvData";
import { employmentTypeLabel, experienceLabel, jobLocationLabel, stageLabel } from "@/lib/EvSelectors";
import { formatMoney } from "@/lib/EvFormat";
import { FxPanel } from "@/components/FxUI/Layout/FxPanel";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { ROUTES } from "@/lib/FxConstants";
import { cn, FxStatusMeta } from "@/lib/FxUtils";
import { useEvData } from "@/lib/useEvData";

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
  return [
    candidate?.name,
    candidate?.email,
    candidate?.currentTitle,
    candidate?.currentCompany,
    candidate?.location,
    app?.id,
    app?.clientStatus,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(q));
}

function matchesAgeFilter(appliedAt, filter) {
  if (filter === "all") return true;
  const time = new Date(appliedAt).getTime();
  if (Number.isNaN(time)) return false;
  const diffDays = Math.floor((Date.now() - time) / 86400000);
  if (filter === "fresh") return diffDays < 7;
  if (filter === "15_days") return diffDays < 15;
  if (filter === "30_days") return diffDays < 30;
  if (filter === "2_months") return diffDays < 60;
  if (filter === "3_months") return diffDays < 90;
  return true;
}

function getStatusTone(job) {
  const isDraft = job?.core?.status === "draft";
  const missingEvaluationContext = job?.core?.status === "published" && !String(job?.evaluationConfig?.evaluationContext ?? "").trim();
  if (isDraft) return { label: "Draft", tone: "warning", missingEvaluationContext: false };
  if (missingEvaluationContext) return { label: "Published", tone: "danger", missingEvaluationContext: true };
  return { label: "Published", tone: "success", missingEvaluationContext: false };
}

function statusToneForStage(stage) {
  if (stage === "unscreened") return "subtle";
  if (stage === "prescreened") return "success";
  if (stage === "shortlisted") return "success";
  if (stage === "interviewing") return "warning";
  if (stage === "offered") return "warning";
  if (stage === "joined") return "success";
  if (stage === "dropped") return "danger";
  if (stage === "rejected") return "danger";
  return "neutral";
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
          className={cn(
            tone === "danger" ? "text-[var(--fx-danger)]" : tone === "accent" ? "text-[var(--fx-primary)]" : "text-[var(--fx-text-muted)]",
          )}
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

export default function JobWorkspacePage() {
  const ready = useEvData();
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [ageFilter, setAgeFilter] = useState("all");
  const [now] = useState(() => new Date().getTime());
  const [isEditJobOpen, setIsEditJobOpen] = useState(false);
  const [addCandidatesOpen, setAddCandidatesOpen] = useState(false);
  const [addCandidatesMode, setAddCandidatesMode] = useState("add");
  const [addCandidatesKey, setAddCandidatesKey] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [candidatePreviewOpen, setCandidatePreviewOpen] = useState(false);
  const [candidatePreviewRow, setCandidatePreviewRow] = useState(null);
  const [startPreScreeningOpen, setStartPreScreeningOpen] = useState(false);
  const [startPreScreeningRows, setStartPreScreeningRows] = useState([]);
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
  const [rejectRows, setRejectRows] = useState([]);

  const jobId = String(params?.jobId ?? "");
  const requestedTab = searchParams.get("tab");
  const activeTab = resolveTab(requestedTab);

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

  const candidateRows = stageRows.filter((row) => matchesAgeFilter(row.appliedAt, ageFilter));
  const selectedCandidateRows = candidateRows.filter((row) => selectedRowKeys.includes(row.id));

  const tabCounts = Object.fromEntries(WORKSPACE_TABS.map((tab) => [tab.value, 0]));
  for (const app of applications) {
    const stage = stageForApplication(app);
    if (tabCounts[stage] != null) tabCounts[stage] += 1;
  }

  const ageCounts = { all: stageRows.length, fresh: 0, "15_days": 0, "30_days": 0, "2_months": 0, "3_months": 0 };
  for (const row of stageRows) {
    const diffDays = Math.floor(Math.max(0, now - new Date(row.appliedAt).getTime()) / 86400000);
    if (diffDays < 7) ageCounts.fresh += 1;
    if (diffDays < 15) ageCounts["15_days"] += 1;
    if (diffDays < 30) ageCounts["30_days"] += 1;
    if (diffDays < 60) ageCounts["2_months"] += 1;
    if (diffDays < 90) ageCounts["3_months"] += 1;
  }

  // Pool for the Add/Recommend sheet: candidates not already attached to this job.
  const appliedCandidateIds = new Set(applications.map((app) => app.candidateId));
  const candidatePool = ready ? getCandidates().filter((candidate) => !candidate.archivedAt && !appliedCandidateIds.has(candidate.id)) : [];

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

  const resolveActionRows = (rows) => {
    const nextRows = Array.isArray(rows) ? rows.filter(Boolean) : [];
    if (nextRows.length) return nextRows;
    return selectedCandidateRows.length ? selectedCandidateRows : candidateRows;
  };

  const applyStageChange = (rows, stage, successLabel) => {
    const nextRows = resolveActionRows(rows);
    const uniqueRows = Array.from(new Map(nextRows.map((row) => [row.id, row])).values());

    if (!uniqueRows.length) return;

    uniqueRows.forEach((row) => {
      setApplicationStage(row.id, stage);
    });

    setSelectedRowKeys([]);
    toast.success(successLabel, { description: `${uniqueRows.length} candidate${uniqueRows.length === 1 ? "" : "s"} updated.` });
  };

  const handleOpenCandidatePreview = (row) => {
    if (!row) return;
    setCandidatePreviewRow(row);
    setCandidatePreviewOpen(true);
  };

  const handleOpenStartPreScreening = (rows) => {
    const nextRows = resolveActionRows(rows);
    if (!nextRows.length) return;
    setStartPreScreeningRows(nextRows);
    setStartPreScreeningOpen(true);
  };

  const handleConfirmStartPreScreening = () => {
    applyStageChange(startPreScreeningRows, "prescreened", "Candidates moved to Pre-Screened");
    setStartPreScreeningOpen(false);
    setStartPreScreeningRows([]);
  };

  const handleOpenRejectConfirm = (rows) => {
    const nextRows = resolveActionRows(rows);
    if (!nextRows.length) return;
    setRejectRows(nextRows);
    setRejectConfirmOpen(true);
  };

  const handleConfirmReject = () => {
    applyStageChange(rejectRows, "rejected", "Candidates rejected");
    setRejectConfirmOpen(false);
    setRejectRows([]);
  };

  const handleDownloadRows = (rows) => {
    const nextRows = resolveActionRows(rows);
    if (!nextRows.length) return;
    nextRows.forEach((row) => downloadCandidateResumeFile(row, job?.core?.title ?? ""));
    toast.success("Resume download prepared", { description: `${nextRows.length} candidate${nextRows.length === 1 ? "" : "s"} exported.` });
  };

  const legacyColumns = [
    {
      key: "candidate",
      header: "Candidate",
      sticky: "left",
      locked: true,
      grow: 1,
      minWidth: 240,
      width: 320,
      sortable: false,
      cell: (row) => (
        <FxStackedCell primary={row.candidateName} secondary={[row.currentTitle, row.currentCompany].filter(Boolean).join(" · ") || row.candidateEmail} />
      ),
    },
    {
      key: "stage",
      header: "Stage",
      width: 140,
      minWidth: 120,
      align: "center",
      type: "badge",
      accessor: (row) => TAB_LABEL_BY_VALUE[row.stage] ?? row.stage,
      cellProps: (row) => ({
        value: TAB_LABEL_BY_VALUE[row.stage] ?? row.stage,
        tone: statusToneForStage(row.stage),
        variant: "soft",
      }),
    },
    {
      key: "appliedAt",
      header: "Applied",
      width: 140,
      minWidth: 120,
      align: "center",
      type: "date",
      cell: (row) => <FxDateCell value={row.appliedAt} mode="relative" />,
    },
    {
      key: "updatedAt",
      header: "Updated",
      width: 140,
      minWidth: 120,
      align: "center",
      type: "date",
      cell: (row) => <FxDateCell value={row.updatedAt} mode="relative" />,
    },
  ];

  const unscreenedColumns = [
    {
      key: "name",
      header: "Name",
      sticky: "left",
      locked: true,
      grow: 1,
      minWidth: 220,
      width: 280,
      sortable: true,
      sortAccessor: (row) => row.candidateName ?? "",
      cell: (row) => <span className="block min-w-0 truncate font-medium text-[var(--fx-primary)]">{row.candidateName}</span>,
    },
    {
      key: "phone",
      header: "Phone",
      width: 160,
      minWidth: 140,
      sortable: false,
      cell: (row) =>
        row.phone ? (
          <a href={`tel:${String(row.phone).replace(/[^\d+]/g, "")}`} className="truncate text-[var(--fx-text)] hover:text-[var(--fx-primary)]">
            {String(row.phone)}
          </a>
        ) : (
          <span className="text-[var(--fx-text-muted)]">—</span>
        ),
    },
    {
      key: "email",
      header: "Email",
      width: 240,
      minWidth: 220,
      grow: 1,
      sortable: false,
      defaultVisible: false,
      cell: (row) => <span className="truncate text-[var(--fx-text)]">{row.email || "—"}</span>,
    },
    {
      key: "matchScore",
      header: "Match Score",
      width: 112,
      minWidth: 100,
      align: "center",
      type: "score",
      sortable: true,
      sortType: "number",
      cellProps: (row) => ({
        value: row.matchScore,
        tone: row.matchScore == null ? "primary" : row.matchScore >= 80 ? "success" : row.matchScore >= 60 ? "warning" : "danger",
      }),
    },
    {
      key: "experience",
      header: "Experience",
      width: 112,
      minWidth: 100,
      align: "center",
      sortable: true,
      sortType: "number",
      cell: (row) => <span className="tabular-nums text-[var(--fx-text)]">{row.experience != null && row.experience !== "" ? `${row.experience}y` : "—"}</span>,
    },
    {
      key: "currentSalary",
      header: "Current CTC",
      width: 138,
      minWidth: 128,
      align: "right",
      sortable: true,
      sortType: "number",
      sortAccessor: (row) => row.currentSalary?.amount ?? row.currentSalary ?? null,
      cell: (row) => (
        <span className="tabular-nums text-[var(--fx-text)]">
          {row.currentSalary?.amount != null || Number.isFinite(Number(row.currentSalary))
            ? formatMoney(row.currentSalary?.amount ?? row.currentSalary, row.currentSalaryCurrency)
            : "—"}
        </span>
      ),
    },
    {
      key: "expectedSalary",
      header: "Expected CTC",
      width: 138,
      minWidth: 128,
      align: "right",
      sortable: true,
      sortType: "number",
      sortAccessor: (row) => row.expectedSalary?.amount ?? row.expectedSalary ?? null,
      cell: (row) => (
        <span className="tabular-nums text-[var(--fx-text)]">
          {row.expectedSalary?.amount != null || Number.isFinite(Number(row.expectedSalary))
            ? formatMoney(row.expectedSalary?.amount ?? row.expectedSalary, row.expectedSalaryCurrency)
            : "—"}
        </span>
      ),
    },
    {
      key: "availability",
      header: "Availability",
      width: 124,
      minWidth: 112,
      align: "center",
      sortable: true,
      sortType: "number",
      cell: (row) => <span className="text-[var(--fx-text)]">{row.availabilityDays == null ? "—" : `${row.availabilityDays} days`}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      width: 108,
      minWidth: 104,
      maxWidth: 116,
      align: "right",
      sticky: "right",
      locked: true,
      hideable: false,
      sortable: false,
      cell: (row) => (
        <FxActionsCell
          inline={[
            { icon: Eye, label: "View Candidate", onClick: () => handleOpenCandidatePreview(row) },
            { icon: Mail, label: "Start Pre-Screening", onClick: () => handleOpenStartPreScreening([row]) },
          ]}
        />
      ),
    },
    {
      key: "menuActions",
      header: "",
      width: 56,
      minWidth: 56,
      maxWidth: 56,
      align: "center",
      sticky: "right",
      locked: true,
      hideable: false,
      sortable: false,
      cell: (row) => (
        <FxActionsCell
          items={[
            { label: "View Candidate", onClick: () => handleOpenCandidatePreview(row) },
            { label: "Download Resume", onClick: () => handleDownloadRows([row]) },
            { label: "Reject Candidate", tone: "danger", onClick: () => handleOpenRejectConfirm([row]) },
          ]}
          menuLabel={`Row actions for ${row.candidateName}`}
        />
      ),
    },
  ];

  const tableColumns = activeTab === "unscreened" ? unscreenedColumns : legacyColumns;
  const table = useFxTable({
    rows: candidateRows,
    columns: tableColumns,
    enableRowSelection: activeTab === "unscreened",
    selectedRowKeys,
    onSelectedRowKeysChange: setSelectedRowKeys,
    defaultVisibleColumnKeys:
      activeTab === "unscreened"
        ? ["name", "phone", "matchScore", "experience", "currentSalary", "expectedSalary", "availability", "actions", "menuActions"]
        : undefined,
    defaultSort: activeTab === "unscreened" ? { key: "matchScore", direction: "desc" } : null,
  });

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
            onValueChange={(value) => {
              const nextTab = resolveTab(value);
              if (nextTab !== "unscreened") {
                setSelectedRowKeys([]);
              }
              const next = new URLSearchParams(searchParams.toString());
              next.set("tab", tabQueryValue(nextTab));
              router.push(`${pathname}?${next.toString()}`);
            }}
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
                    <div className="hidden items-center gap-1 md:flex">
                      <BulkIconButton
                        icon={Mail}
                        label="Start Pre-Screening"
                        tone="accent"
                        disabled={!selectedCandidateRows.length}
                        onClick={() => handleOpenStartPreScreening(selectedCandidateRows)}
                      />
                      <BulkIconButton
                        icon={Ban}
                        label="Reject"
                        tone="danger"
                        disabled={!selectedCandidateRows.length}
                        onClick={() => handleOpenRejectConfirm(selectedCandidateRows)}
                      />
                      <BulkIconButton
                        icon={Download}
                        label="Download Resume"
                        tone="accent"
                        disabled={!selectedCandidateRows.length}
                        onClick={() => handleDownloadRows(selectedCandidateRows)}
                      />
                    </div>
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
                <FxTable
                  controller={table}
                  getRowId={(row) => row.id}
                  className="h-full min-h-0"
                  surfaceClassName="rounded-none border-0 bg-transparent"
                  sortable
                  stickyHeader
                  scrollX
                  columnManager={
                    // Keep the column picker in the last header cell next to Actions.
                    // Do not move this back into the toolbar; that breaks the old workspace pattern.
                    activeTab === "unscreened" ? <FxColumnManager controller={table} variant="icon" align="right" /> : undefined
                  }
                  emptyMessage="No candidates yet."
                />
              ) : (
                <EmptyState tab={activeTab} onAddCandidates={() => openAddCandidates("add")} />
              )}
          </FxWorkspaceTableFrame>
        </div>
      </div>
      <FxJobCreateSheet
        key={job.core.id}
        open={isEditJobOpen}
        initialJob={job}
        onOpenChange={setIsEditJobOpen}
        onCreate={(jobPayload, status) => {
          updateJob(job.core.id, jobPayload);
          if (status === "published") router.replace(`${pathname}?tab=${tabQueryValue(activeTab)}`);
        }}
      />
      <FxAddCandidatesSheet
        key={addCandidatesKey}
        open={addCandidatesOpen}
        onOpenChange={setAddCandidatesOpen}
        mode={addCandidatesMode}
        job={job}
        candidates={candidatePool}
        onPick={handlePickCandidate}
        onUpload={handleUploadResumes}
      />
      <FxStartPreScreeningSheet
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
          if (!open) setRejectRows([]);
        }}
        title={`Reject ${rejectRows.length === 1 ? "candidate" : "candidates"}?`}
        description={
          rejectRows.length === 1
            ? `This will move "${rejectRows[0]?.candidateName ?? "this candidate"}" to the Rejected bucket.`
            : `This will move ${rejectRows.length} selected candidates to the Rejected bucket.`
        }
        confirmLabel="Reject"
        tone="danger"
        onConfirm={handleConfirmReject}
      />
      <FxDialog
        open={candidatePreviewOpen}
        onOpenChange={(open) => {
          setCandidatePreviewOpen(open);
          if (!open) setCandidatePreviewRow(null);
        }}
        title={candidatePreviewRow?.candidateName ?? "Candidate"}
        description="Quick candidate preview."
        className="max-w-[560px]"
      >
        {candidatePreviewRow ? (
          <div className="space-y-3">
            <div className="rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4">
              <div className="space-y-2">
                <div className="text-[14px] font-medium text-[var(--fx-text)]">{candidatePreviewRow.candidateName}</div>
                <div className="text-[13px] text-[var(--fx-text-muted)]">{candidatePreviewRow.currentTitle || "—"}</div>
                <div className="text-[13px] text-[var(--fx-text-muted)]">{candidatePreviewRow.currentCompany || "—"}</div>
                <div className="text-[13px] text-[var(--fx-text-muted)]">{candidatePreviewRow.email || "—"}</div>
                <div className="text-[13px] text-[var(--fx-text-muted)]">{candidatePreviewRow.phone || "—"}</div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <FxButton variant="outline" size="sm" onClick={() => handleOpenStartPreScreening([candidatePreviewRow])}>
                Start Pre-Screening
              </FxButton>
            </div>
          </div>
        ) : null}
      </FxDialog>
    </TooltipProvider>
  );
}
