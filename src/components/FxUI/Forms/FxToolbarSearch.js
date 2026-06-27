/* src/components/FxUI/Forms/FxToolbarSearch.js | Toolbar search field — FxInput + "/" focus shortcut | Sree | 2026-06-27 */

"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

import { FxInput } from "@/components/FxUI/Forms/FxInput";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Reusable, toolbar-agnostic search input. Wraps FxInput (clear-✕ included), adds a leading search
  icon and a global "/" shortcut that focuses the field — ignored while typing elsewhere. The "/"
  hint shows only while empty (it cedes the right slot to the clear-✕ once there's text). Controlled
  or uncontrolled like FxInput; pass shortcut={false} to drop the key binding.
*/
const FxToolbarSearch = forwardRef(function FxToolbarSearch(
  { placeholder = "Search", shortcut = "/", className, inputClassName, value, defaultValue, onChange, ...props },
  ref,
) {
  const innerRef = useRef(null);
  const isControlled = value !== undefined;
  const [hasValueUncontrolled, setHasValueUncontrolled] = useState(() => String(defaultValue ?? "").length > 0);
  const hasValue = isControlled ? String(value ?? "").length > 0 : hasValueUncontrolled;
  const showHint = Boolean(shortcut) && !hasValue;

  function setRefs(node) {
    innerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  }

  function handleChange(event) {
    if (!isControlled) setHasValueUncontrolled(event.target.value.length > 0);
    onChange?.(event);
  }

  useEffect(() => {
    if (!shortcut) return undefined;
    function onKeyDown(event) {
      if (event.key !== shortcut || event.metaKey || event.ctrlKey || event.altKey) return;
      const el = document.activeElement;
      const typing = el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || el?.isContentEditable;
      if (typing) return;
      event.preventDefault();
      innerRef.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcut]);

  return (
    <div className={cn("relative w-full sm:w-[240px]", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 z-[1] size-4 -translate-y-1/2 text-[var(--fx-text-muted)]" />
      <FxInput
        ref={setRefs}
        type="search"
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        inputClassName={cn("pl-9", showHint && "pr-9", inputClassName)}
        {...props}
      />
      {showHint ? (
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none items-center rounded-[4px] border border-[var(--fx-border-light)] bg-[var(--fx-surface)] px-1.5 text-[11px] font-medium leading-[18px] text-[var(--fx-text-muted)] sm:inline-flex">
          {shortcut}
        </kbd>
      ) : null}
    </div>
  );
});
/* - - - - - - - - - - - - - - - - */
export { FxToolbarSearch };
/* - - - - - - - - - - - - - - - - */
