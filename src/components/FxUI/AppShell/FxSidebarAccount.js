/* src/components/FxUI/AppShell/FxSidebarAccount.js | Sidebar account avatar with menu | Sree | 2026-06-26 */

"use client";

import { ChevronsUpDown, CircleHelp, LogOut, Moon, Sun } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toggleTheme, useFxIsDark } from "@/components/FxUI/AppShell/useFxTheme";
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

function FxSidebarAccount({ name = "User", email = "", collapsed = false }) {
  const isDark = useFxIsDark();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open account menu"
          className="flex w-full items-center overflow-hidden rounded-[8px] py-1 text-left transition-colors duration-100 hover:bg-[var(--fx-surface-hover)]"
        >
          <span className="flex w-[48px] shrink-0 items-center justify-center">
            <span className="flex size-9 items-center justify-center rounded-[8px] bg-[var(--fx-surface-muted)] text-[12px] font-semibold text-[var(--fx-text)]">
              {getInitials(name)}
            </span>
          </span>
          <span
            aria-hidden={collapsed}
            className={cn(
              "min-w-0 flex-1 transition-opacity duration-150 ease-out",
              collapsed ? "opacity-0" : "opacity-100",
            )}
          >
            <span className="block truncate text-[14px] font-medium leading-5 text-[var(--fx-text)]">{name}</span>
            {email ? <span className="block truncate text-[13px] leading-5 text-[var(--fx-text-muted)]">{email}</span> : null}
          </span>
          <ChevronsUpDown
            aria-hidden={collapsed}
            className={cn(
              "mr-[12px] size-4 shrink-0 text-[var(--fx-text-muted)] transition-opacity duration-150",
              collapsed ? "opacity-0" : "opacity-100",
            )}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" side="top" className="w-[220px]">
        <DropdownMenuItem onSelect={(event) => event.preventDefault()} onClick={() => toggleTheme(isDark)}>
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          <span>Theme</span>
          <span className="ml-auto text-[12px] text-[var(--fx-text-muted)]">{isDark ? "Dark" : "Light"}</span>
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
