/* src/app/(workspace)/settings/SettingsSection.js | Settings section card: header (title · desc · Save) + body | Sree | 2026-06-28 */

"use client";

import { FxButton } from "@/components/FxUI/Forms";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

// The repeated section shell every real settings section uses. `onSave` shows the Save button (disabled until
// dirty); omit it for read-only sections.
export function SettingsSection({ title, description, onSave, saveLabel = "Save", saving = false, saveDisabled = false, children }) {
  return (
    <section className="overflow-hidden rounded-[16px] border border-[var(--fx-border)] bg-[var(--fx-surface)]">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--fx-border)] px-6 py-5 md:px-8">
        <div className="min-w-0 space-y-1">
          <h2 className={cn(FX_TYPOGRAPHY.cardTitle, "text-[var(--fx-text)]")}>{title}</h2>
          {description ? <p className="text-[14px] leading-6 text-[var(--fx-text-muted)]">{description}</p> : null}
        </div>
        {onSave ? (
          <FxButton variant="secondary" size="md" onClick={onSave} loading={saving} disabled={saveDisabled}>
            {saveLabel}
          </FxButton>
        ) : null}
      </header>
      <div className="space-y-6 px-6 py-6 md:px-8">{children}</div>
    </section>
  );
}
/* - - - - - - - - - - - - - - - - */
