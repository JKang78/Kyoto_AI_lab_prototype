# Kyoto AI Lab prototype — Phase 0

This repository contains the first milestone of the mobile-first Kyoto exploration prototype. The Map tab is a clearly labeled preview surface; the real map, GPS, routes, missions, coins, and coupons are reserved for later phases in `docs/BUILD_PLAN.md`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The first visit asks for a language and optional nickname. Both are stored in this browser's `localStorage`; returning visits open on the Map tab. Settings lets you edit the nickname and language.

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

The manifest provides app identity and standalone display metadata. Install icons, service worker/offline shell, and device-level PWA testing remain in Phase 4. This preview makes no claims of live location, map data, rewards, or partnerships.
