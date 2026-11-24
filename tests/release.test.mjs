import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { previewControlsEnabled } from '../src/config/environment.ts';
import { etiquetteZoneAt, kyotoDay, shouldShowEtiquette, ETIQUETTE_ZONES } from '../src/lib/etiquette.ts';
import { CURATED_PLACES } from '../src/data/kyoto-walks.ts';

const css = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8');

test('simulation controls exist only in development or explicit preview builds', () => {
  assert.equal(previewControlsEnabled('development', undefined), true);
  assert.equal(previewControlsEnabled('test', undefined), true);
  assert.equal(previewControlsEnabled('production', '1'), true);
  assert.equal(previewControlsEnabled('production', undefined), false);
  assert.equal(previewControlsEnabled('production', 'true'), false);
  assert.equal(previewControlsEnabled('production', '0'), false);
});

test('etiquette zones trigger near their stop, once per Kyoto day', () => {
  const gate = CURATED_PLACES.find(place => place.id === 'yasaka-west-view').location;
  assert.equal(etiquetteZoneAt(gate).id, 'yasaka-gate');
  assert.equal(etiquetteZoneAt(null), undefined);
  assert.equal(etiquetteZoneAt([135.7600, 35.0100]), undefined);
  for (const zone of ETIQUETTE_ZONES) {
    assert.ok(CURATED_PLACES.some(place => place.id === zone.placeId), zone.id);
    assert.ok(zone.message.en && zone.message.ja, zone.id);
  }
  // 23:30 on the 24th and 00:30 on the 25th in Kyoto are different days, whatever the device zone.
  assert.equal(kyotoDay(Date.UTC(2026, 10, 24, 14, 30)), '2026-11-24');
  assert.equal(kyotoDay(Date.UTC(2026, 10, 24, 15, 30)), '2026-11-25');
  assert.equal(shouldShowEtiquette('yasaka-gate', {}, '2026-11-24'), true);
  assert.equal(shouldShowEtiquette('yasaka-gate', { 'yasaka-gate': '2026-11-24' }, '2026-11-24'), false);
  assert.equal(shouldShowEtiquette('yasaka-gate', { 'yasaka-gate': '2026-11-24' }, '2026-11-25'), true);
});

test('text colours meet WCAG AA and no text is smaller than 12px', () => {
  const token = name => css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, 'i'))[1];
  const luminance = hex => {
    const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const ratio = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  for (const text of ['ink-sumi', 'ink-slate', 'ink-muted']) {
    for (const surface of ['bg-washi', 'bg-ivory', 'bg-stone']) {
      assert.ok(ratio(token(text), token(surface)) >= 4.5, `${text} on ${surface}: ${ratio(token(text), token(surface)).toFixed(2)}`);
    }
  }
  const sizes = [...css.matchAll(/font-size:\s*(\d+)px/g)].map(match => Number(match[1])).filter(size => size !== 0);
  assert.ok(sizes.every(size => size >= 12), `smallest font-size: ${Math.min(...sizes)}px`);
});
