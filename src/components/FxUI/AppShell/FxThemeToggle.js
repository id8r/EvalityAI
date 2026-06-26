// src/components/FxUI/AppShell/FxThemeToggle.js | Light/dark theme toggle icon button | Sree | 2026-06-26

"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

import { STORAGE_KEYS, THEMES } from "@/lib/FxConstants";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

function subscribeTheme(callback) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("storage", callback);
  window.addEventListener("fx-theme-change", callback);
  return () => observer.disconnect();
}

function getThemeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getThemeServerSnapshot() {
  return false;
}

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === THEMES.DARK);
  window.localStorage.setItem(STORAGE_KEYS.theme, theme);
  window.dispatchEvent(new Event("fx-theme-change"));
}
/* - - - - - - - - - - - - - - - - */

function FxThemeToggle({ className }) {
  const isDark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEYS.theme);

    if (storedTheme === THEMES.DARK || storedTheme === THEMES.LIGHT) {
      document.documentElement.classList.toggle("dark", storedTheme === THEMES.DARK);
    }
  }, []);

  return (
    <button
      type="button"
      onClick={() => applyTheme(isDark ? THEMES.LIGHT : THEMES.DARK)}
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
