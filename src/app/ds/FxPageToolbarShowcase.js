/* src/app/ds/FxPageToolbarShowcase.js | DS-only FxPageToolbar composition gallery (mock data) | Sree | 2026-06-27 */

"use client";

import { useState } from "react";
import { Download, ListFilter, MoreHorizontal, Plus } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { FxBadge, FxSelectionSummary } from "@/components/FxUI/DataDisplay";
import { FxAiButton, FxButton, FxIconButton, FxToolbarSearch } from "@/components/FxUI/Forms";
import { FxPageToolbar } from "@/components/FxUI/Layout";
import { FxTabs } from "@/components/FxUI/Navigation";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

const MOCK_PEOPLE = [
  { id: "p1", name: "Aisha Khan", role: "Senior Frontend Engineer" },
  { id: "p2", name: "Marcus Lee", role: "Product Designer" },
  { id: "p3", name: "Priya Nair", role: "Data Scientist" },
  { id: "p4", name: "Tom Becker", role: "Backend Engineer" },
];

const LIST_TABS = [
  { value: "active", label: "Active", count: 18 },
  { value: "archived", label: "Archived", count: 4 },
];

const STAGE_TABS = [
  { value: "unscreened", label: "Unscreened", count: 24 },
  { value: "prescreened", label: "Pre-Screened", count: 9 },
  { value: "shortlisted", label: "Shortlisted", count: 5 },
  { value: "interviewing", label: "Interviewing", count: 3 },
  { value: "offered", label: "Offered", count: 1 },
  { value: "rejected", label: "Rejected", count: 12 },
];

/* Mock-only filter trigger — stands in for a page-owned filter dropdown. */
function MockFilter({ label, count }) {
  return (
    <FxButton size="sm" variant="outline">
      <ListFilter className="size-4" />
      {label}
      {count != null ? (
        <FxBadge tone="primary" variant="soft" size="xs">
          {count}
        </FxBadge>
      ) : null}
    </FxButton>
  );
}

/* Mock-only selectable list so the bulk swap has something to drive it. */
function SelectableRows({ selected, onToggle, onToggleAll }) {
  const allChecked = selected.size === MOCK_PEOPLE.length;
  const someChecked = selected.size > 0 && !allChecked;

  return (
    <div className="divide-y divide-[var(--fx-border-light)]">
      <div className="flex items-center gap-3 px-4 py-2">
        <Checkbox
          checked={allChecked ? true : someChecked ? "indeterminate" : false}
          onCheckedChange={onToggleAll}
          aria-label="Select all"
        />
        <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--fx-text-muted)]">Candidate</span>
      </div>
      {MOCK_PEOPLE.map((person) => (
        <label key={person.id} className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-[var(--fx-surface-hover)]">
          <Checkbox checked={selected.has(person.id)} onCheckedChange={() => onToggle(person.id)} aria-label={`Select ${person.name}`} />
          <span className="text-[14px] leading-5 text-[var(--fx-text)]">{person.name}</span>
          <span className="text-[13px] leading-5 text-[var(--fx-text-muted)]">· {person.role}</span>
        </label>
      ))}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */

function Example({ title, hint, children, bodyClassName }) {
  return (
    <section className="space-y-3">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
        {hint ? <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{hint}</p> : null}
      </div>
      <div className={cn("overflow-hidden rounded-[10px] border border-border bg-[var(--fx-surface)]", bodyClassName)}>{children}</div>
    </section>
  );
}

/* The toolbar carries no horizontal padding of its own (pages supply it via FxAppContent); the DS
   frames it with px-4 to mimic that. */
function Frame({ children }) {
  return <div className="px-4">{children}</div>;
}
/* - - - - - - - - - - - - - - - - */

export function FxPageToolbarShowcase() {
  const [listTab, setListTab] = useState("active");
  const [actionsTab, setActionsTab] = useState("active");
  const [bulkSel, setBulkSel] = useState(() => new Set());
  const [wsStage, setWsStage] = useState("unscreened");
  const [wsSel, setWsSel] = useState(() => new Set());

  function toggle(setSel) {
    return (id) =>
      setSel((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
  }
  function toggleAll(setSel) {
    return (checked) => setSel(checked ? new Set(MOCK_PEOPLE.map((p) => p.id)) : new Set());
  }

  const bulkActions = (
    <>
      <FxButton size="sm" variant="outline">
        <Download className="size-4" />
        Export
      </FxButton>
      <FxButton size="sm" variant="secondary">
        Shortlist
      </FxButton>
      <FxButton size="sm" variant="destructiveSoft">
        Reject
      </FxButton>
    </>
  );

  return (
    <div className="space-y-10">
      <p className="text-[13px] leading-6 text-muted-foreground">
        <span className="text-foreground">FxPageToolbar</span> owns layout only — rows with start/end zones, sticky, responsive
        wrap, and the bulk swap. Every control below (tabs, search, filters, actions, selection summary) is an independent Fx
        component composed into a zone.
      </p>

      {/* 1 · SIMPLE LIST */}
      <Example title="Simple list toolbar" hint="One row: a count on the start, search + primary action on the end.">
        <Frame>
          <FxPageToolbar>
            <FxPageToolbar.Row>
              <FxPageToolbar.Start>
                <span className="text-[13px] text-[var(--fx-text-muted)]">18 clients</span>
              </FxPageToolbar.Start>
              <FxPageToolbar.End>
                <FxToolbarSearch placeholder="Search clients" />
                <FxButton size="sm">
                  <Plus className="size-4" />
                  Add Client
                </FxButton>
              </FxPageToolbar.End>
            </FxPageToolbar.Row>
          </FxPageToolbar>
        </Frame>
      </Example>

      {/* 2 · TABS */}
      <Example title="Toolbar with tabs" hint="Tabs sit in the start zone; the toolbar only positions the FxTabs node.">
        <Frame>
          <FxPageToolbar>
            <FxPageToolbar.Row>
              <FxPageToolbar.Start>
                <FxTabs variant="segmented" tabs={LIST_TABS} value={listTab} onValueChange={setListTab} />
              </FxPageToolbar.Start>
              <FxPageToolbar.End>
                <FxToolbarSearch placeholder="Search jobs" />
                <FxButton size="sm">
                  <Plus className="size-4" />
                  Create Job
                </FxButton>
              </FxPageToolbar.End>
            </FxPageToolbar.Row>
          </FxPageToolbar>
        </Frame>
      </Example>

      {/* 3 · FILTERS */}
      <Example title="Toolbar with filters" hint="Filters are page-owned nodes in the start zone; the count badge is theirs, not the toolbar's.">
        <Frame>
          <FxPageToolbar>
            <FxPageToolbar.Row>
              <FxPageToolbar.Start>
                <MockFilter label="Status" count={2} />
                <MockFilter label="Owner" />
                <MockFilter label="Industry" />
              </FxPageToolbar.Start>
              <FxPageToolbar.End>
                <FxToolbarSearch placeholder="Search" />
              </FxPageToolbar.End>
            </FxPageToolbar.Row>
          </FxPageToolbar>
        </Frame>
      </Example>

      {/* 4 · SEARCH */}
      <Example title="Toolbar with search" hint='FxToolbarSearch is its own component — leading icon, clear-✕, and a "/" focus shortcut (press / anywhere outside a field).'>
        <Frame>
          <FxPageToolbar>
            <FxPageToolbar.Row>
              <FxPageToolbar.Start>
                <span className="text-[14px] font-medium text-[var(--fx-text)]">Candidates</span>
              </FxPageToolbar.Start>
              <FxPageToolbar.End>
                <FxToolbarSearch placeholder="Search candidates or roles" className="sm:w-[300px]" />
              </FxPageToolbar.End>
            </FxPageToolbar.Row>
          </FxPageToolbar>
        </Frame>
      </Example>

      {/* 5 · PRIMARY / SECONDARY ACTIONS */}
      <Example title="Primary / secondary actions" hint="Action hierarchy via composition: AI + ghost icon (secondary) then the solid primary. The toolbar just lines them up.">
        <Frame>
          <FxPageToolbar>
            <FxPageToolbar.Row>
              <FxPageToolbar.Start>
                <FxTabs variant="segmented" tabs={LIST_TABS} value={actionsTab} onValueChange={setActionsTab} />
              </FxPageToolbar.Start>
              <FxPageToolbar.End>
                <FxAiButton size="sm">Recommend</FxAiButton>
                <FxIconButton size="sm" variant="ghost" aria-label="Export">
                  <Download className="size-4" />
                </FxIconButton>
                <FxIconButton size="sm" variant="ghost" aria-label="More">
                  <MoreHorizontal className="size-4" />
                </FxIconButton>
                <FxButton size="sm">
                  <Plus className="size-4" />
                  Add Candidate
                </FxButton>
              </FxPageToolbar.End>
            </FxPageToolbar.Row>
          </FxPageToolbar>
        </Frame>
      </Example>

      {/* 6 · BULK SWAP */}
      <Example title="Bulk selection mode (row swap)" hint="Select rows → the controls row swaps in place to a bulk strip. The toolbar owns the swap; the page owns the selection state.">
        <Frame>
          <FxPageToolbar>
            <FxPageToolbar.Row>
              <FxPageToolbar.Start>
                <FxTabs variant="segmented" tabs={LIST_TABS} value="active" onValueChange={() => {}} />
              </FxPageToolbar.Start>
            </FxPageToolbar.Row>
            <FxPageToolbar.Row
              swapActive={bulkSel.size > 0}
              bulk={
                <>
                  <FxPageToolbar.Start>
                    <FxSelectionSummary count={bulkSel.size} noun="selected" onClear={() => setBulkSel(new Set())} />
                  </FxPageToolbar.Start>
                  <FxPageToolbar.End>{bulkActions}</FxPageToolbar.End>
                </>
              }
            >
              <FxPageToolbar.Start>
                <MockFilter label="Stage" />
              </FxPageToolbar.Start>
              <FxPageToolbar.End>
                <FxToolbarSearch placeholder="Search candidates" />
                <FxButton size="sm">
                  <Plus className="size-4" />
                  Add Candidates
                </FxButton>
              </FxPageToolbar.End>
            </FxPageToolbar.Row>
          </FxPageToolbar>
        </Frame>
        <div className="border-t border-border">
          <SelectableRows selected={bulkSel} onToggle={toggle(setBulkSel)} onToggleAll={toggleAll(setBulkSel)} />
        </div>
      </Example>

      {/* 7 · WORKSPACE STYLE */}
      <Example
        title="Workspace-style toolbar"
        hint="Stacked rows — underlined stage tabs, then a filter/search/CTA row that also swaps to bulk. Entity title + status live above this in FxDetailHeader (separate component)."
      >
        <Frame>
          <FxPageToolbar>
            <FxPageToolbar.Row>
              <FxPageToolbar.Start>
                <FxTabs variant="underlined" tabs={STAGE_TABS} value={wsStage} onValueChange={setWsStage} />
              </FxPageToolbar.Start>
            </FxPageToolbar.Row>
            <FxPageToolbar.Row
              swapActive={wsSel.size > 0}
              bulk={
                <>
                  <FxPageToolbar.Start>
                    <FxSelectionSummary count={wsSel.size} noun="candidates" onClear={() => setWsSel(new Set())} />
                  </FxPageToolbar.Start>
                  <FxPageToolbar.End>{bulkActions}</FxPageToolbar.End>
                </>
              }
            >
              <FxPageToolbar.Start>
                <MockFilter label="AI Call Screened" count={5} />
              </FxPageToolbar.Start>
              <FxPageToolbar.End>
                <FxAiButton size="sm">Recommend</FxAiButton>
                <FxToolbarSearch placeholder="Search candidates" />
                <FxButton size="sm">
                  <Plus className="size-4" />
                  Add Candidates
                </FxButton>
              </FxPageToolbar.End>
            </FxPageToolbar.Row>
          </FxPageToolbar>
        </Frame>
        <div className="border-t border-border">
          <SelectableRows selected={wsSel} onToggle={toggle(setWsSel)} onToggleAll={toggleAll(setWsSel)} />
        </div>
      </Example>

      {/* 8 · STICKY */}
      <Example title="Sticky behavior" hint="Scroll inside the panel — the toolbar sticks to the top of the scroll area (the app header is fixed outside it).">
        <div className="h-[260px] overflow-y-auto bg-[var(--fx-bg)]">
          <div className="px-4">
            <FxPageToolbar sticky divider>
              <FxPageToolbar.Row>
                <FxPageToolbar.Start>
                  <FxTabs variant="segmented" tabs={LIST_TABS} value="active" onValueChange={() => {}} />
                </FxPageToolbar.Start>
                <FxPageToolbar.End>
                  <FxToolbarSearch placeholder="Search" />
                  <FxButton size="sm">
                    <Plus className="size-4" />
                    Add
                  </FxButton>
                </FxPageToolbar.End>
              </FxPageToolbar.Row>
            </FxPageToolbar>
            <div className="space-y-2 py-3">
              {Array.from({ length: 14 }).map((_, index) => (
                <div key={index} className="rounded-[8px] border border-border bg-[var(--fx-surface)] px-4 py-3 text-[13px] text-muted-foreground">
                  Scrolling row {index + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Example>

      {/* 9 · RESPONSIVE WRAP */}
      <Example title="Responsive wrapping" hint="In a narrow container the end zone wraps under the start zone instead of overflowing. Shown clamped to 460px.">
        <Frame>
          <div className="max-w-[460px]">
            <FxPageToolbar>
              <FxPageToolbar.Row>
                <FxPageToolbar.Start>
                  <FxTabs variant="segmented" tabs={LIST_TABS} value="active" onValueChange={() => {}} />
                </FxPageToolbar.Start>
                <FxPageToolbar.End>
                  <FxToolbarSearch placeholder="Search" />
                  <FxButton size="sm" variant="outline">
                    <Download className="size-4" />
                    Export
                  </FxButton>
                  <FxButton size="sm">
                    <Plus className="size-4" />
                    Add
                  </FxButton>
                </FxPageToolbar.End>
              </FxPageToolbar.Row>
            </FxPageToolbar>
          </div>
        </Frame>
      </Example>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
