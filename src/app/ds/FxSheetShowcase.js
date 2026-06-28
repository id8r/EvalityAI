/* src/app/ds/FxSheetShowcase.js | DS-only FxSheet previewer — width/side (legacy) + compound workspace | Sree | 2026-06-28 */

"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { FxButton, FxIconButton, FxInput } from "@/components/FxUI/Forms";
import { FxSheet } from "@/components/FxUI/Overlays";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
/* - - - - - - - - - - - - - - - - */

const SIZES = [
  { key: "sm", label: "Sm · 512" },
  { key: "md", label: "Md · 768" },
  { key: "lg", label: "Lg · 1024" },
  { key: "xl", label: "Xl · 1184" },
  { key: "full", label: "Full" },
];

const CANDIDATES = ["Ananya Sharma", "Rahul Verma", "Priya Nair", "Karthik Iyer", "Sneha Rao", "Arjun Mehta", "Divya Pillai", "Vikram Shah"];

export function FxSheetShowcase() {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState("md");
  const [side, setSide] = useState("right");
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  function openAt(nextSize) {
    setSize(nextSize);
    setOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Open a real sheet at width (legacy simple API)</p>
        <div className="flex flex-wrap items-center gap-2">
          {SIZES.map((entry) => (
            <FxButton key={entry.key} size="sm" variant="outline" onClick={() => openAt(entry.key)}>
              {entry.label}
            </FxButton>
          ))}
          <FxButton size="sm" variant={side === "left" ? "primary" : "outline"} onClick={() => setSide("left")}>
            Left
          </FxButton>
          <FxButton size="sm" variant={side === "right" ? "primary" : "outline"} onClick={() => setSide("right")}>
            Right
          </FxButton>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Compound workspace · 3 panes · Expand + Layout</p>
        <FxButton size="sm" onClick={() => setWorkspaceOpen(true)}>
          Open candidate workspace
        </FxButton>
      </div>

      <p className="font-mono text-[11px] leading-5 text-muted-foreground">
        Widths + motion live in <span className="text-foreground">FX_SHEET</span> (FxTheme.js). Spec: <span className="text-foreground">src/FxDocs/FxSheetWorkspace.md</span>.
      </p>

      {/* Legacy simple sheet — unchanged prop-driven API still works. */}
      <FxSheet
        open={open}
        onOpenChange={setOpen}
        side={side}
        size={size}
        title={`Sheet — ${size} · ${side}`}
        description="Esc inside a field cancels the edit, not the sheet."
        headerActions={
          <FxIconButton size="xs" variant="ghost" aria-label="More options">
            <MoreHorizontal className="size-4" />
          </FxIconButton>
        }
        footerStart={
          <FxButton variant="destructiveSoft" size="sm" onClick={() => setOpen(false)}>
            Delete
          </FxButton>
        }
        footer={
          <>
            <FxButton variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </FxButton>
            <FxButton size="sm" onClick={() => setOpen(false)}>
              Save changes
            </FxButton>
          </>
        }
      >
        <div className="space-y-4">
          <FxInput label="Workspace name" defaultValue="Revenue Ops" />
          <FxInput label="Owner email" placeholder="owner@example.com" />
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-[8px] border border-border bg-[var(--fx-surface)] px-4 py-3 text-sm text-muted-foreground">
              Content block {index + 1} — body scroll under a fixed header/footer.
            </div>
          ))}
        </div>
      </FxSheet>

      {/* Compound workspace — Header (expandable + layout menu) · Toolbar · 3 panes · Footer. */}
      <FxSheet
        open={workspaceOpen}
        onOpenChange={setWorkspaceOpen}
        size="xl"
        expandable
      >
        <FxSheet.Header
          title="Ananya Sharma"
          description="Senior Backend Engineer · FinEdge"
          actions={
            <FxButton size="sm" variant="outline">
              Share
            </FxButton>
          }
          more={
            <>
              <DropdownMenuItem>Archive candidate</DropdownMenuItem>
              <DropdownMenuItem className="text-[var(--fx-danger)]">Reject</DropdownMenuItem>
            </>
          }
        />

        <FxSheet.Toolbar>
          <FxInput size="sm" placeholder="Search this pipeline…" className="max-w-[280px]" clearable={false} />
        </FxSheet.Toolbar>

        <FxSheet.Panes>
          <FxSheet.Pane role="secondary" collapsible label="Candidates" className="p-0">
            <div className="sticky top-0 z-10 border-b border-border bg-[var(--fx-surface-raised)] px-4 py-2 text-[12px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Shortlist
            </div>
            <ul className="px-2 py-2">
              {CANDIDATES.map((name, index) => (
                <li
                  key={name}
                  className={`cursor-pointer rounded-[6px] px-2 py-2 text-sm ${index === 0 ? "bg-[var(--fx-surface-selected)] text-[var(--fx-primary)]" : "text-[var(--fx-text)] hover:bg-[var(--fx-surface-hover)]"}`}
                >
                  {name}
                </li>
              ))}
            </ul>
          </FxSheet.Pane>

          <FxSheet.Pane role="primary">
            <h3 className="text-[16px] font-semibold text-[var(--fx-text)]">Resume</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Primary pane = the subject. It fills the remaining width and owns its own scroll.
            </p>
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="mt-3 rounded-[8px] border border-border bg-[var(--fx-surface)] px-4 py-3 text-sm text-muted-foreground">
                Experience block {index + 1} — independent scroll, no nesting.
              </div>
            ))}
          </FxSheet.Pane>

          <FxSheet.Pane role="tertiary" collapsible label="Actions">
            <h3 className="text-[14px] font-semibold text-[var(--fx-text)]">Actions</h3>
            <div className="mt-3 space-y-3">
              <FxInput label="Note" placeholder="Add a note…" />
              <FxInput label="Schedule" type="date" />
              <FxButton size="sm" className="w-full justify-center">
                Move to Shortlist
              </FxButton>
              <FxButton size="sm" variant="outline" className="w-full justify-center">
                Request feedback
              </FxButton>
            </div>
          </FxSheet.Pane>
        </FxSheet.Panes>

        <FxSheet.Footer
          footerStart={
            <FxButton variant="ghost" size="sm" onClick={() => setWorkspaceOpen(false)}>
              Close
            </FxButton>
          }
        >
          <FxButton size="sm">Save</FxButton>
        </FxSheet.Footer>
      </FxSheet>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
