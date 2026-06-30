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
          // Near-black tooltip (our --fx-dark-panel) with fixed light text — the bg is dark in both themes.
          "z-50 max-w-[220px] overflow-hidden rounded-[6px] bg-[var(--fx-dark-panel)] px-2.5 py-1.5 text-xs leading-5 text-[#f1f4f9]",
          FX_SHADOW.md,
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
