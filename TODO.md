# Kyoto Flow — Remaining TODOs

Backlog carried over from [docs/visuals.md](docs/visuals.md) after completing the **Next UI pass** (Macadam-style Home screen, tactile primary buttons, floating map HUD, 60 m fox halo & next-pin motion, and shared checkpoint-to-voucher track).

## 1. Prototype Features

- [ ] **Guest entry and manual start:** Add a skippable welcome with the fox, a way to revisit setup, and a Kyoto station or landmark picker offered at entry and after GPS denial. Decide later whether to re-enable `/?route=<walk-id>` QR deep links directly into Explore.
- [ ] **Map styles:** Add a one-tap **Illustrated / Standard** map switch alongside the existing List control, preserving route, stop, and camera position while keeping crossings and attribution.
- [ ] **Save and return:** Add a private Save action for walks and places and a saved list in **Me** (persisting across reload, with remove support).
- [ ] **Foreground walking:** Add an explicit pause/resume action for GPS walks, a distinct low-accuracy marker treatment, structured itinerary/checkpoint actions usable from a list during a walk, and evaluate heading + display smoothing on physical phones.
- [ ] **Missions and vouchers:** Show mission eligibility and any deadline; handle voucher validity, expiry in Kyoto time, and expired offers independently of the 5-minute redemption-preview timer.
- [ ] **Offline reopening:** Cache the app shell, active route, ordered stops, and voucher terms; display offline status and cache age (keeping merchant redemption online-only).
- [ ] **Privacy and safety in Me:** Explain foreground location use and retention; add **Delete my local data** (clearing profile, progress, preferences, saved items, and app caches after confirmation), bilingual official disaster-information links, and a path-issue reporting entry point.

## 2. Visual and Content Review (Human / Device QA)

- [ ] **Place stories review:** Review the seven draft place stories in [src/data/place-stories.ts](src/data/place-stories.ts) with a local reviewer and a native Japanese speaker; record approval per stop before removing draft labels.
- [ ] **Mascot rights & artwork:** Confirm public-use rights/licence for the fox art ([docs/MASCOT_ASSETS.md](docs/MASCOT_ASSETS.md)); additional poses and designer replacement seals are optional pending approved designs.
- [ ] **Map label & bubble collision QA:** Check route-label and fox-bubble collisions with stop pins while panning and zooming at phone widths in both English and Japanese (including long place names).
- [ ] **Interaction polish decisions:** Decide whether to add swipe dismissal alongside buttons/Escape on Celebration ([src/components/celebration.tsx](src/components/celebration.tsx)), whether to show the completion bonus separately from the walk total, and resolve the duplicate active walk card in Missions ([src/components/missions-screen.tsx](src/components/missions-screen.tsx)).
- [ ] **iOS & Android real-device accessibility QA:** Finish EN/JA coverage for loading and install metadata; test the full map/list and check-in journey on physical iPhones and Android phones with screen readers, reduced motion, weak GPS, weak connectivity, and check touch targets for route labels and the receipt's *Read story* button ([docs/TEST_CHECKLIST.md](docs/TEST_CHECKLIST.md)).

## 3. Features Requiring External Data, Approval, or Later Release

- [ ] **Preferences and travel modes:** Add optional visitor/resident, interests, shade, mobility, and Rail + Walk preferences to onboarding and Me; Rail + Walk, shade, and step-free filters require surveyed/validated data; review "Hidden gems" wording with residents.
- [ ] **Amenities and stop details:** Verify toilets, disposal points, lockers, baggage services, opening hours, and payment info before adding to map/list; extend landmark and shop pin categories when the catalog supports them.
- [ ] **Itinerary editing and stamp-book organization:** Add stops to an itinerary, paste an address, or import KML/CSV after validation, deduplication, and local deletion are defined; ward/season grouping requires verified stop metadata ([docs/PRODUCT_REQUIREMENTS.md](docs/PRODUCT_REQUIREMENTS.md#7-functional-requirements-and-acceptance-criteria)).
- [ ] **Field-reviewed corridors and missions:** Audit pedestrian access, crossings, steps, and resident sensitivities on site; validate GPS check-in thresholds at each intended stop ([docs/ROUTE_DATA.md](docs/ROUTE_DATA.md#field-review-handoff)).
- [ ] **Crowd overlays and campaign timing:** Real road bands and route comparisons require an authorized source, provenance, update timestamp, and stale-data handling; show countdowns/end times only for real scheduled campaigns.
- [ ] **Merchant and transport rewards:** Partner QR check-ins, quotas, real voucher issuance, staff-authenticated redemption, transit/luggage/bike perks, and path-issue moderation require verified venues/operators and an online backend ([docs/ENGINEERING_SPEC.md](docs/ENGINEERING_SPEC.md)).
