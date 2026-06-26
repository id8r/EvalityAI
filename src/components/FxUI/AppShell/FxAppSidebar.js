/* src/components/FxUI/AppShell/FxAppSidebar.js | Workspace shell sidebar scaffold | Sree | 2026-06-25 */

import { APP_HEADER_HEIGHT } from "@/lib/FxConstants";
import { cn } from "@/lib/FxUtils";

/* - - - - - - - - - - - - - - - - */

function FxAppSidebar({
  className,
  header,
  body,
  footer,
}) {
  return (
    <aside
      data-slot="fx-app-sidebar"
      className={cn(
        "flex h-full w-full flex-col border-r border-border bg-[var(--fx-surface)]",
        className,
      )}
    >
      {header ? (
        <div style={{ height: APP_HEADER_HEIGHT }} className="flex items-center border-b border-border px-5">
          {header}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">{body}</div>

      {footer ? (
        <div className="border-t border-border bg-[var(--fx-surface-subtle)] px-4 py-3">
          {footer}
        </div>
      ) : null}
    </aside>
  );
}

export { FxAppSidebar };
