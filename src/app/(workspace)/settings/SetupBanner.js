/* src/app/(workspace)/settings/SetupBanner.js | Collapsible "complete your workspace setup" progress banner | Sree | 2026-06-28 */

"use client";

import { useState } from "react";
import { Check, ChevronDown, Circle } from "lucide-react";

import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

// `completed` is a Set of section ids — wired to EvSettings once the data layer lands; checklist deep-links
// to a section via onNavigate.
export function SetupBanner({ sections, completed, onNavigate }) {
  const [open, setOpen] = useState(false);
  const total = sections.length;
  const done = sections.filter((section) => completed.has(section.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="overflow-hidden rounded-[10px] border border-[color:color-mix(in_srgb,var(--fx-primary)_22%,var(--fx-border)_78%)] bg-[var(--fx-surface)]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-5 bg-[color:color-mix(in_srgb,var(--fx-surface-selected)_55%,var(--fx-surface))] px-5 py-4 text-left transition-colors hover:bg-[color:color-mix(in_srgb,var(--fx-surface-selected)_70%,var(--fx-surface))]"
      >
        <div className="min-w-0">
          <p className={cn(FX_TYPOGRAPHY.cardTitle, "text-[var(--fx-text)]")}>Complete your workspace setup</p>
          <p className="mt-0.5 text-[13px] leading-5 text-[var(--fx-text-muted)]">
            Finish these to personalize how Evality works for you.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <div className="hidden sm:block">
            <div className="h-2 w-36 overflow-hidden rounded-full bg-[color:color-mix(in_srgb,var(--fx-border)_70%,transparent)]">
              <div className="h-full rounded-full bg-[var(--fx-primary)] transition-[width] duration-200" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1 text-right text-[12px] text-[var(--fx-text-muted)]">
              {done} of {total} completed
            </p>
          </div>
          <ChevronDown className={cn("size-4 text-[var(--fx-text-muted)] transition-transform", open && "rotate-180")} />
        </div>
      </button>

      {open ? (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-[color:color-mix(in_srgb,var(--fx-primary)_14%,var(--fx-border)_86%)] px-5 py-4">
          {sections.map((section) => {
            const isDone = completed.has(section.id);
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onNavigate(section.id)}
                className="inline-flex items-center gap-2 rounded-[6px] px-1.5 py-1 text-left transition-colors hover:bg-[var(--fx-surface-hover)]"
              >
                {isDone ? (
                  <Check className="size-4 shrink-0 text-[var(--fx-success)]" />
                ) : (
                  <Circle className="size-4 shrink-0 text-[var(--fx-text-disabled)]" />
                )}
                <span className={cn("text-[14px] leading-5", isDone ? "text-[var(--fx-text-muted)]" : "text-[var(--fx-text)]")}>
                  {section.label}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
