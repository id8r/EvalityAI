# Fx Coding Conventions

## Naming

* Prefix reusable shared components with `Fx`.

  * `FxButton`, `FxSheet`, `FxTable`, `FxAppShell`
* Prefix exported theme/recipe groups with `FX_`.

  * `FX_TYPOGRAPHY`, `FX_SURFACE`, `FX_LAYOUT`, `FX_STATE` (class-recipe groups in `src/lib/FxTheme.js`)
* Use plain exported constants for global app constants.

  * `APP_NAME`, `ROUTES`, `SIDEBAR_WIDTHS`, `NAV_ITEMS`
* Use `@/` imports instead of deep relative paths.

---

## Project Structure

* `src/components/ui` → Low-level shadcn/Radix primitives.
* `src/components/FxUI` → Fx design-system components organized by reusable domains.
* `src/components/FxUI/AppShell` → authenticated workspace shell primitives and shared app-frame regions.
* `src/components/FxUI/Forms` → branded form controls and field wrappers.
* `src/components/FxUI/Navigation` → reusable navigation patterns such as tabs and breadcrumbs.
* `src/components/FxUI/DataDisplay` → reusable data and status display components.
* `src/components/FxUI/Layout` → reusable layout and surface composition components.
* `src/lib` → Constants, theme, utilities, helpers.
* `src/FxDocs` → Design system and architecture documentation.

Use domain `index.js` barrels for imports where possible.

Example:

```js
import { FxAppShell, FxAppHeader } from "@/components/FxUI/AppShell";
import { FxButton, FxInput } from "@/components/FxUI/Forms";
```

---

## File Header

Every source file starts with:

```js
/* src/path/File.js | Short purpose | Sree | YYYY-MM-DD */
```

---

## Section Divider

Use the standard divider between major logical sections.

```js
/* - - - - - - - - - - - - - - - - */
```

Placement rules:

* Place it after the full import block, not between imports.
* Place it immediately after a function block ends when separating the next major section.
* Do not leave an extra blank line before the divider.
* End source files with the divider.
* Do not overuse it inside short files.

---

## JavaScript

* JavaScript / JSX only.
* Prefer named `function` declarations.
* Keep helpers above the exported component.
* Prefer early returns.
* Keep components focused and reusable.

---

## React

* Server Components by default.
* Add `"use client"` only where interactivity is required.
* Keep client-only logic in small leaf components.

---

## JSX

* Add section comments only for large layout regions.

Example:

```jsx
{/* PAGE HEADER */}

{/* FILTER BAR */}

{/* TABLE */}
```

Avoid commenting every `<div>`.

---

## Styling

* Use Fx theme tokens.
* Never hardcode colors.
* Prefer `cn()` for conditional classes.
* Reuse existing spacing, typography, radius and layout recipes.
* Consume reusable class recipes from `src/lib/FxTheme.js` (`FX_TYPOGRAPHY`, `FX_SURFACE`, `FX_RADIUS`, etc.) instead of re-inlining arbitrary values.
* Keep immovable global dimensions and route maps in `src/lib/FxConstants.js`; `FxTheme.js` owns class recipes, `globals.css` owns color values.

---

## Component Design

* `ui` = generic primitives.
* `FxUI` = branded reusable components.
* `app` = product composition.

Do not place product-specific logic inside `FxUI`.

---

## Editing

* Follow the existing file structure before introducing abstractions.
* Keep naming, formatting and comment style consistent.
* Extend the design system instead of creating one-off patterns.
* Prefer reuse over duplication.
* Import app-wide constants from `@/lib/FxConstants`.

## General Rule

When in doubt, build the reusable solution first, then compose product-specific behavior from it.
