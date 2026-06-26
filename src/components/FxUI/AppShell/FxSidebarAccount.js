/* src/components/FxUI/AppShell/FxSidebarAccount.js | Sidebar account avatar with menu | Sree | 2026-06-26 */

"use client";

import { useSyncExternalStore } from "react";
import { ChevronsUpDown, CircleHelp, LogOut, Moon, Settings, Sun } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

function getInitials(name) {
  return (
    String(name ?? "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}
/* - - - - - - - - - - - - - - - - */

function subscribeTheme(callback) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getThemeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getThemeServerSnapshot() {
  return false;
}
/* - - - - - - - - - - - - - - - - */

function FxSidebarAccount({ name = "User", email = "", collapsed = false }) {
  const isDark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);

  /* Lightweight visual theme toggle for shell verification — not the full theme system. */
  function handleToggleTheme() {
    document.documentElement.classList.toggle("dark", !isDark);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open account menu"
          className={cn(
            "flex w-full items-center gap-3 rounded-[8px] px-2 py-2 text-left transition-colors hover:bg-[var(--fx-surface-hover)]",
            collapsed && "justify-center px-0",
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-[var(--fx-surface-muted)] text-[12px] font-semibold text-[var(--fx-text)]">
            {getInitials(name)}
          </span>
          <span
            aria-hidden={collapsed}
            className={cn(
              "min-w-0 flex-1 transition-[max-width,opacity] duration-200 ease-out",
              collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100",
            )}
          >
            <span className="block truncate text-[14px] font-medium leading-5 text-[var(--fx-text)]">{name}</span>
            {email ? <span className="block truncate text-[13px] leading-5 text-[var(--fx-text-muted)]">{email}</span> : null}
          </span>
          {!collapsed ? <ChevronsUpDown className="size-4 shrink-0 text-[var(--fx-text-muted)]" /> : null}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" side="top" className="w-[220px]">
        <DropdownMenuLabel>{name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(event) => event.preventDefault()} onClick={handleToggleTheme}>
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          <span>Theme</span>
          <span className="ml-auto text-[12px] text-[var(--fx-text-muted)]">{isDark ? "Dark" : "Light"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="size-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CircleHelp className="size-4" />
          <span>Help</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="size-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxSidebarAccount };
/* - - - - - - - - - - - - - - - - */
