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
  const [copied, setCopied] = useState(false);
  const swatchRef = useRef(null);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    if (!swatchRef.current) {
      return;
    }
    const resolved = getComputedStyle(swatchRef.current).getPropertyValue(token).trim();
    setValue(resolved);
  }, [token]);

  useEffect(() => () => {
    if (copyTimerRef.current) {
      window.clearTimeout(copyTimerRef.current);
    }
  }, []);

  async function handleCopy() {
    if (!value) {
      return;
    }

    try {
      await copyValue(value);
      setCopied(true);

      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }

      copyTimerRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "w-full overflow-hidden border border-border bg-[var(--fx-surface)] text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]",
        className,
      )}
    >
      <div ref={swatchRef} className="h-20 border-b border-border" style={{ backgroundColor: `var(${token})` }} />

      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-[11px] text-muted-foreground">{token}</p>
        </div>
        <div className="flex items-center gap-2">
          {copied ? <span className="text-[11px] text-muted-foreground">Copied</span> : null}
          <span className="rounded-full border border-border bg-[var(--fx-surface-subtle)] px-2 py-1 font-mono text-[11px] text-foreground">
            {value || "—"}
          </span>
        </div>
      </div>
    </button>
  );
}

export { FxColorTokenCard };
/* - - - - - - - - - - - - - - - - */
