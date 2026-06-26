/* src/lib/FxConstants.js | Global immutable app constants | Sree | 2026-06-25 */

export const APP_NAME = "Evality AI";
export const APP_SHORT_NAME = "Evality";
export const APP_TAGLINE = "Calm, structured workspaces for operational teams.";
/* - - - - - - - - - - - - - - - - */

export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  designSystem: "/ds",
  welcome: "/welcome",
  login: "/login",
  signup: "/signup",
  career: "/career",
};

// Browser storage keys reserved for future client leaf behavior.
export const STORAGE_KEYS = {
  sidebarCollapsed: "evality.sidebar-collapsed",
};

// Desktop-first shell viewport; the workspace shell owns the full app frame.
export const APP_VIEWPORT_HEIGHT = "100dvh";

// Fixed top header height for shared and workspace headers.
export const APP_HEADER_HEIGHT = "56px";

// Taller header used on public / marketing pages.
export const APP_PUBLIC_HEADER_HEIGHT = "64px";

// Full-width notification row height (pushes the shell down when rendered).
export const APP_NOTIFICATION_HEIGHT = "44px";

// Optional bottom footer height.
export const APP_FOOTER_HEIGHT = "48px";

// Default page padding used by FxAppContent.
export const APP_CONTENT_PADDING = {
  baseX: "24px",
  baseY: "24px",
  wideX: "32px",
  wideY: "32px",
};

// Canonical shell column widths. FxAppSidebar owns its animated width; the shell column follows.
export const SIDEBAR_WIDTHS = {
  expanded: "200px",
  collapsed: "72px",
  rightPanel: "320px",
};
/* - - - - - - - - - - - - - - - - */
