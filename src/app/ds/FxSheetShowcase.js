/* src/app/ds/FxSheetShowcase.js | DS-only live FxSheet width/side previewer | Sree | 2026-06-27 */

"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { FxButton, FxIconButton, FxInput } from "@/components/FxUI/Forms";
import { FxSheet } from "@/components/FxUI/Overlays";
/* - - - - - - - - - - - - - - - - */

const SIZES = [
  { key: "sm", label: "Sm · 512" },
  { key: "md", label: "Md · 768" },
  { key: "lg", label: "Lg · 1024" },
  { key: "xl", label: "Xl · 1184" },
  { key: "full", label: "Full" },
];

export function FxSheetShowcase() {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState("md");
  const [side, setSide] = useState("right");

  function openAt(nextSize) {
    setSize(nextSize);
    setOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Open a real sheet at width</p>
        <div className="flex flex-wrap items-center gap-2">
          {SIZES.map((entry) => (
            <FxButton key={entry.key} size="sm" variant="outline" onClick={() => openAt(entry.key)}>
              {entry.label}
            </FxButton>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Side</p>
        <div className="flex items-center gap-2">
          <FxButton size="sm" variant={side === "left" ? "primary" : "outline"} onClick={() => setSide("left")}>
            Left
          </FxButton>
          <FxButton size="sm" variant={side === "right" ? "primary" : "outline"} onClick={() => setSide("right")}>
            Right
          </FxButton>
        </div>
      </div>

      <p className="font-mono text-[11px] leading-5 text-muted-foreground">
        Widths + motion live in <span className="text-foreground">FX_SHEET</span> (FxTheme.js): sm 512 · md 768 · lg 1024 · xl 1184 · full.
      </p>

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
          <p className="text-sm leading-6 text-muted-foreground">
            Use this to judge how each width feels for forms, detail panes, and workflows — then tune the tokens.
          </p>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-[8px] border border-border bg-[var(--fx-surface)] px-4 py-3 text-sm text-muted-foreground">
              Content block {index + 1} — demonstrates body scroll under a fixed header/footer.
            </div>
          ))}
        </div>
      </FxSheet>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
