/* src/app/(workspace)/layout.js | Workspace route group shell scaffold | Sree | 2026-06-25 */

import { APP_NAME, APP_SHORT_NAME, NAV_ITEMS } from "@/lib/FxConstants";
import {
  FxAppContent,
  FxAppFooter,
  FxAppHeader,
  FxAppShell,
  FxAppSidebar,
  FxNotificationArea,
  FxRightPanel,
} from "@/components/FxUI/AppShell";
import { FxButton } from "@/components/FxUI/Forms";

/* - - - - - - - - - - - - - - - - */

function buildSidebarNavigation() {
  return (
    <div className="space-y-1">
      {NAV_ITEMS.map((item, index) => (
        <div
          key={item.key}
          className={
            index === 0
              ? "border border-border bg-[var(--fx-surface-hover)] px-3 py-2 text-sm font-medium text-foreground"
              : "px-3 py-2 text-sm text-muted-foreground"
          }
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */

export default function WorkspaceLayout({ children }) {
  return (
    <FxAppShell
      sidebar={
        <FxAppSidebar
          header={
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {APP_NAME}
              </p>
              <p className="truncate text-sm font-semibold text-foreground">
                {APP_SHORT_NAME} Workspace
              </p>
            </div>
          }
          body={buildSidebarNavigation()}
          footer={
            <p className="text-[12px] leading-5 text-muted-foreground">
              Sidebar region is visible for shell review. Collapse behavior remains deferred.
            </p>
          }
        />
      }
      notificationArea={
        <FxNotificationArea>
          Workspace review route is exposing the full shell frame: sidebar, header, content, notification area, and footer region.
        </FxNotificationArea>
      }
      header={
        <FxAppHeader
          start={
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center border border-border bg-[var(--fx-surface-subtle)] text-[11px] font-semibold text-foreground">
                EA
              </div>
              <div className="hidden md:block">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Shared Header
                </p>
              </div>
            </div>
          }
          middle={
            <div className="flex min-w-0 items-center justify-center">
              <div className="flex w-full max-w-[520px] items-center gap-3 border border-border bg-[var(--fx-surface)] px-3 py-2 text-sm text-muted-foreground">
                <span>Search / middle region</span>
              </div>
            </div>
          }
          end={
            <>
              <FxButton variant="ghost" size="sm">
                Docs
              </FxButton>
              <FxButton variant="secondary" size="sm">
                User Menu
              </FxButton>
            </>
          }
        />
      }
      rightPanel={
        <FxRightPanel
          header={
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Optional
              </p>
              <p className="truncate text-sm font-semibold text-foreground">Right Panel</p>
            </div>
          }
          body={
            <p className="text-sm leading-6 text-muted-foreground">
              Reserved utility region for future inspectors, activity, or contextual tools.
            </p>
          }
        />
      }
      footer={
        <FxAppFooter hidden={false}>
          Footer scaffold is visible on this review route so the full AppShell frame can be reviewed.
        </FxAppFooter>
      }
    >
      <FxAppContent padded={false} widthClassName="max-w-none">{children}</FxAppContent>
    </FxAppShell>
  );
}
/* - - - - - - - - - - - - - - - - */
