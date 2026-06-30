/* src/components/FxUI/DataDisplay/FxTableCells.js | Typed table cell preset library | Sree | 2026-06-26 */

"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

import { FxBadge } from "@/components/FxUI/DataDisplay/FxBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { formatSalaryRange } from "@/lib/EvFormat";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

const EMPTY = "—";

function stop(event) {
  event.stopPropagation();
}

function isBlank(value) {
  return value == null || value === "";
}
/* - - - - - - - - - - - - - - - - */
/* Formatters — small and local. Promote to a shared FxFormat util only if reused outside tables. */

export function formatCurrency(amount, currency = "USD") {
  if (isBlank(amount)) return EMPTY;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(amount));
  } catch {
    return `${amount}`;
  }
}

export function formatCompactDate(value) {
  if (isBlank(value)) return EMPTY;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY;
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
}

export function formatRelativeTime(value, now = new Date()) {
  if (isBlank(value)) return EMPTY;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY;
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  const diffWeeks = Math.round(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatAvailability(days) {
  if (isBlank(days)) return EMPTY;
  const value = Number(days);
  if (Number.isNaN(value)) return String(days);
  if (value <= 0) return "Immediate";
  return `${value} day${value === 1 ? "" : "s"}`;
}
/* - - - - - - - - - - - - - - - - */
/* Cell components — each maps to one row in the frozen cell-type catalogue. */

function EmptyDash() {
  return <span className="text-[var(--fx-text-muted)]">{EMPTY}</span>;
}

/* Status dot — semantic tones mirror FxBadge. Reusable across link/text/stacked cells. */
const DOT_TONE_CLASS = {
  neutral: "bg-[var(--fx-text-muted)]",
  subtle: "bg-[var(--fx-border-strong)]",
  primary: "bg-[var(--fx-primary)]",
  success: "bg-[var(--fx-success)]",
  warning: "bg-[var(--fx-warning)]",
  danger: "bg-[var(--fx-danger)]",
  info: "bg-[var(--fx-info)]",
};

export function FxCellDot({ tone = "neutral", pulse = false, title, className }) {
  return (
    <span title={title} aria-hidden={title ? undefined : "true"} className="relative inline-flex shrink-0">
      {pulse ? (
        <span className={cn("absolute inset-0 animate-ping rounded-full opacity-60", DOT_TONE_CLASS[tone] ?? DOT_TONE_CLASS.neutral)} />
      ) : null}
      <span className={cn("relative inline-block size-[8px] rounded-full", DOT_TONE_CLASS[tone] ?? DOT_TONE_CLASS.neutral, className)} />
    </span>
  );
}

/*
  `indicator` may be:
    - a tone string ("warning")
    - an object { tone, pulse, title }
    - `true` or { tone: null } → RESERVE the dot gutter but render it invisible
  Passing any object/true reserves the leading slot, so text stays aligned whether or not a
  given row shows a dot. Passing nothing/undefined adds no gutter at all.
*/
function normalizeIndicator(indicator) {
  if (indicator == null || indicator === false) return null;
  if (indicator === true) return { tone: null };
  return typeof indicator === "string" ? { tone: indicator } : indicator;
}

function withIndicator(node, indicator) {
  const config = normalizeIndicator(indicator);
  if (!config) return node;
  return (
    <span className="flex min-w-0 items-center gap-2">
      {config.tone ? (
        <FxCellDot tone={config.tone} pulse={config.pulse} title={config.title} />
      ) : (
        <span aria-hidden="true" className="inline-block size-[8px] shrink-0" />
      )}
      {node}
    </span>
  );
}

export function FxTextCell({ value, muted = false, indicator, title, className }) {
  if (isBlank(value)) return <EmptyDash />;
  return withIndicator(
    <span className={cn("block min-w-0 truncate", muted ? "text-[var(--fx-text-muted)]" : "text-[var(--fx-text)]", className)} title={title}>
      {value}
    </span>,
    indicator,
  );
}

export function FxLinkCell({ value, href, onClick, tone = "primary", indicator, title, className }) {
  if (isBlank(value)) return <EmptyDash />;
  const classes = cn(
    "block min-w-0 truncate",
    FX_TYPOGRAPHY.clickable,
    tone === "primary" ? "text-[var(--fx-primary)] hover:text-[var(--fx-text)]" : "text-[var(--fx-text)] hover:text-[var(--fx-primary)]",
    className,
  );
  const link = href ? (
    <Link href={href} className={classes} title={title ?? (typeof value === "string" ? value : undefined)} onClick={stop}>
      {value}
    </Link>
  ) : (
    <button
      type="button"
      className={cn(classes, "text-left")}
      title={title}
      onClick={(event) => {
        stop(event);
        onClick?.(event);
      }}
    >
      {value}
    </button>
  );
  return withIndicator(link, indicator);
}

export function FxBadgeCell({ value, label, tone = "neutral", variant = "soft", size = "sm", dot = false, className }) {
  const content = label ?? value;
  if (isBlank(content)) return <EmptyDash />;
  return (
    <FxBadge tone={tone} variant={variant} size={size} dot={dot} className={className}>
      {content}
    </FxBadge>
  );
}

const SCORE_TONE_CLASS = {
  success: "bg-[color:color-mix(in_srgb,var(--fx-success)_14%,var(--fx-surface))] text-[var(--fx-success)]",
  warning: "bg-[color:color-mix(in_srgb,var(--fx-warning)_16%,var(--fx-surface))] text-[var(--fx-warning)]",
  danger: "bg-[color:color-mix(in_srgb,var(--fx-danger)_14%,var(--fx-surface))] text-[var(--fx-danger)]",
  primary: "bg-[var(--fx-surface-selected)] text-[var(--fx-primary)]",
};

export function FxScoreCell({ value, suffix = "%", tone, onClick, className }) {
  const text = isBlank(value) ? EMPTY : `${value}${suffix}`;
  if (tone || onClick) {
    return (
      <button
        type="button"
        disabled={!onClick}
        onClick={(event) => {
          stop(event);
          onClick?.(event);
        }}
        className={cn(
          "inline-flex h-7 min-w-[56px] items-center justify-center rounded-[6px] px-2 text-[13px] font-medium tabular-nums",
          onClick ? "transition-opacity hover:opacity-80" : "cursor-default",
          SCORE_TONE_CLASS[tone] ?? "bg-[var(--fx-surface-muted)] text-[var(--fx-text)]",
          className,
        )}
      >
        {text}
      </button>
    );
  }
  return <span className={cn("font-medium tabular-nums text-[var(--fx-text)]", className)}>{text}</span>;
}

export function FxNumberCell({ value, href, onClick, title, className }) {
  const text = isBlank(value) ? EMPTY : value;
  const interactive = !isBlank(value) && (href || onClick);
  const content = (
    <span
      className={cn(
        "inline-flex min-w-[56px] items-center justify-center rounded-[8px] px-[8px] py-[4px] text-center text-[14px] leading-[22px]",
        interactive ? "font-medium text-[var(--fx-primary)]" : "tabular-nums text-[var(--fx-text)]",
        className,
      )}
    >
      {text}
    </span>
  );

  if (href && !isBlank(value)) {
    return (
      <Link
        href={href}
        onClick={stop}
        title={title}
        className="inline-flex w-full items-center justify-center rounded-[6px] text-[var(--fx-primary)] transition-none hover:bg-[color:color-mix(in_srgb,var(--fx-bg-soft)_90%,var(--fx-surface)_88%)] hover:text-[color:color-mix(in_srgb,var(--fx-primary)_82%,black_18%)]"
      >
        {content}
      </Link>
    );
  }
  if (onClick && !isBlank(value)) {
    return (
      <button
        type="button"
        onClick={(event) => {
          stop(event);
          onClick(event);
        }}
        title={title}
        className="inline-flex w-full items-center justify-center rounded-[8px] text-[var(--fx-primary)] transition-colors hover:bg-[color:color-mix(in_srgb,var(--fx-bg-soft)_72%,var(--fx-surface)_28%)] hover:text-[color:color-mix(in_srgb,var(--fx-primary)_82%,black_18%)]"
      >
        {content}
      </button>
    );
  }
  return <span className={cn("tabular-nums text-[var(--fx-text)]", className)}>{text}</span>;
}

export function FxCurrencyCell({ amount, currency = "USD", className }) {
  return <span className={cn("tabular-nums text-[var(--fx-text)]", className)}>{formatCurrency(amount, currency)}</span>;
}

export function FxSalaryRangeCell({ range, compact = false, className }) {
  return <span className={cn("tabular-nums text-[var(--fx-text)]", className)}>{formatSalaryRange(range, { compact })}</span>;
}

export function FxDateCell({ value, mode = "relative", className }) {
  if (isBlank(value)) return <EmptyDash />;
  const date = new Date(value);
  const text = mode === "compact" ? formatCompactDate(date) : formatRelativeTime(date);
  return (
    <span className={cn("text-[var(--fx-text-muted)]", className)} title={Number.isNaN(date.getTime()) ? undefined : date.toLocaleString()}>
      {text}
    </span>
  );
}

export function FxAvailabilityCell({ days, className }) {
  return <span className={cn("text-[var(--fx-text)]", className)}>{formatAvailability(days)}</span>;
}

export function FxStackedCell({ primary, secondary, indicator, onClick, className }) {
  const inner = (
    <>
      <span className="block truncate text-[14px] leading-[20px] text-[var(--fx-text)]">{primary}</span>
      {!isBlank(secondary) ? <span className="block truncate text-[12px] leading-[18px] text-[var(--fx-text-muted)]">{secondary}</span> : null}
    </>
  );
  const block = onClick ? (
    <button
      type="button"
      className={cn("block min-w-0 text-left", className)}
      onClick={(event) => {
        stop(event);
        onClick(event);
      }}
    >
      {inner}
    </button>
  ) : (
    <div className={cn("min-w-0", className)}>{inner}</div>
  );
  return withIndicator(block, indicator);
}

function FxInlineAction({ icon: Icon, label, onClick, tone, disabled = false }) {
  const button = (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={(event) => {
        stop(event);
        onClick?.(event);
      }}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-[6px] transition-colors hover:bg-[var(--fx-bg-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fx-ring)] disabled:pointer-events-none disabled:opacity-50",
        tone === "danger"
          ? "text-[var(--fx-danger)]"
          : tone === "warning"
            ? "text-[var(--fx-warning)]"
            : "text-[var(--fx-text-muted)] hover:text-[var(--fx-text)]",
      )}
    >
      {Icon ? <Icon className="size-4" /> : null}
    </button>
  );
  if (!label) return button;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>{label}</TooltipContent>
    </Tooltip>
  );
}

// items: [{ label, onClick?, href?, icon?, tone?, separatorBefore? }]; inline: [{ icon, label, onClick, tone, disabled }]
export function FxActionsCell({ items = [], inline = [], align = "right", menuLabel = "Row actions", className }) {
  const justify = align === "left" ? "justify-start" : align === "center" ? "justify-center" : "justify-end";
  return (
    <div className={cn("flex items-center gap-0", justify, className)} onClick={stop}>
      {inline.map(({ key, label, ...action }, index) => (
        <FxInlineAction key={`inline-${key ?? label ?? index}`} label={label} {...action} />
      ))}
      {items.length ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={menuLabel}
              className="inline-flex size-8 items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-bg-soft)] hover:text-[var(--fx-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fx-ring)]"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            {items.map((item, index) => (
              <FxActionItem key={`menu-${item.key ?? item.label ?? index}`} item={item} />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}

function FxActionItem({ item }) {
  const Icon = item.icon;
  const toneClass =
    item.tone === "danger" ? "text-[var(--fx-danger)]" : item.tone === "warning" ? "text-[var(--fx-warning)]" : "";
  const disabled = item.disabled === true;
  const content = (
    <>
      {Icon ? <Icon className="size-4" /> : null}
      {item.label}
    </>
  );
  if (item.href && !disabled) {
    return (
      <>
        {item.separatorBefore ? <DropdownMenuSeparator /> : null}
        <DropdownMenuItem asChild className={toneClass}>
          <Link href={item.href} onClick={stop}>
            {content}
          </Link>
        </DropdownMenuItem>
      </>
    );
  }
  return (
    <>
      {item.separatorBefore ? <DropdownMenuSeparator /> : null}
      <DropdownMenuItem className={toneClass} disabled={disabled} onClick={disabled ? undefined : item.onClick}>
        {content}
      </DropdownMenuItem>
    </>
  );
}
/* - - - - - - - - - - - - - - - - */
/* Preset registry — FxTable dispatches `column.type` through this map.
   Signature: (value, props, ctx) => ReactNode, where value = accessor?.(row) ?? row[key]. */

export const FX_TABLE_CELL_PRESETS = {
  text: (value, props) => <FxTextCell value={value} {...props} />,
  link: (value, props) => <FxLinkCell value={value} {...props} />,
  badge: (value, props) => <FxBadgeCell value={value} {...props} />,
  score: (value, props) => <FxScoreCell value={value} {...props} />,
  number: (value, props) => <FxNumberCell value={value} {...props} />,
  currency: (value, props) => <FxCurrencyCell amount={value} {...props} />,
  salaryRange: (value, props) => <FxSalaryRangeCell range={value} {...props} />,
  date: (value, props) => <FxDateCell value={value} {...props} />,
  availability: (value, props) => <FxAvailabilityCell days={value} {...props} />,
  stacked: (value, props) => <FxStackedCell primary={props.primary ?? value} {...props} />,
  actions: (value, props, ctx) => <FxActionsCell align={props.align ?? ctx?.align ?? "right"} {...props} />,
};
/* - - - - - - - - - - - - - - - - */
