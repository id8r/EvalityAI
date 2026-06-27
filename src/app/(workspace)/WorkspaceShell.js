/* src/app/(workspace)/WorkspaceShell.js | Client workspace frame owning sidebar collapse | Sree | 2026-06-26 */

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { getStored, setStored } from "@/lib/FxStorage";
import { isAuthenticated, signOut } from "@/lib/EvSession";
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
  // Sidebar-Open is "Y" | "N"; collapsed only when explicitly "N" (default expanded).
  return getStored(STORAGE_KEYS.sidebarOpen) === "N";
}

function getCollapsedServerSnapshot() {
  return false;
}

/* Workspace nav → routes. ("Action Center" label, /home URL — the evolving recruiter workbench.) */
const NAV_ITEMS = [
  { key: "home", label: "Action Center", icon: Inbox, href: ROUTES.workbench },
  { key: "jobs", label: "Jobs", icon: FileText, href: ROUTES.jobs },
  { key: "candidates", label: "Candidates", icon: Users, href: ROUTES.candidates },
  { key: "clients", label: "Clients", icon: FolderOpen, href: ROUTES.clients },
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
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  // Auth gate (demo): unauthenticated visitors are bounced to /login; nothing protected renders until authed.
  useEffect(() => {
    if (isAuthenticated()) setAuthed(true);
    else router.replace(ROUTES.login);
  }, [router]);

  // Active when on the route or a sub-route (e.g. /jobs and /jobs/123).
  function isActive(href) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function toggleCollapsed() {
    // toggling to next state: open ("Y") when currently collapsed, else collapsed ("N").
    setStored(STORAGE_KEYS.sidebarOpen, collapsed ? "Y" : "N");
    window.dispatchEvent(new Event(SIDEBAR_EVENT));
  }

  function handleLogout() {
    // Clear the demo session only — Fx UI prefs (FxID8r) and Ev seed data stay intact.
    signOut();
    router.replace(ROUTES.home);
  }

  if (!authed) return null;

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
          href={item.href}
          active={isActive(item.href)}
          collapsed={collapsed}
        />
      ))}
    </nav>
  );

  const sidebarFooter = (
    <div className="space-y-2">
      <FxSidebarNavItem
        icon={Settings}
        label="Settings"
        href={ROUTES.settings}
        active={isActive(ROUTES.settings)}
        collapsed={collapsed}
      />
      <div className="h-px bg-border" />
      <FxSidebarAccount name="Alex Morgan" email="alex@evality.ai" collapsed={collapsed} onLogout={handleLogout} />
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
