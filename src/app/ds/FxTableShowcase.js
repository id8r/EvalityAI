/* src/app/ds/FxTableShowcase.js | DS-only FxTable showcase (local mock data) | Sree | 2026-06-26 */

"use client";

import { useMemo, useState } from "react";
import { Archive, Eye, Pencil, Share2, Trash2 } from "lucide-react";

import { FxTable } from "@/components/FxUI/DataDisplay";
import { FxButton } from "@/components/FxUI/Forms";
/* - - - - - - - - - - - - - - - - */

/*
  LOCAL DS MOCK ONLY. These rows exist solely to demonstrate FxTable behaviour and every
  cell type. They are intentionally NOT canonical seed data — product data (FxCandidates.json
  etc.) is frozen separately later and Jobs/Candidates/Clients are not wired here.
*/
const SHOWCASE_ROWS = [
  { id: "c1", name: "Aanya Sharma", role: "Senior Frontend Engineer", status: "Shortlisted", matchScore: 92, experience: 8, currentSalary: 120000, expectedSalary: 145000, availabilityDays: 14, schedulePrimary: "Tech Round · Thu 3:00 PM", scheduleSecondary: "with Priya Menon", lastActivity: "2026-06-26T05:30:00Z" },
  { id: "c2", name: "Marcus Bennett", role: "Staff Backend Engineer", status: "Screening", matchScore: 74, experience: 11, currentSalary: 160000, expectedSalary: 185000, availabilityDays: 30, schedulePrimary: "Not scheduled", scheduleSecondary: "Awaiting availability", lastActivity: "2026-06-24T12:00:00Z" },
  { id: "c3", name: "Lena Fischer", role: "Product Designer", status: "Shared", matchScore: 81, experience: 6, currentSalary: 98000, expectedSalary: 112000, availabilityDays: 0, schedulePrimary: "Portfolio Review · Mon 11:00 AM", scheduleSecondary: "with Sam Cole", lastActivity: "2026-06-26T08:10:00Z" },
  { id: "c4", name: "Diego Martínez", role: "Data Engineer", status: "New", matchScore: 58, experience: 4, currentSalary: 88000, expectedSalary: 105000, availabilityDays: 60, schedulePrimary: "Not scheduled", scheduleSecondary: null, lastActivity: "2026-06-23T16:45:00Z" },
  { id: "c5", name: "Priya Nair", role: "Engineering Manager", status: "On Hold", matchScore: 69, experience: 13, currentSalary: 195000, expectedSalary: 220000, availabilityDays: 45, schedulePrimary: "Leadership Panel · Fri 1:00 PM", scheduleSecondary: "with Dana Wu", lastActivity: "2026-06-20T09:00:00Z" },
  { id: "c6", name: "Tom Okafor", role: "DevOps Engineer", status: "Rejected", matchScore: 41, experience: 7, currentSalary: 110000, expectedSalary: 130000, availabilityDays: null, schedulePrimary: "Not scheduled", scheduleSecondary: null, lastActivity: "2026-06-18T14:20:00Z" },
  { id: "c7", name: "Hana Suzuki", role: "Frontend Engineer", status: "Screening", matchScore: 88, experience: 5, currentSalary: 102000, expectedSalary: 124000, availabilityDays: 21, schedulePrimary: "Tech Round · Wed 4:30 PM", scheduleSecondary: "with Rejith", lastActivity: "2026-06-26T07:05:00Z" },
  { id: "c8", name: "Olivia Grant", role: "QA Automation Lead", status: "Shortlisted", matchScore: 77, experience: 9, currentSalary: 134000, expectedSalary: 150000, availabilityDays: 7, schedulePrimary: "System Design · Tue 10:00 AM", scheduleSecondary: "with Arun Iyer", lastActivity: "2026-06-25T18:40:00Z" },
];

const STATUS_TONE = {
  New: "info",
  Screening: "warning",
  Shortlisted: "success",
  Shared: "primary",
  "On Hold": "subtle",
  Rejected: "danger",
};

function scoreTone(value) {
  if (value == null) return undefined;
  if (value >= 85) return "success";
  if (value >= 70) return "primary";
  if (value >= 50) return "warning";
  return "danger";
}

const VIEW_OPTIONS = [
  { key: "data", label: "Data" },
  { key: "loading", label: "Loading" },
  { key: "empty", label: "Empty" },
];
/* - - - - - - - - - - - - - - - - */

export function FxTableShowcase() {
  const [view, setView] = useState("data");
  const [message, setMessage] = useState(null);

  const columns = useMemo(
    () => [
      { key: "name", header: "Candidate", type: "link", sticky: "left", sortable: true, sortType: "string", width: 200, minWidth: 180, grow: 1, cellProps: (row) => ({ href: "#", onClick: () => setMessage(`Open candidate · ${row.name}`) }) },
      { key: "role", header: "Role", type: "text", sortable: true, sortType: "string", width: 220, minWidth: 180, grow: 1 },
      { key: "status", header: "Status", type: "badge", width: 140, minWidth: 120, cellProps: (row) => ({ tone: STATUS_TONE[row.status] ?? "neutral", label: row.status, dot: true }) },
      { key: "matchScore", header: "Fit", type: "score", align: "center", sortable: true, sortType: "number", width: 92, minWidth: 80, cellProps: (row) => ({ tone: scoreTone(row.matchScore), onClick: () => setMessage(`CV match breakdown · ${row.name}`) }) },
      { key: "experience", header: "Exp (y)", type: "number", align: "center", sortable: true, sortType: "number", width: 96, minWidth: 84 },
      { key: "currentSalary", header: "Current", type: "currency", align: "right", sortable: true, sortType: "number", width: 132, minWidth: 120, cellProps: () => ({ currency: "USD" }) },
      { key: "expectedSalary", header: "Expected", type: "currency", align: "right", width: 132, minWidth: 120, cellProps: () => ({ currency: "USD" }) },
      { key: "availabilityDays", header: "Availability", type: "availability", align: "center", sortable: true, sortType: "number", width: 132, minWidth: 116 },
      { key: "schedule", header: "Interview", type: "stacked", width: 224, minWidth: 196, cellProps: (row) => ({ primary: row.schedulePrimary, secondary: row.scheduleSecondary, onClick: () => setMessage(`Open schedule · ${row.name}`) }) },
      { key: "lastActivity", header: "Updated", type: "date", sortable: true, sortType: "date", width: 132, minWidth: 120, cellProps: () => ({ mode: "relative" }) },
      {
        key: "actions",
        header: "",
        type: "actions",
        sticky: "right",
        width: 96,
        cellProps: (row) => ({
          inline: [{ icon: Share2, label: "Share", onClick: () => setMessage(`Share · ${row.name}`) }],
          items: [
            { label: "View", icon: Eye, href: "#" },
            { label: "Edit", icon: Pencil, onClick: () => setMessage(`Edit · ${row.name}`) },
            { label: "Archive", icon: Archive, separatorBefore: true, onClick: () => setMessage(`Archive · ${row.name}`) },
            { label: "Delete", icon: Trash2, tone: "danger", onClick: () => setMessage(`Delete · ${row.name}`) },
          ],
        }),
      },
    ],
    [],
  );

  const rows = view === "empty" ? [] : SHOWCASE_ROWS;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {VIEW_OPTIONS.map((option) => (
            <FxButton
              key={option.key}
              size="sm"
              variant={view === option.key ? "primary" : "outline"}
              onClick={() => {
                setView(option.key);
                setMessage(null);
              }}
            >
              {option.label}
            </FxButton>
          ))}
        </div>
        <p className="font-mono text-[11px] text-muted-foreground">
          {message ? `Interaction → ${message}` : "Sort headers · click a row · use row actions"}
        </p>
      </div>

      <div className="h-[380px]">
        <FxTable
          className="h-full"
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          sortable
          defaultSort={{ key: "matchScore", direction: "desc" }}
          stickyHeader
          stickyFirstColumn
          stickyLastColumn
          scrollX
          loading={view === "loading"}
          onRowClick={(row) => setMessage(`Row click → ${row.name}`)}
          emptyMessage="No candidates match the current view."
        />
      </div>

      <p className="font-mono text-[11px] leading-5 text-muted-foreground">
        Cells shown: link · text · badge (FxBadge) · score · number · currency · availability · stacked · date · actions.
        Sticky first (Candidate) + last (actions) columns, sticky header, horizontal + vertical scroll, controller-backed sorting.
      </p>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
