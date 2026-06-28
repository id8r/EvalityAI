/* src/lib/useEvTablePrefs.js | Reusable persisted table prefs (EvUIData) → wired into any useFxTable | Sree | 2026-06-28 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { clearTablePrefs, getTablePrefs, setTablePrefs } from "@/lib/EvUIData";
/* - - - - - - - - - - - - - - - - */

const DEFAULT_PREFS = { visibleColumnIds: null, columnOrder: null, sort: null, density: "default", pageSize: 25 };

/*
  Persist one table's column visibility + order + sort (+ density/pageSize) under `ev.table.<tableId>`. Generic —
  every table (jobs, jobWorkspace.<stage>, candidates, clients, …) passes its own tableId. Defaults come from the
  FxTable column config (code); persisted user edits override. Spread `tableProps` into useFxTable to wire the
  visibility/order/sort persistence; FxTable itself stays generic (no Ev dependency).

    const { tableProps } = useEvTablePrefs("jobs");
    const table = useFxTable({ rows, columns, getRowId, defaultSort, enableRowSelection, ...tableProps });
*/
export function useEvTablePrefs(tableId, defaults = {}) {
  const [prefs, setPrefs] = useState(() => ({ ...DEFAULT_PREFS, ...defaults }));

  // Load persisted prefs AFTER mount (initial render = code defaults on both server + client → no hydration
  // mismatch). User edits then persist live.
  useEffect(() => {
    const stored = getTablePrefs(tableId);
    // One-time hydration of persisted prefs after mount — deliberate: the initial render is the deterministic
    // code defaults (so no SSR/localStorage hydration mismatch), then we apply the stored prefs.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setPrefs((prev) => ({ ...prev, ...stored }));
  }, [tableId]);

  const update = useCallback(
    (partial) => {
      setPrefs((prev) => {
        const next = { ...prev, ...partial };
        setTablePrefs(tableId, next);
        return next;
      });
    },
    [tableId],
  );

  // Controlled props for useFxTable. `undefined` = fall back to the code defaults (column defaultVisible / sort).
  const tableProps = useMemo(
    () => ({
      visibleColumnKeys: prefs.visibleColumnIds ?? undefined,
      onVisibleColumnKeysChange: (ids) => update({ visibleColumnIds: ids }),
      columnOrder: prefs.columnOrder ?? undefined,
      onColumnOrderChange: (columnOrder) => update({ columnOrder }),
      sort: prefs.sort?.columnId ? { key: prefs.sort.columnId, direction: prefs.sort.direction } : undefined,
      onSortChange: (next) => update({ sort: next ? { columnId: next.key, direction: next.direction } : null }),
    }),
    [prefs.visibleColumnIds, prefs.columnOrder, prefs.sort, update],
  );

  const reset = useCallback(() => {
    clearTablePrefs(tableId);
    setPrefs({ ...DEFAULT_PREFS, ...defaults });
  }, [tableId, defaults]);

  return {
    tableProps,
    prefs,
    density: prefs.density,
    setDensity: (density) => update({ density }),
    pageSize: prefs.pageSize,
    setPageSize: (pageSize) => update({ pageSize }),
    reset,
  };
}
/* - - - - - - - - - - - - - - - - */
