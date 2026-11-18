import assert from 'node:assert/strict';
import test from 'node:test';
import { CURATED_PLACES, CURATED_WALKS } from '../src/data/kyoto-walks.ts';
import { discoverRoutes } from '../src/lib/route-discovery.ts';

const find = (query, filter = null) => discoverRoutes(query, filter, CURATED_WALKS, CURATED_PLACES);
const ids = (result) => result.suggestions.map(({ walk }) => walk.id);

test('English and Japanese theme plus time prompts select stored pedestrian walks', () => {
  assert.deepEqual(ids(find('river under 10 minutes')), ['kamo-riverside']);
  assert.deepEqual(ids(find('10分以内の川沿い')), ['kamo-riverside']);
  assert.equal(find('river under 10 minutes').suggestions[0].reason, 'theme');
});

test('place names find walks sharing a mapped stop', () => {
  assert.deepEqual(ids(find('四条大橋')).sort(), ['kamo-riverside', 'shijo-yasaka']);
  assert.deepEqual(ids(find('10分以内に四条大橋へ')), ['kamo-riverside']);
  assert.deepEqual(ids(find('Maruyama')), ['yasaka-maruyama']);
});

test('unsupported or impossible requests are labeled as alternatives', () => {
  for (const query of ['quiet culture walk', 'cafés and local shops', 'wheelchair river walk', 'dog-friendly river walk', 'ベビーカーで川沿い', 'under 5 minutes', 'unknown place']) {
    const result = find(query);
    assert.equal(result.fallback, true, query);
    assert.equal(result.suggestions.length, 3, query);
    assert.ok(result.suggestions.every(({ reason }) => reason === 'available'), query);
  }
});

test('unsupported category chips stay empty instead of claiming a match', () => {
  assert.deepEqual(ids(find('', 'cafes')), []);
  assert.deepEqual(ids(find('', 'bike')), []);
  assert.deepEqual(ids(find('', 'park')), ['yasaka-maruyama']);
});
