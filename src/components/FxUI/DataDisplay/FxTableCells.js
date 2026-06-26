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
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
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

export function FxTextCell({ value, muted = false, title, className }) {
  if (isBlank(value)) return <EmptyDash />;
  return (
    <span className={cn("block min-w-0 truncate", muted ? "text-[var(--fx-text-muted)]" : "text-[var(--fx-text)]", className)} title={title}>
      {value}
    </span>
  );
}

export function FxLinkCell({ value, href, onClick, tone = "primary", title, className }) {
  if (isBlank(value)) return <EmptyDash />;
  const classes = cn(
    "block min-w-0 truncate",
    FX_TYPOGRAPHY.clickable,
    tone === "primary" ? "text-[var(--fx-primary)] hover:text-[var(--fx-text)]" : "text-[var(--fx-text)] hover:text-[var(--fx-primary)]",
    className,
  );
  if (href) {
    return (
      <Link href={href} className={classes} title={title ?? (typeof value === "string" ? value : undefined)} onClick={stop}>
        {value}
      </Link>
    );
  }
  return (
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

export function FxNumberCell({ value, href, className }) {
  const text = isBlank(value) ? EMPTY : value;
  if (href && !isBlank(value)) {
    return (
      <Link href={href} onClick={stop} className={cn("tabular-nums text-[var(--fx-primary)] hover:text-[var(--fx-text)]", className)}>
        {text}
      </Link>
    );
  }
  return <span className={cn("tabular-nums text-[var(--fx-text)]", className)}>{text}</span>;
}

export function FxCurrencyCell({ amount, currency = "USD", className }) {
  return <span className={cn("tabular-nums text-[var(--fx-text)]", className)}>{formatCurrency(amount, currency)}</span>;
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

export function FxStackedCell({ primary, secondary, onClick, className }) {
  const inner = (
    <>
      <span className="block truncate text-[14px] leading-[20px] text-[var(--fx-text)]">{primary}</span>
      {!isBlank(secondary) ? <span className="block truncate text-[12px] leading-[18px] text-[var(--fx-text-muted)]">{secondary}</span> : null}
    </>
  );
  if (onClick) {
    return (
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
    );
  }
  return <div className={cn("min-w-0", className)}>{inner}</div>;
}

function FxInlineAction({ icon: Icon, label, onClick, tone, disabled = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(event) => {
        stop(event);
        onClick?.(event);
      }}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-[6px] transition-colors hover:bg-[var(--fx-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fx-ring)] disabled:pointer-events-none disabled:opacity-50",
        tone === "danger" ? "text-[var(--fx-danger)]" : "text-[var(--fx-text-muted)] hover:text-[var(--fx-text)]",
      )}
    >
      {Icon ? <Icon className="size-4" /> : null}
    </button>
  );
}

// items: [{ label, onClick?, href?, icon?, tone?, separatorBefore? }]; inline: [{ icon, label, onClick, tone, disabled }]
export function FxActionsCell({ items = [], inline = [], align = "right", menuLabel = "Row actions", className }) {
  const justify = align === "left" ? "justify-start" : align === "center" ? "justify-center" : "justify-end";
  return (
    <div className={cn("flex items-center gap-1", justify, className)} onClick={stop}>
      {inline.map((action, index) => (
        <FxInlineAction key={action.key ?? index} {...action} />
      ))}
      {items.length ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={menuLabel}
              className="inline-flex size-8 items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fx-ring)]"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            {items.map((item, index) => (
              <FxActionItem key={item.key ?? index} item={item} />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}

function FxActionItem({ item }) {
  const Icon = item.icon;
  const toneClass = item.tone === "danger" ? "text-[var(--fx-danger)]" : "";
  const content = (
    <>
      {Icon ? <Icon className="size-4" /> : null}
      {item.label}
    </>
  );
  if (item.href) {
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
      <DropdownMenuItem className={toneClass} onClick={item.onClick}>
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
  date: (value, props) => <FxDateCell value={value} {...props} />,
  availability: (value, props) => <FxAvailabilityCell days={value} {...props} />,
  stacked: (value, props) => <FxStackedCell primary={props.primary ?? value} {...props} />,
  actions: (value, props, ctx) => <FxActionsCell align={props.align ?? ctx?.align ?? "right"} {...props} />,
};
/* - - - - - - - - - - - - - - - - */
