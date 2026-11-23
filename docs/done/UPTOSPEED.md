# Kyoto AI Lab prototype — up to speed

Audit date: 2026-11-19 (Japan time). Baseline: commit `8e04799` (`manual push`).

## 1. My assessment

This is a small, working-code prototype of a bilingual, map-first Kyoto walking exploration app. Its intended hook is to make walking rewarding through a fox guide, discoveries, stamps, missions, virtual coins, and example coupons, while respecting residents. The repository currently implements the **exploration and route-discovery foundation**. It does not yet implement the **game and reward loop** that makes the product proposition testable.

The best description of its current maturity is: **Phase 0 implemented; Phase 1 implemented with device QA outstanding; Phase 2 substantially implemented in code, with route field validation and current browser regression checks outstanding; Phase 3 unimplemented; Phase 4 partly seeded.** Phase labels describe repository evidence, not a certification that every acceptance gate passed.

The strongest work is the separation of real GPS from simulation, sourced route fixtures, honest limitations, and a deliberately lean architecture. The most important next step is a single persisted, playable route → checkpoint → mission → coin → demo coupon flow. More map decoration or an AI integration would currently do less to prove the concept.

## 2. What this product is meant to be

`PROJECT_SPEC.md` is the baseline product specification. It describes a mobile-first PWA with five tabs in this order: Home, Map, Rewards, Missions, Settings. Map opens after onboarding and on a returning visit. English and Japanese are required across the experience.

The hypothesis is that appealing, themed walks and local incentives could encourage alternatives to crowded buses. This repository provides **no evidence that congestion has actually been reduced**, and implements no transport or city integration.

The baseline intentionally needs no database, real account, payments, paid AI, or merchant integration. Their absence is appropriate scope control. Interactive demo missions and rewards, by contrast, are part of the approved baseline and remain missing.

Original fox and pin artwork is expected from the team. The included reference images are inspiration, not production assets. The app currently uses a temporary `京` avatar and simple map pins. Do not mistake missing final artwork for permission to generate a replacement mascot.

## 3. What someone can actually do today

These behaviors are established by source inspection; fresh browser/device verification is distinguished in section 9.

1. Choose English or Japanese, enter an optional nickname, and start without registration.
2. Return with the nickname and language retained in this browser, when local storage works.
3. Open a real MapLibre map using OpenFreeMap's Liberty style, with warm color overrides, pan/zoom controls, and attribution.
4. See three stored dotted walks, seven place pins, a sample location marker, a static sample progress meter, and two explicitly illustrative congestion labels.
5. Search local walks by supported English/Japanese place, theme, and minute-budget terms. This is deterministic matching, not a model call or general destination search.
6. Choose a category, select a walk, see its highlighted path and numbered stops, open a stop/place card, and read access, accessibility, and resident notes. Unsupported category chips show an empty state.
7. Explicitly request browser GPS, see accuracy/error/outside-Kyoto status, and recenter. Live coordinates are not replaced with Kyoto coordinates.
8. Switch to a separate, fixed Kyoto Demo Mode point. This mode currently does **not** walk or progress along a route.
9. Visit Home and Settings; edit nickname/language; switch Demo Mode; return to Map through Settings Recenter.
10. Open Rewards and Missions, which are designed explanatory placeholders, not functioning game screens.

The sample `2/5` progress label and CSS progress fill are decorative sample state. They do not reflect checkpoints or a wallet. Tapping the header opens the Rewards placeholder.

### The route catalog

- **Shijō to Yasaka** (`shijo-yasaka`): culture; 798 m / 11 minutes; three stops; 59 stored geometry vertices. Ends before the west-gate stairs. No mapped stairs on this line does not establish accessible passage.
- **Kamo riverside sidewalk** (`kamo-riverside`): riverside; 639 m / 9 minutes; three stops; 38 vertices. Uses roadside sidewalks and crossings, not the lower riverbed.
- **Yasaka and Maruyama Park** (`yasaka-maruyama`): park; 666 m / 9 minutes; three stops; 86 vertices. Includes mapped stairs and service paths; not represented as wheelchair accessible.

There are seven distinct places because walks share stops, and six source records. Distances and times are stored pedestrian-router estimates. Each walk retains its routing URL, review date, source IDs, access limitations, and `communityInputStatus: "not-consulted"`. The review date is 2026-11-18.

`docs/ROUTE_DATA.md` documents earlier OSM segment matching. The original fetched OSM extracts, router responses, and comparison script are not retained as reproducible audit fixtures. This audit checked internal data consistency, not current real-world walkability or the external sources' continuing accuracy.

## 4. Architecture and data flow

The stack is Next.js **16.2.9**, React/React DOM **19.2.0**, TypeScript **5.9.3**, Tailwind **4.1.17**, MapLibre GL JS **6.19.0**, and Lucide React **0.553.0**, as pinned in `package.json` and the lockfile. Tailwind is configured, but most visual styling is ordinary CSS in a global stylesheet.

There is one application page, `/`. The five tabs are conditional React renders, not separate URL routes. There are no application API handlers, database models, authentication services, or AI calls in the tracked source. Next.js supplies the app shell/build runtime; product interactions are client-side.

- `src/app/page.tsx` renders `PrototypeApp`.
- `PrototypeApp` reads the local profile through `useSyncExternalStore`, controls the active tab, and owns transient location state.
- `KyotoMap` owns map initialization, GPS watcher lifecycle, search, selected walk/place, route panels, and map overlays. MapLibre is dynamically imported when that component mounts.
- `discoverRoutes` operates on the imported local walks and places. It normalizes accents, matches names/themes, extracts minute budgets, ranks candidates, and marks some unsupported requests as alternatives.
- MapLibre renders the stored GeoJSON; it does not calculate new walking paths. Stored routing URLs are provenance, not runtime route requests.
- `translate` reads JSON dictionaries and interpolates tokens. Both languages have 141 keys with matching key sets and interpolation tokens in this checkout.

### State and privacy boundaries

Only nickname and locale are persisted, under `kyoto-ai-lab.profile.v1`. The profile module catches storage errors and has an in-memory fallback. This fallback supports the current session; it does not make blocked storage survive a reload.

The selected tab and location mode/fix are parent React state. Search, selected walk/place, map viewport, and panels belong to the map component. Leaving Map unmounts that component, so those map-local selections are lost. A page refresh also resets location mode, including Demo Mode.

GPS is explicit and uses `watchPosition` with high accuracy, a 10-second timeout, and no accepted cached age. Fixes worse than 100 m accuracy are labelled imprecise. The Kyoto bounding rectangle is a context hint, not an administrative boundary or checkpoint geofence. This threshold must not be reused as the future check-in rule: the PRD proposes a separate, stricter check-in accuracy threshold.

The code clears the GPS watcher on Map unmount, Demo Mode selection, errors, and page hiding, and rejects stale callbacks using a version counter. Resume requires another explicit location action. Only the first fix recenters automatically; later fixes move the marker without continuously moving the camera. No location history is stored by application code.

The map still loads external style/tile/font/sprite resources through its provider. Absence of app telemetry does not mean the browser makes no third-party requests. This audit did not inspect provider logging or network traffic.

## 5. Complete tracked folder and file map

This inventory covers the 48 tracked files present at the audit baseline. `UPTOSPEED.md` is the new report. Generated dependencies/build outputs and `.git` internals are excluded from authored-code review.

### Root: instructions and build configuration

- `PROJECT_SPEC.md` — full product baseline, feature boundaries, suggested data contracts, phases, acceptance tests, and showcase script.
- `README.md` — run/check commands and Phase 1 overview; outdated about existing routes and discovery.
- `README_START_HERE.md` — original pre-scaffold starter-kit instructions; historical, misleading as a current setup entry point.
- `package.json` — package versions and dev/build/start/lint/typecheck/test scripts; no Node engine declaration.
- `package-lock.json` — exact npm dependency graph; includes transitive packages beyond the five direct runtime dependencies.
- `tsconfig.json` — strict TypeScript, Next plugin, bundler resolution, `@/*` alias, generated Next type inclusion.
- `next.config.ts` — Turbopack workspace root; otherwise minimal Next configuration.
- `next-env.d.ts` — Next type references, including generated `.next/types/routes.d.ts`; treat as framework-managed.
- `eslint.config.mjs` — Next web-vitals and TypeScript rules; excludes build output and vendored public worker code.
- `postcss.config.mjs` — Tailwind PostCSS plugin.
- `.gitignore` — generated output, dependencies, logs, environment files, and key files.
- `.cursorignore` — context exclusions for generated/sensitive files; not a security boundary.

### `.cursor/rules/`: project guidance

- `00-project-guardrails.mdc` — product scope, truthful simulation, lean changes, required checks.
- `10-frontend-design.mdc` — map-first hierarchy, visual references, accessibility, localization, swappable artwork.
- `20-map-gps.mdc` — map licensing, explicit GPS, mode separation, geometry validation, future award idempotency.

There is no repository-local `AGENTS.md`. An inherited `/Users/songdavid93374/AGENTS.md` describes a general InsForge backend setup. This repository has no tracked InsForge SDK dependency, client, backend configuration or implementation; the inherited note is not evidence that this app uses that backend. No backend was provisioned or inspected for this audit.

### `docs/`: working design and implementation notes

- `ARCHITECTURE.md` — recommended boundaries and intended state machine; mixes implemented foundations with future architecture.
- `BUILD_PLAN.md` — Phase 0–4 work and gates; roadmap, not a checked-off completion ledger.
- `DECISIONS.md` — map-provider choice, comparison rationale, Phase 1 GPS behavior and historical QA. Google was assessed from documentation, not through an equivalent running benchmark.
- `DESIGN_GUIDELINES.md` — brand, map hierarchy, other screens, localization, motion and interactions.
- `PHASE_0_HANDOFF.md` — historical Phase 0 completion and historical verification; its deferred list is not current project status.
- `ROUTE_DATA.md` — Phase 2 provenance, route review method, restrictions, licensing notes, deterministic discovery and public-use gates.
- `TEST_CHECKLIST.md` — manual quality, UI, GPS, reward, and PWA acceptance checklist; all boxes remain unchecked.

### `src/app/`: application entry and styling

- `page.tsx` — the single root page.
- `layout.tsx` — root HTML, global CSS import, metadata, manifest link, Apple web-app metadata, viewport/safe-area settings.
- `globals.css` — shared tokens and all screens/map/sheets/styles; includes responsive and reduced-motion rules, plus obsolete preview-map selectors.
- `icon.svg` — temporary flower-style application icon; not a complete install-icon asset set.

### `src/components/`: screens and shared UI

- `prototype-app.tsx` — app controller plus inline Welcome, Home, Settings, and shared placeholder Rewards/Missions screens. Owns profile integration, tab state and location state.
- `bottom-nav.tsx` — five tab IDs, translated labels, Lucide icons, active-state indication.
- `ui.tsx` — Button, Pill, Card, BottomSheet, MarkerPlaceholder. BottomSheet closes by X, scrim or Escape, but lacks modal focus management.
- `map/kyoto-map.tsx` — 456-line map controller and UI: dynamic SDK loading, worker URL, sources/layers, markers, GPS, search, category/results/details/stops/place panels, attribution and sample overlays. This is the main complexity hotspot.

### `src/data/`, `src/types/`, `src/config/`

- `data/kyoto-walks.ts` — 540-line static catalog: six source records, seven bilingual places, three bilingual walks and full stored geometry.
- `data/sample-congestion.ts` — two fixed place-anchored busy/moderate cues, typed `sampleOnly: true`.
- `types/routes.ts` — readonly coordinate, localized text, source, place and walk contracts; no mission/wallet/coupon/progress contracts yet.
- `config/assets.ts` — nullable mascot and pin paths. The mascot path is consumed; the pin path is reserved but not used to render map pins.

### `src/lib/` and `src/locales/`

- `lib/i18n.ts` — locale and message-key types, dictionary lookup and interpolation.
- `lib/profile.ts` — browser profile validation, persistence, event subscription, memory fallback.
- `lib/location.ts` — modes/statuses/fix types, initial/demo positions, 100 m accuracy classification, Kyoto rectangle, bilingual status text.
- `lib/route-discovery.ts` — pure local matching/ranking and fallback classification; no AI service abstraction or network dependency.
- `locales/en.json` — 141 English messages, including some obsolete preview copy.
- `locales/ja.json` — matching Japanese messages; equal keys do not establish translation quality or absence of UI overflow.

### `public/`, `references/`, and `tests/`

- `public/manifest.webmanifest` — identity, start URL, standalone display, theme/background colors; no icons array.
- `public/assets/mascot/README.md` — reserved location for original mascot artwork; no actual mascot asset supplied.
- `public/assets/pins/README.md` — reserved pin-art location; no final pin artwork supplied.
- `public/vendor/maplibre-gl-worker-6.19.0.mjs` — approximately 540 KiB prebuilt worker, served locally to avoid the earlier automatic-worker URL problem. Reviewed as a vendored artifact, not manually line-audited as first-party code.
- `public/vendor/MAPLIBRE-LICENSE.txt` — retained MapLibre and embedded third-party license notices.
- `references/map-tab-reference.png` — default and selected-route visual reference; inspected during this audit.
- `references/fox-avatar-reference.png` — fox/red-accessory inspiration; inspected during this audit.
- `tests/route-discovery.test.mjs` — four Node tests for English/Japanese theme/time matching, place names, unsupported requests, and unsupported categories.

There are no tracked CI workflows, deployment configuration specific to a hosting service, service worker, offline cache implementation, browser-test suite, or screenshots proving the current revision. This does not establish whether an unrecorded external deployment exists.

## 6. What is done, partly done, and missing

### Implemented foundations

- Next/React/TypeScript/Tailwind scaffold, pinned packages, lint/typecheck/build/test scripts.
- Mobile shell, five-tab navigation, design tokens, shared primitives, onboarding and browser-local profile.
- English/Japanese dictionaries, route/place content, location and simulation notices.
- Real map, attribution, stored routes, selected-route emphasis, numbered stops, interactive place cards.
- Deterministic prompt matching with reasons and alternatives; supported category filtering and empty states.
- Opt-in GPS with error/accuracy/outside-area handling, watcher cleanup, separate fixed Demo Mode, Settings location controls.
- Manifest and temporary application icon.

### Partly done or awaiting acceptance

- **Phase 2 validation:** route data and provenance exist; on-site accessibility/access checks and resident consultation do not. Source review and browser QA are not equivalent to field clearance.
- **Visual fidelity:** code contains the reference's main hierarchy and palette, but final fox/pin art, photo cards, quest markers and celebrations are absent. Reference images were inspected; current rendered fidelity was not re-tested in this audit.
- **All five tabs:** navigation works by design, but only Map/Settings have substantial functionality. Home is a greeting, explanation and Map CTA; Rewards/Missions remain placeholders.
- **Persistence:** profile only. Active-route continuity, demo preference persistence, and all future progress still need implementation.
- **Accessibility:** labels, focus-visible styles, Escape dismissal, safe-area CSS and OS reduced-motion handling exist. Modal behavior and some smaller controls need attention; no formal accessibility certification or fresh device layout review.
- **PWA:** metadata exists; offline behavior, complete install icons, HTTPS delivery evidence and target-phone installation/GPS verification remain.

### Baseline product functionality not yet implemented

- Start/stop an active route; next-checkpoint navigation and progression.
- Simulated route walking with pause/continue/reset.
- Real proximity check-in, reliable-fix eligibility, explicit demo check-in.
- Stamps and one-award-per-completion-instance duplicate protection.
- Mission fixtures, active/completed missions, completion bonus and celebration.
- Shared persisted wallet, game configuration, coupon catalog, unlock/claim/spend/history and duplicate-claim protection.
- Home/Map/Rewards/Missions synchronized progress and mission-to-map actions.
- Reset Demo with confirmation; progress schema migration/versioning.
- In-app reduced-motion override; optional sound setting; install help and fuller credits/privacy information.
- Three mission fixtures, three-to-five mock rewards and configurable sample congestion scenarios. Two static congestion labels already exist; they are not scenario controls or bonus logic.
- Geographic proximity/area-suitability scoring and a future recommendation-service boundary. Current scoring uses names, textual terms, themes and duration only.

Production AI, real coupons/payments, merchant/city/bus integrations, background tracking, social features and real accounts are deferred/outside the baseline. They should not be used to inflate the baseline backlog.

## 7. Findings and priorities

Priorities below are my proposed order of work, not measured incident severity. Findings describe this checkout; no app code was fixed as part of the audit.

### High — selected route does not survive tab switching

**Evidence:** `src/components/prototype-app.tsx` conditionally mounts `KyotoMap`; `src/components/map/kyoto-map.tsx` stores `selectedWalkId`, query and panel state locally.

**Trigger:** select a walk, open Home/Settings/Rewards, then return to Map. The previous map component has unmounted and its route selection has been discarded. This contradicts the PRD's navigation continuity requirement and would undermine a future mission flow.

**Action:** move route/progress state into an app-level store before adding the game loop. Persist the subset required across reloads; keep transient presentation state local. Retain the intentional GPS pause behavior.

### High — the core product demonstration cannot be completed

**Evidence:** Rewards/Missions use `FutureScreen`; no active-route, mission, wallet, award or claim implementation exists. The header is a static `2/5` sample with a CSS 40% fill.

**Impact:** the PRD showcase stops at route/place exploration. It cannot demonstrate that discovering or walking causes progress and unlocks a virtual incentive.

**Action:** implement one end-to-end route/checkpoint/reward slice, then expand to the required catalog. This is an expected unfinished phase, not an unexpected runtime defect.

### Medium — Japanese unsupported constraints can be reported as satisfied

**Evidence:** `src/lib/route-discovery.ts` detects unknown Latin words and a finite unsupported-term regex, but has no general equivalent for unmatched Japanese constraints.

**Reproduced:** `discoverRoutes("犬と川沿い", null, walks, places)` returns `kamo-riverside` with `fallback: false`, even though no dog/pet suitability metadata exists. The UI then says stored walks match the request. English `dog-friendly river walk` is correctly an alternative in the existing tests.

**Action:** define supported intents and uncertainty explicitly in both languages; report partially understood requests as alternatives. Add meaningful regression cases for unsupported Japanese requirements.

### Medium — time parsing silently treats strict limits as inclusive

**Evidence:** parsed minute budgets are always compared with `walk.estimatedMinutes <= minutes`.

**Reproduced:** `river under 9 minutes` and `9分未満の川沿い` each return the 9-minute riverside walk with `fallback: false`.

**Action:** either support strict versus inclusive comparisons, or explicitly describe all time filters as approximate inclusive budgets. Router times are estimates regardless.

### Medium — BottomSheet declares modality without focus management

**Evidence:** `src/components/ui.tsx` sets `role="dialog"` and `aria-modal="true"` and listens for Escape, but does not move focus into the sheet, trap Tab focus, restore trigger focus, or make the background inert.

**Impact:** keyboard focus can remain behind the open sheet or leave it for obscured controls. The visual scrim does not enforce keyboard modality.

**Action:** implement a complete accessible dialog primitive, preserving translated close actions and existing Escape/scrim behavior. Verify with keyboard and screen reader.

### Medium — map failure blocks useful fallback interactions

**Evidence:** `.kyoto-map-status` is an opaque, inset, z-index-20 overlay over lower-z-index search/list/location UI while state is loading/error. The message instructs a reload; there is no separate retry or route-list fallback outside that overlay.

**Impact:** local walk data remains available in memory, but pointer users cannot access it through the covered map controls. Keyboard focus may still reach obscured controls, creating an additional mismatch.

**Action:** provide an explicit retry and accessible local route-list fallback when tiles/WebGL fail. Treat error recovery separately from GPS failure.

### Medium — regression coverage is much narrower than implementation complexity

**Evidence:** four tests cover one pure matcher; no committed automated coverage for GPS lifecycle, profile storage, map panels, route-state continuity, modal focus, or PWA behavior. Historical controlled-browser checks are described only in docs. No tracked CI workflow enforces the available checks.

**Action:** preserve the existing matcher tests; add GPS cleanup/stale-callback, persistence, and one browser discovery-flow check. Add reward idempotency tests with Phase 3. Wire checks into CI once the workflow is chosen.

### Medium — documentation sends conflicting progress signals

**Evidence:** `README_START_HERE.md` says the repository is not a scaffold; `README.md` presents a Phase 1-only app and routes as future work. Historical Phase 0/1 handoff and decision notes describe earlier states. Some locale copy still mentions Phase 0.

**Action:** make README the current setup/status entry point, label the starter kit and handoffs historical, and maintain one current milestone ledger. This report deliberately leaves those source documents unchanged.

### Lower priority — maintainability and tooling debt

- `KyotoMap` combines SDK/DOM marker lifecycle, GPS, search/ranking integration and long panel JSX. Extract coherent pieces as Phase 3 introduces state; a wholesale rewrite is unnecessary.
- `prototype-app.tsx` holds several screens inline; `globals.css` contains retired map-preview selectors and repeated overrides. Consolidate opportunistically when touching those flows.
- `assetPaths.pins` has no rendering consumer. Supplying a pin folder alone will not change the current marker buttons; explicit wiring is still needed.
- Some controls are smaller than the 44 px touch target suggested by the PRD, including 42 px place pins and the 34 px search close button. Check actual device usability.
- Tests import `.ts` directly from Node. They work under the audited Node 26 runtime; the project has no declared supported Node version or portable TS test runner. Node emits a module-type warning.
- A locally vendored MapLibre worker creates a manual upgrade obligation. The package, worker URL/file and license must stay aligned. A byte comparison during this audit confirmed the committed worker matches the installed 6.19.0 package's `dist/maplibre-gl-worker.mjs`.
- Dependency vulnerability status has not been established. Source inspection and a successful build cannot establish that dependencies have no known advisories.

## 8. Recommended next milestones

1. **Make current behavior reliable and understandable:** refresh setup/status docs; preserve selected route across tabs; fix modal focus and offline/map-error fallback; tighten unsupported Japanese and strict-time matching.
2. **Build the smallest playable Phase 3 slice:** shared versioned progress store; start one route; demo checkpoint; idempotent stamp/coins; mission completion; unlock and claim one clearly non-redeemable coupon; confirmed reset. Verify repeat clicks, rerenders and refresh cannot duplicate awards.
3. **Complete the baseline content and five-tab coherence:** three missions, three-to-five example rewards, Home summaries, meaningful Missions/Rewards screens and map links. Separate fixed sample cues from configurable bonus scenarios.
4. **Add real check-in eligibility:** configurable radius/accuracy, accurate live-versus-demo semantics and explicit user action. Validate GPS behavior on phones before claiming field reliability.
5. **Finish Phase 4 and release gates:** supplied artwork/icons, HTTPS preview, install/offline behavior, keyboard/reduced-motion and bilingual mobile QA. Field-inspect paths and consult residents before presenting routes as publicly vetted guidance.

I would keep the existing technology choices and local-first approach. The codebase is still small enough for targeted improvements. The largest risk is adding game state inside the existing map component and then trying to synchronize the other tabs afterward; establish ownership and persistence first.

## 9. Verification record and boundaries

### Fresh checks in this audit

- Reviewed all tracked first-party source/config/test files, the full PRD and documentation, hidden project rules, lockfile metadata, reference images, manifest and vendor licensing/header. The minified third-party worker was not manually audited line by line.
- `npm test` on Node `v26.7.0` / npm `11.19.0`: **4 tests passed, 0 failed**, with a module-type warning.
- Checked all 141 EN/JA dictionary keys and interpolation tokens: **no differences**.
- Checked route/place/source references: **no dangling references**. All stored geometry coordinate pairs are finite and in valid geographic numeric ranges. This does not verify current access or safety.
- Ran direct matcher probes for unsupported Japanese constraints and strict time limits; results are recorded in section 7.
- Locked dependencies installed with `npm ci --ignore-scripts --no-audit --no-fund` after retrying outside the network-restricted sandbox. Lifecycle scripts and an advisory scan were intentionally not run by that command. npm emitted an ESLint-version deprecation/support warning.
- `npm run lint`: **passed**.
- `npm run typecheck`: **passed**.
- `npm run build`: **passed outside the sandbox**, including compilation, TypeScript and static page generation for `/`, `/_not-found` and `/icon.svg`. The initial sandboxed run failed because Turbopack CSS processing could not bind a local port (`Operation not permitted`); that was an environment restriction. The successful run emitted Node's `module.register()` deprecation warning.
- Vendored MapLibre worker compared byte-for-byte with the installed package: **identical**.

### What this audit does not establish

No fresh interactive browser/mobile pass, real-phone GPS test, PWA installation, HTTPS deployment check, external source revalidation, dependency-advisory review, or field survey was performed. Historical successes in `docs/DECISIONS.md` and `docs/PHASE_0_HANDOFF.md` are historical reports, not checks rerun here. No runtime UI defect is claimed solely from a screenshot of a reference image.

### Local commands

```sh
npm ci
npm test
npm run lint
npm run typecheck
npm run build
npm run dev
```

Open `http://localhost:3000`. Map resources require network access; GPS needs localhost or HTTPS and explicit permission. `tsconfig.json` includes Next-generated types, so retain the framework's normal build/dev type-generation workflow. No API key is configured for the present map integration.

## 10. Wave 2 — report reconciliation

The report was reread in full and cross-checked against the same baseline rather than treating the first pass as authoritative.

- **Inventory reconciliation:** checked all 48 `git ls-files` entries against the report; every tracked filename is represented. Included hidden Cursor rules, vendor worker/license, reference images and asset README files, which a default file listing can miss.
- **Instruction-context correction:** the first draft incorrectly said no applicable parent `AGENTS.md` existed. A direct ancestor check found `/Users/songdavid93374/AGENTS.md`; section 5 now distinguishes its generic InsForge guidance from the actual backend-free tracked implementation.
- **Status reconciliation:** rechecked the Phase 1-era README against the Phase 2 fixture, matcher and place-panel code. Retained the conclusion that route discovery exists and Phase 3 gameplay does not. Did not promote historical QA reports into current acceptance results.
- **Finding confirmation:** traced route loss to conditional unmount/local state; rechecked BottomSheet's focus handling and the map-error overlay's stacking; reran Japanese unsupported-intent and English/Japanese strict-time probes. Strengthened the time-limit finding with a reproduced Japanese example.
- **Asset/dependency reconciliation:** compared the vendored worker to the actual installed package instead of assuming its filename proved compatibility; it matches. Confirmed the mascot path is consumed and pin path is only reserved.
- **Verification correction:** replaced pending install/lint/typecheck/build statements with observed results. Recorded the sandbox build failure separately from application defects; the outside-sandbox build passed. Final working-tree inspection showed only the new report as a tracked/untracked source change, and the whitespace check passed.

The second pass preserves the first pass's central assessment: the discovery foundation is credible, but the baseline's main experience is unfinished until shared progression and demo incentives work end to end. No application source, dependency manifest, lockfile, or existing project document was intentionally edited; this audit's deliverable is `UPTOSPEED.md`.
