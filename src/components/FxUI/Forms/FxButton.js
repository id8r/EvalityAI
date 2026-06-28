/* src/components/FxUI/Forms/FxButton.js | Branded button over the Base UI primitive | Sree | 2026-06-26 */

import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";

import { FX_BUTTON } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

const fxButtonVariants = cva(FX_BUTTON.base, {
  variants: {
    variant: {
      primary:
        "border-transparent bg-[var(--fx-primary)] text-[var(--fx-primary-foreground)] hover:bg-[var(--fx-primary-hover)]",
      accent:
        "border-transparent bg-[var(--fx-accent)] text-white hover:bg-[color:color-mix(in_srgb,var(--fx-accent)_88%,black)]",
      hero:
        "border-transparent bg-[var(--fx-primary)] text-[var(--fx-primary-foreground)] hover:bg-[var(--fx-primary-hover)]",
      secondary:
        "border-[color:color-mix(in_srgb,var(--fx-primary)_75%,transparent)] bg-[var(--fx-surface)] text-[var(--fx-primary)] hover:border-[color:color-mix(in_srgb,var(--fx-primary-hover)_75%,transparent)] hover:bg-[var(--fx-surface-hover)]",
      outline:
        "border-[var(--fx-border)] bg-transparent text-[var(--fx-text)] hover:bg-[var(--fx-surface-hover)] hover:border-[color:color-mix(in_srgb,var(--fx-border-strong)_60%,transparent)]",
      ghost:
        "border-transparent bg-transparent text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]",
      destructive:
        "border-transparent bg-[var(--fx-danger)] text-white hover:bg-[color:color-mix(in_srgb,var(--fx-danger)_88%,black)]",
      destructiveOutline:
        "border-[var(--fx-danger)] bg-transparent text-[var(--fx-danger)] hover:bg-[color:color-mix(in_srgb,var(--fx-danger)_10%,transparent)]",
      // Soft danger: red border + subtle red fill — a low-emphasis, secondary-style danger action.
      destructiveSoft:
        "border-[color:color-mix(in_srgb,var(--fx-danger)_45%,transparent)] bg-[color:color-mix(in_srgb,var(--fx-danger)_10%,var(--fx-surface))] text-[var(--fx-danger)] hover:bg-[color:color-mix(in_srgb,var(--fx-danger)_16%,var(--fx-surface))]",
    },
    size: {
      xs: cn(FX_BUTTON.height.xs, FX_BUTTON.paddingX.xs, "text-[12px]"),
      sm: cn(FX_BUTTON.height.sm, FX_BUTTON.paddingX.sm, "text-[13px]"),
      md: cn(FX_BUTTON.height.md, FX_BUTTON.paddingX.md, "text-[14px]"),
      lg: cn(FX_BUTTON.height.lg, FX_BUTTON.paddingX.lg, "text-[14px]"),
      xl: cn(FX_BUTTON.height.xl, FX_BUTTON.paddingX.xl, "text-[14px]"),
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

const iconOnlySizeClasses = {
  xs: "size-[30px] p-0",
  sm: "size-[34px] p-0",
  md: "size-[40px] p-0",
  lg: "size-[44px] p-0",
  xl: "size-[48px] p-0",
};

// Usage: <FxButton variant="primary|secondary|outline|ghost|destructive" size="sm|md|lg">Label</FxButton>
function FxButton({
  className,
  variant,
  size,
  iconOnly = false,
  loading = false,
  type = "button",
  disabled = false,
  children,
  ...props
}) {
  const isDisabled = loading || disabled;
  // Hero is the pill-shaped marketing CTA — fully rounded regardless of size.
  const radiusClass = variant === "hero" ? "rounded-full" : FX_BUTTON.radiusBySize[size ?? "md"] ?? FX_BUTTON.radius;

  return (
    <ButtonPrimitive
      type={type}
      aria-busy={loading ? "true" : undefined}
      disabled={isDisabled}
      className={cn(
        fxButtonVariants({ variant, size }),
        radiusClass,
        FX_BUTTON.transition,
        FX_BUTTON.gap,
        iconOnly && iconOnlySizeClasses[size ?? "md"],
        iconOnly && "justify-center",
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          {iconOnly ? null : <span>Loading</span>}
        </span>
      ) : (
        children
      )}
    </ButtonPrimitive>
  );
}

function FxIconButton({ children, className, size = "sm", variant = "outline", loading = false, disabled = false, ...props }) {
  return (
    <FxButton
      iconOnly
      size={size}
      variant={variant}
      loading={loading}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </FxButton>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxButton, FxIconButton, fxButtonVariants };
/* - - - - - - - - - - - - - - - - */
