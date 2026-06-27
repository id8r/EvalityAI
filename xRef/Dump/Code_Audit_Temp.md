# FxUI Engineering Integrity Pass

Scope: every file created/substantially modified in the rebuild (FxUI components, `src/lib`, `/ds` showcases). Checked against the 8 criteria + `FxCodingConventions.md`. Verdict up front: the foundation is healthy — SSR boundaries are mostly correct, storage goes through the single `FxID8r` root, recipes exist. The real issues were a handful of **dead-but-re-inlined recipes that had drifted**, **copy-pasted theme logic**, and **two genuine perf bugs**. Those are fixed. Larger DRY refactors that touch rendering are listed as a deferred pass (no dev-server verification here — you test visually).

---

## Applied this pass

| # | File(s) | Criterion | Change |
|---|---------|-----------|--------|
| 1 | `FxTable.js` | 7 Perf **High** | `ResizeHandle` was defined **inside** the render body, so React remounted every handle on each render — worst during an active drag (`resizingKey` re-renders on every pointer-move). Hoisted to module scope (next to `SortIndicator`); state passed as props (`active`, `onStartResize`, `onAutoFit`). |
| 2 | `useFxTable.js` | 7 Perf **Med** | Controlled `sortState` rebuilt a fresh object every render, re-running `[...rows].sort(...)` on every unrelated parent re-render. Wrapped in `useMemo`. |
| 3 | `FxThemeToggle.js`, `FxSidebarAccount.js`, **new** `useFxTheme.js` | 2 DRY **High** | `subscribeTheme`/`getThemeSnapshot`/`getThemeServerSnapshot` + the apply-theme write were duplicated verbatim across two files. Extracted to one client runtime (`useFxIsDark`, `applyTheme`, `toggleTheme`); both consume it. The account menu no longer owns theme-write logic. |
| 4 | `FxThemeController.js` | 7 Perf **Med** | Removed a `setInterval(syncTheme, 400)` that polled localStorage and toggled the class **forever**. `fx-theme-change` (same-tab) + `storage` (cross-tab) + `focus`/`visibilitychange` already cover every path. |
| 5 | `FxSidebarNavItem.js` + `FxTheme.js` | 2/3 DRY **High** | Component re-inlined the `FX_NAVIGATION` recipe **and had drifted** from it (`gap-3`→`gap-[12px]`, missing `duration-100`). Reconciled `FX_NAVIGATION` to the as-built truth and made the component consume `itemBase`/`itemActive`/`itemInactive`/`iconSlot`. Also dropped its needless `"use client"` (no hooks/handlers/browser APIs). |
| 6 | `FxTheme.js` | 8 Correctness **Med** | `FX_BUTTON.transition` used `duration-120` — not a real Tailwind class, so it silently no-op'd and **every `FxButton` ran at the browser-default transition**. Fixed to `duration-[120ms]`. |
| 7 | `FxTheme.js` | 5 Dead code | Removed `FX_CONTROL` — zero code consumers, and it had drifted from the `FX_INPUT` recipe that superseded it (`rounded-[8px]` vs `ui/input`'s `rounded-[6px]`). |
| 8 | `FxColumnManager.js` | 3 Styling | Hardcoded `shadow-[0_20px_60px_rgba(15,23,42,0.14)] dark:…` (= `FX_SHADOW.lg` exactly) replaced with the token recipe. |

Note: `FxTableArchitecture.md:121` still lists `FX_CONTROL` as a recipe — stale after removal #7; worth a one-line doc edit when you next touch that doc.

---

## Recommended next pass (deferred — touches rendering; verify visually)

Prioritized. These are real DRY/quality wins but I left them out of this pass because each changes multiple form/page files and you have no build-check loop here.

1. **`FxField` wrapper (DRY, High).** The label + required-asterisk + hint/message footer + `fieldId = id ?? props.name` block is repeated verbatim in `FxInput.js`, `FxTextarea.js`, `FxCreatableSelect.js`. Extract one `FxField` chrome wrapper; the three controls render their input as children. Single source for field framing.
2. **Adopt `FX_STATE` across forms (DRY/styling, High).** `FX_STATE` (label/message/field tones, focus ring, disabled) is defined but consumed by **no** form file — they hardcode `text-[13px] text-[var(--fx-danger)]` / `text-muted-foreground`. Also `aria-invalid` is set but `FX_STATE.field.error` border is never applied, so invalid inputs have no visible state. Route hint/message/error/label through `FX_STATE`. (Pairs naturally with #1.)
3. **Unify the option-row fields (DRY, Med).** `FxCheckboxField`/`FxSwitchField`/`FxRadioGroupField` repeat the same row shell (`flex … gap-3 border … px-4 py-3`) and label/description block, and lack the system `FX_RADIUS`. One shared row recipe. `FxRadioGroupField`'s label is exactly `FX_TYPOGRAPHY.eyebrow` — use the recipe.
4. **`FxTabs.js` (DRY, Med).** The `TabsList` + `tabs.map(...)` render is duplicated; only the full-width wrapping `<div>` differs. Render the list once, conditionally wrap. Also: promote the repeated `shadow-[0_1px_2px_rgba(15,23,42,0.06)]` to a token, drop `cn()` around single strings, standardize on `var(--fx-*)` over mixed shadcn aliases.
5. **`FxAiButton.js` (DRY, Med).** Re-implements most of `FX_BUTTON.base` + the size composition. Compose `FX_BUTTON.base` + a gradient override (consider an `FX_AI` recipe for the gradient/shadow) instead of re-inlining.
6. **`FxCreatableSelect.js` (responsibility, Med).** `storageKey` persistence couples a reusable Forms control to the app storage layer — borderline against "FxUI = reusable, no product logic." Consider keeping it pure (controlled/uncontrolled) and letting the consumer persist. Also reuse `FX_STATE.focusRing`; unify `rounded-[6px]`/`rounded-[8px]` via `FX_RADIUS`.
7. **`ds/page.js` (~900 lines) (styling/maintainability, Med).** Hoist the repeated eyebrow class (`text-[11px] … uppercase tracking-[0.16em] text-muted-foreground`, 20+ sites) to named consts (the file already does this with `specPanelTone`); replace hardcoded `shadow-[…]` with `FX_SHADOW.*`; collapse the triplicated radius/spacing mappings to one source; consider splitting the 4 section components into sibling files to match the per-component convention.

### Low priority / optional
- **`FX_LAYOUT` dedup** — redundant alias keys (`contentNarrow` == `contentWidthNarrow`, etc.) and hand-repeated `max-w-[1440px]`; collapse and source from `contentMax`. Left alone to avoid touching consumers blind.
- **`FxTableCells.js`** — `"use client"` taints the pure formatters (`formatCurrency`, etc.); a server caller importing one pulls client. Optionally move formatters to a non-client `FxFormat` util (the file comment anticipates this). Minor: local `NUMERIC`/`LINK_TONE` consts for the repeated `tabular-nums`/link-tone strings.
- **`FxSheet.js` / `FxDialog.js`** — `"use client"` isn't strictly required (pure composition wrappers, no hooks). In practice a no-op since only client parents consume them, so left as-is.
- **`FxButton.js`** — `hero` variant colors are identical to `primary` (only radius differs); collapse. Icon-only `xs` is `size-[30px]` vs text `xs` `h-[28px]` — likely unintended 2px drift.
- **`layout.js`** — `metadata` still says "Create Next App" / "Generated by create next app" boilerplate.

---

## Already good — no change

`FxAppShell` + header/sidebar/content/footer/right-panel (pure server scaffolds, geometry from tokens) · `FxBadge` (clean cva, token colors) · `FxStorage` (SSR-guarded, single root key, try/catch — exemplary) · `FxConstants` (tightly scoped) · `FxTableShowcase` (columns correctly memoized with stable refs) · `FxSheetShowcase` · `FxColorTokenCard` · all domain barrels. `FxInput` is clean apart from the shared-field dedup above.
