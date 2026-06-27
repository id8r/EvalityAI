import * as React from "react";

import { cn } from "@/lib/utils";

const inputBaseClassName =
  "flex h-10 w-full min-w-0 rounded-[6px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-4 py-0 text-[14px] leading-[22px] text-[var(--fx-text)] shadow-none outline-none transition-[border-color,background-color] placeholder:text-[var(--fx-text-disabled)] focus-visible:border-[var(--fx-primary)] focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:border-[var(--fx-disabled-border)] disabled:bg-[var(--fx-disabled-bg)] disabled:text-[var(--fx-disabled-text)] disabled:shadow-none aria-invalid:border-[var(--fx-danger)] aria-invalid:ring-0";

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
