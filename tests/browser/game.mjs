import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const url = process.env.PHASE3_URL || process.env.PHASE2_URL || 'http://localhost:3000';
let browser;
before(async () => { browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] }); });
after(async () => { await browser?.close(); });
async function prepare(page) {
  await page.route('https://tiles.openfreemap.org/styles/liberty', route => route.fulfill({
    json: { version: 8, sources: {}, layers: [{ id: 'background', type: 'background' }] },
  }));
  await page.goto(url);
}
const copyFor = async lang => JSON.parse(await readFile(new URL(`../../src/locales/${lang}.json`, import.meta.url)));
const snapshot = page => page.evaluate(() => JSON.parse(localStorage.getItem('kyoto-ai-lab.progress.v1')));
for (const [lang, width] of [['en', 360], ['ja', 390]]) {
  test(`${lang} earns and spends coins, resumes after reload and resets only game data`, async () => {
    const context = await browser.newContext({ viewport: { width, height: 800 }, reducedMotion: lang === 'en' ? 'no-preference' : 'reduce' });
    const page = await context.newPage();
    page.setDefaultTimeout(8000);
    const copy = await copyFor(lang);
    const button = name => page.getByRole('button', { name, exact: true });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    try {
      await prepare(page);
      await button(lang === 'en' ? 'English' : '日本語').click();
      await page.locator('#nickname').fill('Aki');
      await button(copy.startExploring).click();
      await button(copy.navMissions).click();
      await button(copy.gameViewMap).first().click();
      await page.locator('.map-recommended').click();
      await button(copy.gameStartDemo).click();
      await button(copy.gameSimulate).click();
      await button(copy.navHome).click();
      await page.getByText(copy.gameBalance.replace('{coins}', '10'), { exact: true }).waitFor();
      await button(copy.navSettings).click();
      const otherLang = lang === 'en' ? 'ja' : 'en';
      const otherCopy = await copyFor(otherLang);
      await button(otherLang === 'en' ? 'English' : '日本語').click();
      await button(otherCopy.navHome).click();
      await page.getByText(otherCopy.gameBalance.replace('{coins}', '10'), { exact: true }).waitFor();
      await button(otherCopy.navSettings).click();
      await button(lang === 'en' ? 'English' : '日本語').click();
      await page.reload();
      await button(copy.gameMove).click();
      if (lang === 'en') {
        await button(copy.gamePause).click();
        await button(copy.gameContinue).click();
        await button(copy.gameResetLeg).click();
        assert.equal(await button(copy.gameSimulate).isDisabled(), true);
        await button(copy.gameMove).click();
      }
      await button(copy.gameSimulate).click();
      await button(copy.gameMove).click();
      await button(copy.gameSimulate).click();
      await page.getByRole('dialog').getByRole('button', { name: copy.navRewards }).click();
      await page.getByText(copy.gameBalance.replace('{coins}', '60'), { exact: true }).waitFor();
      const other = await page.context().newPage();
      await prepare(other);
      await other.getByRole('button', { name: copy.navRewards, exact: true }).click();
      const otherClaim = other.getByRole('button', { name: copy.gameClaim, exact: true });
      await otherClaim.waitFor();
      const claimButtons = await Promise.all([button(copy.gameClaim).elementHandle(), otherClaim.elementHandle()]);
      await Promise.all(claimButtons.map(handle => handle.evaluate(el => el.click())));
      await other.getByRole('button', { name: copy.gameClaimed, exact: true }).waitFor();
      await other.close();
      await button(copy.gameClaimed).waitFor();
      assert.equal((await snapshot(page)).claims.length, 1);
      await page.getByText(copy.gameBalance.replace('{coins}', '0'), { exact: true }).waitFor();
      await button(copy.navMissions).click();
      await page.getByText(copy.gameCompleted, { exact: true }).waitFor();
      if (lang === 'ja') {
        await button(copy.navSettings).click();
        await page.getByRole('checkbox').click();
        await page.getByRole('checkbox', { checked: true }).waitFor();
        await button(copy.navMissions).click();
        await button(copy.gameViewMap).first().click();
        await page.locator('.map-recommended').click();
        await button(copy.gameStartDemo).click();
        for (let i = 0; i < 3; i++) {
          if (i) await button(copy.gameMove).click();
          await button(copy.gameSimulate).click();
        }
        await page.getByRole('dialog').getByRole('button', { name: copy.navRewards }).click();
        await page.getByText(copy.gameBalance.replace('{coins}', '75'), { exact: true }).waitFor();
        assert.equal(await button(copy.gameClaimed).count(), 1);
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await button(copy.navSettings).click();
      await button(copy.gameReset).click();
      await button(copy.gameCancel).click();
      assert.equal((await snapshot(page)).runs.length, lang === 'ja' ? 2 : 1);
      await button(copy.gameReset).click();
      await button(copy.gameConfirm).click();
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
      await page.reload();
      await button(copy.navSettings).click();
      assert.equal(await page.locator('#settings-nickname').inputValue(), 'Aki');
      assert.equal(await page.locator('html').getAttribute('lang'), lang);
      assert.equal((await snapshot(page)).claims.length, 0);
      assert.equal((await snapshot(page)).runs.length, 0);
      assert.deepEqual(errors, []);
    } finally { await context.close(); }
  });
}

test('GPS check-in requires an explicit tap and an eligible live fix', async () => {
  const page = await browser.newPage({ viewport: { width: 430, height: 800 } });
  const copy = await copyFor('en');
  const button = name => page.getByRole('button', { name, exact: true });
  try {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'geolocation', { value: {
        watchPosition(callback) { window.reportFix = callback; return 42; }, clearWatch() {},
      } });
    });
    await prepare(page);
    await button(copy.startExploring).click();
    await page.locator('.map-list-button').click();
    await page.locator('dialog .map-route-option').first().click();
    await button(copy.gameStartLive).click();
    await button(copy.gameCheck).waitFor();
    assert.ok(await button(copy.gameCheck).isDisabled());
    const report = accuracy => page.evaluate(a => window.reportFix({
      timestamp: Date.now(), coords: { latitude: 35.00378, longitude: 135.76932, accuracy: a },
    }), accuracy);
    await report(101);
    assert.ok(await button(copy.gameCheck).isDisabled());
    await report(12);
    assert.equal((await snapshot(page)).runs[0].stamps.length, 0);
    await button(copy.gameCheck).click();
    await page.getByText(copy.gameStamped.replace('{coins}', '10')).waitFor();
    assert.equal((await snapshot(page)).runs[0].stamps[0].mode, 'live');
  } finally { await page.close(); }
});
