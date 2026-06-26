"use client";

/* src/app/ds/FxColorTokenCard.js | Interactive color token specimen | Sree | 2026-06-25 */

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/FxUtils";

/* - - - - - - - - - - - - - - - - */

async function copyValue(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
}

function FxColorTokenCard({ token, className }) {
  const [value, setValue] = useState("");
  const swatchRef = useRef(null);

  useEffect(() => {
    if (!swatchRef.current) {
      return;
    }
    const resolved = getComputedStyle(swatchRef.current).getPropertyValue(token).trim();
    setValue(resolved);
  }, [token]);

  async function handleCopy() {
    if (!value) {
      return;
    }

    try {
      await copyValue(value);
    } catch {
      // Keep the card visually quiet even when clipboard access is blocked.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "w-full overflow-hidden rounded-[8px] border border-border bg-[var(--fx-surface)] text-left",
        className,
      )}
    >
      <div className="flex items-center gap-4 px-4 py-3">
        <div
          ref={swatchRef}
          className="h-10 w-10 shrink-0 rounded-full border border-border"
          style={{ backgroundColor: `var(${token})` }}
        />

        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate font-mono text-[11px] text-muted-foreground">{token}</p>
          <p className="font-mono text-[11px] text-foreground">{value || "—"}</p>
        </div>
      </div>
    </button>
  );
}

export { FxColorTokenCard };
/* - - - - - - - - - - - - - - - - */
