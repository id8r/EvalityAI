/* src/app/(workspace)/settings/SettingsCard.js | Generic settings card: header (title · desc · action) + body | Sree | 2026-06-28 */

"use client";

import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

// The shared card shell. `action` is any header-right node (a Save button, a badge…). Omit title to render a
// body-only card. SettingsSection is a thin wrapper over this for the common title + Save pattern.
export function SettingsCard({ title, description, action, children, className, bodyClassName }) {
  return (
    <section className={cn("overflow-hidden rounded-[16px] border border-[var(--fx-border)] bg-[var(--fx-surface)]", className)}>
      {title || action ? (
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--fx-border)] px-6 py-5 md:px-8">
          <div className="min-w-0 space-y-1">
            {title ? <h2 className={cn(FX_TYPOGRAPHY.cardTitle, "text-[var(--fx-text)]")}>{title}</h2> : null}
            {description ? <p className="text-[14px] leading-6 text-[var(--fx-text-muted)]">{description}</p> : null}
          </div>
          {action ?? null}
        </header>
      ) : null}
      <div className={cn("space-y-6 px-6 py-6 md:px-8", bodyClassName)}>{children}</div>
    </section>
  );
}
/* - - - - - - - - - - - - - - - - */
