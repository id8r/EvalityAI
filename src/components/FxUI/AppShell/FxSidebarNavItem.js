/* src/components/FxUI/AppShell/FxSidebarNavItem.js | Collapsible sidebar nav item | Sree | 2026-06-26 */

"use client";

import Link from "next/link";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/* Fixed leading icon rail = collapsed sidebar inner width (72 − 2×12px body padding).
   The icon stays centered in this rail in both states, so it never shifts on collapse. */
const ICON_RAIL = "w-[48px]";

function FxSidebarNavItem({ icon: Icon, label, href, onClick, active = false, collapsed = false, className }) {
  const base = cn(
    "group relative flex h-11 w-full items-center overflow-hidden rounded-[8px] transition-colors",
    active
      ? "bg-[var(--fx-surface-selected)] text-[var(--fx-primary)]"
      : "text-[var(--fx-text)] hover:bg-[var(--fx-surface-hover)]",
    className,
  );

  const inner = (
    <>
      <span className={cn("flex h-full shrink-0 items-center justify-center", ICON_RAIL)}>
        {Icon ? <Icon className="size-[20px]" strokeWidth={1.8} /> : null}
      </span>
      <span
        aria-hidden={collapsed}
        className={cn(
          "min-w-0 flex-1 truncate whitespace-nowrap pr-[12px] text-[14px] font-medium leading-5 transition-opacity duration-150 ease-out",
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
