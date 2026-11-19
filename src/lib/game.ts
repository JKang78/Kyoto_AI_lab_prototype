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
export function balance(game: Game) {
  return game.runs.reduce((sum, run) => sum + run.bonus + run.stamps.reduce((n, s) => n + s.coins, 0), 0)
    - game.claims.reduce((sum, claim) => sum + claim.cost, 0);
}
export function liveEligible(location: LocationState, [lng, lat]: LngLat, now: number) {
  const fix = location.fix;
  if (location.mode !== "live" || location.gpsStatus !== "active" || !fix ||
      !Number.isFinite(fix.timestamp) || now < fix.timestamp || now - fix.timestamp > GAME.maxFixAgeMs ||
      !(fix.accuracy >= 0 && fix.accuracy <= GAME.maxAccuracyMeters)) return false;
  const rad = Math.PI / 180;
  const a = Math.sin((lat - fix.latitude) * rad / 2) ** 2 +
    Math.cos(lat * rad) * Math.cos(fix.latitude * rad) * Math.sin((lng - fix.longitude) * rad / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(a)) <= GAME.radiusMeters;
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
