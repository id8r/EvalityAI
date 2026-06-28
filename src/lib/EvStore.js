/* src/lib/EvStore.js | Ev domain runtime store — seed JSON (public/data) → mutable LS root (EvSeedData) | Sree | 2026-06-28 */

const ROOT = "EvSeedData";
const VERSION = 1;

// Collection → seed file. `settings` is a singleton object; the rest are arrays.
const SEED_FILES = {
  users: "/data/EvUsers.json",
  settings: "/data/EvSettings.json",
  clients: "/data/EvClients.json",
  jobs: "/data/EvJobs.json",
  candidates: "/data/EvCandidates.json",
  applications: "/data/EvApplications.json",
};
const COLLECTIONS = Object.keys(SEED_FILES);

export const EV_DATA_EVENT = "ev-data-change";
/* - - - - - - - - - - - - - - - - */

function readRoot() {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(ROOT) || "null");
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function writeRoot(root) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROOT, JSON.stringify(root));
  window.dispatchEvent(new Event(EV_DATA_EVENT));
}

async function fetchSeeds() {
  const entries = await Promise.all(
    COLLECTIONS.map(async (name) => {
      const res = await fetch(SEED_FILES[name], { cache: "no-store" });
      if (!res.ok) throw new Error(`Ev seed failed: ${SEED_FILES[name]} (${res.status})`);
      return [name, await res.json()];
    }),
  );
  const root = { __version: VERSION };
  for (const [name, data] of entries) root[name] = data;
  return root;
}
/* - - - - - - - - - - - - - - - - */

// First load seeds LS from the static JSON. If EvSeedData already exists it is PRESERVED (we never overwrite on
// refresh — edits survive). Async because seeds are fetched from public/data. Call once before reading.
export async function loadEvData() {
  const existing = readRoot();
  if (existing) return existing;
  const seeded = await fetchSeeds();
  writeRoot(seeded);
  return seeded;
}

export function isSeeded() {
  return readRoot() != null;
}

export function getRoot() {
  return readRoot() ?? {};
}

export function getCollection(name) {
  const value = readRoot()?.[name];
  if (value != null) return value;
  return name === "settings" ? {} : [];
}

export function setCollection(name, value) {
  const root = readRoot() ?? { __version: VERSION };
  root[name] = value;
  writeRoot(root);
}
/* - - - - - - - - - - - - - - - - */

// Soft reset — overwrite the Ev domain collections from the static seeds. Auth/theme/UI prefs live in other LS
// roots (EvSession / FxID8r) and are untouched. (Also the way to pull freshly-edited seed JSON during dev.)
export async function resetEvData() {
  const seeded = await fetchSeeds();
  writeRoot(seeded);
  return seeded;
}

// Hard reset — drop the EvSeedData key entirely; the next loadEvData() re-seeds from scratch.
export function clearEvData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ROOT);
  window.dispatchEvent(new Event(EV_DATA_EVENT));
}

// Reactivity for a future useSyncExternalStore hook: fires on same-tab writes + cross-tab storage changes.
export function subscribeEvData(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EV_DATA_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EV_DATA_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
/* - - - - - - - - - - - - - - - - */
