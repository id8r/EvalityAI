/* src/app/(workspace)/settings/PlaceholderSection.js | "Reserved for next release" settings section | Sree | 2026-06-28 */

import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

// Keeps the IA in place for sections not built yet; optional `items` hint at what's coming.
export function PlaceholderSection({ title, description, items = [] }) {
  return (
    <section className="overflow-hidden rounded-[16px] border border-[var(--fx-border)] bg-[var(--fx-surface)]">
      <header className="border-b border-[var(--fx-border)] px-6 py-5 md:px-8">
        <h2 className={cn(FX_TYPOGRAPHY.cardTitle, "text-[var(--fx-text)]")}>{title}</h2>
        {description ? <p className="mt-1 text-[14px] leading-6 text-[var(--fx-text-muted)]">{description}</p> : null}
      </header>
      <div className="space-y-3 px-6 py-6 md:px-8">
        <p className="text-[14px] text-[var(--fx-text-muted)]">Reserved for an upcoming release.</p>
        {items.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((item) => (
              <div key={item} className="rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-4 py-3 text-[13px] text-[var(--fx-text-muted)]">
                {item}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
/* - - - - - - - - - - - - - - - - */
