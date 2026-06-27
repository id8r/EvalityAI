/* src/lib/FxStorage.js | Single-root namespaced localStorage helpers | Sree | 2026-06-27 */

import { FX_STORAGE_ROOT } from "@/lib/FxConstants";
/* - - - - - - - - - - - - - - - - */

/*
  ONE localStorage key (FX_STORAGE_ROOT = "FxID8r") holds a single JSON object; every setting is a field inside it — so the dev inspector shows just one expandable key. Read/write fields via getStored / setStored using the field names in STORAGE_KEYS.
*/

function readRoot() {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FX_STORAGE_ROOT) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeRoot(root) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FX_STORAGE_ROOT, JSON.stringify(root));
}

export function getStored(key) {
  const value = readRoot()[key];
  return value === undefined ? null : value;
}

export function setStored(key, value) {
  const root = readRoot();
  if (value === null || value === undefined) delete root[key];
  else root[key] = value;
  writeRoot(root);
}

export function removeStored(key) {
  const root = readRoot();
  delete root[key];
  writeRoot(root);
}
/* - - - - - - - - - - - - - - - - */