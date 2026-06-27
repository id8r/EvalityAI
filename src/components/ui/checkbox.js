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
        // Fx customization: rounded-[3px] corners + a SUBTLE fill — checked/indeterminate use the soft
        // `--fx-surface-selected` tint (same token as a selected table row) with a primary border and a
        // primary glyph, instead of a loud solid-blue box. Token-driven, so it adapts to dark mode.
        "peer size-4 shrink-0 rounded-[3px] border border-input bg-[var(--fx-surface)] shadow-none outline-none transition-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-[var(--fx-primary)] data-[state=checked]:bg-[var(--fx-surface-selected)] data-[state=indeterminate]:border-[var(--fx-primary)] data-[state=indeterminate]:bg-[var(--fx-surface-selected)]",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-[var(--fx-primary)]"
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
