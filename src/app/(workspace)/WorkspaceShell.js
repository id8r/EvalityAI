/* src/app/(workspace)/WorkspaceShell.js | Client workspace frame owning sidebar collapse | Sree | 2026-06-26 */

"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
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
import { APP_NAME, ROUTES, STORAGE_KEYS } from "@/lib/FxConstants";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

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
  return window.localStorage.getItem(STORAGE_KEYS.sidebarCollapsed) === "true";
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

// Logo is a wordmark — shown when expanded (links to root); collapsed shows the expand control only.
function BrandLogo() {
  return (
    <Link href={ROUTES.home} aria-label="Evality home" className="inline-flex items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/evality-logo.svg" alt="Evality" className="h-7 w-auto" />
    </Link>
  );
}
/* - - - - - - - - - - - - - - - - */

export default function WorkspaceShell({ children }) {
  const collapsed = useSyncExternalStore(subscribeCollapsed, getCollapsedSnapshot, getCollapsedServerSnapshot);
  const [activeKey, setActiveKey] = useState("action-center");

  function toggleCollapsed() {
    window.localStorage.setItem(STORAGE_KEYS.sidebarCollapsed, String(!collapsed));
    window.dispatchEvent(new Event(SIDEBAR_EVENT));
  }

  const sidebarHeader = collapsed ? (
    <button
      type="button"
      onClick={toggleCollapsed}
      aria-label="Expand sidebar"
      className="flex size-8 cursor-pointer items-center justify-center rounded-[8px] text-[var(--fx-text-muted)] transition-colors duration-100 hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
    >
      <PanelLeftOpen className="size-[18px]" />
    </button>
  ) : (
    <div className="flex w-full items-center justify-between gap-2">
      <BrandLogo />
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label="Collapse sidebar"
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-[var(--fx-text-muted)] transition-colors duration-100 hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
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
