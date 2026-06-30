/* src/lib/useScreeningExpanded.js | Persisted expand preference for the screening sheets | Sree | 2026-06-30 */

"use client";

import { useState } from "react";

import { getStored, setStored } from "@/lib/FxStorage";
/* - - - - - - - - - - - - - - - - */

const KEY = "EvScreeningExpanded";

// Shared, persisted expand/restore preference for the Email + Manual screening sheets. Defaults to expanded
// (true) on first use; toggling persists so both sheets reopen the way the recruiter left them.
export function useScreeningExpanded() {
  const [expanded, setExpandedState] = useState(() => {
    const stored = getStored(KEY);
    return stored == null ? true : Boolean(stored);
  });
  function setExpanded(value) {
    setExpandedState(value);
    setStored(KEY, value);
  }
  return [expanded, setExpanded];
}
