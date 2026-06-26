/* src/components/FxUI/Forms/FxAiButton.js | Branded AI action button | Sree | 2026-06-26 */

import { Sparkles } from "lucide-react";

import { FX_BUTTON } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

const sizeClasses = {
  sm: cn(FX_BUTTON.height.sm, FX_BUTTON.paddingX.sm),
  md: cn(FX_BUTTON.height.md, FX_BUTTON.paddingX.md),
  lg: cn(FX_BUTTON.height.lg, FX_BUTTON.paddingX.lg),
};

const iconChipSize = {
  sm: "size-[18px]",
  md: "size-[20px]",
  lg: "size-[22px]",
};

const iconInnerSize = {
  sm: "size-[13px]",
  md: "size-[14px]",
  lg: "size-[15px]",
};
/* - - - - - - - - - - - - - - - - */

function FxAiButton({ className, icon: Icon = Sparkles, children, size = "md", type = "button", ...props }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-[8px] whitespace-nowrap border border-transparent text-[14px] font-medium text-white transition-[filter,box-shadow]",
        "bg-[linear-gradient(135deg,var(--fx-primary)_0%,var(--fx-ai)_100%)] shadow-[0_1px_2px_rgba(15,23,42,0.14)] hover:brightness-[1.04] hover:shadow-[0_6px_16px_color-mix(in_srgb,var(--fx-ai)_28%,transparent)] active:brightness-[0.98]",
        "dark:border-[color:color-mix(in_srgb,white_14%,transparent)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.32)] dark:hover:brightness-[1.08] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.38)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--fx-ai)_40%,transparent)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-[var(--fx-disabled-border)] disabled:bg-none disabled:bg-[var(--fx-disabled-bg)] disabled:text-[var(--fx-disabled-text)] disabled:shadow-none",
        FX_BUTTON.radius,
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      <span className={cn("inline-flex shrink-0 items-center justify-center rounded-full text-white", iconChipSize[size])}>
        <Icon className={iconInnerSize[size]} strokeWidth={1.9} />
      </span>
      <span>{children}</span>
    </button>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxAiButton };
/* - - - - - - - - - - - - - - - - */