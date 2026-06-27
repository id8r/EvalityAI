/* src/components/FxUI/Layout/FxPageToolbar.js | Page-level control toolbar — layout only | Sree | 2026-06-27 */

import { Children, cloneElement, isValidElement } from "react";

import { FX_TOOLBAR } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Layout ONLY — arranges reusable controls into stacked rows, each with a Start zone (grows) and an
  End zone (hugs right, wraps under on narrow widths). Owns spacing, sticky behavior, responsive
  wrapping, and the contextual bulk swap. It does NOT own search / filter / tab / column / export /
  AI / selection logic — compose those in as already-wired nodes.

    <FxPageToolbar sticky>
      <FxPageToolbar.Row>
        <FxPageToolbar.Start>{tabs}</FxPageToolbar.Start>
        <FxPageToolbar.End>{search}{primaryAction}</FxPageToolbar.End>
      </FxPageToolbar.Row>
    </FxPageToolbar>

  Presentational and hook-free → Server Component. See src/FxDocs/FxPageToolbarArchitecture.md.
*/
function FxPageToolbar({ sticky = false, density = "default", divider = false, className, children }) {
  // Propagate container density to Row children without context (keeps this a Server Component);
  // an explicit density on a Row still wins.
  const rows = Children.map(children, (child) =>
    isValidElement(child) && child.type === FxPageToolbarRow
      ? cloneElement(child, { density: child.props.density ?? density })
      : child,
  );

  return (
    <div
      data-slot="fx-page-toolbar"
      className={cn(FX_TOOLBAR.stack, sticky && FX_TOOLBAR.sticky, divider && FX_TOOLBAR.divider, className)}
    >
      {rows}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */

// A single row. When `swapActive` and a `bulk` node is given, the row renders `bulk` in place of its
// children — the contextual bulk-action strip. The toolbar owns the swap + the tint transition;
// the page owns the selection state behind `swapActive`.
function FxPageToolbarRow({ swapActive = false, bulk, align = "center", density = "default", className, children }) {
  const showBulk = swapActive && bulk != null;

  return (
    <div
      data-slot="fx-page-toolbar-row"
      data-bulk={showBulk ? "true" : undefined}
      className={cn(
        FX_TOOLBAR.row,
        FX_TOOLBAR.density[density] ?? FX_TOOLBAR.density.default,
        align === "start" ? "items-start" : "items-center",
        showBulk && FX_TOOLBAR.bulk,
        className,
      )}
    >
      {showBulk ? bulk : children}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */

function FxPageToolbarStart({ className, children }) {
  return (
    <div data-slot="fx-page-toolbar-start" className={cn(FX_TOOLBAR.zoneStart, className)}>
      {children}
    </div>
  );
}

function FxPageToolbarEnd({ className, children }) {
  return (
    <div data-slot="fx-page-toolbar-end" className={cn(FX_TOOLBAR.zoneEnd, className)}>
      {children}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */

FxPageToolbar.Row = FxPageToolbarRow;
FxPageToolbar.Start = FxPageToolbarStart;
FxPageToolbar.End = FxPageToolbarEnd;
/* - - - - - - - - - - - - - - - - */
export { FxPageToolbar };
/* - - - - - - - - - - - - - - - - */
