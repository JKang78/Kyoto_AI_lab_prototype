# Kyoto AI Lab prototype — walking route discovery

Explore three map-checked Kyoto walks and seven places in English or Japanese. Try “river within 9 minutes” or “9分以内の川沿い”, select the Kamo riverside walk, and open **See stops** to inspect a place. Switching tabs keeps your chosen walk for this session. Reloading starts a fresh map session.

MapLibre draws stored pedestrian geometry over OpenFreeMap tiles. If the basemap fails, **Browse stored walks** opens the local catalog and **Retry map** tries the basemap again. The page itself must already have loaded. Access notes and route estimates come from the fixtures. Field inspection and community review are still open. See [the route data notes](docs/ROUTE_DATA.md).

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. The first visit asks for a language and optional nickname. Both are stored in this browser's `localStorage`; returning visits open on the Map tab. Settings lets you edit the nickname and language, switch Kyoto Demo Mode on or off, and return to Map with Recenter.

The map needs an internet connection to load OpenFreeMap tiles. It uses no API key. Keep its on-map attribution visible. Provider tradeoffs and terms are recorded in [`docs/DECISIONS.md`](docs/DECISIONS.md).
Location permission is requested only after **Use My Location** is tapped. Browser GPS requires HTTPS or localhost. A live fix stays at its actual coordinates, including outside Kyoto; low accuracy and errors are shown. **Explore Kyoto in Demo Mode** uses a clearly labelled simulated point near Gion-Shijo and turns GPS off. GPS also stops when the Map tab is left; returning requires another tap to resume. The app does not save location history.
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

The manifest provides app identity and standalone display metadata. Install icons, service worker/offline shell, and device-level PWA testing remain in Phase 4. This preview makes no claims of active routes, rewards, or partnerships.

For the verified Phase 0 scope and the starting point for Phase 1, see [`docs/PHASE_0_HANDOFF.md`](docs/PHASE_0_HANDOFF.md).
