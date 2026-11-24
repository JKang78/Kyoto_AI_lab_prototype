import assert from 'node:assert/strict';
import test from 'node:test';
import { placeWalkTime } from '../src/lib/place-walk-time.ts';
import { CURATED_PLACES, CURATED_WALKS, ROUTE_SOURCES } from '../src/data/kyoto-walks.ts';
import { SAMPLE_CONGESTION_CUES } from '../src/data/sample-congestion.ts';

test('walk stops lie on the stored line in itinerary order and all source references resolve', () => {
  const sources = new Set(ROUTE_SOURCES.map(source => source.id));
  const places = new Map(CURATED_PLACES.map(place => [place.id, place]));
  for (const item of [...CURATED_PLACES, ...CURATED_WALKS]) {
    assert.ok(item.sourceIds.length && item.sourceIds.every(id => sources.has(id)), item.id);
  }
  for (const cue of SAMPLE_CONGESTION_CUES) assert.ok(places.has(cue.placeId), cue.id);
  for (const walk of CURATED_WALKS) {
    let previous = -1;
    for (const id of walk.placeIds) {
      const [lon, lat] = places.get(id).location;
      const index = walk.geometry.coordinates.findIndex(([x, y], i) =>
        i > previous && Math.abs(x - lon) < 0.00002 && Math.abs(y - lat) < 0.00002);
      assert.ok(index > previous, `${walk.id}: ${id} is missing or out of order`);
      previous = index;
    }
  }
});

test('place estimates follow the stored pedestrian path, including positions between vertices', () => {
  const walk = { ...CURATED_WALKS[0], estimatedMinutes: 10, geometry: {
    type: 'LineString', coordinates: [[135, 35], [135, 35.005], [135, 35.01]],
  } };
  const place = { ...CURATED_PLACES[0], location: [135, 35.01] };
  assert.deepEqual(placeWalkTime(walk, place, [135, 35.0027]), { fromPosition: true, minutes: 8 });
  assert.deepEqual(placeWalkTime(walk, place, place.location), { fromPosition: true, minutes: 0 });
  assert.deepEqual(placeWalkTime(walk, place, null), { fromPosition: false, minutes: 10 });
  assert.deepEqual(placeWalkTime(walk, place, [135.01, 35.01]), { fromPosition: false, minutes: 10 });
  const first = { ...place, location: walk.geometry.coordinates[0] };
  assert.deepEqual(placeWalkTime(walk, first, [135, 35.0077]), { fromPosition: true, minutes: 8 });
});
