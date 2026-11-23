# Kyoto AI Lab prototype — walks and demo rewards

Explore three map-checked Kyoto walks and seven places in English or Japanese. Try “river within 9 minutes” or “9分以内の川沿い”, select the Kamo riverside walk, and open **See stops** to inspect a place. Switching tabs keeps your chosen walk for this session. An active mission and its collected stamps survive reloads.

MapLibre draws stored pedestrian geometry over OpenFreeMap tiles. If the basemap fails, **Browse stored walks** opens the local catalog and **Retry map** tries the basemap again. The page itself must already have loaded. Access notes and route estimates come from the fixtures. Field inspection and community review are still open. See [the route data notes](ROUTE_DATA.md).

## Play a mission

Open **Missions → View on Map**, open the selected walk’s details and choose **Start demo walk**. Collect the first stamp, move to the next stop, and simulate each check-in. A three-stop walk earns 60 coins under the ordinary scenario. Open Rewards to claim the introductory postcard. Settings provides a sample busy-period bonus and a confirmed progress reset. GPS walking uses the same route and wallet with explicit proximity check-ins.

Change thresholds, coin awards and coupon prices in [the game configuration](../src/config/game.ts). A fresh replay can earn another set of stamps. Each coupon can be claimed once per browser progress record. [Phase 3 review](done/REVIEW_PHASE_3.md)

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. The first visit asks for a language and optional nickname. Both are stored in this browser's `localStorage`; returning visits open on the Map tab. Settings lets you edit the nickname and language, switch Kyoto Demo Mode on or off, and return to Map with Recenter.

The map needs an internet connection to load OpenFreeMap tiles. It uses no API key. Keep its on-map attribution visible. Provider tradeoffs and terms are recorded in [`docs/DECISIONS.md`](DECISIONS.md).
Location permission is requested after **Use My Location** or **Start GPS walk** is tapped. Browser GPS requires HTTPS or localhost. A live fix stays at its actual coordinates, including outside Kyoto; low accuracy and errors are shown. **Explore Kyoto in Demo Mode** uses a clearly labelled simulated point near Gion-Shijo and turns GPS off. GPS also stops when the Map tab is left; returning requires another tap to resume. The app does not save location history.
The MapLibre worker is served from `public/vendor/` because Next.js did not load its automatic worker URL reliably. When upgrading MapLibre, replace that worker file with the matching package version and retain its license notice.

## Quality checks

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

With the app running at localhost:3000, run the browser checks in a second terminal. Set `PHASE2_URL` to test a different local port.

```bash
npx playwright install chromium
npm run test:browser
```

## Structure

- `src/app/` — Next.js entry, global styles, metadata
- `src/components/` — five-tab shell, onboarding, shared button/card/pill/sheet, temporary marker
- `src/locales/` — English and Japanese UI dictionaries
- `src/lib/` — route matching, translation, location and local profile persistence
- `src/data/` — curated geometry, place notes, source records and sample congestion cues
- `public/assets/` — locations for original mascot and pin art when supplied
- `references/` — visual references, retained from the starter kit

The manifest provides app identity and standalone display metadata. Install icons, service worker/offline shell, and device-level PWA testing remain in Phase 4. Coupons and coins are fictional.

For the verified Phase 0 scope and the starting point for Phase 1, see [`docs/done/PHASE_0_HANDOFF.md`](done/PHASE_0_HANDOFF.md).

## Project documents

- [Product specification](PROJECT_SPEC.md), [build plan](BUILD_PLAN.md), [architecture](ARCHITECTURE.md), [design guidelines](DESIGN_GUIDELINES.md), and [decision log](DECISIONS.md).
- [Open decisions](TODOS.md), [known bugs](BUGS.md), [test checklist](TEST_CHECKLIST.md), and [route data and field checks](ROUTE_DATA.md).
- [Mascot artwork](MASCOT_ASSETS.md) and [pin artwork](PINS_ASSETS.md).
- [Completed plans, handoffs, reviews, and audits](done/), including the [visual audit](done/visuals.md). Open follow-up work is tracked in the current documents and in the individual reports.
