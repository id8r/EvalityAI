# Fx Legacy UI Audit — `evality-rfa` → `evality-ai`

**Status:** Read-only reference audit. Nothing migrated, copied, or refactored.
**Reviewer:** Senior Frontend Architect
**Reference source:** `../evality-rfa` (sibling project — raw Radix + custom Tailwind recipes, no shadcn, no cva)
**Target:** `evality-ai` Fx UI System (Next 16, shadcn + cva, frozen token foundation)

---

## How to read this

The reference project (`evality-rfa`) is a **more mature, product-complete** build than the current `evality-ai` foundation. It has a real recruiting product on top of it (jobs, candidates, clients, settings, a 7,500-line job workspace). Much of the *component-level* work is genuinely good and ahead of where `evality-ai` is today. The risk is that it carries: (a) a **different frozen palette and type scale**, (b) **raw Radix primitives** instead of shadcn, (c) **demo/localStorage product logic** baked into otherwise-reusable shells, and (d) a **different shell architecture** than the grid shell we just froze in `evality-ai`.

So this audit separates **the idea/pattern worth keeping** from **the implementation that must be rebuilt on the new foundation**.

---

## Executive summary

| Area | Verdict |
| :--- | :--- |
| Token recipe system (`lib/FxTheme.js`) | **Convert** — this is the `FX_TYPOGRAPHY`/`FX_LAYOUT` system our conventions promised but never built. Adopt the *structure*, reconcile the *values*. |
| `FxTable` | **Keep** — crown jewel. Port carefully. |
| `ui/sheet` (composed) | **Keep** — best overlay in either project. |
| `FxCreatableSelect`, `FxColumnPicker`, `FxFieldState` | **Keep / Convert** — mature, reusable. |
| `FxTabs`, `FxStepTabs`, `FxPill`, `FxEmptyState`, `FxAiButton`, toasts | **Convert** — good direction, rebuild on new foundation. |
| Filter bars, bulk-action bars, sort headers, split-detail sheets | **Convert** — mature UX, currently duplicated inline in pages. Extract to FxUI. |
| `FxRichTextEditor` (execCommand), `FxThemeController` (polling), shell architecture, demo/auth logic, landing page | **Rebuild / Discard** — fragile, superseded, or product-specific. |

---

## 1. Foundation — tokens, theme, colors

### `lib/FxTheme.js` — **CONVERT (high priority)**
A single file of Tailwind "class recipes": `TYPE`/`FX_TYPOGRAPHY` (40+ named roles), `COLORS`, `RADIUS`, `SHADOWS`, `SPACE`, `BUTTON_HEIGHT`, `CONTROL_HEIGHT`, `PILL`, `SURFACE`, `NAVIGATION`, `LAYOUT`, **`SHEET` (with motion tokens — open/close bezier + durations)**, `PANEL`, `TABLE`.

- **Why it matters:** `evality-ai`'s own `FxCodingConventions.md` mandates `FX_COLORS`/`FX_TYPOGRAPHY`/`FX_LAYOUT` exported groups — *and they don't exist yet*. This file is exactly that system, already proven across a real product. It is the single biggest thing to carry.
- **Caveats:** values are arbitrary-px Tailwind classes (`text-[14px]`); the scale **differs** from `evality-ai`'s frozen design system (e.g. rfa body input is `15px`, our DS says `14px`; rfa primary `#2060E8` vs our `#1068E0`). Adopt the **recipe architecture**, not the literal values.

### `app/globals.css` (token architecture) — **CONVERT (selectively)**
Strong semantic token set with **full light/dark parity**: `surface-raised`, `surface-hover`, `surface-selected`, **`table-header` / `table-row-alt`**, a disabled triad (`disabled-bg/text/border`), and a distinct **`--fx-ai` AI-accent** (magenta) token. `evality-ai` already mirrors most of these.

- **Keep the architecture** (semantic naming + dark parity).
- **Discard the values** — `evality-ai` already froze its own palette. Do **not** reintroduce `#2060E8`.
- **Worth adding to `evality-ai`:** `--fx-ai` (AI accent), `--fx-table-header`, `--fx-table-row-alt`, the disabled triad — these unblock `FxAiButton` and `FxTable`.

### `lib/FxDesignSystem.js` — **DISCARD (as data), reference only**
Hardcoded color/type showcase arrays for the `/ds` page (duplicate hexes again). We already moved `evality-ai`'s `/ds` to read **live tokens** — do not bring back hardcoded arrays. Keep only as a checklist of which roles to showcase.

### `FxThemeController.js` — **DISCARD**
Syncs theme via `setInterval(400ms)` polling + storage/focus/visibility listeners. Hacky. `evality-ai` already has `next-themes` installed — use it.

### `FxThemeToggle.js` / `useFxTheme` — **DISCARD impl, KEEP the UI idea**
Bespoke DOM-class + localStorage + custom-event toggle. Replace with `next-themes` `useTheme`. Keep only the sun/moon icon-button presentation.

---

## 2. Buttons

### `FxButton.js` — **CONVERT**
Plain `<button>` + a `fxButtonClassName({variant,size})` **class-helper** so non-button elements (links, triggers) can borrow button styling. 7 variants (`primary/secondary/outline/ghost/auth/destructive/destructiveOutline`), 3 sizes, a separate **`fxIconButtonClassName`** for square icon buttons, and a thorough disabled treatment. `transition-none` for a deliberately snappy feel.

- **Carry into our cva-based `FxButton`:** the richer variant set (esp. `destructiveOutline`, icon-button), the disabled treatment, and the **class-helper export** (useful for styling Radix triggers/links without nesting a `<button>`).
- **Rebuild on:** our shadcn + cva foundation (don't carry the raw-button version).

### `FxAiButton.js` — **CONVERT (keep concept)**
Gradient `primary → --fx-ai` button with an icon chip (Sparkles). Distinctive and on-brand for an AI product; good visual direction. Needs the `--fx-ai` token. Worth having as a first-class FxUI component.

---

## 3. Inputs & field system

### `FxFieldState.js` — **KEEP / CONVERT (foundational)**
Shared field-state contract: `FX_FIELD_STATES` (default/error/warning/success) + tone helpers for frame/label/message + `FxFieldLabel` (required `*` / `(optional)`) and `FxFieldMessage`. **Every** field component composes it. `evality-ai`'s current `FxInput` only has ad-hoc `message`/`hint`. This is the field foundation we lack — adopt it first, then build inputs on it.

### `FxInput.js` — **CONVERT**
Unified input/textarea (`textarea` prop), label/helper/validation, `rightElement` slot, number-centering, `forwardRef`. More complete than our current `FxInput`. Rebuild on the field-state system above.

### `FxTagInput.js` — **CONVERT**
Tokenized tags: paste-splitting (`, ; \n`), dedupe, backspace-to-remove, `maxTags`. Good interaction.

### `FxMultiSelectInput.js` — **REBUILD / CONSOLIDATE**
Tag input + suggestion dropdown. Overlaps heavily with `FxTagInput` and `FxCreatableSelect({multiple})`. Three components solve nearly the same problem — collapse into **one** tokenized multi-select primitive.

### `FxRichTextEditor.js` — **REBUILD (or defer)**
`contentEditable` + **`document.execCommand`** (deprecated) + `window.prompt` for links + raw-HTML storage. Functional but fragile and legacy. If rich text is needed v1, rebuild on a real editor (e.g. Tiptap/Lexical). Otherwise defer. **Discard the execCommand approach** regardless.

---

## 4. Selects

### `FxSelect.js` — **CONVERT**
Simple select built on `DropdownMenu` with check-marks + field-state integration. Solid. (Built on a menu rather than a true listbox — acceptable for now.)

### `FxCreatableSelect.js` — **KEEP / CONVERT (flagship)**
~600 lines: search, create-new (async `onCreate`), single + multi-select with chips, **full keyboard nav** (arrow/enter/esc/backspace), controlled/uncontrolled, click-outside, selection limits, busy/loading state. The most capable input in either project. Port carefully.

### `FxCreatableCombobox.js` — **CONVERT / CONSOLIDATE**
Popover-based single combobox (used in onboarding). Overlaps with `FxCreatableSelect`. Decide one combobox API and consolidate.

### `FxColumnPicker.js` — **KEEP / CONVERT**
Table column-visibility dropdown: required/locked columns, "suppress close on toggle" UX, checkbox list. Pairs with `FxTable`. Mature.

---

## 5. Tabs

### `FxTabs.js` — **CONVERT (reconcile a11y)**
4 visual variants (rounded/pill, underlined, segmented/compact, regular) + count badges, controlled. Used everywhere; the visual range is richer than `evality-ai`'s current shadcn `FxTabs`. **Trade-off:** rfa builds tabs from raw `<button>`s — no roving tabindex, no arrow-key nav, no `tabpanel` association. Rebuild on Radix Tabs for a11y **and** port the variant model.

### `FxStepTabs.js` — **KEEP / CONVERT**
Workflow stepper with error/completed icons + count badges. Drives multi-step forms (job creation). Good.

---

## 6. Sheets / drawers

### `components/ui/sheet.js` — **KEEP (best asset of its kind)**
Composed `Sheet` + `SheetHeader/Body/Footer` with `title/description/actions/leading/showClose` props, **motion tokens** (distinct open/close bezier + durations), size presets + `widthPx` override, and **editable-escape handling** (`isEditableEscapeTarget` / `data-fx-escape-cancel-sheet` prevents Esc from closing the sheet while you're editing a field). Used by 6+ sheet types. This is more polished than anything in `evality-ai` today — port largely as-is (onto our Radix dialog base).

---

## 7. Dialogs

### `components/ui/dialog.js` — **KEEP / port**
Composed dialog on `FX_PANEL` tokens, centered header, standard close. Solid, conventional. `evality-ai` already has a shadcn dialog — reconcile rather than duplicate.

### `FxAuthDialog.js` — **CONVERT shell, DISCARD logic**
The dialog **shell** (social buttons + email + divider) is a reusable auth pattern. The body — demo seeding, `localStorage` auth simulation, identity-from-email-domain guessing, `fx-auth-change` events — is throwaway product/demo logic. Keep the layout; drop the logic.

---

## 8. Tables

### `FxTable.js` — **KEEP (crown jewel)**
506 lines, genuinely strong: sticky header, sticky first/last columns with **computed pixel offsets**, column-picker integration, **row selection** (controlled/uncontrolled, indeterminate "select all"), density modes, **localStorage column persistence**, **scroll overflow shadows**, and a thoughtful fluid-width model (primary text columns grow, utility columns fixed), plus empty state. Port carefully — this would take significant effort to rebuild.

- **One API decision to make on the way in:** cells are pre-baked values addressed by `row[column.key]` rather than a `render(row)` function. That's simpler but limiting (formatting/JSX must be precomputed by the caller). Consider adding a `render` cell API during the port (see Questions).
- **Note:** sorting is **not** in the table — pages implement sort headers themselves (duplicated). Consider folding optional sorting into the table.

---

## 9. Filters & table toolbars — **CONVERT (extract from pages)**

There is **no reusable filter component** — the same pattern is hand-duplicated across `candidates`, `clients`, and `jobs` pages:
- tabs (with counts) + search input + primary action button
- keyboard shortcuts: `/` focuses search, `Esc` clears (re-implemented per page)
- sort-header buttons with `ArrowUpDown` (re-implemented per page)
- **bulk-action bar** ("N selected" + context-sensitive buttons) inline in the 7.5k-line job workspace

Mature UX, hacky duplication. Extract:
- **`FxListToolbar`** — tabs + search + actions (replaces ~30 lines × 3 pages)
- **`FxBulkActionBar`** — selected count + dynamic actions
- **`FxSortHeader`** — or build sorting into `FxTable`
- a **`useListSearchShortcuts`** hook for `/` + `Esc`

---

## 10. Cards

### `src/components/fx/FxCandidateCard.js` — **CONVERT patterns, DISCARD product glue**
Strong **interaction**: inline-editable rows (`EditableFieldRow` / `EditableContactRow` — pencil → input → check/cancel, Enter/Esc, integrates with the sheet's escape-cancel marker), fit-score display, "Historic jobs" `<details>` disclosure. But it's deeply product-specific (candidate schema, currency formatting, many field-name fallbacks) and even contains **demo fallback data** inside the component.

- **Extract as generic FxUI:** the inline-edit-row primitive (the real gem), the field-row, the fit-score chip, the disclosure card.
- **Discard:** the embedded demo data and candidate-schema assembly (those stay in product code).

### `src/components/fx/FxKanban.js` (+ `FxKanbanCard`) — **KEEP presentational / REBUILD for DnD**
Clean, data-driven board: columns (title/subtitle/count) + cards (title/subtitle/score/chips/rows/footer/action). **No drag-and-drop.** Good visual direction; keep as a presentational board. If pipeline DnD is required, rebuild with a DnD library.

---

## 11. Pills / badges

### `FxPill.js` — **CONVERT**
Tone (`neutral/subtle/primary/success/warning/danger`) + shape (`full/rect`) + class-helper. Clean and token-driven. `evality-ai` has a shadcn `FxBadge` — reconcile the tone model. **Also:** product pages have per-entity status pills (`CandidateStatusPill`, `ClientStatusPill`, …) that should converge into one generic **`FxStatusBadge`** with status→tone mapping.

---

## 12. Empty states

### `FxEmptyState.js` — **CONVERT**
Icon + title + body + action, centered card. Simple and good. (Pages also hand-roll empty states that should just use this.) `evality-ai` has no empty-state primitive yet — adopt this.

---

## 13. Toasts

### `FxToast.js` / `FxToaster.js` / `ui/toast.js` / `ui/use-toast.js` — **CONVERT (reconcile library)**
Complete Radix-Toast system: variants (success/warning/info/destructive via border tone), action support, and a clean **imperative helper API** (`showSuccess/showError/showWarning/showInfo`) plus a hook.

- **Decision:** `evality-ai` ships **sonner**, not Radix Toast. Don't port two toast stacks. Pick one (sonner is lighter) and **re-expose the `showSuccess/...` helper API** on top of it — that ergonomic API is worth keeping regardless of the underlying lib.

---

## 14. Job / candidate workspace patterns — **CONVERT (extract), product stays product**

From the large pages (`jobs/[jobId]` ~7.5k lines, `candidates`, `clients`, `settings`):
- **Master–detail:** list table → row click → full-screen detail **sheet** (tabs + activity timeline + kanban + resume pane). Mature workflow.
- **Split-detail sheet** (`showResumePane` + responsive `widthPx`) is duplicated across **5+ sheets** → extract **`FxSplitSheet`/`FxDetailSheet`**.
- **Multi-step creation sheet** (`JOB_SHEET_STEPS` + `FxStepTabs` + per-step validation) → good pattern; the *assembly* is product, the *scaffold* is reusable.

The workflows themselves (screening, scheduling, share-for-review) are product logic — **not** migration targets. Extract the reusable scaffolds only.

---

## 15. Landing / auth / onboarding

### `FxLandingPage.js` (494 lines) — **DISCARD / rebuild per new brand**
Marketing page with product-specific copy/sections. It's a page, not a primitive. `evality-ai`'s landing is intentionally a placeholder — rebuild to the new brand rather than porting.

### `FxAuthPage.js` / `FxAuthDialog.js` — **CONVERT shells, DISCARD demo auth**
Keep the auth layout patterns; discard the localStorage/demo-seed/identity-guessing logic.

### `FxOnboardingPage.js` — **CONVERT one pattern, DISCARD the flow**
The reusable gem is the **radio-card selection** (option cards with radio dot + title + description). Extract as **`FxOptionCard` / `FxRadioCardGroup`** (reconcile with `evality-ai`'s existing `FxRadioGroupField`). The persona/purpose mapping and routing are product/demo — discard.

### Shell (`AppShell.js` / `Sidebar.js` / `Navbar.js`) — **DISCARD architecture, KEEP interactions as reference**
Mature collapsible sidebar: localStorage-persisted collapse, collapse **tooltips**, account dropdown (theme/help/logout), animated label reveal. **But** the architecture (`position: fixed` + `padding-left` transition + internal collapse state) is *superseded* by the grid-based `FxAppShell` we just froze in `evality-ai` (slot composition, shell-owned widths, `sidebarCollapsed` already plumbed).

- **Discard:** the fixed/padding-left shell architecture.
- **Keep as reference for our `FxAppSidebar`:** the collapse-with-tooltips interaction, account menu, and persisted-collapse behavior — feed these into our shell when we implement collapse.

---

## Consolidated verdict

### Keep (port with care, minimal change)
- `FxTable` (+ `FxColumnPicker`)
- `components/ui/sheet.js` (composed sheet + motion + editable-escape)
- `FxCreatableSelect`
- `FxFieldState` (field-state foundation)
- Toast **helper API** ergonomics (`showSuccess/...`)

### Convert to FxUI (good idea, rebuild on shadcn/cva + frozen tokens)
- `lib/FxTheme.js` recipe system → real `FX_TYPOGRAPHY` / `FX_LAYOUT` / `FX_SPACE`
- `FxButton` (+ class-helper + icon button), `FxAiButton`
- `FxInput`, `FxTagInput`, `FxSelect`, `FxTabs`, `FxStepTabs`
- `FxPill` → reconcile with `FxBadge`; add generic `FxStatusBadge`
- `FxEmptyState`
- `ui/dialog` (reconcile with existing)
- **New extractions from pages:** `FxListToolbar`, `FxBulkActionBar`, `FxSortHeader` (or table sorting), `FxSplitSheet`, inline-edit-row primitive, `FxOptionCard`/`FxRadioCardGroup`
- `FxKanban` (presentational; DnD later)
- `--fx-ai`, `--fx-table-header`, `--fx-table-row-alt`, disabled triad tokens

### Rebuild from scratch
- `FxRichTextEditor` (drop `execCommand`; use a real editor or defer)
- Multi-token inputs — consolidate `FxTagInput` + `FxMultiSelectInput` + `FxCreatableSelect({multiple})` into one
- `FxTabs` a11y layer (Radix roving focus) while keeping variants
- Theme toggle on `next-themes`

### Discard
- `FxThemeController` (polling) and bespoke `useFxTheme`
- Legacy shell architecture (`AppShell`/fixed-sidebar) — superseded by our grid shell
- Demo/localStorage auth + seeding (`FxAuthDialog` logic, onboarding persona mapping)
- `FxLandingPage` (rebuild per brand)
- `lib/FxDesignSystem.js` hardcoded showcase arrays (our `/ds` reads live tokens now)
- All rfa **color values** and the rfa **primary** (`#2060E8`) — `evality-ai` palette is frozen

---

## Questions before migration

1. **Token reconciliation.** Adopt the `FxTheme.js` recipe *structure* (`FX_TYPOGRAPHY`/`FX_LAYOUT`/`FX_SPACE`) but with `evality-ai`'s frozen scale/palette? The rfa type scale differs (e.g. input `15px` vs our `14px`). Which scale is canonical?
2. **AI accent.** Add a `--fx-ai` token to the frozen palette so `FxAiButton` (gradient) can exist? If yes, what hue in our system (rfa uses magenta `#c737f0`; our current accent is indigo `#4f35fd`)?
3. **Toast library.** Standardize on **sonner** (already in `evality-ai`) and re-expose the `showSuccess/...` helper API on top — or port rfa's Radix toaster? (Recommend sonner + helpers.)
4. **Primitive base.** Rebuild `FxTable`/sheet/selects on **shadcn** primitives, or port rfa's raw-Radix `ui/*`? (Recommend shadcn to stay consistent with the new foundation.)
5. **Tabs foundation.** Radix Tabs (a11y) + ported variants, or keep rfa's button-based flexibility? (Recommend Radix + variants.)
6. **Table cell API.** Keep `row[columnKey]` prebaked cells, or move to `render(row)` column functions during the port? This changes every consumer — decide before porting.
7. **Multi-token consolidation.** OK to collapse `FxTagInput` + `FxMultiSelectInput` + `FxCreatableSelect({multiple})` into one primitive, or are the distinct UXs intentional?
8. **Scope & order.** Migrate **primitives first** (tokens → fields → table/sheet → selects), then product scaffolds (toolbars, detail sheets), and leave product workflows (screening/scheduling) for last? (Recommend yes.)
9. **Rich text.** Needed for v1? If so, budget for a real editor (Tiptap/Lexical) — `execCommand` is not portable forward.
10. **Shell collapse.** When we implement `sidebarCollapsed` in the frozen grid shell, do we want rfa's collapse-with-tooltips + account-menu interactions carried over verbatim?

---

*End of audit. No code in either project was modified.*
