/* src/app/(workspace)/WorkspaceShell.js | Client workspace frame owning sidebar collapse | Sree | 2026-06-26 */

"use client";

import { useState, useSyncExternalStore } from "react";
import { FileText, FolderOpen, Inbox, PanelLeftClose, PanelLeftOpen, Settings, Users } from "lucide-react";

import {
  FxAppContent,
  FxAppHeader,
  FxAppShell,
  FxAppSidebar,
  FxSidebarAccount,
  FxSidebarNavItem,
} from "@/components/FxUI/AppShell";
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

/* Nav items, icons, and placement mirror the older evality-rfa sidebar. */
const NAV_ITEMS = [
  { key: "action-center", label: "Action Center", icon: Inbox },
  { key: "jobs", label: "Jobs", icon: FileText },
  { key: "candidates", label: "Candidates", icon: Users },
  { key: "clients", label: "Clients", icon: FolderOpen },
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
  const [activeKey, setActiveKey] = useState("action-center");

  function toggleCollapsed() {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(!collapsed));
    window.dispatchEvent(new Event(SIDEBAR_EVENT));
  }

  const sidebarHeader = collapsed ? (
    <button
      type="button"
      onClick={toggleCollapsed}
      aria-label="Expand sidebar"
      className="group relative flex size-8 cursor-pointer items-center justify-center rounded-[8px]"
    >
      <span className="transition-opacity duration-150 group-hover:opacity-0">
        <BrandMark />
      </span>
      <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <PanelLeftOpen className="size-[18px] text-[var(--fx-text-muted)]" />
      </span>
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

  const sidebarFooter = (
    <div className="space-y-2">
      <FxSidebarNavItem
        icon={Settings}
        label="Settings"
        active={activeKey === "settings"}
        collapsed={collapsed}
        onClick={() => setActiveKey("settings")}
      />
      <div className="h-px bg-border" />
      <FxSidebarAccount name="Alex Morgan" email="alex@evality.ai" collapsed={collapsed} />
    </div>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <FxAppShell
        sidebar={
          <FxAppSidebar collapsed={collapsed} header={sidebarHeader} body={sidebarBody} footer={sidebarFooter} />
        }
        header={
          <FxAppHeader
            start={
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {APP_NAME} Workspace
              </p>
            }
          />
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
