# Working on Kyoto AI Lab

Kyoto AI Lab is a mobile-first English/Japanese walking prototype built with Next.js, React, TypeScript and Tailwind. MapLibre displays curated walks over OpenFreeMap tiles. Profiles and game progress stay in the browser. Adding a backend, sign-in, paid APIs or live congestion data requires explicit approval.

## Find the relevant guidance

Read the section of [the project spec](docs/PROJECT_SPEC.md) that covers the change. For UI work, use the [UI and interaction backlog](docs/visuals.md) and [design guidelines](docs/DESIGN_GUIDELINES.md). The [decision log](docs/DECISIONS.md) resolves discrepancies, including the older five-tab descriptions in the Cursor rules. The current dock is **Explore, Missions, Rewards, Me**. Explore opens on the map and Me contains settings.

Use the [build plan](docs/BUILD_PLAN.md), [open tasks](TODO.md) and [known bugs](docs/BUGS.md) for milestone status. Keep changes within the requested milestone. Outline the affected files before a multi-file change and reuse the existing components and dependencies where they fit.

## Run and verify

Use Node **22.18 or newer** and npm. The unit tests import TypeScript directly.

```sh
npm ci
npm run dev
```

The dev server defaults to `http://localhost:3000`. For code changes, run `npm run typecheck`, `npm run lint` and the relevant tests. Use `npm test` for all unit tests or `node --test tests/game.test.mjs` for the game reducer. Use `npm run build` to check a public production build.

For browser checks, install Chromium with `npx playwright install chromium`. Leave the dev server running and run `npm run test:browser` in a second terminal. Set `PHASE3_URL` if the server uses another port. The public-build check skips unless `PUBLIC_URL` is set. To exercise it, build with the preview flag unset, run `npm start -- -p 3002`, then run the following in another terminal.

```sh
PUBLIC_URL=http://localhost:3002 node --test tests/browser/public-build.mjs
```

## Where changes belong

- **Navigation and Explore.** `src/app/page.tsx` renders `src/components/prototype-app.tsx`. The shell owns onboarding, tab state, shared location, filters and guest links such as `/?route=kamo-riverside`. Preserve the selected walk across tab switches and allow valid route links to open without creating a profile.
- **Map and list.** `src/components/map/kyoto-map.tsx` renders the pannable map. Keep provider attribution visible and expose the same walk facts and actions in list view. MapLibre controls marker positioning. When upgrading `maplibre-gl`, update the matching worker and retain its licence in `public/vendor/`.
- **Route and place data.** Edit sourced walking geometry and ordered stops in `src/data/kyoto-walks.ts`. Follow public pedestrian paths and resident guidance. Discovery in `src/lib/route-discovery.ts` matches text and filters deterministically. Add sources for facts in `src/data/place-stories.ts` and keep stories marked draft until local review. Preserve visible author, licence and source credits for place photos.
- **Game progress.** Send mutations through `act(action)` in `src/lib/game-store.ts`. Keep `transition` in `src/lib/game.ts` pure and return the same object for duplicate or invalid actions. Derive the balance from the ledger and preserve older saves through `decodeGame`. Tune points, GPS thresholds, scenarios and voucher prices in `src/config/game.ts`. Resetting progress must preserve the separate profile in `src/lib/profile.ts`.
- **Presentation.** Reuse the snap sheet, dialogs and other primitives in `src/components/ui.tsx`, the tokens in `src/app/globals.css` and the self-hosted fonts. Compare Explore changes with `references/map-tab-reference.png`. Add UI strings to both `src/locales/en.json` and `src/locales/ja.json`. Keep touch targets, safe-area spacing and reduced-motion behavior intact. Use text and symbols alongside crowd colors. Keep etiquette notices dismissible and reserve confirmation dialogs for deliberate actions.
- **Artwork.** Preserve the fox masters in `design/mascot/originals/`. Regenerate the served poses with `python3 scripts/normalize_mascot.py` (Pillow required). Regenerate the bundled fonts and their CSS with `python3 scripts/fetch_fonts.py` when font assets change.

## GPS, simulation and rewards

Request GPS after a user action on HTTPS or localhost. Stop the watch when leaving Explore or switching modes. Preserve the coordinates the browser reports, including fixes outside Kyoto. A GPS check-in requires a fresh, accurate fix within the stop radius (`liveEligible`). It establishes proximity only. Keep location history out of storage.

Gate simulated walks, check-ins and bonus switches with `PREVIEW_CONTROLS` in `src/config/environment.ts`. Development enables them. To include them in a presenter build, use `NEXT_PUBLIC_KYOTO_FLOW_PREVIEW=1 npm run build`. Label simulations in the UI. Bus-relief and quiet-hour bonuses apply only to their configured walks when a presenter activates the scenario.

All points, merchants and vouchers are fictional, including rewards earned from GPS check-ins in public builds. Preserve the `DEMO — NOT REDEEMABLE` label and the demo-only unlock guard. The [engineering spec](docs/ENGINEERING_SPEC.md) documents the separate server requirements for real issuance. Label crowd samples as demo data and show unknown for missing crowd observations or unsurveyed step-free access.
