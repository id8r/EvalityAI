/* src/components/FxUI/DataDisplay/FxBadge.js | Branded status badge | Sree | 2026-06-26 */

import { cva } from "class-variance-authority";

import { FX_BADGE } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Tones:   neutral · subtle · primary · success · warning · danger · info
  Variants: soft (tinted) · outline (bordered) · solid (filled)
  Sizes:   xs · sm · md

  Dual-theme by construction: tints are color-mixed against `--fx-surface` and text uses
  the raw semantic token, so a single class resolves correctly in light AND dark (no
  light-only mix-with-black/white). Solid colored tones use `--fx-primary-foreground`
  for their label, which already inverts per theme.
*/
const fxBadgeVariants = cva(FX_BADGE.base, {
  variants: {
    size: {
      xs: FX_BADGE.size.xs,
      sm: FX_BADGE.size.sm,
      md: FX_BADGE.size.md,
    },
    tone: {
      neutral: "",
      subtle: "",
      primary: "",
      success: "",
      warning: "",
      danger: "",
      info: "",
    },
    variant: {
      soft: "",
      outline: "",
      solid: "",
    },
  },
  compoundVariants: [
    /* soft — tinted background, colored text, no border */
    { variant: "soft", tone: "neutral", class: "border-transparent bg-[var(--fx-bg-soft)] text-[var(--fx-text)]" },
    { variant: "soft", tone: "subtle", class: "border-transparent bg-[var(--fx-surface-subtle)] text-[var(--fx-text-muted)]" },
    { variant: "soft", tone: "primary", class: "border-transparent bg-[var(--fx-surface-selected)] text-[var(--fx-primary)]" },
    { variant: "soft", tone: "success", class: "border-transparent bg-[color:color-mix(in_srgb,var(--fx-success)_14%,var(--fx-surface))] text-[var(--fx-success)]" },
    { variant: "soft", tone: "warning", class: "border-transparent bg-[color:color-mix(in_srgb,var(--fx-warning)_16%,var(--fx-surface))] text-[var(--fx-warning)]" },
    { variant: "soft", tone: "danger", class: "border-transparent bg-[color:color-mix(in_srgb,var(--fx-danger)_14%,var(--fx-surface))] text-[var(--fx-danger)]" },
    { variant: "soft", tone: "info", class: "border-transparent bg-[color:color-mix(in_srgb,var(--fx-info)_14%,var(--fx-surface))] text-[var(--fx-info)]" },

    /* outline — transparent background, colored border + text */
    { variant: "outline", tone: "neutral", class: "bg-transparent border-[var(--fx-border)] text-[var(--fx-text)]" },
    { variant: "outline", tone: "subtle", class: "bg-transparent border-[var(--fx-border-light)] text-[var(--fx-text-muted)]" },
    { variant: "outline", tone: "primary", class: "bg-transparent border-[color:color-mix(in_srgb,var(--fx-primary)_45%,transparent)] text-[var(--fx-primary)]" },
    { variant: "outline", tone: "success", class: "bg-transparent border-[color:color-mix(in_srgb,var(--fx-success)_45%,transparent)] text-[var(--fx-success)]" },
    { variant: "outline", tone: "warning", class: "bg-transparent border-[color:color-mix(in_srgb,var(--fx-warning)_50%,transparent)] text-[var(--fx-warning)]" },
    { variant: "outline", tone: "danger", class: "bg-transparent border-[color:color-mix(in_srgb,var(--fx-danger)_45%,transparent)] text-[var(--fx-danger)]" },
    { variant: "outline", tone: "info", class: "bg-transparent border-[color:color-mix(in_srgb,var(--fx-info)_45%,transparent)] text-[var(--fx-info)]" },

    /* solid — filled background, inverted text */
    { variant: "solid", tone: "neutral", class: "border-transparent bg-[var(--fx-text)] text-[var(--fx-surface)]" },
    { variant: "solid", tone: "subtle", class: "border-transparent bg-[var(--fx-surface-muted)] text-[var(--fx-text)]" },
    { variant: "solid", tone: "primary", class: "border-transparent bg-[var(--fx-primary)] text-[var(--fx-primary-foreground)]" },
    { variant: "solid", tone: "success", class: "border-transparent bg-[var(--fx-success)] text-[var(--fx-primary-foreground)]" },
    { variant: "solid", tone: "warning", class: "border-transparent bg-[var(--fx-warning)] text-[var(--fx-primary-foreground)]" },
    { variant: "solid", tone: "danger", class: "border-transparent bg-[var(--fx-danger)] text-[var(--fx-primary-foreground)]" },
    { variant: "solid", tone: "info", class: "border-transparent bg-[var(--fx-info)] text-[var(--fx-primary-foreground)]" },
  ],
  defaultVariants: {
    tone: "neutral",
    variant: "soft",
    size: "sm",
  },
});
/* - - - - - - - - - - - - - - - - */

// `dot` renders a leading status dot in the current text color — for table status cells.
function FxBadge({ className, tone, variant, size, dot = false, children, ...props }) {
  return (
    <span data-slot="fx-badge" className={cn(fxBadgeVariants({ tone, variant, size }), className)} {...props}>
      {dot ? <span aria-hidden="true" className="size-[6px] shrink-0 rounded-full bg-current opacity-80" /> : null}
      {children}
    </span>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxBadge, fxBadgeVariants };
/* - - - - - - - - - - - - - - - - */