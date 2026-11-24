import assert from 'node:assert/strict';
import { test } from 'node:test';
import { keepsLandmarkLabels, landmarkFilter, LANDMARK_CLASSES, LARGER_LABEL_FACTOR, scaleTextSize, seasonParkColour, SEASON_PARK, ILLUSTRATED_PARK } from '../src/lib/map-looks.ts';
import { DEFAULT_MAP_PREFS, parseMapPrefs } from '../src/lib/map-prefs.ts';

test('scales plain and zoom-based text sizes and leaves other expressions alone', () => {
  assert.equal(scaleTextSize(12, 1.25), 15);
  assert.deepEqual(
    scaleTextSize(['interpolate', ['linear'], ['zoom'], 10, 11, 14, 14], 2),
    ['interpolate', ['linear'], ['zoom'], 10, 22, 14, 28],
  );
  assert.deepEqual(
    scaleTextSize(['step', ['zoom'], 9, 12, 11], 2),
    ['step', ['zoom'], 18, 12, 22],
  );
  const unknown = ['match', ['get', 'class'], 'city', 16, 10];
  assert.deepEqual(scaleTextSize(unknown, 2), unknown);
  assert.equal(scaleTextSize(undefined, 2), undefined);
});

test('the larger-label factor makes labels noticeably bigger but not huge', () => {
  assert.ok(LARGER_LABEL_FACTOR > 1.1 && LARGER_LABEL_FACTOR <= 1.5);
});

test('landmark filter keeps the layer filter and adds the landmark classes', () => {
  const landmarks = ['in', ['get', 'class'], ['literal', [...LANDMARK_CLASSES]]];
  assert.deepEqual(landmarkFilter(['==', 'rank', 1]), ['all', ['==', 'rank', 1], landmarks]);
  assert.deepEqual(landmarkFilter(undefined), ['all', ['has', 'class'], landmarks]);
  assert.ok(LANDMARK_CLASSES.includes('place_of_worship'));
});

test('only point-of-interest and place labels are kept in landmark mode', () => {
  assert.equal(keepsLandmarkLabels('poi'), true);
  assert.equal(keepsLandmarkLabels('place'), true);
  assert.equal(keepsLandmarkLabels('transportation_name'), false);
  assert.equal(keepsLandmarkLabels(undefined), false);
});

test('seasonal park colours follow the Kyoto season and fall back to the Illustrated colour', () => {
  assert.equal(seasonParkColour('sakura', true), SEASON_PARK.sakura);
  assert.equal(seasonParkColour('momiji', true), SEASON_PARK.momiji);
  assert.equal(seasonParkColour('sparkle', true), ILLUSTRATED_PARK);
  assert.equal(seasonParkColour('sakura', false), ILLUSTRATED_PARK);
});

test('preferences default to the current look and reject bad saved values', () => {
  assert.deepEqual(parseMapPrefs(null), DEFAULT_MAP_PREFS);
  assert.deepEqual(parseMapPrefs('not json'), DEFAULT_MAP_PREFS);
  assert.deepEqual(parseMapPrefs('[]'), DEFAULT_MAP_PREFS);
  assert.deepEqual(parseMapPrefs(JSON.stringify({ flatMap: true, largerLabels: 'yes' })), { ...DEFAULT_MAP_PREFS, flatMap: true });
});
