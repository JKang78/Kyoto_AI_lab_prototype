# Known Bugs and UI/Code Issues

Audited on `2026-11-24` against `main` (`1dca433`, after merging `phase-2-review`).
All 11 unit/fixture tests (`npm test`), `npm run lint`, and `npm run typecheck` pass at this baseline; the items below are behavioral bugs, visual defects, and UX edge cases found by source and screenshot inspection.

## High

### 1. Live GPS check-in button can flicker disabled on fresh fixes
- **Where:** `src/lib/game.ts` (`liveEligible`, lines 20–29) and `src/components/walk-controls.tsx` (lines 32, 51–57)
- **What happens:** `liveEligible()` rejects any fix where `now < fix.timestamp`. However, `WalkControls` updates `now` only once per second via `window.setInterval(() => setNow(Date.now()), 1000)`. Whenever `watchPosition` delivers a new fix between 1-second ticks—or on phones whose geolocation `position.timestamp` is even a few milliseconds ahead of `Date.now()`—`now < fix.timestamp` evaluates to `true`, causing **Check in with GPS** to disable until the next interval tick (or flicker repeatedly on devices emitting fixes at >=1 Hz).
- **Why automated tests missed it:** Playwright's `.click()` auto-waits for the button to become enabled on the next 1-second tick.
- **Suggested fix:** Recompute/sync `now` when `location.fix?.timestamp` updates (or pass `Math.max(now, fix.timestamp)` when checking age within a small future clock-skew tolerance, while still rejecting clearly invalid timestamps). Add unit and browser tests for fixes arriving between ticks and small positive clock skew.

## Medium

### 2. Map overlays and markers overlap during an active walk on phone widths
- **Where:** `src/components/map/kyoto-map.tsx` (lines 222–234, 474–485), `src/app/globals.css` (lines 210–222); visible in `docs/review/phase-3/kamo-checkpoint.png` (390 px capture)
- **What happens:**
  - The `Sample: busy` congestion pill renders directly over the temporary `京` avatar marker and overlaps the `Demo point · GPS off` label behind pin `1`.
  - `.map-congestion-legend` (`bottom: 186px; right: 12px`) overlaps the bottom of the MapLibre `-` zoom control (`.maplibregl-ctrl-bottom-right` at `margin-bottom: 203px`).
  - The active walk HUD card (`.map-selected-callout.active-walk`) occupies a large portion of the visible map canvas at 390 px, and upper route stop pins can sit partly behind the top category chip bar.
- **Suggested fix:** Adjust vertical spacing/z-index for `.map-congestion-legend` vs. zoom controls, tune congestion cue marker offsets (or hide illustrative congestion cues while actively walking a mission), compact the active walk HUD, and re-verify screenshots at 360, 390, and 430 px.

### 3. Missions badge downgrades from "Completed" to "Ended early" after an aborted replay
- **Where:** `src/components/game-screens.tsx` (lines 20–27)
- **What happens:** Each mission card derives its status and stamp checklist solely from the latest run (`game.runs.filter(run => run.walkId === walk.id).at(-1)`). If a visitor completes a walk, starts a replay, and stops it early via **End this walk**, the mission badge switches from **Completed** to **Ended early** and the stamp book regresses to the aborted run's partial count.
- **Suggested fix:** Track or derive whether any run for that walk has completed (e.g., preserve completed status or display prior completions separately from an aborted replay).

### 4. Multi-tab Demo Mode state can drift after another tab toggles Demo Mode or resets progress
- **Where:** `src/components/prototype-app.tsx` (lines 89–91, 118)
- **What happens:** `PrototypeApp` keeps `deviceLocation` in local React state and only falls back to `game.demo` when `deviceLocation.mode === "unselected"`. If Tab A taps **Explore Kyoto in Demo Mode** on the Map tab (setting `deviceLocation.mode = "demo"`), and Tab B later turns Demo Mode off or clicks **Reset demo progress** in Settings, Tab A's local `deviceLocation` continues to override `game.demo === false`.
- **Suggested fix:** Keep `deviceLocation` solely for live GPS state and derive demo mode directly from persisted `game.demo` so cross-tab `storage` events keep both tabs aligned.

## Low / Polish

### 5. Settings progress card checkbox and reset dialog buttons lack matching styling
- **Where:** `src/components/prototype-app.tsx` (lines 65–74)
- **What happens:**
  - The sample busy-period bonus control uses an unstyled native `<input type="checkbox">` (small touch target) and lacks the `.settings-card-heading` icon layout used by the other Settings cards directly above it.
  - Inside the **Reset demo progress** `BottomSheet` (lines 70–74), the `Cancel` and `Clear progress` buttons are not wrapped in `.game-actions`, so they sit inline without flex gap.
- **Suggested fix:** Match the styled `location-demo-switch` pattern (or accessible 44 px touch target row) and wrap the reset modal actions in `.game-actions`.

### 6. Claimed vs. locked coupon buttons look visually identical on Rewards
- **Where:** `src/components/game-screens.tsx` (lines 43–45), `src/app/globals.css` (line 222); visible in `docs/review/phase-3/claimed-postcard.png`
- **What happens:** Both **Claimed** and **Earn N more coins** render as the same disabled primary purple button at `opacity: .62`, making completed claims harder to distinguish at a glance from unaffordable coupons.
- **Suggested fix:** Give claimed coupons a distinct visual treatment (e.g., muted badge/checkmark or secondary variant) separate from locked/insufficient-balance buttons.

### 7. Minor defensive validation gaps in storage decoding and query minute parsing
- **Where:** `src/lib/game-store.ts` (lines 23–29) and `src/lib/route-discovery.ts` (lines 22–28)
- **What happens:**
  - `decode()` invokes `value.runs.every(...)` and `value.claims.every(...)` without first checking `Array.isArray(...)` (handled by `try/catch`, so it falls back safely, but explicit array + unique-claim/single-active-run validation is cleaner).
  - `requestedMinutes()` dropped the earlier `value > 0` check when strict-limit parsing was added (`0 minutes` produces `{ value: 0, strict: false }`, which harmlessly triggers fallback, but restoring `value > 0` matches intent).

### 8. Pre-existing polish & tooling debt (carried forward)
- **Unwired pin asset path:** `src/config/assets.ts` defines `assetPaths.pins`, but `src/components/map/kyoto-map.tsx` does not consume it yet—dropping files into `public/assets/pins/` will not replace pins until wired.
- **Sub-44 px touch targets on a few map controls:** `.map-place-pin` is `42x42px` and the search preview close button is `34x34px` (`docs/PROJECT_SPEC.md` §11 recommends `>=44x44px`). Verify comfort on real phones.
- **Node test runtime warning:** `npm test` imports `.ts` files directly in Node without `"type": "module"` or an `engines.node` field in `package.json`, emitting `MODULE_TYPELESS_PACKAGE_JSON` warnings.
