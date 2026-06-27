/* src/lib/FxConstants.js | App/product constants — names, routes, storage keys | Sree | 2026-06-27 */

/*
  This file owns APP/PRODUCT constants only: app names, route maps, storage keys, navigation ids, and product enums/lookups later.
  Visual + layout VALUES (shell geometry, sidebar widths, content padding, theme ids) live with the design system in `src/lib/FxTheme.js`; color values live in `src/app/globals.css`.
*/

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

// Browser storage: a SINGLE root key (FxID8r) holds one JSON object; each setting is a FIELD inside it, so the dev inspector shows just one expandable key. Values below are those field names — read/write them via getStored/setStored in src/lib/FxStorage.js (never raw localStorage).
export const FX_STORAGE_ROOT = "FxID8r";

export const STORAGE_KEYS = {
  theme: "Theme", // "light" | "dark"
  sidebarOpen: "Sidebar-Open", // "Y" | "N"
  role: "Role", // selected/created role from FxCreatableSelect (onboarding)
};
/* - - - - - - - - - - - - - - - - */