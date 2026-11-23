# Phase 2 review — Kyoto walk discovery

The local branch `phase-2-review` is ready for review against `8e04799`. The worktree is the sibling directory `Kyoto_AI_lab_phase_2`. You can inspect the diff from either checkout.

```sh
git diff --stat 8e04799...phase-2-review
git diff 8e04799...phase-2-review
```

## Wave 1 — scope and decisions

The existing catalog has three walks and seven places. The goal was to make those walks dependable to browse, especially when a visitor switches tabs, types a constraint the catalog cannot verify, uses a keyboard, or loses access to the basemap. The acceptance criteria came from the [build plan](../BUILD_PLAN.md), [test checklist](../TEST_CHECKLIST.md), and sections 6–8 and 15 of the [PRD](../PROJECT_SPEC.md).

I chose session-only route selection because this milestone handles browsing. Closing the app or refreshing starts a fresh selection. Nickname and language retain their existing local persistence. The project’s field inspection and consultation requirements apply before public walking guidance.

## Wave 2 — implementation walkthrough

**Start with the product changes in `2f63742`.**

- Pick a walk and visit Settings or Home. When you return, the app shell supplies the same walk ID to the newly mounted map. The map fits its geometry, highlights its line, and numbers its three stops. The GPS watcher still belongs to the map component. [App shell](../../src/components/prototype-app.tsx) · [Map component](../../src/components/map/kyoto-map.tsx)
- Search for “river within 9 minutes” and then “river under 9 minutes”. The first query matches the nine-minute Kamo walk. The second offers alternatives. Japanese 以内 and 以下 include the limit, while 未満 excludes it. The matcher also checks Japanese phrases against names, themes and supported request wording. A query like 犬と川沿い now returns alternatives because the fixtures contain no pet-access data. This remains a vocabulary-based matcher, so a valid unfamiliar phrasing can also produce alternatives. [Matcher](../../src/lib/route-discovery.ts) · [Regression cases](../../tests/route-discovery.test.mjs)
- Open a place sheet using the keyboard. The native modal dialog moves focus to its heading and prevents background interaction. Changing to another sheet view focuses its title. Escape, the close button and a backdrop click dismiss the sheet. The browser restores the opener when available, with the map list as a fallback for a vanished search suggestion. [Shared sheet](../../src/components/ui.tsx) · [Styles](../../src/app/globals.css)
- While the basemap loads or after it fails, visitors can browse the stored catalog, read route details and follow stops to their place cards. Retry rebuilds the map and fits a walk selected during the outage. Covered map controls are inert. This recovery works after the app has loaded. [Map component](../../src/components/map/kyoto-map.tsx) · [English copy](../../src/locales/en.json) · [Japanese copy](../../src/locales/ja.json)
- During browser testing, choosing a welcome language unexpectedly submitted the form before the visitor could enter a nickname. Both language selectors now explicitly use the ordinary button type, so the visitor submits with Start exploring. [Welcome form](../../src/components/prototype-app.tsx)

**Review the test infrastructure in `add3b37` and the handoff in `47d2a3a`.** Playwright is pinned as a development dependency. The separate browser command targets a running local build. The fixture test checks each ordered stop against the stored line and resolves source and sample-cue references. The README now describes the present discovery flow, local setup and test commands. The original starter-kit introduction points to it. The route-data notes give field reviewers a route-specific checklist. [Package scripts](../../package.json) · [Lockfile](../../package-lock.json) · [Browser suite](../../tests/browser/discovery.mjs) · [Fixture test](../../tests/route-data.test.mjs) · [README](../README.md) · [Starter guide](README_START_HERE.md) · [Field checklist](../ROUTE_DATA.md#field-review-handoff)

## Wave 3 — audit results

| Check | Observed result |
| --- | --- |
| Unit and fixture tests | 7 passed, including existing place/theme queries, strict time boundaries in both languages, unsupported Japanese preferences and ordered stop geometry. |
| Chromium discovery | 6 passed across English and Japanese at 360, 390 and 430 px wide by 800 px tall. Each run forced a style failure, browsed stored places, retried successfully, searched, switched tabs, checked three visible pins, traversed the sheets and returned to results. The runs checked modal focus, Escape restoration, horizontal overflow and uncaught page errors. |
| GPS lifecycle | 1 additional Chromium case with a controlled geolocation watcher recorded one start and one clear. The selected route returned after switching tabs and GPS stayed paused. |
| Live provider | A separate 390 px Chromium smoke check loaded OpenFreeMap, rendered seven visible pins and displayed attribution. The regression suite uses a small controlled style to keep outage and recovery repeatable. |
| Build quality | ESLint, TypeScript, production build and Git whitespace checks passed. Node emitted the existing module-type warning during unit tests and a deprecation warning during the build. |

To repeat the audit from the review worktree, run `npm ci`, `npm test`, `npm run lint`, `npm run typecheck` and `npm run build`. Start that build with `npm run start`. In another terminal in the worktree, run `npx playwright install chromium` followed by `npm run test:browser`.

## What still needs people

The three routes remain map-checked prototypes. Shijō and Kawabata need an on-site assessment of crossings, curb ramps and surfaces. The Maruyama walk includes mapped stairs and service paths whose current access needs checking. Record local input and resolve uncertain permissions before endorsing public use. A fluent Japanese reviewer and a physical-phone pass can assess phrasing, touch usability and outdoor readability. Physical GPS, screen-reader behavior and Safari were outside the Chromium checks above.

For a quick approval pass, start in Japanese, enter a nickname, search for 9分以内の川沿い, and choose the Kamo walk. Switch to Settings, change the language, then return to Map and open List. You should see the same walk and its three stops in English.
