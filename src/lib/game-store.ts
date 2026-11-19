"use client";
import { useMemo, useSyncExternalStore } from "react";
import { emptyGame, transition, walkById, type Action, type Game, type Run } from "./game";

const key = "kyoto-ai-lab.progress.v1";
let memory: string | null = null;
let memoryOnly = false;
function snapshot() {
  try { return memoryOnly ? memory : window.localStorage.getItem(key); }
  catch { return memory; }
}
function subscribe(callback: () => void) {
  window.addEventListener(key, callback);
  window.addEventListener("storage", callback);
  return () => { window.removeEventListener(key, callback); window.removeEventListener("storage", callback); };
}
function validRun(run: Run) {
  const walk = walkById(run.walkId);
  return walk && typeof run.id === "string" && Array.isArray(run.stamps) && run.stamps.length <= walk.placeIds.length &&
    run.complete === (run.stamps.length === walk.placeIds.length) && Number.isFinite(run.bonus) &&
    run.stamps.every((s, i) => s.placeId === walk.placeIds[i] && ["live", "demo"].includes(s.mode) && Number.isFinite(s.coins));
}
function decode(raw: string | null): Game {
  try {
    const value = JSON.parse(raw ?? "null");
    if (value?.version === 1 && typeof value.peak === "boolean" && typeof value.demo === "boolean" && value.runs.every(validRun) &&
        value.claims.every((c: Game["claims"][number]) => typeof c.id === "string" && Number.isFinite(c.cost))) return value;
  } catch { /* Absent or unusable progress starts a fresh demo. */ }
  return emptyGame;
}
export function useGame() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  return useMemo(() => decode(raw), [raw]);
}
export async function act(action: Action) {
  const write = () => {
    const previous = decode(snapshot());
    const next = transition(previous, action);
    if (next === previous) return false;
    memory = JSON.stringify(next);
    try { window.localStorage.setItem(key, memory); }
    catch { memoryOnly = true; }
    window.dispatchEvent(new Event(key));
    return true;
  };
  return navigator.locks ? navigator.locks.request(key, write) : write();
}
