/* src/components/FxUI/AppShell/FxSidebarNavItem.js | Collapsible sidebar nav item | Sree | 2026-06-26 */

"use client";

import Link from "next/link";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FX_NAVIGATION } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

function FxSidebarNavItem({ icon: Icon, label, href, onClick, active = false, collapsed = false, className }) {
  const itemClassName = cn(
    FX_NAVIGATION.itemBase,
    active ? FX_NAVIGATION.itemActive : FX_NAVIGATION.itemInactive,
    collapsed ? "justify-center gap-0 px-0" : "",
    className,
  );

  const inner = (
    <>
      <span className={FX_NAVIGATION.iconSlot}>
        {Icon ? <Icon className="size-[20px] shrink-0" strokeWidth={1.8} /> : null}
      </span>
      <span
        aria-hidden={collapsed}
        className={cn(
          "min-w-0 truncate transition-[max-width,opacity] duration-200 ease-out",
          collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100",
        )}
      >
        {label}
      </span>
    </>
  );

  const item = href ? (
    <Link href={href} onClick={onClick} aria-current={active ? "page" : undefined} className={itemClassName}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} aria-current={active ? "page" : undefined} className={cn("w-full text-left", itemClassName)}>
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
