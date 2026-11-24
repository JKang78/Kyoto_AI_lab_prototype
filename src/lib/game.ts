import { GAME, COUPONS, DEMO_SCENARIOS, type CampaignKind } from "../config/game.ts";
import { REWARD_MODE } from "../config/environment.ts";
import { CURATED_PLACES, CURATED_WALKS } from "../data/kyoto-walks.ts";
import type { LocationState } from "./location";
import type { LngLat } from "../types/routes";

/** `mode: "demo"` is a simulated check-in; `"live"` only shows a browser GPS fix was near the stop. Both are demo rewards. */
export type Stamp = { placeId: string; mode: "live" | "demo"; points: number; multiplier: number; campaign?: CampaignKind; at?: number };
export type Run = { id: string; walkId: string; stamps: Stamp[]; complete: boolean; stopped?: boolean; bonus: number };
export type Claim = { id: string; cost: number; at?: number; redeemedAt?: number };
/** `scenario` is the hypothetical bonus scenario a presenter has switched on, if any. It is never inferred from real data. */
export type Game = { version: 3; demo: boolean; scenario: CampaignKind | null; runs: Run[]; claims: Claim[] };
export const emptyGame: Game = { version: 3, demo: false, scenario: null, runs: [], claims: [] };
export const walkById = (id: string) => CURATED_WALKS.find(w => w.id === id);
export const placeById = (id: string) => CURATED_PLACES.find(p => p.id === id);
export const couponById = (id: string) => COUPONS.find(c => c.id === id);
/** The client ledger may only ever hold demo vouchers. Real offers need the server path (src/config/environment.ts). */
export const clientMayUnlock = (coupon: { isDemo: boolean }) => REWARD_MODE === "demo" && coupon.isDemo === true;

export type ActiveBonus = { kind: CampaignKind; multiplier: number };
/** The bonus a walk earns right now: only when its demo scenario is switched on. */
export function activeBonus(game: Pick<Game, "scenario">, walkId: string): ActiveBonus | null {
  const scenario = DEMO_SCENARIOS.find(item => item.kind === game.scenario);
  return scenario && scenario.walkIds.includes(walkId) ? { kind: scenario.kind, multiplier: scenario.multiplier } : null;
}
export const scenarioByKind = (kind: CampaignKind) => DEMO_SCENARIOS.find(item => item.kind === kind)!;

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
  return game.runs.reduce((sum, run) => sum + run.bonus + run.stamps.reduce((n, s) => n + s.points, 0), 0)
    - game.claims.reduce((sum, claim) => sum + claim.cost, 0);
}
/** Points a full walk earns with the given bonus multiplier and at the standard rate. */
export function walkReward(walkId: string, multiplier: number) {
  const stops = walkById(walkId)?.placeIds.length ?? 0;
  return { now: stops * GAME.checkpointPoints * multiplier + GAME.completionPoints, standard: stops * GAME.checkpointPoints + GAME.completionPoints };
}
/** A six-digit code that stays the same for one unlocked voucher. */
export function redemptionCode(claim: Claim) {
  let hash = 2166136261;
  for (const char of `${claim.id}:${claim.at ?? 0}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return String((hash >>> 0) % 1_000_000).padStart(6, "0");
}
export function distanceMeters([lng, lat]: LngLat, [lng2, lat2]: LngLat) {
  const rad = Math.PI / 180;
  const a = Math.sin((lat - lat2) * rad / 2) ** 2 +
    Math.cos(lat * rad) * Math.cos(lat2 * rad) * Math.sin((lng - lng2) * rad / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(a));
}

/** Geographic polygon approximating a circle of `radiusMeters` around `center` so it scales with map zoom. */
export function circlePolygon([lng, lat]: LngLat, radiusMeters: number, steps = 48): [number, number][] {
  const earth = 6371000;
  const latRad = (lat * Math.PI) / 180;
  const dLat = (radiusMeters / earth) * (180 / Math.PI);
  const dLng = dLat / Math.max(0.01, Math.cos(latRad));
  const ring: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    ring.push([lng + Math.cos(angle) * dLng, lat + Math.sin(angle) * dLat]);
  }
  return ring;
}

export type VoucherSegment = {
  stopOffset: number;
  points: number;
  cumulative: number;
  unlocksTarget: boolean;
  isFinalStop: boolean;
};

export type VoucherProjection = {
  target: (typeof COUPONS)[number] | null;
  points: number;
  status: "all_claimed" | "ready" | "reachable_on_walk" | "short_after_walk" | "no_walk";
  stopsNeeded: number | null;
  shortfall: number;
  segments: VoucherSegment[];
};

/** Projects remaining stops on the active walk (with bonus multiplier + completion bonus on the last stop) toward the cheapest unclaimed voucher. */
export function voucherProjection(game: Game): VoucherProjection {
  const points = balance(game);
  const target = [...COUPONS]
    .filter(coupon => !game.claims.some(claim => claim.id === coupon.id))
    .sort((a, b) => a.cost - b.cost)[0] ?? null;

  if (!target) {
    return { target: null, points, status: "all_claimed", stopsNeeded: null, shortfall: 0, segments: [] };
  }

  const run = activeRun(game);
  const walk = run ? walkById(run.walkId) : undefined;
  const remaining = walk && run ? Math.max(0, walk.placeIds.length - run.stamps.length) : 0;
  const multiplier = walk ? (activeBonus(game, walk.id)?.multiplier ?? 1) : 1;
  const segments: VoucherSegment[] = [];
  let running = points;
  let stopsNeeded: number | null = null;

  for (let i = 1; i <= remaining; i++) {
    const isFinalStop = i === remaining;
    const gain = GAME.checkpointPoints * multiplier + (isFinalStop ? GAME.completionPoints : 0);
    const prev = running;
    running += gain;
    const unlocksTarget = prev < target.cost && running >= target.cost;
    if (unlocksTarget && stopsNeeded === null) stopsNeeded = i;
    segments.push({ stopOffset: i, points: gain, cumulative: running, unlocksTarget, isFinalStop });
  }

  if (points >= target.cost) {
    return { target, points, status: "ready", stopsNeeded: 0, shortfall: 0, segments };
  }
  if (remaining === 0) {
    return { target, points, status: "no_walk", stopsNeeded: null, shortfall: target.cost - points, segments: [] };
  }
  if (stopsNeeded !== null) {
    return { target, points, status: "reachable_on_walk", stopsNeeded, shortfall: 0, segments };
  }
  return { target, points, status: "short_after_walk", stopsNeeded: null, shortfall: target.cost - running, segments };
}
export function liveEligible(location: LocationState, point: LngLat, now: number) {
  const fix = location.fix;
  if (location.mode !== "live" || location.gpsStatus !== "active" || !fix ||
      !Number.isFinite(now) || !Number.isFinite(fix.timestamp) ||
      fix.timestamp - now > GAME.maxClockSkewMs || now - fix.timestamp > GAME.maxFixAgeMs ||
      !(fix.accuracy >= 0 && fix.accuracy <= GAME.maxAccuracyMeters)) return false;
  return distanceMeters(point, [fix.longitude, fix.latitude]) <= GAME.radiusMeters;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
const nonNegative = (value: unknown) => typeof value === "number" && Number.isFinite(value) && value >= 0;
const optionalTime = (value: unknown) => value === undefined || nonNegative(value);

function validRun(run: unknown): run is Run {
  if (!isPlainObject(run) || typeof run.id !== "string" || run.id.length === 0 || typeof run.walkId !== "string") return false;
  const walk = walkById(run.walkId);
  if (!walk || !Array.isArray(run.stamps) || run.stamps.length > walk.placeIds.length) return false;
  if (typeof run.complete !== "boolean" || run.complete !== (run.stamps.length === walk.placeIds.length)) return false;
  if (run.stopped !== undefined && typeof run.stopped !== "boolean") return false;
  if (run.complete && run.stopped) return false;
  if (!nonNegative(run.bonus)) return false;
  return run.stamps.every((stamp, index) =>
    isPlainObject(stamp) &&
    stamp.placeId === walk.placeIds[index] &&
    (stamp.mode === "live" || stamp.mode === "demo") &&
    nonNegative(stamp.points) && nonNegative(stamp.multiplier) && optionalTime(stamp.at) &&
    (stamp.campaign === undefined || DEMO_SCENARIOS.some(item => item.kind === stamp.campaign)),
  );
}

const knownClaims = (claims: unknown[]) => claims.filter(claim => isPlainObject(claim) && couponById(String(claim.id)));
/** Version 1 stored coins and a "busy period" flag. Its coupons no longer exist, so their claims are refunded. */
function upgradeV1(value: Record<string, unknown>): unknown {
  if (typeof value.peak !== "boolean" || !Array.isArray(value.runs) || !Array.isArray(value.claims)) return null;
  const runs = value.runs.map(run => !isPlainObject(run) || !Array.isArray(run.stamps) ? run : {
    ...run,
    stamps: run.stamps.map(stamp => !isPlainObject(stamp) ? stamp : (({ coins, ...rest }) => ({
      ...rest, points: coins, multiplier: typeof coins === "number" ? coins / GAME.checkpointPoints : coins,
    }))(stamp)),
  });
  return { version: 2, demo: value.demo, offPeak: false, runs, claims: knownClaims(value.claims) };
}
/** Version 2 had a clock-based "off-peak" window and a transit voucher. Earned points stay; the transit claim is refunded. */
function upgradeV2(value: Record<string, unknown>): unknown {
  if (typeof value.offPeak !== "boolean" || !Array.isArray(value.claims)) return null;
  return { version: 3, demo: value.demo, scenario: null, runs: value.runs, claims: knownClaims(value.claims) };
}

export function decodeGame(raw: string | null): Game {
  try {
    let value: unknown = JSON.parse(raw ?? "null");
    if (isPlainObject(value) && value.version === 1) value = upgradeV1(value);
    if (isPlainObject(value) && value.version === 2) value = upgradeV2(value);
    if (!isPlainObject(value)) return emptyGame;
    if (value.version !== 3 || typeof value.demo !== "boolean") return emptyGame;
    if (value.scenario !== null && !DEMO_SCENARIOS.some(item => item.kind === value.scenario)) return emptyGame;
    if (!Array.isArray(value.runs) || !Array.isArray(value.claims)) return emptyGame;
    if (!value.runs.every(validRun)) return emptyGame;
    if (new Set(value.runs.map(run => run.id)).size !== value.runs.length) return emptyGame;
    if (!value.runs.slice(0, -1).every(run => Boolean(run.complete || run.stopped))) return emptyGame;
    const claimsValid = value.claims.every(claim =>
      isPlainObject(claim) && typeof claim.id === "string" && couponById(claim.id) &&
      nonNegative(claim.cost) && optionalTime(claim.at) && optionalTime(claim.redeemedAt),
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
  | { type: "unlock"; id: string }
  | { type: "redeem"; id: string }
  | { type: "scenario"; kind: CampaignKind | null }
  | { type: "demo"; enabled: boolean }
  | { type: "reset" };

export function transition(game: Game, action: Action, now = Date.now()): Game {
  const run = activeRun(game);
  switch (action.type) {
    case "reset": return emptyGame;
    case "demo": return { ...game, demo: action.enabled };
    case "scenario": return action.kind === null || DEMO_SCENARIOS.some(item => item.kind === action.kind) ? { ...game, scenario: action.kind } : game;
    case "start":
      if (run || !walkById(action.walkId) || game.runs.some(r => r.id === action.id)) return game;
      return { ...game, runs: [...game.runs, { id: action.id, walkId: action.walkId, stamps: [], complete: false, bonus: 0 }] };
    case "stop":
      if (run?.id !== action.runId) return game;
      return { ...game, runs: [...game.runs.slice(0, -1), { ...run, stopped: true }] };
    case "unlock": {
      const coupon = couponById(action.id);
      if (!coupon || !clientMayUnlock(coupon) || game.claims.some(c => c.id === coupon.id) || balance(game) < coupon.cost) return game;
      return { ...game, claims: [...game.claims, { id: coupon.id, cost: coupon.cost, at: now }] };
    }
    case "redeem": {
      const claim = game.claims.find(c => c.id === action.id);
      if (!claim || claim.redeemedAt !== undefined || !Number.isFinite(now)) return game;
      return { ...game, claims: game.claims.map(c => c === claim ? { ...c, redeemedAt: now } : c) };
    }
    case "collect": {
      if (!run || run.id !== action.runId) return game;
      const walk = walkById(run.walkId);
      const place = placeById(action.placeId);
      if (!place || walk?.placeIds[run.stamps.length] !== place.id) return game;
      const mode = action.location.mode;
      if (mode === "unselected" || (mode === "live" && !liveEligible(action.location, place.location, now))) return game;
      const bonus = activeBonus(game, walk.id);
      const multiplier = bonus?.multiplier ?? 1;
      const stamp: Stamp = { placeId: place.id, mode, points: GAME.checkpointPoints * multiplier, multiplier, at: now };
      if (bonus) stamp.campaign = bonus.kind;
      const stamps = [...run.stamps, stamp];
      const complete = stamps.length === walk.placeIds.length;
      return { ...game, runs: [...game.runs.slice(0, -1), { ...run, stamps, complete, bonus: complete ? GAME.completionPoints : 0 }] };
    }
  }
}
