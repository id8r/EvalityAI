/* src/app/(workspace)/jobs/page.js | Jobs list — Ev data rebuilt on frozen FxUI | Sree | 2026-06-28 */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Plus, Pencil, Trash2 } from "lucide-react";

import { FxBadge, FxColumnManager, FxTable, useFxTable } from "@/components/FxUI/DataDisplay";
import { FxButton, FxToolbarSearch } from "@/components/FxUI/Forms";
import { FxPageToolbar } from "@/components/FxUI/Layout";
import { FxTabs } from "@/components/FxUI/Navigation";
import { getApplicationsByJob, getJobs } from "@/lib/EvData";
import { experienceLabel, jobClientName, jobLocationLabel, stageLabel } from "@/lib/EvSelectors";
import { ROUTES } from "@/lib/FxConstants";
import { useEvData } from "@/lib/useEvData";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

const STAGE_COLUMNS = [
  { key: "unscreened", label: stageLabel("unscreened") },
  { key: "pre_screened", label: stageLabel("pre_screened") },
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

function statusDotClass(status) {
  if (status === "published") return "bg-[var(--fx-success)]";
  if (status === "draft") return "bg-[var(--fx-warning)]";
  return "bg-[var(--fx-text-disabled)]";
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

function matchesJobSearch(row, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [row.id, row.title, row.client, row.location].filter(Boolean).some((value) => String(value).toLowerCase().includes(q));
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
/* - - - - - - - - - - - - - - - - */

export default function JobsPage() {
  const ready = useEvData();
  const router = useRouter();
  const [tab, setTab] = useState("active");
  const [query, setQuery] = useState("");

  const jobs = ready ? getJobs() : [];
  const activeCount = jobs.filter((job) => !job.core?.archivedAt).length;
  const archivedCount = jobs.filter((job) => job.core?.archivedAt).length;

  const rows = jobs
    .filter((job) => (tab === "archived" ? Boolean(job.core?.archivedAt) : !job.core?.archivedAt))
    .map((job) => {
      const clientName = jobClientName(job) ?? "Internal";
      const location = jobLocationLabel(job.roleSpec);
      const experience = experienceLabel(job.roleSpec);
      const lastActivity = getLatestActivity(job);
      const counts = getJobCounts(job.core.id);
      return {
        id: job.core.id,
        title: job.core.title,
        status: job.core.status,
        client: clientName,
        location,
        experience,
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
              router.push(ROUTES.jobWorkspace(row.id));
            }}
            className="flex min-w-0 items-center gap-2 text-left text-[var(--fx-text)] hover:text-[var(--fx-primary)]"
          >
            <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", statusDotClass(row.status))} />
            <span className="min-w-0 truncate font-medium">{row.title}</span>
          </button>
        ),
      },
      { key: "client", header: "Client", type: "text", sortable: true, sortType: "string", width: 180, minWidth: 150 },
      { key: "positions", header: "Positions", type: "number", align: "center", sortable: true, sortType: "number", width: 100, minWidth: 92 },
      { key: "location", header: "Location", type: "text", sortable: true, sortType: "string", width: 180, minWidth: 140 },
      { key: "experience", header: "Experience", type: "text", sortable: true, sortType: "string", width: 130, minWidth: 110 },
      ...STAGE_COLUMNS.map((stage) => ({
        key: stage.key,
        header: stage.label,
        sortable: true,
        sortType: "number",
        align: "center",
        width: 112,
        minWidth: 96,
        cell: (row) => {
          const count = row[stage.key] ?? 0;
          return (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                router.push(`${ROUTES.jobWorkspace(row.id)}?stage=${stage.key}`);
              }}
              aria-label={`${stage.label} stage for ${row.title}`}
              title={`Open ${stage.label} stage`}
              className="inline-flex justify-center"
            >
              <FxBadge tone={count > 0 ? "primary" : "subtle"} variant="soft" size="xs">
                {count}
              </FxBadge>
            </button>
          );
        },
      })),
      {
        key: "shared",
        header: "Shared",
        sortable: true,
        sortType: "number",
        align: "center",
        width: 96,
        minWidth: 88,
        cell: (row) => {
          const count = row.shared ?? 0;
          return (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                router.push(`${ROUTES.jobWorkspace(row.id)}?view=shared`);
              }}
              aria-label={`Shared pipeline for ${row.title}`}
              title="Open shared items"
              className="inline-flex justify-center"
            >
              <FxBadge tone={count > 0 ? "primary" : "subtle"} variant="soft" size="xs">
                {count}
              </FxBadge>
            </button>
          );
        },
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
            { label: "Edit Job", icon: Pencil, onClick: () => router.push(ROUTES.jobWorkspace(row.id)) },
            { label: "Archive Job", icon: Archive, separatorBefore: true },
            { label: "Delete Job", icon: Trash2, tone: "danger" },
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
  const createJob = () => {};

  return (
    <div className="px-6 py-6 md:px-8">
      <FxPageToolbar>
        <FxPageToolbar.Row>
          <FxPageToolbar.Start>
            <FxTabs
              variant="segmented"
              value={tab}
              onValueChange={setTab}
              tabs={[
                { value: "active", label: "Active", count: activeCount },
                { value: "archived", label: "Archived", count: archivedCount },
              ]}
            />
          </FxPageToolbar.Start>
          <FxPageToolbar.End>
            <FxToolbarSearch value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search jobs" />
            <FxButton disabled onClick={createJob} title="Create Job coming soon">
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
              <FxButton disabled onClick={createJob} title="Create Job coming soon">
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
              onRowClick={(row) => router.push(ROUTES.jobWorkspace(row.id))}
              emptyMessage={query ? "No jobs match your search." : "No jobs yet."}
            />
          </div>
        )}
      </div>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
