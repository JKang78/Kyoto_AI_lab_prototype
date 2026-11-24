"use client";

import { useMemo, useSyncExternalStore } from "react";
import { placeById, walkById } from "./game";

export type SavedItems = { version: 1; walks: string[]; places: string[] };
const STORAGE_KEY = "kyoto-ai-lab.saved.v1";
const SAVED_EVENT = "kyoto-ai-lab-saved-updated";
export const emptySaved: SavedItems = { version: 1, walks: [], places: [] };

let memory: string | null = null;
let memoryOnly = false;

function snapshot(): string | null {
  try { return memoryOnly ? memory : window.localStorage.getItem(STORAGE_KEY); }
  catch { return memory; }
}

function subscribe(callback: () => void) {
  window.addEventListener(SAVED_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(SAVED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function decodeSaved(raw: string | null): SavedItems {
  try {
    const value = JSON.parse(raw ?? "null");
    if (value && typeof value === "object" && value.version === 1 && Array.isArray(value.walks) && Array.isArray(value.places)) {
      const walks = [...new Set((value.walks as unknown[]).filter((id): id is string => typeof id === "string" && Boolean(walkById(id))))];
      const places = [...new Set((value.places as unknown[]).filter((id): id is string => typeof id === "string" && Boolean(placeById(id))))];
      return { version: 1, walks, places };
    }
  } catch { /* Start empty if storage is unreadable. */ }
  return emptySaved;
}

function write(next: SavedItems) {
  memory = JSON.stringify(next);
  try { window.localStorage.setItem(STORAGE_KEY, memory); }
  catch { memoryOnly = true; }
  window.dispatchEvent(new Event(SAVED_EVENT));
}

export function useSaved(): SavedItems {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  return useMemo(() => decodeSaved(raw), [raw]);
}

export function toggleSavedWalk(walkId: string) {
  if (!walkById(walkId)) return;
  const current = decodeSaved(snapshot());
  const walks = current.walks.includes(walkId)
    ? current.walks.filter((id) => id !== walkId)
    : [...current.walks, walkId];
  write({ ...current, walks });
}

export function toggleSavedPlace(placeId: string) {
  if (!placeById(placeId)) return;
  const current = decodeSaved(snapshot());
  const places = current.places.includes(placeId)
    ? current.places.filter((id) => id !== placeId)
    : [...current.places, placeId];
  write({ ...current, places });
}

export function clearSaved() {
  memory = null;
  try { window.localStorage.removeItem(STORAGE_KEY); }
  catch { memoryOnly = true; }
  window.dispatchEvent(new Event(SAVED_EVENT));
}
