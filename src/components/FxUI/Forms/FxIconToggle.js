/* src/components/FxUI/Forms/FxIconToggle.js | Square icon button that reflects an on/off (pressed) state | Sree | 2026-06-30 */

"use client";

import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

// A compact icon toggle: tinted "active" when `pressed`, muted otherwise. One button, one responsibility —
// used e.g. for sheet pane show/hide controls. Pass `label` for the tooltip + aria.
function FxIconToggle({ icon: Icon, pressed = false, onClick, label, className }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-[6px] transition-colors",
        pressed
          ? "bg-[var(--fx-surface-selected)] text-[var(--fx-primary)]"
          : "text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]",
        className,
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxIconToggle };
/* - - - - - - - - - - - - - - - - */
