/* src/components/dev/DemoResetControl.js | Hidden bottom-right demo/dev reset utility (NOT a product feature) | Sree | 2026-06-28 */

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FlaskConical, RefreshCw, RotateCcw } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { hardResetEvData, resetEvData } from "@/lib/EvStore";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Demo-only utility: a near-invisible trigger in the bottom-right corner opens a tiny menu to re-seed or fully
  reset the mock app. Intentionally kept OUT of Settings / product UI. Soft reset re-pulls public/data seeds
  (keeps session + theme + table prefs); hard reset wipes all Ev demo state for a fresh visitor.
*/
export function DemoResetControl() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function softReset() {
    setMenuOpen(false);
    try {
      await resetEvData();
      toast.success("Demo data refreshed", { description: "Re-seeded from public/data — session and preferences kept." });
    } catch {
      toast.error("Couldn’t refresh demo data");
    }
  }

  function hardReset() {
    setBusy(true);
    // Keep FxID8r so theme/sidebar don't flip; then reload as a fresh visitor.
    hardResetEvData({ keepTheme: true });
    window.location.assign("/");
  }

  return (
    <div className="fixed bottom-3 left-3 z-[60] print:hidden">
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Demo utilities"
            title="Demo utilities"
            className={cn(
              "flex size-7 items-center justify-center rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)] text-[var(--fx-text-muted)] shadow-sm transition-opacity duration-150",
              "opacity-15 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fx-ring)]",
              menuOpen && "opacity-100",
            )}
          >
            <FlaskConical className="size-3.5" />
          </button>
        </PopoverTrigger>

        <PopoverContent align="end" side="top" sideOffset={8} className="w-60 p-1.5">
          <div className="px-2 py-1.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--fx-text-muted)]">Demo utilities</p>
          </div>

          <button
            type="button"
            onClick={softReset}
            className="flex w-full items-start gap-2.5 rounded-[6px] px-2 py-2 text-left transition-colors hover:bg-[var(--fx-surface-hover)]"
          >
            <RefreshCw className="mt-0.5 size-4 shrink-0 text-[var(--fx-text-muted)]" />
            <span className="min-w-0">
              <span className="block text-[13px] font-medium text-[var(--fx-text)]">Refresh demo data</span>
              <span className="block text-[12px] leading-4 text-[var(--fx-text-muted)]">Re-seed from files · keep login & prefs</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setConfirmOpen(true);
            }}
            className="flex w-full items-start gap-2.5 rounded-[6px] px-2 py-2 text-left transition-colors hover:bg-[var(--fx-surface-hover)]"
          >
            <RotateCcw className="mt-0.5 size-4 shrink-0 text-[var(--fx-danger)]" />
            <span className="min-w-0">
              <span className="block text-[13px] font-medium text-[var(--fx-text)]">Reset fresh demo</span>
              <span className="block text-[12px] leading-4 text-[var(--fx-text-muted)]">Wipe everything · log out · reload</span>
            </span>
          </button>
        </PopoverContent>
      </Popover>

      {/* Hard-reset confirm — deliberately all-mono so it reads as a dev action, not product UI. */}
      <AlertDialog open={confirmOpen} onOpenChange={(open) => !busy && setConfirmOpen(open)}>
        <AlertDialogContent className="font-mono">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono text-[15px]">$ reset --fresh-demo</AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-[12px] leading-5">
              Wipes EvSeedData, EvUIData and EvSession. You’ll be logged out and the app reloads as a brand-new visitor.
              Theme/sidebar (FxID8r) are kept. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy} className="font-mono text-[12px]">
              cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(event) => {
                event.preventDefault();
                hardReset();
              }}
              className="bg-[var(--fx-danger)] font-mono text-[12px] text-white hover:bg-[var(--fx-danger)]/90"
            >
              {busy ? "resetting…" : "yes, reset"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
