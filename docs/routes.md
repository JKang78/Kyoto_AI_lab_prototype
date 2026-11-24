# Curated Kyoto Walks — Remaining Expansion Work

> **Status:** In progress on `prototype-engineering`. The catalogue now holds **9 walks (33 places)**. Steps 1–4 of the original plan are finished: OSM geometry, walk and place data, sourced draft stories, and pin themes with seal drawings. This file lists only what is left.
> **Related docs:** [ROUTE_DATA.md](./ROUTE_DATA.md), [DECISIONS.md](./DECISIONS.md), [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md).

## What already exists (for reference)

The six new walks are in `src/data/kyoto-walks.ts`, with stories in `src/data/place-stories.ts` and seals in `src/components/glyphs.tsx`. All are dated `2026-11-25`.

| Walk ID | Ordered stops | Router estimate | Path review (for ROUTE_DATA.md) |
|---|---|---:|---|
| `okazaki-heian` (culture) | Lake Biwa Canal Museum basin → Okazaki canal path → Heian Shrine Ōtorii → Ōtenmon gate | 903 m, 12 min | 80/80 segments matched to OSM ways; no `foot`/`access` restriction; 1 stair way near the museum basin (no step count). Rerouted onto the public canal-side path (六勝寺のこみち) because the first route cut through the Kyoto City Zoo, which charges admission. |
| `philosophers-path` (riverside) | Ginkakuji Bridge → path near Hōnen-in → Nyakuōji Bridge → Eikan-dō gate → Nanzen-ji Sanmon approach | 2,269 m, 30 min | 160/160 matched; no restrictions; 1 stair way (3 steps) on the path into Nanzen-ji. Ends east of the Sanmon, **before** its 8-step stair. The stop near Hōnen-in sits on the canal path so the router does not detour through residential lanes. |
| `kamogawa-tadasu` (park) | Kawai Bridge (Demachiyanagi) → Kamogawa Delta tip → Tadasu-no-Mori south side → Kawai Shrine → Shimogamo Rōmon | 1,165 m, 16 min | 67/67 matched; no restrictions; 4 stair ways between the bridge and the delta. Starts at Kawai Bridge, not Kamo-ohashi, because the router's way from Kamo-ohashi to the delta crossed the river on the stepping stones. Delta access is out-and-back. |
| `arashiyama-riverside` (riverside) | Nakanoshima Bridge → Togetsukyō → north-bank promenade → Arashiyama Park (Kameyama) riverside | 1,079 m, 14 min | 53/53 matched; no restrictions; no stairs. Extended to ≥ 11 min to keep the riverside search tests valid. The first segment uses a shared cycle path. |
| `kyoto-gyoen` (park) | Sakaimachi Gate → Kujō Pond → Kenreimon avenue → Hamaguri Gate | 1,045 m, 17 min | 32/32 matched; no restrictions; no stairs; gravel, fine gravel and pebble surfaces. |
| `station-umekoji` (culture) | Kyoto Station Karasuma plaza → Higashi Hongan-ji front plaza → Nishi Hongan-ji Goeidō-mon → Umekōji Park east side | 2,316 m, 31 min | 121/121 matched; no restrictions; no stairs on the line (stairs are mapped next to the station stop). Stop 2 sits at the south end of the plaza so the route follows Karasuma-dōri and Shichijō-dōri, not the narrower Hanaya-chō street. |

Matching method: each segment was matched by OSM node pairs from the router's `annotations=nodes`, with a fallback check that the segment lies within 10 m of a mapped way. The maximum fallback error was 0.1 m. OSM extracts came from the API on 2026-11-25. Every place and walk keeps `communityInputStatus: "not-consulted"`.

Changes from the original plan, each driven by the router or a guardrail:
- **Kamogawa walk:** 16 minutes, not a 30–35 minute long walk, and it starts at Kawai Bridge.
- **Station walk:** 31 minutes, not 15–20, and it adds Nishi Hongan-ji as a stop.
- **Arashiyama walk:** ends at Kameyama, not Tenryū-ji.

---

## Remaining steps

### Step 5: Finish the place photos (partly done)

`CHOSEN` in `scripts/fetch_place_photos.py` already lists a checked Commons photo for 25 of the 26 new places. The script now waits out Retry-After and paces requests at 1.5 s. The last run was stopped because Wikimedia returned HTTP 429. `public/places/` holds some new images, but `src/data/place-photos.json` has **not** been regenerated yet.

1. Rerun `python3 scripts/fetch_place_photos.py`, ideally at a quiet time. If Wikimedia keeps returning 429, raise the sleep.
2. Confirm that the manifest lists 31 photos and that each `public/places/<id>.jpg` exists.
3. Leave out `honenin-junction`: no Commons photo shows that exact point. Never add `chionin-south-gate-path`, because a test expects it to be absent.

### Step 6: Wire the demo scenarios (`src/config/game.ts`)

```ts
export const DEMO_SCENARIOS: readonly { kind: CampaignKind; walkIds: readonly string[]; multiplier: number }[] = [
  { kind: "bus_relief", walkIds: ["shijo-yasaka", "station-umekoji"], multiplier: 2 },
  { kind: "quiet_hour", walkIds: ["yasaka-maruyama", "philosophers-path", "arashiyama-riverside"], multiplier: 2 },
];
```

Keep `DEMO_TRAIL = { goal: 5 }`. `tests/game.test.mjs` only checks `shijo-yasaka`, `yasaka-maruyama` and `kamo-riverside`, so it should still pass.

### Step 7: Route discovery and its tests

As of the pause, 5 tests in `tests/route-discovery.test.mjs` fail: the four with 3-walk assertions and the shared-stop test. `route-data` and `place-content` pass, and typecheck is clean.

1. `src/lib/route-discovery.ts`: consider adding `canal` / `疏水` / `疎水` to `themeTerms.riverside` and `forest` / `森` / `御苑` to `themeTerms.park`. Keep `unverifiedTerms` strict, so nothing claims quiet, wheelchair or step-free access, cafés, or seasonal features.
   - **Decision needed:** `四条大橋` now returns `arashiyama-riverside` and `philosophers-path` as well, because `橋`/`大橋` are riverside theme terms. The test expects only the two walks that pass Shijō Bridge. Either let a place-name match take priority over a theme match, or accept the wider result and update the test.
   - Note: `鴨川` already matches the riverside theme, so searching 鴨川 will surface the park-themed `kamogawa-tadasu` walk by name, not by theme.
2. `tests/route-discovery.test.mjs`: replace the hard-coded 3-walk assertions.
   - Fallback suggestion counts (`suggestions.length, 3`) should become `CURATED_WALKS.length`. First check how many suggestions the fallback actually returns.
   - `find('', 'park')` should return `yasaka-maruyama`, `kamogawa-tadasu` and `kyoto-gyoen`.
   - `find('1005分の川沿い')` should return `kamo-riverside`, `philosophers-path` and `arashiyama-riverside`.
   - `find('1010分')` should return every walk ID.
   - Add tests for `Philosopher`, `嵐山`, `哲学の道`, `京都駅`, and for `under 20 minutes` excluding the 30- and 31-minute walks.
   - `river under/within 9 minutes` should still return only `kamo-riverside`, because the new riverside walks take 14 and 30 minutes.

### Step 8: Audit documentation

1. `docs/ROUTE_DATA.md`: add the six walks to the review table using the reference table above. Add field-review prompts for each new corridor:
   - Okazaki: the museum-basin stairs.
   - Philosopher's Path: the Nanzen-ji steps and the residential stretch north of Ōtoyo Shrine.
   - Kamogawa: the delta stairs, and keeping visitors off the stepping stones.
   - Arashiyama: the shared cycle path and bridge crowding.
   - Gyoen: the gravel surfaces.
   - Station walk: the crossings near the station.

   Update the "three stored walks / seven places" wording in the discovery section.
2. `docs/DECISIONS.md`: add a dated entry for the expansion from 3 to 9 walks, including the route changes listed above and the new `DEMO_SCENARIOS` assignments.

---

## Guardrails (still apply to the remaining work)

- Public corridors only. Never label a walk resident-approved, quiet, low-congestion or step-free. Keep `communityInputStatus: "not-consulted"` and keep stories marked `draft`.
- Do not hand-edit geometry, distances or times. If a route changes, re-request it from `routing.openstreetmap.de/routed-foot` and keep stops on the line within 0.00002°.
- Photos must come from Wikimedia Commons with a licence matching `^(CC BY(-SA)? [0-9.]+|CC0|Public domain)$`.
- Riverside walks must stay at ≥ 11 minutes.
- Keep these changes within `src/data/`, `src/config/game.ts`, `src/lib/route-discovery.ts`, `src/components/glyphs.tsx`, `scripts/`, `public/places/`, `tests/` and `docs/`.

## Verification checklist (before merging)

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Then check at 390 × 800 with `npm run dev`:
- [ ] **Explore map:** all 9 walks list in the sheet. Selecting an outer walk such as Arashiyama, Philosopher's Path or the Station walk fits the map to its line and shows numbered pins in the right theme colours.
- [ ] **Explore list:** every new stop shows its photo with credit (or the placeholder for the Hōnen-in stop), its draft story, and its access and resident notes. No images are broken.
- [ ] **Seals:** the 26 new seal drawings are legible at pin and stamp-book sizes. They were drawn in code and have not yet been viewed.
- [ ] **Search:** `under 15 minutes` drops the 30- and 31-minute walks, and `Arashiyama`, `嵐山`, `哲学の道` and `京都駅` each find their walk.
- [ ] **Missions:** a simulated walk steps through 4–5 checkpoints, awards points and the completion bonus, applies 2× when the matching scenario is on, and stamps the new seals.
- [ ] **EN/JA:** no untranslated text and no overflow from the longer place names.
