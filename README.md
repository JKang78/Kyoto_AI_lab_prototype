# Kyoto AI Lab prototype — Phase 1 map foundation

This repository contains the Phase 0 mobile shell and the first Phase 1 map foundation. The Map tab now shows a real, pannable Kyoto basemap from OpenFreeMap with MapLibre GL JS. Routes, GPS, missions, coins, and coupons remain separate tasks in `docs/BUILD_PLAN.md`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The first visit asks for a language and optional nickname. Both are stored in this browser's `localStorage`; returning visits open on the Map tab. Settings lets you edit the nickname and language.

The map needs an internet connection to load OpenFreeMap tiles. It uses no API key. Keep its on-map attribution visible. Provider tradeoffs and terms are recorded in [`docs/DECISIONS.md`](docs/DECISIONS.md).
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

The manifest provides app identity and standalone display metadata. Install icons, service worker/offline shell, and device-level PWA testing remain in Phase 4. This preview makes no claims of live location, rewards, or partnerships.

For the verified Phase 0 scope and the starting point for Phase 1, see [`docs/PHASE_0_HANDOFF.md`](docs/PHASE_0_HANDOFF.md).
