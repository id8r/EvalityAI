/* src/components/FxUI/DataDisplay/FxTable.js | Dense data-table primitive (v1.1 + resize) | Sree | 2026-06-27 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { FX_TABLE } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
import { FX_TABLE_CELL_PRESETS } from "@/components/FxUI/DataDisplay/FxTableCells";
import { useFxTable } from "@/components/FxUI/DataDisplay/useFxTable";
/* - - - - - - - - - - - - - - - - */

const DEFAULT_MIN_WIDTH = 140;
const ACTIONS_DEFAULT_WIDTH = 64;
const SELECTION_KEY = "__fx_selection__";
const SELECTION_WIDTH = 48;
const MIN_RESIZE_WIDTH = 56;
const CELL_PADDING_X = 32; // px-4 both sides
const AUTOFIT_BUFFER = 8;
const BODY_CELL_Y = "py-[10px]"; // compact-but-not-cramped row height (overrides recipe py-2)
const EMPTY_SIZING = {};

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

function isFixedWidthColumn(column) {
  return column.__selection || column.type === "actions";
}

function clampWidth(column, width) {
  const clamped = Math.max(column.minWidth ?? MIN_RESIZE_WIDTH, Math.round(width));
  return column.maxWidth != null ? Math.min(column.maxWidth, clamped) : clamped;
}

// `overrideWidth` (px) from controller sizing pins the column to an exact width.
function resolveColumnStyle(column, overrideWidth) {
  if (isFixedWidthColumn(column)) {
    const size = column.width ?? (column.__selection ? SELECTION_WIDTH : ACTIONS_DEFAULT_WIDTH);
    return { width: cssPx(size), minWidth: cssPx(size), maxWidth: cssPx(size) };
  }
  if (column.sticky) {
    // A pinned column is resizable when it declares min/max bounds: honor the controller's width override
    // (clamped to those bounds), otherwise fall back to its default width.
    const base = column.width ?? column.minWidth ?? DEFAULT_MIN_WIDTH;
    const size = overrideWidth != null ? clampWidth(column, overrideWidth) : base;
    return {
      width: cssPx(size),
      minWidth: cssPx(column.minWidth ?? size),
      maxWidth: cssPx(column.maxWidth ?? size),
    };
  }
  if (overrideWidth != null) {
    const value = cssPx(clampWidth(column, overrideWidth));
    return { width: value, minWidth: value, maxWidth: value };
  }
  const style = {};
  if (!column.grow && column.width != null) style.width = cssPx(column.width);
  style.minWidth = cssPx(column.minWidth ?? column.width ?? DEFAULT_MIN_WIDTH);
  if (column.maxWidth != null) style.maxWidth = cssPx(column.maxWidth);
  return style;
}

function widthOf(style) {
  return toPx(style.width) ?? toPx(style.minWidth) ?? DEFAULT_MIN_WIDTH;
}

function getTableMinWidth(columns, styles, minTableWidth) {
  const sum = columns.reduce((total, column) => {
    const style = styles.get(column.key);
    return total + (toPx(style.minWidth) ?? toPx(style.width) ?? DEFAULT_MIN_WIDTH);
  }, 0);
  return `${Math.max(sum, toPx(minTableWidth) ?? 0)}px`;
}

// Cumulative left/right offsets so multiple pinned columns stack correctly, honoring column order.
function buildStickyOffsets(columns, styles) {
  const left = new Map();
  const right = new Map();
  let accumulatedLeft = 0;
  columns.forEach((column) => {
    if (column.sticky === "left") {
      left.set(column.key, accumulatedLeft);
      accumulatedLeft += widthOf(styles.get(column.key));
    }
  });
  let accumulatedRight = 0;
  for (let index = columns.length - 1; index >= 0; index -= 1) {
    const column = columns[index];
    if (column.sticky === "right") {
      right.set(column.key, accumulatedRight);
      accumulatedRight += widthOf(styles.get(column.key));
    }
  }
  return { left, right };
}

function buildStickyMeta(columns) {
  const left = new Map();
  const right = new Map();
  const leftKeys = [];
  const rightKeys = [];

  let leftIndex = 0;
  columns.forEach((column) => {
    if (column.sticky === "left") {
      left.set(column.key, leftIndex);
      leftKeys.push(column.key);
      leftIndex += 1;
    }
  });

  let rightIndex = 0;
  for (let index = columns.length - 1; index >= 0; index -= 1) {
    const column = columns[index];
    if (column.sticky === "right") {
      right.set(column.key, rightIndex);
      rightIndex += 1;
    }
  }

  for (let index = 0; index < columns.length; index += 1) {
    const column = columns[index];
    if (column.sticky === "right") rightKeys.push(column.key);
  }

  return {
    left,
    right,
    leftBoundaryKey: leftKeys.at(-1) ?? null,
    rightBoundaryKey: rightKeys[0] ?? null,
  };
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

// Module-scoped so its identity is stable across renders — defining it inside FxTable remounts every handle on each render (and resizingKey changes fire a render on every pointer-move).
function ResizeHandle({ column, active, onStartResize, onAutoFit }) {
  return (
    <span
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize column"
      onPointerDown={(event) => onStartResize(event, column)}
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onAutoFit(column);
      }}
      onClick={(event) => event.stopPropagation()}
      className="group/resize absolute right-0 top-0 z-[6] flex h-full w-3 cursor-col-resize touch-none select-none items-center justify-end"
    >
      <span
        className={cn(
          "absolute right-0 top-0 h-full w-px transition-colors",
          active ? "bg-[var(--fx-border-strong)]" : "bg-transparent group-hover/resize:bg-[var(--fx-border-strong)]",
        )}
      />
    </span>
  );
}
/* - - - - - - - - - - - - - - - - */

export function FxTable({
  // controller: pass a shared useFxTable() instance, OR omit and let FxTable build one from the props below
  controller,
  columns,
  rows,
  getRowId,
  sort,
  defaultSort,
  onSortChange,
  enableRowSelection,
  selectedRowKeys,
  defaultSelectedRowKeys,
  onSelectedRowKeysChange,
  visibleColumnKeys,
  defaultVisibleColumnKeys,
  onVisibleColumnKeysChange,
  columnOrder,
  onColumnOrderChange,

  // render behaviour
  columnManager, // optional node (e.g. <FxColumnManager variant="icon" />) rendered in the last column header
  sortable = false,
  resizable = false,
  stickyHeader = false,
  stickyFirstColumn = false,
  stickyLastColumn = false,
  stickyLeadingCount = 0,
  stickyTrailingCount = 0,
  scrollX = true,
  minTableWidth,
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
  const internal = useFxTable({
    rows: rows ?? [],
    columns: columns ?? [],
    getRowId,
    sort,
    defaultSort,
    onSortChange,
    enableRowSelection,
    selectedRowKeys,
    defaultSelectedRowKeys,
    onSelectedRowKeysChange,
    visibleColumnKeys,
    defaultVisibleColumnKeys,
    onVisibleColumnKeysChange,
    columnOrder,
    onColumnOrderChange,
  });
  const table = controller ?? internal;
  const { rows: displayRows, columns: productColumns, selection, sortKey, sortDirection, toggleSort, getRowId: resolveRowId } = table;
  const widthOverrides = table.sizing?.widths ?? EMPTY_SIZING;

  const scrollRef = useRef(null);
  const measurerRef = useRef(null);
  const [hasOverflowLeft, setHasOverflowLeft] = useState(false);
  const [hasOverflowRight, setHasOverflowRight] = useState(false);
  const [resizingKey, setResizingKey] = useState(null);
  const hasHorizontalOverflow = hasOverflowLeft || hasOverflowRight;

  // Apply sticky-leading/trailing rules onto product columns, then inject the selection column.
  const renderColumns = useMemo(() => {
    const resolvedLeadingCount = stickyLeadingCount > 0 ? stickyLeadingCount : stickyFirstColumn ? 1 : 0;
    const resolvedTrailingCount = stickyTrailingCount > 0 ? stickyTrailingCount : stickyLastColumn ? 1 : 0;

    const withSticky = productColumns.map((column, index, all) => {
      if (column.sticky) return column;
      if (resolvedLeadingCount > 0 && index < resolvedLeadingCount) return { ...column, sticky: "left" };
      if (resolvedTrailingCount > 0 && index >= all.length - resolvedTrailingCount) return { ...column, sticky: "right" };
      return column;
    });
    if (!selection.enabled) return withSticky;
    const selectionColumn = {
      key: SELECTION_KEY,
      header: null,
      width: SELECTION_WIDTH,
      align: "center",
      sticky: "left",
      __selection: true,
    };
    return [selectionColumn, ...withSticky];
  }, [productColumns, selection.enabled, stickyFirstColumn, stickyLastColumn, stickyLeadingCount, stickyTrailingCount]);

  const columnStyles = useMemo(
    () => new Map(renderColumns.map((column) => [column.key, resolveColumnStyle(column, widthOverrides[column.key])])),
    [renderColumns, widthOverrides],
  );
  const tableMinWidth = useMemo(() => getTableMinWidth(renderColumns, columnStyles, minTableWidth), [renderColumns, columnStyles, minTableWidth]);
  const stickyOffsets = useMemo(() => buildStickyOffsets(renderColumns, columnStyles), [renderColumns, columnStyles]);
  const stickyMeta = useMemo(() => buildStickyMeta(renderColumns), [renderColumns]);
  const columnsKey = useMemo(() => renderColumns.map((column) => column.key).join(","), [renderColumns]);

  useEffect(() => {
    if (!scrollX) return undefined;
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

  // Remove the off-screen auto-fit measurer on unmount.
  useEffect(() => () => {
    if (measurerRef.current) {
      measurerRef.current.remove();
      measurerRef.current = null;
    }
  }, []);

  function isResizable(column) {
    return resizable && column.resizable !== false && !isFixedWidthColumn(column);
  }

  function startResize(event, column) {
    // NOTE: do not preventDefault() here — it suppresses the native dblclick (auto-fit).
    event.stopPropagation();
    const headerCell = event.currentTarget.closest("th");
    const startX = event.clientX;
    const startWidth = headerCell ? headerCell.getBoundingClientRect().width : widthOf(columnStyles.get(column.key));
    setResizingKey(column.key);

    function onMove(moveEvent) {
      const next = clampWidth(column, startWidth + (moveEvent.clientX - startX));
      table.sizing.setColumnWidth(column.key, next);
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      setResizingKey(null);
    }
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  // Double-click auto-fit: measure each body cell's natural (untruncated) content width via an off-screen clone, then snap the column to the widest + padding.
  function autoFitColumn(column) {
    const root = scrollRef.current;
    if (!root || typeof document === "undefined") return;
    let measurer = measurerRef.current;
    if (!measurer) {
      measurer = document.createElement("div");
      measurer.setAttribute("aria-hidden", "true");
      Object.assign(measurer.style, { position: "absolute", top: "0", left: "-99999px", visibility: "hidden", pointerEvents: "none", whiteSpace: "nowrap" });
      document.body.appendChild(measurer);
      measurerRef.current = measurer;
    }
    const key = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(column.key) : column.key;
    const cells = root.querySelectorAll(`td[data-col-key="${key}"]`);
    let max = 0;
    cells.forEach((cell) => {
      const content = cell.firstElementChild;
      if (!content) return;
      const clone = content.cloneNode(true);
      clone.querySelectorAll("*").forEach((node) => {
        node.style.maxWidth = "none";
        node.style.width = "auto";
        node.style.overflow = "visible";
        node.style.whiteSpace = "nowrap";
      });
      clone.style.maxWidth = "none";
      clone.style.width = "auto";
      clone.style.overflow = "visible";
      clone.style.whiteSpace = "nowrap";
      measurer.replaceChildren(clone);
      max = Math.max(max, clone.scrollWidth || clone.getBoundingClientRect().width);
    });
    measurer.replaceChildren();
    if (max > 0) table.sizing.setColumnWidth(column.key, clampWidth(column, max + CELL_PADDING_X + AUTOFIT_BUFFER));
  }

  function stickyStyleFor(column) {
    if (column.sticky === "left") return { left: `${stickyOffsets.left.get(column.key) ?? 0}px` };
    if (column.sticky === "right") return { right: `${stickyOffsets.right.get(column.key) ?? 0}px` };
    return {};
  }

  function stickyCellClass(column, base, edgeClass = "") {
    // Position comes from the inline left/right offsets (stickyStyleFor); the class only sets sticky + paint layer.
    if (column.sticky || column.__selection) return cn("sticky bg-clip-padding", base, edgeClass);
    return "";
  }

  function stickyEdgeClass(column) {
    if (column.sticky === "left" && column.key === stickyMeta.leftBoundaryKey) {
      return cn(
        "border-r border-r-[color:color-mix(in_srgb,var(--fx-border-light)_70%,transparent)]",
        hasHorizontalOverflow && hasOverflowLeft
          ? "shadow-[4px_0_10px_rgba(15,23,42,0.06)] dark:shadow-[4px_0_10px_rgba(0,0,0,0.28)]"
          : "",
      );
    }
    if (column.sticky === "right" && column.key === stickyMeta.rightBoundaryKey) {
      return cn(
        "border-l border-l-[color:color-mix(in_srgb,var(--fx-border-light)_70%,transparent)]",
        hasHorizontalOverflow && hasOverflowLeft && hasOverflowRight
          ? "shadow-[-4px_0_10px_rgba(15,23,42,0.06)] dark:shadow-[-4px_0_10px_rgba(0,0,0,0.28)]"
          : "",
      );
    }
    return "";
  }

  function stickyLayerStyle(column, isHeader = false) {
    if (column.__selection) return { zIndex: isHeader ? 31 : 21 };
    if (column.sticky === "left") return { zIndex: isHeader ? 32 + (stickyMeta.left.get(column.key) ?? 0) : 22 + (stickyMeta.left.get(column.key) ?? 0) };
    if (column.sticky === "right") return { zIndex: isHeader ? 40 + (stickyMeta.right.get(column.key) ?? 0) : 30 + (stickyMeta.right.get(column.key) ?? 0) };
    return {};
  }

  function renderHeader() {
    return (
      <thead className={headerClassName}>
        <tr>
          {renderColumns.map((column, index) => {
            const resolvedStyle = columnStyles.get(column.key);
            const headerStickyClass = column.sticky || column.__selection ? stickyCellClass(column, "bg-[var(--fx-table-header)]", stickyEdgeClass(column)) : "";
            const isLastColumn = index === renderColumns.length - 1;

            if (column.__selection) {
              return (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(FX_TABLE.headerCell, "px-0 text-center", stickyHeader && "sticky top-0 z-20", headerStickyClass)}
                  style={{ ...resolvedStyle, ...stickyStyleFor(column), ...stickyLayerStyle(column, true) }}
                >
                  <div className="flex h-full items-center justify-center">
                    <Checkbox
                      checked={selection.isAllVisibleSelected ? true : selection.isIndeterminate ? "indeterminate" : false}
                      onCheckedChange={selection.toggleAllVisible}
                      aria-label="Select all visible rows"
                    />
                  </div>
                </th>
              );
            }

            const isSorted = sortKey === column.key;
            const isSortable = sortable && column.sortable;
            return (
              <th
                key={column.key}
                scope="col"
                aria-sort={isSorted ? (sortDirection === "desc" ? "descending" : "ascending") : isSortable ? "none" : undefined}
                className={cn(
                  FX_TABLE.headerCell,
                  "relative",
                  alignClass(column.align),
                  stickyHeader && "sticky top-0 z-20",
                  headerStickyClass,
                  columnManager && isLastColumn && "px-0",
                  column.headerClassName,
                )}
                style={{ ...resolvedStyle, ...stickyStyleFor(column), ...stickyLayerStyle(column, true) }}
              >
                {columnManager && isLastColumn ? (
                  // Align the column-manager to the last column's own alignment so it lines up with that column's cells.
                  <div className={cn("flex items-center px-2", justifyClass(column.align))}>{columnManager}</div>
                ) : isSortable ? (
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
                    <SortIndicator state={isSorted ? sortDirection : null} />
                  </button>
                ) : (
                  <span className="block min-w-0 truncate">{column.header}</span>
                )}
                {isResizable(column) ? (
                  <ResizeHandle
                    column={column}
                    active={resizingKey === column.key}
                    onStartResize={startResize}
                    onAutoFit={autoFitColumn}
                  />
                ) : null}
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
        {Array.from({ length: loadingRowCount }).map((_, rowIndex) => {
          const cellBg = rowIndex % 2 === 1 ? "bg-[var(--fx-table-row-alt)]" : "bg-[var(--fx-surface)]";
          return (
            <tr key={`fx-skeleton-${rowIndex}`} className={cellBg}>
              {renderColumns.map((column) => (
                <td
                  key={column.key}
                  className={cn(FX_TABLE.bodyCell, BODY_CELL_Y, stickyCellClass(column, cellBg, stickyEdgeClass(column)))}
                  style={{ ...columnStyles.get(column.key), ...stickyStyleFor(column), ...stickyLayerStyle(column) }}
                >
                  <div className="h-3 w-3/5 animate-pulse rounded bg-[var(--fx-surface-muted)]" />
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    );
  }

  function renderBody() {
    if (!displayRows.length) {
      return (
        <tbody className={bodyClassName}>
          <tr>
            <td colSpan={renderColumns.length} className={FX_TABLE.empty}>
              {empty ?? <div className="py-6 text-center text-[var(--fx-text-muted)]">{emptyMessage}</div>}
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody className={bodyClassName}>
        {displayRows.map((row, rowIndex) => {
          const rowId = resolveRowId(row) ?? rowIndex;
          const isSelected = selection.enabled && selection.isSelected(rowId);
          // Sticky cells need an explicit solid background — bg-inherit renders transparent on a sticky cell's own compositor layer, letting scrolling columns bleed through. Mirror the row state; group-hover keeps sync.
          const isAltRow = rowIndex % 2 === 1;
          const cellBg = isSelected
            ? "bg-[color:color-mix(in_srgb,var(--fx-primary)_7%,var(--fx-surface))] group-hover:bg-[color:color-mix(in_srgb,var(--fx-primary)_10%,var(--fx-surface))]"
            : cn(isAltRow ? "bg-[var(--fx-table-row-alt)]" : "bg-[var(--fx-surface)]", "group-hover:bg-[var(--fx-surface-hover)]");
          return (
            <tr
              key={rowId}
              onClick={onRowClick ? (event) => onRowClick(row, event) : undefined}
              className={cn(
                "group transition-colors",
                isSelected
                  ? "bg-[color:color-mix(in_srgb,var(--fx-primary)_7%,var(--fx-surface))] hover:bg-[color:color-mix(in_srgb,var(--fx-primary)_10%,var(--fx-surface))]"
                  : "bg-[var(--fx-surface)] even:bg-[var(--fx-table-row-alt)] hover:bg-[var(--fx-surface-hover)]",
                onRowClick && "cursor-pointer",
                typeof rowClassName === "function" ? rowClassName(row, rowIndex) : rowClassName,
              )}
            >
              {renderColumns.map((column) => {
                if (column.__selection) {
                  return (
                    <td
                      key={column.key}
                      className={cn(FX_TABLE.bodyCell, BODY_CELL_Y, "p-0 text-center", stickyCellClass(column, cellBg, stickyEdgeClass(column)))}
                      style={{ ...columnStyles.get(column.key), ...stickyStyleFor(column), ...stickyLayerStyle(column) }}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="flex h-full min-h-full w-full items-center justify-center bg-clip-padding px-0 py-[10px]">
                        <Checkbox checked={isSelected} onCheckedChange={() => selection.toggleRow(rowId)} aria-label="Select row" />
                      </div>
                    </td>
                  );
                }
                return (
                  <td
                    key={column.key}
                    data-col-key={column.key}
                    className={cn(
                      FX_TABLE.bodyCell,
                      BODY_CELL_Y,
                      alignClass(column.align),
                      stickyCellClass(column, cellBg, stickyEdgeClass(column)),
                      column.cellClassName,
                    )}
                    style={{ ...columnStyles.get(column.key), ...stickyStyleFor(column), ...stickyLayerStyle(column) }}
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
