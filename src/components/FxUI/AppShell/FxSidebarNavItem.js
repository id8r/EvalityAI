// src/components/FxUI/AppShell/FxSidebarNavItem.js | Collapsible sidebar nav item | Sree | 2026-06-26

import Link from "next/link";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FX_NAVIGATION } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

// Icon is left-aligned at px-[12px]; with body px-[12px] + collapsed width 72 it lands centered when collapsed (no shift).
function FxSidebarNavItem({ icon: Icon, label, href, onClick, active = false, collapsed = false, className }) {
  const base = cn(
    FX_NAVIGATION.itemBase,
    active ? FX_NAVIGATION.itemActive : FX_NAVIGATION.itemInactive,
    className,
  );

  const inner = (
    <>
      <span className={FX_NAVIGATION.iconSlot}>
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
