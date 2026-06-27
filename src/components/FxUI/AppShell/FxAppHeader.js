/* src/components/FxUI/AppShell/FxAppHeader.js | Workspace shell header scaffold | Sree | 2026-06-25 */

import { APP_HEADER_HEIGHT, FX_LAYOUT } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

function FxAppHeader({
  className,
  start,
  middle,
  end,
  sticky = true,
  height = APP_HEADER_HEIGHT,
  contentClassName = FX_LAYOUT.siteContainer,
}) {
  return (
    <header
      data-slot="fx-app-header"
      style={{ height }}
      className={cn(
        "z-20 border-b border-[var(--fx-border-light)] bg-[var(--fx-surface)]/85 backdrop-blur-md",
        sticky && "sticky top-0",
        className,
      )}
    >
      <div className={cn("grid h-full grid-cols-[minmax(0,1fr)_minmax(240px,720px)_minmax(0,1fr)] items-center gap-4", contentClassName)}>
        <div className="flex min-w-0 items-center gap-3">{start}</div>
        <div className="flex min-w-0 items-center justify-center">{middle}</div>
        <div className="flex min-w-0 items-center justify-end gap-2">{end}</div>
      </div>
    </header>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxAppHeader };
/* - - - - - - - - - - - - - - - - */