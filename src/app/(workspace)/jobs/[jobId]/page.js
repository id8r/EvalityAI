"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  PhoneCall,
  ChevronDown,
  CircleUserRound,
  Filter,
  MoreHorizontal,
  PencilLine,
  Share2,
  SquareCheckBig,
  Users,
} from "lucide-react";

import { FxAiButton, FxButton, FxIconButton, FxToolbarSearch } from "@/components/FxUI/Forms";
import { FxPageToolbar } from "@/components/FxUI/Layout";
import { FxTabs } from "@/components/FxUI/Navigation";
import { FxTable, FxDateCell, FxSalaryRangeCell, FxStackedCell, FxCellDot } from "@/components/FxUI/DataDisplay";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FxJobCreateSheet } from "@/components/FxUI/Overlays/FxJobCreateSheet";
import { getApplicationsByJob, getCandidate, getJob, updateJob } from "@/lib/EvData";
import { employmentTypeLabel, experienceLabel, jobLocationLabel, stageLabel } from "@/lib/EvSelectors";
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
    <div className="flex min-h-[340px] items-center justify-center rounded-[16px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-6 py-8">
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

function BulkIconButton({ icon: Icon, label }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <FxIconButton variant="ghost" size="sm" aria-label={label} title={label}>
          <Icon className="size-4" />
        </FxIconButton>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
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
  const [now] = useState(() => new Date().getTime());
  const [isEditJobOpen, setIsEditJobOpen] = useState(false);

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
  const stageRows = applications
    .map((app) => {
      const candidate = getCandidate(app.candidateId);
      const stage = stageForApplication(app);
      return {
        id: app.id,
        app,
        candidate,
        stage,
        candidateName: candidate?.name ?? "Unknown candidate",
        candidateEmail: candidate?.email ?? "—",
        currentTitle: candidate?.currentTitle ?? "",
        currentCompany: candidate?.currentCompany ?? "",
        location: candidate?.location ?? "—",
        appliedAt: app.appliedAt,
        updatedAt: app.updatedAt,
      };
    })
    .filter((row) => row.stage === activeTab)
    .filter((row) => matchesSearch(row.candidate, row.app, searchTerm));

  const candidateRows = stageRows.filter((row) => matchesAgeFilter(row.appliedAt, ageFilter));

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

  const columns = useMemo(
    () => [
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
          <FxStackedCell
            primary={row.candidateName}
            secondary={[row.currentTitle, row.currentCompany].filter(Boolean).join(" · ") || row.candidateEmail}
          />
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
    ],
    [],
  );

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
              <FxAiButton size="sm">
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

        <div className="min-h-0 flex-1 space-y-4 pt-[24px]">
          <FxTabs
            variant="rounded"
            value={activeTab}
            onValueChange={(value) => {
              const nextTab = resolveTab(value);
              const next = new URLSearchParams(searchParams.toString());
              next.set("tab", tabQueryValue(nextTab));
              router.push(`${pathname}?${next.toString()}`);
            }}
            tabs={WORKSPACE_TABS.map((tab) => ({ ...tab, count: tabCounts[tab.value] ?? 0 }))}
            className="w-fit"
          />

          <FxPageToolbar sticky divider>
            <FxPageToolbar.Row>
              <FxPageToolbar.Start>
                <AgeFilterDropdown value={ageFilter} onChange={setAgeFilter} counts={ageCounts} />
              </FxPageToolbar.Start>

              <FxPageToolbar.End>
                <div className="hidden items-center gap-1 md:flex">
                  <BulkIconButton icon={SquareCheckBig} label="Select all" />
                  <BulkIconButton icon={ArrowRight} label="Bulk move" />
                  <BulkIconButton icon={MoreHorizontal} label="More actions" />
                </div>
                <FxToolbarSearch
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search candidates"
                  className="w-full sm:w-[240px]"
                />
                <FxButton size="sm">Add Candidates</FxButton>
              </FxPageToolbar.End>
            </FxPageToolbar.Row>
          </FxPageToolbar>

          <div className="min-h-0">
            {candidateRows.length ? (
              <FxTable
                rows={candidateRows}
                columns={columns}
                getRowId={(row) => row.id}
                className="h-[calc(100dvh-360px)] min-h-[340px]"
                surfaceClassName="rounded-[16px] border border-[var(--fx-border)] bg-[var(--fx-surface)]"
                stickyHeader
                scrollX
                emptyMessage="No candidates yet."
              />
            ) : (
              <EmptyState tab={activeTab} onAddCandidates={() => {}} />
            )}
          </div>
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
    </TooltipProvider>
  );
}
