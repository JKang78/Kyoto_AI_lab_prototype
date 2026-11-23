"use client";
import { useMemo, useSyncExternalStore } from "react";
import { decodeGame, transition, type Action } from "./game";

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
export function useGame() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  return useMemo(() => decodeGame(raw), [raw]);
}
export async function act(action: Action) {
  const write = () => {
    const previous = decodeGame(snapshot());
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
