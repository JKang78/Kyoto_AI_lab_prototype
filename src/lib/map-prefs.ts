/**
 * Personal map look preferences (local to this browser, no account, no tracking).
 * Defaults keep the current Illustrated map unchanged until someone turns a option on.
 */
export type MapPrefs = Readonly<{
  seasonalColours: boolean;
  largerLabels: boolean;
  landmarkLabelsOnly: boolean;
  flatMap: boolean;
}>;

export const DEFAULT_MAP_PREFS: MapPrefs = { seasonalColours: false, largerLabels: false, landmarkLabelsOnly: false, flatMap: false };

const STORAGE_KEY = "kyoto-flow.map-prefs.v1";
const EVENT = "kyoto-flow-map-prefs-updated";
let memorySnapshot: string | null = null;

export function parseMapPrefs(raw: string | null): MapPrefs {
  if (!raw) return DEFAULT_MAP_PREFS;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return DEFAULT_MAP_PREFS;
    const record = value as Record<string, unknown>;
    const pick = (key: keyof MapPrefs) => (typeof record[key] === "boolean" ? record[key] as boolean : DEFAULT_MAP_PREFS[key]);
    return { seasonalColours: pick("seasonalColours"), largerLabels: pick("largerLabels"), landmarkLabelsOnly: pick("landmarkLabelsOnly"), flatMap: pick("flatMap") };
  } catch {
    return DEFAULT_MAP_PREFS;
  }
}

export function getMapPrefsSnapshot(): string | null {
  try { return window.localStorage.getItem(STORAGE_KEY) ?? memorySnapshot; } catch { return memorySnapshot; }
}

export function readMapPrefs(): MapPrefs {
  return parseMapPrefs(getMapPrefsSnapshot());
}

export function subscribeMapPrefs(callback: () => void): () => void {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => { window.removeEventListener(EVENT, callback); window.removeEventListener("storage", callback); };
}

export function saveMapPrefs(prefs: MapPrefs): void {
  memorySnapshot = JSON.stringify(prefs);
  try { window.localStorage.setItem(STORAGE_KEY, memorySnapshot); } catch { /* Private mode: the choice lasts this visit only. */ }
  window.dispatchEvent(new Event(EVENT));
}
