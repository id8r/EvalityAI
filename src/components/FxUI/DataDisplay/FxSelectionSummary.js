/* src/components/FxUI/DataDisplay/FxSelectionSummary.js | "N selected" + clear, for bulk strips | Sree | 2026-06-27 */

import { X } from "lucide-react";

import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Selection-count summary for a toolbar's bulk strip. Pairs with useFxTable selection — the page
  passes the count and a clear handler. Presentational and hook-free → Server Component.
  `noun` shapes the phrase ("3 selected" / "3 candidates"); `label` overrides the whole phrase.
*/
function FxSelectionSummary({ count = 0, onClear, noun = "selected", label, className }) {
  return (
    <div data-slot="fx-selection-summary" className={cn("flex items-center gap-2", className)}>
      <span className="text-[13px] font-medium text-[var(--fx-text)]">
        {label ?? (
          <>
            {count} <span className="font-normal text-[var(--fx-text-muted)]">{noun}</span>
          </>
        )}
      </span>
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 rounded-[6px] px-2 py-1 text-[13px] font-medium text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
        >
          <X className="size-3.5" />
          Clear
        </button>
      ) : null}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxSelectionSummary };
/* - - - - - - - - - - - - - - - - */
