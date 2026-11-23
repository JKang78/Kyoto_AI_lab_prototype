import assert from 'node:assert/strict';
import test from 'node:test';
import { GAME } from '../src/config/game.ts';
import { emptyGame, balance, activeRun, transition, liveEligible, decodeGame, placeById, walkStatus } from '../src/lib/game.ts';

const demo = { mode: 'demo', gpsStatus: 'off', fix: null };
const stops = ['shijo-kawaramachi', 'shijo-ohashi', 'yasaka-west-view'];
const start = (g, id) => transition(g, { type: 'start', walkId: 'shijo-yasaka', id });
const stamp = (g, id, placeId, location = demo) => transition(g, { type: 'collect', runId: id, placeId, location });
const claim = game => transition(game, { type: 'claim', id: 'postcard' });

test('two walk instances, stale events, duplicate claims and reset', () => {
  let game = start(emptyGame, 'one');
  assert.equal(start(game, 'accidental-second-start'), game);
  assert.equal(claim(game), game);
  assert.equal(stamp(game, 'one', stops[1]), game);
  for (const stop of stops) {
    game = stamp(game, 'one', stop);
    assert.equal(stamp(game, 'one', stop), game);
  }
  assert.equal(activeRun(game), undefined);
  assert.equal(balance(game), 60);
  game = claim(game);
  assert.equal(balance(game), 0);
  game = start(JSON.parse(JSON.stringify(game)), 'two');
  assert.equal(stamp(game, 'one', stops[0]), game);
  for (const stop of stops) game = stamp(game, 'two', stop);
  assert.equal(balance(game), 60);
  assert.equal(claim(game), game);
  assert.equal(game.claims.length, 1);
  assert.deepEqual(transition(game, { type: 'reset' }), emptyGame);
});

test('live eligibility requires an active fresh fix, with inclusive thresholds', () => {
  const point = placeById(stops[0]).location;
  const now = Date.now();
  const fix = { timestamp: now, accuracy: 50, latitude: point[1], longitude: point[0] };
  const live = { mode: 'live', gpsStatus: 'active', fix };
  assert.ok(liveEligible(live, point, now + 30_000));
  for (const location of [demo, {...live, gpsStatus: 'paused'}, {...live, gpsStatus: 'denied'},
    {...live, fix: null}, {...live, fix: {...fix, accuracy: 51}}, {...live, fix: {...fix, timestamp: now - 30_001}},
    {...live, fix: {...fix, latitude: fix.latitude + .001}}]) {
    assert.equal(liveEligible(location, point, now), false);
  }
  const peak = transition(start(emptyGame, 'walk'), { type: 'peak', enabled: true });
  assert.equal(balance(stamp(peak, 'walk', stops[0])), 15);
  const actual = stamp(peak, 'walk', stops[0], live);
  assert.equal(balance(actual), 10);
  assert.deepEqual(actual.runs[0].stamps[0], { placeId: stops[0], mode: 'live', coins: 10 });
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
  const baseRun = (id, overrides = {}) => ({
    id,
    walkId: 'shijo-yasaka',
    stamps: [{ placeId: stops[0], mode: 'demo', coins: 10 }],
    complete: false,
    bonus: 0,
    ...overrides,
  });
  const baseGame = (overrides = {}) => ({
    version: 1,
    demo: true,
    runs: [],
    claims: [],
    peak: false,
    ...overrides,
  });

  for (const raw of [null, '', '{bad', 'null', '[]', '123', '"str"']) {
    assert.deepEqual(decodeGame(raw), emptyGame);
  }
  const invalidPayloads = [
    baseGame({ runs: {} }),
    baseGame({ claims: null }),
    baseGame({ runs: [null] }),
    baseGame({ claims: [null] }),
    baseGame({ runs: [baseRun('r1', { stamps: [null] })] }),
    baseGame({ runs: [baseRun('r1', { stamps: [{ placeId: stops[0], mode: 'demo', coins: -1 }] })] }),
    baseGame({ runs: [baseRun('r1', { bonus: -5 })] }),
    baseGame({ claims: [{ id: 'postcard', cost: -1 }] }),
    baseGame({ claims: [{ id: 'postcard', cost: 60 }, { id: 'postcard', cost: 60 }] }),
    baseGame({ runs: [baseRun('dup', { stopped: true }), baseRun('dup')] }),
    baseGame({
      runs: [{
        id: 'both',
        walkId: 'shijo-yasaka',
        stamps: stops.map(placeId => ({ placeId, mode: 'demo', coins: 10 })),
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
      {
        id: 'done',
        walkId: 'shijo-yasaka',
        stamps: stops.map(placeId => ({ placeId, mode: 'demo', coins: 10 })),
        complete: true,
        bonus: 30,
      },
      baseRun('stopped-early', { stopped: true }),
      baseRun('active-tail'),
    ],
    claims: [{ id: 'postcard', cost: 60 }],
  });
  assert.deepEqual(decodeGame(JSON.stringify(valid)), valid);
});

test('walkStatus preserves completed status and full stamps across aborted replays', () => {
  assert.deepEqual(walkStatus(emptyGame, 'shijo-yasaka'), {
    status: 'available',
    stamps: 0,
    completedCount: 0,
  });

  // Never-completed run that is stopped early shows "stopped" with partial stamps.
  let neverCompleted = stamp(start(emptyGame, 'early'), 'early', stops[0]);
  assert.deepEqual(walkStatus(neverCompleted, 'shijo-yasaka'), {
    status: 'active',
    stamps: 1,
    completedCount: 0,
  });
  neverCompleted = transition(neverCompleted, { type: 'stop', runId: 'early' });
  assert.deepEqual(walkStatus(neverCompleted, 'shijo-yasaka'), {
    status: 'stopped',
    stamps: 1,
    completedCount: 0,
  });

  // Completed walk keeps "completed" + full stamp count even after a later stopped replay.
  let game = start(emptyGame, 'one');
  for (const stop of stops) game = stamp(game, 'one', stop);
  assert.deepEqual(walkStatus(game, 'shijo-yasaka'), {
    status: 'completed',
    stamps: 3,
    completedCount: 1,
  });

  game = stamp(start(game, 'two'), 'two', stops[0]);
  assert.deepEqual(walkStatus(game, 'shijo-yasaka'), {
    status: 'active',
    stamps: 1,
    completedCount: 1,
  });

  game = transition(game, { type: 'stop', runId: 'two' });
  assert.deepEqual(walkStatus(game, 'shijo-yasaka'), {
    status: 'completed',
    stamps: 3,
    completedCount: 1,
  });
});
