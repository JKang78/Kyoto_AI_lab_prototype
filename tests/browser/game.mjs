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
      await button(copy.gameResume).click();
      await button(copy.gameMove).waitFor();
      assert.equal(await page.getByRole('searchbox').count(), 0);
      await button(copy.locationTools).click();
      await page.getByRole('dialog').getByRole('button', { name: copy.locationUseMyLocation }).waitFor();
      await button(copy.close).click();
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
      await other.getByText(copy.gameClaimed, { exact: true }).waitFor();
      await other.close();
      await page.getByText(copy.gameClaimed, { exact: true }).waitFor();
      assert.equal((await snapshot(page)).claims.length, 1);
      await page.getByText(copy.gameBalance.replace('{coins}', '0'), { exact: true }).waitFor();
      const claimedStatus = page.locator('[data-coupon-state="claimed"]');
      const lockedStatus = page.locator('[data-coupon-state="locked"]').first();
      assert.equal(await claimedStatus.count(), 1);
      assert.equal(await lockedStatus.innerText(), copy.gameNeed.replace('{coins}', '100'));
      assert.equal(await button(copy.gameClaim).count(), 0);
      assert.notEqual(await claimedStatus.evaluate(el => getComputedStyle(el).backgroundColor),
        await lockedStatus.evaluate(el => getComputedStyle(el).backgroundColor));
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
        assert.equal(await page.getByText(copy.gameClaimed, { exact: true }).count(), 1);
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
    const report = (accuracy, offsetMs = 0) => page.evaluate(({ a, offset }) => window.reportFix({
      timestamp: Date.now() + offset, coords: { latitude: 35.00378, longitude: 135.76932, accuracy: a },
    }), { a: accuracy, offset: offsetMs });
    await report(101);
    assert.ok(await button(copy.gameCheck).isDisabled());
    await report(12, 60_000);
    assert.ok(await button(copy.gameCheck).isDisabled());
    await report(12, 300);
    assert.equal(await button(copy.gameCheck).isDisabled(), false);
    assert.equal((await snapshot(page)).runs[0].stamps.length, 0);
    await button(copy.gameCheck).click();
    await page.getByText(copy.gameStamped.replace('{coins}', '10')).waitFor();
    assert.equal((await snapshot(page)).runs[0].stamps[0].mode, 'live');
  } finally { await page.close(); }
});

test('aborted replay preserves completed mission badge and full stamp book', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 800 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const copy = await copyFor('en');
  const button = name => page.getByRole('button', { name, exact: true });
  try {
    await prepare(page);
    await button(copy.startExploring).click();
    await page.locator('.map-list-button').click();
    await page.locator('dialog .map-route-option').first().click();
    await button(copy.gameStartDemo).click();
    for (let i = 0; i < 3; i++) {
      if (i) await button(copy.gameMove).click();
      await button(copy.gameSimulate).click();
    }
    await page.getByRole('dialog').getByRole('button', { name: copy.close }).click();
    await page.locator('.map-recommended').click();
    await button(copy.gameStartDemo).click();
    await button(copy.gameSimulate).click();
    await page.locator('.map-recommended').click();
    await button(copy.gameStopWalk).click();
    await page.getByRole('dialog').getByRole('button', { name: copy.gameStopWalk, exact: true }).click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    await button(copy.navMissions).click();
    const firstCard = page.locator('.game-screen .ui-card').first();
    await firstCard.getByText(copy.gameCompleted, { exact: true }).waitFor();
    assert.equal(await firstCard.getByText(copy.gameStopped, { exact: true }).count(), 0);
    const marks = await firstCard.locator('.stamp-book li span').allTextContents();
    assert.deepEqual(marks, ['✓', '✓', '✓']);
  } finally { await context.close(); }
});

test('multi-tab Demo Mode stays synchronized on toggle, reset, and cross-tab activation', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 800 }, reducedMotion: 'reduce' });
  await context.addInitScript(() => {
    window.__watchCleared = 0;
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        watchPosition() { return 42; },
        clearWatch() { window.__watchCleared += 1; },
      },
    });
  });
  const tabA = await context.newPage();
  const tabB = await context.newPage();
  tabA.setDefaultTimeout(8000);
  tabB.setDefaultTimeout(8000);
  const copy = await copyFor('en');
  try {
    await prepare(tabA);
    await tabA.getByRole('button', { name: copy.startExploring, exact: true }).click();
    await tabA.locator('.map-congestion-legend').waitFor();
    const demoBtnA = tabA.getByRole('button', { name: copy.locationExploreDemo, exact: true });
    const liveBtnA = tabA.getByRole('button', { name: copy.locationUseMyLocation, exact: true });
    const statusCalloutA = tabA.locator('.map-intro-callout');

    await demoBtnA.click();
    await tabA.locator('button[aria-pressed="true"]', { hasText: copy.locationExploreDemo }).waitFor();

    await prepare(tabB);
    await tabB.getByRole('button', { name: copy.navSettings, exact: true }).click();
    const demoSwitchB = tabB.getByRole('switch', { name: copy.locationSettingsDemoSwitch });
    await demoSwitchB.waitFor();
    assert.equal(await demoSwitchB.getAttribute('aria-checked'), 'true');
    await demoSwitchB.click();
    await tabB.locator('[role="switch"][aria-checked="false"]', { hasText: copy.locationSettingsDemoSwitch }).waitFor();

    await tabA.locator('button[aria-pressed="false"]', { hasText: copy.locationExploreDemo }).waitFor();
    await statusCalloutA.getByText(copy.locationStatusOff).waitFor();

    await demoBtnA.click();
    await tabA.locator('button[aria-pressed="true"]', { hasText: copy.locationExploreDemo }).waitFor();
    await tabB.getByRole('button', { name: copy.gameReset, exact: true }).click();
    await tabB.getByRole('button', { name: copy.gameConfirm, exact: true }).click();
    await tabB.getByRole('dialog').waitFor({ state: 'hidden' });

    await tabA.locator('button[aria-pressed="false"]', { hasText: copy.locationExploreDemo }).waitFor();
    await statusCalloutA.getByText(copy.locationStatusOff).waitFor();

    await liveBtnA.click();
    await tabA.locator('button[aria-pressed="true"]', { hasText: copy.locationUseMyLocation }).waitFor();
    await demoSwitchB.click();
    await tabA.locator('button[aria-pressed="true"]', { hasText: copy.locationExploreDemo }).waitFor();
    assert.equal(await liveBtnA.getAttribute('aria-pressed'), 'false');
    assert.ok(await tabA.evaluate(() => window.__watchCleared > 0));

    // Off-Map-tab sync: live GPS paused on Settings must reset to unselected when Demo Mode cycles ON -> OFF in Tab B
    await demoSwitchB.click();
    await tabA.locator('button[aria-pressed="false"]', { hasText: copy.locationExploreDemo }).waitFor();
    await liveBtnA.click();
    await tabA.locator('button[aria-pressed="true"]', { hasText: copy.locationUseMyLocation }).waitFor();
    await tabA.getByRole('button', { name: copy.navSettings, exact: true }).click();
    const locationCardA = tabA.locator('.location-settings-status');
    await locationCardA.getByText(copy.locationStatusPaused, { exact: true }).waitFor();

    await demoSwitchB.click();
    await locationCardA.getByText(copy.locationModeDemo, { exact: true }).waitFor();
    await locationCardA.getByText(copy.locationStatusDemo, { exact: true }).waitFor();

    await demoSwitchB.click();
    await locationCardA.getByText(copy.locationStatusOff, { exact: true }).waitFor();
    await locationCardA.getByText(copy.locationModeUnselected, { exact: true }).waitFor();
    assert.equal(await locationCardA.getByText(copy.locationStatusPaused, { exact: true }).count(), 0);
    assert.equal(await locationCardA.getByText(copy.locationModeLive, { exact: true }).count(), 0);
  } finally { await context.close(); }
});

test('Settings progress switch meets 44px touch target and reset dialog actions have flex gap', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 800 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(8000);
  const copy = await copyFor('en');
  const button = name => page.getByRole('button', { name, exact: true });
  try {
    await prepare(page);
    await button(copy.startExploring).click();
    await button(copy.navSettings).click();

    const switchRow = page.locator('.settings-switch');
    const checkbox = page.getByRole('checkbox');
    await switchRow.waitFor();
    const rowBox = await switchRow.boundingBox();
    const inputBox = await checkbox.boundingBox();
    assert.ok(rowBox && rowBox.width >= 44 && rowBox.height >= 44);
    assert.ok(inputBox && inputBox.width >= 44 && inputBox.height >= 44);

    await checkbox.click();
    await page.getByRole('checkbox', { checked: true }).waitFor();
    assert.equal(await switchRow.getAttribute('data-checked'), 'true');
    await checkbox.click();
    await page.getByRole('checkbox', { checked: false }).waitFor();

    await button(copy.gameReset).click();
    const actions = page.locator('dialog .game-actions');
    await actions.waitFor();
    const gap = await actions.evaluate(el => parseFloat(getComputedStyle(el).columnGap || getComputedStyle(el).gap || '0'));
    assert.ok(gap > 0);
    const cancelBox = await actions.getByRole('button', { name: copy.gameCancel, exact: true }).boundingBox();
    const confirmBox = await actions.getByRole('button', { name: copy.gameConfirm, exact: true }).boundingBox();
    assert.ok(cancelBox && confirmBox);
    const intersects = !(
      cancelBox.x + cancelBox.width <= confirmBox.x ||
      confirmBox.x + confirmBox.width <= cancelBox.x ||
      cancelBox.y + cancelBox.height <= confirmBox.y ||
      confirmBox.y + confirmBox.height <= cancelBox.y
    );
    assert.equal(intersects, false);
  } finally { await page.close(); }
});
