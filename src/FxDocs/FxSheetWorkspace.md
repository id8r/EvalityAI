# FxSheet — Workspace Container Specification

**Status:** ❄️ FROZEN — 2026-06-28. Implement Overlay-only v1 strictly against this. (Push mode, `FxWorkspaceDock`, `2xl`, and active custom-width usage are explicitly out of scope.)
**Date:** 2026-06-28
**Scope:** Evolve the existing `FxSheet` into the long-term workspace container. Do **not** fork a second component; `ui/sheet` (Radix Dialog) stays the low-level overlay primitive.

---

## 0. Principles (read first)

- **Composition over props.** Every root prop is public API forever — expose only what *multiple* screens genuinely need. Everything else is a slot.
- **Token-driven.** All tunables (widths, pane widths, paddings, heights, motion, z-index) live in **one config object `FX_SHEET`** (`src/lib/FxTheme.js`). Components read from it; styles get tweaked in one place.
- **Overlay is v1. Push is an extension point** — the API allows `presentation="push"`, but we build **no docking framework** (`FxWorkspaceDock`, shell context, etc.) until the first real Push screen exists.
- **Optimize for the screens we have**, not arbitrary layouts: Candidate · Job · Manual Screening · Email Screening · JD Match · Recommend Candidates · (future) Kanban.

---

## 1. Anatomy

```
┌─ FxSheet (root · flex column · presentation: overlay | push) ───────────────┐
│ Header     flex-none · NEVER scrolls                                         │
│   leading · Title · Description     | [app actions] [Layout][Expand][More] [✕]│
├──────────────────────────────────────────────────────────────────────────────┤
│ Toolbar    flex-none · OPTIONAL · sticky by structure                        │
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌ Panes  flex-1 · min-h-0 ────────────────────────────────────────────────┐ │
│ │  Secondary  │        Primary (flex-1)        │   Tertiary               │ │
│ │  own scroll │        own scroll              │   own scroll             │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────┤
│ Footer     flex-none · NEVER scrolls                                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

Regions: **Header** (always), **Toolbar** (optional), **Panes** (the only growing region), **Footer** (optional). The root is a `flex flex-col`; only Panes grows (`flex-1 min-h-0`).

---

## 2. Layouts

Layout is **derived from the Panes you compose**, not from a layout enum prop.

| Layout | Panes | Typical use |
|---|---|---|
| **Single** | `Primary` (or `FxSheet.Body` sugar) | Candidate quick-view, simple forms |
| **Two** | `Primary` + one of `Secondary`/`Tertiary` | JD Match, Email compose, screening form + context |
| **Three** | `Secondary` + `Primary` + `Tertiary` | Candidate workspace: list · resume · actions |
| **Custom** | one `Primary` pane with app-defined internals | future Kanban (pane owns its own horizontal scroll) |

**Pane roles** (semantic, never Left/Right — works for RTL and either `side`):

| Role | Intent | Default width | Grows? |
|---|---|---|---|
| `secondary` | supporting rail — list / nav | `FX_SHEET.paneWidth.secondary` = **240px** | no |
| `primary` | the subject — detail / resume / content | fills remaining | **yes** (`flex-1`) |
| `tertiary` | contextual actions / inspector | `FX_SHEET.paneWidth.tertiary` = **360px** | no |

A pane's `width` prop overrides the role default. **Visual order = declaration order.** We design for **1–3 panes + custom**; not unlimited.

---

## 3. API (compound)

```jsx
<FxSheet open={open} onOpenChange={setOpen} size="xl" expandable>
  <FxSheet.Header
    title="Ananya Sharma"
    description="Senior Backend Engineer · FinEdge"
    actions={<FxButton size="sm">Share</FxButton>}   // app actions (left of system cluster)
    more={<DropdownMenu …/>}                          // optional overflow menu content
  />

  <FxSheet.Toolbar sticky>{searchOrFilters}</FxSheet.Toolbar>   {/* optional */}

  <FxSheet.Panes>
    <FxSheet.Pane role="secondary" collapsible>{candidateList}</FxSheet.Pane>
    <FxSheet.Pane role="primary">{resumeView}</FxSheet.Pane>
    <FxSheet.Pane role="tertiary" collapsible>{actions · calendar · email}</FxSheet.Pane>
  </FxSheet.Panes>

  <FxSheet.Footer footerStart={<FxButton variant="ghost">Cancel</FxButton>}>
    <FxButton>Save</FxButton>
  </FxSheet.Footer>
</FxSheet>
```

**Single-pane / simple sheets** (backwards compatible) — `FxSheet.Body` is sugar for one `primary` pane:

```jsx
<FxSheet open={open} onOpenChange={setOpen} size="md">
  <FxSheet.Header title="Create job" />
  <FxSheet.Body>{form}</FxSheet.Body>
  <FxSheet.Footer><FxButton>Create</FxButton></FxSheet.Footer>
</FxSheet>
```

### Root props (kept deliberately small)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` / `onOpenChange` | bool / fn | — | control |
| `presentation` | `"overlay" \| "push"` | `"overlay"` | **`push` reserved** — accepted by the API, not implemented in v1 |
| `side` | `"right" \| "left"` | `"right"` | |
| `size` | `"sm"\|"md"\|"lg"\|"xl"\|"full"` | `"md"` | token-driven (see §4). A raw px number is a **reserved** escape hatch, not used in v1 |
| `expandable` | bool | `false` | shows the Expand/Restore header action; FxSheet manages expand state **internally** (toggles to `full`) |
| `dismissible` | bool | `true` | overlay: scrim-click / Esc closes. Set `false` for unsaved-work guards |
| `className` | string | — | |

Everything else is **composition** — no `layout`, `expanded`, `widthPx`, `headerActions`, `layouts` root props. Layout switching, expand, and overflow are derived/owned internally so the prop surface stays flat.

### Sub-components

| Component | Props | Role |
|---|---|---|
| `FxSheet.Header` | `title`, `description`, `leading`, `actions`, `more` | Title block + auto-rendered **system action cluster** |
| `FxSheet.Toolbar` | `sticky` (default true), `className` | Optional band under header |
| `FxSheet.Panes` | `className` | Multi-pane container; owns the scroll/grid rules |
| `FxSheet.Pane` | `role`, `width`, `collapsible`, `id`, `className` | One pane = one scroll container |
| `FxSheet.Body` | `className` | Sugar = a single `primary` pane |
| `FxSheet.Footer` | `footerStart`, children (right), `className` | Sticky footer, never scrolls |

---

## 4. Sizing

Keep the **existing tokens — they are sufficient.** No `2xl`, no `clamp()`, no `widthPx` in v1.

```
sm 512 · md 768 · lg 1024 · xl 1184 · full (100vw − 96px)
all capped at max-w-[calc(100vw − 2rem)]
```

- `full`'s 96px peek of the app is intentional (reads as a *place*, not a modal) — keep it.
- **Default `size` per layout** (token-driven, in `FX_SHEET.layoutSize`): Single → `md`, Two → `lg`, Three → `xl`, **Custom/Kanban → `full`**. `expandable` expands to `full`.
- **Pane widths are separate from sheet `size`** — pane defaults live in `FX_SHEET.paneWidth`; `primary` fills the rest.

---

## 5. Scrolling — **FROZEN RULES**

1. **Header never scrolls.**
2. **Toolbar** is optional and **sticky** (flex-none, sits above panes).
3. **Footer never scrolls.**
4. **Each pane owns exactly one scroll container** (`overflow-y-auto min-h-0`).
5. **No nested scrolling** — the root never scrolls; a pane's content never introduces a second vertical scroller.
6. Per-pane **sticky sub-headers** are allowed (`position: sticky` *inside* that pane's own scroll region).
7. Enforced structurally with `min-h-0` on every flex child (never `max-height`).

---

## 6. Motion — subtle, fast, productive

**Wired through `FX_SHEET.motion` tokens, not hardcoded transition classes.** (Today `ui/sheet.js` hardcodes `duration-200 ease-in-out` and ignores the existing tokens — fix that as part of this work.)

| Phase | Duration | Easing | Property |
|---|---|---|---|
| Panel **enter** | **200ms** | `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out) | `transform: translateX(100% → 0)` |
| Panel **exit** | **150ms** | `cubic-bezier(0.4, 0, 1, 1)` (ease-in) | `transform` |
| Scrim | enter 150ms / exit 120ms | ease-out / linear | `opacity` |
| Pane collapse | 160ms | ease-out | `flex-basis` |
| Push reflow *(future)* | 200ms | ease-out | `flex-basis` |

- Slide the **full panel width via `transform`** (GPU) — never animate `width`/`left`/`right`. Short "nudge" distances read as a popover, not a drawer.
- `prefers-reduced-motion` → **opacity only**, no translate.
- Update the existing `FX_SHEET.motion` open duration **280 → 200** for the snappier, enterprise feel.

---

## 7. Header action area — **STANDARD**

Fixed order, right-aligned. The system cluster is rendered by `FxSheet.Header` itself so it's identical on every sheet in the product:

```
[ …app actions (Header.actions)… ]   │   [Layout ▦] [Expand ⤢] [More ⋯]   [Close ✕]
```

| Action | Status | Behavior |
|---|---|---|
| **Close (✕)** | **Mandatory** | Always rightmost. Overlay also closes via Esc / scrim (unless `dismissible={false}`) |
| **Expand / Restore** | **Likely** | Shown when root `expandable`. Toggles `size ↔ full` |
| **Layout switch** | **Conditional** | Shown **only when >1 pane exists**. A small **Columns** menu toggling pane *visibility* (e.g. hide Tertiary) — not a rigid single/split/triple enum |
| **More (⋯)** | **Optional** | App-supplied via `Header.more`. Keeps bespoke actions out of the title row |

Header height stays `h-16` (64px).

---

## 8. Screen fit-check (today's product)

| Screen | Presentation | Layout |
|---|---|---|
| Candidate (quick view) | overlay | Single or Two (detail + actions) |
| Job (detail/workspace) | overlay (push later) | Two / Three |
| Manual Screening | overlay | Two (context + form) |
| Email Screening | overlay | Two/Three (list · thread · compose) |
| JD Match | overlay | Two (JD · match breakdown) |
| Recommend Candidates | overlay | Two/Three (list · profile · actions) |
| **Candidate workspace** (stress test) | overlay | **Three**: list (`secondary`) · resume (`primary`) · actions (`tertiary`) |
| Future Kanban | overlay/push | Custom (single pane, horizontal board) |

If these feel natural in the API above, the API is correct.

---

## 9. Extension points (additive — won't break the API)

Reserved now, built later without touching call sites:
- **`presentation="push"`** — accepted today; docking infra (shell dock region + reflow) built only when the first Push screen lands.
- **Pane props reserved:** `resizable`, `defaultCollapsed`, `minWidth`/`maxWidth`, `pinned`. Ship `role`/`width`/`collapsible` now.
- **Layout persistence:** an optional `onLayoutChange` callback (app persists pane visibility/widths in `EvUIData`, like table prefs). Deferred.
- **Controlled expand** (`expanded`/`onExpandedChange`) — add if a screen needs it; internal state covers v1.
- **`size` as px** — reserved escape hatch.

---

## 10. Implementation notes (for when we build)

- **Single config object `FX_SHEET`** in `src/lib/FxTheme.js` is the source of truth. Shape:
  ```
  FX_SHEET = {
    width:      { sm, md, lg, xl, full },          // existing
    paneWidth:  { secondary: 240, tertiary: 360 },  // primary = flex-1
    layoutSize: { single: "md", two: "lg", three: "xl", custom: "full" },
    header:     { height: "h-16", padding },
    toolbar:    { padding },
    body:       { padding },
    footer:     { padding },
    z:          { overlay, panel },
    motion: {
      enter: { ms: 200, ease: "cubic-bezier(0.16,1,0.3,1)", class: "data-[state=open]:…" },
      exit:  { ms: 150, ease: "cubic-bezier(0.4,0,1,1)",   class: "data-[state=closed]:…" },
      scrim: { enterClass, exitClass },
      paneCollapseMs: 160,
    },
  }
  ```
- `ui/sheet` consumes `FX_SHEET.motion` (stop hardcoding). `FxSheet` is the branded compound layer over it. Overlay only in v1.
- Keep logic DRY: pane layout/scroll is one shared structure; roles only change width/styling, not mechanics.

---

## 11. Explicitly avoid

- ❌ A second component / forking the Sheet.
- ❌ Building Push docking infrastructure before a real Push screen.
- ❌ Adding `2xl`, `clamp()`, or `widthPx` before a product screen proves the need.
- ❌ Framework-syndrome root props (`layout`, `expanded`, `headerActions`, …) — compose instead.
- ❌ Multiple / nested scroll containers; scrolling the root.
- ❌ Animating `width`/`left`/`right`; long slides; tiny "nudge" distances.
- ❌ Left/Right semantics — Primary/Secondary/Tertiary only.
- ❌ Hardcoded transition classes — motion comes from `FX_SHEET.motion`.
- ❌ Designing for unlimited panes; Ev/product concepts inside FxSheet.
- ❌ Ignoring `prefers-reduced-motion`.

---

**Freeze checklist:** anatomy ✓ · layouts ✓ · API ✓ · sizing ✓ · scrolling ✓ · motion ✓ · header actions ✓ · extension points ✓. On approval, implement Overlay-only v1 against this spec.
