// src/components/FxUI/AppShell/FxThemeToggle.js | Light/dark theme toggle icon button | Sree | 2026-06-26

"use client";

import { Moon, Sun } from "lucide-react";

import { toggleTheme, useFxIsDark } from "@/components/FxUI/AppShell/useFxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

function FxThemeToggle({ className }) {
  const isDark = useFxIsDark();

  return (
    <button
      type="button"
      onClick={() => toggleTheme(isDark)}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "flex size-9 cursor-pointer items-center justify-center rounded-[8px] border border-[var(--fx-border-light)] bg-[var(--fx-surface)] text-[var(--fx-text-muted)] transition-colors duration-100 hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]",
        className,
      )}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxThemeToggle };
/* - - - - - - - - - - - - - - - - */
