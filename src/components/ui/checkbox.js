"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({ className, checked, ...props }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      checked={checked}
      className={cn(
        "peer size-4 shrink-0 rounded-[5px] border border-input bg-[var(--fx-surface)] text-primary shadow-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-primary-foreground"
      >
        {checked === "indeterminate" ? (
          <Minus className="size-3" strokeWidth={2.4} />
        ) : (
          <Check className="size-3" strokeWidth={2.4} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
