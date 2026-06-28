/* src/app/(workspace)/jobs/page.js | Jobs list — Ev data rebuilt on frozen FxUI | Sree | 2026-06-28 */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Archive, Plus } from "lucide-react";

import { FxColumnManager, FxTable, useFxTable } from "@/components/FxUI/DataDisplay";
import { FxButton, FxToolbarSearch } from "@/components/FxUI/Forms";
import { FxPageToolbar } from "@/components/FxUI/Layout";
import { FxTabs } from "@/components/FxUI/Navigation";
import { FxDialog } from "@/components/FxUI/Overlays";
import { FxJobCreateSheet } from "@/components/FxUI/Overlays/FxJobCreateSheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { archiveJob, createJob as createJobRecord, deleteJob, getApplicationsByJob, getJobs, restoreJob, updateJob } from "@/lib/EvData";
import { stageLabel, workplaceTypeLabel } from "@/lib/EvSelectors";
import { ROUTES } from "@/lib/FxConstants";
import { cn, FxStatusMeta } from "@/lib/FxUtils";
import { useEvData } from "@/lib/useEvData";
/* - - - - - - - - - - - - - - - - */

const STAGE_COLUMNS = [
  { key: "unscreened", label: stageLabel("unscreened") },
  // Jobs-list summary labels the pre_screened stage "Screened" (shorter than the workspace tab).
  { key: "pre_screened", label: "Screened" },
  { key: "shortlisted", label: stageLabel("shortlisted") },
];

function getJobCounts(jobId) {
  const counts = { unscreened: 0, pre_screened: 0, shortlisted: 0, shared: 0 };
  for (const app of getApplicationsByJob(jobId)) {
    if (counts[app.stage] != null) counts[app.stage] += 1;
    if (app.clientShare?.sharedAt || app.clientStatus != null) counts.shared += 1;
  }
  return counts;
}

function formatRelativeTime(value) {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "—";

  const diffMs = Math.max(0, Date.now() - timestamp);
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 60) return `${Math.max(1, diffMinutes)} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function getLatestActivity(job) {
  const appTimes = getApplicationsByJob(job.core.id)
    .map((app) => app.updatedAt)
    .filter(Boolean);
  const timestamps = [job.core?.updatedAt, ...appTimes].filter(Boolean).sort();
  return timestamps.at(-1) ?? job.core?.updatedAt ?? null;
}

function jobPlaceLabel(roleSpec) {
  if (!roleSpec) return "N/A";
  if (roleSpec.workplaceType === "remote") return "Remote";
  const place = [roleSpec.locality, roleSpec.city].filter(Boolean).join(", ");
  return place || "N/A";
}

function matchesJobSearch(row, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [row.id, row.title, row.location].filter(Boolean).some((value) => String(value).toLowerCase().includes(q));
}

function EmptyStateCard({ icon: Icon, title, body, action }) {
  return (
    <div className="flex h-full min-h-[420px] items-center justify-center rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-6 py-8">
      <div className="max-w-[460px] space-y-4 text-center">
        <div className="mx-auto flex size-[48px] items-center justify-center rounded-full bg-[var(--fx-bg-soft)] text-[var(--fx-primary)]">
          <Icon className="size-[22px]" />
        </div>
        <div className="space-y-2">
          <p className="text-[20px] font-semibold leading-[28px] text-[var(--fx-text)]">{title}</p>
          <p className="text-[14px] leading-[22px] text-[var(--fx-text-muted)]">{body}</p>
        </div>
        {action ? <div className="flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}

function StatusDot({ job }) {
  const meta = FxStatusMeta(job);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn("inline-flex size-[8px] shrink-0 cursor-default rounded-full", meta.toneClassName)}
          aria-label={meta.label}
          role="img"
        />
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6} className="max-w-[220px] whitespace-pre-line">
        {meta.missingEvaluationContext ? (
          <div className="space-y-[2px]">
            <div className="text-[14px] font-medium leading-[22px] text-[var(--fx-text)]">Published</div>
            <div className="text-[13px] leading-[20px] text-[var(--fx-danger)]">Evaluation context missing</div>
          </div>
        ) : (
          meta.label
        )}
      </TooltipContent>
    </Tooltip>
  );
}
/* - - - - - - - - - - - - - - - - */

export default function JobsPage() {
  const ready = useEvData();
  const router = useRouter();
  const [tab, setTab] = useState("active");
  const [query, setQuery] = useState("");
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [createSheetKey, setCreateSheetKey] = useState(0);
  const [editingJob, setEditingJob] = useState(null);
  const [pendingDeleteJob, setPendingDeleteJob] = useState(null);

  const jobs = ready ? getJobs() : [];
  const activeCount = jobs.filter((job) => !job.core?.archivedAt).length;
  const archivedCount = jobs.filter((job) => job.core?.archivedAt).length;

  const rows = jobs
    .filter((job) => (tab === "archived" ? Boolean(job.core?.archivedAt) : !job.core?.archivedAt))
    .map((job) => {
      const location = jobPlaceLabel(job.roleSpec);
      const workplaceType = workplaceTypeLabel(job.roleSpec?.workplaceType);
      const lastActivity = getLatestActivity(job);
      const counts = getJobCounts(job.core.id);
      return {
        id: job.core.id,
        job,
        title: job.core.title,
        status: job.core.status,
        location,
        workplaceType,
        positions: job.roleSpec?.positions ?? 0,
        lastActivity,
        archived: Boolean(job.core?.archivedAt),
        ...counts,
      };
    })
    .filter((row) => matchesJobSearch(row, query));

  const columns = useMemo(
    () => [
      {
        key: "title",
        header: "Job Title",
        sortable: true,
        sortType: "string",
        width: 260,
        minWidth: 220,
        grow: 1,
        sticky: "left",
        locked: true,
        cell: (row) => (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              if (row.status === "draft") {
                handleEditJob(row.job);
                return;
              }
              router.push(ROUTES.jobWorkspace(row.id, "unscreened"));
            }}
            className="flex min-w-0 items-center gap-2 text-left text-[var(--fx-text)] hover:text-[var(--fx-primary)]"
          >
            <StatusDot job={row.job} />
            <span className="min-w-0 truncate font-medium">{row.title}</span>
          </button>
        ),
      },
      { key: "positions", header: "Positions", type: "number", align: "center", sortable: true, sortType: "number", width: 100, minWidth: 92 },
      {
        key: "location",
        header: "Location",
        type: "stacked",
        sortable: false,
        width: 180,
        minWidth: 140,
        cellProps: (row) => ({ primary: row.location, secondary: row.workplaceType || null }),
      },
      ...STAGE_COLUMNS.map((stage) => ({
        key: stage.key,
        header: stage.label,
        type: "number",
        sortable: true,
        sortType: "number",
        align: "center",
        width: 112,
        minWidth: 96,
        cellProps: (row) => ({
          href: ROUTES.jobWorkspace(row.id, stage.key === "pre_screened" ? "prescreened" : stage.key),
          title: `Open ${stage.label} stage`,
        }),
      })),
      {
        key: "shared",
        header: "Shared",
        type: "number",
        sortable: true,
        sortType: "number",
        align: "center",
        width: 96,
        minWidth: 88,
        cellProps: (row) => ({
          href: ROUTES.jobWorkspace(row.id, "sentToClient"),
          title: `Open shared items for ${row.title}`,
        }),
      },
      {
        key: "lastActivity",
        header: "Last Activity",
        type: "date",
        sortable: true,
        sortType: "date",
        width: 128,
        minWidth: 116,
        cell: (row) => {
          if (!row.lastActivity) return <span className="text-[var(--fx-text-muted)]">—</span>;
          return (
            <span title={new Date(row.lastActivity).toLocaleString()} className="text-[var(--fx-text-muted)]">
              {formatRelativeTime(row.lastActivity)}
            </span>
          );
        },
      },
      {
        key: "actions",
        header: "Actions/Menu",
        menuLabel: "Actions/Menu",
        type: "actions",
        align: "center",
        width: 56,
        resizable: false,
        sticky: "right",
        locked: true,
        cellProps: (row) => ({
          align: "center",
          items: [
            { label: "View Candidates", href: ROUTES.jobWorkspace(row.id, "unscreened") },
            { label: "Edit Job", onClick: () => handleEditJob(row.job) },
            row.archived
              ? {
                  label: "Restore Job",
                  separatorBefore: true,
                  onClick: () => {
                    restoreJob(row.id);
                    toast.success("Job restored", { description: `"${row.title}" moved back to Active.` });
                  },
                }
              : {
                  label: "Archive Job",
                  separatorBefore: true,
                  onClick: () => {
                    archiveJob(row.id);
                    toast.success("Job archived", { description: `"${row.title}" moved to Archived.` });
                  },
                },
            { label: "Delete Job", tone: "danger", onClick: () => setPendingDeleteJob({ id: row.id, title: row.title }) },
          ],
        }),
      },
    ],
    [router],
  );

  // Keep the table wide and scrollable. The column manager can hide/reorder columns if a narrower view is needed.
  const table = useFxTable({
    rows,
    columns,
    getRowId: (row) => row.id,
    defaultSort: { key: "lastActivity", direction: "desc" },
  });

  const showArchivedEmptyState = tab === "archived" && archivedCount === 0 && !query.trim();
  const showActiveEmptyState = tab === "active" && activeCount === 0 && !query.trim();
  function handleCreateJob() {
    setEditingJob(null);
    setCreateSheetKey((current) => current + 1);
    setIsCreateSheetOpen(true);
  }

  function handleEditJob(job) {
    setEditingJob(job);
    setCreateSheetKey((current) => current + 1);
    setIsCreateSheetOpen(true);
  }

  function handleCreateJobSubmit(jobPayload, status, sourceJob) {
    const nextJob = sourceJob?.core?.id ? updateJob(sourceJob.core.id, jobPayload) : createJobRecord(jobPayload);
    if (status === "published") {
      toast.success(sourceJob?.core?.id ? "Job updated" : "Job published", { description: `Changes to "${nextJob.core.title}" saved.` });
      router.push(ROUTES.jobWorkspace(nextJob.core.id, "unscreened"));
    }
    return nextJob;
  }

  const confirmDeleteJob = () => {
    if (!pendingDeleteJob?.id) return;
    deleteJob(pendingDeleteJob.id);
    setPendingDeleteJob(null);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="px-6 py-6 md:px-8">
        <FxPageToolbar>
          <FxPageToolbar.Row>
            <FxPageToolbar.Start>
              <FxTabs
                variant="rounded"
                value={tab}
                onValueChange={setTab}
                tabs={[
                  { value: "active", label: `Active (${activeCount})` },
                  { value: "archived", label: `Archived (${archivedCount})` },
                ]}
              />
            </FxPageToolbar.Start>
            <FxPageToolbar.End>
              <FxToolbarSearch value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search jobs" />
              <FxButton variant="accent" size="sm" onClick={handleCreateJob}>
                Create Job
              </FxButton>
            </FxPageToolbar.End>
          </FxPageToolbar.Row>
        </FxPageToolbar>

        <div className="mt-3 flex min-h-0 flex-col gap-3">
          {showArchivedEmptyState ? (
            <EmptyStateCard
              icon={Archive}
              title="No archived jobs yet"
              body="Archive filled, closed, or inactive roles to keep your active workspace focused. Archived jobs can be restored later."
            />
          ) : showActiveEmptyState ? (
            <EmptyStateCard
              icon={Plus}
              title="No jobs yet"
              body="Create the first job to start tracking applicants, screening stages, and candidate activity."
              action={
                <FxButton variant="accent" onClick={handleCreateJob}>
                  Create Job
                </FxButton>
              }
            />
          ) : (
            <div className="h-[calc(100dvh-180px)]">
              <FxTable
                controller={table}
                className="h-full"
                sortable
                resizable
                stickyHeader
                scrollX
                loading={!ready}
                columnManager={<FxColumnManager controller={table} variant="icon" align="right" />}
                onRowClick={(row) => {
                  if (row.status === "draft") {
                    handleEditJob(row.job);
                    return;
                  }
                  router.push(ROUTES.jobWorkspace(row.id, "unscreened"));
                }}
                emptyMessage={query ? "No jobs match your search." : "No jobs yet."}
              />
            </div>
          )}
        </div>
      </div>
      <FxJobCreateSheet
        key={createSheetKey}
        open={isCreateSheetOpen}
        onOpenChange={setIsCreateSheetOpen}
        onCreate={handleCreateJobSubmit}
        initialJob={editingJob}
      />
      <FxDialog
        open={Boolean(pendingDeleteJob)}
        onOpenChange={(open) => !open && setPendingDeleteJob(null)}
        title="Delete Job?"
        description={`This will permanently delete "${pendingDeleteJob?.title ?? ""}".`}
        showClose={false}
        className="max-w-[520px]"
        footer={
          <>
            <FxButton variant="outline" size="sm" onClick={() => setPendingDeleteJob(null)}>
              Cancel
            </FxButton>
            <FxButton variant="destructive" size="sm" onClick={confirmDeleteJob}>
              Delete Job
            </FxButton>
          </>
        }
      />
    </TooltipProvider>
  );
}
/* - - - - - - - - - - - - - - - - */
