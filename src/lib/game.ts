import { GAME, COUPONS } from "../config/game.ts";
import { CURATED_PLACES, CURATED_WALKS } from "../data/kyoto-walks.ts";
import type { LocationState } from "./location";
import type { LngLat } from "../types/routes";

export type Stamp = { placeId: string; mode: "live" | "demo"; coins: number };
export type Run = { id: string; walkId: string; stamps: Stamp[]; complete: boolean; stopped?: boolean; bonus: number };
export type Game = { version: 1; demo: boolean; runs: Run[]; claims: { id: string; cost: number }[]; peak: boolean };
export const emptyGame: Game = { version: 1, demo: false, runs: [], claims: [], peak: false };
export const walkById = (id: string) => CURATED_WALKS.find(w => w.id === id);
export const placeById = (id: string) => CURATED_PLACES.find(p => p.id === id);
export function activeRun(game: Game) {
  const last = game.runs.at(-1);
  return last && !last.complete && !last.stopped ? last : undefined;
}
export type WalkStatus = {
  status: "active" | "completed" | "stopped" | "available";
  stamps: number;
  completedCount: number;
};
export function walkStatus(game: Game, walkId: string): WalkStatus {
  const walk = walkById(walkId);
  const runs = game.runs.filter(r => r.walkId === walkId);
  const latest = runs.at(-1);
  const completedCount = runs.filter(r => r.complete).length;
  const completed = completedCount > 0;
  const active = Boolean(latest && !latest.complete && !latest.stopped);
  const status = active ? "active" : completed ? "completed" : latest?.stopped ? "stopped" : "available";
  const stamps = active ? latest!.stamps.length : completed ? (walk?.placeIds.length ?? 0) : (latest?.stamps.length ?? 0);
  return { status, stamps, completedCount };
}
export function balance(game: Game) {
  return game.runs.reduce((sum, run) => sum + run.bonus + run.stamps.reduce((n, s) => n + s.coins, 0), 0)
    - game.claims.reduce((sum, claim) => sum + claim.cost, 0);
}
export function liveEligible(location: LocationState, [lng, lat]: LngLat, now: number) {
  const fix = location.fix;
  if (location.mode !== "live" || location.gpsStatus !== "active" || !fix ||
      !Number.isFinite(now) || !Number.isFinite(fix.timestamp) ||
      fix.timestamp - now > GAME.maxClockSkewMs || now - fix.timestamp > GAME.maxFixAgeMs ||
      !(fix.accuracy >= 0 && fix.accuracy <= GAME.maxAccuracyMeters)) return false;
  const rad = Math.PI / 180;
  const a = Math.sin((lat - fix.latitude) * rad / 2) ** 2 +
    Math.cos(lat * rad) * Math.cos(fix.latitude * rad) * Math.sin((lng - fix.longitude) * rad / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(a)) <= GAME.radiusMeters;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validRun(run: unknown): run is Run {
  if (!isPlainObject(run) || typeof run.id !== "string" || run.id.length === 0 || typeof run.walkId !== "string") return false;
  const walk = walkById(run.walkId);
  if (!walk || !Array.isArray(run.stamps) || run.stamps.length > walk.placeIds.length) return false;
  if (typeof run.complete !== "boolean" || run.complete !== (run.stamps.length === walk.placeIds.length)) return false;
  if (run.stopped !== undefined && typeof run.stopped !== "boolean") return false;
  if (run.complete && run.stopped) return false;
  if (typeof run.bonus !== "number" || !Number.isFinite(run.bonus) || run.bonus < 0) return false;
  return run.stamps.every((stamp, index) =>
    isPlainObject(stamp) &&
    stamp.placeId === walk.placeIds[index] &&
    (stamp.mode === "live" || stamp.mode === "demo") &&
    typeof stamp.coins === "number" &&
    Number.isFinite(stamp.coins) &&
    stamp.coins >= 0,
  );
}

export function decodeGame(raw: string | null): Game {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (!isPlainObject(value)) return emptyGame;
    if (value.version !== 1 || typeof value.peak !== "boolean" || typeof value.demo !== "boolean") return emptyGame;
    if (!Array.isArray(value.runs) || !Array.isArray(value.claims)) return emptyGame;
    if (!value.runs.every(validRun)) return emptyGame;
    if (new Set(value.runs.map(run => run.id)).size !== value.runs.length) return emptyGame;
    if (!value.runs.slice(0, -1).every(run => Boolean(run.complete || run.stopped))) return emptyGame;
    const claimsValid = value.claims.every(claim =>
      isPlainObject(claim) &&
      typeof claim.id === "string" &&
      claim.id.length > 0 &&
      typeof claim.cost === "number" &&
      Number.isFinite(claim.cost) &&
      claim.cost >= 0,
    );
    if (!claimsValid) return emptyGame;
    const claimIds = value.claims.map(claim => (claim as { id: string }).id);
    if (new Set(claimIds).size !== claimIds.length) return emptyGame;
    return value as unknown as Game;
  } catch { /* Absent or unusable progress starts a fresh demo. */ }
  return emptyGame;
}

export type Action =
  | { type: "start"; walkId: string; id: string }
  | { type: "collect"; runId: string; placeId: string; location: LocationState }
  | { type: "stop"; runId: string }
  | { type: "claim"; id: string }
  | { type: "peak"; enabled: boolean }
  | { type: "demo"; enabled: boolean }
  | { type: "reset" };

export function transition(game: Game, action: Action, now = Date.now()): Game {
  const run = activeRun(game);
  switch (action.type) {
    case "reset": return emptyGame;
    case "demo": return { ...game, demo: action.enabled };
    case "peak": return { ...game, peak: action.enabled };
    case "start":
      if (run || !walkById(action.walkId) || game.runs.some(r => r.id === action.id)) return game;
      return { ...game, runs: [...game.runs, { id: action.id, walkId: action.walkId, stamps: [], complete: false, bonus: 0 }] };
    case "stop":
      if (run?.id !== action.runId) return game;
      return { ...game, runs: [...game.runs.slice(0, -1), { ...run, stopped: true }] };
    case "claim": {
      const coupon = COUPONS.find(c => c.id === action.id);
      if (!coupon || game.claims.some(c => c.id === coupon.id) || balance(game) < coupon.cost) return game;
      return { ...game, claims: [...game.claims, { id: coupon.id, cost: coupon.cost }] };
    }
    case "collect": {
      if (!run || run.id !== action.runId) return game;
      const walk = walkById(run.walkId);
      const place = placeById(action.placeId);
      if (!place || walk?.placeIds[run.stamps.length] !== place.id) return game;
      const mode = action.location.mode;
      if (mode === "unselected" || (mode === "live" && !liveEligible(action.location, place.location, now))) return game;
      const coins = GAME.checkpointCoins * (mode === "demo" && game.peak ? 1 + GAME.sampleBonusPercent / 100 : 1);
      const stamps = [...run.stamps, { placeId: place.id, mode, coins }];
      const complete = stamps.length === walk.placeIds.length;
      return { ...game, runs: [...game.runs.slice(0, -1), { ...run, stamps, complete, bonus: complete ? GAME.completionCoins : 0 }] };
    }
  }
}
