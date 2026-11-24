import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const url = process.env.PHASE3_URL || process.env.PHASE2_URL || 'http://localhost:3000';
const style = { version: 8, sources: {}, layers: [{ id: 'background', type: 'background' }] };
// Fixed time so dates in receipts and logs are stable.
const NOON = new Date('2026-11-24T03:00:00Z');
let browser;
before(async () => { browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] }); });
after(async () => { await browser?.close(); });

for (const locale of ['en', 'ja']) {
  const copy = JSON.parse(await readFile(new URL(`../../src/locales/${locale}.json`, import.meta.url)));
  for (const width of [360, 390, 430]) {
    test(`${locale} discovery, map recovery and route continuity at ${width}px`, async () => {
      const page = await browser.newPage({ viewport: { width, height: 800 }, reducedMotion: 'reduce' });
      await page.clock.setFixedTime(NOON);
      page.setDefaultTimeout(8000);
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      let failStyle = true;
      // Exercise the real MapLibre renderer, worker, fixture layers and DOM pins
      // with a controlled style so this test also runs during provider outages.
      await page.route('https://tiles.openfreemap.org/styles/liberty', (route) =>
        failStyle ? route.abort() : route.fulfill({ json: style }));
      const button = (name) => page.getByRole('button', { name, exact: true });
      const sheet = page.locator('.snap-sheet');
      try {
        await page.goto(url);
        await button(locale === 'en' ? 'English' : '日本語').click();
        await button(copy.startExploring).click();
        await page.locator('.home-screen').waitFor();
        await button(copy.navExplore).click();
        await button(copy.mapRetry).waitFor();
        // The stored walks stay browsable while the basemap is down.
        await button(copy.mapStoredWalks).click();
        await page.locator('.snap-sheet[data-snap="half"]').waitFor();
        assert.equal(await sheet.locator('.route-card').count(), 3);
        await sheet.getByRole('button', { name: copy.routePreview }).first().click();
        await page.locator('.snap-sheet[data-snap="full"]').waitFor();
        assert.equal(await sheet.locator('.stop-timeline li').count(), 3);
        await sheet.locator('.stop-timeline button').first().click();
        await sheet.getByRole('link', { name: copy.placeMapSource }).waitFor();
        await button(copy.routesDetails).click();
        await button(copy.routesBack).click();
        assert.equal(await sheet.locator('.route-card').count(), 3);
        assert.equal(await page.getByRole('dialog').count(), 0);

        failStyle = false;
        await button(copy.mapRetry).click();
        await page.locator('.map-place-pin').first().waitFor();
        const search = page.getByRole('searchbox');
        await search.fill(locale === 'en' ? 'river within 9 minutes' : '9分以内の川沿い');
        assert.equal(await sheet.locator('.route-card').count(), 1);
        const walk = await sheet.locator('.route-card h3').innerText();
        await sheet.getByRole('button', { name: copy.routePreview }).click();
        assert.equal(await sheet.locator('.sheet-title').evaluate(el => el.firstChild.textContent), walk);

        // Search, the selected walk and its pins survive a tab switch.
        await button(copy.navMe).click();
        await button(copy.navExplore).click();
        await page.locator('.map-place-pin[data-place-id="kawabata-riverside"]').waitFor();
        assert.equal(await page.getByRole('searchbox').inputValue(), locale === 'en' ? 'river within 9 minutes' : '9分以内の川沿い');
        assert.equal(await sheet.locator('.sheet-title').evaluate(el => el.firstChild.textContent), walk);
        assert.equal(await page.locator('.map-place-pin:visible').count(), 3);

        // The sheet handle is keyboard operable and cycles through the snap points.
        const handle = page.locator('.snap-sheet-handle');
        assert.equal(await handle.getAttribute('aria-label'), copy.sheetCollapse);
        await handle.click();
        await page.locator('.snap-sheet[data-snap="peek"]').waitFor();
        await handle.focus();
        await page.keyboard.press('Enter');
        await page.locator('.snap-sheet[data-snap="half"]').waitFor();

        // Crowd info pairs colour with a shape and text, and is labelled as a sample.
        await button(copy.crowdInfo).click();
        const legend = page.locator('.crowd-legend');
        assert.deepEqual(await legend.locator('.crowd-badge').allTextContents(), [`●${copy.crowdCalm}`, `▲${copy.crowdModerate}`, `■${copy.crowdBusy}`, `?${copy.crowdUnknown}`]);
        await legend.getByText(copy.crowdProvenance).waitFor();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        assert.deepEqual(errors, []);
      } finally {
        await page.close();
      }
    });
  }
}

test('keeping a selected route never resumes GPS after leaving Explore', async () => {
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
    await page.getByRole('button', { name: 'Explore', exact: true }).click();
    await page.getByRole('button', { name: 'Use My Location', exact: true }).click();
    await page.getByRole('button', { name: 'Expand walk panel' }).click();
    await page.getByRole('button', { name: 'Preview route' }).first().click();
    await page.getByRole('button', { name: 'Missions', exact: true }).click();
    await page.getByRole('button', { name: 'Explore', exact: true }).click();
    await page.locator('.map-rail').waitFor();
    assert.ok(await page.locator('.sheet-title').isVisible());
    assert.deepEqual(await page.evaluate(() => window.gpsCalls), ['start', 27]);
  } finally {
    await page.close();
  }
});
