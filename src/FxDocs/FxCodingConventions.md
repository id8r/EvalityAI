# Fx Coding Conventions

## Naming

* Prefix reusable shared components with `Fx`.

  * `FxButton`, `FxSheet`, `FxTable`, `FxAppShell`
* Prefix exported theme/token groups with `FX_`.

  * `FX_COLORS`, `FX_TYPOGRAPHY`, `FX_LAYOUT`
* Use `@/` imports instead of deep relative paths.

---

## Project Structure

* `src/components/ui` → Low-level shadcn/Radix primitives.
* `src/components/FxUI` → Fx design-system components built on `ui`.
* `src/lib` → Constants, theme, utilities, helpers.
* `src/FxDocs` → Design system and architecture documentation.

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

Do not overuse it.

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
* Reuse existing spacing, typography, radius and layout tokens.

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

## General Rule

When in doubt, build the reusable solution first, then compose product-specific behavior from it.