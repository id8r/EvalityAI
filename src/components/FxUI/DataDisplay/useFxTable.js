/* src/components/FxUI/DataDisplay/useFxTable.js | Headless table controller (sort + selection + columns) | Sree | 2026-06-26 */

"use client";

import { useCallback, useMemo, useState } from "react";
/* - - - - - - - - - - - - - - - - */

/*
  V1.1 controller scope: SORTING + ROW SELECTION + COLUMN VISIBILITY/ORDER.
  Search, filter, and pagination remain deliberately unimplemented.

  One controller instance can be shared by FxTable and FxColumnManager — create it with
  useFxTable() and pass it to both via their `controller` prop. FxTable can also build its
  own internally from props for simple call sites that don't need a column manager.
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

function isLockedColumn(column) {
  return Boolean(column?.locked || column?.hideable === false);
}

function getColumnLabel(column) {
  if (column?.menuLabel) return column.menuLabel;
  if (typeof column?.header === "string" && column.header.trim()) return column.header;
  return column?.key;
}

// Reconcile a desired key order against the live column set: keep valid keys, drop missing, append new.
function normalizeOrder(desired, allKeys) {
  const valid = new Set(allKeys);
  const seen = new Set();
  const out = [];
  (desired || []).forEach((key) => {
    if (valid.has(key) && !seen.has(key)) {
      out.push(key);
      seen.add(key);
    }
  });
  allKeys.forEach((key) => {
    if (!seen.has(key)) {
      out.push(key);
      seen.add(key);
    }
  });
  return out;
}
/* - - - - - - - - - - - - - - - - */

export function useFxTable({
  rows = [],
  columns = [],
  getRowId = (row) => row.id,

  // sorting
  sort,
  defaultSort = null,
  onSortChange,

  // selection
  enableRowSelection = false,
  selectedRowKeys,
  defaultSelectedRowKeys = [],
  onSelectedRowKeysChange,

  // column visibility + order
  visibleColumnKeys,
  defaultVisibleColumnKeys,
  onVisibleColumnKeysChange,
  columnOrder,
  onColumnOrderChange,
} = {}) {
  const allKeys = useMemo(() => columns.map((column) => column.key), [columns]);
  const lockedKeys = useMemo(() => columns.filter(isLockedColumn).map((column) => column.key), [columns]);

  /* ---------- column order ---------- */
  const defaultOrder = useMemo(() => normalizeOrder(allKeys, allKeys), [allKeys]);
  const [internalOrder, setInternalOrder] = useState(defaultOrder);
  const orderControlled = Array.isArray(columnOrder);
  const order = useMemo(
    () => normalizeOrder(orderControlled ? columnOrder : internalOrder, allKeys),
    [orderControlled, columnOrder, internalOrder, allKeys],
  );

  /* ---------- column visibility ---------- */
  const defaultVisible = useMemo(() => {
    const base = Array.isArray(defaultVisibleColumnKeys)
      ? defaultVisibleColumnKeys
      : columns.filter((column) => column.defaultVisible !== false).map((column) => column.key);
    return Array.from(new Set([...lockedKeys, ...base]));
  }, [columns, defaultVisibleColumnKeys, lockedKeys]);

  const [internalVisible, setInternalVisible] = useState(defaultVisible);
  const visibleControlled = Array.isArray(visibleColumnKeys);
  const visibleKeys = visibleControlled ? visibleColumnKeys : internalVisible;
  const visibleSet = useMemo(() => new Set(visibleKeys), [visibleKeys]);

  const toggleColumn = useCallback(
    (key) => {
      if (lockedKeys.includes(key)) return;
      const next = visibleSet.has(key) ? visibleKeys.filter((candidate) => candidate !== key) : [...visibleKeys, key];
      if (!visibleControlled) setInternalVisible(next);
      onVisibleColumnKeysChange?.(next);
    },
    [lockedKeys, visibleSet, visibleKeys, visibleControlled, onVisibleColumnKeysChange],
  );

  // Reorder only the non-locked columns; locked columns keep their absolute positions.
  const moveColumn = useCallback(
    (draggedKey, targetKey) => {
      if (draggedKey === targetKey) return;
      if (lockedKeys.includes(draggedKey)) return;

      const lockedAt = new Map();
      order.forEach((key, index) => {
        if (lockedKeys.includes(key)) lockedAt.set(index, key);
      });
      const movable = order.filter((key) => !lockedKeys.includes(key));
      const from = movable.indexOf(draggedKey);
      if (from < 0) return;
      movable.splice(from, 1);
      let to = movable.indexOf(targetKey);
      if (to < 0) to = movable.length;
      movable.splice(to, 0, draggedKey);

      const result = new Array(order.length).fill(null);
      lockedAt.forEach((key, index) => {
        result[index] = key;
      });
      let cursor = 0;
      for (let index = 0; index < result.length; index += 1) {
        if (result[index] == null) {
          result[index] = movable[cursor];
          cursor += 1;
        }
      }
      if (!orderControlled) setInternalOrder(result);
      onColumnOrderChange?.(result);
    },
    [lockedKeys, order, orderControlled, onColumnOrderChange],
  );

  const resetColumns = useCallback(() => {
    if (!orderControlled) setInternalOrder(defaultOrder);
    if (!visibleControlled) setInternalVisible(defaultVisible);
    onColumnOrderChange?.(defaultOrder);
    onVisibleColumnKeysChange?.(defaultVisible);
  }, [orderControlled, visibleControlled, defaultOrder, defaultVisible, onColumnOrderChange, onVisibleColumnKeysChange]);

  const resolvedColumns = useMemo(
    () =>
      order
        .map((key) => columns.find((column) => column.key === key))
        .filter(Boolean)
        .filter((column) => visibleSet.has(column.key)),
    [order, columns, visibleSet],
  );

  const managerItems = useMemo(
    () =>
      order
        .map((key) => columns.find((column) => column.key === key))
        .filter(Boolean)
        .map((column) => ({
          key: column.key,
          label: getColumnLabel(column),
          visible: visibleSet.has(column.key),
          locked: isLockedColumn(column),
        })),
    [order, columns, visibleSet],
  );

  /* ---------- sorting ---------- */
  const isSortControlled = sort != null && typeof sort === "object";
  const [internalSort, setInternalSort] = useState(() => normalizeSort(defaultSort));
  const sortState = isSortControlled ? normalizeSort(sort) : internalSort;

  const toggleSort = useCallback(
    (key) => {
      const compute = (current) => {
        if (current?.key === key) {
          return current.direction === "asc" ? { key, direction: "desc" } : null;
        }
        return { key, direction: "asc" };
      };
      if (isSortControlled) {
        onSortChange?.(compute(sortState));
        return;
      }
      setInternalSort((current) => {
        const next = compute(current);
        onSortChange?.(next);
        return next;
      });
    },
    [isSortControlled, onSortChange, sortState],
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

  /* ---------- selection ---------- */
  const selectionControlled = Array.isArray(selectedRowKeys);
  const [internalSelected, setInternalSelected] = useState(() => defaultSelectedRowKeys ?? []);
  const selectedKeys = selectionControlled ? selectedRowKeys : internalSelected;
  const selectedKeySet = useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const visibleRowKeys = useMemo(() => sortedRows.map((row) => getRowId(row)).filter((key) => key != null), [sortedRows, getRowId]);
  const isAllVisibleSelected = visibleRowKeys.length > 0 && visibleRowKeys.every((key) => selectedKeySet.has(key));
  const isSomeVisibleSelected = visibleRowKeys.some((key) => selectedKeySet.has(key));

  const setSelected = useCallback(
    (next) => {
      const unique = Array.from(new Set(next.filter((key) => key != null)));
      if (!selectionControlled) setInternalSelected(unique);
      onSelectedRowKeysChange?.(unique);
    },
    [selectionControlled, onSelectedRowKeysChange],
  );

  const toggleRow = useCallback(
    (id) => {
      setSelected(selectedKeySet.has(id) ? selectedKeys.filter((key) => key !== id) : [...selectedKeys, id]);
    },
    [selectedKeySet, selectedKeys, setSelected],
  );

  const toggleAllVisible = useCallback(() => {
    if (isAllVisibleSelected) {
      const visibleSetLocal = new Set(visibleRowKeys);
      setSelected(selectedKeys.filter((key) => !visibleSetLocal.has(key)));
      return;
    }
    setSelected([...selectedKeys, ...visibleRowKeys]);
  }, [isAllVisibleSelected, visibleRowKeys, selectedKeys, setSelected]);

  const clearSelection = useCallback(() => setSelected([]), [setSelected]);

  return {
    rows: sortedRows,
    columns: resolvedColumns,
    getRowId,
    // sorting
    sortKey: sortState?.key ?? null,
    sortDirection: sortState?.direction ?? null,
    toggleSort,
    // selection
    selection: {
      enabled: enableRowSelection,
      selectedKeys,
      selectedKeySet,
      count: selectedKeys.length,
      isAllVisibleSelected,
      isIndeterminate: isSomeVisibleSelected && !isAllVisibleSelected,
      isSelected: (id) => selectedKeySet.has(id),
      toggleRow,
      toggleAllVisible,
      clear: clearSelection,
    },
    // column manager
    columnManager: {
      items: managerItems,
      visibleKeys,
      order,
      toggleColumn,
      moveColumn,
      reset: resetColumns,
    },
  };
}
/* - - - - - - - - - - - - - - - - */
