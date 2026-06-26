/* src/components/FxUI/AppShell/FxAppHeader.js | Workspace shell header scaffold | Sree | 2026-06-25 */

import { APP_HEADER_HEIGHT } from "@/lib/FxConstants";
import { cn } from "@/lib/FxUtils";

/* - - - - - - - - - - - - - - - - */

function FxAppHeader({
  className,
  start,
  middle,
  end,
  sticky = true,
}) {
  return (
    <header
      data-slot="fx-app-header"
      style={{ height: APP_HEADER_HEIGHT }}
      className={cn(
        "z-20 grid grid-cols-[minmax(0,1fr)_minmax(240px,720px)_minmax(0,1fr)] items-center gap-4 border-b border-border bg-[color:color-mix(in_srgb,var(--fx-surface)_92%,white)] px-6 backdrop-blur-sm",
        sticky && "sticky top-0",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {start}
      </div>

      <div className="flex min-w-0 items-center justify-center">
        {middle}
      </div>

      <div className="flex min-w-0 items-center justify-end gap-2">
        {end}
      </div>
    </header>
  );
}

export { FxAppHeader };
