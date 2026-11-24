# Kyoto Flow: implementation audit

**Audited commit:** `b0b322d` on `prototype-engineering` (2026-11-24). **Remediation:** Phase 1–2 applied on 2026-11-24 (uncommitted at time of writing); see §0. Sections 1–8 below are the original audit baseline, kept for traceability; where they conflict with §0, §0 is current.
**Compared against:** [`docs/PRODUCT_REQUIREMENTS.md`](../PRODUCT_REQUIREMENTS.md) (PRD), [`docs/design_system.md`](../design_system.md) (DS), [`docs/ENGINEERING_SPEC.md`](../ENGINEERING_SPEC.md) (ENG).

**Bottom line:** The prototype is a polished, fully client-side **R0 visual prototype**. Every check passes and the UI matches much of the design system. But it has **no backend**: points, check-ins, vouchers and redemption all live in browser `localStorage`, are decided by the browser, and can be edited by the user. That is acceptable for R0 only if every reward surface is unmistakably a demo. Several surfaces fall short of that today, and the "off-peak" bonus mixes up the two campaign types the PRD keeps separate. The P0 list below is small and keeps the existing visual design.

---

## 0. Remediation status (2026-11-24)

Navigation decision applied: **Explore / Missions / Rewards / Me** (settings inside Me), Explore stays the default map screen.

### Resolved

| Audit item | Resolution | Files | Verified by |
|---|---|---|---|
| P0-1 Demo labelling of vouchers (§5.2, FR-14, AC-10) | Every ticket shows a `DEMO — NOT REDEEMABLE` badge; Rewards strip leads with it; the redemption screen is now a **"Demo redemption preview"** showing the label in EN and JA plus "No real shop accepts it, and this code is not checked anywhere". "Show this to staff" and "Staff: hold to confirm" are gone ("Demo: hold to mark as used"). Merchant terms and hours are worded as examples | `rewards-screen.tsx`, `redeem-sheet.tsx`, `src/config/game.ts`, locales, `globals.css` (`.demo-badge`) | `tests/browser/game.mjs` (both languages; no staff wording; badge on used ticket); deep-link journey test (3 tickets, 3 badges) |
| P0-6 Transit voucher (§5.2, DS §6.3) | Removed. Replaced by a fictional washi postcard set; Rewards tabs are now Available / My vouchers / **Used** (no Transit tab) | `src/config/game.ts`, `rewards-screen.tsx` | Unit test: no voucher mentions transit/subway/bus/rail; every merchant marked fictional in EN and JA |
| P0-2 Incentive concepts conflated, invented 06:00–10:00 window (§5.4, PRD §9, AC-04) | Clock-based window deleted. Two separate concepts, `bus_relief` and `quiet_hour`, exist only as **hypothetical demo scenarios** a presenter switches on in **Me → Demo controls**. Each applies to one walk only (bus relief: Shijō to Yasaka; quiet hour: Yasaka and Maruyama Park) and is labelled "demo scenario" in the banner, route card, Missions card, receipt and log. No bonus banner shows unless a scenario is on. The bus-causal copy was removed; Missions states "Check-ins confirm a visit near each stop, not how you travelled" | `src/config/game.ts` (`DEMO_SCENARIOS`), `src/lib/game.ts` (`activeBonus`), `missions-screen.tsx`, `kyoto-map.tsx`, `prototype-app.tsx`, locales | Unit test: scenarios off by default, scoped to their walk, time of day never changes points; browser tests: ja flow with bus-relief scenario, deep-link test asserts no bonus by default |
| P0-3 Crowd defaults to Calm (§5.5, FR-07, AC-03) | New `unknown` level (dashed badge, "?" glyph); a walk with no sample is **Unknown**, never Calm. Cues carry `kind: "demo_sample"`, `observedAt: null`; legend reads "Demo sample levels · no source or timestamp · not live data" | `src/data/sample-congestion.ts`, `ui.tsx`, `kyoto-map.tsx`, locales | Unit test (`sampleWalkCrowd`); discovery test asserts 4-level legend |
| P0-4 "No mapped steps" (§5.5, FR-09, AC-02) | Now **"Step-free: unknown"** (JA 段差なし：未確認). Walks with mapped stairs still say "Mapped stairs" | `kyoto-map.tsx`, locales | Deep-link test asserts the label and that "No mapped steps" never appears |
| §5.3 Demo Mode vs GPS verification | Follow card shows a vermilion **DEMO MODE · simulated location, not GPS** badge; each receipt states "Simulated check-in · not GPS-verified" or "GPS check-in · shows you were near this stop, not how you travelled". Boundary documented and enforced: `src/config/environment.ts` (`REWARD_MODE = "demo"`), every voucher `isDemo: true`, `clientMayUnlock()` refuses anything else | `walk-controls.tsx`, `src/config/environment.ts`, `src/lib/game.ts` | Unit test (`clientMayUnlock`, `REWARD_MODE`); deep-link test asserts the badge |
| P0-5 QR deep link (J-01, FR-01, AC-01) | `/?route=<walk-id>` opens that walk's detail on Explore (full sheet) as a guest, with no welcome form and nothing saved. Language defaults from the browser. Unknown ids fall back to the welcome form | `prototype-app.tsx` | Browser tests: QR → route → demo walk → voucher → demo redemption; unknown id → welcome |
| P0-7 Broken README links | All 12 fixed (and the visual-audit link now points to `docs/visuals.md`) | `README.md` | Link check script: every relative link resolves |
| §6 Mascot speckles, framing, clipping, payload | Masters moved untouched to `design/mascot/originals/`. `scripts/normalize_mascot.py` clears stray background pixels, centres and scales each state to fit the ring with the same margin and similar apparent size, and writes 512 px copies (≈120 KB each, down from ≈2 MB). The CSS `scale(1.18)` crop was removed | `scripts/normalize_mascot.py`, `public/assets/mascot/*`, `globals.css`, `docs/MASCOT_ASSETS.md` | Rendered all 5 states at 36/44/88 px and on dark: no clipping, consistent size, specks gone (walking bounding box went from the full 2048² canvas to the fox only) |
| Tab naming (P1) | Explore / Missions / Rewards / Me in UI, code (`missions-screen.tsx`, `rewards-screen.tsx`, `Tab` ids) and docs | `bottom-nav.tsx`, `prototype-app.tsx`, locales, README, CLAUDE.md | All browser tests use the new labels |
| Touch targets | Segmented controls raised from 40 px to 44 px (needed for the new scenario control) | `globals.css` | Touch-target browser test covers the scenario buttons |
| Saved progress compatibility | Game state version 3. Version-2 saves keep earned points, drop the off-peak switch and refund the retired transit voucher; version-1 saves still upgrade | `src/lib/game.ts` | Unit tests for v1 and v2 upgrades |

### Verification (after remediation)

| Check | Result |
|---|---|
| `npm run typecheck` | Pass (exit 0) |
| `npm run lint` | Pass (exit 0) |
| `npm test` | Pass: 22/22 (adds scenario separation, demo-only vouchers, v2 upgrade, unknown crowd) |
| `npm run build` | Pass: static `/`; only Node `DEP0205` tooling deprecation warnings |
| `npm run test:browser` (dev server) | Pass: 15/15 (adds QR-to-demo-reward journey and unknown-route fallback) |

### Still outstanding

- **No backend (R1, P2 below).** Points, check-ins and voucher state remain in `localStorage` and are editable. The redemption code is still a predictable client hash; it is now honestly labelled as unchecked. Real issuance and redemption require ENGINEERING_SPEC §5–7.
- ~~**Demo controls are visible in every build.**~~ **Resolved:** gated behind `NEXT_PUBLIC_KYOTO_FLOW_PREVIEW=1` (or dev); verified against a plain production build by `tests/browser/public-build.mjs`.
- **Live GPS check-ins still earn the same demo points** as simulated ones (both are demo; the receipt says which). A future server must reject `mode: "demo"` events in production.
- **Deep link path** is `/?route=` (as requested), not the spec's `/explore?route=`.
- **Resolved in the release pass:** contrast (`--ink-muted` now 5.0:1, all text ≥ 12 px), Map/List toggle (list view), etiquette toast, Bike and Luggage chips (unavailable with explanations). The fox appears on voucher unlock (toast) and celebration.
- **Still open:** manual starting-point picker; Illustrated/Standard map style toggle; voucher expiry (JST) and expired state; mission criteria/expiry text; fox on Welcome; "Hidden gems" chip wording; localized loading screen and manifest; Delete-local-data and privacy notice; service worker/offline; real-device testing; native Japanese review.
- **Mascot:** confirm ownership/licence of the five files; one faint speck remains beside the walking fox's ear (inside the cleanup distance, not visible at UI sizes); low-accuracy marker treatment not built.
- **Tooling:** Turbopack's dev watcher stopped picking up `globals.css` edits twice; deleting `.next/dev` and restarting fixes it.

---

## 1. Current architecture

### Stack and dependencies (`package.json`)

| Kind | Package | Version | Role |
|---|---|---|---|
| Runtime | `next` | 16.2.9 | App Router; one static page `/` (prerendered, no API routes) |
| Runtime | `react`, `react-dom` | 19.2.0 | UI |
| Runtime | `maplibre-gl` | 6.19.0 | Vector map; worker served from `public/vendor/` |
| Runtime | `motion` | 14.14.0 | Spring physics for the sheet, receipts and stamps |
| Runtime | `lucide-react` | 0.553.0 | 1.5 px stroke UI icons |
| Dev | `tailwindcss` 4.1.17, `typescript` 5.9.3, `eslint` 9.39.4 + `eslint-config-next`, `playwright` 1.65.1 | | Styling, types, lint, browser tests |

Fonts (Shippori Mincho, Plus Jakarta Sans, Noto Sans JP) are self-hosted at build time via `next/font/google`. There is **no** database, auth, server route handler, service worker, analytics or environment configuration. The InsForge backend described in `~/AGENTS.md` is not connected.

### Data flow

```
Fixtures (src/data/kyoto-walks.ts, sample-congestion.ts, src/config/game.ts)
        │  read-only, bundled into the client
        ▼
PrototypeApp (src/components/prototype-app.tsx)
  ├─ profile store  → localStorage "kyoto-ai-lab.profile.v1"  (src/lib/profile.ts)
  ├─ game store     → localStorage "kyoto-ai-lab.progress.v1" (src/lib/game-store.ts)
  │     act(action) ─► transition(game, action, Date.now())  (src/lib/game.ts, pure reducer)
  │     navigator.locks serialises writes across tabs; "storage" events sync tabs
  ├─ location state (in memory) ← navigator.geolocation.watchPosition (kyoto-map.tsx)
  └─ tabs: Explore (KyotoMap) · Quests · Wallet · Settings
External network: OpenFreeMap style/tiles (map), Google Maps (outbound link only), OSM (links)
```

The browser decides everything: check-in eligibility (`liveEligible`, `src/lib/game.ts`), the off-peak multiplier (device clock, `offPeakWindow` at `src/lib/game.ts:20`), unlocks and redemption (`src/lib/game.ts:165`).

### Screens and major components

| Screen / component | File | Notes |
|---|---|---|
| Welcome (language + nickname) | `src/components/prototype-app.tsx:32` | Shown on every first visit, before any route |
| Explore: map, search, theme chips, crowd legend | `src/components/map/kyoto-map.tsx` | Full-height MapLibre, OpenFreeMap Liberty restyled to washi tones |
| `SnapSheet` peek/half/full | `src/components/ui.tsx:74` | Non-modal, `motion` spring, keyboard-cyclable handle |
| Route cards, walk detail, place detail | `kyoto-map.tsx` | Max 3 cards; Google Maps handoff at `:584` |
| Follow card + stamp receipt | `src/components/walk-controls.tsx` | Demo movement simulation or GPS check-in |
| Quests: surge card, segments, stamp book | `src/components/quests-screen.tsx` | |
| Wallet: progress arc, tickets, activity log | `src/components/wallet-screen.tsx` | |
| Redemption screen | `src/components/redeem-sheet.tsx` | Code, shimmer, 5:00 countdown, hold-to-confirm |
| Settings | `prototype-app.tsx` (`SettingsScreen`) | Language, nickname, Demo Mode, simulate off-peak, reset, about |
| `FoxAvatar` (5 states) | `src/components/ui.tsx:131` | Uses official art from `public/assets/mascot/` |

---

## 2. Verification run (exact results)

Node v26.7.0 (`engines` requires ≥ 22.18). Browser tests ran against the dev server on port 3001.

| Check | Command | Result |
|---|---|---|
| Type check | `npm run typecheck` | **Pass**: exit 0, no diagnostics |
| Lint | `npm run lint` | **Pass**: exit 0, no warnings |
| Unit tests | `npm test` | **Pass**: 19/19 (`tests/game.test.mjs`, `route-discovery.test.mjs`, `route-data.test.mjs`) |
| Production build | `npm run build` | **Pass**: exit 0; routes `/`, `/_not-found`, `/icon.svg`, all static. Only output besides success: Node `DEP0205 module.register()` deprecation warnings from tooling |
| Browser tests | `PHASE3_URL=http://localhost:3001 npm run test:browser` | **Pass**: 13/13 (EN/JA × 360/390/430 px discovery; earn → unlock → redeem; GPS gating; replay; multi-tab sync; touch targets) |

**No failures were recorded.** Gaps in coverage: no accessibility automation (axe), no 200% text-zoom or 320 px test, no real iOS Safari or Android Chrome run, no offline test, and no security or concurrency tests. There is nothing server-side to test.

Other findings from the run:
- The repo-root `README.md` was moved from `docs/` and **12 of its relative links are broken** (`ARCHITECTURE.md`, `BUGS.md`, `BUILD_PLAN.md`, `DECISIONS.md`, `DESIGN_GUIDELINES.md`, `MASCOT_ASSETS.md`, `PINS_ASSETS.md`, `PROJECT_SPEC.md`, `ROUTE_DATA.md`, `TEST_CHECKLIST.md`, `TODOS.md`, `done/visuals.md`).
- During development, Turbopack's dev cache (`.next/dev`) once kept serving a stale stylesheet across restarts and had to be deleted. Treat this as a tooling hazard.

---

## 3. Real vs simulated: what each feature actually is

| Feature | Classification | Evidence |
|---|---|---|
| Map rendering, pan/zoom, attribution | **Real integration** (OpenFreeMap public tiles, no SLA) | `kyoto-map.tsx` `STYLE_URL` |
| Route geometry for 3 walks | **Real data, curated fixture.** OSM foot-router output, map-checked, *not field-verified* | `src/data/kyoto-walks.ts`; `tests/route-data.test.mjs` |
| Places (7) and access notes | **Curated fixture**, `communityInputStatus: "not-consulted"` | `src/types/routes.ts` |
| Route search and recommendation | **Local deterministic matching**, not AI or ranking | `src/lib/route-discovery.ts` |
| Browser GPS fix, accuracy, outside-Kyoto | **Real browser API**, foreground only | `kyoto-map.tsx` `requestLiveLocation` |
| GPS check-in eligibility | **Client-side check only.** 75 m radius, ≤ 50 m accuracy, ≤ 30 s fix age | `src/lib/game.ts` `liveEligible`; `src/config/game.ts:5` |
| Demo Mode movement and check-ins | **Simulation**, user toggle in production UI | `walk-controls.tsx`; Settings switch |
| Crowd levels | **Hardcoded**: 2 sample cues, no timestamp, source or expiry | `src/data/sample-congestion.ts:11` |
| Off-peak 2× window 06:00–10:00 JST | **Hardcoded schedule**, device clock, user-forceable | `src/config/game.ts:15`; `prototype-app.tsx:85` |
| Points, unlocks, voucher state | **Mocked ledger in `localStorage`**, user-editable | `src/lib/game-store.ts:5` |
| Merchants and vouchers | **Fictional**, labelled "(fictional)" | `src/config/game.ts` `COUPONS` |
| Redemption code | **Mock**: deterministic FNV hash of claim id and unlock time; never verified | `src/lib/game.ts:62` |
| Staff confirmation | **Mock**: a hold button on the *customer's* own device | `redeem-sheet.tsx:65` |
| Google Maps handoff | **Real outbound link** (walking directions, waypoints) | `kyoto-map.tsx:584` |
| PWA | **Manifest only**: no icons, no service worker, no offline state; manifest still says "Kyoto AI Lab prototype" | `public/manifest.webmanifest` |
| Mock APIs | **None.** No fetch layer exists, real or mocked | — |

---

## 4. Feature inventory

### Working (meets intent for R0)
- Four-tab floating dock with Explore as the landing view and no Home dashboard (DS §4; PRD FR-03). Tabs keep the selected walk, search and filters.
- EN/JA parity: 195 keys in each locale, tested for parity and placeholders; language switch mid-walk keeps the walk (AC-09).
- Kyoto Ink & Washi tokens, Shippori Mincho / Plus Jakarta / Noto Sans JP, tabular numbers, 1.5 px icons, no emoji icons (DS §3).
- Draggable non-modal sheet with a button alternative to dragging (DS §6.1 Layer 3).
- Route cards (max 3) with hook, time, distance, reward line; walk detail with stop timeline, accessibility and resident notes, Google Maps handoff.
- Opt-in foreground GPS with explicit denied, timeout, unavailable, low-accuracy and outside-Kyoto states (FR-10, FR-11 partially). GPS stops on tab exit and page hide.
- Map failure recovery: "Browse stored walks" works with the basemap down.
- Idempotent client reducer: duplicate or out-of-order check-ins and double unlocks are no-ops; cross-tab unlock race yields one claim (tested).
- Official fox art wired to the map marker (idle/walking), the follow card (idle/walking/arrived) and the completion receipt (reward).
- Reduced motion respected (CSS plus `useReducedMotion` for springs).

### Partially working
| Feature | Gap | Spec ref |
|---|---|---|
| Map / List equivalence | The sheet lists cards and stops, but there is no Map/List toggle and no full list mode | FR-04, DS §6.1 |
| Crowd display | Has a shape, text and "sample" label, but no timestamp, source type or expiry, and no `unknown`. Walks without cues default to **Calm** | FR-07, AC-03, PRD §8 |
| Accessibility status | "No mapped steps" reads like step-free; there is no tri-state verified/unverified/unknown | FR-09, AC-02 |
| Missions | Walks double as missions; no explicit criteria, expiry or "what is verified" statement | FR-12, DS §6.2 |
| Rewards sections | Available / My vouchers / **Transit**; spec wants Unlocked / My Coupons / Used & Expired, and transit only with a real partner. No expiry date or expired state | DS §6.3 |
| Demo labelling | Wallet disclosure strip and redeem strip exist, but individual tickets have no `DEMO — NOT REDEEMABLE` mark, and the redeem screen is titled "Show this to staff" | FR-14, AC-10 |
| Guest entry | No account, but the Welcome form must be submitted first; no skip, no persona, no interests | DS §5, J-01 |
| Contrast and type scale | `--ink-muted #8C857B` on washi is **3.44:1** (DS asks for `#706A62`, 5.04:1). 48 rules use 9–12 px text, below the 13 px caption minimum | DS §3.1–3.2 |
| Naming | Tabs are Explore / Quests / Wallet / Settings; PRD and DS now specify Explore / **Missions / Rewards / Me** | PRD §5, DS §4 |

### Mocked (acceptable only as labelled demo)
Points ledger, voucher unlock and redemption, staff confirmation, redemption code, crowd levels, the off-peak schedule, the Demo Mode walk, and merchants. See §3.

### Missing
| Missing | Spec ref |
|---|---|
| QR deep link `/explore?route=<id>` that lands on the route without onboarding | J-01, FR-01, AC-01 |
| Manual starting-point picker when GPS is denied (only "Demo Mode" exists) | FR-10, AC-01 |
| Illustrated / Standard map toggle (only one restyled basemap) | FR-05/06, DS §6.1 |
| Travel mode pill (Walk / Rail + Walk) | DS §6.1 |
| Non-blocking geofenced etiquette toast (fox `warning`) | FR-17, DS §8 |
| Save (heart), saved routes | FR-16, DS §6.4 |
| Voucher expiry (JST), expired and revoked states | DS §6.3, ENG §4 |
| Offline indicator, service worker, cached route | FR-18, ENG §10 |
| Me: persona, mobility/shade prefs, privacy notice, `Delete local data` (only "reset progress"), report issue, safety links | DS §6.4 |
| **Entire server domain**: guest session, participations, server check-ins, grants, vouchers, merchant auth, admin suspension, audit log | ENG §2–7 (R1) |
| Bus-relief vs quiet-hour campaign model | PRD §9, AC-04 |

---

## 5. Critical risk audit

### 5.1 GPS check-ins prove neither walking nor bus avoidance (**high**)
- `liveEligible` (`src/lib/game.ts`) runs in the browser. Coordinates, accuracy and timestamps are untrusted (ENG §2 rule 1), and DevTools sensor override passes trivially.
- Stamps award points for *being near a stop*. Nothing measures the path walked or the transport mode. The UI copy is mostly safe, but `surgeWhy` (`src/locales/en.json:132`) says walking in the window "keeps you off the busiest morning buses". That is a causal claim the app cannot support (PRD §3, §11; ENG §6).
- **Fix:** reword to "Check-ins confirm a visit near each stop, not how you travelled" (DS §11 sample copy). Server validation is R1 work.

### 5.2 Coupon issuance and redemption security (**critical for R1; P0 labelling for R0**)
- No server. `claims` and `redeemedAt` sit in `localStorage` and can be forged by editing storage or calling the reducer.
- The redemption code (`src/lib/game.ts:62`) is a **deterministic, predictable hash**. "Show a new code" (`redeem-sheet.tsx:64`) restarts the timer but shows **the same code**. The shimmer and countdown have no security value (ENG §7).
- "Staff: hold to confirm" runs on the customer's phone, which the DS explicitly rejects (§6.3).
- **For R0:** acceptable only with every voucher state marked `DEMO — NOT REDEEMABLE`, and with the screen not framed as something a real shop could accept. "Show this to staff" (`en.json:170`) invites exactly that misreading. **For R1:** implement ENG §5/§7 (presentation token, authenticated merchant view, transactional single redemption).

### 5.3 Demo mode must not issue real rewards (**R0 OK, structurally unsafe**)
- Demo stamps award the same points as GPS stamps (`src/lib/game.ts:178`), and those points unlock vouchers. `stamp.mode` is recorded but never used to gate anything.
- Demo Mode and "Simulate off-peak" are user toggles in the shipped Settings UI (`prototype-app.tsx:85`). ENG §3 requires `DEMO_MODE` to be a **server environment assertion** and simulated walking to exist only in development/preview.
- Today no real reward exists, so nothing real can leak. But the architecture has no environment separation for when real offers arrive. **Fix (R1):** server environment flag; production rejects `mode: "demo"` events and `is_demo` offers. **Fix (now, cheap):** an env guard such as `NEXT_PUBLIC_PREVIEW` that hides the simulation switches outside preview builds.

### 5.4 Peak-bus avoidance vs off-peak tourism incentive (**high, wording and model**)
- The single campaign is labelled **"off-peak"** but justified as **bus relief during the morning rush** (`surgeWhy`). PRD §9, AC-04 and DS §6.2 require these to be distinct campaigns with distinct labels: *bus-relief bonus* (during crowded bus periods) vs *quiet-hour bonus* (outside a destination's busy period).
- None of the three walks is tied to a specific bus corridor. The bonus applies to any check-in on any walk, so it rewards *walking in the morning*, not *avoiding a bus*.
- The banner shows a bonus whenever the window is active. DS §6.1 says to show a campaign bonus "only if an actual offer is eligible now".
- 06:00–10:00 is invented. ENG §7 says windows must come from researched corridor patterns, and "2×" is an experiment variable.
- **Fix (P0):** choose one framing. The recommendation for the demo journey is a **quiet-hour sample**: "Quiet-hour bonus (demo schedule)", with no claim about buses. Alternatively, keep "Bus-relief bonus (demo)" only after tying it to one named corridor. Delete the causal copy. Long term, model `campaigns` with `kind` per ENG §4.

### 5.5 Route safety, accessibility and crowd provenance (**high**)
- **Routes:** map-checked OSM fixtures, not field-walked, and not resident-reviewed (`communityInputStatus: "not-consulted"`). The UI calls them "Curated" and shows the review status only on place detail. FR-19 requires a review record before R1 publication.
- **Accessibility:** `walkNoMappedSteps` ("No mapped steps", `kyoto-map.tsx:80`) is easy to read as step-free. Per FR-09 it should be **"Step-free: unknown"** unless verified. The "Luggage-friendly" chip (`en.json:53`) is a shorthand DS §5 warns against; it also has no supporting data.
- **Crowd:** `sampleWalkCrowd` (`src/data/sample-congestion.ts:19`) returns **"calm" when there is no data**. PRD §8 and AC-03 say unknown must never become calm. Cues carry no `kind`, `observedAt` or `expiresAt` (ENG §8). There is no stale-data path.
- **Bike chip** (`en.json:55`) is clickable and always yields an empty result. DS §6.1 says to remove it or label it "Pilot planned".
- **"Hidden gems"** chip: DS §2 voice guidance warns against calling places hidden.

### 5.6 PWA, localization and offline (**medium**)
- No service worker, offline banner, cached route or install icons. Offline, the map fails to load. "Browse stored walks" still works because the fixtures are bundled, but nothing says "offline".
- Manifest name and `background_color` (`#FFF8F1`) predate the redesign; the loading screen hardcodes the English "Kyoto AI Lab prototype" (`prototype-app.tsx:149`), unlocalized.
- The off-peak window uses the **device clock**, so changing the phone's time grants 2×.
- The Japanese copy has not been reviewed by a native speaker (DS §10). Dates format in JST via `Intl` (good).
- Real-device iOS Safari and Android Chrome have never been tested; DS §12 requires that before calling the design complete.

### 5.7 Other correctness and privacy notes
- `localStorage` as the reward source of truth contradicts ENG §11. Fine for R0, and must change for R1.
- Location is never persisted (good). There is no privacy notice and no "Delete local data" covering both profile and progress (Settings reset clears progress only).
- `FoxAvatar`'s DS contract includes a **low-accuracy** state; the live marker has a fixed 10 px halo, not an accuracy-scaled ring (`globals.css` `.map-fox-marker[data-live]`).

---

## 6. Mascot asset audit

### Inventory

| State (DS §7) | File | Pose matches DS? | Bounding box (of 2048²) | Asset quality |
|---|---|---|---|---|
| `idle` | `public/assets/mascot/fox-idle.png` | ✅ calm sitting pose | 1249 × 1763 | Clean alpha |
| `walking` | `public/assets/mascot/fox-walking.png` | ✅ side-on stride | **2048 × 2048 (whole canvas)** | ⚠️ **Background matte noise**: 286,549 semi-transparent pixels; a speckled grid is visible behind the fox at 88 px |
| `arrived` | `public/assets/mascot/fox-arrived.png` | ✅ ears up, holding a lantern | 1996 × 2028 | ⚠️ light stray specks near edges |
| `reward` | `public/assets/mascot/fox-reward.png` | ✅ arms raised, celebrating | 2048 × 1959 | ⚠️ light stray specks near edges |
| `warning` | `public/assets/mascot/fox-warning.png` | ✅ polite shush | 1459 × 1841 | Clean alpha |

- **All five states are present**; none are missing. All are 2048 × 2048 RGBA PNGs with transparent corners, about 1.9–2.4 MB each.
- The character is consistent across the set: cream and tan fur, dark ear tips and paws, a vermilion-brown neckerchief, round dark eyes and brown linework. Treat these as the source of truth.
- **Missing DS state:** the `FoxAvatar` component contract lists a *low-accuracy* treatment. That does not need new art; it should be a visual treatment (dimmed avatar plus accuracy ring) on `idle`. **No new artwork should be generated without approval.**
- **Provenance:** `references/fox-avatar-reference.png` describes the original fox sheet as "ChatGPT-generated … inspiration", and the official assets closely follow that style. DS §7 asks for original artwork. Before any public pilot, **confirm ownership and licence of these five files** and record it in `docs/MASCOT_ASSETS.md`.

### Current integration (rendered check)

The ring treatment (`globals.css:129–130`: gold ring, `object-fit: contain; transform: scale(1.18) translateY(6%)`) was rendered for all states at 36, 44 and 88 px:
- **Inconsistent scale:** `walking` fills its whole canvas, so it renders noticeably larger than the other four in the same ring.
- **Clipping:** at 88 px the walking tail and the reward ears and raised paws touch or cross the ring edge. The uniform 1.18 zoom suits `idle` but not wide or tall poses.
- **Background artefacts** from `fox-walking.png` show through on the cream ring.

| Surface | Current | Recommended |
|---|---|---|
| Map location marker | `idle`, or `walking` during a walk (`kyoto-map.tsx:339`) ✅ | Keep. Add accuracy-scaled ring for live GPS; never snap a live fix to the route |
| Follow card | `idle` / `walking` / `arrived` (`walk-controls.tsx:81`) ✅ | Keep. `arrived` should mean "checkpoint available" and be announced in text (already true) |
| Stamp receipt | 印 seal, no fox | Keep the seal; optional brief `reward` fox (≤ 800 ms, suppressed under reduced motion) |
| Mission completion | `reward` at 36 px in peek receipt (`kyoto-map.tsx:503`) ✅ | Larger (≥ 64 px) with a live region "Walk complete" |
| Voucher unlocked | none | `reward` fox plus live region "Voucher unlocked" (DS §7 accessible equivalent) |
| Onboarding / Welcome | woodblock print only (`prototype-app.tsx:39`) | Add `idle` fox beside the value line on screen 1 (DS §5); keep the print |
| Etiquette notices | not built | `warning` fox in the planned non-blocking `EtiquetteToast` (FR-17) |
| Empty or error states | none | Optional `idle` fox on map error and empty Quests/Wallet; text stays primary |

### Recommended asset changes (need approval; edit masters, don't redraw)
1. Re-export clean alpha for `fox-walking.png` (and touch up arrived and reward) **from the original source**, removing the background speckle. Do not repaint the character.
2. Normalise framing: trim every state to the same padding around the character, so one CSS rule frames all five consistently, or store a per-state focal box in `src/config/assets.ts`.
3. Ship optimised derivatives (for example 256 px and 512 px WebP or PNG with alpha) for UI use; keep the 2048 px PNGs as masters, for example in `design/mascot/`. This drops the payload from about 10 MB of masters.
4. Replace the single `scale(1.18)` crop with per-state framing so no pose is clipped at 36–88 px.

---

## 7. Prioritised fixes

Effort: S < ½ day, M ≈ 1–2 days, L = multi-day. All P0 items keep the existing visual design.

### P0: required for an honest, reliable R0 demo
| # | Fix | Files | Effort | Verify |
|---|---|---|---|---|
| P0-1 ✅ | Mark every voucher state `DEMO — NOT REDEEMABLE` (ticket, wallet summary, redeem screen); retitle the redeem screen to "Demo redemption preview" and the staff button to "Demo: hold to mark used". Remove "Show this to staff" | `src/locales/*.json`, `wallet-screen.tsx`, `redeem-sheet.tsx` | S | Browser test asserts the label on each ticket state and dialog (AC-10) |
| P0-2 ✅ | Split or reframe the bonus: rename to **"Quiet-hour bonus (demo schedule)"**, or bus-relief tied to a named corridor; delete the bus-causal `surgeWhy` copy; add "Check-ins confirm a visit, not how you travelled" | `en/ja.json`, `quests-screen.tsx`, `kyoto-map.tsx` | S | Copy review; unit test unchanged; grep shows no "off-peak … bus" claims (AC-04) |
| P0-3 ✅ | Crowd honesty: add `unknown`; default to unknown (not calm); add `kind` and `updatedAt` to sample cues and show "Demo schedule · <time>" | `sample-congestion.ts:19`, `ui.tsx` `CrowdBadge`, locales | S | Unit test: walk with no cue resolves to `unknown`; legend shows four levels (AC-03) |
| P0-4 ◐ (label done; Luggage chip open) | Accessibility truth: replace "No mapped steps" with "Step-free: unknown (not surveyed)"; rename "Luggage-friendly" chip or hide it until data exists | `kyoto-map.tsx:80`, locales, `route-discovery.ts` | S | Browser test reads the label on all 3 cards (AC-02) |
| P0-5 ✅ | QR deep link: `/?route=<walk-id>` (later `/explore?route=`) opens that walk's detail, with Welcome skippable (default EN, language switch available) | `prototype-app.tsx`, `kyoto-map.tsx` | M | Playwright: fresh context → `/?route=kamo-riverside` shows the walk detail with no Welcome (AC-01) |
| P0-6 ◐ (voucher done; Bike chip open) | Remove the sample transit voucher and the Transit filter (no transit partner); remove or label "Pilot planned" for the Bike chip | `src/config/game.ts:49`, `wallet-screen.tsx:87`, locales | S | Wallet shows 2 vouchers and no Transit segment |
| P0-7 ✅ | Fix the 12 broken README links (prefix `docs/`) | `README.md` | S | Link check script returns none |

### P1: spec alignment, still R0
- Tab labels **Missions / Rewards / Me** with Settings inside Me (PRD §5, DS §4). This needs a product decision, since Quests/Wallet were chosen earlier.
- Contrast: `--ink-muted` → `#706A62`; raise 9–11 px text to ≥ 13 px captions (DS §3.1–3.2); add an axe check to Playwright.
- Manual starting-point picker on GPS denial (Kyoto Station / Gion-Shijo / Kawaramachi) (FR-10).
- Map / List toggle with full list equivalence; Illustrated / Standard style toggle sharing identical geometry (FR-04–06).
- Voucher expiry in JST plus Used & Expired section (DS §6.3).
- Mission cards state criteria, expiry and "what is verified" (FR-12).
- Hide Demo Mode and Simulate-bonus switches behind a preview-build flag (ENG §3).
- Mascot: asset clean-up and framing (§6), fox on Welcome and voucher unlock, accuracy ring.
- Non-blocking `EtiquetteToast` with the `warning` fox, once per zone per day (FR-17).
- Localise the loading screen; update the manifest name and colours; add PWA icons.
- "Delete local data" (profile and progress) plus a short bilingual privacy notice (DS §6.4).

### P2: R1 operational pilot (backend required)
- Choose a backend and write the ADRs (ENG App. B). An InsForge project already exists for this user (Postgres-based, per `~/AGENTS.md`); it is a candidate, but PostGIS, RLS and staff auth must be confirmed.
- Server guest session, participations, server-validated idempotent check-ins (`ST_DWithin`), mission completion and quota-safe grants (ENG §5–7).
- Presentation tokens, authenticated merchant redeem view, transactional single redemption with concurrency tests (AC-07).
- Environment isolation: `DEMO_MODE` as a server assertion; production rejects demo events and offers (AC-06).
- Admin route suspension (AC-08), report intake, audit log.
- Service worker with cached route and voucher terms and an "Offline" banner (ENG §10).
- Real-device GPS field calibration; route field audit and resident review.

---

## 8. Minimum changes for one reliable end-to-end demo journey

**Target journey (PRD §15, ENG M1 exit):** scan QR → route preview → map or list guidance → check-ins (demo) → nonredeemable voucher → demo redemption confirmation, in EN and JA, on a phone, without misleading anyone.

What already works end to end: preview → start demo walk → 3 simulated check-ins → completion → unlock → hold-to-confirm. It is covered by `tests/browser/game.mjs`. The minimum additions are:

1. **P0-5 deep link**, so the QR code lands on the walk (the entry point is the only missing link in the chain).
2. **P0-1 labels**, so the voucher can't be mistaken for a real one.
3. **P0-2 bonus framing**, so the one incentive shown makes an honest claim.
4. **P0-3 and P0-4 provenance and step-free wording** on the route card, the first thing a stakeholder reads.
5. **P0-6** remove the transit voucher.
6. Pin the demo run to a known state: either `?demoTime=09:00` handled only in preview builds, or keep **Settings → Simulate** for the presenter. Document which one in the README demo script.
7. Run the journey once on a real iPhone (Safari) and Android (Chrome) over HTTPS, for example on a preview deployment, and record results in `docs/TEST_CHECKLIST.md`.

Estimated effort: about 2 days for items 1–6, plus a device session. No visual redesign, no backend.

### Verification checklist for the demo build
- [ ] `npm run typecheck && npm run lint && npm test && npm run build` all exit 0.
- [ ] `npm run test:browser` passes, including new tests for the deep link, DEMO labels, unknown crowd and step-free wording.
- [ ] Fresh incognito session at `/?route=kamo-riverside`: walk detail visible within one screen, no forced form.
- [ ] Every voucher surface (locked, unlocked, redeem dialog, redeemed) shows `DEMO — NOT REDEEMABLE` in both languages.
- [ ] No UI string claims bus avoidance, live crowds, step-free status, a real merchant or a real transit ticket (grep the locale files).
- [ ] Real iOS Safari and Android Chrome: GPS prompt only on tap, denial leaves browsing usable, sheet and dock usable with system text at 200%.
