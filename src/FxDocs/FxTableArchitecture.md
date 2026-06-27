# FxTable Architecture

Status: **Implemented — v1.1 + column resize** (DS primitive, not yet wired into product pages).
Goal: give `FxTable` the same "compose, don't rebuild" treatment as `FxAppShell`, so that
product list pages (Jobs, Candidates, Clients, Action Center, Job Workspace) become column
definitions + data, not bespoke `<table>` markup.

This document has three parts:

- **Part A — Audit** of what the previous Evality (`evality-rfa/components/FxTable.js`) supported.
- **Part B — Canonical architecture** as frozen before building (historical rationale).
- **Part C — As-built reference** — the authoritative prop/API surface as actually shipped.
  **Where B and C differ, C wins.**

---

## Part A — Audit of the existing implementation

### A.0 Core mechanism

- Source: `evality-rfa/components/FxTable.js` — **506 lines, fully custom**. No `@tanstack/react-table`,
  no headless engine. It renders a real `<table class="table-fixed border-separate border-spacing-0">`.
- **Cell model today:** the *page* pre-renders every cell as JSX and stuffs it into `row[column.key]`.
  `FxTable` just drops `row[column.key]` into a `<td>`. The table knows nothing about "this is currency"
  or "this is a date" — all of that lives in each page's `useMemo`.
- **Row identity:** `row.id` is the selection key. Optional `row.__fxRowSelectionMeta.isNew` paints a
  left accent border (new-row highlight).
- Consumers: `app/app/jobs/page.js`, `app/app/jobs/[jobId]/page.js`, `app/app/candidates/page.js`,
  `app/app/clients/page.js`, `app/app/ds/page.js`.

### A.1 Feature matrix

| Dimension | Supported today | How / where | Gap |
|---|---|---|---|
| **Table layout** | ✅ | `table-fixed`, `border-separate`, per-column resolved width style, computed `minTableWidth` | — |
| **Sticky header** | ✅ | `stickyHeader` → `thead th` gets `sticky top-0 z-50` | — |
| **Sticky columns** | ✅ | `stickyFirstColumn` / `stickyLastColumn` / per-column `sticky:"left"\|"right"`; cumulative left/right offsets computed in `buildStickyOffsets` | offsets use *declared* width, not measured |
| **Sorting** | ⚠️ visual only | Table takes `sortedColumnKey` + `sortedColumnDirection` for the `aria-sort` + primary-color header; **comparators + click handlers live in every page** | logic duplicated 4× |
| **Searching** | ❌ in table | Page-level `useMemo` over a hand-built haystack string | duplicated 4× |
| **Filtering** | ❌ in table | Page-level tabs + status/age filters in `useMemo` | duplicated 4× |
| **Pagination** | ❌ | None anywhere — full filtered set renders inside a scroll container | missing |
| **Row selection** | ✅ | `enableRowSelection` injects a sticky-left checkbox column; header checkbox does all/indeterminate/none over *visible* rows; controlled or uncontrolled | selection is over visible rows only (no cross-page) |
| **Bulk actions** | ⚠️ page-owned | Only Job Workspace; a stage-specific icon toolbar (tooltip buttons), disabled when `selectedCount===0`, auto-clears on filter change | no table slot — pages render it beside the table |
| **Row actions** | ⚠️ page-owned | Kebab `DropdownMenu` rendered into the `actions` column cell by the page | no standard action API |
| **Inline actions** | ⚠️ page-owned | Job Workspace stage buttons (icon + tooltip + count badge) rendered into an `actions` cell | no standard slot |
| **Cell types** | ⚠️ page-owned | Page pre-renders JSX per cell (see A.2) | no typed renderers / presets |
| **Loading states** | ❌ | None — no skeleton/spinner anywhere | missing |
| **Empty states** | ⚠️ split | In-table `emptyMessage` single-row fallback **plus** larger page-level `FxEmptyState` blocks for the "no data at all" case | two mechanisms |
| **Column sizing** | ✅ | `width` / `minWidth` / `maxWidth`; primary text cols get `minWidth:200 + grow`; structural cols fixed | static only |
| **Column visibility** | ✅ | `visibleColumnKeys` (+ `defaultVisibleColumnKeys`), `FxColumnPicker` menu, `storageKey` localStorage persistence; `required`/`locked`/`hideable:false` always shown | — |
| **Resizing** | ❌ | `minWidth`/`maxWidth` are static; no drag handles | missing |
| **Pinning** | ✅ (= sticky cols) | Same mechanism as sticky columns; no user-driven pin toggle | static only |
| **Scrolling behaviour** | ✅ | Vertical scroll owns the container; horizontal `scrollX`; left/right **gradient overflow indicators** driven by scroll + `ResizeObserver` | — |
| **Responsive behaviour** | ⚠️ | Desktop-first; horizontal scroll is the only adaptation; no card/stacked mode | no mobile mode |
| **Keyboard a11y** | ⚠️ | Native focus on links/buttons/checkboxes; `aria-sort` on headers; **no roving focus / arrow-key cell nav** | partial |
| **Density** | ✅ | `density:"comfortable"\|"compact"` → cell padding + row min-height | — |
| **Class overrides** | ✅ (many) | `surfaceClassName`, `headerClassName`, `bodyClassName`, `rowClassName`, `headerCellClassName`, `bodyCellClassName`, `emptyClassName`, `*TextClassName` | over-broad surface |

### A.2 Cell-type catalogue (every type actually in use)

Extracted from the four product pages + the DS showcase:

| # | Cell type | Concrete usage | Render shape today |
|---|---|---|---|
| 1 | **Plain text** | client, location, industry, owner, interviewer, recommendation, email, rejectionReason | `<span class="truncate">{value}</span>` |
| 2 | **Primary link (name)** | candidate / job / client name → detail route **or** edit sheet | `<Link>`/`<button>` in primary color, `clickableData` type |
| 3 | **Secondary link** | role/jobTitle → job route | `<Link>` text color → hover primary |
| 4 | **Badge / pill / status** | `CandidateStatusPill`, `ClientStatusPill`, `FxPill` (shape `full`/`rect`; tones `neutral/subtle/primary/success/warning/danger`) | pill component |
| 5 | **Status dot** | colored dot before a name (`renderStatusDot`, `renderClientStatusDot`) | small round span |
| 6 | **Score / percentage** | `matchScore` → `"82%"` tabular-nums; Workspace "Fit" = colored chip, clickable → CV breakdown, fill/tone by score band | text or chip button |
| 7 | **Number / count** | positions, openJobs, candidates count, experience `"5y"`; pipeline counts = **clickable pill → stage** | tabular-nums span / link pill |
| 8 | **Currency** | currentSalary / expectedSalary via `formatCurrency`, tabular-nums, right-aligned | span |
| 9 | **Date** | relative (`"2h ago"`/`"3 days ago"`) with `title` = full datetime; compact date; muted | span + title tooltip |
| 10 | **Availability** | `formatAvailability(days)` → `"14 days"` | span |
| 11 | **Two-line / stacked** | scheduleDetails (primary + muted secondary); strengthsGaps (strengths + "Missing: …"), clickable | stacked div, sometimes a button |
| 12 | **Inline action buttons** | Workspace stage buttons (icon + tooltip + count badge) | icon buttons row |
| 13 | **Row actions menu (kebab)** | `MoreHorizontal` → View / Edit / Archive / Restore / Delete(danger); stage-dependent | `DropdownMenu` |
| 14 | **Custom JSX** | typography sample, client-status control, "View Feedback" button | arbitrary node |
| 15 | **Selection checkbox** | structural, injected | `Checkbox` |
| 16 | **Column picker** | structural, header of last column | `FxColumnPicker` |

### A.3 Centralized vs duplicated (the lesson)

- **Centralized well in `FxTable`:** rendering shell, density, sticky header/columns, scroll indicators,
  min-width math, row-selection mechanics, column-visibility + persistence.
- **Duplicated in every page (the pain):** sort comparators, search matching, filter/tab logic, the
  *entire* cell vocabulary (each page re-codes text/link/badge/score/currency/date), row-action menus,
  bulk toolbars, and "no data" empty states.

> The single biggest lever for "pages become composition" is **moving the cell vocabulary and the
> sort/search/filter controller into FxTable**, leaving pages to declare columns + supply data + wire
> domain handlers.

---

## Part B — Canonical `FxTable` architecture

### B.1 Design goals

1. A product page should express a table as **column defs + rows + a few handlers** — no `<table>` markup, no re-coded cell styling.
2. Mechanics (layout, sticky, selection, visibility, scroll, density, empty/loading) are **owned by FxTable**.
3. Sort / search / filter / pagination are **built-in but opt-in**, with a controlled escape hatch so existing page logic can still drive when needed.
4. A **typed cell-renderer library** covers every type in A.2; arbitrary `cell` render funcs remain available.
5. Domain meaning (status→tone vocab, action semantics, data fetching, routes) stays **product-specific**.

### B.2 Layered structure (three layers, like the shell)

```
ui/table.js              ← dumb shadcn primitives (Table/Row/Head/Cell). Already exists.
        │
useFxTable() (controller)← headless state: sort, search, filter, selection, visibility, pagination.
        │                  Pure logic, no markup. Optional — pages can skip and stay controlled.
        │
FxTable (presentational) ← owns markup, sticky/offset math, scroll indicators, density,
        │                  cell-renderer dispatch, empty/loading, toolbar + bulk-bar slots.
        │
FxTableCells (library)   ← text/link/badge/score/currency/date/number/actions presets.
```

Home: `src/components/FxUI/DataDisplay/` (next to `FxBadge`), exported via the `DataDisplay` barrel.
Builds on the existing `ui/table.js`, `ui/checkbox.js`, `FxBadge`, `FX_TABLE`/`FX_CONTROL`/`FX_TYPOGRAPHY` recipes.

### B.3 Responsibilities

**FxTable owns**
- Table shell, `table-fixed` width architecture, computed `minTableWidth`.
- Sticky header, sticky/pinned columns, cumulative offset math, z-index layering.
- Horizontal/vertical scroll ownership + gradient overflow indicators.
- Density, row hover/selected styling, new-row accent.
- Selection column injection + header tri-state checkbox.
- Column-visibility rendering + `FxColumnPicker` + `storageKey` persistence.
- **Cell-renderer dispatch** by `column.type` / `column.cell`.
- Empty state + **loading skeleton** (new).
- Toolbar region (search + filters + column picker) and **bulk-action bar** region as *slots*.

**`useFxTable` controller owns (opt-in)**
- Sort state + default comparators (string / number / date), tri-state cycle (asc→desc→none).
- Search state + default substring matching over configured fields.
- Filter state (tabs / segments) via a declarative predicate map.
- Selection state (controlled or internal), auto-prune on data change.
- Visibility state + persistence handshake.
- Pagination (optional): client slice now; server-driven later via the same shape.

**Product page owns (stays bespoke)**
- Data fetching / store reads, route `href`s, edit-sheet wiring.
- Status → tone/label vocabulary (passed into badge cells).
- Action menu *contents* and bulk-action *handlers* (business logic).
- Domain validation and toasts.

### B.4 Component API (proposed)

```jsx
<FxTable
  /* data */
  columns={columns}            // FxColumn[]  (see B.5)
  rows={rows}                  // object[]; getRowId resolves identity
  getRowId={(row) => row.id}   // default: row.id

  /* controller: either let FxTable run it… */
  sort                         // boolean | { key, direction } (uncontrolled default)
  onSortChange
  search                       // boolean | { fields: string[], placeholder }
  filters                      // FxFilter[]  (tabs/segments, declarative predicates)
  pagination                   // false | { pageSize, mode: "client" | "server", total }
  /* …or drive it yourself (back-compat with today) */
  sortedColumnKey              // visual-only override
  sortedColumnDirection

  /* selection */
  enableRowSelection
  selectedRowKeys              // controlled
  defaultSelectedRowKeys
  onSelectedRowKeysChange
  renderBulkActions={(ctx) => …}   // ctx: { selectedRows, selectedKeys, clear }

  /* column visibility */
  enableColumnPicker
  visibleColumnKeys
  defaultVisibleColumnKeys
  onVisibleColumnKeysChange
  storageKey

  /* layout / behaviour */
  stickyHeader
  stickyFirstColumn
  stickyLastColumn
  scrollX
  density="comfortable" | "compact"
  minTableWidth

  /* states */
  loading                      // boolean → skeleton rows  (NEW)
  loadingRowCount={8}
  empty={<FxEmptyState …/>}    // rich empty (NEW slot) — falls back to emptyMessage
  emptyMessage

  /* slots */
  toolbarStart toolbarEnd      // extra toolbar content (e.g. "Add Job")

  /* escape hatches */
  className surfaceClassName rowClassName onRowClick
/>
```

Notes:
- `sort`/`search`/`filters`/`pagination` are **opt-in**. Omit them → table is purely presentational and
  the page drives everything (today's behaviour, preserved for migration).
- The pile of `*ClassName` props from the old API is collapsed to a small set; deep overrides move to
  per-column `cellClassName` / `headerClassName`.

### B.5 Column definition shape (canonical)

```ts
FxColumn = {
  key: string                       // identity + default data accessor (row[key])
  header: ReactNode | string        // header label
  accessor?: (row) => any           // when value ≠ row[key]

  // sizing (unchanged semantics from today)
  width?, minWidth?, maxWidth?: number
  grow?: number                     // fluid growth weight
  align?: "left" | "center" | "right"

  // structure
  sticky?: "left" | "right"         // = pinning
  required?, locked?, hideable?: boolean
  defaultVisible?: boolean
  menuLabel?: string                // column-picker label when header is JSX

  // sorting
  sortable?: boolean
  sortType?: "string" | "number" | "date" | ((a, b) => number)
  sortAccessor?: (row) => any       // sort by a different value than displayed

  // searching
  searchable?: boolean              // include in default search haystack

  // RENDERING — the big change
  type?: "text" | "link" | "badge" | "score" | "currency" | "date"
       | "number" | "availability" | "stacked" | "actions"   // preset (see B.6)
  cell?: (row, ctx) => ReactNode    // full custom renderer (always wins)
  cellProps?: (row) => object       // typed props for the preset (href, tone, currency…)
  cellClassName?: string
}
```

- **Back-compat path:** a column with neither `type` nor `cell` falls back to `row[key]` (exactly
  today's "page injected JSX" model), so migration is incremental.
- **Forward path:** declare `type:"currency"` + `cellProps` and delete the page's hand-rolled span.

### B.6 Cell-renderer library (`FxTableCells`)

Each preset = a small component covering a row in A.2:

| `type` | Renders | Key `cellProps` |
|---|---|---|
| `text` | truncating text, optional muted | `{ muted, title }` |
| `link` | primary/secondary link or button → route/handler | `{ href, onClick, tone:"primary"\|"text" }` |
| `badge` | `FxBadge` pill | `{ tone, label }` (page supplies status→tone map) |
| `score` | `"82%"` tabular, optional colored chip + click | `{ value, band?, onClick? }` |
| `number` | tabular number/count, optional clickable pill | `{ value, href? }` |
| `currency` | `formatCurrency`, right-aligned tabular | `{ amount, currency }` |
| `date` | relative + `title` full datetime, muted | `{ value, mode:"relative"\|"compact" }` |
| `availability` | `formatAvailability(days)` | `{ days }` |
| `stacked` | primary + muted secondary line, optional click | `{ primary, secondary, onClick? }` |
| `actions` | kebab `DropdownMenu` and/or inline icon buttons | `{ items, inline }` |

`status dot` and `avatar`/`icon` are modifiers usable inside `text`/`link`/`stacked` (leading slot),
not separate columns. (Avatar/icon/progress aren't in the old tables but the slot makes them trivial later.)

### B.7 Extension points

- `column.cell(row, ctx)` — arbitrary renderer; `ctx` exposes `{ selected, rowId, density }`.
- `cellProps(row)` — feed typed presets without writing JSX.
- `renderBulkActions(ctx)` — the page owns bulk-bar *content*; FxTable owns when it appears + layout.
- `toolbarStart` / `toolbarEnd` — page-level controls (Add, export) in the shared toolbar.
- `onRowClick(row)` — optional whole-row navigation.
- `filters[].predicate(row, value)` — declarative tab/segment filtering.
- `sortType` / `sortAccessor` — per-column comparators when defaults don't fit.

### B.8 Optional features (opt-in, off by default)

- Built-in **sort** controller (default comparators + header click + `aria-sort`).
- Built-in **search** (configurable fields) and **filters** (tabs/segments).
- **Pagination** — client slice first; same prop shape later carries server mode.
- **Loading skeleton** rows.
- **Rich empty** slot (`FxEmptyState`) replacing the single-line fallback.
- Future, not in v1: column **resizing**, user-driven **pin** toggles, **row grouping/expansion**,
  **responsive card mode**, **roving-focus keyboard nav**, virtualization.

### B.9 What belongs in FxTable vs product-specific

| Belongs in **FxTable** (DS) | Stays **product-specific** |
|---|---|
| Table shell, width architecture, sticky/offset math | Which columns exist & their order per page |
| Scroll ownership + overflow indicators | Data source / store reads / fetching |
| Density, hover/selected/new-row styling | Route `href`s and edit-sheet wiring |
| Selection mechanics + tri-state header checkbox | Bulk-action **handlers** (the business logic) |
| Column visibility + picker + persistence | Row-action menu **items** (the verbs) |
| Cell-renderer **presets** (text/link/badge/score/currency/date/number) | Status → tone/label **vocabulary** |
| Default sort/search/filter **engine** | Domain filters (stage, screening age, …) |
| Empty + loading **chrome** | Empty-state **copy** & illustrations |
| `aria-sort`, focusable controls, a11y baseline | Toasts, validation, navigation side-effects |

### B.10 Locked decisions (frozen 2026-06-26)

1. **Cell model — LOCKED: typed columns + `cell()`.** Columns declare `type` (+ `cellProps`) resolved by
   the `FxTableCells` library; `cell(row, ctx)` is the custom escape hatch; bare `row[key]` stays as the
   incremental-migration fallback. This is the freeze's highest-leverage commitment.
2. **Controller scope — LOCKED: built-in opt-in `useFxTable`.** Default comparators, substring search,
   declarative filters, and (deferred) pagination ship inside the controller, all opt-in, with a
   controlled escape hatch so pages can still drive. Removes the duplicated page `useMemo`s over time.
3. **Engine — LOCKED: stay custom.** No `@tanstack/react-table`. We extend the existing hand-rolled
   table and keep full control of the sticky/offset/scroll math that already works.
4. **Pagination — LOCKED: deferred from v1.** Not built now; the `pagination` prop shape is reserved so
   client- then server-mode can land later without API churn.

### B.11 v1 build scope (what "done" means for the first implementation)

In scope: three-layer split (`ui/table` → `useFxTable` → `FxTable` → `FxTableCells`); typed cell presets
for every type in A.2; sticky header/columns + offsets; scroll indicators; density; selection +
`renderBulkActions` slot; column visibility + picker + persistence; opt-in sort/search/filter;
loading skeleton + rich empty slot; `actions` cell preset (kebab + inline). Out of scope for v1:
pagination, column resizing, user-driven pin toggles, row grouping/expansion, responsive card mode,
roving-focus keyboard nav, virtualization.

---

## Part C — As-built reference (v1.1 + resize)

> Authoritative API surface as shipped. Where this differs from Part B, **C wins.**
> Files (all under `src/components/FxUI/DataDisplay/`, exported via the `DataDisplay` barrel):
> `FxTable.js` · `useFxTable.js` · `FxTableCells.js` · `FxColumnManager.js`.

### C.0 What shipped vs. Part B

| Area | As-built |
|---|---|
| Cell model | ✅ typed `column.type` + `cell()` + `row[key]` fallback (as frozen) |
| Engine | ✅ custom, no TanStack (as frozen) |
| Sort | ✅ controller-backed (opt-in via `sortable`) |
| Selection | ✅ injected sticky-left checkbox column (Radix checkbox) |
| Column manager | ✅ `FxColumnManager` (visibility **+ drag reorder + reset**) — supersedes the planned `FxColumnPicker` |
| Pinning | ✅ per-column `sticky:"left"\|"right"` (+ `stickyFirstColumn`/`stickyLastColumn` convenience) |
| Column resize | ✅ opt-in (`resizable`) — drag border + double-click auto-fit. *(Was "future" in B.8; added 2026-06-27.)* |
| Zebra striping | ✅ `even:` row stripe via opaque `--fx-table-row-alt` token |
| Loading / empty | ✅ skeleton rows + `empty` node slot / `emptyMessage` fallback |
| Indicators | ✅ status-dot treatment on text/link/stacked cells |
| **Not built yet** | ❌ search UI, filter UI, pagination, bulk-actions UI, `density` prop, `storageKey` persistence, `toolbarStart/End` slots, `renderBulkActions`, responsive card mode, virtualization, keyboard cell-nav |

### C.1 `<FxTable>` props

```jsx
<FxTable
  /* EITHER share a controller (required for FxColumnManager / external selection state) … */
  controller={useFxTable(...)}        // a useFxTable() instance; when present, columns/rows/etc come from it

  /* … OR pass data + config and FxTable builds its own controller internally */
  columns={FxColumn[]} rows={object[]} getRowId={(row)=>row.id}
  sort defaultSort={{key,direction}} onSortChange            // sorting (state in controller)
  enableRowSelection selectedRowKeys defaultSelectedRowKeys onSelectedRowKeysChange
  visibleColumnKeys defaultVisibleColumnKeys onVisibleColumnKeysChange
  columnOrder onColumnOrderChange
  columnSizing defaultColumnSizing onColumnSizingChange      // width overrides (px)

  /* render behaviour */
  columnManager={<FxColumnManager variant="icon" />}  // node rendered in the LAST column header
  sortable={false}                    // master switch: show sort affordance on sortable columns
  resizable={false}                   // master switch: enable drag-resize + dbl-click auto-fit
  stickyHeader stickyFirstColumn stickyLastColumn
  scrollX={true} minTableWidth onRowClick={(row,event)=>{}}

  /* states */
  loading={false} loadingRowCount={8}
  empty={<FxEmptyState/>} emptyMessage="No rows to display."

  /* style hooks */
  className surfaceClassName headerClassName bodyClassName rowClassName
/>
```

- **Controller pattern:** `controller` lets `FxTable` and `FxColumnManager` share one `useFxTable()`
  instance. Omit it and `FxTable` builds an internal controller from the data/config props (simple tables).
- `sortable` / `resizable` are master switches; individual columns opt out via `column.sortable` /
  `column.resizable !== false`. Selection and `actions`-type columns are never resizable.

### C.2 `FxColumn` shape (as built)

```ts
FxColumn = {
  key: string                                  // identity + default accessor (row[key])
  header: ReactNode | string
  accessor?: (row) => any                       // when displayed value ≠ row[key]
  menuLabel?: string                            // FxColumnManager label when header is empty/JSX

  // sizing
  width?, minWidth?, maxWidth?: number          // minWidth also clamps drag/auto-fit
  grow?: number                                 // fluid (no fixed width) until resized
  align?: "left" | "center" | "right"
  resizable?: boolean                           // default true (when table `resizable`); false to pin width

  // structure
  sticky?: "left" | "right"                     // pinning; offsets stack in render order
  locked?: boolean                              // (and `hideable:false`) → always visible + not draggable in manager
  defaultVisible?: boolean                      // default true; false = hidden until toggled on

  // sorting
  sortable?: boolean
  sortType?: "string" | "number" | "date" | ((a,b)=>number)
  sortAccessor?: (row) => any

  // rendering
  type?: "text"|"link"|"badge"|"score"|"number"|"currency"|"date"|"availability"|"stacked"|"actions"
  cell?: (row, ctx) => ReactNode                // ctx = { row, rowIndex, column }; always wins
  cellProps?: (row) => object                   // typed props for the preset
  cellClassName?, headerClassName?: string
}
```

Resolution order per cell: `cell(row,ctx)` → preset(`type`, value=`accessor?.(row) ?? row[key]`, `cellProps?.(row)`) → raw `row[key]`.

### C.3 `useFxTable(config)` → controller

Config keys mirror the FxTable data/config props in C.1. Returns:

```ts
{
  rows,                 // sorted rows
  columns,              // resolved: ordered + visible product columns (no injected selection col)
  getRowId,
  sortKey, sortDirection, toggleSort(key),
  selection: { enabled, selectedKeys, selectedKeySet, count,
               isAllVisibleSelected, isIndeterminate,
               isSelected(id), toggleRow(id), toggleAllVisible(), clear() },
  columnManager: { items:[{key,label,visible,locked}], visibleKeys, order,
                   toggleColumn(key), moveColumn(draggedKey,targetKey), reset() },
  sizing: { widths:{[key]:px}, setColumnWidth(key,px), resetColumnWidth(key), resetSizing() },
}
```

- `moveColumn` reorders only non-locked columns; locked columns keep their absolute positions.
- `columnManager.reset()` restores default order + visibility **and** clears width overrides.

### C.4 Cell presets (`FxTableCells`)

`FX_TABLE_CELL_PRESETS` maps `type` → `(value, props, ctx) => ReactNode`. Components are also exported
directly (`FxTextCell`, `FxLinkCell`, `FxBadgeCell`, `FxScoreCell`, `FxNumberCell`, `FxCurrencyCell`,
`FxDateCell`, `FxAvailabilityCell`, `FxStackedCell`, `FxActionsCell`, `FxCellDot`).

| `type` | value | key `cellProps` |
|---|---|---|
| `text` | text | `{ muted, title, indicator }` |
| `link` | text | `{ href, onClick, tone:"primary"\|"text", title, indicator }` |
| `badge` | label | `{ tone, variant:"soft"\|"outline"\|"solid", size, dot, label }` |
| `score` | number | `{ tone, suffix="%", onClick }` (chip when tone/onClick, else plain) |
| `number` | number | `{ href }` |
| `currency` | amount | `{ currency="USD" }` |
| `date` | date | `{ mode:"relative"\|"compact" }` |
| `availability` | days | — |
| `stacked` | — | `{ primary, secondary, onClick, indicator }` |
| `actions` | — | `{ inline:[{icon,label,onClick,tone}], items:[{label,onClick?,href?,icon?,tone?,separatorBefore?}], align, menuLabel }` |

**Indicator / status dot** (`text`/`link`/`stacked`): `indicator` accepts a tone string (`"warning"`),
an object `{ tone, pulse, title }`, or `true`/`{ tone:null }` to **reserve an invisible gutter** so text
stays aligned across rows. Tones match `FxBadge`: `neutral·subtle·primary·success·warning·danger·info`.

Exported formatters: `formatCurrency`, `formatCompactDate`, `formatRelativeTime`, `formatAvailability`.

### C.5 `<FxColumnManager>`

```jsx
<FxColumnManager controller={table} variant="button"|"icon" label="Columns" align="right" />
```

Compact body-portal popover (so it isn't clipped by the table's overflow when placed in a header cell).
Toggle visibility, drag-to-reorder (locked columns shown with a lock, non-draggable), reset. Native HTML5
drag-and-drop (no menu primitive intercepting pointers). `variant="icon"` is the bare header-slot trigger;
pass it to `FxTable`'s `columnManager` prop to render it in the last (kebab) column header.

### C.6 Resize behaviour

Enabled by `resizable` on `FxTable`. Each resizable column's header right edge is a drag handle:
hover shows a soft `--fx-border-strong` line + `col-resize` cursor (no glyph); drag updates width live
(clamped to `minWidth`); **double-click auto-fits** to the column's max content width (measured by cloning
each body cell off-screen with `white-space:nowrap`, so badges/links/stacked all measure correctly).
Widths live in `controller.sizing` and feed the same width→offset→min-width math as everything else; a
`grow` column becomes fixed-width once dragged. Widths are session-only (no persistence yet).

### C.7 Tokens touched

- `--fx-info` (light/dark) added for the 7th `FxBadge` tone.
- `--fx-table-row-alt` made **opaque** (light `#f9fbfd`, dark `#293140`) so zebra striping renders and
  sticky cells (`bg-inherit`) stay opaque over scrolled content.
- `ui/checkbox.js` → `rounded-[5px]`; `ui/radio-group.js` → `rounded-full` (both Radix primitives).

### C.8 DS showcase

`src/app/ds/FxTableShowcase.js` (Surfaces tab → "Data Table") exercises every feature with **local mock
data only** (no product seed data, not wired to Jobs/Candidates/Clients): typed cells incl. dot indicator,
selection toggle, sticky left/right + header, zebra, sort, drag-resize + auto-fit, and the column manager
(toggle + reorder + reset) in the kebab header.
```
