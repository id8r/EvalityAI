/* src/components/FxUI/Forms/FxInput.js | Branded text input field | Sree | 2026-06-27 */

"use client";

import { forwardRef, useRef, useState } from "react";
import { X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FX_INPUT } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

// size: sm 34 (default) / md 40 / lg 44 — mirrors the FxButton scale.
// variant: outline (boxed, default) / underline (bottom-border only).
// Clearable by default: a clear-✕ appears once the field has text. Set clearable={false} to disable.
const FxInput = forwardRef(function FxInput(
  {
    label,
    hint,
    message,
    id,
    className,
    inputClassName,
    size = "sm",
    variant = "outline",
    clearable = true,
    onClear,
    required = false,
    disabled = false,
    value,
    defaultValue,
    onChange,
    onKeyDown,
    ...props
  },
  ref,
) {
  const innerRef = useRef(null);
  const isControlled = value !== undefined;
  const [hasValueUncontrolled, setHasValueUncontrolled] = useState(() => String(defaultValue ?? "").length > 0);
  const hasValue = isControlled ? String(value ?? "").length > 0 : hasValueUncontrolled;
  const showClear = clearable && !disabled && hasValue;
  const fieldId = id ?? props.name;

  function setRefs(node) {
    innerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  }

  function handleChange(event) {
    if (!isControlled) setHasValueUncontrolled(event.target.value.length > 0);
    onChange?.(event);
  }

  // Works for controlled and uncontrolled: set the value via the native setter + dispatch an
  // input event so React's onChange fires (parent state syncs), then refocus.
  function handleClear() {
    const input = innerRef.current;
    if (input) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      if (setter) setter.call(input, "");
      else input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    }
    if (!isControlled) setHasValueUncontrolled(false);
    onClear?.();
  }

  const clearPadding = showClear ? (variant === "underline" ? "pr-6" : "pr-9") : "";

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {label ? (
        <Label htmlFor={fieldId}>
          {label}
          {required ? <span className="ml-1 text-[var(--fx-danger)]">*</span> : null}
        </Label>
      ) : null}

      <div className="relative">
        <Input
          ref={setRefs}
          id={fieldId}
          className={cn(
            FX_INPUT.size[size] ?? FX_INPUT.size.sm,
            FX_INPUT.variant[variant] ?? FX_INPUT.variant.outline,
            clearPadding,
            inputClassName,
          )}
          aria-invalid={Boolean(message)}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          {...props}
        />
        {showClear ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Clear"
            onClick={handleClear}
            className={cn(
              "absolute top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]",
              variant === "underline" ? "right-0" : "right-2",
            )}
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      {message ? (
        <p className="text-[13px] text-[var(--fx-danger)]">{message}</p>
      ) : hint ? (
        <p className="text-[13px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
});
/* - - - - - - - - - - - - - - - - */
export { FxInput };
/* - - - - - - - - - - - - - - - - */
