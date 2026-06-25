import * as React from "react";

import { cn } from "@/lib/utils";

const inputBaseClassName =
  "flex h-10 w-full min-w-0 border border-input bg-[var(--fx-surface)] px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-[border-color,box-shadow,background-color] placeholder:text-[var(--fx-text-disabled)] focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:border-[var(--fx-disabled-border)] disabled:bg-[var(--fx-disabled-bg)] disabled:text-[var(--fx-disabled-text)] disabled:shadow-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20";

const Input = React.forwardRef(function Input({ className, type = "text", ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(inputBaseClassName, className)}
      {...props}
    />
  );
});

export { Input, inputBaseClassName };
