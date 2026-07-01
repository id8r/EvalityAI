/* src/components/FxUI/Forms/FxCombobox.js | Searchable, creatable single-select (combobox) | Sree | 2026-06-27 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Plus, Search, X } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { getStored, setStored } from "@/lib/FxStorage";
import { FX_INPUT, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  A select-style trigger that opens a panel with a search box + filtered options (label +
  optional description). When the typed text matches no option and `allowCreate`, a
  "Create new: …" row lets the user add it; options you created can be removed via a hover-× on their
  row (predefined options aren't removable). Built on our local ui/dropdown-menu primitive + Fx tokens.

  Persistence: pass `storageKey` (a field name under the FxID8r root) to self-persist the chosen
  value via FxStorage — read once after mount, written on every change. Otherwise it's a normal
  controlled (`value` + `onChange`) or uncontrolled (`defaultValue`) field.
*/
function normalizeOption(option) {
  if (typeof option === "string") return { value: option, label: option, description: "" };
  return {
    value: String(option?.value ?? option?.label ?? ""),
    label: String(option?.label ?? option?.value ?? ""),
    description: String(option?.description ?? ""),
  };
}

function FxCombobox({
  options = [],
  value,
  defaultValue = "",
  onChange,
  onCreate,
  allowCreate = true,
  createLabel = "Create new",
  placeholder = "Select an option",
  size = "sm",
  storageKey,
  label,
  hint,
  message,
  required = false,
  id,
  className,
  contentClassName,
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? value : internalValue;

  const [createdOptions, setCreatedOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const fieldId = id ?? (storageKey ? `fx-creatable-${storageKey}` : undefined);

  // Read persisted value once after mount (avoids SSR/hydration mismatch).
  useEffect(() => {
    if (!storageKey || isControlled) return;
    const stored = getStored(storageKey);
    if (stored != null && stored !== "") setInternalValue(stored);
  }, [storageKey, isControlled]);

  const normalizedOptions = useMemo(
    () => options.map(normalizeOption).filter((option) => option.value || option.label),
    [options],
  );
  const allOptions = useMemo(() => {
    // Just-created options surface at the top (most recent first) — you see what you just added, not buried below.
    const map = new Map();
    for (const option of createdOptions) map.set(option.value, option);
    for (const option of normalizedOptions) map.set(option.value, option);
    return Array.from(map.values());
  }, [normalizedOptions, createdOptions]);

  const createdValues = useMemo(() => new Set(createdOptions.map((o) => o.value)), [createdOptions]);
  const selectedOption = allOptions.find((option) => option.value === currentValue) ?? null;
  // Show a persisted custom value even if it's not in the options list.
  const triggerLabel = selectedOption?.label || currentValue || placeholder;

  const trimmedQuery = query.trim();
  const filteredOptions = useMemo(() => {
    const q = trimmedQuery.toLowerCase();
    if (!q) return allOptions;
    return allOptions.filter((option) => `${option.label} ${option.value} ${option.description}`.toLowerCase().includes(q));
  }, [allOptions, trimmedQuery]);

  const exactMatch = trimmedQuery
    ? allOptions.some((o) => o.value.toLowerCase() === trimmedQuery.toLowerCase() || o.label.toLowerCase() === trimmedQuery.toLowerCase())
    : false;
  const canCreate = allowCreate && Boolean(trimmedQuery) && !exactMatch;

  function commit(nextValue, option) {
    if (!isControlled) setInternalValue(nextValue);
    if (storageKey) setStored(storageKey, nextValue);
    onChange?.(nextValue, option);
  }

  function closeMenu() {
    setOpen(false);
    setQuery("");
  }

  function handleSelect(option) {
    commit(option.value, option);
    closeMenu();
  }

  async function handleCreateValue() {
    if (!canCreate) return;
    const created = await Promise.resolve(onCreate?.(trimmedQuery));
    const createdValue = typeof created === "string" ? created : String(created?.value ?? created?.label ?? trimmedQuery);
    const option = { value: createdValue, label: created?.label ?? trimmedQuery, description: String(created?.description ?? "") };
    setCreatedOptions((prev) => [option, ...prev.filter((o) => o.value !== option.value)]);
    commit(createdValue, option);
    closeMenu();
  }

  // Remove a value the user created (predefined options are never removable). Clears the field if it was selected.
  function handleRemoveCreated(optionValue) {
    setCreatedOptions((prev) => prev.filter((o) => o.value !== optionValue));
    if (optionValue === currentValue) commit("", null);
  }

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {label ? (
        <Label htmlFor={fieldId}>
          {label}
          {required ? <span className="ml-1 text-[var(--fx-danger)]">*</span> : null}
        </Label>
      ) : null}

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            id={fieldId}
            type="button"
            aria-label={placeholder}
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-[6px] border border-[var(--fx-border)] bg-[var(--fx-surface)] text-left text-[var(--fx-text)] outline-none transition-colors hover:bg-[var(--fx-surface-hover)] focus-visible:border-[var(--fx-primary)] focus-visible:ring-2 focus-visible:ring-[var(--fx-ring)]",
              FX_INPUT.size[size] ?? FX_INPUT.size.sm,
              !selectedOption && !currentValue ? "text-[var(--fx-text-muted)]" : "",
            )}
          >
            <span className="min-w-0 flex-1 truncate">{triggerLabel}</span>
            <ChevronDown className="size-4 shrink-0 text-[var(--fx-text-muted)]" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={8}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
          onCloseAutoFocus={(event) => event.preventDefault()}
          className={cn("w-[320px] p-2", contentClassName)}
        >
          <div className="space-y-2">
            <div className="flex h-10 items-center gap-2.5 rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3">
              <Search className="size-4 shrink-0 text-[var(--fx-text-muted)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  event.stopPropagation();
                  if (event.key === "Escape") {
                    event.preventDefault();
                    if (query) {
                      setQuery("");
                      return;
                    }
                    closeMenu();
                  }
                  if (event.key === "Enter") {
                    event.preventDefault();
                    if (canCreate) {
                      void handleCreateValue();
                      return;
                    }
                    if (filteredOptions[0]) handleSelect(filteredOptions[0]);
                  }
                }}
                placeholder={placeholder}
                className="h-full w-full min-w-0 bg-transparent text-[14px] leading-[22px] text-[var(--fx-text)] outline-none placeholder:text-[var(--fx-text-disabled)]"
              />
            </div>

            <div className="max-h-[280px] overflow-y-auto pr-0.5">
              {canCreate ? (
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    void handleCreateValue();
                  }}
                  className="mb-2 flex items-center justify-between gap-2 rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface-subtle)] px-3 py-2.5 hover:bg-[var(--fx-surface-hover)]"
                >
                  <span className={cn(FX_TYPOGRAPHY.clickable, "truncate text-[var(--fx-text)]")}>
                    {createLabel}: &quot;{trimmedQuery}&quot;
                  </span>
                  <Plus className="size-4 shrink-0 text-[var(--fx-text-muted)]" />
                </DropdownMenuItem>
              ) : null}

              <div className="space-y-1">
                {filteredOptions.length ? (
                  filteredOptions.map((option) => {
                    const isSelected = option.value === currentValue;
                    const isCreated = createdValues.has(option.value);
                    return (
                      <DropdownMenuItem
                        key={option.value || option.label}
                        onSelect={(event) => {
                          event.preventDefault();
                          handleSelect(option);
                        }}
                        className={cn(
                          "flex items-start gap-2.5 rounded-[8px] px-3 py-2.5",
                          isSelected ? "bg-[var(--fx-surface-selected)]" : "hover:bg-[var(--fx-surface-hover)]",
                        )}
                      >
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className={cn(FX_TYPOGRAPHY.clickable, "truncate text-[var(--fx-text)]")}>{option.label}</span>
                          {option.description ? (
                            <span className={cn(FX_TYPOGRAPHY.meta, "line-clamp-2 text-[var(--fx-text-muted)]")}>{option.description}</span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 flex shrink-0 items-center gap-1.5">
                          {isSelected ? <Check className="size-4 text-[var(--fx-primary)]" /> : null}
                          {isCreated ? (
                            <button
                              type="button"
                              aria-label={`Remove ${option.label}`}
                              title="Remove"
                              // Radix Menu.Item selects on pointer-up — stop it here so × removes instead of selecting.
                              onPointerDown={(event) => event.stopPropagation()}
                              onPointerUp={(event) => event.stopPropagation()}
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                handleRemoveCreated(option.value);
                              }}
                              className="inline-flex size-5 items-center justify-center rounded-[5px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-danger)]"
                            >
                              <X className="size-3.5" />
                            </button>
                          ) : null}
                        </span>
                      </DropdownMenuItem>
                    );
                  })
                ) : (
                  <div className="rounded-[8px] border border-dashed border-[var(--fx-border)] px-3 py-3.5">
                    <p className={cn(FX_TYPOGRAPHY.body, "text-[var(--fx-text-muted)]")}>No matching options</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {message ? (
        <p className="text-[13px] text-[var(--fx-danger)]">{message}</p>
      ) : hint ? (
        <p className="text-[13px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxCombobox };
/* - - - - - - - - - - - - - - - - */
