/* src/lib/useEvData.js | React readiness/reactivity hook for the Ev data store | Sree | 2026-06-28 */

"use client";

import { useEffect, useState } from "react";

import { loadEvData, subscribeEvData } from "@/lib/EvStore";
/* - - - - - - - - - - - - - - - - */

// The page-level init gate: ensures the Ev seed is loaded once, and re-renders the caller on any Ev data change.
// Returns `ready` — false until the first-load seed completes (read EvData/EvSelectors only once ready).
export function useEvData() {
  const [ready, setReady] = useState(false);
  const [, bump] = useState(0);

  useEffect(() => {
    let active = true;
    loadEvData()
      .catch(() => {}) // fail open — render an empty page rather than hang
      .finally(() => {
        if (active) setReady(true);
      });
    const unsubscribe = subscribeEvData(() => {
      if (active) bump((tick) => tick + 1);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return ready;
}
/* - - - - - - - - - - - - - - - - */
