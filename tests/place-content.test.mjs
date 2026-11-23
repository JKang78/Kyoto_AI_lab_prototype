import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { CURATED_PLACES } from '../src/data/kyoto-walks.ts';
import { PLACE_STORIES } from '../src/data/place-stories.ts';
import { DEMO_TRAIL } from '../src/config/game.ts';

const photos = JSON.parse(readFileSync(new URL('../src/data/place-photos.json', import.meta.url)));
const glyphs = readFileSync(new URL('../src/components/glyphs.tsx', import.meta.url), 'utf8');

test('every place has a sourced, bilingual draft story', () => {
  for (const place of CURATED_PLACES) {
    const story = PLACE_STORIES[place.id];
    assert.ok(story, place.id);
    assert.equal(story.status, 'draft', `${place.id} must stay a draft until local review`);
    assert.ok(story.text.en.length > 40 && story.text.ja.length > 20, place.id);
    assert.ok(story.sources.length >= 1 && story.sources.every(source => source.url.startsWith('https://')), place.id);
  }
  assert.deepEqual(Object.keys(PLACE_STORIES).sort(), CURATED_PLACES.map(place => place.id).sort());
});

test('place photos are openly licensed, credited and present on disk', () => {
  for (const [placeId, photo] of Object.entries(photos)) {
    assert.ok(CURATED_PLACES.some(place => place.id === placeId), placeId);
    assert.match(photo.license, /^(CC BY(-SA)? [0-9.]+|CC0|Public domain)$/);
    assert.ok(photo.author && photo.sourceUrl.startsWith('https://commons.wikimedia.org/'), placeId);
    assert.ok(existsSync(new URL(`../public${photo.src}`, import.meta.url)), photo.src);
  }
  // A place without a suitable licensed photo shows a placeholder rather than a misleading image.
  assert.equal(photos['chionin-south-gate-path'], undefined);
});

test('every place has its own seal drawing, and the demo trail is reachable', () => {
  for (const place of CURATED_PLACES) assert.ok(glyphs.includes(`"${place.id}": '<`), place.id);
  assert.ok(DEMO_TRAIL.goal > 0 && DEMO_TRAIL.goal <= CURATED_PLACES.length);
});
