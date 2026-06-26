/* src/components/FxUI/AppShell/FxAppSidebar.js | Workspace shell sidebar scaffold | Sree | 2026-06-25 */

import { APP_HEADER_HEIGHT } from "@/lib/FxConstants";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

function FxAppSidebar({
  className,
  header,
  body,
  footer,
  collapsed = false,
}) {
  return (
    <aside
      data-slot="fx-app-sidebar"
      data-collapsed={collapsed ? "true" : "false"}
      className={cn(
        "flex h-full w-full flex-col border-r border-border bg-[var(--fx-surface)]",
        className,
      )}
    >
      {header ? (
        <div
          style={{ height: APP_HEADER_HEIGHT }}
          className={cn("flex items-center border-b border-border", collapsed ? "justify-center px-2" : "px-4")}
        >
          {header}
        </div>
      ) : null}

      <div className={cn("min-h-0 flex-1 overflow-y-auto py-4", collapsed ? "px-2" : "px-3")}>{body}</div>

      {footer ? (
        <div className={cn("border-t border-border bg-[var(--fx-surface-subtle)] py-3", collapsed ? "px-2" : "px-3")}>
          {footer}
        </div>
      ) : null}
    </aside>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxAppSidebar };
/* - - - - - - - - - - - - - - - - */
