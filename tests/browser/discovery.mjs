import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const url = process.env.PHASE2_URL || 'http://localhost:3000';
const style = { version: 8, sources: {}, layers: [{ id: 'background', type: 'background' }] };
let browser;
before(async () => { browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] }); });
after(async () => { await browser?.close(); });

for (const locale of ['en', 'ja']) {
  const copy = JSON.parse(await readFile(new URL(`../../src/locales/${locale}.json`, import.meta.url)));
  for (const width of [360, 390, 430]) {
    test(`${locale} discovery, map recovery and route continuity at ${width}px`, async () => {
      const page = await browser.newPage({ viewport: { width, height: 800 }, reducedMotion: 'reduce' });
      page.setDefaultTimeout(8000);
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      let failStyle = true;
      // Exercise the real MapLibre renderer, worker, fixture layers and DOM pins
      // with a controlled style so this test also runs during provider outages.
      await page.route('https://tiles.openfreemap.org/styles/liberty', (route) =>
        failStyle ? route.abort() : route.fulfill({ json: style }));
      const button = (name) => page.getByRole('button', { name, exact: true });
      const dialog = page.getByRole('dialog');
      try {
        await page.goto(url);
        await button(locale === 'en' ? 'English' : '日本語').click();
        await button(copy.startExploring).click();
        await button(copy.mapRetry).waitFor();
        await button(copy.mapStoredWalks).click();
        assert.equal(await dialog.locator('.map-route-option').count(), 3);
        await dialog.locator('.map-route-option').first().click();
        await button(copy.routesSeeStops).click();
        await dialog.locator('.route-place-card').first().click();
        await dialog.getByRole('link', { name: copy.placeMapSource }).waitFor();
        await button(copy.placeBackToStops).click();
        await page.keyboard.press('Escape');
        assert.equal(await button(copy.mapStoredWalks).evaluate(el => el === document.activeElement), true);

        failStyle = false;
        await button(copy.mapRetry).click();
        const search = page.getByRole('searchbox');
        await search.fill(locale === 'en' ? 'river within 9 minutes' : '9分以内の川沿い');
        const result = page.locator('.map-search-results .map-route-option');
        assert.equal(await result.count(), 1);
        await result.click();
        const walk = await dialog.getByRole('heading', { level: 2 }).innerText();
        await button(copy.close).click();
        await button(copy.navSettings).click();
        await button(copy.navMap).click();
        await page.locator('.map-place-pin[data-place-id="kawabata-riverside"]').waitFor();
        assert.equal(await page.locator('.map-selected-callout strong').innerText(), walk);
        assert.equal(await page.locator('.map-place-pin:visible').count(), 3);
        await button(copy.mapListButton).click();
        assert.equal(await dialog.locator('.route-place-card').count(), 3);
        assert.equal(await dialog.locator('h2').evaluate(el => el === document.activeElement), true);
        assert.ok(await dialog.evaluate(el => el.matches(':modal')));
        await page.locator('nav button').first().evaluate(el => el.focus());
        assert.ok(await dialog.evaluate(el => el.contains(document.activeElement)));
        await page.keyboard.press('Tab');
        assert.equal(await button(copy.close).evaluate(el => el === document.activeElement), true);
        await dialog.locator('.route-place-card').nth(1).click();
        await button(copy.placeBackToStops).click();
        await dialog.getByRole('button', { name: copy.routesBack, exact: true }).click();
        assert.equal(await dialog.locator('.map-route-option').count(), 3);
        await page.keyboard.press('Escape');
        assert.equal(await button(copy.mapListButton).evaluate(el => el === document.activeElement), true);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        assert.deepEqual(errors, []);
      } finally {
        await page.close();
      }
    });
  }
}

test('keeping a selected route never resumes GPS after leaving Map', async () => {
  const page = await browser.newPage();
  try {
    await page.route('https://tiles.openfreemap.org/styles/liberty', route => route.fulfill({ json: style }));
    await page.addInitScript(() => {
      window.gpsCalls = [];
      Object.defineProperty(navigator, 'geolocation', { value: {
        watchPosition() { window.gpsCalls.push('start'); return 27; },
        clearWatch(id) { window.gpsCalls.push(id); },
      } });
    });
    await page.goto(url);
    await page.getByRole('button', { name: 'Start exploring', exact: true }).click();
    const gps = page.getByRole('button', { name: 'Use My Location', exact: true });
    await gps.click();
    await page.locator('.map-list-button').click();
    await page.locator('dialog .map-route-option').first().click();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Home', exact: true }).click();
    await page.getByRole('button', { name: 'Map', exact: true }).click();
    await page.locator('.map-congestion-legend').waitFor();
    assert.ok(await page.locator('.map-selected-callout').isVisible());
    assert.deepEqual(await page.evaluate(() => window.gpsCalls), ['start', 27]);
  } finally {
    await page.close();
  }
});
