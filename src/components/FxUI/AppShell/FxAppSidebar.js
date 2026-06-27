/* src/components/FxUI/AppShell/FxAppSidebar.js | Workspace shell sidebar scaffold | Sree | 2026-06-25 */

import { APP_HEADER_HEIGHT, SIDEBAR_WIDTHS } from "@/lib/FxTheme";
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
      style={{ width: collapsed ? SIDEBAR_WIDTHS.collapsed : SIDEBAR_WIDTHS.expanded }}
      className={cn(
        "flex h-full shrink-0 flex-col overflow-hidden border-r border-[var(--fx-border-light)] bg-[var(--fx-surface)] transition-[width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
        className,
      )}
    >
      {header ? (
        <div
          style={{ height: APP_HEADER_HEIGHT }}
          className={cn("flex items-center", collapsed ? "justify-center px-3" : "px-4")}
        >
          {header}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">{body}</div>

      {footer ? <div className="px-3 py-3">{footer}</div> : null}
    </aside>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxAppSidebar };
/* - - - - - - - - - - - - - - - - */
