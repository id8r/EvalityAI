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
import { ROUTES, STORAGE_KEYS } from "@/lib/FxConstants";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
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
const SETTINGS_ITEM = { key: "settings", label: "Settings", icon: Settings, href: ROUTES.settings };

// Header title for the current route (a job detail shows a generic label until job data lands).
function pageTitleFor(pathname) {
  if (pathname.startsWith(`${ROUTES.jobs}/`)) return "Job Workspace";
  return (
    [...NAV_ITEMS, SETTINGS_ITEM].find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label ?? ""
  );
}
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

  // Auth gate (demo): CONTINUOUSLY verify the session. If it's missing or tampered with (e.g. someone edits
  // the EvSession key in devtools), protected UI is hidden the same tick and we bounce to the landing (/) —
  // never /login, no popup. The interval catches same-tab devtools edits (storage events don't fire in the
  // tab that made the change); the storage listener catches other tabs instantly.
  useEffect(() => {
    let active = true;

    function verify() {
      if (!active) return;
      if (isAuthenticated()) {
        setAuthed(true);
        return;
      }
      active = false;
      setAuthed(false);
      router.replace(ROUTES.home);
    }

    verify();
    const interval = window.setInterval(verify, 1000);
    window.addEventListener("storage", verify);
    window.addEventListener("focus", verify);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("storage", verify);
      window.removeEventListener("focus", verify);
    };
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
    // Clear the demo auth fields (theme/sidebar in FxID8r + future Ev seed stay intact), then HARD-navigate
    // to the landing — a soft router.replace can let the auth gate re-mount and race a bounce to /login.
    signOut();
    window.location.assign(ROUTES.home);
  }

  if (!authed) return null;

  const title = pageTitleFor(pathname);

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
        icon={SETTINGS_ITEM.icon}
        label={SETTINGS_ITEM.label}
        href={SETTINGS_ITEM.href}
        active={isActive(SETTINGS_ITEM.href)}
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
            contentClassName="w-full px-6 md:px-8"
            start={
              title ? <h1 className={cn(FX_TYPOGRAPHY.sectionTitle, "truncate text-[var(--fx-text)]")}>{title}</h1> : null
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
