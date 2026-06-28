/* src/lib/EvUIData.js | Ev product VIEW-STATE — table/view prefs under the EvUIData LS root (NOT domain data) | Sree | 2026-06-28 */

const ROOT = "EvUIData";
/* - - - - - - - - - - - - - - - - */

/*
  Own LS root `EvUIData`, separate from EvSeedData (domain) and FxID8r (design-system UI) — so table prefs never
  mix with domain JSON. Table prefs live at EvUIData.table[tableId] (e.g. table["jobs"],
  table["jobWorkspace.unscreened"], table["candidates"], table["clients"]) — i.e. the `ev.table.*` namespace.
  Pref shape: { visibleColumnIds[], columnOrder[], sort:{columnId,direction}, density, pageSize }.
*/
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
}
/* - - - - - - - - - - - - - - - - */

export function getTablePrefs(tableId) {
  return readRoot()?.table?.[tableId] ?? null;
}

export function setTablePrefs(tableId, prefs) {
  const root = readRoot() ?? {};
  root.table = { ...(root.table ?? {}), [tableId]: prefs };
  writeRoot(root);
}

export function clearTablePrefs(tableId) {
  const root = readRoot();
  if (!root?.table?.[tableId]) return;
  const table = { ...root.table };
  delete table[tableId];
  writeRoot({ ...root, table });
}

// Wipe every table pref (e.g. a "reset views" / hard-reset helper later).
export function clearAllTablePrefs() {
  const root = readRoot();
  if (!root) return;
  const next = { ...root };
  delete next.table;
  writeRoot(next);
}
/* - - - - - - - - - - - - - - - - */
