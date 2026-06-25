import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 border px-2.5 py-1 text-[12px] font-medium uppercase tracking-[0.1em]",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-border bg-[var(--fx-surface-subtle)] text-foreground",
        outline: "border-border bg-transparent text-foreground",
        success: "border-transparent bg-[color:color-mix(in_srgb,var(--fx-success)_16%,white)] text-[color:color-mix(in_srgb,var(--fx-success)_72%,black)]",
        warning: "border-transparent bg-[color:color-mix(in_srgb,var(--fx-warning)_16%,white)] text-[color:color-mix(in_srgb,var(--fx-warning)_78%,black)]",
        destructive: "border-transparent bg-[color:color-mix(in_srgb,var(--fx-danger)_14%,white)] text-[color:color-mix(in_srgb,var(--fx-danger)_78%,black)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({ className, variant, ...props }) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
