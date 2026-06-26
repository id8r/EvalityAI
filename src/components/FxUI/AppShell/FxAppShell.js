/* src/components/FxUI/AppShell/FxAppShell.js | Workspace shell composition root | Sree | 2026-06-25 */

import {
  APP_FOOTER_HEIGHT,
  APP_HEADER_HEIGHT,
  APP_NOTIFICATION_HEIGHT,
  APP_VIEWPORT_HEIGHT,
  SIDEBAR_WIDTHS,
} from "@/lib/FxConstants";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

function FxAppShell({
  className,
  sidebar,
  sidebarCollapsed = false,
  header,
  notificationArea,
  rightPanel,
  footer,
  children,
  shellBodyClassName,
}) {
  const sidebarWidth = sidebarCollapsed
    ? SIDEBAR_WIDTHS.collapsed
    : SIDEBAR_WIDTHS.expanded;

  const shellBodyGridTemplateColumns = sidebar
    ? `${sidebarWidth} minmax(0, 1fr)`
    : "minmax(0, 1fr)";

  const contentGridTemplateColumns = rightPanel
    ? `minmax(0, 1fr) ${SIDEBAR_WIDTHS.rightPanel}`
    : "minmax(0, 1fr)";

  return (
    <div
      data-slot="fx-app-shell"
      className={cn(
        "relative overflow-hidden bg-[linear-gradient(180deg,var(--fx-bg-soft)_0,var(--fx-bg)_160px,var(--fx-bg)_100%)]",
        className,
      )}
      style={{ height: APP_VIEWPORT_HEIGHT }}
    >
      <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)]">
        {notificationArea ? (
          <div
            data-slot="fx-notification-area-region"
            className="min-h-0 min-w-0"
            style={{ minHeight: APP_NOTIFICATION_HEIGHT }}
          >
            {notificationArea}
          </div>
        ) : null}

        <div
          data-slot="fx-shell-body"
          className={cn("grid min-h-0 min-w-0", shellBodyClassName)}
          style={{ gridTemplateColumns: shellBodyGridTemplateColumns }}
        >
          {sidebar ? (
            <div
              data-slot="fx-sidebar-region"
              className="min-h-0 min-w-0 overflow-hidden"
            >
              {sidebar}
            </div>
          ) : null}

          <div
            data-slot="fx-main-region"
            className="relative flex min-h-0 min-w-0 flex-col overflow-hidden"
          >
            {header ? (
              <div
                data-slot="fx-header-region"
                className="min-h-0 min-w-0"
                style={{ minHeight: APP_HEADER_HEIGHT }}
              >
                {header}
              </div>
            ) : null}

            <div
              data-slot="fx-content-and-panel-region"
              className="grid min-h-0 min-w-0 flex-1"
              style={{ gridTemplateColumns: contentGridTemplateColumns }}
            >
              <div data-slot="fx-content-region" className="min-h-0 min-w-0 overflow-hidden">
                {children}
              </div>

              {rightPanel ? (
                <div
                  data-slot="fx-right-panel-region"
                  className="min-h-0 min-w-0 overflow-hidden"
                >
                  {rightPanel}
                </div>
              ) : null}
            </div>

            {footer ? (
              <div
                data-slot="fx-footer-region"
                className="min-h-0 min-w-0"
                style={{ minHeight: APP_FOOTER_HEIGHT }}
              >
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxAppShell };
/* - - - - - - - - - - - - - - - - */
