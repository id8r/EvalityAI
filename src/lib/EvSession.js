/* src/lib/EvSession.js | Demo auth/session flags — own LS root so logout leaves Fx UI + Ev seed data intact | Sree | 2026-06-27 */

const SESSION_ROOT = "EvSession";
/* - - - - - - - - - - - - - - - - */

/*
  Demo-only session (no real auth). A single LS root "EvSession" holds the flags; signOut clears ONLY
  this key, leaving FxID8r (theme/sidebar/UI prefs) and the future EvSeedData (domain) untouched.
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

export function getSession() {
  return read();
}

export function isAuthenticated() {
  return read().authed === true;
}

export function signIn({ provider = "email", email = "" } = {}) {
  write({ ...read(), authed: true, provider, email });
}

export function completeOnboarding() {
  write({ ...read(), onboarded: true });
}

export function signOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_ROOT);
}
/* - - - - - - - - - - - - - - - - */
