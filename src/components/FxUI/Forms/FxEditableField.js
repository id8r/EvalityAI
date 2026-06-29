/* src/components/FxUI/Forms/FxEditableField.js | Inline editable label/value field | Sree | 2026-06-27 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Check, PencilLine, X } from "lucide-react";

import { FxInput } from "@/components/FxUI/Forms/FxInput";
import { FxIconButton } from "@/components/FxUI/Forms/FxButton";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Read mode: label + value + a subtle (always-shown) pencil. Clicking the pencil (or the value)
  enters edit mode: an underline FxInput, autofocused with all text selected, plus cancel (✕ / Esc)
  and save (✓ / Enter). `pencil` places the icon "left" or "right" of the value.
  Controlled-ish: keeps an internal display value, re-syncs if the `value` prop changes, and calls `onSave(next)` on save.
*/
function FxEditableField({
  label,
  value = "",
  onSave,
  placeholder = "—",
  size = "sm",
  pencil = "right",
  align = "left", // read-mode text alignment of label + value (use "right" in a right-aligned column)
  valueClassName, // override the read-mode value text style (e.g. a larger/bolder name)
  href, // when set, the read-mode value is a link (e.g. mailto:/tel:); the pencil still triggers edit
  inputProps,
  className,
}) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(value);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    // Sync the committed value when the controlled `value` prop changes from outside.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrent(value);
  }, [value]);

  useEffect(() => {
    if (!editing) return;
    const input = inputRef.current;
    if (input) {
      input.focus();
      input.select();
    }
  }, [editing]);

  function startEdit() {
    setDraft(current);
    setEditing(true);
  }
  function cancel() {
    setDraft(current);
    setEditing(false);
  }
  function save() {
    setCurrent(draft);
    setEditing(false);
    onSave?.(draft);
  }
  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      save();
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation(); // cancel the inline edit, not a surrounding sheet
      cancel();
    }
  }

  const pencilButton = (
    <button
      type="button"
      aria-label={`Edit ${label ?? "value"}`}
      onClick={startEdit}
      className="inline-flex h-5 w-0 shrink-0 items-center justify-center overflow-hidden rounded-[5px] text-[var(--fx-text-muted)] opacity-0 transition-all duration-150 hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)] focus-visible:w-6 focus-visible:opacity-100 group-hover:w-6 group-hover:opacity-100"
    >
      <PencilLine className="size-3.5" />
    </button>
  );

  return (
    <div className={cn("group flex w-full flex-col gap-1", className)}>
      {label ? <span className={cn(FX_TYPOGRAPHY.label, "text-[var(--fx-text-muted)]", align === "right" && "text-right")}>{label}</span> : null}

      {editing ? (
        <div className="flex items-center gap-2">
          <FxInput
            ref={inputRef}
            variant="underline"
            size={size}
            clearable={false}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1"
            {...inputProps}
          />
          <div className="flex shrink-0 items-center gap-1">
            <FxIconButton size="xs" variant="ghost" className="size-7" aria-label="Cancel edit" onClick={cancel}>
              <X className="size-3.5" />
            </FxIconButton>
            <FxIconButton size="xs" variant="ghost" className="size-7" aria-label="Save edit" onClick={save}>
              <Check className="size-3.5" />
            </FxIconButton>
          </div>
        </div>
      ) : (
        // Pencil takes no space until hover, then expands and nudges the value — no permanent gap.
        <div className={cn("flex items-center", align === "right" && "justify-end")}>
          {pencil === "left" ? pencilButton : null}
          {href && current !== "" && current != null ? (
            <a
              href={href}
              title={typeof current === "string" ? current : undefined}
              className={cn("min-w-0 truncate text-[14px] leading-[22px] text-[var(--fx-primary)] hover:underline", align === "right" ? "max-w-full text-right" : "flex-1 text-left", valueClassName)}
            >
              {current}
            </a>
          ) : (
            <button
              type="button"
              onClick={startEdit}
              className={cn("min-w-0 truncate text-[14px] leading-[22px] text-[var(--fx-text)]", align === "right" ? "max-w-full text-right" : "flex-1 text-left", valueClassName)}
            >
              {current !== "" && current != null ? current : <span className="text-[var(--fx-text-disabled)]">{placeholder}</span>}
            </button>
          )}
          {pencil === "right" ? pencilButton : null}
        </div>
      )}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxEditableField };
/* - - - - - - - - - - - - - - - - */