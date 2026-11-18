# Kyoto AI Lab prototype — Phase 1 map and location

This repository contains the Phase 0 mobile shell and the Phase 1 map and location foundation. The Map tab shows a real, pannable Kyoto basemap from OpenFreeMap with MapLibre GL JS. It offers optional browser GPS and a separate simulated Kyoto point. Routes, missions, coins, and coupons remain separate tasks in `docs/BUILD_PLAN.md`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The first visit asks for a language and optional nickname. Both are stored in this browser's `localStorage`; returning visits open on the Map tab. Settings lets you edit the nickname and language, switch Kyoto Demo Mode on or off, and return to Map with Recenter.

The map needs an internet connection to load OpenFreeMap tiles. It uses no API key. Keep its on-map attribution visible. Provider tradeoffs and terms are recorded in [`docs/DECISIONS.md`](docs/DECISIONS.md).
Location permission is requested only after **Use My Location** is tapped. Browser GPS requires HTTPS or localhost. A live fix stays at its actual coordinates, including outside Kyoto; low accuracy and errors are shown. **Explore Kyoto in Demo Mode** uses a clearly labelled simulated point near Gion-Shijo and turns GPS off. GPS also stops when the Map tab is left; returning requires another tap to resume. The app does not save location history.
The MapLibre worker is served from `public/vendor/` because Next.js did not load its automatic worker URL reliably. When upgrading MapLibre, replace that worker file with the matching package version and retain its license notice.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Structure

- `src/app/` — Next.js entry, global styles, metadata
- `src/components/` — five-tab shell, onboarding, shared button/card/pill/sheet, temporary marker
- `src/locales/` — English and Japanese UI dictionaries
- `src/lib/` — translation and local profile persistence
- `public/assets/` — locations for original mascot and pin art when supplied
- `references/` — visual references, retained from the starter kit

The manifest provides app identity and standalone display metadata. Install icons, service worker/offline shell, and device-level PWA testing remain in Phase 4. This preview makes no claims of active routes, rewards, or partnerships.

For the verified Phase 0 scope and the starting point for Phase 1, see [`docs/PHASE_0_HANDOFF.md`](docs/PHASE_0_HANDOFF.md).
