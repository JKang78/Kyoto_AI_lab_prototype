import assert from 'node:assert/strict';
import test from 'node:test';
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
