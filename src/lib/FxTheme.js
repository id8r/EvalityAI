/* src/lib/FxTheme.js | Reusable Tailwind class-recipe layer for the Fx design system | Sree | 2026-06-26 */

/*
  Semantic recipe layer: named Tailwind class-string groups (+ a few raw layout values) so
  components compose tokens instead of inlining arbitrary values.

  Source of truth:
  - Colors → globals.css (`--fx-*`); recipes here only reference tokens, never hardcode hex.
  - Shell geometry + theme ids → this file (FX_THEMES / FX_SHELL below) — visual/layout values.
  - App/product constants (names, routes, storage keys) → FxConstants.js.

  Dual-theme by construction: token-driven recipes resolve in light/dark automatically; only
  elevation/overlay need explicit `dark:` overrides.
*/

/* - - - - - - - - - - - - - - - - */

/* FX_THEMES | Theme identifiers. The active theme drives the `.dark` class on <html>; the
   color VALUES per theme live in globals.css. */
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};
/* - - - - - - - - - - - - - - - - */

/* FX_SHELL | Raw shell geometry (inline-style values) for the AppShell pieces. */
export const APP_VIEWPORT_HEIGHT = "100dvh"; // full app frame
export const APP_HEADER_HEIGHT = "56px"; // workspace header
export const APP_PUBLIC_HEADER_HEIGHT = "64px"; // public / marketing header
export const APP_NOTIFICATION_HEIGHT = "44px"; // notification row
export const APP_FOOTER_HEIGHT = "48px"; // footer
export const APP_CONTENT_PADDING = { baseX: "24px", baseY: "24px", wideX: "32px", wideY: "32px" };
export const SIDEBAR_WIDTHS = { expanded: "200px", collapsed: "72px", rightPanel: "320px" };
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

/* FX_SPACE | 8px spacing vocabulary as raw values, composed into gap-[…] / p-[…] / inline style. */
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

/* FX_SHADOW | Elevation, soft + minimal. Each level carries a `dark:` override (shadows read weak on dark surfaces). */
export const FX_SHADOW = {
  none: "shadow-none",
  sm: "shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.32)]",
  md: "shadow-[0_4px_12px_rgba(15,23,42,0.08)] dark:shadow-[0_6px_16px_rgba(0,0,0,0.40)]",
  lg: "shadow-[0_20px_60px_rgba(15,23,42,0.14)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.50)]",
};
/* - - - - - - - - - - - - - - - - */

/* FX_SURFACE | Background/surface compositions. Token-driven, so dual-theme by default. `overlay` is the modal/sheet backdrop and carries a dark variant for adequate dimming. */
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

/* FX_LAYOUT | Page width frames + content padding (utility-class form). Mirrors APP_CONTENT_PADDING above. */
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

/* FX_INPUT | Text-field sizing + variants, composed over the `ui/input` base by `FxInput`. */
export const FX_INPUT = {
  size: {
    sm: "h-[34px] px-3 text-[15px]",
    md: "h-[40px] px-4 text-[15px]",
    lg: "h-[44px] px-4 text-[15px]",
  },
  variant: {
    outline: "", // the ui/input base already provides the boxed outline look
    underline:
      "rounded-none border-0 border-b border-[var(--fx-border)] bg-transparent px-0 shadow-none focus-visible:border-[var(--fx-primary)]",
  },
};
/* - - - - - - - - - - - - - - - - */

/* FX_BUTTON | Structural button recipes (height/padding/base). Color variants live in the FxButton cva; this is for non-cva call sites (links, triggers). */
export const FX_BUTTON = {
  radius: "rounded-[8px]",
  radiusBySize: {
    xs: "rounded-[4px]",
    sm: "rounded-[6px]",
    md: "rounded-[8px]",
    lg: "rounded-[8px]",
    xl: "rounded-[10px]",
  },
  gap: "gap-[8px]",
  transition: "transition-colors duration-[120ms] ease-out",
  height: {
    xs: "h-[28px]",
    sm: "h-[34px]",
    md: "h-[40px]",
    lg: "h-[44px]",
    xl: "h-[48px]",
  },
  paddingX: {
    xs: "px-[8px]",
    sm: "px-[8px]",
    md: "px-[16px]",
    lg: "px-[20px]",
    xl: "px-[24px]",
  },
  base:
    "inline-flex cursor-pointer items-center justify-center whitespace-nowrap border border-transparent text-[14px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fx-ring)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
};
/* - - - - - - - - - - - - - - - - */

/* FX_BADGE | Structural badge recipe (shell + size). Tone×variant colors live in the FxBadge cva. Pill by default; `border` always present so `outline` shows it. */
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

/* FX_NAVIGATION | Sidebar / nav item recipes (active = selected surface + primary text). Label
   typography + collapse animation stay on the item's own label span. */
export const FX_NAVIGATION = {
  itemBase:
    "group relative flex h-11 w-full items-center gap-[12px] overflow-hidden rounded-[8px] px-[12px] text-left transition-colors duration-100",
  itemActive: "bg-[var(--fx-surface-selected)] text-[var(--fx-primary)]",
  itemInactive: "text-[var(--fx-text)] hover:bg-[var(--fx-surface-hover)]",
  iconSlot: "flex size-6 shrink-0 items-center justify-center",
};
/* - - - - - - - - - - - - - - - - */

/* FX_TABLE | Dense-table recipes. Zebra rows use the table-header / table-row-alt tokens. */
export const FX_TABLE = {
  container: "w-full overflow-hidden rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface)]",
  headerCell:
    "h-12 border-b border-[var(--fx-border)] bg-[var(--fx-table-header)] px-4 text-left align-middle text-[13px] font-medium leading-[18px] text-[var(--fx-text-muted)]",
  bodyCell: "border-b border-[var(--fx-border-light)] px-4 py-2 align-middle text-[14px] leading-[22px] text-[var(--fx-text)]",
  row: "bg-[var(--fx-surface)] even:bg-[var(--fx-table-row-alt)] hover:bg-[var(--fx-surface-hover)]",
  empty: "px-4 py-4 text-[14px] leading-[22px] text-[var(--fx-text-muted)]",
};
/* - - - - - - - - - - - - - - - - */

/* FX_SHEET | Workspace-container recipes — the single source of truth for FxSheet (spec: src/FxDocs/FxSheetWorkspace.md).
   Overlay-only v1. Tweak widths / pane widths / paddings / motion here; the components only read from this. */
export const FX_SHEET = {
  // Sheet envelope widths (the `size` prop). `full` keeps a 96px peek of the app behind it.
  width: {
    sm: "w-[512px] max-w-[calc(100vw-2rem)]",
    md: "w-[768px] max-w-[calc(100vw-2rem)]",
    lg: "w-[1024px] max-w-[calc(100vw-2rem)]",
    xl: "w-[1184px] max-w-[calc(100vw-2rem)]",
    full: "w-[calc(100vw-96px)] max-w-none",
  },
  // Default per-pane widths by role (px). `primary` fills the rest (flex-1).
  paneWidth: { secondary: 240, tertiary: 360 },
  // Suggested default `size` per layout — reference for callers; FxSheet does not auto-apply it.
  layoutSize: { single: "md", two: "lg", three: "xl", custom: "full" },
  // Region paddings.
  header: { padding: "px-6 py-5" },
  toolbar: { padding: "px-6 py-3" },
  footer: { padding: "px-6 py-4" },
  pane: {
    padding: { primary: "px-6 py-5", secondary: "px-4 py-4", tertiary: "px-5 py-5" },
    divider: "border-border",
  },
  title: FX_TYPOGRAPHY.cardTitle,
  subtitle: FX_TYPOGRAPHY.meta,
  // Motion — transform-only, snappy/productive (enter 200 · exit 150). Applied as data-state Tailwind utilities.
  motion: {
    openDurationMs: 200,
    closeDurationMs: 150,
    openEase: "cubic-bezier(0.16, 1, 0.3, 1)",
    closeEase: "cubic-bezier(0.4, 0, 1, 1)",
    // Panel (SheetContent): per-phase duration + easing; reduced-motion zeroes the timing.
    panel:
      "data-[state=open]:duration-[200ms] data-[state=open]:ease-[cubic-bezier(0.16,1,0.3,1)] " +
      "data-[state=closed]:duration-[150ms] data-[state=closed]:ease-[cubic-bezier(0.4,0,1,1)] " +
      "motion-reduce:!duration-0",
    // Scrim (SheetOverlay): opacity fade only.
    overlay:
      "data-[state=open]:duration-[150ms] data-[state=closed]:duration-[120ms] " +
      "data-[state=open]:ease-out data-[state=closed]:ease-out motion-reduce:!duration-0",
  },
};
/* - - - - - - - - - - - - - - - - */

/* FX_STATE | Field validation/interaction recipes — frame/label/message tones per state + focus ring + disabled. */
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

/* FX_TOOLBAR | FxPageToolbar layout recipes — stacked rows with start/end zones. Layout ONLY:
   spacing, sticky, responsive wrap, and the contextual bulk-row tint. No widget styling here. */
export const FX_TOOLBAR = {
  stack: "flex w-full flex-col",
  // Row is a wrapping flex line: start zone grows, end zone hugs right and wraps under on narrow widths.
  row: "flex flex-wrap items-center gap-x-4 gap-y-2 transition-colors duration-[160ms] ease-out",
  density: {
    default: "min-h-[56px] py-2",
    compact: "min-h-[48px] py-1.5",
  },
  zoneStart: "flex min-w-0 flex-1 flex-wrap items-center gap-[8px]",
  zoneEnd: "flex flex-wrap items-center justify-end gap-[8px]",
  // Sticks to the top of the scroll area (the app header is fixed outside it).
  sticky: "sticky top-0 z-30 bg-[var(--fx-bg)]",
  divider: "border-b border-[var(--fx-border)]",
  // Selected-row tint that eases in (via `row`'s transition) when the bulk strip is shown.
  bulk: "bg-[var(--fx-surface-selected)]",
};
/* - - - - - - - - - - - - - - - - */
