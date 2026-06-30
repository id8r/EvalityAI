/* src/components/FxUI/DataDisplay/FxSectionHeader.js | Subtle panel heading bar (title + optional actions) | Sree | 2026-06-30 */

"use client";

import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

// One place for the "title-bar" treatment used atop panels (e.g. a Resume panel header): a subtle filled
// strip with a bottom border. Pass `title` for the default label, or `children` for custom content; `actions`
// render on the right.
function FxSectionHeader({ title, actions, children, className }) {
  return (
    <div className={cn("flex items-center justify-between gap-2 border-b border-[var(--fx-border)] bg-[var(--fx-surface-subtle)] px-4 py-2.5", className)}>
      {children ?? <span className="text-[13px] font-semibold leading-none text-[var(--fx-text)]">{title}</span>}
      {actions ? <div className="flex items-center gap-1">{actions}</div> : null}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxSectionHeader };
/* - - - - - - - - - - - - - - - - */
