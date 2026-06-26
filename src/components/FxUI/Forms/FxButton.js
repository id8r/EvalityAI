/* src/components/FxUI/Forms/FxButton.js | Branded button wrapper | Sree | 2026-06-25 */

import { cva } from "class-variance-authority";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/FxUtils";

const fxButtonVariants = cva(
  "h-10 px-4 text-[14px] font-medium tracking-[-0.01em] shadow-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-[var(--fx-primary-hover)]",
        secondary:
          "border-border bg-[var(--fx-surface)] text-foreground hover:border-[var(--fx-border-strong)] hover:bg-[var(--fx-surface-hover)]",
        ghost:
          "bg-transparent text-muted-foreground hover:bg-[var(--fx-surface-hover)] hover:text-foreground",
        destructive: "bg-[var(--fx-danger)] text-white hover:bg-[color:color-mix(in_srgb,var(--fx-danger)_88%,black)]",
      },
      size: {
        sm: "h-9 px-3 text-[13px]",
        md: "h-10 px-4 text-[14px]",
        lg: "h-11 px-5 text-[14px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

function FxButton({ className, variant, size, ...props }) {
  const primitiveVariant = variant === "secondary" ? "outline" : variant === "ghost" ? "ghost" : "default";

  return (
    <Button
      variant={primitiveVariant}
      size="default"
      className={cn(fxButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { FxButton };
