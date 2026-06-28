/* src/lib/EvSession.js | Demo auth/session — its own LS root (EvSession), kept OUT of FxID8r (UI-only) | Sree | 2026-06-28 */

const SESSION_ROOT = "EvSession";
/* - - - - - - - - - - - - - - - - */

/*
  Demo-only session (no real auth). Its OWN top-level localStorage key "EvSession" — kept out of FxID8r,
  which holds UI/design-system state only. signOut only flips `authed` to false — it KEEPS the mock account
  (provider/email/role/workspaceType/experience/onboarded) so a returning user logs back into the same data.
  (Theme/sidebar in FxID8r and future Ev seed data are untouched; a separate hard-reset — planned — wipes all.)

  `experience` records the entry path: "get_started" (first-time signup → empty/FTUE jobs) vs "login"
  (returning → seeded jobs). `role`/`workspaceType` come from the /welcome onboarding screen.
*/
function read() {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SESSION_ROOT) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function write(next) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_ROOT, JSON.stringify(next));
}
/* - - - - - - - - - - - - - - - - */

export function isAuthenticated() {
  return read().authed === true;
}

export function signIn({ provider = "email", email = "", experience = "login" } = {}) {
  write({ ...read(), authed: true, provider, email, experience });
}

export function completeOnboarding({ role = "", workspaceType = "" } = {}) {
  write({ ...read(), role, workspaceType, onboarded: true });
}

export function getExperience() {
  // "get_started" (first-time, empty FTUE jobs) | "login" (returning, seeded jobs)
  return read().experience ?? "login";
}

export function getSession() {
  return read();
}

export function signOut() {
  // Sign out WITHOUT erasing the mock account — keep provider/email/role/workspaceType/etc. so re-login
  // restores the same data. A separate hard-reset (planned) wipes the EvSession key entirely.
  write({ ...read(), authed: false });
}
/* - - - - - - - - - - - - - - - - */
