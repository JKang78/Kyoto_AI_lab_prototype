# Kyoto AI Lab prototype — walks and demo rewards

Explore three map-checked Kyoto walks and seven places in English or Japanese. The app has four tabs: **Explore** (the map, which is also the landing view), **Quests**, **Wallet** and **Settings**. On Explore, a draggable sheet rests at the bottom of the map. Its peek state shows the off-peak bonus window and a sample crowd snapshot; drag or tap the handle to see up to three route cards, then **Preview route** for the stop timeline. Try “river within 9 minutes” or “9分以内の川沿い” in the search bar. Search, filters and your chosen walk survive tab switches for this session. An active walk and its stamps survive reloads.

MapLibre draws stored pedestrian geometry over OpenFreeMap tiles. If the basemap fails, **Browse stored walks** opens the local catalog and **Retry map** tries the basemap again. The page itself must already have loaded. Access notes and route estimates come from the fixtures. Field inspection and community review are still open. See [the route data notes](ROUTE_DATA.md).

## Play a mission

Open **Quests → View on Map** and choose **Start demo walk**. The sheet gives way to a compact follow card: walk to the next stop, then simulate each check-in. Each stamp shows a receipt explaining its points. A three-stop walk earns 60 points at the standard rate, or 90 during the sample 06:00–10:00 (Kyoto time) off-peak window, which doubles check-in points. **Settings → Simulate the off-peak window** forces the window on for demos at other hours. In **Wallet**, unlock a fictional voucher with points, then **Redeem at store** opens a staff-facing screen with a six-digit code, a moving background and a five-minute countdown; holding **Staff: hold to confirm** marks it redeemed once. GPS walking uses the same route and wallet with explicit proximity check-ins.

Change thresholds, point awards, the off-peak schedule and voucher prices in [the game configuration](src/config/game.ts). A fresh replay can earn another set of stamps. Each voucher can be unlocked and redeemed once per browser progress record. Merchants, vouchers, the off-peak schedule and crowd levels are all labelled samples. [Phase 3 review](done/REVIEW_PHASE_3.md)

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. The first visit asks for a language and optional nickname. Both are stored in this browser's `localStorage`; returning visits open on Explore. Settings lets you edit the nickname and language, switch Kyoto Demo Mode on or off, and return to Explore with Recenter.

The map needs an internet connection to load OpenFreeMap tiles. It uses no API key. Keep its on-map attribution visible. Provider tradeoffs and terms are recorded in [`docs/DECISIONS.md`](DECISIONS.md).
Location permission is requested after **Use My Location** or **Start GPS walk** is tapped. Browser GPS requires HTTPS or localhost. A live fix stays at its actual coordinates, including outside Kyoto; low accuracy and errors are shown. **Demo Mode** uses a clearly labelled simulated point near Gion-Shijo and turns GPS off. GPS also stops when Explore is left; returning requires another tap to resume. The app does not save location history.
The MapLibre worker is served from `public/vendor/` because Next.js did not load its automatic worker URL reliably. When upgrading MapLibre, replace that worker file with the matching package version and retain its license notice.

## Quality checks

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

With the app running at localhost:3000, run the browser checks in a second terminal. Set `PHASE3_URL` to test a different local port. The tests fix the page clock at noon Kyoto time so point totals do not depend on the off-peak window.

```bash
npx playwright install chromium
npm run test:browser
```

## Structure

- `src/app/` — Next.js entry, global styles, metadata
- `src/components/` — four-tab shell and dock, onboarding, Quests, Wallet and redemption screens, shared snap sheet, dialog and placeholder fox avatar
- `src/locales/` — English and Japanese UI dictionaries
- `src/lib/` — route matching, translation, location and local profile persistence
- `src/data/` — curated geometry, place notes, source records and sample congestion cues
- `public/assets/` — locations for original mascot and pin art when supplied
- `references/` — visual references, retained from the starter kit

The manifest provides app identity and standalone display metadata. Install icons, service worker/offline shell, and device-level PWA testing remain in Phase 4. Vouchers, merchants and points are fictional.

For the verified Phase 0 scope and the starting point for Phase 1, see [`docs/done/PHASE_0_HANDOFF.md`](done/PHASE_0_HANDOFF.md).

## Project documents

- [Product specification](PROJECT_SPEC.md), [build plan](BUILD_PLAN.md), [architecture](ARCHITECTURE.md), [design guidelines](DESIGN_GUIDELINES.md), and [decision log](DECISIONS.md).
- [Open decisions](TODOS.md), [known bugs](BUGS.md), [test checklist](TEST_CHECKLIST.md), and [route data and field checks](ROUTE_DATA.md).
- [Mascot artwork](MASCOT_ASSETS.md) and [pin artwork](PINS_ASSETS.md).
- [Completed plans, handoffs, reviews, and audits](done/), including the [visual audit](done/visuals.md). Open follow-up work is tracked in the current documents and in the individual reports.
