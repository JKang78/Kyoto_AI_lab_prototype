import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const url = process.env.PHASE3_URL || process.env.PHASE2_URL || 'http://localhost:3000';
// 12:00 Kyoto time, outside the sample off-peak window, so totals are deterministic.
const NOON = new Date('2026-11-24T03:00:00Z');
let browser;
before(async () => { browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] }); });
after(async () => { await browser?.close(); });
async function prepare(page) {
  await page.clock.setFixedTime(NOON);
  await page.route('https://tiles.openfreemap.org/styles/liberty', route => route.fulfill({
    json: { version: 8, sources: {}, layers: [{ id: 'background', type: 'background' }] },
  }));
  await page.goto(url);
}
const copyFor = async lang => JSON.parse(await readFile(new URL(`../../src/locales/${lang}.json`, import.meta.url)));
const snapshot = page => page.evaluate(() => JSON.parse(localStorage.getItem('kyoto-ai-lab.progress.v1')));
const pts = (copy, points) => copy.pointsValue.replace('{points}', String(points));
async function walkAllStops(page, copy, from = 0) {
  const button = name => page.getByRole('button', { name, exact: true });
  for (let i = from; i < 3; i++) {
    if (i) await button(copy.gameMove).click();
    await button(copy.gameSimulate).click();
  }
}
async function holdStaffButton(page, copy) {
  const hold = page.getByRole('button', { name: new RegExp(copy.redeemStaffHold) });
  const box = await hold.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(1500);
  await page.mouse.up();
}

for (const [lang, width] of [['en', 360], ['ja', 390]]) {
  test(`${lang} earns points, unlocks and redeems a voucher once, resumes after reload and resets only game data`, async () => {
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
      assert.equal(await page.locator('.dock-item').count(), 4);
      await button(copy.navQuests).click();
      await button(copy.gameViewMap).first().click();
      await button(copy.gameStartDemo).click();
      await button(copy.gameSimulate).click();
      await page.getByText(copy.receiptEarned.replace('{points}', '10')).waitFor();
      await page.getByText(copy.receiptStandard.replace('{base}', '10')).waitFor();

      // Language switches mid-walk without losing the walk.
      await button(copy.navSettings).click();
      const otherLang = lang === 'en' ? 'ja' : 'en';
      const otherCopy = await copyFor(otherLang);
      await button(otherLang === 'en' ? 'English' : '日本語').click();
      await button(otherCopy.navWallet).click();
      await page.locator('.wallet-points').getByText(pts(otherCopy, 10), { exact: true }).waitFor();
      await button(otherCopy.navSettings).click();
      await button(lang === 'en' ? 'English' : '日本語').click();

      // The active walk resumes after a reload with movement paused.
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
      await walkAllStops(page, copy, 2);
      await page.locator('.completion-receipt').getByText(copy.gameFinished).waitFor();
      await page.locator('.completion-receipt').getByRole('button', { name: copy.navWallet }).click();
      await page.locator('.wallet-points').getByText(pts(copy, 60), { exact: true }).waitFor();

      // Two tabs racing to unlock the same voucher produce one claim.
      const other = await context.newPage();
      await prepare(other);
      await other.getByRole('button', { name: copy.navWallet, exact: true }).click();
      const otherUnlock = other.getByRole('button', { name: copy.walletUnlock, exact: true });
      await otherUnlock.waitFor();
      const unlockButtons = await Promise.all([button(copy.walletUnlock).elementHandle(), otherUnlock.elementHandle()]);
      await Promise.all(unlockButtons.map(handle => handle.evaluate(el => el.click())));
      await other.close();
      await page.locator('.wallet-points').getByText(pts(copy, 0), { exact: true }).waitFor();
      assert.equal((await snapshot(page)).claims.length, 1);
      assert.equal(await button(copy.walletUnlock).count(), 0);
      assert.equal(await page.locator('[data-coupon-state="locked"]').first().innerText(), copy.walletNeed.replace('{points}', '90'));

      await page.getByRole('button', { name: copy.walletMine.replace('{count}', '1') }).click();
      await button(copy.walletRedeem).click();
      const redeem = page.getByRole('dialog');
      await redeem.getByText(copy.redeemDemoStrip).waitFor();
      assert.match(await redeem.locator('.redeem-code').innerText(), /^\d{3}\s\d{3}$/);
      await redeem.getByText(copy.redeemExpires.replace('{time}', '5:00')).waitFor();
      await holdStaffButton(page, copy);
      await redeem.getByRole('status').getByText(copy.redeemVerified).waitFor();
      assert.equal(typeof (await snapshot(page)).claims[0].redeemedAt, 'number');
      await redeem.getByRole('button', { name: copy.close }).first().click();
      await page.locator('[data-coupon-state="redeemed"]').waitFor();
      assert.equal(await button(copy.walletRedeem).count(), 0);
      await page.locator('.activity-log').getByText(copy.logRedeemed).waitFor();

      await button(copy.navQuests).click();
      await button(copy.questsCompleted.replace('{count}', '1')).click();
      await page.locator('.quest-card').getByText(copy.questProgress.replace('{stamps}', '3').replace('{total}', '3'), { exact: true }).first().waitFor();

      if (lang === 'ja') {
        // The simulated off-peak window doubles check-in points and shows up in the receipt and log.
        await button(copy.navSettings).click();
        await page.getByRole('switch', { name: copy.offPeakSimulateSwitch.replace('{multiplier}', '2.0') }).click();
        await button(copy.navQuests).click();
        await page.locator('.surge-card').getByText(copy.surgeSimulated).waitFor();
        await button(copy.questsCompleted.replace('{count}', '1')).click();
        await button(copy.gameViewMap).click();
        await page.locator('.reward-line em').getByText(copy.offPeakShort.replace('{multiplier}', '2.0')).waitFor();
        await button(copy.gameStartDemo).click();
        await button(copy.gameSimulate).click();
        await page.getByText(copy.receiptOffPeak.replace('{base}', '10').replace('{multiplier}', '2.0')).waitFor();
        await walkAllStops(page, copy, 1);
        await page.locator('.completion-receipt').getByRole('button', { name: copy.navWallet }).click();
        await page.locator('.wallet-points').getByText(pts(copy, 90), { exact: true }).waitFor();
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
    await button(copy.sheetExpand).click();
    await button(copy.routePreview).first().click();
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
    assert.equal(await button(copy.gameCheck).getAttribute('data-ready'), 'true');
    assert.equal((await snapshot(page)).runs[0].stamps.length, 0);
    await button(copy.gameCheck).click();
    await page.getByText(copy.receiptEarned.replace('{points}', '10')).waitFor();
    assert.equal((await snapshot(page)).runs[0].stamps[0].mode, 'live');
  } finally { await page.close(); }
});

test('aborted replay keeps the completed quest and its seals', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 800 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const copy = await copyFor('en');
  const button = name => page.getByRole('button', { name, exact: true });
  try {
    await prepare(page);
    await button(copy.startExploring).click();
    await button(copy.sheetExpand).click();
    await button(copy.routePreview).first().click();
    await button(copy.gameStartDemo).click();
    await walkAllStops(page, copy);
    await page.locator('.completion-receipt').waitFor();
    await button(copy.sheetExpand).click();
    await button(copy.routePreview).first().click();
    await button(copy.gameStartDemo).click();
    await button(copy.gameSimulate).click();
    await button(copy.gameStopWalk).click();
    await page.getByRole('dialog').getByRole('button', { name: copy.gameStopWalk, exact: true }).click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    await button(copy.navQuests).click();
    await button(copy.questsCompleted.replace('{count}', '1')).click();
    const card = page.locator('.quest-card').first();
    await card.getByText(copy.questCompletedCount.replace('{count}', '1')).waitFor();
    assert.equal(await card.getByText(copy.gameStopped, { exact: true }).count(), 0);
    await card.getByText(copy.questProgress.replace('{stamps}', '3').replace('{total}', '3')).first().waitFor();
    const seals = await page.locator('.goshuin-page').first().locator('li').evaluateAll(items => items.map(li => li.dataset.collected));
    assert.deepEqual(seals, ['true', 'true', 'true']);
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
    await tabA.locator('.crowd-legend-pill').waitFor();
    const demoBtnA = tabA.getByRole('button', { name: copy.locationExploreDemo, exact: true });
    const liveBtnA = tabA.getByRole('button', { name: copy.locationUseMyLocation, exact: true });
    const statusA = tabA.locator('.location-status');

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
    await statusA.getByText(copy.locationStatusOff).waitFor();

    await demoBtnA.click();
    await tabA.locator('button[aria-pressed="true"]', { hasText: copy.locationExploreDemo }).waitFor();
    await tabB.getByRole('button', { name: copy.gameReset, exact: true }).click();
    await tabB.getByRole('button', { name: copy.gameConfirm, exact: true }).click();
    await tabB.getByRole('dialog').waitFor({ state: 'hidden' });

    await tabA.locator('button[aria-pressed="false"]', { hasText: copy.locationExploreDemo }).waitFor();
    await statusA.getByText(copy.locationStatusOff).waitFor();

    await liveBtnA.click();
    await tabA.locator('button[aria-pressed="true"]', { hasText: copy.locationUseMyLocation }).waitFor();
    await demoSwitchB.click();
    await tabA.locator('button[aria-pressed="true"]', { hasText: copy.locationExploreDemo }).waitFor();
    assert.equal(await liveBtnA.getAttribute('aria-pressed'), 'false');
    assert.ok(await tabA.evaluate(() => window.__watchCleared > 0));

    // Off-Explore sync: live GPS paused on Settings must reset to unselected when Demo Mode cycles ON -> OFF in Tab B
    await demoSwitchB.click();
    await tabA.locator('button[aria-pressed="false"]', { hasText: copy.locationExploreDemo }).waitFor();
    await liveBtnA.click();
    await tabA.locator('button[aria-pressed="true"]', { hasText: copy.locationUseMyLocation }).waitFor();
    await tabA.getByRole('button', { name: copy.navSettings, exact: true }).click();
    const locationA = tabA.locator('.settings-status');
    await locationA.getByText(copy.locationStatusPaused, { exact: true }).waitFor();

    await demoSwitchB.click();
    await locationA.getByText(copy.locationModeDemo, { exact: true }).waitFor();
    await locationA.getByText(copy.locationStatusDemo, { exact: true }).waitFor();

    await demoSwitchB.click();
    await locationA.getByText(copy.locationStatusOff, { exact: true }).waitFor();
    await locationA.getByText(copy.locationModeUnselected, { exact: true }).waitFor();
    assert.equal(await locationA.getByText(copy.locationStatusPaused, { exact: true }).count(), 0);
    assert.equal(await locationA.getByText(copy.locationModeLive, { exact: true }).count(), 0);
  } finally { await context.close(); }
});

test('Settings switches and dock items meet 44px touch targets; dialog actions do not overlap', async () => {
  const page = await browser.newPage({ viewport: { width: 360, height: 800 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(8000);
  const copy = await copyFor('en');
  const button = name => page.getByRole('button', { name, exact: true });
  try {
    await prepare(page);
    await button(copy.startExploring).click();
    for (const box of await page.locator('.dock-item').evaluateAll(items => items.map(el => el.getBoundingClientRect().toJSON()))) {
      assert.ok(box.width >= 44 && box.height >= 44);
    }
    await button(copy.navSettings).click();
    const offPeak = page.getByRole('switch', { name: copy.offPeakSimulateSwitch.replace('{multiplier}', '2.0') });
    const box = await offPeak.boundingBox();
    assert.ok(box && box.width >= 44 && box.height >= 44);
    const switchName = copy.offPeakSimulateSwitch.replace('{multiplier}', '2.0');
    await offPeak.click();
    await page.getByRole('switch', { name: switchName, checked: true }).waitFor();
    assert.equal((await snapshot(page)).offPeak, true);
    await offPeak.click();
    await page.getByRole('switch', { name: switchName, checked: false }).waitFor();

    await button(copy.gameReset).click();
    const actions = page.locator('dialog .dialog-actions');
    await actions.waitFor();
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
