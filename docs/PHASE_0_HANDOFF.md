# Phase 0 handoff

**Status:** Complete. The Phase 0 implementation is published on GitHub as `bc45b9a` (`Implement Phase 0 app shell and onboarding`). The equivalent original commit in this checkout is `69fb92f`.

## What is ready

- Next.js, React, TypeScript, Tailwind CSS, ESLint, and a production build script.
- Mobile shell with fixed, safe-area-aware navigation in the required order: Home, Map, Rewards, Missions, Settings. Map is the default tab.
- Kyoto Purple and supporting CSS tokens; reusable button, pill, card, bottom sheet, and swappable mascot marker components.
- English and Japanese dictionaries. The welcome screen collects an optional nickname and language; both persist in `localStorage`. Settings can edit them. A returning visit skips onboarding and opens Map.
- Phase 0 content on every tab. The Map tab is visibly labeled as a preview, and inactive missions/rewards are described honestly.
- Manifest identity and standalone metadata. The original artwork paths are configured in `src/config/assets.ts` and reserved under `public/assets/`.

## Verification completed

- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm run build` — passed.
- `npm run dev` — served the app locally.
- Chrome responsive previews at **360 × 800**, **390 × 800**, and **430 × 800**: text, cards, and all five navigation items remained usable. Home, Map, and Settings were visually reviewed; Rewards and Missions were opened through the navigation.
- Japanese settings were visually reviewed at 430 px. Switching languages and reloading retained the chosen language; a returning visit opened the Map tab.

## Deliberately deferred

- Geographic map, map SDK/provider choice, GPS, route fixtures, search, location cards, and check-ins.
- Coin balances, stamps, coupon claims, and live or simulated reward logic.
- Production mascot and pin artwork. The current `京` marker is a temporary layout placeholder.
- Install icons, service worker/offline shell, HTTPS deployment, and real-device install testing. The manifest alone does not establish installability.

## Start Phase 1

Follow `docs/BUILD_PLAN.md` and `docs/ARCHITECTURE.md`: compare MapLibre with a legitimate tile provider against Google Maps, record the SDK choice in `docs/DECISIONS.md`, then replace the Map preview with a real pannable Kyoto basemap and attribution. Keep the five-tab shell, dictionaries, and profile persistence intact. Do not use either reference screenshot as a static map background.

To run this milestone locally, use `npm install` and `npm run dev`, then open `http://localhost:3000`.
