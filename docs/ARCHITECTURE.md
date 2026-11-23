# Kyoto AI Lab — Architecture decisions and guardrails

**Status:** recommended prototype defaults; follow confirmed decisions in `docs/PROJECT_SPEC.md` over this note.

## Stack
- Mobile-first Next.js + React + TypeScript + Tailwind CSS.
- CSS variables / theme tokens; small reusable components and clear data contracts.
- Start with local fixture data and lightweight state persistence (e.g. `localStorage`), not real authentication.
- A simple nickname/language welcome is **simulated login**; do not build user credential handling.
- English and Japanese via message dictionaries.
- PWA manifest + installable HTTPS deployment; offline support limited to shell and cached assets where practical.

## Map decision gate
- Map SDK is not irrevocably locked. Run a small proof of concept comparing **MapLibre GL JS + lawful tile/style provider** and **Google Maps** against the primary reference. For the visual-first scope, prefer the one with acceptable styling, attribution, cost, performance, and phone behavior.
- A map rendering SDK alone doesn't provide valid walking routes, geocoding or places. Store verified route GeoJSON/coordinates and point-of-interest fixtures; add a separately licensed routing/search service only if needed.
- Do not use Google Places/Routes content on a non-Google map unless the exact license permits it.
- Map must run in a client-only component, with proper mobile resize/unmount lifecycle and route/marker cleanup.

## Location
- `navigator.geolocation` HTTPS + explicit permission, real mode only. Account for permission denial, timeouts, low accuracy and unavailable GPS; don't require device location to access demo.
- GPS fox follows coordinates only when real mode is active. Kyoto Demo Mode uses a **separate** simulated position and explicit demo banners.
- Do not present browser GPS as continuous background tracking. Keep watchers scoped and cleaned up.

## Interactions and state
- Primary Map state machine: `default -> results -> route-selected -> route-active` with a place-detail overlay that can open/close without losing route state.
- Route recommendation: validated curated route fixtures and deterministic matching of user interests/prompt. Expose a service interface for optional future AI; do not pretend text matching is generative AI.
- Rewards: one award per eligible checkpoint; stored completion records avoid duplicate GPS-triggered coins. All currency/coupons are demo-only.
- Data should distinguish verified geographic facts, sourced content, unverified business entries and fictional/demo assets.

## Avoid premature architecture
- No paid APIs, database, real sign-in, social feed, real-time congestion, bus operator integration, or merchant/payment integration until explicitly approved.
- No untested dependencies, silent large refactors, embedded secrets, or fabricated route geometry.
