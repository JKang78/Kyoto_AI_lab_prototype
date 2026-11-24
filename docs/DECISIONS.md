# Decision log

Keep this short and updated as important decisions change. Do not change the confirmed PRD silently.

| Date | Decision | Why | Status |
|---|---|---|---|
| 2026-11-18 | Visual-first prototype; real GPS + separate demo mode | Showcase can run without physical Kyoto travel | Confirmed |
| 2026-11-18 | Curated routes with preference/prompt matching, optional later AI | Avoid inventing walking paths | Confirmed |
| 2026-11-18 | Original mascot artwork will be supplied later | Preserve team-approved design | Confirmed |
| 2026-11-18 | MapLibre GL JS + OpenFreeMap Liberty vector tiles for the first Kyoto map foundation | Better fit for a pastel, reference-led map; no key or billing setup for the prototype; attribution remains visible | Selected for Phase 1 foundation; revisit provider before production |
| TBD | Hosting and PWA icons | Need actual deploy/test | Open |

## Phase 1 map proof of concept

The local proof of concept renders a real MapLibre map centered near Gion-Shijo, using OpenFreeMap's public Liberty style with a few client-side color adjustments. It pans and zooms, and the MapLibre attribution control is kept visible. The Google option was assessed against its official setup, styling, pricing, and attribution documentation; no Google map was rendered because this repository has no Google API key or billing project. This is a decision for the **first map foundation**, not a claim of measured head-to-head runtime performance.

| Criterion | MapLibre + OpenFreeMap | Google Maps JavaScript API |
|---|---|---|
| Reference-image fidelity | Vector style layers allow warm streets, pale blue river, muted parks, and custom overlays later. The real Kyoto streets remain visible and pannable. | Cloud map styling can change many basemap features; Google branding and map style constraints make the illustrated reference less directly reproducible. |
| Mobile performance | WebGL vector rendering; the local implementation loads only on the Map tab and cleans up on unmount. Phone-width behavior is checked separately. Tile/network speed and low-end phone performance still need device testing. | Mature mobile map renderer, but an equivalent benchmark requires a configured project and actual device testing. No measured performance winner is claimed. |
| Attribution and licensing | OpenFreeMap permits public-instance and commercial use, requires OpenMapTiles/OpenStreetMap attribution, and offers the service as-is without an SLA. MapLibre is open source; basemap data and style licenses remain separate. | Google attribution must remain visible. Google Maps content is governed by platform terms; future Places/Routes data would need a license review before mixing with any non-Google map. |
| Cost and key requirements | OpenFreeMap public instance currently has no map-view/request charge, registration, or API key. It offers no availability guarantee; production scale may warrant a contracted or self-hosted provider. | API key required. Standard Maps JavaScript API setup requires a Google Cloud project with billing; map loads use the Dynamic Maps SKU, and other services may add separate charges. A limited Demo Key exists for prototyping only. |

Sources checked 2026-11-18: [OpenFreeMap usage, attribution and license](https://openfreemap.org/), [OpenFreeMap terms](https://openfreemap.org/tos/), [OpenFreeMap MapLibre quick start](https://openfreemap.org/quick_start/), [MapLibre GL JS documentation](https://maplibre.org/maplibre-gl-js/docs/), [Google API setup](https://developers.google.com/maps/documentation/javascript/get-api-key), [Google usage and billing](https://developers.google.com/maps/documentation/javascript/usage-and-billing), [Google styling setup](https://developers.google.com/maps/documentation/javascript/cloud-customization/setup), and [Google attribution policies](https://developers.google.com/maps/documentation/javascript/policies).

The initial map foundation contained no route geometry, GPS position, fox avatar, rewards, place data, or live traffic. Phase 1 location behavior now adds opt-in GPS and a separate simulated position; route and place data still require verified fixtures and licensing.

Production-build check: headless Chrome at 360 × 800, 390 × 800, and 430 × 800 px rendered the tiles, showed the attribution and zoom controls, panned successfully, reported no page/request errors, and had no horizontal overflow. Attribution wraps to two lines at 360 px. These are desktop browser emulations; low-end phone and real-device performance remain unmeasured.

## Phase 1 location behavior

Browser geolocation starts only after **Use My Location**. The Map tab owns the watcher, clears it on mode change, tab exit, and page hiding, and does not persist coordinates. Leaving Map pauses a live session; returning requires another explicit tap. Live fixes stay at their reported coordinates, including outside Kyoto. The broad 34.93–35.12° N, 135.67–135.84° E rectangle is a prototype *context hint*, not a city boundary or safety geofence. Fixes with reported accuracy worse than 100 m are labelled imprecise before any Kyoto-area classification. Permission denial, timeout, and unavailability are exposed without substituting a Kyoto point.

Demo Mode uses a separate fixed sample at 35.0003° N, 135.7662° E near Gion-Shijo and the Kamo River. Its marker and Settings status visibly say it is simulated and GPS is off. Recenter targets the active mode. The marker still uses the replaceable mascot asset shell.

No dotted route geometry is drawn in Phase 1. A route line would imply a safe walking path; Phase 2 must first supply validated route fixtures with reviewed path coordinates and licensing. No demo walking, check-ins, coins, or coupons are implemented here.

## Phase 1 closure: Settings controls and GPS QA

Settings now has an explicit Kyoto Demo Mode switch. Turning it on selects the simulated Kyoto point and leaves GPS off; turning it off returns to an unselected, GPS-off state. Settings Recenter opens Map and centers the selected demo or default view. A paused live session has no retained fix, so Recenter focuses **Use My Location** on Map for a separate, deliberate GPS request. The Settings switch itself never requests permission. The Map watcher is cleared on tab exit and also on a Map mode switch.

Headless Chrome with controlled Geolocation callbacks passed granted, denied, timeout, unavailable, low-accuracy, outside-Kyoto, stale-callback, tab-exit, mode-switch, Settings switch/recenter, map pan/zoom, and English/Japanese checks at 360 × 800, 390 × 800, and 430 × 800 px. Map attribution remained visible and no horizontal overflow or page errors were observed. These checks emulate phone widths; **no physical phone GPS or PWA installation test was performed**. Browser permission prompts, actual device accuracy, HTTPS deployment behavior, and iOS/Android background suspension remain unverified on real devices.

## 2026-11-24 Kyoto Flow UI refactor

The UI and interaction layer now follows `docs/kyoto_flow_agent_ui_ux_experience_engineering_spec.md`: four tabs (Explore, Quests, Wallet, Settings) with Explore as the home screen, Kyoto Ink & Washi tokens, a draggable peek/half/full sheet, a visible off-peak multiplier, and a bilingual staff redemption flow. The Home dashboard was removed.

Where the spec conflicts with this repo's honesty rules (`.cursor/rules/00-project-guardrails.mdc`, `docs/ARCHITECTURE.md`), the rules win:

- **Vouchers.** The redemption flow is complete, but merchants are fictional and marked “(fictional)”, and every redemption screen carries a permanent “Demo only · not accepted at any shop” strip. No real shop, transit operator or programme is named.
- **Crowd data.** Labelled “Pilot sample schedule · illustrative, not live data”, not attributed to Kyoto Smart Navi or any real source.
- **Off-peak window.** 06:00–10:00 Kyoto time at 2.0× is a sample schedule, labelled “not an official city programme”. A Settings switch simulates it for demos at other hours.
- **Resident-Approved badges** are omitted, because every fixture is still `communityInputStatus: "not-consulted"`.
- **Fox mascot.** `FoxAvatar` implements the five states as an API but draws a neutral ring until team-owned art arrives.
- **Points, not coins.** Rewards are “quest points” that unlock vouchers, per spec §1.4. Saved v1 progress is upgraded in place; the retired postcard/tea/journal claims are refunded.

Dependencies: added `motion` (14.14.0) for the spring values the spec specifies. `vaul`, `zustand` and `next-intl` were not added: the existing sheet, store and dictionary cover what the spec needs from them. Fonts load through `next/font/google` with no new package.

## 2026-11-24 Audit remediation (Phase 1–2)

Follows `IMPLEMENTATION_AUDIT.md`. Navigation is now **Explore / Missions / Rewards / Me** (settings inside Me), per PRD §5 and design system §4.

- **Incentives are two separate concepts** (PRD §9, AC-04): `bus_relief` and `quiet_hour`. The invented 06:00–10:00 "off-peak" schedule was removed. With no real bus or crowd data, each exists only as a **hypothetical demo scenario** a presenter switches on in Me → Demo controls, scoped to one walk, and labelled "demo scenario" wherever it appears. Copy claiming that walking relieves buses was removed; receipts say a check-in confirms a visit, not how you travelled.
- **Vouchers** are all `isDemo: true` and labelled `DEMO — NOT REDEEMABLE` on every ticket and in both languages on the redemption preview. The "Show this to staff" framing is gone. The unverified transit voucher was replaced by a fictional washi postcard set. The Rewards tabs are Available / My vouchers / Used.
- **Demo vs production boundary.** `src/config/environment.ts` declares `REWARD_MODE = "demo"`; `clientMayUnlock()` refuses non-demo vouchers. Real issuance must be server-side (ENGINEERING_SPEC §5–7) and must never read the browser ledger. Demo Mode check-ins carry a `DEMO MODE` badge and a "Simulated check-in · not GPS-verified" receipt.
- **Honest data states.** Crowd level is `unknown` (never `calm`) without a sample; sample cues carry `kind: "demo_sample"` and no observation time. Unsurveyed walks read "Step-free: unknown".
- **QR deep links** use `/?route=<walk-id>` and browse as a guest without saving a profile.
- **Mascot.** Masters moved to `design/mascot/originals/`; `scripts/normalize_mascot.py` derives cleaned, consistently framed 512 px copies.
- **Saved progress** moves to version 3: version-2 saves keep their points, drop the off-peak switch, and refund the retired transit voucher.

## 2026-11-24 Self-hosted fonts

`next/font/google` downloads every font slice at compile time. This network refuses most parallel connections to Google Fonts (61–77 of 100 parallel requests refused, inside and outside the command sandbox), which broke `npm run build` and, after a cache reset, the dev server.

The fonts are now self-hosted: `scripts/fetch_fonts.py` downloads Google's woff2 slices one at a time into `public/fonts/` and writes `src/app/fonts.css` with the original `unicode-range` rules, so browsers still fetch only the slices a page needs. Families: Shippori Mincho 700 only (the only weight used), Plus Jakarta Sans and Noto Sans JP (variable 400–700). Total 9.5 MB in 250 files, all SIL OFL 1.1 with licence texts alongside. Builds no longer need the network, which also suits the offline PWA goal (ENGINEERING_SPEC §10). Fonts are no longer preloaded; `font-display: swap` keeps text visible while they load.

## 2026-11-24 Place photos, stories, seals and the demo trail (visuals.md P2)

- **Photos** come only from Wikimedia Commons under CC BY, CC BY-SA, CC0 or public domain, re-checked through the Commons API by `scripts/fetch_place_photos.py`. Every photo shows its author, licence and source on screen. CC BY-SA applies to the photo itself, not to the app. A place with no photo of the exact spot keeps an illustrated placeholder.
- **Stories** are drafts built only from cited public sources and stay labelled "DRAFT · awaiting local review" until a local reviewer approves them (PRODUCT_REQUIREMENTS §10). Adding a fact requires adding its source.
- **Seals** are code-drawn placeholders in the pin line style, one per stop, to be replaced by designer art.
- **Trail** is a demo collection goal with no deadline and no extra reward. A real seasonal campaign needs an owner, dates and data first.
- **Fox poses:** no new poses were made. Any new pose needs commissioned artwork and team approval.

## 2026-11-24 Release-readiness pass (polished demo)

- **Bike and Luggage-friendly chips** stay visible as unavailable ("Bike · pilot planned", "Luggage · not surveyed") and explain why when tapped. They never filter walks or imply validated cycling or step-free routes (design_system §5, §6.1).
- **Preview-only simulation:** Demo Mode, simulated walks and bonus scenarios render only when `NEXT_PUBLIC_KYOTO_FLOW_PREVIEW=1` or in development. A public build hides them, rewrites status texts that mentioned Demo Mode, and clears saved demo state. This is a product safeguard, not security.
- **List view** gives map/list equivalence (FR-04): every walk, stop, photo, note, story and action is available without the map.
- **Contrast and type:** `--ink-muted` is now `#706A62` (design_system §3.1). Text is at least 12 px; the design system's 13 px caption guidance is met for body copy, and 12 px is used for chips, dock labels and credits, checked at 360 px. Gold numerals appear only on dark or purple backgrounds.
- **Etiquette toast** (FR-17) uses three example zones whose messages restate the existing resident notes. They are not official designations and are labelled as examples.
