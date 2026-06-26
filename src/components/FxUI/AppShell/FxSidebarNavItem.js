// src/components/FxUI/AppShell/FxSidebarNavItem.js | Collapsible sidebar nav item | Sree | 2026-06-26

"use client";

import Link from "next/link";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

// Icon is left-aligned at px-[12px]; with body px-[12px] + collapsed width 72 it lands centered when collapsed (no shift).
function FxSidebarNavItem({ icon: Icon, label, href, onClick, active = false, collapsed = false, className }) {
  const base = cn(
    "group relative flex h-11 w-full items-center gap-[12px] overflow-hidden rounded-[8px] px-[12px] text-left transition-colors duration-100",
    active
      ? "bg-[var(--fx-surface-selected)] text-[var(--fx-primary)]"
      : "text-[var(--fx-text)] hover:bg-[var(--fx-surface-hover)]",
    className,
  );

  const inner = (
    <>
      <span className="flex size-6 shrink-0 items-center justify-center">
        {Icon ? <Icon className="size-[20px]" strokeWidth={1.8} /> : null}
      </span>
      <span
        aria-hidden={collapsed}
        className={cn(
          "min-w-0 flex-1 truncate whitespace-nowrap text-[14px] font-medium leading-5 transition-opacity duration-150 ease-out",
          collapsed ? "opacity-0" : "opacity-100",
        )}
      >
        {label}
      </span>
    </>
  );

  const item = href ? (
    <Link href={href} onClick={onClick} aria-current={active ? "page" : undefined} className={base}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} aria-current={active ? "page" : undefined} className={base}>
      {inner}
    </button>
  );

  if (!collapsed) {
    return item;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{item}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxSidebarNavItem };
/* - - - - - - - - - - - - - - - - */
