"use client";
import { useMemo, useSyncExternalStore } from "react";
import { PREVIEW_CONTROLS } from "../config/environment";
import { createDemoShowcaseGame, decodeGame, transition, type Action, type Game } from "./game";

const key = "kyoto-ai-lab.progress.v1";
const showcaseKey = "kyoto-ai-lab.showcase.v1";
let memory: string | null = null;
let memoryOnly = false;
let showcaseMemory: string | null = null;
let showcaseMemoryOnly = false;

type ShowcaseRecord = { enabled: boolean; game: Game };

function snapshot() {
  try { return memoryOnly ? memory : window.localStorage.getItem(key); }
  catch { return memory; }
}
function showcaseSnapshot() {
  try { return showcaseMemoryOnly ? showcaseMemory : window.localStorage.getItem(showcaseKey); }
  catch { return showcaseMemory; }
}
function subscribeKey(targetKey: string) {
  return (callback: () => void) => {
    window.addEventListener(targetKey, callback);
    window.addEventListener("storage", callback);
    return () => { window.removeEventListener(targetKey, callback); window.removeEventListener("storage", callback); };
  };
}
const subscribeProgress = subscribeKey(key);
const subscribeShowcase = subscribeKey(showcaseKey);

function decodeShowcase(raw: string | null): ShowcaseRecord | null {
  if (!PREVIEW_CONTROLS || !raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const record = parsed as Record<string, unknown>;
    if (record.enabled !== true) return null;
    const game = decodeGame(JSON.stringify(record.game ?? null));
    return { enabled: true, game };
  } catch {
    return null;
  }
}

function writeShowcase(record: ShowcaseRecord | null) {
  showcaseMemory = record ? JSON.stringify(record) : null;
  try {
    if (showcaseMemory === null) window.localStorage.removeItem(showcaseKey);
    else window.localStorage.setItem(showcaseKey, showcaseMemory);
  } catch {
    showcaseMemoryOnly = true;
  }
  window.dispatchEvent(new Event(showcaseKey));
}

export function useDemoShowcase(): boolean {
  const raw = useSyncExternalStore(subscribeShowcase, showcaseSnapshot, () => null);
  return useMemo(() => Boolean(decodeShowcase(raw)?.enabled), [raw]);
}

export function setDemoShowcase(enabled: boolean): void {
  if (!PREVIEW_CONTROLS || !enabled) {
    writeShowcase(null);
    return;
  }
  writeShowcase({ enabled: true, game: createDemoShowcaseGame() });
}

export function clearDemoShowcase(): void {
  writeShowcase(null);
}

export function useGame() {
  const progressRaw = useSyncExternalStore(subscribeProgress, snapshot, () => null);
  const showcaseRaw = useSyncExternalStore(subscribeShowcase, showcaseSnapshot, () => null);
  return useMemo(() => {
    const showcase = decodeShowcase(showcaseRaw);
    return showcase?.enabled ? showcase.game : decodeGame(progressRaw);
  }, [progressRaw, showcaseRaw]);
}

export async function act(action: Action) {
  const write = () => {
    const showcase = decodeShowcase(showcaseSnapshot());
    if (showcase?.enabled) {
      const next = transition(showcase.game, action);
      if (next === showcase.game) return false;
      writeShowcase({ enabled: true, game: next });
      return true;
    }
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
