/* src/lib/FxTheme.js | Reusable Tailwind class-recipe layer for the Fx design system | Sree | 2026-06-26 */

/*
  WHAT THIS FILE IS
  -----------------
  A semantic recipe layer: named groups of Tailwind class strings that components
  consume instead of re-inlining arbitrary values. It is the realization of the
  FX_TYPOGRAPHY / FX_LAYOUT token groups promised in FxCodingConventions.md.

  SOURCE OF TRUTH
  ---------------
  - Color VALUES live only in `src/app/globals.css` as `--fx-*` custom properties.
    Recipes here reference those tokens (e.g. `bg-[var(--fx-surface)]`) and never
    hardcode hex. globals.css is canonical; this file is class recipes only.
  - Raw shell DIMENSIONS used in inline styles (header height, sidebar widths,
    content padding) live in `src/lib/FxConstants.js`. This file owns class recipes;
    FxConstants owns immovable pixel dimensions. Where both express the same spacing
    (e.g. content padding 24/32), they are intentionally parallel — one for inline
    style, one for utility classes.

  DUAL-THEME MODEL (read before adding "dark" variants)
  -----------------------------------------------------
  These recipes are theme-agnostic BY CONSTRUCTION. Because color recipes reference
  semantic `--fx-*` tokens, and globals.css already redefines those tokens under the
  `.dark` selector, a single recipe resolves to the correct color in BOTH light and
  dark automatically. There is deliberately NO duplicate `FX_*_LIGHT` / `FX_*_DARK`
  object — that would re-duplicate values and contradict the single-source rule.

  The only recipes that need explicit per-theme treatment are ones whose correctness
  is NOT captured by a token swap — elevation and overlays read too weak in dark mode.
  Those carry inline `dark:` utilities (globals.css registers the `dark` variant), so
  the SAME recipe still works regardless of the active theme.
*/

/* - - - - - - - - - - - - - - - - */

/* FX_TYPOGRAPHY | Type roles from the design-system scale. Size + weight + line-height only — never color. */
export const FX_TYPOGRAPHY = {
  hero: "text-[36px] font-semibold leading-[44px] tracking-[-0.02em]",
  pageTitle: "text-[28px] font-semibold leading-[34px] tracking-[-0.01em]",
  sectionTitle: "text-[20px] font-semibold leading-[28px]",
  cardTitle: "text-[16px] font-semibold leading-[24px]",
  body: "text-[14px] font-normal leading-[22px]",
  clickable: "text-[14px] font-medium leading-[22px]",
  meta: "text-[13px] font-normal leading-[20px]",
  label: "text-[12px] font-medium leading-[16px]",
  eyebrow: "text-[12px] font-medium uppercase leading-[16px] tracking-[0.12em]",
};
/* - - - - - - - - - - - - - - - - */

/* FX_SPACE | The 8px spacing vocabulary. Raw values so components compose them into
   `gap-[…]` / `p-[…]` / inline style. Not exploded into every utility permutation. */
export const FX_SPACE = {
  xs: "8px",
  sm: "16px",
  md: "24px",
  lg: "32px",
  xl: "48px",
  "2xl": "64px",
  "3xl": "96px",
};
/* - - - - - - - - - - - - - - - - */

/* FX_RADIUS | Corner radii. Moderate by design language; pill for fully rounded. */
export const FX_RADIUS = {
  xs: "rounded-[4px]",
  sm: "rounded-[6px]",
  md: "rounded-[8px]",
  lg: "rounded-[12px]",
  pill: "rounded-full",
};
/* - - - - - - - - - - - - - - - - */

/* FX_SHADOW | Elevation. Soft and minimal; borders do most structural work.
   Theme-aware: each level carries a `dark:` override because shadows read too
   weak against dark surfaces when only the token swaps. */
export const FX_SHADOW = {
  none: "shadow-none",
  sm: "shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.32)]",
  md: "shadow-[0_4px_12px_rgba(15,23,42,0.08)] dark:shadow-[0_6px_16px_rgba(0,0,0,0.40)]",
  lg: "shadow-[0_20px_60px_rgba(15,23,42,0.14)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.50)]",
};
/* - - - - - - - - - - - - - - - - */

/* FX_SURFACE | Background/surface compositions. Token-driven, so dual-theme by default.
   `overlay` is the modal/sheet backdrop and carries a dark variant for adequate dimming. */
export const FX_SURFACE = {
  page: "bg-[var(--fx-bg)] text-[var(--fx-text)]",
  canvas: "bg-[var(--fx-bg-soft)]",
  surface: "bg-[var(--fx-surface)]",
  card: "border border-[var(--fx-border)] bg-[var(--fx-surface)] text-[var(--fx-text)]",
  subtle: "bg-[var(--fx-surface-subtle)]",
  raised: "bg-[var(--fx-surface-raised)]",
  muted: "bg-[var(--fx-surface-muted)]",
  hover: "bg-[var(--fx-surface-hover)]",
  selected: "bg-[var(--fx-surface-selected)]",
  overlay:
    "bg-[color:color-mix(in_srgb,var(--fx-shadow-core)_8%,transparent)] backdrop-blur-[2px] dark:bg-[color:color-mix(in_srgb,black_44%,transparent)]",
};
/* - - - - - - - - - - - - - - - - */

/* FX_BORDER | Border recipes across the three weights, plus a horizontal divider. */
export const FX_BORDER = {
  light: "border-[var(--fx-border-light)]",
  base: "border-[var(--fx-border)]",
  strong: "border-[var(--fx-border-strong)]",
  divider: "border-b border-[var(--fx-border-light)]",
};
/* - - - - - - - - - - - - - - - - */

/* FX_LAYOUT | Page width framing and content padding (utility-class form).
   Mirrors APP_CONTENT_PADDING from FxConstants (24/32) for class-based consumers. */
export const FX_LAYOUT = {
  // Content width frames (carried from the older app's curated set).
  contentNarrow: "max-w-[800px]",
  contentMedium: "max-w-[1200px]",
  contentWidthNarrow: "max-w-[800px]",
  contentWidthMedium: "max-w-[1200px]",
  contentWidthWide: "w-full min-w-0",
  landingContentWidth: "mx-auto w-full max-w-[1200px]",
  landingChrome: "mx-auto w-full max-w-[1440px] px-[40px]",
  landingPageFrame: "mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-[40px]",
  contentMax: "max-w-[1440px]",
  contentFluid: "w-full min-w-0",
  headerShell: "fixed top-0 left-0 z-40 w-full",
  pageFrame: "mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-6 md:px-8",
  headerRow: "flex h-[64px] items-center justify-between",
  landingMain: "flex flex-col pb-[96px]",
  dialogWidth: "max-w-[480px]",
  pagePaddingX: "px-6 md:px-8",
  pagePaddingY: "py-6 md:py-8",
  siteContainer: "mx-auto w-full max-w-[1440px] px-6 md:px-8",
};
/* - - - - - - - - - - - - - - - - */

/* FX_CONTROL | Form-control sizing and the shared field frame.
   Heights: sm 36 / md 40 / lg 44 (md is the default input/select height). */
export const FX_CONTROL = {
  height: {
    sm: "h-9",
    md: "h-10",
    lg: "h-11",
  },
  field:
    "h-10 w-full rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-4 text-[14px] leading-[22px] text-[var(--fx-text)] outline-none placeholder:text-[var(--fx-text-disabled)] focus:border-[var(--fx-primary)] focus:ring-2 focus:ring-[var(--fx-ring)]",
};
/* - - - - - - - - - - - - - - - - */

/* FX_BUTTON | Structural button recipes (height, padding, base shell). Color VARIANTS
   live in the cva in components/FxUI/Forms/FxButton.js — this group is for non-cva
   call sites that need button-shaped elements (links, Radix triggers). */
export const FX_BUTTON = {
  radius: "rounded-[10px]",
  radiusBySize: {
    xs: "rounded-[6px]",
    sm: "rounded-[6px]",
    md: "rounded-[8px]",
    lg: "rounded-[10px]",
    xl: "rounded-[10px]",
  },
  gap: "gap-[8px]",
  transition: "transition-colors duration-150 ease-out",
  height: {
    xs: "h-[30px]",
    sm: "h-[34px]",
    md: "h-[40px]",
    lg: "h-[44px]",
    xl: "h-[48px]",
  },
  paddingX: {
    xs: "px-[10px]",
    sm: "px-[12px]",
    md: "px-[16px]",
    lg: "px-[20px]",
    xl: "px-[20px]",
  },
  base:
    "inline-flex cursor-pointer items-center justify-center whitespace-nowrap border border-transparent text-[14px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fx-ring)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
};
/* - - - - - - - - - - - - - - - - */

/* FX_BADGE | Structural badge recipe (shell + size). The tone × variant COLOR matrix
   (soft / outline / solid across the 7 tones) lives in the cva in
   components/FxUI/DataDisplay/FxBadge.js — this group is shell + sizing only.
   Pill shape by default; `border` is always present so the `outline` variant shows it
   while `soft`/`solid` set it transparent. */
export const FX_BADGE = {
  base:
    "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full border font-medium leading-none",
  size: {
    xs: "h-[18px] px-[6px] text-[11px]",
    sm: "h-[22px] px-[8px] text-[12px]",
    md: "h-[26px] px-[10px] text-[13px]",
  },
};
/* - - - - - - - - - - - - - - - - */

/* FX_NAVIGATION | Sidebar / nav item recipes. Active state uses the selected surface
   + primary text; consumed by the workspace sidebar when nav rendering lands. */
export const FX_NAVIGATION = {
  itemBase:
    "group relative flex h-11 items-center gap-3 rounded-[8px] px-3 text-[14px] font-medium leading-5 transition-colors",
  itemActive: "bg-[var(--fx-surface-selected)] text-[var(--fx-primary)]",
  itemInactive: "text-[var(--fx-text)] hover:bg-[var(--fx-surface-hover)]",
  iconSlot: "flex w-6 shrink-0 items-center justify-center",
};
/* - - - - - - - - - - - - - - - - */

/* FX_TABLE | Dense-table recipes. Zebra rows use the table-header / table-row-alt tokens. */
export const FX_TABLE = {
  container: "w-full overflow-hidden rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface)]",
  headerCell:
    "h-12 border-b border-[var(--fx-border)] bg-[var(--fx-table-header)] px-4 text-left align-middle text-[12px] font-medium leading-[16px] text-[var(--fx-text-muted)]",
  bodyCell: "border-b border-[var(--fx-border-light)] px-4 py-2 align-middle text-[14px] leading-[22px] text-[var(--fx-text)]",
  row: "bg-[var(--fx-surface)] even:bg-[var(--fx-table-row-alt)] hover:bg-[var(--fx-surface-hover)]",
  empty: "px-4 py-4 text-[14px] leading-[22px] text-[var(--fx-text-muted)]",
};
/* - - - - - - - - - - - - - - - - */

/* FX_SHEET | Side-sheet recipes. Widths from the design-system sheet scale
   (Sm 512 / Md 768 / Lg 1024 / Xl 1184). Motion tokens are theme-agnostic. */
export const FX_SHEET = {
  width: {
    sm: "w-[512px] max-w-[calc(100vw-2rem)]",
    md: "w-[768px] max-w-[calc(100vw-2rem)]",
    lg: "w-[1024px] max-w-[calc(100vw-2rem)]",
    xl: "w-[1184px] max-w-[calc(100vw-2rem)]",
    full: "w-[calc(100vw-96px)] max-w-none",
  },
  headerHeight: "h-16",
  footerHeight: "h-14",
  bodyPadding: "px-6 py-6",
  title: FX_TYPOGRAPHY.cardTitle,
  subtitle: FX_TYPOGRAPHY.meta,
  motion: {
    openDurationMs: 280,
    closeDurationMs: 220,
    openEase: "cubic-bezier(0.16, 1, 0.3, 1)",
    closeEase: "cubic-bezier(0.4, 0, 1, 1)",
    contentOpen:
      "data-[state=open]:duration-[280ms] data-[state=open]:ease-[cubic-bezier(0.16,1,0.3,1)]",
    contentClose:
      "data-[state=closed]:duration-[220ms] data-[state=closed]:ease-[cubic-bezier(0.4,0,1,1)]",
    overlayOpen: "data-[state=open]:duration-[220ms] data-[state=open]:ease-out",
    overlayClose: "data-[state=closed]:duration-[220ms] data-[state=closed]:ease-out",
  },
};
/* - - - - - - - - - - - - - - - - */

/* FX_STATE | Field validation + interaction state recipes. Frame/label/message tones
   per state, plus shared focus ring and disabled treatment. Token-driven (dual-theme). */
export const FX_STATE = {
  focusRing: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fx-ring)]",
  disabledControl:
    "disabled:cursor-not-allowed disabled:border-[var(--fx-disabled-border)] disabled:bg-[var(--fx-disabled-bg)] disabled:text-[var(--fx-disabled-text)] disabled:opacity-100",
  field: {
    default: "border-[var(--fx-border)] focus:border-[var(--fx-primary)] focus:ring-[var(--fx-ring)]",
    error: "border-[var(--fx-danger)] focus:border-[var(--fx-danger)] focus:ring-[color:color-mix(in_srgb,var(--fx-danger)_24%,transparent)]",
    warning: "border-[var(--fx-warning)] focus:border-[var(--fx-warning)] focus:ring-[color:color-mix(in_srgb,var(--fx-warning)_24%,transparent)]",
    success: "border-[var(--fx-success)] focus:border-[var(--fx-success)] focus:ring-[color:color-mix(in_srgb,var(--fx-success)_24%,transparent)]",
  },
  label: {
    default: "text-[var(--fx-text-muted)]",
    error: "text-[var(--fx-danger)]",
    warning: "text-[var(--fx-warning)]",
    success: "text-[var(--fx-success)]",
  },
  message: {
    default: "text-[var(--fx-text-muted)]",
    error: "text-[var(--fx-danger)]",
    warning: "text-[var(--fx-warning)]",
    success: "text-[var(--fx-success)]",
  },
};
/* - - - - - - - - - - - - - - - - */
