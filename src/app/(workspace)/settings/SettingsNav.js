/* src/app/(workspace)/settings/SettingsNav.js | Settings left-nav (section switcher) | Sree | 2026-06-28 */

import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

// Icon + label + description rows; active = selected surface + a 3px primary left-accent bar.
export function SettingsNav({ sections, activeId, onSelect }) {
  return (
    <nav className="space-y-1">
      {sections.map((section) => {
        const Icon = section.icon;
        const active = section.id === activeId;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "relative grid w-full grid-cols-[20px_minmax(0,1fr)] items-center gap-3 rounded-[8px] px-3 py-2.5 text-left transition-colors",
              active ? "bg-[var(--fx-surface-selected)]" : "hover:bg-[var(--fx-surface-hover)]",
            )}
          >
            {active ? <span aria-hidden="true" className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-[var(--fx-primary)]" /> : null}
            <Icon
              className={cn("size-5 shrink-0", active ? "text-[var(--fx-primary)]" : "text-[var(--fx-text-muted)]")}
              strokeWidth={1.8}
            />
            <span className="grid min-w-0 gap-0.5">
              <span className={cn("truncate text-[14px] font-medium leading-5", active ? "text-[var(--fx-primary)]" : "text-[var(--fx-text)]")}>
                {section.label}
              </span>
              <span className="truncate text-[13px] leading-5 text-[var(--fx-text-muted)]">{section.description}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
/* - - - - - - - - - - - - - - - - */
