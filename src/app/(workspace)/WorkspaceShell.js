/* src/app/(workspace)/WorkspaceShell.js | Client workspace frame owning sidebar collapse | Sree | 2026-06-26 */

"use client";

import { useState, useSyncExternalStore } from "react";
import {
  Briefcase,
  Building2,
  LayoutDashboard,
  PanelLeftClose,
  Settings,
  Users,
} from "lucide-react";

import {
  FxAppContent,
  FxAppFooter,
  FxAppHeader,
  FxAppShell,
  FxAppSidebar,
  FxNotificationArea,
  FxRightPanel,
  FxSidebarAccount,
  FxSidebarNavItem,
} from "@/components/FxUI/AppShell";
import { FxButton } from "@/components/FxUI/Forms";
import { TooltipProvider } from "@/components/ui/tooltip";
import { APP_NAME, APP_SHORT_NAME } from "@/lib/FxConstants";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

const SIDEBAR_STORAGE_KEY = "evality.sidebar-collapsed";
const SIDEBAR_EVENT = "fx-sidebar-collapsed-change";

function subscribeCollapsed(callback) {
  window.addEventListener(SIDEBAR_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(SIDEBAR_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getCollapsedSnapshot() {
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
}

function getCollapsedServerSnapshot() {
  return false;
}

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "jobs", label: "Jobs", icon: Briefcase },
  { key: "candidates", label: "Candidates", icon: Users },
  { key: "clients", label: "Clients", icon: Building2 },
  { key: "settings", label: "Settings", icon: Settings },
];
/* - - - - - - - - - - - - - - - - */

function BrandMark() {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-[var(--fx-primary)] text-[12px] font-semibold text-[var(--fx-primary-foreground)]">
      EA
    </span>
  );
}
/* - - - - - - - - - - - - - - - - */

export default function WorkspaceShell({ children }) {
  const collapsed = useSyncExternalStore(subscribeCollapsed, getCollapsedSnapshot, getCollapsedServerSnapshot);
  const [activeKey, setActiveKey] = useState("dashboard");

  function toggleCollapsed() {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(!collapsed));
    window.dispatchEvent(new Event(SIDEBAR_EVENT));
  }

  const sidebarHeader = collapsed ? (
    <button type="button" onClick={toggleCollapsed} aria-label="Expand sidebar" className="cursor-pointer">
      <BrandMark />
    </button>
  ) : (
    <div className="flex w-full items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <BrandMark />
        <span className="truncate text-[14px] font-semibold text-[var(--fx-text)]">{APP_SHORT_NAME}</span>
      </div>
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label="Collapse sidebar"
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
      >
        <PanelLeftClose className="size-[18px]" />
      </button>
    </div>
  );

  const sidebarBody = (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <FxSidebarNavItem
          key={item.key}
          icon={item.icon}
          label={item.label}
          active={activeKey === item.key}
          collapsed={collapsed}
          onClick={() => setActiveKey(item.key)}
        />
      ))}
    </nav>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <FxAppShell
        sidebarCollapsed={collapsed}
        sidebar={
          <FxAppSidebar
            collapsed={collapsed}
            header={sidebarHeader}
            body={sidebarBody}
            footer={<FxSidebarAccount name="Alex Morgan" email="alex@evality.ai" collapsed={collapsed} />}
          />
        }
        notificationArea={
          <FxNotificationArea>
            Shell review route — toggle the sidebar, hover collapsed items for tooltips, and open the avatar menu.
          </FxNotificationArea>
        }
        header={
          <FxAppHeader
            start={
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {APP_NAME} Workspace
              </p>
            }
            middle={
              <div className="flex w-full max-w-[520px] items-center gap-3 border border-border bg-[var(--fx-surface)] px-3 py-2 text-sm text-muted-foreground">
                <span>Search / middle region</span>
              </div>
            }
            end={
              <>
                <FxButton variant="ghost" size="sm">
                  Docs
                </FxButton>
                <FxButton variant="secondary" size="sm">
                  Invite
                </FxButton>
              </>
            }
          />
        }
        rightPanel={
          <FxRightPanel
            header={
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Optional</p>
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
            Footer scaffold visible for shell review.
          </FxAppFooter>
        }
      >
        <FxAppContent padded={false} widthClassName="max-w-none">
          {children}
        </FxAppContent>
      </FxAppShell>
    </TooltipProvider>
  );
}
/* - - - - - - - - - - - - - - - - */
