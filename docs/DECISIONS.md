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
