/* src/lib/FxConstants.js | Global immutable app constants | Sree | 2026-06-25 */

export const APP_NAME = "Evality AI";
export const APP_SHORT_NAME = "Evality";
export const APP_TAGLINE = "Calm, structured workspaces for operational teams.";

/* - - - - - - - - - - - - - - - - */

export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  designSystem: "/ds",
  login: "/login",
  signup: "/signup",
};

/* Desktop-first shell viewport strategy. The workspace shell owns the full app frame. */
export const APP_VIEWPORT_HEIGHT = "100dvh";

/* Fixed top header height used across shared and workspace application headers. */
export const APP_HEADER_HEIGHT = "56px";

/* Notification area behavior: a full-width top row that pushes the shell downward when rendered. */
export const APP_NOTIFICATION_HEIGHT = "44px";

/* Fixed bottom footer height for optional shell footers. */
export const APP_FOOTER_HEIGHT = "48px";

/* Default page content padding used by FxAppContent for internal page framing. */
export const APP_CONTENT_PADDING = {
  baseX: "24px",
  baseY: "24px",
  wideX: "32px",
  wideY: "32px",
};

/* Canonical shell column widths. FxAppShell owns how these are applied to the grid. */
export const SIDEBAR_WIDTHS = {
  expanded: "272px",
  collapsed: "88px",
  rightPanel: "320px",
};

/* Placeholder top-level workspace navigation items for shell scaffolding only. */
export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", href: ROUTES.dashboard },
  { key: "workbooks", label: "Workbooks", href: "/workbooks" },
  { key: "activity", label: "Activity", href: "/activity" },
  { key: "reports", label: "Reports", href: "/reports" },
  { key: "settings", label: "Settings", href: "/settings" },
];
/* - - - - - - - - - - - - - - - - */
