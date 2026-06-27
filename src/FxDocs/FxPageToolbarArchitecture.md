# FxPageToolbar — Architecture (FROZEN, pre-build)

Frozen 2026-06-27 after legacy survey + review. Build once against this. Companion to
`FxTableArchitecture.md`.

## Philosophy

**`FxPageToolbar` owns layout, not widgets.** It arranges reusable controls into rows and zones;
it does not implement search, filters, tabs, export, columns, or AI. Those are independent Fx
components composed *into* the toolbar's zones. The toolbar only cares about arrangement, spacing,
sticky behavior, responsive wrapping, and the one piece of stateful chrome it legitimately owns —
**contextual row switching** (the bulk swap).

## Locked decisions

1. **Bulk mode = replace.** On selection, the controls row's content swaps to a bulk strip in place
   (the toolbar owns the swap mechanism; the page owns the selection state). "Augment" needs no
   special support — a page that wants always-visible buttons just composes them into the End zone.
2. **List page titles stay in the App Header** (`FxAppHeader`). The toolbar has no `title` prop; a
   page that wants an in-row title composes a node into a zone.
3. **`FxDetailHeader` is a separate reusable component** — entity summary, metadata grid, status
   chips. Not part of FxPageToolbar.
4. **View switch / Export are reserved** — no dedicated primitives until a page needs them; the
   toolbar already hosts them via a zone the day they exist.

Three-way separation:
- `FxAppHeader` → global application chrome (identity, nav, account).
- `FxPageToolbar` → page-level control **layout**.
- `FxDetailHeader` → entity summaries and metadata.

---

## 1. Legacy inventory (condensed)

Nothing was extracted in evality-rfa — every page hand-rolled its bar, but all share one skeleton:
a two-zone grid `grid-cols-[minmax(0,1fr)_auto]` (start zone grows, end zone hugs), `gap-[8px]`
clusters. Simple lists use one row; the Job Workspace stacks more rows of the same skeleton.

| Control | Jobs List | Job Workspace | Candidates | Clients | Action Center | Settings |
|---|---|---|---|---|---|---|
| Title | app header | detail header | app header | app header | title only | section headers |
| Back / breadcrumb | – | "All Jobs" | (detail: "All Candidates") | – | – | – |
| Search | ✓ "/" | ✓ "/" | ✓ "/" | ✓ "/" | – | – |
| Filters | (tabs) | ✓ stage dropdown + count | (tabs) | (tabs) | – | – |
| Tabs | Active/Archived | 8 stage tabs + counts | Active/Archived | Active/Archived | – | left-nav |
| Sort / Column mgr | table | table | table | table | – | – |
| Bulk actions | – | ✓ stage-specific | – | – | – | – |
| Primary action | Create Job | Add Candidates | Add Candidate | Add Client | – | Save (section) |
| Secondary / AI | row menu | Recommend (AI) · Call · Share · Edit | row menu | row menu | – | – |
| Export / View switch | – | – | – | – | – | – |
| Status chips | row dot | title dot | row pills + match% | row pill | – | – |

**Pattern groups** — FxPageToolbar targets the first three shapes:
1. **List toolbar** (Jobs/Candidates/Clients): tabs · search · CTA.
2. **Workspace toolbar** (Job Workspace): stage tabs → filter/search/CTA row that swaps to bulk.
3. **Simple** (Action Center): nothing, or a single zone.

Out of scope (separate patterns): **Detail header** (→ `FxDetailHeader`), **Settings section/form
header**, **Sheet header** (already `FxSheet` slots), **Marketing nav** (`FxHeader`).

---

## 2. Region model

A vertical stack of **Rows**. Each Row exposes a **Start** zone and an **End** zone (logical
left/right; RTL-safe). Empty rows/zones collapse to nothing. The toolbar never inspects what's in a
zone — it only lays them out.

```
┌──────────────────────────────────────────────────────────────┐
│ [ Start ............................ ]        [ ........ End ] │  Row
├──────────────────────────────────────────────────────────────┤
│ [ Start ............................ ]        [ ........ End ] │  Row
└──────────────────────────────────────────────────────────────┘
   └─ a Row may declare a bulk alternate; when swapActive, the
      toolbar renders that alternate in place of the row's content ─┘
```

Anything may go in a zone: `FxTabs`, `FxToolbarSearch`, a filter dropdown, status chips, an
`FxAiButton`, the `FxColumnManager` trigger, a view switch, an export button, a primary `FxButton`,
a `FxSelectionSummary`. The toolbar is indifferent.

---

## 3. Component API

Compound components. **All props are layout-only.**

```jsx
import { FxPageToolbar } from "@/components/FxUI/Layout";

<FxPageToolbar sticky density="default">         {/* container: rhythm, sticky, responsive wrap */}

  <FxPageToolbar.Row>                            {/* tabs row */}
    <FxPageToolbar.Start>{tabs}</FxPageToolbar.Start>
  </FxPageToolbar.Row>

  <FxPageToolbar.Row                             {/* controls row, swaps to bulk on selection */}
    swapActive={selectedCount > 0}
    bulk={
      <>
        <FxPageToolbar.Start>
          <FxSelectionSummary count={selectedCount} onClear={clearSelection} />
        </FxPageToolbar.Start>
        <FxPageToolbar.End>{bulkActions}</FxPageToolbar.End>
      </>
    }
  >
    <FxPageToolbar.Start>{filters}</FxPageToolbar.Start>
    <FxPageToolbar.End>{search}{primaryAction}</FxPageToolbar.End>
  </FxPageToolbar.Row>

</FxPageToolbar>
```

### Props
**`FxPageToolbar`** (container)
- `sticky?: boolean` — stick under the app header (toolbar owns the offset).
- `density?: "default" | "compact"` — row min-height / padding scale.
- `divider?: boolean` — bottom hairline under the stack.
- `className?: string`

**`FxPageToolbar.Row`**
- `swapActive?: boolean` — when true, render `bulk` instead of `children` (page owns the flag).
- `bulk?: ReactNode` — the contextual alternate content (itself `Start`/`End` zones). Toolbar owns
  the swap + crossfade.
- `align?: "center" | "start"` — vertical alignment of the zones (default center).
- `className?: string`

**`FxPageToolbar.Start` / `FxPageToolbar.End`** — zone wrappers (flex cluster, standard gap,
responsive wrap). Children-only; no behavioral props.

That's the entire API. No `title`, `search`, `tabs`, `filters`, `actions`, `export` props — ever.

---

## 4. Companion components (composed in, owned elsewhere)

These are the reusable widgets pages drop into zones. The toolbar does not import or know them.

| Component | Home | Owns | Status |
|---|---|---|---|
| `FxToolbarSearch` | `FxUI/Forms` | search input + "/" focus shortcut + clear (wraps `FxInput`); toolbar-agnostic, usable anywhere | **build alongside** |
| `FxSelectionSummary` | `FxUI/DataDisplay` | "N selected" + clear; pairs with `useFxTable` selection | **build alongside** |
| `FxBackLink` | `FxUI/Navigation` | back / breadcrumb leading control | build when needed |
| `FxTabs` | `FxUI/Navigation` | tab state + variants (exists) | done |
| `FxColumnManager` | `FxUI/DataDisplay` | column visibility/reorder — **table-owned**, only hosted in a zone if a page wants the trigger in the bar | done |
| `FxAiButton` | `FxUI/Forms` | AI action affordance (exists) | done |
| `FxButton` / overflow menu | `FxUI/Forms` + `ui/dropdown-menu` | primary/secondary actions (exist) | done |
| filter dropdowns | page-specific | filter state + options | page |
| view switch / export | reserved | — | later |

`FxDetailHeader` (separate doc/build): entity title · status chips · metadata grid · entity actions,
rendered **above** the toolbar on workspace/detail pages. Reuses `FxBackLink`, `FxBadge`, action
buttons — but is not a toolbar.

---

## 5. Ownership boundary (strict)

**FxPageToolbar OWNS:** row/zone layout · spacing & vertical rhythm · sticky behavior + offset ·
responsive wrapping (End zone wraps under Start on narrow widths) · contextual row switching (bulk
swap mechanism + transition) · the `FX_TOOLBAR` recipe in `FxTheme.js`.

**FxPageToolbar must NOT own:** search logic · filter logic · export logic · column logic · AI
logic · tab state · selection state. All passed in as already-wired nodes.

---

## 6. Implementation notes (for the build)

- **Home:** `src/components/FxUI/Layout/FxPageToolbar.js`; export via the `Layout` barrel
  (`src/components/FxUI/Layout/index.js`). `FxToolbarSearch` → `Forms`; `FxSelectionSummary` →
  `DataDisplay`.
- **SSR-first:** the toolbar shell (container/rows/zones) is presentational → **Server Component**.
  `swapActive` is just a boolean, so even the swap can render server-side. Interactivity lives only
  in the composed leaves (`FxToolbarSearch` is the client piece). Keep it that way.
- **Recipe:** add `FX_TOOLBAR` to `FxTheme.js` — the `grid-cols-[minmax(0,1fr)_auto]` row grid, zone
  flex + `gap-[8px]`, row min-heights per density, sticky offset (compose from `APP_HEADER_HEIGHT`),
  bottom-divider. No hardcoded colors; tokens only. The bulk swap reuses `FX_SHEET.motion`-style
  duration tokens, not inline values.
- **Responsibility split** stays: `globals.css` = token values; `FxTheme.js` = `FX_TOOLBAR` recipe +
  any geometry; `FxConstants.js` = nothing new.

---

## 7. Reference compositions

**Clients list** (pattern 1):
```jsx
<FxPageToolbar sticky>
  <FxPageToolbar.Row>
    <FxPageToolbar.Start><FxTabs items={statusTabs} value={tab} onValueChange={setTab} /></FxPageToolbar.Start>
    <FxPageToolbar.End>
      <FxToolbarSearch value={q} onChange={setQ} placeholder="Search clients" />
      <FxButton icon={Plus} onClick={addClient}>Add Client</FxButton>
    </FxPageToolbar.End>
  </FxPageToolbar.Row>
</FxPageToolbar>
```

**Job Workspace candidates** (pattern 2, with bulk swap):
```jsx
<FxPageToolbar sticky>
  <FxPageToolbar.Row>
    <FxPageToolbar.Start><FxTabs variant="stage" items={stageTabs} value={stage} onValueChange={setStage} /></FxPageToolbar.Start>
  </FxPageToolbar.Row>

  <FxPageToolbar.Row
    swapActive={selectedCount > 0}
    bulk={
      <>
        <FxPageToolbar.Start><FxSelectionSummary count={selectedCount} onClear={clearSelection} /></FxPageToolbar.Start>
        <FxPageToolbar.End>{stageBulkActions}</FxPageToolbar.End>
      </>
    }
  >
    <FxPageToolbar.Start>{stageFilter}</FxPageToolbar.Start>
    <FxPageToolbar.End>
      <FxToolbarSearch value={q} onChange={setQ} placeholder="Search candidates" />
      <FxButton icon={Plus} onClick={addCandidates}>Add Candidates</FxButton>
    </FxPageToolbar.End>
  </FxPageToolbar.Row>
</FxPageToolbar>
```
(Title/status/metadata for this page live in `FxDetailHeader` above the toolbar.)
