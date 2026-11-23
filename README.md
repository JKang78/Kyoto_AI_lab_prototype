# Kyoto AI Lab prototype — walks and demo rewards

Explore three map-checked Kyoto walks and seven places in English or Japanese. The app has four tabs: **Explore** (the map, which is also the landing view), **Missions**, **Rewards** and **Me**. On Explore, a draggable sheet rests at the bottom of the map. Its peek state shows a demo crowd snapshot (and a bonus banner only while a demo scenario is on); drag or tap the handle to see up to three route cards, then **Preview route** for the stop timeline. Try “river within 9 minutes” or “9分以内の川沿い” in the search bar. Search, filters and your chosen walk survive tab switches for this session. An active walk and its stamps survive reloads.

MapLibre draws stored pedestrian geometry over OpenFreeMap tiles. If the basemap fails, **Browse stored walks** opens the local catalog and **Retry map** tries the basemap again. The page itself must already have loaded. Access notes and route estimates come from the fixtures. Field inspection and community review are still open. See [the route data notes](docs/ROUTE_DATA.md).

## Play a mission

Open **Missions → View on Map** and choose **Start demo walk**. The sheet gives way to a compact follow card marked **DEMO MODE**: walk to the next stop, then simulate each check-in. Each stamp shows a receipt explaining its points and whether the check-in was simulated or GPS-based (a GPS check-in shows presence near a stop, never how you travelled). A three-stop walk earns 60 points. During a walk a dark HUD at the top shows the walk and one bead per stop, map pins gain a 印 seal once collected, and the next stop shows a "!". Finishing a walk opens a celebration with the fox, the walk's seals, a demo points count-up, and links to the stamp book and Rewards. A dismissible toast and tab dots announce a newly affordable demo voucher or new seals. The reward pill on Explore shows progress toward the next voucher, and the fox's speech bubble suggests the next step.

**Bonus scenarios.** The PRD separates two incentives: a *bus-relief* bonus (walk instead of a crowded bus) and a *quiet-hour* bonus (visit a place outside its busy hours). No real bus or crowd data exists, so neither runs on its own. A presenter can switch on one hypothetical scenario in **Me → Demo controls**; bus relief doubles check-ins on *Shijō to Yasaka* only, quiet hour on *Yasaka and Maruyama Park* only, and every surface labels it a demo scenario.

In **Rewards**, unlock a fictional voucher with points, then **Redeem at store** opens a **demo redemption preview** labelled `DEMO — NOT REDEEMABLE` in English and Japanese. Holding **Demo: hold to mark as used** only updates this browser. No real shop accepts these vouchers and the code is never checked.

**QR deep links.** `/?route=<walk-id>` (for example `/?route=kamo-riverside`) opens that walk on Explore without the welcome form; nothing is saved until the visitor changes a setting. Unknown ids fall back to the normal welcome.

Change thresholds, point awards, demo scenarios and voucher prices in [the game configuration](src/config/game.ts). A fresh replay can earn another set of stamps. Each voucher can be unlocked and marked used once per browser progress record. Merchants, vouchers, bonus scenarios and crowd levels are all labelled demo samples; walks without a crowd sample show **Unknown**, and step-free access shows **Step-free: unknown** until surveyed. The demo/production reward boundary is documented in [`src/config/environment.ts`](src/config/environment.ts). [Phase 3 review](docs/done/REVIEW_PHASE_3.md)

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. The first visit asks for a language and optional nickname. Both are stored in this browser's `localStorage`; returning visits open on Explore. Settings lets you edit the nickname and language, switch Kyoto Demo Mode on or off, and return to Explore with Recenter.

The map needs an internet connection to load OpenFreeMap tiles. It uses no API key. Keep its on-map attribution visible. Provider tradeoffs and terms are recorded in [`docs/DECISIONS.md`](docs/DECISIONS.md).
Location permission is requested after **Use My Location** or **Start GPS walk** is tapped. Browser GPS requires HTTPS or localhost. A live fix stays at its actual coordinates, including outside Kyoto; low accuracy and errors are shown. **Demo Mode** uses a clearly labelled simulated point near Gion-Shijo and turns GPS off. GPS also stops when Explore is left; returning requires another tap to resume. The app does not save location history.
The MapLibre worker is served from `public/vendor/` because Next.js did not load its automatic worker URL reliably. When upgrading MapLibre, replace that worker file with the matching package version and retain its license notice.

## Quality checks

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

With the app running at localhost:3000, run the browser checks in a second terminal. Set `PHASE3_URL` to test a different local port. The tests fix the page clock so dates in receipts and logs are stable.

```bash
npx playwright install chromium
npm run test:browser
```

## Structure

- `src/app/` — Next.js entry, global styles, metadata
- `src/components/` — four-tab shell and dock, onboarding, Missions, Rewards and demo redemption screens, shared snap sheet, dialog and fox avatar
- `public/places/` — Wikimedia Commons place photos with credits in `src/data/place-photos.json` (`python3 scripts/fetch_place_photos.py`); draft place stories with sources live in `src/data/place-stories.ts`
- `public/fonts/` — self-hosted web fonts (SIL OFL 1.1); regenerate with `python3 scripts/fetch_fonts.py`
- `design/mascot/originals/` — official 2048 px fox masters (source of truth); `scripts/normalize_mascot.py` derives the served copies in `public/assets/mascot/`
- `src/locales/` — English and Japanese UI dictionaries
- `src/lib/` — route matching, translation, location and local profile persistence
- `src/data/` — curated geometry, place notes, source records and sample congestion cues
- `public/assets/` — locations for original mascot and pin art when supplied
- `references/` — visual references, retained from the starter kit

The manifest provides app identity and standalone display metadata. Install icons, service worker/offline shell, and device-level PWA testing remain in Phase 4. Vouchers, merchants and points are fictional.

For the verified Phase 0 scope and the starting point for Phase 1, see [`docs/done/PHASE_0_HANDOFF.md`](docs/done/PHASE_0_HANDOFF.md).

## Project documents

- [Product specification](docs/PROJECT_SPEC.md), [build plan](docs/BUILD_PLAN.md), [architecture](docs/ARCHITECTURE.md), [design guidelines](docs/DESIGN_GUIDELINES.md), and [decision log](docs/DECISIONS.md).
- [Open decisions](docs/TODOS.md), [known bugs](docs/BUGS.md), [test checklist](docs/TEST_CHECKLIST.md), and [route data and field checks](docs/ROUTE_DATA.md).
- [Mascot artwork](docs/MASCOT_ASSETS.md) and [pin artwork](docs/PINS_ASSETS.md).
- [Completed plans, handoffs, reviews, and audits](docs/done/), including the [visual audit](docs/visuals.md). Open follow-up work is tracked in the current documents and in the individual reports.
