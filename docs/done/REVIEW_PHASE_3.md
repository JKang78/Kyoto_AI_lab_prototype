# Phase 3 review — walk, collect, claim

A tester can now start one of the three curated walks, collect stamps at its ordered stops, finish the mission and spend the earned demo coins. A returning visitor can resume the active walk. The same progress record drives Map, Home, Missions, Rewards and Settings.

**Review range.** The GitHub checkpoint is `178dd8a` (“Before starting phase 3”). The implementation and regression tests are in `43d5b4a` on `phase-2-review`. Run `git diff 178dd8a...phase-2-review` to review just Phase 3. [Implementation plan](PHASE_3_PLAN.md)

## Try it in two minutes

1. Open Missions, choose **View on Map** for **Kamo riverside sidewalk**, then open its route details at the bottom of the map. Choose **Start demo walk**.
2. At Shijō Bridge choose **Simulate check-in**. The header should show **10 / 60** and the next checkpoint should be Kawabata riverside sidewalk. Choose **Walk to next stop**. Try pausing and continuing. When the marker arrives, collect the next stamp. With reduced motion enabled, the same control advances directly to the destination.
3. Switch to Home or change the language in Settings, then reload. The wallet and earned stamps persist. Map resumes at the last collected stop with movement paused. Continue to Sanjō Bridge and collect the third stamp.
4. The completion sheet should award **30 bonus coins** and announce that the postcard is unlocked. Open Rewards and claim it. The balance should drop from **60 to 0**, the postcard should read **Claimed**, and the claim should appear in history. Missions shows the completed walk and its three stamps.
5. In Settings, try cancelling **Reset demo progress**. Confirm only when ready to clear the game data in this browser. The nickname and chosen language survive.

These screenshots show the Kamo walkthrough with live map tiles at a 390 px browser width. [First stamp and next checkpoint](../review/phase-3/kamo-checkpoint.png) · [Wallet after claiming the postcard](../review/phase-3/claimed-postcard.png)

## Wave 1 — rules and ownership

One progress record belongs to the browser and one walk instance can be active at a time. The map receives the current game state from the app shell, so destroying the map renderer on tab exit preserves the mission while still clearing the GPS watcher. Recorded stamps retain their source mode and awarded amount. A later change to the bonus switch does not recalculate earlier awards.

I used these provisional settings to make the showcase playable. All monetary values describe virtual coins. [Game configuration](../../src/config/game.ts)

| Setting | Implemented behavior |
| --- | --- |
| Ordinary awards | 10 coins per checkpoint and 30 on route completion. Three stops earn 60. |
| Illustrative busy-period scenario | Off initially. Turning it on adds 50% to each subsequent simulated checkpoint award. A complete demo walk with the scenario on earns 75. |
| Coupons | One postcard at 60, one tea break at 100, one walking journal at 120. Each can be claimed once until reset. |
| Replays and early exit | A deliberately started replay gets its own awards. Ending early from route details preserves stamps and coins earned and grants zero completion bonus. |
| GPS eligibility | Explicit check-in on the next stop with an active live fix within 75 m, reported accuracy at most 50 m, and a fix age of at most 30 seconds. A paused, denied or out-of-area status blocks collection. |
| Simulated movement | A leg lasts about 2.4 seconds in the accelerated demo. Restarting a leg rewinds only the movement since the last stamp. |

## Wave 2 — what changed

| Files | What to look for in the diff |
| --- | --- |
| [Game rules](../../src/lib/game.ts) and [configuration](../../src/config/game.ts) | The state transition checks the walk instance and expected place before accepting a stamp. Completion is recorded with the final stamp. The wallet is derived from stamp awards, completion bonuses and claim costs. Claiming requires both sufficient balance and an unclaimed coupon. |
| [Browser storage](../../src/lib/game-store.ts) | Versioned local storage under `kyoto-ai-lab.progress.v1`, separate from the Phase 2 profile. It rereads the latest state before each transaction, writes the transition as a single record, and notifies other views. Browsers supporting Web Locks serialize concurrent tab writes. Blocked local storage falls back to session memory. |
| [Walk controls](../../src/components/walk-controls.tsx), [map](../../src/components/map/kyoto-map.tsx) and [location](../../src/lib/location.ts) | Start a demo or GPS walk from route details. The demo marker follows vertices of the existing pedestrian geometry. The next pin is highlighted. Live eligibility uses the timestamp and accuracy of the browser fix. The map displays earned progress and provides a dismissible completion sheet. |
| [Game screens](../../src/components/game-screens.tsx) and [app shell](../../src/components/prototype-app.tsx) | Replaced the Missions and Rewards placeholders. Each walk has a mission with a theme icon, story, status, stamp list and map action. Home summarizes stamps, completed runs and balance. Settings controls the sample bonus and confirmed reset. |
| [Styles](../../src/app/globals.css), [English](../../src/locales/en.json) and [Japanese](../../src/locales/ja.json) | Added checkpoint controls, stamp lists, wallet and reward states, completion feedback and localized GPS eligibility hints. Updated obsolete preview copy. |
| [Unit tests](../../tests/game.test.mjs), [browser tests](../../tests/browser/game.mjs), [npm scripts](../../package.json) and [TypeScript config](../../tsconfig.json) | The existing Node and Playwright setup now exercises game rules and user flows. Explicit TypeScript import extensions let the pure game module run directly in Node tests. |
| [README](../README.md) and [review captures](../review/phase-3/) | Current local setup, short demo walkthrough and two screenshots from the live-provider smoke test. |

## Wave 3 — audit results

- **11 unit and fixture tests passed.** The game tests cover two walk instances, skipped or duplicate stops, stale actions from an earlier instance, spending at the exact threshold, duplicate claims after earning more coins, early exit, reset and the sample bonus. GPS cases include acceptable and poor accuracy, denied and paused states, stale fixes and points just inside and outside the radius.
- **10 Chromium cases passed against the production build.** Seven retain Phase 2 coverage. The new English and Japanese walkthroughs switch language, reload mid-walk, complete a mission, attempt a simultaneous coupon claim in two browser tabs, then cancel and confirm reset. The English run exercises pause, continue and leg restart. The Japanese run uses reduced motion and repeats the walk with the bonus on. The third new case injects live fixes and verifies that an explicit tap produces a stamp recorded as live.
- **Live map smoke check passed.** The Kamo walkthrough loaded the provider style and tiles, collected three simulated stamps and claimed the postcard. The repeatable browser suite uses a controlled style and the real MapLibre renderer.
- **Lint, TypeScript, production build and diff whitespace checks passed.** All 173 English and Japanese message keys and interpolation placeholders match. Node emitted the existing module-type warning in tests and a deprecation warning in the build.

For reproduction, use the review worktree. Run `npm ci`, `npm test`, `npm run lint`, `npm run typecheck` and `npm run build`. Start the production build with `npm start`. In another terminal run `npx playwright install chromium` and `npm run test:browser`. The suite defaults to localhost port 3000. Set `PHASE2_URL` if serving both suites on another local port.

## Decisions for our next session

1. **Showcase pacing.** Try one ordinary walk. Should that immediately pay for the postcard, or should the first reward take two walks? The 60-coin introductory price is my provisional choice. The PRD suggests 100 as an example threshold.
2. **Replay incentives.** Today, repeating a walk can pay out again, including its completion bonus. Ending a walk early also lets a visitor restart and earn its first stamp again. Decide whether the intended incentive is repeat participation or discovering different places.
3. **Field eligibility.** On actual phones, record the distance and reported accuracy from each intended public stopping point and from across the street. The current settings are demo defaults. Public access, stairs, community feedback and physical-phone GPS testing are still open. [Field review checklist](../ROUTE_DATA.md#field-review-handoff)
4. **Language and reward appeal.** Have a fluent reviewer try the Japanese walkthrough and observe whether a first-time visitor understands how to move, check in and claim. The three coupons are fictional and carry no merchant redemption rights.

**Practical limits.** Data is local to a browser profile. Clearing browser storage removes it, and memory-only mode cannot survive reloads. Cross-tab serialization was verified in Chromium with Web Locks. Physical-device GPS, Safari, PWA installation and field accessibility remain unverified. The browser tests exercise product behavior independently of those field and Phase 4 checks.
