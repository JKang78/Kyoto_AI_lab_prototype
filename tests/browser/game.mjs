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
async function slideToConfirm(page) {
  const knob = page.locator('.slide-confirm-knob');
  const track = await page.locator('.slide-confirm').boundingBox();
  const box = await knob.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(track.x + track.width - 8, box.y + box.height / 2, { steps: 12 });
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
      await page.locator('.home-screen').waitFor();
      assert.equal(await page.locator('.dock-item').count(), 5);
      await button(copy.navMissions).click();
      await button(copy.gameViewMap).first().click();
      await button(copy.gameStartDemo).click();
      await button(copy.gameSimulate).click();
      await page.getByText(copy.receiptEarned.replace('{points}', '10')).waitFor();
      await page.getByText(copy.receiptStandard.replace('{base}', '10')).waitFor();

      // Language switches mid-walk without losing the walk.
      await button(copy.navMe).click();
      const otherLang = lang === 'en' ? 'ja' : 'en';
      const otherCopy = await copyFor(otherLang);
      await button(otherLang === 'en' ? 'English' : '日本語').click();
      await button(otherCopy.navRewards).click();
      await page.locator('.rewards-points').getByText(pts(otherCopy, 10), { exact: true }).waitFor();
      await button(otherCopy.navMe).click();
      await button(lang === 'en' ? 'English' : '日本語').click();

      // Reloading lands on Home with the active walk ready to resume via the primary CTA.
      await page.reload();
      await page.locator('.home-screen').waitFor();
      await page.locator('[data-home-points]').getByText('10', { exact: true }).waitFor();
      await page.locator('.home-cta').getByText(copy.homeCtaContinue).click();
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
      const celebration = page.locator('.celebration');
      await celebration.getByRole('heading', { name: copy.celebrateTitle }).waitFor();
      await celebration.getByText(copy.celebrateDemo).waitFor();
      assert.equal(await celebration.locator('.celebration-seals li').count(), 3);
      await celebration.getByText(copy.celebrateVoucher.replace('{offer}', lang === 'en' ? '¥150 off a matcha latte' : '抹茶ラテ 150円引き')).waitFor();
      await celebration.getByRole('button', { name: copy.navRewards }).click();
      await page.locator('.rewards-points').getByText(pts(copy, 60), { exact: true }).waitFor();

      // Two tabs racing to unlock the same voucher produce one claim.
      const other = await context.newPage();
      await prepare(other);
      await other.getByRole('button', { name: copy.navRewards, exact: true }).click();
      const otherUnlock = other.getByRole('button', { name: copy.rewardsUnlock, exact: true });
      await otherUnlock.waitFor();
      const unlockButtons = await Promise.all([button(copy.rewardsUnlock).elementHandle(), otherUnlock.elementHandle()]);
      await Promise.all(unlockButtons.map(handle => handle.evaluate(el => el.click())));
      await other.close();
      await page.locator('.rewards-points').getByText(pts(copy, 0), { exact: true }).waitFor();
      assert.equal((await snapshot(page)).claims.length, 1);
      assert.equal(await button(copy.rewardsUnlock).count(), 0);
      assert.equal(await page.locator('[data-coupon-state="locked"]').first().innerText(), copy.rewardsNeed.replace('{points}', '90'));

      await page.getByRole('button', { name: copy.rewardsMine.replace('{count}', '1') }).click();
      await button(copy.rewardsRedeem).click();
      const redeem = page.getByRole('dialog');
      // The redemption preview is unmistakably a demo, in both languages, and never addresses shop staff.
      await redeem.getByText(copy.demoNotRedeemable, { exact: true }).waitFor();
      await redeem.getByText(otherCopy.demoNotRedeemable, { exact: true }).waitFor();
      await redeem.getByText(copy.redeemDemoBody).waitFor();
      assert.equal(await redeem.getByText(/show this to staff|店員さまにお見せ/i).count(), 0);
      assert.match(await redeem.locator('.redeem-code').innerText(), /^\d{3}\s\d{3}$/);
      await redeem.getByText(copy.redeemExpires.replace('{time}', '5:00')).waitFor();
      await slideToConfirm(page);
      await redeem.getByRole('status').getByText(copy.redeemVerified).waitFor();
      assert.equal(typeof (await snapshot(page)).claims[0].redeemedAt, 'number');
      await redeem.getByRole('button', { name: copy.close }).first().click();
      await button(copy.rewardsUsed).click();
      await page.locator('[data-coupon-state="redeemed"]').waitFor();
      assert.equal(await page.locator('.ticket-card .demo-badge').innerText(), copy.demoNotRedeemable);
      assert.equal(await button(copy.rewardsRedeem).count(), 0);
      await page.locator('.activity-log').getByText(copy.logRedeemed).waitFor();

      await button(copy.navMissions).click();
      await button(copy.missionsCompleted.replace('{count}', '1')).click();
      await page.locator('.quest-card').getByText(copy.missionProgress.replace('{stamps}', '3').replace('{total}', '3'), { exact: true }).first().waitFor();

      if (lang === 'ja') {
        // The simulated off-peak window doubles check-in points and shows up in the receipt and log.
        // A presenter-enabled bus-relief scenario applies only to its own walk and is labelled as a demo.
        await button(copy.navMe).click();
        await button(copy.scenarioBus).click();
        await button(copy.navMissions).click();
        const busName = copy.bonusBusName;
        await page.locator('.surge-card').getByText(copy.bonusBusScenario).waitFor();
        await button(copy.missionsCompleted.replace('{count}', '1')).click();
        await button(copy.gameViewMap).click();
        await page.locator('.reward-line em').getByText(copy.bonusShort.replace('{name}', busName).replace('{multiplier}', '2.0')).waitFor();
        await page.locator('.bonus-banner').getByText(copy.bonusBanner.replace('{name}', busName).replace('{multiplier}', '2.0')).waitFor();
        await button(copy.gameStartDemo).click();
        await button(copy.gameSimulate).click();
        await page.getByText(copy.receiptBonus.replace('{base}', '10').replace('{multiplier}', '2.0').replace('{name}', busName)).waitFor();
        await walkAllStops(page, copy, 1);
        await page.locator('.celebration').getByRole('button', { name: copy.navRewards }).click();
        await page.locator('.rewards-points').getByText(pts(copy, 90), { exact: true }).waitFor();
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await button(copy.navMe).click();
      await button(copy.gameReset).click();
      await button(copy.gameCancel).click();
      assert.equal((await snapshot(page)).runs.length, lang === 'ja' ? 2 : 1);
      await button(copy.gameReset).click();
      await button(copy.gameConfirm).click();
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
      await page.reload();
      await button(copy.navMe).click();
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
    await button(copy.navExplore).click();
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
    // Wait for React to re-render with the eligible fix instead of sampling the button instantly.
    await page.waitForFunction(() => document.querySelector('.follow-check')?.disabled === false);
    assert.equal(await button(copy.gameCheck).isDisabled(), false);
    assert.equal(await button(copy.gameCheck).getAttribute('data-ready'), 'true');
    assert.equal((await snapshot(page)).runs[0].stamps.length, 0);
    await button(copy.gameCheck).click();
    await page.getByText(copy.receiptEarned.replace('{points}', '10')).waitFor();
    assert.equal((await snapshot(page)).runs[0].stamps[0].mode, 'live');
  } finally { await page.close(); }
});

test('aborted replay keeps the completed mission and its seals', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 800 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const copy = await copyFor('en');
  const button = name => page.getByRole('button', { name, exact: true });
  try {
    await prepare(page);
    await button(copy.startExploring).click();
    await button(copy.navExplore).click();
    await button(copy.sheetExpand).click();
    await button(copy.routePreview).first().click();
    await button(copy.gameStartDemo).click();
    await walkAllStops(page, copy);
    await page.locator('.celebration').getByRole('button', { name: copy.close }).click();
    await button(copy.sheetExpand).click();
    await button(copy.routePreview).first().click();
    await button(copy.gameStartDemo).click();
    await button(copy.gameSimulate).click();
    await button(copy.gameStopWalk).click();
    await page.getByRole('dialog').getByRole('button', { name: copy.gameStopWalk, exact: true }).click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    await button(copy.navMissions).click();
    await button(copy.missionsCompleted.replace('{count}', '1')).click();
    const card = page.locator('.quest-card').first();
    await card.getByText(copy.missionCompletedCount.replace('{count}', '1')).waitFor();
    assert.equal(await card.getByText(copy.gameStopped, { exact: true }).count(), 0);
    await card.getByText(copy.missionProgress.replace('{stamps}', '3').replace('{total}', '3')).first().waitFor();
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
    await tabA.getByRole('button', { name: copy.navExplore, exact: true }).click();
    await tabA.locator('.map-rail').waitFor();
    const demoBtnA = tabA.getByRole('button', { name: copy.locationExploreDemo, exact: true });
    const liveBtnA = tabA.getByRole('button', { name: copy.locationUseMyLocation, exact: true });
    const statusA = tabA.locator('.location-status');

    await demoBtnA.click();
    await tabA.locator('button[aria-pressed="true"]', { hasText: copy.locationExploreDemo }).waitFor();

    await prepare(tabB);
    await tabB.getByRole('button', { name: copy.navMe, exact: true }).click();
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
    await tabA.getByRole('button', { name: copy.navMe, exact: true }).click();
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

test('Me controls and dock items meet 44px touch targets; dialog actions do not overlap', async () => {
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
    await button(copy.navMe).click();
    for (const name of [copy.scenarioNone, copy.scenarioBus, copy.scenarioQuiet]) {
      const box = await button(name).boundingBox();
      assert.ok(box && box.width >= 44 && box.height >= 44, name);
    }
    assert.equal(await button(copy.scenarioNone).getAttribute('aria-pressed'), 'true');
    await button(copy.scenarioQuiet).click();
    await page.locator('button[aria-pressed="true"]', { hasText: copy.scenarioQuiet }).waitFor();
    assert.equal((await snapshot(page)).scenario, 'quiet_hour');
    await button(copy.scenarioNone).click();
    await page.locator('button[aria-pressed="true"]', { hasText: copy.scenarioNone }).waitFor();
    assert.equal((await snapshot(page)).scenario, null);

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

test('Macadam-style Home screen is the default entry, syncs points/seals/milestones, and defers QR deep links', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', locale: 'en-US' });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const copy = await copyFor('en');
  const button = name => page.getByRole('button', { name, exact: true });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    // QR deep-link routing is deferred: visiting /?route=kamo-riverside still goes through normal entry.
    await page.clock.setFixedTime(NOON);
    await page.route('https://tiles.openfreemap.org/styles/liberty', route => route.fulfill({
      json: { version: 8, sources: {}, layers: [{ id: 'background', type: 'background' }] },
    }));
    await page.goto(`${url}/?route=kamo-riverside`);
    await page.locator('#nickname').fill('Aki');
    await button(copy.startExploring).click();

    // Lands on Home with Macadam anatomy in Kyoto Ink & Washi.
    await page.locator('.home-screen').waitFor();
    assert.equal(await page.locator('.dock-item').count(), 5);
    await page.locator('.home-hello').getByText(copy.homeGreeting.replace('{name}', 'Aki')).waitFor();
    assert.equal(await page.locator('[data-home-points]').innerText(), '0');
    assert.equal(await page.locator('.home-track-node').count(), 3);
    for (const sel of ['.home-points-pill', '.home-icon-btn', '.home-avatar-btn', '.home-stat-plus', '.home-cta']) {
      const box = await page.locator(sel).boundingBox();
      assert.ok(box && box.width >= 44 && box.height >= 44, sel);
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);

    // Primary CTA opens Explore; complete a walk and return to Home to verify synced state.
    await page.locator('.home-cta').getByText(copy.homeCtaExplore).click();
    await button(copy.sheetExpand).click();
    await button(copy.routePreview).first().click();
    await button(copy.gameStartDemo).click();
    await walkAllStops(page, copy);
    await page.locator('.celebration').getByRole('button', { name: copy.close }).click();
    await button(copy.navHome).click();
    assert.equal(await page.locator('[data-home-points]').innerText(), '60');
    assert.deepEqual(
      await page.locator('.home-track-node').evaluateAll(els => els.map(el => el.dataset.state)),
      ['ready', 'locked', 'locked'],
    );
    await page.locator('.home-cta').getByText(copy.homeCtaUnlock).click();
    await page.getByRole('heading', { name: copy.navRewards, level: 1 }).waitFor();
    await button(copy.rewardsUnlock).click();
    await button(copy.navHome).click();
    assert.equal(await page.locator('[data-home-points]').innerText(), '0');
    assert.deepEqual(
      await page.locator('.home-track-node').evaluateAll(els => els.map(el => el.dataset.state)),
      ['done', 'locked', 'locked'],
    );
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('an unknown route id falls back to the normal welcome flow', async () => {
  const page = await browser.newPage();
  try {
    await page.goto(`${url}/?route=not-a-walk`);
    await page.locator('#nickname').waitFor();
  } finally { await page.close(); }
});

test('P0 interaction layer: reward pill, walk HUD beads, pin seals, celebration, unlock toast and tab dots', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const copy = await copyFor('en');
  const button = name => page.getByRole('button', { name, exact: true });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    await prepare(page);
    await button(copy.startExploring).click();
    await button(copy.navExplore).click();
    // E1: the pill shows progress toward the cheapest voucher and opens Rewards.
    const pill = page.locator('.reward-pill');
    assert.equal(await pill.innerText(), copy.rewardPillValue.replace('{points}', '0').replace('{target}', '60'));
    const pillBox = await pill.boundingBox();
    assert.ok(pillBox.width >= 44 && pillBox.height >= 44);
    await pill.click();
    await page.getByRole('heading', { name: copy.navRewards, level: 1 }).waitFor();
    await button(copy.navExplore).click();
    // E2: the fox's contextual bubble opens the walk list.
    await page.locator('.fox-bubble').getByText(copy.foxBubblePick).click();
    await page.locator('.snap-sheet[data-snap="half"]').waitFor();
    await button(copy.routePreview).first().click();
    await page.locator('.fox-bubble').getByText(copy.foxBubbleReady.replace('{walk}', 'Shijō to Yasaka')).waitFor();
    await button(copy.gameStartDemo).click();
    // E3: the HUD replaces search and gains one gold bead per stamp; the bubble hides during a walk.
    const hud = page.locator('.walk-hud');
    await hud.getByText('Shijō to Yasaka').waitFor();
    assert.equal(await page.getByRole('searchbox').count(), 0);
    assert.equal(await page.locator('.fox-bubble').count(), 0);
    assert.equal(await hud.locator('.stop-beads [data-done="true"]').count(), 0);
    const followBeads = page.locator('.follow-card .stop-beads');
    assert.equal(await followBeads.locator('span').count(), 3);
    assert.equal(await followBeads.locator('[data-done="true"]').count(), 0);
    await button(copy.gameSimulate).click();
    await followBeads.locator('[data-done="true"]').waitFor();
    await hud.locator('.stop-beads [data-done="true"]').first().waitFor();
    assert.equal(await hud.locator('.stop-beads [data-done="true"]').count(), 1);
    // E4: the stamped stop carries a seal; the next stop has the "!" bubble.
    assert.equal(await page.locator('.map-place-pin[data-place-id="shijo-kawaramachi"] .map-place-pin-seal').count(), 1);
    assert.equal(await page.locator('.map-place-pin[data-place-id="shijo-ohashi"] .map-place-pin-bubble').count(), 1);
    // C3: a new seal puts a dot on Missions (described, not renamed, for screen readers).
    assert.equal(await page.locator('[data-tab-dot="missions"]').count(), 1);
    assert.equal(await button(copy.navMissions).evaluate(el => document.getElementById(el.getAttribute('aria-describedby'))?.textContent), copy.navNew);
    await walkAllStops(page, copy, 1);
    // C1: the celebration shows demo points and both actions; the toast waits until it closes.
    const celebration = page.locator('.celebration');
    await celebration.getByText(copy.celebratePoints.replace('{points}', '60')).waitFor();
    assert.equal(await page.locator('.unlock-toast').count(), 0);
    await celebration.getByRole('button', { name: copy.close }).click();
    // C2: the unlock toast is labelled demo and links to Rewards.
    const toast = page.locator('.unlock-toast');
    await toast.getByText(copy.demoNotRedeemable, { exact: false }).waitFor();
    assert.equal(await page.locator('[data-tab-dot="rewards"]').count(), 1);
    await toast.getByRole('button', { name: copy.unlockToastView }).click();
    await page.getByRole('heading', { name: copy.navRewards, level: 1 }).waitFor();
    assert.equal(await page.locator('[data-tab-dot="rewards"]').count(), 0);
    // R1: the first voucher marker is ready, the others locked.
    assert.deepEqual(await page.locator('.voucher-track-stop').evaluateAll(els => els.map(el => el.dataset.state)), ['ready', 'locked', 'locked']);
    // M1 + celebration stamp-book link: Missions shows the stamp book after visiting.
    await button(copy.navMissions).click();
    assert.equal(await page.locator('[data-tab-dot="missions"]').count(), 0);
    assert.equal(await page.locator('.mission-hero').count(), 0);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('the celebration "See stamp book" opens Missions at the stamp book, and an active walk leads Missions', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(8000);
  const copy = await copyFor('en');
  const button = name => page.getByRole('button', { name, exact: true });
  try {
    await prepare(page);
    await button(copy.startExploring).click();
    await button(copy.navExplore).click();
    await button(copy.sheetExpand).click();
    await button(copy.routePreview).first().click();
    await button(copy.gameStartDemo).click();
    await walkAllStops(page, copy);
    await page.locator('.celebration').getByRole('button', { name: copy.celebrateStampBook }).click();
    await page.locator('#goshuin-title').waitFor();
    assert.ok(await page.locator('#goshuin-title').evaluate(el => el.getBoundingClientRect().top < innerHeight));
    await button(copy.navExplore).click();
    await button(copy.sheetExpand).click();
    await button(copy.routePreview).first().click();
    await button(copy.gameStartDemo).click();
    await button(copy.gameSimulate).click();
    await button(copy.navMissions).click();
    const hero = page.locator('.mission-hero');
    await hero.getByText(copy.missionsHeroNext.replace('{place}', 'Shijō Bridge')).waitFor();
    await hero.getByRole('button', { name: copy.gameResume }).click();
    await page.locator('.walk-hud').waitFor();
  } finally { await page.close(); }
});

test('P1: side rail, help sheet, route labels, goal marker and glyph seals', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(8000);
  const copy = await copyFor('en');
  const button = name => page.getByRole('button', { name, exact: true });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    await prepare(page);
    await button(copy.startExploring).click();
    await button(copy.navExplore).click();
    // E5: every rail tool is a labelled 44 px target.
    for (const name of [copy.railList, copy.crowdInfo, copy.railHelp]) {
      const target = await button(name).locator('span').first().boundingBox();
      assert.ok(target.width >= 44 && target.height >= 44, name);
    }
    await button(copy.crowdInfo).click();
    await page.locator('.map-rail .crowd-legend').getByText(copy.crowdProvenance).waitFor();
    await button(copy.crowdInfo).click();
    // E6: the help sheet explains the verification limits.
    await button(copy.railHelp).click();
    const help = page.getByRole('dialog');
    await help.getByText(copy.helpCheckinsBody).waitFor();
    await help.getByRole('button', { name: copy.helpDone }).click();
    // E7: at least one route label is visible and opens its preview.
    const label = page.locator('.map-route-label').filter({ visible: true }).first();
    const walkId = await label.getAttribute('data-walk-id');
    await label.click();
    await page.locator('.snap-sheet[data-snap="full"]').waitFor();
    assert.equal(await page.locator('.map-route-label').filter({ visible: true }).count(), 0);
    // E8: the goal marker labels the walk's last stop as where demo points are earned.
    await page.locator('.map-goal-marker').getByText(copy.goalMarker.replace('{points}', '30')).waitFor();
    assert.ok(walkId);
    // M2: a stamped stop shows its theme glyph in the stamp book, not a generic mark.
    await button(copy.gameStartDemo).click();
    await button(copy.gameSimulate).click();
    await page.locator('.map-place-pin-seal svg').first().waitFor();
    await button(copy.navMissions).click();
    assert.ok(await page.locator('.goshuin-page li[data-collected="true"] .goshuin-seal svg').count() >= 1);
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test('P1: slide-to-confirm works by keyboard, a pointer tap alone does not confirm, and Me shows the passport', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(8000);
  const copy = await copyFor('en');
  const button = name => page.getByRole('button', { name, exact: true });
  try {
    await prepare(page);
    await page.locator('#nickname').fill('Aki');
    await button(copy.startExploring).click();
    await button(copy.navRewards).click();
    await page.locator('.empty-note .fox-avatar').first().waitFor();
    await button(copy.navExplore).click();
    await button(copy.sheetExpand).click();
    await button(copy.routePreview).first().click();
    await button(copy.gameStartDemo).click();
    await walkAllStops(page, copy);
    await page.locator('.celebration').getByRole('button', { name: copy.navRewards }).click();
    await button(copy.rewardsUnlock).click();
    await page.getByRole('button', { name: copy.rewardsMine.replace('{count}', '1') }).click();
    await page.locator('.ticket-art').first().waitFor();
    await button(copy.rewardsRedeem).click();
    const knob = page.locator('.slide-confirm-knob');
    await knob.click();
    await page.waitForTimeout(300);
    assert.equal((await snapshot(page)).claims[0].redeemedAt, undefined);
    await knob.focus();
    await page.keyboard.press('Enter');
    await page.getByRole('dialog').getByRole('status').getByText(copy.redeemVerified).waitFor();
    await page.getByRole('dialog').getByRole('button', { name: copy.close }).first().click();
    await button(copy.navMe).click();
    await page.locator('.passport').getByText('Aki').waitFor();
    assert.equal(await page.locator('.passport-line').innerText(), copy.passportLine.replace('{seals}', '3').replace('{walks}', '1').replace('{used}', '1'));
  } finally { await page.close(); }
});

test('P2: credited place photos, locked then unlocked draft stories, per-place seals and the demo trail', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(8000);
  const copy = await copyFor('en');
  const button = name => page.getByRole('button', { name, exact: true });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    await prepare(page);
    await button(copy.startExploring).click();
    await button(copy.navExplore).click();
    await button(copy.sheetExpand).click();
    // Yasaka and Maruyama Park: its Chion-in stop has no licensed photo, so it shows the placeholder.
    await page.locator('.route-card').filter({ hasText: 'Yasaka and Maruyama Park' }).getByRole('button', { name: copy.routePreview }).click();
    await page.locator('.snap-sheet').getByRole('button', { name: copy.mapOpenPlace.replace('{name}', 'Chion-in south-gate side of Maruyama Park') }).click();
    await page.locator('.place-photo--placeholder').getByText(copy.photoPlaceholder).waitFor();
    await page.locator('.place-story--locked').getByText(copy.storyLocked).waitFor();
    // A photographed stop shows the credit with licence and source links.
    await button(copy.routesDetails).click();
    await page.locator('.snap-sheet').getByRole('button', { name: copy.mapOpenPlace.replace('{name}', 'Yasaka Shrine west-gate view') }).click();
    const figure = page.locator('.snap-sheet .place-photo').first();
    await figure.getByRole('img', { name: copy.photoAlt.replace('{place}', 'Yasaka Shrine west-gate view') }).waitFor();
    await figure.getByRole('link', { name: 'CC BY-SA 4.0' }).waitFor();
    assert.match(await figure.getByRole('link', { name: copy.photoSource }).getAttribute('href'), /^https:\/\/commons\.wikimedia\.org\//);
    // Checking in unlocks the story, labelled as a draft with its sources.
    await button(copy.routesDetails).click();
    await button(copy.gameStartDemo).click();
    await button(copy.gameSimulate).click();
    await button(copy.storyRead).click();
    const story = page.getByRole('dialog');
    await story.getByText(copy.storyDraft).waitFor();
    await story.getByRole('link', { name: /Wikipedia/ }).first().waitFor();
    await story.getByRole('button', { name: copy.close }).click();
    // The stamp book shows the stop's own seal and opens the same story; the trail counts seals.
    await button(copy.navMissions).click();
    await page.locator('.trail-card').getByText(copy.trailProgress.replace('{count}', '1').replace('{goal}', '5')).first().waitFor();
    await page.locator('.trail-card').getByText(copy.trailNote).waitFor();
    await page.getByRole('button', { name: copy.storyOpen.replace('{place}', 'Yasaka Shrine west-gate view') }).first().click();
    await page.getByRole('dialog').getByText(copy.storyDraft).waitFor();
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test('release pass: unavailable chips explain themselves, list view replaces the map, etiquette toast shows once per day', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const copy = await copyFor('en');
  const button = name => page.getByRole('button', { name, exact: true });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    await prepare(page);
    await button(copy.startExploring).click();
    await button(copy.navExplore).click();
    // Item 1: Bike and Luggage are unavailable, explain why, and never filter the walks.
    const bike = button(copy.chipBike);
    assert.equal(await bike.getAttribute('aria-disabled'), 'true');
    await bike.dispatchEvent('click');
    await page.locator('#chip-note').getByText(copy.chipBikeNote).waitFor();
    await button(copy.chipLuggage).dispatchEvent('click');
    await page.locator('#chip-note').getByText(copy.chipLuggageNote).waitFor();
    assert.equal(await page.locator('.map-categories [aria-pressed="true"]').count(), 0);
    // Item 3: the list view shows every walk with its stops, details and actions, without the map.
    await button(copy.railList).click();
    const list = page.locator('.walk-list');
    await list.getByRole('heading', { name: copy.listTitle }).waitFor();
    assert.equal(await list.locator('.walk-list-item').count(), 3);
    assert.equal(await page.locator('.snap-sheet').count(), 0);
    await list.locator('summary').first().click();
    await list.locator('.walk-list-place').first().getByText(copy.storyLocked).waitFor();
    await list.getByRole('button', { name: copy.listMapView }).click();
    await page.locator('.snap-sheet').waitFor();
    // Item 5: starting at Yasaka's gate shows the etiquette toast with the demo label.
    await button(copy.railList).click();
    await list.locator('.walk-list-item').filter({ hasText: 'Yasaka and Maruyama Park' }).getByRole('button', { name: copy.gameStartDemo }).click();
    const toast = page.locator('.etiquette-toast');
    await toast.getByText(copy.etiquetteDemo).waitFor();
    await toast.locator('.fox-avatar--warning').waitFor();
    assert.equal(await page.locator('.walk-hud').count(), 1);
    await toast.getByRole('button', { name: copy.close }).click();
    await toast.waitFor({ state: 'detached' });
    // Same zone, same Kyoto day: no repeat after a reload.
    await page.reload();
    await page.locator('.home-cta').getByText(copy.homeCtaContinue).click();
    await page.locator('.walk-hud').waitFor();
    await page.waitForTimeout(500);
    assert.equal(await page.locator('.etiquette-toast').count(), 0);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('place walking time uses a recent on-path fix and returns to the named route start when it expires', async () => {
  const page = await browser.newPage({ viewport: { width: 360, height: 800 }, reducedMotion: 'reduce' });
  const copy = await copyFor('en');
  const button = name => page.getByRole('button', { name, exact: true });
  try {
    await page.addInitScript(() => Object.defineProperty(navigator, 'geolocation', { value: {
      watchPosition(onFix) { window.reportFix = onFix; return 42; }, clearWatch() {},
    } }));
    await prepare(page);
    await page.clock.install({ time: NOON });
    await button(copy.startExploring).click();
    await button(copy.navExplore).click();
    await button(copy.locationUseMyLocation).click();
    await button(copy.railList).click();
    const stop = page.locator('article:has(#walk-list-kamo-riverside)').locator('details').last();
    await stop.locator('summary').click();
    const info = stop.locator('.place-walk-info');
    const fallback = info.getByText('About 9 min on foot from Shijō Bridge along this walk');
    await fallback.waitFor();
    await info.getByText(copy.mapCategoryRiverside, { exact: true }).waitFor();
    const link = new URL(await info.getByRole('link').getAttribute('href'));
    assert.equal(link.searchParams.get('destination'), '35.009106,135.772365');
    assert.equal(link.searchParams.has('origin'), false);
    await page.evaluate(() => window.reportFix({ timestamp: Date.now(), coords: {
      latitude: 35.003826, longitude: 135.772116, accuracy: 10,
    } }));
    await info.getByText('About 9 min on foot from your GPS position').waitFor();
    await page.clock.fastForward(31_000);
    await fallback.waitFor();
  } finally { await page.close(); }
});

test('Next UI pass: tactile primary buttons, floating frosted bonus pill, halo help, and synced checkpoint-to-voucher track', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(8000);
  const copy = await copyFor('en');
  const button = name => page.getByRole('button', { name, exact: true });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    await prepare(page);
    // Tactile primary button feedback on pointer and keyboard (Space)
    const startBtn = button(copy.startExploring);
    await startBtn.focus();
    await page.keyboard.down('Space');
    assert.equal(await startBtn.getAttribute('data-pressed'), 'true');
    await page.keyboard.up('Space');
    await page.locator('.home-screen').waitFor();

    // Enable bus-relief scenario in Me, then verify floating frosted-washi bonus pill on Explore
    await button(copy.navMe).click();
    await button(copy.scenarioBus).click();
    await button(copy.navExplore).click();
    await page.locator('.map-top-row .bonus-banner').waitFor();
    assert.equal(await page.locator('.snap-sheet .bonus-banner').count(), 0);

    // Map Help documents the 60 m fox halo separately from the 75 m check-in rule
    await button(copy.railHelp).click();
    const help = page.getByRole('dialog');
    await help.getByText(copy.helpHaloTitle).waitFor();
    await help.getByText(copy.helpHaloBody).waitFor();
    await help.getByRole('button', { name: copy.helpDone }).click();

    // Start Shijō to Yasaka walk: walk-hud takes first position with bonus pill stacked beneath it
    await button(copy.sheetExpand).click();
    await button(copy.routePreview).first().click();
    await button(copy.gameStartDemo).click();
    await page.locator('.map-follow-hud .walk-hud').waitFor();
    await page.locator('.map-follow-hud .bonus-banner').waitFor();

    // Collect 1st stamp (20 pts with 2x bus relief); follow card and Rewards show identical checkpoint-to-voucher track
    await button(copy.gameSimulate).click();
    const expectedLabel = copy.trackStopsToUnlock
      .replace('{stops}', '2')
      .replace('{offer}', '¥150 off a matcha latte');
    await page.locator('.follow-card .checkpoint-track-label').getByText(expectedLabel).waitFor();
    await button(copy.navRewards).click();
    await page.locator('.rewards-summary .checkpoint-track-label').getByText(expectedLabel).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test('Prototype batch: skippable welcome, map style toggle, save & return, GPS pause/itinerary, safety & delete local data', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const copy = await copyFor('en');
  const button = name => page.getByRole('button', { name, exact: true });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    await page.addInitScript(() => {
      window.__gpsClears = 0;
      Object.defineProperty(navigator, 'geolocation', {
        configurable: true,
        value: {
          watchPosition(ok) {
            window.__emitFix = ok;
            return 99;
          },
          clearWatch() { window.__gpsClears += 1; },
        },
      });
    });
    await prepare(page);
    // 1. Skip welcome -> lands on Home as guest
    await button(copy.welcomeSkip).click();
    await page.locator('.home-screen').waitFor();

    // 2. Map style Illustrated <-> Standard toggle + Save a walk
    await button(copy.navExplore).click();
    await page.locator('.map-rail').waitFor();
    const styleBtn = page.getByRole('button', { name: copy.railStyleAria.replace('{next}', copy.railStyleStandard), exact: true });
    await styleBtn.click();
    await page.getByRole('button', { name: copy.railStyleAria.replace('{next}', copy.railStyleIllustrated), exact: true }).waitFor();

    await button(copy.sheetExpand).click();
    await page.locator('.route-card .save-button').first().click();
    await page.reload();
    await button(copy.navMe).click();
    await page.locator('.saved-list li').first().waitFor();
    await page.locator('.saved-list').getByRole('button', { name: copy.savedOpen, exact: true }).first().click();
    await page.locator('.snap-sheet[data-snap="full"]').waitFor();

    // 3. Foreground GPS walk: explicit Pause GPS / Resume GPS + active Itinerary structured list
    await button(copy.gameStartLive).click();
    await button(copy.gpsPause).click();
    assert.ok(await page.evaluate(() => window.__gpsClears > 0));
    await button(copy.gpsResume).waitFor();
    await button(copy.walkItineraryToggle).click();
    assert.equal(await page.locator('.follow-itinerary li').count(), 3);

    // 4. Missions eligibility & Rewards Kyoto-time validity
    await button(copy.navMissions).click();
    await page.locator('.quest-eligibility').first().waitFor();
    await button(copy.navRewards).click();
    await page.locator('.ticket-expiry').first().waitFor();

    // 5. Me: safety links, path-issue report draft, revisit welcome, and Delete my local data
    await button(copy.navMe).click();
    await page.locator('.safety-links a').first().waitFor();
    await button(copy.reportIssueButton).click();
    await button(copy.reportIssueSubmit).click();
    await page.getByText(copy.reportIssueSaved).waitFor();
    await page.getByRole('dialog').getByRole('button', { name: copy.close }).first().click();

    await button(copy.revisitWelcome).click();
    await page.locator('#nickname').waitFor();
    await button(copy.welcomeSkip).click();
    await button(copy.navMe).click();

    await button(copy.deleteAllData).click();
    await button(copy.deleteAllConfirm).click();
    await page.locator('#nickname').waitFor();
    assert.equal(await page.evaluate(() => localStorage.getItem('kyoto-ai-lab.saved.v1')), null);
    assert.equal(await page.evaluate(() => localStorage.getItem('kyoto-ai-lab.profile.v1')), null);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});
