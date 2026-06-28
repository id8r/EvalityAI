/* src/components/FxUI/Forms/FxSelect.js | Branded single-select (label + options) | Sree | 2026-06-28 */

"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { FX_INPUT } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  A plain branded select over the ui/dropdown-menu primitive (NOT searchable/creatable — use FxCreatableSelect
  for that). Options: string[] or { value, label, description }[]. Controlled (`value` + `onChange(value)`) or
  uncontrolled (`defaultValue`). The panel matches the trigger width.
*/
function normalizeOption(option) {
  if (typeof option === "string") return { value: option, label: option, description: "" };
  return {
    value: String(option?.value ?? option?.label ?? ""),
    label: String(option?.label ?? option?.value ?? ""),
    description: String(option?.description ?? ""),
  };
}

function FxSelect({
  options = [],
  value,
  defaultValue = "",
  onChange,
  placeholder = "Select an option",
  size = "sm",
  label,
  hint,
  required = false,
  disabled = false,
  id,
  className,
  contentClassName,
  ...props
}) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const current = isControlled ? value : internal;
  const [open, setOpen] = useState(false);

  const normalized = useMemo(() => options.map(normalizeOption), [options]);
  const selected = normalized.find((option) => option.value === current) ?? null;

  function commit(next) {
    if (!isControlled) setInternal(next);
    onChange?.(next);
    setOpen(false);
  }

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {label ? (
        <Label htmlFor={id}>
          {label}
          {required ? <span className="ml-1 text-[var(--fx-danger)]">*</span> : null}
        </Label>
      ) : null}

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <button
            id={id}
            type="button"
            disabled={disabled}
            aria-label={placeholder}
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-[6px] border border-[var(--fx-border)] bg-[var(--fx-surface)] text-left text-[var(--fx-text)] outline-none transition-colors hover:bg-[var(--fx-surface-hover)] focus-visible:border-[var(--fx-primary)] focus-visible:ring-2 focus-visible:ring-[var(--fx-ring)] disabled:cursor-not-allowed disabled:opacity-60",
              FX_INPUT.size[size] ?? FX_INPUT.size.sm,
              !selected ? "text-[var(--fx-text-muted)]" : "",
            )}
            {...props}
          >
            <span className="min-w-0 flex-1 truncate">{selected?.label || placeholder}</span>
            <ChevronDown className="size-4 shrink-0 text-[var(--fx-text-muted)]" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={6}
          className={cn("max-h-[300px] w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto p-1", contentClassName)}
        >
          {normalized.map((option) => {
            const isSelected = option.value === current;
            return (
              <DropdownMenuItem
                key={option.value || option.label}
                onSelect={(event) => {
                  event.preventDefault();
                  commit(option.value);
                }}
                className={cn(
                  "flex items-start justify-between gap-2.5 rounded-[6px] px-3 py-2",
                  isSelected ? "bg-[var(--fx-surface-selected)]" : "hover:bg-[var(--fx-surface-hover)]",
                )}
              >
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className={cn("truncate text-[14px]", isSelected ? "text-[var(--fx-primary)]" : "text-[var(--fx-text)]")}>{option.label}</span>
                  {option.description ? (
                    <span className="line-clamp-2 text-[13px] leading-5 text-[var(--fx-text-muted)]">{option.description}</span>
                  ) : null}
                </span>
                {isSelected ? <Check className="mt-0.5 size-4 shrink-0 text-[var(--fx-primary)]" /> : null}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {hint ? <p className="text-[13px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxSelect };
/* - - - - - - - - - - - - - - - - */
