// src/components/FxUI/AppShell/FxThemeController.js | Root theme synchronizer | Sree | 2026-06-27

"use client";

import { useEffect } from "react";

import { STORAGE_KEYS } from "@/lib/FxConstants";
import { getStored } from "@/lib/FxStorage";
import { THEMES } from "@/lib/FxTheme";

function applyTheme(theme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("dark", theme === THEMES.DARK);
}

function readStoredTheme() {
  return getStored(STORAGE_KEYS.theme);
}

export function FxThemeController() {
  useEffect(() => {
    function syncTheme() {
      const storedTheme = readStoredTheme();

      if (storedTheme === THEMES.DARK || storedTheme === THEMES.LIGHT) {
        applyTheme(storedTheme);
      }
    }

    syncTheme();

    const intervalId = window.setInterval(syncTheme, 400);
    window.addEventListener("storage", syncTheme);
    window.addEventListener("fx-theme-change", syncTheme);
    window.addEventListener("focus", syncTheme);
    document.addEventListener("visibilitychange", syncTheme);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("fx-theme-change", syncTheme);
      window.removeEventListener("focus", syncTheme);
      document.removeEventListener("visibilitychange", syncTheme);
    };
  }, []);

  return null;
}
