# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## UI/UX Source of Truth
- Always follow `docs/kyoto_flow_agent_ui_ux_experience_engineering_spec.md` (the Kyoto Flow spec) for all frontend changes. Where it conflicts with the honesty rules below, the rules win; see the 2026-11-24 entry in `docs/DECISIONS.md`.
- Never add a separate Home dashboard, KPI stat grids, emoji UI icons, or blocking etiquette modals.
- Default landing view is the Map tab; all rewards are geofenced/QR check-in coupons, never step counts.

## Project

Mobile-first, bilingual (EN/JA) Kyoto walking-exploration PWA prototype: Next.js 16 + React 19 + TypeScript + Tailwind 4, MapLibre over OpenFreeMap tiles (no API key). It is a **visual-first prototype**. All routes data is local fixtures, all points, merchants and vouchers are fictional, and there is no backend, auth, or database. `docs/ARCHITECTURE.md` forbids paid APIs, databases, real sign-in, and live congestion until someone explicitly approves them. That includes the InsForge backend described in the home-directory AGENTS.md, which this repo doesn't use.

Source of truth: `docs/PROJECT_SPEC.md`. Read the relevant section before editing. Development goes phase by phase (`docs/BUILD_PLAN.md`). Phases 0–3 are done, and Phase 4 (PWA icons, service worker, HTTPS deploy, QA) is what remains. `docs/TODOS.md` and `docs/BUGS.md` track open work. Completed plans and reviews are in `docs/done/`.

## Commands

Requires Node >= 22.18 (unit tests import `.ts` files directly via Node's native type stripping, with no build step).

```bash
npm run dev            # http://localhost:3000
npm test               # node --test tests/*.test.mjs (pure logic: game, route discovery, route data)
npm run lint
npm run typecheck
npm run build
node --test tests/game.test.mjs                          # one test file
node --test --test-name-pattern="radius" tests/game.test.mjs   # one test by name
```

Browser tests (Playwright, `tests/browser/*.mjs`) need the dev server already running in another terminal. They stub the OpenFreeMap style request. Use `PHASE3_URL`/`PHASE2_URL` to target another port.

```bash
npx playwright install chromium
npm run test:browser
```

After changes, run typecheck, lint, and the relevant tests, and report the results honestly.

## Architecture

- **Single client shell.** `src/app/page.tsx` renders `src/components/prototype-app.tsx`, which owns the welcome flow, the four-tab floating dock (Explore / Missions / Rewards / Me via `bottom-nav.tsx`; settings live inside Me), the Me screen, the shared location state, session-scoped search/filter state, and the `/?route=<walk-id>` QR deep link (guest browsing, no welcome form). Missions and Rewards live in `missions-screen.tsx` and `rewards-screen.tsx`; the demo redemption preview is `redeem-sheet.tsx`.
- **Explore is the home screen.** `components/map/kyoto-map.tsx` is a client-only, full-height MapLibre map with floating search and theme chips. A non-modal `SnapSheet` (`ui.tsx`, `motion` springs, peek/half/full) holds the demo bonus banner (only while a scenario is on) and crowd strip (peek), up to three route cards (half), and the walk or place detail (full). While walking, `walk-controls.tsx` replaces the sheet with the follow card and a top walk HUD replaces search. Finishing a walk opens `celebration.tsx` (dismissible, not modal). The interaction layer from `docs/visuals.md` P0 (reward pill, fox speech bubble, pin seals, stamp slam, unlock toast, tab dots, Missions hero, Rewards voucher track) is built; keep new celebratory UI under 800 ms, skipped under reduced motion, with demo labels visible. Use `ConfirmDialog` only for deliberate actions (reset, end walk, redemption), never for tips.
- **Shared UI primitives** in `ui.tsx`: `SPRING` (380/32/0.9), `ICON_STROKE` (1.5), `haptic()`, `Segmented`, `CrowdBadge` (colour always paired with ●▲■ and text) and `FoxAvatar` (5 states, a neutral placeholder until art lands in `public/assets/mascot/`).
- **Game state is a pure reducer plus an external store.** `src/lib/game.ts` defines `Game`/`Run`/`Stamp`/`Claim` and a pure `transition(game, action, now)`. It returns the *same object* when an action is invalid or a duplicate, and that is how idempotency works (no double stamps or claims from repeated GPS callbacks). `decodeGame` validates persisted JSON and its invariants (for example, at most one active run) and upgrades version-1 saves (coins → points; retired coupons refunded). It also upgrades version-2 saves (off-peak switch dropped; retired transit voucher refunded). Stamps record their multiplier, campaign kind and time so receipts and the Rewards log can explain every point. There is no clock-based bonus: `activeBonus()` returns a bonus only when a presenter has switched on a demo scenario (`bus_relief` or `quiet_hour`, kept separate per PRD §9) and only for that scenario's walks. `src/lib/game-store.ts` wraps this with `useSyncExternalStore` over `localStorage` key `kyoto-ai-lab.progress.v1`, serializes writes through `navigator.locks`, and falls back to memory when storage fails. Every mutation goes through `act(action)`. Balance is derived (`balance()`), never stored.
- **Tunables** (points, demo scenarios and their walks, check-in radius, GPS accuracy/age thresholds, voucher catalogue, redemption timings) live in `src/config/game.ts`.
- **Demo vs real rewards.** `src/config/environment.ts` (`REWARD_MODE = "demo"`) documents the boundary: everything in the client ledger is a demo, every voucher has `isDemo: true`, and `clientMayUnlock()` refuses anything else. Never add real reward issuance to this client; it belongs to the server path in `docs/ENGINEERING_SPEC.md` §5–7. Every voucher surface must show `DEMO — NOT REDEEMABLE`.
- **Mascot assets.** Masters in `design/mascot/originals/` are never edited. Run `python3 scripts/normalize_mascot.py` (needs Pillow) to regenerate the served 512 px copies in `public/assets/mascot/`.
- **Interaction layer P1** (`docs/visuals.md`): map side rail (List / Crowd info / Recenter / Help), `help-sheet.tsx`, route labels on lines with collision hiding, walk-end goal marker, seasonal sprite burst at check-in (`glyphs.tsx` `kyotoSeason`), `SlideToConfirm` for the demo redemption, theme-glyph seals (`glyphs.tsx`) everywhere a stamp appears, ticket illustrations, Me passport header, fox `EmptyState`. Never set `position` on MapLibre marker elements: it overrides MapLibre's absolute positioning and displaces pins.
- **Place content (P2).** `src/data/place-stories.ts` holds sourced EN/JA draft stories (status must stay `"draft"` until local review; never add a fact without a source). `src/data/place-photos.json` + `public/places/` hold Commons photos; credits must stay visible (`place-media.tsx`). Per-place seal drawings are in `glyphs.tsx` (`PLACE_SEAL_PATHS`). `tests/place-content.test.mjs` enforces sources, licences and coverage.
- **Preview gate.** `PREVIEW_CONTROLS` (`src/config/environment.ts`) is true in dev and with `NEXT_PUBLIC_KYOTO_FLOW_PREVIEW=1`; wrap any simulation control (Demo Mode, demo walks, scenarios) in it and give public builds wording that doesn't mention them. `tests/browser/public-build.mjs` verifies a plain build (needs `PUBLIC_URL`).
- **List view and etiquette.** The map has a list mode (`viewMode`, lifted to `prototype-app.tsx`) that must keep parity with the map's facts and actions. Etiquette zones are in `src/lib/etiquette.ts` (messages restate walk resident notes; once per zone per Kyoto day). `tests/release.test.mjs` enforces text contrast ≥ 4.5:1 and a 12 px minimum font size.
- **Dev server caveat.** Turbopack's dev watcher has twice stopped picking up `globals.css` edits. If styles look stale, stop the dev server, delete `.next/dev`, and restart.
- **Route data.** `src/data/kyoto-walks.ts` holds the curated walks and places with stored pedestrian geometry and source records, typed by `src/types/routes.ts`. `tests/route-data.test.mjs` checks that stops lie on the line in itinerary order and that source references resolve. Never fabricate or straight-line route geometry. `src/lib/route-discovery.ts` is deterministic EN/JA text/chip/minute-budget matching. Don't present it as AI.
- **Location.** `src/lib/location.ts` keeps real GPS (opt-in, `watchPosition`, stopped on Explore exit or mode change) separate from Kyoto Demo Mode (a labelled simulated point). A live check-in requires `liveEligible()`: an active, fresh, accurate fix within the radius. A live fix outside Kyoto stays at its real coordinates. Offer Demo Mode instead of teleporting.
- **Profile** (nickname + locale) is a separate `localStorage` store in `src/lib/profile.ts`. A settings reset clears game progress only.
- **i18n.** `src/lib/i18n.ts` `translate(locale, key, values)` reads `src/locales/en.json` and `ja.json`. `MessageKey` is derived from `en.json`, so add each key to both files. Browser tests look up button labels from these JSON files.
- The MapLibre worker is served from `public/vendor/`. When you upgrade `maplibre-gl`, replace that file with the matching version and keep its license notice.

## Rules (from `.cursor/rules/`)

- Label all simulated content (demo check-ins, sample congestion, fictional rewards). Never imply live congestion, real AI routing, redeemable coupons, partnerships, or location verification from a demo.
- Keep the change to the smallest coherent scope. Reuse existing components (`components/ui.tsx`) and CSS tokens in `globals.css`. Don't redesign unrelated screens, switch libraries, or add packages without a reason tied to the current phase. Outline multi-file changes before implementing.
- UI: read `docs/DESIGN_GUIDELINES.md` first. The map stays the dominant, genuinely pannable canvas (never a screenshot background). Compare Explore work against `references/map-tab-reference.png`. Use the Kyoto Ink & Washi tokens in `globals.css` (washi `#FAF8F4`, sumi `#1C1917`, purple `#782459` reserved for primary actions, antique gold `#C69C4D`, vermilion `#C83E37`); fonts are Shippori Mincho 700 (titles), Plus Jakarta Sans and Noto Sans JP, **self-hosted** in `public/fonts/` with `src/app/fonts.css` generated by `python3 scripts/fetch_fonts.py` (never switch back to `next/font/google`: this network refuses parallel Google Fonts downloads, which broke builds). Avoid an overly pink or generic-SaaS look. Keep provider attribution visible. Use replaceable placeholders for mascot and pin art (see `docs/MASCOT_ASSETS.md` and `docs/PINS_ASSETS.md`), and don't invent branded characters.
- No dead controls. Respect touch targets, safe-area insets, contrast, and `prefers-reduced-motion`. Don't hardcode English strings.
- Don't route tourists into quiet residential areas just to move crowds.
