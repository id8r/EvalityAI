/* src/components/FxUI/DataDisplay/FxTable.js | Dense data-table primitive (v1) | Sree | 2026-06-26 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { FX_TABLE } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
import { FX_TABLE_CELL_PRESETS } from "@/components/FxUI/DataDisplay/FxTableCells";
import { useFxTable } from "@/components/FxUI/DataDisplay/useFxTable";
/* - - - - - - - - - - - - - - - - */

const DEFAULT_MIN_WIDTH = 140;
const ACTIONS_DEFAULT_WIDTH = 64;

function cssPx(value) {
  return typeof value === "number" ? `${value}px` : value;
}

function toPx(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim().endsWith("px")) return Number.parseFloat(value);
  return null;
}

function alignClass(align) {
  return align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
}

function justifyClass(align) {
  return align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
}

/* Width architecture: action columns are fixed; everything else gets an honest minWidth so
   horizontal scroll is truthful, and omits a hard width when `grow` so it fills available space. */
function resolveColumnStyle(column) {
  if (column.type === "actions") {
    const size = column.width ?? ACTIONS_DEFAULT_WIDTH;
    return { width: cssPx(size), minWidth: cssPx(size), maxWidth: cssPx(size) };
  }
  const style = {};
  if (!column.grow && column.width != null) style.width = cssPx(column.width);
  style.minWidth = cssPx(column.minWidth ?? column.width ?? DEFAULT_MIN_WIDTH);
  if (column.maxWidth != null) style.maxWidth = cssPx(column.maxWidth);
  return style;
}

function stickyColumnWidth(column) {
  const style = resolveColumnStyle(column);
  return toPx(style.width) ?? toPx(style.minWidth) ?? DEFAULT_MIN_WIDTH;
}

function getTableMinWidth(columns, minTableWidth) {
  const sum = columns.reduce((total, column) => {
    const style = resolveColumnStyle(column);
    return total + (toPx(style.minWidth) ?? toPx(style.width) ?? DEFAULT_MIN_WIDTH);
  }, 0);
  return `${Math.max(sum, toPx(minTableWidth) ?? 0)}px`;
}

function stickyPositionFor(column, index, length, stickyFirstColumn, stickyLastColumn) {
  if (column.sticky === "left" || (stickyFirstColumn && index === 0)) return "left";
  if (column.sticky === "right" || (stickyLastColumn && index === length - 1)) return "right";
  return null;
}

function buildStickyOffsets(columns, stickyFirstColumn, stickyLastColumn) {
  const left = new Map();
  const right = new Map();
  let accumulatedLeft = 0;
  columns.forEach((column, index) => {
    if (column.sticky === "left" || (stickyFirstColumn && index === 0)) {
      left.set(column.key, accumulatedLeft);
      accumulatedLeft += stickyColumnWidth(column);
    }
  });
  let accumulatedRight = 0;
  for (let index = columns.length - 1; index >= 0; index -= 1) {
    const column = columns[index];
    if (column.sticky === "right" || (stickyLastColumn && index === columns.length - 1)) {
      right.set(column.key, accumulatedRight);
      accumulatedRight += stickyColumnWidth(column);
    }
  }
  return { left, right };
}

function renderCellContent(column, row, rowIndex) {
  if (typeof column.cell === "function") {
    return column.cell(row, { row, rowIndex, column });
  }
  const value = typeof column.accessor === "function" ? column.accessor(row) : row[column.key];
  const preset = column.type ? FX_TABLE_CELL_PRESETS[column.type] : null;
  if (preset) {
    const props = typeof column.cellProps === "function" ? column.cellProps(row) ?? {} : {};
    return preset(value, props, { row, rowIndex, column, align: column.align });
  }
  return value ?? null;
}

function SortIndicator({ state }) {
  if (state === "asc") return <ArrowUp className="size-3.5 shrink-0" />;
  if (state === "desc") return <ArrowDown className="size-3.5 shrink-0" />;
  return <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" />;
}
/* - - - - - - - - - - - - - - - - */

export function FxTable({
  columns,
  rows,
  getRowId = (row) => row.id,

  // sorting (controller-backed)
  sortable = false,
  defaultSort = null,
  sort,
  onSortChange,

  // layout / scroll
  stickyHeader = false,
  stickyFirstColumn = false,
  stickyLastColumn = false,
  scrollX = true,
  minTableWidth,

  // interaction
  onRowClick,

  // states
  loading = false,
  loadingRowCount = 8,
  empty,
  emptyMessage = "No rows to display.",

  // style hooks
  className,
  surfaceClassName,
  headerClassName,
  bodyClassName,
  rowClassName,
}) {
  const scrollRef = useRef(null);
  const [hasOverflowLeft, setHasOverflowLeft] = useState(false);
  const [hasOverflowRight, setHasOverflowRight] = useState(false);

  const {
    rows: displayRows,
    sortKey,
    sortDirection,
    toggleSort,
  } = useFxTable({ rows, columns, sort, defaultSort, onSortChange });

  const tableMinWidth = useMemo(() => getTableMinWidth(columns, minTableWidth), [columns, minTableWidth]);
  const stickyOffsets = useMemo(
    () => buildStickyOffsets(columns, stickyFirstColumn, stickyLastColumn),
    [columns, stickyFirstColumn, stickyLastColumn],
  );
  const columnsKey = useMemo(() => columns.map((column) => column.key).join(","), [columns]);

  useEffect(() => {
    if (!scrollX) {
      setHasOverflowLeft(false);
      setHasOverflowRight(false);
      return undefined;
    }
    const container = scrollRef.current;
    if (!container) return undefined;

    function update() {
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      setHasOverflowLeft(container.scrollLeft > 4);
      setHasOverflowRight(maxScrollLeft > 4 && container.scrollLeft < maxScrollLeft - 4);
    }

    update();
    container.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => {
      container.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [scrollX, columnsKey, tableMinWidth, displayRows.length, loading]);

  function stickyStyleFor(column, position) {
    if (position === "left") return { left: `${stickyOffsets.left.get(column.key) ?? 0}px` };
    if (position === "right") return { right: `${stickyOffsets.right.get(column.key) ?? 0}px` };
    return {};
  }

  function renderHeader() {
    return (
      <thead className={headerClassName}>
        <tr>
          {columns.map((column, index) => {
            const position = stickyPositionFor(column, index, columns.length, stickyFirstColumn, stickyLastColumn);
            const resolvedStyle = resolveColumnStyle(column);
            const isSorted = sortKey === column.key;
            const isSortable = sortable && column.sortable;
            const sortIndicatorState = isSorted ? sortDirection : null;

            return (
              <th
                key={column.key}
                scope="col"
                aria-sort={isSorted ? (sortDirection === "desc" ? "descending" : "ascending") : isSortable ? "none" : undefined}
                className={cn(
                  FX_TABLE.headerCell,
                  alignClass(column.align),
                  stickyHeader && "sticky top-0",
                  position === "left" && "sticky left-0",
                  position === "right" && "sticky right-0",
                  (stickyHeader || position) && "z-20",
                  stickyHeader && position && "z-30",
                  column.headerClassName,
                )}
                style={{ ...resolvedStyle, ...stickyStyleFor(column, position) }}
              >
                {isSortable ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(column.key)}
                    className={cn(
                      "inline-flex w-full items-center gap-1.5",
                      justifyClass(column.align),
                      isSorted ? "text-[var(--fx-primary)]" : "text-[var(--fx-text-muted)] hover:text-[var(--fx-text)]",
                    )}
                  >
                    <span className="min-w-0 truncate">{column.header}</span>
                    <SortIndicator state={sortIndicatorState} />
                  </button>
                ) : (
                  <span className="block min-w-0 truncate">{column.header}</span>
                )}
              </th>
            );
          })}
        </tr>
      </thead>
    );
  }

  function renderSkeleton() {
    return (
      <tbody className={bodyClassName}>
        {Array.from({ length: loadingRowCount }).map((_, rowIndex) => (
          <tr key={`fx-skeleton-${rowIndex}`} className="bg-[var(--fx-surface)]">
            {columns.map((column, index) => {
              const position = stickyPositionFor(column, index, columns.length, stickyFirstColumn, stickyLastColumn);
              return (
                <td
                  key={column.key}
                  className={cn(
                    FX_TABLE.bodyCell,
                    position === "left" && "sticky left-0 z-10 bg-[var(--fx-surface)]",
                    position === "right" && "sticky right-0 z-10 bg-[var(--fx-surface)]",
                  )}
                  style={{ ...resolveColumnStyle(column), ...stickyStyleFor(column, position) }}
                >
                  <div className="h-3 w-3/5 animate-pulse rounded bg-[var(--fx-surface-muted)]" />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    );
  }

  function renderBody() {
    if (!displayRows.length) {
      return (
        <tbody className={bodyClassName}>
          <tr>
            <td colSpan={columns.length} className={FX_TABLE.empty}>
              {empty ?? <div className="py-6 text-center text-[var(--fx-text-muted)]">{emptyMessage}</div>}
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody className={bodyClassName}>
        {displayRows.map((row, rowIndex) => {
          const rowId = getRowId(row) ?? rowIndex;
          return (
            <tr
              key={rowId}
              onClick={onRowClick ? (event) => onRowClick(row, event) : undefined}
              className={cn(
                "bg-[var(--fx-surface)] transition-colors hover:bg-[var(--fx-surface-hover)]",
                onRowClick && "cursor-pointer",
                rowClassName,
              )}
            >
              {columns.map((column, index) => {
                const position = stickyPositionFor(column, index, columns.length, stickyFirstColumn, stickyLastColumn);
                return (
                  <td
                    key={column.key}
                    className={cn(
                      FX_TABLE.bodyCell,
                      alignClass(column.align),
                      position === "left" && "sticky left-0 z-10 bg-inherit",
                      position === "right" && "sticky right-0 z-10 bg-inherit",
                      column.cellClassName,
                    )}
                    style={{ ...resolveColumnStyle(column), ...stickyStyleFor(column, position) }}
                  >
                    {renderCellContent(column, row, rowIndex)}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    );
  }

  return (
    <div className={cn("relative flex min-h-0 w-full flex-col", className)}>
      <div
        ref={scrollRef}
        className={cn(
          "relative min-h-0 w-full rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface)]",
          "overflow-y-auto",
          scrollX ? "overflow-x-auto" : "overflow-x-hidden",
          stickyHeader && "h-full flex-1",
          surfaceClassName,
        )}
      >
        <table
          className="relative isolate w-full min-w-full table-fixed border-separate border-spacing-0"
          style={{ minWidth: tableMinWidth }}
        >
          {renderHeader()}
          {loading ? renderSkeleton() : renderBody()}
        </table>
      </div>

      {scrollX ? (
        <>
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-y-px left-px z-[40] w-4 rounded-l-[8px] bg-gradient-to-r from-[color:color-mix(in_srgb,var(--fx-shadow-core)_10%,transparent)] to-transparent transition-opacity duration-150",
              hasOverflowLeft ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-y-px right-px z-[40] w-4 rounded-r-[8px] bg-gradient-to-l from-[color:color-mix(in_srgb,var(--fx-shadow-core)_10%,transparent)] to-transparent transition-opacity duration-150",
              hasOverflowRight ? "opacity-100" : "opacity-0",
            )}
          />
        </>
      ) : null}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
