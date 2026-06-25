"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({ className, ...props }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 items-center border border-transparent bg-[var(--fx-surface-muted)] shadow-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-[var(--fx-disabled-border)]",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-5 translate-x-0.5 bg-white shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-[1.25rem]"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
