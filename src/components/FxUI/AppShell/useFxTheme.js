// src/components/FxUI/AppShell/useFxTheme.js | Shared light/dark theme runtime (read + write) | Sree | 2026-06-27

"use client";

import { useSyncExternalStore } from "react";

import { STORAGE_KEYS } from "@/lib/FxConstants";
import { setStored } from "@/lib/FxStorage";
import { THEMES } from "@/lib/FxTheme";
/* - - - - - - - - - - - - - - - - */

// The `.dark` class on <html> is the single source of truth; subscribe to it so every
// consumer (toggle, account menu) re-renders together when the theme flips.
function subscribe(callback) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}
/* - - - - - - - - - - - - - - - - */

export function useFxIsDark() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Write side: flip the class, persist the choice, and notify same-tab listeners (FxThemeController).
export function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === THEMES.DARK);
  setStored(STORAGE_KEYS.theme, theme);
  window.dispatchEvent(new Event("fx-theme-change"));
}

export function toggleTheme(isDark) {
  applyTheme(isDark ? THEMES.LIGHT : THEMES.DARK);
}
/* - - - - - - - - - - - - - - - - */
