/* src/components/FxUI/DataDisplay/useFxTable.js | Headless table controller (v1: sorting only) | Sree | 2026-06-26 */

"use client";

import { useCallback, useMemo, useState } from "react";
/* - - - - - - - - - - - - - - - - */

/*
  V1 controller scope is SORTING ONLY (per the frozen FxTable spec). Search, filter, and
  pagination are deliberately not implemented here yet; this hook is shaped so they can be
  added later without changing the FxTable call site.

  Sorting is tri-state per column: asc -> desc -> none. Works controlled (`sort` + `onSortChange`)
  or uncontrolled (`defaultSort`). Comparators default by `sortType` ("string" | "number" | "date")
  or a custom `sortType` function on the column; the sort value comes from `sortAccessor`, then
  `accessor`, then `row[key]`.
*/

function normalizeSort(value) {
  if (!value || !value.key) return null;
  return { key: value.key, direction: value.direction === "desc" ? "desc" : "asc" };
}

function getSortValue(column, row) {
  if (typeof column?.sortAccessor === "function") return column.sortAccessor(row);
  if (typeof column?.accessor === "function") return column.accessor(row);
  return row?.[column?.key];
}

function compareValues(a, b, type) {
  if (type === "number") {
    const an = a == null || a === "" ? null : Number(a);
    const bn = b == null || b === "" ? null : Number(b);
    if (an == null && bn == null) return 0;
    if (an == null) return 1;
    if (bn == null) return -1;
    return an - bn;
  }
  if (type === "date") {
    const at = a ? new Date(a).getTime() : 0;
    const bt = b ? new Date(b).getTime() : 0;
    return (Number.isNaN(at) ? 0 : at) - (Number.isNaN(bt) ? 0 : bt);
  }
  return String(a ?? "").localeCompare(String(b ?? ""));
}
/* - - - - - - - - - - - - - - - - */

export function useFxTable({ rows = [], columns = [], sort, defaultSort = null, onSortChange } = {}) {
  const isControlled = sort != null && typeof sort === "object";
  const [internalSort, setInternalSort] = useState(() => normalizeSort(defaultSort));
  const sortState = isControlled ? normalizeSort(sort) : internalSort;

  const computeNext = useCallback((current, key) => {
    if (current?.key === key) {
      return current.direction === "asc" ? { key, direction: "desc" } : null;
    }
    return { key, direction: "asc" };
  }, []);

  const toggleSort = useCallback(
    (key) => {
      if (isControlled) {
        onSortChange?.(computeNext(sortState, key));
        return;
      }
      setInternalSort((current) => {
        const next = computeNext(current, key);
        onSortChange?.(next);
        return next;
      });
    },
    [computeNext, isControlled, onSortChange, sortState],
  );

  const sortedRows = useMemo(() => {
    if (!sortState?.key) return rows;
    const column = columns.find((candidate) => candidate.key === sortState.key);
    if (!column) return rows;

    const customCompare = typeof column.sortType === "function" ? column.sortType : null;
    const type = customCompare ? "custom" : column.sortType ?? "string";
    const direction = sortState.direction === "desc" ? -1 : 1;

    return [...rows].sort((left, right) => {
      const leftValue = getSortValue(column, left);
      const rightValue = getSortValue(column, right);
      const base = customCompare ? customCompare(leftValue, rightValue) : compareValues(leftValue, rightValue, type);
      return base * direction;
    });
  }, [rows, columns, sortState]);

  return {
    rows: sortedRows,
    sortKey: sortState?.key ?? null,
    sortDirection: sortState?.direction ?? null,
    toggleSort,
  };
}
/* - - - - - - - - - - - - - - - - */
