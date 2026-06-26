"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { FX_SHADOW } from "@/lib/FxTheme";
import { cn } from "@/lib/utils";

function TooltipProvider({ delayDuration = 0, ...props }) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />;
}

function Tooltip({ ...props }) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ ...props }) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({ className, sideOffset = 6, ...props }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-w-[220px] overflow-hidden rounded-[8px] border border-[var(--fx-border-light)] bg-[var(--fx-surface-raised)] px-3 py-2 text-xs leading-5 text-foreground",
          FX_SHADOW.md,
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
