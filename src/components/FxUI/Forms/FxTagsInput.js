/* src/components/FxUI/Forms/FxTagsInput.js | Branded tags input (chips + suggestions + create) | Sree | 2026-06-28 */

"use client";

import { useMemo, useRef, useState } from "react";
import { Plus, X } from "lucide-react";

import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Tags input (a.k.a. TagsInput / token field): selected values render as removable chips; an inline input filters
  a portaled suggestion list (so it never clips inside overflow-hidden cards). Options: string[] or { value, label }[]
  — chips show the label while `value` stays the token, so this works for enum-backed fields. Controlled via
  `value` (string[]) + `onChange(nextValues)`. allowCreate (default) lets the user add free tags by typing.

  Features: token/label options, browse-on-focus (no need to type), keyboard navigation (↑ ↓ Enter Esc),
  an "Add …" create row, and a portaled, content-width (non-clipping) menu.
*/
function normalizeOption(option) {
  if (typeof option === "string") return { value: option, label: option };
  return { value: String(option?.value ?? option?.label ?? ""), label: String(option?.label ?? option?.value ?? "") };
}

const FRAME_MIN_HEIGHT = { sm: "min-h-[34px]", md: "min-h-[40px]", lg: "min-h-[44px]" };

function FxTagsInput({
  options = [],
  value = [],
  onChange,
  allowCreate = true,
  createLabel = "Add",
  placeholder = "Search or add…",
  emptyText = "No matches",
  size = "md",
  label,
  hint,
  message,
  required = false,
  disabled = false,
  id,
  className,
  contentClassName,
}) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const fieldRef = useRef(null);
  const blurTimer = useRef(null);

  const normalized = useMemo(() => options.map(normalizeOption), [options]);
  const optionByValue = useMemo(() => new Map(normalized.map((option) => [option.value, option])), [normalized]);
  const selected = useMemo(() => Array.from(new Set(value)), [value]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const query = draft.trim();
  const lowerQuery = query.toLowerCase();

  // A selected value shows its option label, or the raw token for custom tags.
  function labelFor(token) {
    return optionByValue.get(token)?.label ?? token;
  }

  const suggestions = useMemo(
    () =>
      normalized.filter(
        (option) =>
          !selectedSet.has(option.value) &&
          (!lowerQuery || option.label.toLowerCase().includes(lowerQuery) || option.value.toLowerCase().includes(lowerQuery)),
      ),
    [normalized, selectedSet, lowerQuery],
  );

  const matchesExisting =
    Boolean(query) &&
    (normalized.some((option) => option.label.toLowerCase() === lowerQuery || option.value.toLowerCase() === lowerQuery) ||
      selected.some((token) => labelFor(token).toLowerCase() === lowerQuery || token.toLowerCase() === lowerQuery));
  const canCreate = allowCreate && Boolean(query) && !matchesExisting;

  // Single navigable list: suggestions first, then the optional create row.
  const navItems = useMemo(() => {
    const items = suggestions.map((option) => ({ kind: "option", value: option.value, label: option.label }));
    if (canCreate) items.push({ kind: "create", value: query, label: query });
    return items;
  }, [suggestions, canCreate, query]);

  const safeActive = navItems.length ? Math.min(activeIndex, navItems.length - 1) : 0;
  const showMenu = open && !disabled && (navItems.length > 0 || Boolean(query));

  function add(token) {
    if (disabled || !token || selectedSet.has(token)) {
      setDraft("");
      return;
    }
    onChange?.([...selected, token]);
    setDraft("");
    setActiveIndex(0);
    inputRef.current?.focus();
  }

  function remove(token) {
    if (disabled) return;
    onChange?.(selected.filter((item) => item !== token));
  }

  function commitActive() {
    const item = navItems[safeActive];
    if (!item) {
      if (canCreate) add(query);
      return;
    }
    add(item.value);
  }

  function handleKeyDown(event) {
    if (disabled) return;
    switch (event.key) {
      case "Enter":
        if (navItems.length) {
          event.preventDefault();
          commitActive();
        }
        break;
      case "Backspace":
        if (!draft && selected.length) {
          event.preventDefault();
          remove(selected[selected.length - 1]);
        }
        break;
      case "ArrowDown":
        event.preventDefault();
        setOpen(true);
        setActiveIndex((index) => Math.min(index + 1, Math.max(navItems.length - 1, 0)));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        break;
      default:
        break;
    }
  }

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {label ? (
        <Label htmlFor={id}>
          {label}
          {required ? <span className="ml-1 text-[var(--fx-danger)]">*</span> : null}
        </Label>
      ) : null}

      <Popover open={showMenu} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div
            ref={fieldRef}
            onMouseDown={(event) => {
              // Clicks on the frame (not a chip button) focus the input.
              if (event.target === event.currentTarget) inputRef.current?.focus();
            }}
            className={cn(
              "flex w-full flex-wrap items-center gap-2 rounded-[6px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 py-1.5 text-[15px] text-[var(--fx-text)] transition-colors focus-within:border-[var(--fx-primary)] focus-within:ring-2 focus-within:ring-[var(--fx-ring)]",
              FRAME_MIN_HEIGHT[size] ?? FRAME_MIN_HEIGHT.md,
              disabled ? "cursor-not-allowed opacity-60" : "cursor-text",
            )}
          >
            {selected.map((token) => (
              <span
                key={token}
                className="inline-flex items-center gap-1.5 rounded-full border border-[color:color-mix(in_srgb,var(--fx-primary)_30%,var(--fx-border)_70%)] bg-[var(--fx-surface-selected)] py-0.5 pl-2.5 pr-1 text-[13px] leading-5 text-[var(--fx-primary)]"
              >
                <span className="max-w-[180px] truncate">{labelFor(token)}</span>
                <button
                  type="button"
                  tabIndex={-1}
                  disabled={disabled}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => remove(token)}
                  aria-label={`Remove ${labelFor(token)}`}
                  className="inline-flex size-4 items-center justify-center rounded-full text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)] disabled:cursor-not-allowed"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}

            <input
              ref={inputRef}
              id={id}
              value={draft}
              disabled={disabled}
              placeholder={selected.length ? "" : placeholder}
              aria-invalid={Boolean(message)}
              onFocus={() => {
                if (blurTimer.current) clearTimeout(blurTimer.current);
                setOpen(true);
              }}
              onBlur={() => {
                // Defer so a suggestion click (which blurs the input) can register before we close.
                blurTimer.current = setTimeout(() => setOpen(false), 120);
              }}
              onChange={(event) => {
                setDraft(event.target.value);
                setActiveIndex(0);
                setOpen(true);
              }}
              onKeyDown={handleKeyDown}
              className="min-w-[140px] flex-1 bg-transparent py-0.5 leading-6 outline-none placeholder:text-[var(--fx-text-muted)] disabled:cursor-not-allowed"
            />
          </div>
        </PopoverAnchor>

        <PopoverContent
          align="start"
          sideOffset={6}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            // Keep the menu open when interacting with the field itself.
            if (fieldRef.current?.contains(event.target)) event.preventDefault();
          }}
          className={cn(
            "max-h-[280px] w-auto min-w-[200px] max-w-[min(20rem,calc(100vw-2rem))] overflow-y-auto p-1",
            contentClassName,
          )}
        >
          {navItems.length ? (
            navItems.map((item, index) => {
              const isActive = index === safeActive;
              return (
                <button
                  key={`${item.kind}:${item.value}`}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => add(item.value)}
                  className={cn(
                    "flex w-full items-center gap-1.5 rounded-[6px] px-3 py-2 text-left text-[14px]",
                    isActive ? "bg-[var(--fx-surface-hover)]" : "",
                  )}
                >
                  {item.kind === "create" ? (
                    <span className="inline-flex min-w-0 items-center gap-1.5 text-[var(--fx-primary)]">
                      <Plus className="size-3.5 shrink-0" />
                      <span className="truncate">
                        {createLabel} “{item.label}”
                      </span>
                    </span>
                  ) : (
                    <span className="min-w-0 truncate text-[var(--fx-text)]">{item.label}</span>
                  )}
                </button>
              );
            })
          ) : (
            <p className="px-3 py-2 text-[13px] text-[var(--fx-text-muted)]">{emptyText}</p>
          )}
        </PopoverContent>
      </Popover>

      {message ? (
        <p className="text-[13px] text-[var(--fx-danger)]">{message}</p>
      ) : hint ? (
        <p className="text-[13px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxTagsInput };
/* - - - - - - - - - - - - - - - - */
