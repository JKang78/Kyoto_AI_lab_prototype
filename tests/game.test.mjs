import assert from 'node:assert/strict';
import test from 'node:test';
import { GAME, COUPONS } from '../src/config/game.ts';
import { REWARD_MODE } from '../src/config/environment.ts';
import { sampleWalkCrowd } from '../src/data/sample-congestion.ts';
import { emptyGame, balance, activeRun, walkStatus, transition, liveEligible, decodeGame, placeById, walkById, activeBonus, walkReward, redemptionCode, clientMayUnlock, circlePolygon, distanceMeters, voucherProjection, isCouponExpired } from '../src/lib/game.ts';

// 12:00 and 08:00 Kyoto time (UTC+9).
const NOON = Date.UTC(2026, 10, 24, 3);
const MORNING = Date.UTC(2026, 10, 23, 23);
const demo = { mode: 'demo', gpsStatus: 'off', fix: null };
const stops = ['shijo-kawaramachi', 'shijo-ohashi', 'yasaka-west-view'];
const start = (g, id) => transition(g, { type: 'start', walkId: 'shijo-yasaka', id });
const stamp = (g, id, placeId, location = demo, now = NOON) => transition(g, { type: 'collect', runId: id, placeId, location }, now);
const unlock = (game, id = 'matcha', now = NOON) => transition(game, { type: 'unlock', id }, now);

test('two walk instances, stale events, duplicate unlocks and reset', () => {
  let game = start(emptyGame, 'one');
  assert.equal(start(game, 'accidental-second-start'), game);
  assert.equal(unlock(game), game);
  assert.equal(stamp(game, 'one', stops[1]), game);
  for (const stop of stops) {
    game = stamp(game, 'one', stop);
    assert.equal(stamp(game, 'one', stop), game);
  }
  assert.equal(activeRun(game), undefined);
  assert.equal(balance(game), 60);
  game = unlock(game);
  assert.equal(balance(game), 0);
  assert.equal(game.claims[0].at, NOON);
  game = start(JSON.parse(JSON.stringify(game)), 'two');
  assert.equal(stamp(game, 'one', stops[0]), game);
  for (const stop of stops) game = stamp(game, 'two', stop);
  assert.equal(balance(game), 60);
  assert.equal(unlock(game), game);
  assert.equal(game.claims.length, 1);
  assert.deepEqual(transition(game, { type: 'reset' }), emptyGame);
});

test('bonus scenarios are off by default, separate, and only apply to their own walk', () => {
  assert.equal(emptyGame.scenario, null);
  assert.equal(activeBonus(emptyGame, 'shijo-yasaka'), null);
  const bus = transition(emptyGame, { type: 'scenario', kind: 'bus_relief' });
  const quiet = transition(emptyGame, { type: 'scenario', kind: 'quiet_hour' });
  assert.deepEqual(activeBonus(bus, 'shijo-yasaka'), { kind: 'bus_relief', multiplier: 2 });
  assert.equal(activeBonus(bus, 'yasaka-maruyama'), null);
  assert.equal(activeBonus(bus, 'kamo-riverside'), null);
  assert.deepEqual(activeBonus(quiet, 'yasaka-maruyama'), { kind: 'quiet_hour', multiplier: 2 });
  assert.equal(activeBonus(quiet, 'shijo-yasaka'), null);
  assert.equal(transition(emptyGame, { type: 'scenario', kind: 'off_peak' }), emptyGame);
  // No clock-based window exists: the time of day never changes points.
  for (const now of [MORNING, NOON]) assert.equal(stamp(start(emptyGame, 'w'), 'w', stops[0], demo, now).runs[0].stamps[0].points, 10);

  let game = start(bus, 'walk');
  game = stamp(game, 'walk', stops[0]);
  game = transition(game, { type: 'scenario', kind: null });
  game = stamp(game, 'walk', stops[1]);
  assert.deepEqual(game.runs[0].stamps.map(s => [s.points, s.multiplier, s.campaign]), [[20, 2, 'bus_relief'], [10, 1, undefined]]);
  assert.equal(balance(game), 30);
  assert.deepEqual(walkReward('shijo-yasaka', 2), { now: 3 * GAME.checkpointPoints * 2 + GAME.completionPoints, standard: 60 });
  assert.deepEqual(decodeGame(JSON.stringify(game)), game);
});

test('every voucher is a demo voucher and nothing else can be unlocked', () => {
  assert.equal(REWARD_MODE, 'demo');
  assert.ok(COUPONS.length > 0 && COUPONS.every(coupon => coupon.isDemo === true));
  assert.ok(COUPONS.every(coupon => !/transit|subway|bus|rail/i.test(`${coupon.id} ${coupon.offer.en} ${coupon.merchant.en}`)));
  assert.ok(COUPONS.every(coupon => /fictional/i.test(coupon.merchant.en) && /架空/.test(coupon.merchant.ja)));
  assert.equal(clientMayUnlock({ ...COUPONS[0], isDemo: false }), false);
  assert.equal(clientMayUnlock(COUPONS[0]), true);
  let game = start(emptyGame, 'walk');
  for (const stop of stops) game = stamp(game, 'walk', stop);
  assert.equal(transition(game, { type: 'unlock', id: 'not-a-demo-voucher' }), game);
});

test('a voucher redeems once and keeps a stable code', () => {
  let game = start(emptyGame, 'walk');
  for (const stop of stops) game = stamp(game, 'walk', stop);
  assert.equal(transition(game, { type: 'redeem', id: 'matcha' }, NOON), game);
  game = unlock(game);
  const code = redemptionCode(game.claims[0]);
  assert.match(code, /^\d{6}$/);
  game = transition(game, { type: 'redeem', id: 'matcha' }, NOON + 1000);
  assert.equal(game.claims[0].redeemedAt, NOON + 1000);
  assert.equal(transition(game, { type: 'redeem', id: 'matcha' }, NOON + 2000), game);
  assert.equal(redemptionCode(game.claims[0]), code);
  assert.equal(balance(game), 0);
  assert.deepEqual(decodeGame(JSON.stringify(game)), game);
});

test('live eligibility requires an active fresh fix, with inclusive thresholds', () => {
  const point = placeById(stops[0]).location;
  const now = NOON;
  const fix = { timestamp: now, accuracy: 50, latitude: point[1], longitude: point[0] };
  const live = { mode: 'live', gpsStatus: 'active', fix };
  assert.ok(liveEligible(live, point, now + 30_000));
  for (const location of [demo, {...live, gpsStatus: 'paused'}, {...live, gpsStatus: 'denied'},
    {...live, fix: null}, {...live, fix: {...fix, accuracy: 51}}, {...live, fix: {...fix, timestamp: now - 30_001}},
    {...live, fix: {...fix, latitude: fix.latitude + .001}}]) {
    assert.equal(liveEligible(location, point, now), false);
  }
  const actual = stamp(start(emptyGame, 'walk'), 'walk', stops[0], live, now);
  assert.equal(balance(actual), 10);
  assert.deepEqual(actual.runs[0].stamps[0], { placeId: stops[0], mode: 'live', points: 10, multiplier: 1, at: now });
});

test('stopping early keeps earned stamps and gives no completion bonus', () => {
  let game = stamp(start(emptyGame, 'first'), 'first', stops[0]);
  game = transition(game, { type: 'stop', runId: 'first' });
  assert.equal(activeRun(game), undefined);
  assert.equal(balance(game), 10);
  assert.equal(stamp(game, 'first', stops[1]), game);
  assert.equal(activeRun(start(game, 'next')).id, 'next');
});

test('75 m radius distinguishes nearby fixes at acceptable accuracy', () => {
  const now = Date.now();
  const point = placeById(stops[0]).location;
  const north = meters => ({ mode: 'live', gpsStatus: 'active', fix: {
    longitude: point[0], latitude: point[1] + meters * 180 / (Math.PI * 6371000), accuracy: 10, timestamp: now,
  } });
  assert.equal(liveEligible(north(74.99), point, now), true);
  assert.equal(liveEligible(north(75.01), point, now), false);
});

test('live eligibility tolerates small positive clock skew and rejects far-future or non-finite timestamps', () => {
  const now = Date.now();
  const point = placeById(stops[0]).location;
  const makeLive = timestamp => ({
    mode: 'live',
    gpsStatus: 'active',
    fix: { longitude: point[0], latitude: point[1], accuracy: 10, timestamp },
  });
  assert.equal(liveEligible(makeLive(now + 500), point, now), true);
  assert.equal(liveEligible(makeLive(now + GAME.maxClockSkewMs), point, now), true);
  assert.equal(liveEligible(makeLive(now + GAME.maxClockSkewMs + 1), point, now), false);
  assert.equal(liveEligible(makeLive(Number.NaN), point, now), false);
  assert.equal(liveEligible(makeLive(Number.POSITIVE_INFINITY), point, now), false);
  assert.equal(liveEligible(makeLive(now), point, Number.NaN), false);
  assert.equal(liveEligible(makeLive(now), point, Number.POSITIVE_INFINITY), false);
  assert.equal(liveEligible(makeLive(now), point, Number.NEGATIVE_INFINITY), false);

  const started = start(emptyGame, 'skew');
  const accepted = transition(started, { type: 'collect', runId: 'skew', placeId: stops[0], location: makeLive(now + 500) }, now);
  assert.equal(accepted.runs[0].stamps.length, 1);
  const rejected = transition(started, { type: 'collect', runId: 'skew', placeId: stops[0], location: makeLive(now + GAME.maxClockSkewMs + 1) }, now);
  assert.equal(rejected, started);
  const rejectedNanNow = transition(started, { type: 'collect', runId: 'skew', placeId: stops[0], location: makeLive(now) }, Number.NaN);
  assert.equal(rejectedNanNow, started);
});

test('decodeGame validates structure, bounds, uniqueness, and single active run invariant', () => {
  const point = (placeId) => ({ placeId, mode: 'demo', points: 10, multiplier: 1, at: NOON });
  const baseRun = (id, overrides = {}) => ({
    id,
    walkId: 'shijo-yasaka',
    stamps: [point(stops[0])],
    complete: false,
    bonus: 0,
    ...overrides,
  });
  const baseGame = (overrides = {}) => ({
    version: 3,
    demo: true,
    scenario: null,
    runs: [],
    claims: [],
    ...overrides,
  });

  for (const raw of [null, '', '{bad', 'null', '[]', '123', '"str"']) {
    assert.deepEqual(decodeGame(raw), emptyGame);
  }
  const invalidPayloads = [
    baseGame({ runs: {} }),
    baseGame({ claims: null }),
    baseGame({ scenario: 'off_peak' }),
    baseGame({ runs: [baseRun('r1', { stamps: [{ ...point(stops[0]), campaign: 'surge' }] })] }),
    baseGame({ runs: [null] }),
    baseGame({ claims: [null] }),
    baseGame({ runs: [baseRun('r1', { stamps: [null] })] }),
    baseGame({ runs: [baseRun('r1', { stamps: [{ ...point(stops[0]), points: -1 }] })] }),
    baseGame({ runs: [baseRun('r1', { stamps: [{ ...point(stops[0]), multiplier: Number.NaN }] })] }),
    baseGame({ runs: [baseRun('r1', { bonus: -5 })] }),
    baseGame({ claims: [{ id: 'matcha', cost: -1 }] }),
    baseGame({ claims: [{ id: 'unknown', cost: 10 }] }),
    baseGame({ claims: [{ id: 'matcha', cost: 60, redeemedAt: 'soon' }] }),
    baseGame({ claims: [{ id: 'matcha', cost: 60 }, { id: 'matcha', cost: 60 }] }),
    baseGame({ runs: [baseRun('dup', { stopped: true }), baseRun('dup')] }),
    baseGame({
      runs: [{
        id: 'both',
        walkId: 'shijo-yasaka',
        stamps: stops.map(point),
        complete: true,
        stopped: true,
        bonus: 30,
      }],
    }),
    baseGame({ runs: [baseRun('active-early'), baseRun('tail')] }),
  ];
  for (const payload of invalidPayloads) {
    assert.deepEqual(decodeGame(JSON.stringify(payload)), emptyGame);
  }

  const valid = baseGame({
    runs: [
      { id: 'done', walkId: 'shijo-yasaka', stamps: stops.map(point), complete: true, bonus: 30 },
      baseRun('stopped-early', { stopped: true }),
      baseRun('active-tail'),
    ],
    claims: [{ id: 'matcha', cost: 60, at: NOON, redeemedAt: NOON + 1 }],
  });
  assert.deepEqual(decodeGame(JSON.stringify(valid)), valid);
});

test('version 1 progress upgrades: coins become points and retired coupons are refunded', () => {
  const v1 = {
    version: 1, demo: true, peak: true, claims: [{ id: 'postcard', cost: 60 }],
    runs: [{ id: 'old', walkId: 'shijo-yasaka', complete: false, bonus: 0, stamps: [
      { placeId: stops[0], mode: 'demo', coins: 15 }, { placeId: stops[1], mode: 'live', coins: 10 },
    ] }],
  };
  const upgraded = decodeGame(JSON.stringify(v1));
  assert.deepEqual(upgraded, {
    version: 3, demo: true, scenario: null, claims: [],
    runs: [{ id: 'old', walkId: 'shijo-yasaka', complete: false, bonus: 0, stamps: [
      { placeId: stops[0], mode: 'demo', points: 15, multiplier: 1.5 }, { placeId: stops[1], mode: 'live', points: 10, multiplier: 1 },
    ] }],
  });
  assert.equal(balance(upgraded), 25);
  assert.deepEqual(decodeGame(JSON.stringify({ ...v1, runs: [{ ...v1.runs[0], stamps: [{ placeId: stops[0], mode: 'demo', coins: -1 }] }] })), emptyGame);
});

test('walkStatus preserves completed status and full stamps across aborted replays', () => {
  assert.deepEqual(walkStatus(emptyGame, 'shijo-yasaka'), { status: 'available', stamps: 0, completedCount: 0 });

  let neverCompleted = stamp(start(emptyGame, 'early'), 'early', stops[0]);
  assert.deepEqual(walkStatus(neverCompleted, 'shijo-yasaka'), { status: 'active', stamps: 1, completedCount: 0 });
  neverCompleted = transition(neverCompleted, { type: 'stop', runId: 'early' });
  assert.deepEqual(walkStatus(neverCompleted, 'shijo-yasaka'), { status: 'stopped', stamps: 1, completedCount: 0 });

  let game = start(emptyGame, 'one');
  for (const stop of stops) game = stamp(game, 'one', stop);
  assert.deepEqual(walkStatus(game, 'shijo-yasaka'), { status: 'completed', stamps: 3, completedCount: 1 });

  game = stamp(start(game, 'two'), 'two', stops[0]);
  assert.deepEqual(walkStatus(game, 'shijo-yasaka'), { status: 'active', stamps: 1, completedCount: 1 });

  game = transition(game, { type: 'stop', runId: 'two' });
  assert.deepEqual(walkStatus(game, 'shijo-yasaka'), { status: 'completed', stamps: 3, completedCount: 1 });
});

test('version 2 progress upgrades: points stay, the retired transit claim is refunded, the off-peak switch is dropped', () => {
  const run = { id: 'old', walkId: 'shijo-yasaka', complete: false, bonus: 0, stamps: [{ placeId: stops[0], mode: 'demo', points: 20, multiplier: 2, at: NOON }] };
  const v2 = { version: 2, demo: false, offPeak: true, runs: [run], claims: [{ id: 'matcha', cost: 60, at: NOON }, { id: 'transit', cost: 120, at: NOON }] };
  const upgraded = decodeGame(JSON.stringify(v2));
  assert.deepEqual(upgraded, { version: 3, demo: false, scenario: null, runs: [run], claims: [{ id: 'matcha', cost: 60, at: NOON }] });
  assert.equal(balance(upgraded), -40);
  assert.deepEqual(decodeGame(JSON.stringify({ ...v2, offPeak: 'yes' })), emptyGame);
});

test('crowd levels default to unknown, never calm, when no sample exists', () => {
  assert.equal(sampleWalkCrowd([]), 'unknown');
  assert.equal(sampleWalkCrowd(['kawabata-riverside', 'sanjo-ohashi']), 'unknown');
  assert.equal(sampleWalkCrowd(['yasaka-west-view']), 'moderate');
  assert.equal(sampleWalkCrowd(['shijo-ohashi', 'yasaka-west-view']), 'busy');
});

test('voucherProjection tracks remaining check-ins, bonus scenarios, shortfalls, ready and all-claimed states', () => {
  // No active walk at 0 pts -> 60 pt gap to matcha
  const idle = voucherProjection(emptyGame);
  assert.equal(idle.status, 'no_walk');
  assert.equal(idle.target?.id, 'matcha');
  assert.equal(idle.shortfall, 60);

  // Start a standard 3-stop walk at 0 pts -> 3rd check-in unlocks 60-pt matcha
  const started = start(emptyGame, 'proj-1');
  const p0 = voucherProjection(started);
  assert.equal(p0.status, 'reachable_on_walk');
  assert.equal(p0.stopsNeeded, 3);
  assert.deepEqual(p0.segments.map(s => s.points), [10, 10, 40]);
  assert.deepEqual(p0.segments.map(s => s.unlocksTarget), [false, false, true]);

  // After 1st stamp (10 pts) -> 2 check-ins remaining
  const afterOne = stamp(started, 'proj-1', stops[0]);
  const p1 = voucherProjection(afterOne);
  assert.equal(p1.status, 'reachable_on_walk');
  assert.equal(p1.stopsNeeded, 2);

  // With bus-relief 2x scenario on shijo-yasaka after 1st stamp (10 pts): next stop +20 (30), last stop +50 (80)
  const withBonus = transition(afterOne, { type: 'scenario', kind: 'bus_relief' });
  const pb = voucherProjection(withBonus);
  assert.equal(pb.status, 'reachable_on_walk');
  assert.equal(pb.stopsNeeded, 2);
  assert.deepEqual(pb.segments.map(s => s.points), [20, 50]);

  // Unlock matcha (60), then at 0 pts start a walk -> max 60 pts falls 15 pts short of 75-pt tea latte
  let completed = afterOne;
  completed = stamp(completed, 'proj-1', stops[1]);
  completed = stamp(completed, 'proj-1', stops[2]);
  assert.equal(voucherProjection(completed).status, 'ready');
  const unlockedMatcha = unlock(completed);
  const secondWalk = start(unlockedMatcha, 'proj-2');
  const shortProj = voucherProjection(secondWalk);
  assert.equal(shortProj.status, 'short_after_walk');
  assert.equal(shortProj.target?.id, 'tea-latte');
  assert.equal(shortProj.shortfall, 15);

  // Claim every demo voucher -> all_claimed
  let rich = unlockedMatcha;
  for (let n = 3; n <= 13; n++) {
    rich = start(rich, `proj-${n}`);
    for (const s of stops) rich = stamp(rich, `proj-${n}`, s);
  }
  for (const id of ['tea-latte', 'mochi', 'sento', 'stationery', 'craft', 'postcards']) {
    rich = transition(rich, { type: 'unlock', id });
  }
  assert.equal(voucherProjection(rich).status, 'all_claimed');
});

test('60 m geographic fox halo scales around coordinates and 65 m GPS fix remains eligible for 75 m check-in', () => {
  const point = placeById(stops[0]).location;
  const ring = circlePolygon(point, 60, 32);
  assert.equal(ring.length, 33);
  assert.deepEqual(ring[0], ring[32]);
  for (const vertex of ring) {
    const d = distanceMeters(point, vertex);
    assert.ok(d > 58 && d < 62, `expected ~60 m, got ${d}`);
  }
  // At 65 m (outside the 60 m visual halo, inside the 75 m check-in radius), a fresh accurate fix is eligible.
  const now = Date.now();
  const at65m = {
    mode: 'live',
    gpsStatus: 'active',
    fix: { longitude: point[0], latitude: point[1] + 65 * 180 / (Math.PI * 6371000), accuracy: 15, timestamp: now },
  };
  assert.equal(liveEligible(at65m, point, now), true);
});

test('expired demo vouchers cannot be unlocked or redeemed past Kyoto-time expiry', () => {
  let game = start(emptyGame, 'exp-1');
  for (const s of stops) game = stamp(game, 'exp-1', s);
  const matcha = COUPONS.find(c => c.id === 'matcha');
  assert.ok(matcha && walkById('shijo-yasaka'));
  assert.equal(isCouponExpired(matcha, matcha.expiresAt - 1000), false);
  assert.equal(isCouponExpired(matcha, matcha.expiresAt + 1000), true);

  // Unlock fails after offer expiry
  assert.equal(transition(game, { type: 'unlock', id: 'matcha' }, matcha.expiresAt + 1000), game);

  // Unlock succeeds before expiry, then redeem fails once expired
  const unlocked = transition(game, { type: 'unlock', id: 'matcha' }, matcha.expiresAt - 60_000);
  assert.equal(unlocked.claims.length, 1);
  assert.equal(transition(unlocked, { type: 'redeem', id: 'matcha' }, matcha.expiresAt + 1000), unlocked);
});
