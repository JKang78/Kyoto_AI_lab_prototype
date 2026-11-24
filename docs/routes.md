# Curated Kyoto Walks — Expansion Spec & Implementation Guide

> **Status:** Approved design blueprint (ready for implementation on `prototype-engineering`).  
> **Scope:** Expand **Curated Kyoto walks** from **3 baseline routes (7 places)** to **9 routes (~27–31 places)** across central Kyoto and iconic outer districts, while preserving all repository honesty rules, OSM verification invariants, and UI simplicity.  
> **Related docs:** [ROUTE_DATA.md](./ROUTE_DATA.md) (baseline OSM audit & attribution), [DECISIONS.md](./DECISIONS.md), [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md), [visuals.md](./visuals.md).

---

## 1. Current Baseline (3 Routes) & Why They Exist

All curated walks and places live in `src/data/kyoto-walks.ts`. The initial 3 routes (7 places) were designed to prove the end-to-end prototype with minimal data and zero invented paths:

| Walk ID | Name (EN / JA) | Theme | Stops (3 each) | OSM Estimate | `mappedSteps` | Demo Scenario |
|---|---|---|---|---:|---|---|
| `shijo-yasaka` | Shijō to Yasaka / 四条通から八坂神社へ | `culture` | `shijo-kawaramachi` → `shijo-ohashi` → `yasaka-west-view` | 798 m, 11 min | `false` | `bus_relief` (2×) |
| `kamo-riverside` | Kamo riverside sidewalk / 鴨川沿いの歩道 | `riverside` | `shijo-ohashi` → `kawabata-riverside` → `sanjo-ohashi` | 639 m, 9 min | `false` | — |
| `yasaka-maruyama` | Yasaka and Maruyama Park / 八坂神社と円山公園 | `park` | `yasaka-west-view` → `maruyama-cherry-path` → `chionin-south-gate-path` | 666 m, 9 min | `true` (3 stair segments) | `quiet_hour` (2×) |

### Why these three were chosen
1. **Zero invented geometry:** Every walk stores the exact GeoJSON `LineString` returned by OpenStreetMap Germany's pedestrian router (`routed-foot`), checked against OSM extracts so no segment is `foot=no` or `access=private`.
2. **Resident-respecting public corridors:** All three stay on major public sidewalks, bridges, shrine approaches, and park paths — deliberately avoiding narrow private residential lanes (per Kyoto City Tourism & Southern Gion visitor guidelines). Every place and walk carries `communityInputStatus: "not-consulted"`.
3. **Full prototype coverage:** Together they cover all 3 active themes (`culture`, `riverside`, `park`), both flat and stair-warned accessibility cases, shared hub stops (`shijo-ohashi`, `yasaka-west-view`) so walks chain cleanly, and both separate PRD incentive scenarios (`bus_relief`, `quiet_hour`).
4. **Fast demo pacing:** Short ~9–11 min walks with 3 stops each let testers earn 60 pts (10/stop + 30 completion) and unlock a demo voucher in a single short session.

---

## 2. Target Expansion (6 New Routes → 9 Total)

### Design Decisions & Reasoning

| Decision | Choice | Reasoning |
|---|---|---|
| **Catalog size** | **9 total walks (+6 new)** | Rich enough to feel like a real city-wide Kyoto catalog while keeping per-place asset verification (~22–25 new places, stories, seals, photos) manageable and avoiding a long scroll wall in the current flat UI. |
| **Geographic mix** | **Adjacent central + iconic outer districts** | Connects outward from the Gion-Shijō/Sanjō core (Okazaki, Imperial Palace) while demonstrating city-wide dispersal across Higashiyama, North Kamo, Arashiyama, and Kyoto Station. |
| **Length & pacing** | **1–2 flagship walks (30–35 min, 5 stops) + 4–5 short/medium walks (10–20 min, 3–4 stops)** | Reflects real Kyoto walking journeys (e.g., full Philosopher's Path, Tadasu-no-Mori) and makes time-budget search (`under 15 minutes`, `20分以内`, etc.) genuinely useful. |
| **UI & themes** | **Keep the existing flat list and 3 themes (`culture`, `riverside`, `park`) untouched** | 9 cards remain easy to browse without adding extra filter chrome or risking UI merge conflicts while UI work proceeds in parallel on `main`. |
| **Per-place photos** | **Fetch vetted CC-licensed Wikimedia Commons photos for every new place with an exact match** | Preserves visual polish and attribution honesty; places without an exact photo intentionally fall back to the illustrated placeholder. |
| **Demo scenarios & trail** | **Add fitting new walks to `DEMO_SCENARIOS`; keep `DEMO_TRAIL.goal = 5`** | Showcases `bus_relief` (Kyoto Station) and `quiet_hour` (Philosopher's Path, Arashiyama) on realistic corridors while keeping the 5-seal trail reachable in 1–2 walks. |

### The 6 New Curated Walks

> **Note for implementers:** Final `estimatedMeters`, `estimatedMinutes`, `mappedSteps`, and exact `[lng, lat]` coordinates must come directly from the OSRM `routed-foot` response and OSM way check (see §4, Step 1) — never invent or hand-edit coordinates.

| # | Proposed Walk ID | Name (EN / JA) | Theme | Pacing Tier | Corridor & Public-Facing Stops (3–5 stops) | Demo Scenario |
|---|---|---|---|---|---|---|
| 4 | `okazaki-heian` | Okazaki Canal & Heian Shrine / 岡崎疎水と平安神宮 | `culture` | Medium (~12–15 min, 3–4 stops) | Sanjō/Keage or Niōmon canal approach → Okazaki Canal promenade (Lake Biwa Canal) → Heian Shrine Ōtorii (Grand Torii) sidewalk → Okazaki Park / Heian Shrine Ōtenmon approach | — |
| 5 | `philosophers-path` | Philosopher's Path / 哲学の道 | `riverside` | **Flagship** (~30–35 min, 5 stops) | Ginkaku-ji approach bridge (canal north end) → Hōnen-in footbridge junction → Wakaoji/mid-canal bridge → Eikan-dō approach sidewalk → Nanzen-ji approach / canal south end | `quiet_hour` (2×) |
| 6 | `kamogawa-tadasu` | Kamogawa Delta & Tadasu-no-Mori / 鴨川デルタと糺の森 | `park` | **Flagship** (~30–35 min, 5 stops) | Demachiyanagi / Kamo-ohashi bridge sidewalk → Kamogawa Delta confluence viewpoint (public bank path) → Tadasu-no-Mori south entrance → Kawai Shrine / main forest omotesandō path → Shimogamo Shrine Rōmon gate approach | — |
| 7 | `arashiyama-riverside` | Arashiyama Togetsukyō & Riverside / 嵐山 渡月橋と桂川沿い | `riverside` | Medium (~15–20 min, 3–4 stops) | Togetsukyō Bridge south/north public sidewalk → Katsura River north bank promenade → Arashiyama Park (Kameyama riverside path) → Tenryū-ji main street approach (or Nakanoshima Park bridge) | `quiet_hour` (2×) |
| 8 | `kyoto-gyoen` | Kyoto Imperial Palace Park / 京都御苑 | `park` | Medium (~15–20 min, 3–4 stops) | Sakaimachi-gomon (south public gate) → Kujō Pond & Itsukushima Shrine path → Kenreimon-mae wide gravel promenade → Hamaguri-gomon or Nakadachiuri-gomon (west public gate) | — |
| 9 | `station-umekoji` | Kyoto Station to Higashi Hongan-ji & Umekōji / 京都駅から東本願寺・梅小路公園へ | `culture` | Medium (~15–20 min, 3–4 stops) | Kyoto Station Karasuma north plaza sidewalk → Higashi Hongan-ji Goeidō-mon gate sidewalk → Shichijō-dōri public sidewalk → Umekōji Park east entrance / lawn promenade | `bus_relief` (2×) |

---

## 3. Hard Constraints & Honesty Guardrails

Any AI or engineer implementing these routes **must** obey every rule below (from `.cursor/rules/00-project-guardrails.mdc`, `docs/ROUTE_DATA.md`, and `docs/PRODUCT_REQUIREMENTS.md`):

1. **Public corridors only:** Stay on public sidewalks, bridges, canal promenades, park paths, and main shrine/temple approaches. Never route through private residential alleys, paid temple interiors, or unpaved riverbed ledges.
2. **Never claim unverified statuses:**
   - Every `CuratedPlace` and `CuratedWalk` must keep `communityInputStatus: "not-consulted"`.
   - Never label a walk "resident-approved", "quiet", "low-congestion", or "wheelchair accessible / step-free". Even when `mappedSteps: false`, `accessibilityNotes` must state that crossings, curb ramps, gravel/surface conditions, and crowding require an on-site check.
   - If any matched OSM way has `highway=steps`, set `mappedSteps: true` and explicitly warn about stairs in `accessibilityNotes`.
3. **Exact OSRM geometry, zero manual line drawing:** Do not hand-draw `LineString` coordinates or approximate distances/times. Store the full OSRM `routed-foot` `LineString` and record the exact `routingRequestUrl` and `reviewedOn` date (`YYYY-MM-DD`).
4. **Licensing & attribution:**
   - OSM data: credit OpenStreetMap contributors (`ODbL 1.0`) via `sourceIds` referencing `"osm"` and `"osm-foot-router"`.
   - Tourism/Wikipedia pages: cite for facts only in `ROUTE_SOURCES` and `PLACE_STORIES`; never copy prose or non-free images.
   - Photos: Wikimedia Commons only, strictly matching `^(CC BY(-SA)? [0-9.]+|CC0|Public domain)$`.
5. **Preserve existing 9–10 min riverside test semantics:** All new `riverside` walks (`philosophers-path`, `arashiyama-riverside`) **must have `estimatedMinutes >= 11`** so that existing discovery tests checking `river under 10 minutes` / `river within 9 minutes` / `10分以内の川沿い` continue to return `["kamo-riverside"]` uniquely.

---

## 4. Step-by-Step Technical Implementation Playbook

Execute these steps in dependency order. Every contract below is enforced by `npm run typecheck`, `npm run lint`, and `npm test`.

### Step 1: Fetch & Validate OSM Pedestrian Geometry

For each of the 6 new walks:

1. **Identify OSM features** for each stop (public sidewalk/bridge/gate approach node or way) and record its canonical URL (`https://www.openstreetmap.org/node/<id>` or `/way/<id>`).
2. **Query the OSM Germany pedestrian router** (`routed-foot`):
   ```text
   https://routing.openstreetmap.de/routed-foot/route/v1/driving/<lng1>,<lat1>;<lng2>,<lat2>;<lng3>,<lat3>?overview=full&geometries=geojson&steps=true
   ```
   - Note the OSRM API quirk: the path contains `/route/v1/driving/`, while the host prefix `/routed-foot/` selects the **pedestrian** profile.
   - Coordinates are in **GeoJSON `[longitude, latitude]` order**.
   - Extract:
     - `geometry`: `routes[0].geometry` (`{ type: "LineString", coordinates: [...] }`)
     - `estimatedMeters`: `Math.round(routes[0].distance)`
     - `estimatedMinutes`: `Math.max(1, Math.round(routes[0].duration / 60))`
     - `waypoints`: `waypoints[i].location` — these are the exact snapped coordinates on the returned `LineString`.
3. **Set each `CuratedPlace.location` to a coordinate on the `LineString`:**
   - **Critical invariant** (`tests/route-data.test.mjs`):
     ```js
     // Every stop in walk.placeIds MUST appear on walk.geometry.coordinates
     // in strictly increasing index order within 0.00002° (~2 m):
     Math.abs(x - lon) < 0.00002 && Math.abs(y - lat) < 0.00002
     ```
   - Using the exact snapped waypoint vertex (or the closest `LineString` vertex at that stop) guarantees this invariant passes cleanly. If a place is shared across two walks, ensure both walks' OSRM requests include that exact `[lng, lat]` so both lines pass through it within `0.00002°`.
4. **Validate segments against OSM tags:**
   - Inspect `routes[0].legs[].steps[]` and/or fetch the bounding-box OSM extract (`https://api.openstreetmap.org/api/0.6/map?bbox=...`) to verify:
     - Zero matched segments have `foot=no`, `foot=private`, `access=no`, or `access=private`.
     - Check whether any matched way has `highway=steps`; set `mappedSteps: true | false` accordingly and note step counts/surfaces for `docs/ROUTE_DATA.md`.

---

### Step 2: Author `src/data/kyoto-walks.ts`

Follow the exact types in `src/types/routes.ts`:

- **`ROUTE_SOURCES`**: Add Kyoto City Tourism / official public reference entries for the new areas (e.g., `kyoto-heian`, `kyoto-philosophers-path`, `kyoto-shimogamo`, `kyoto-arashiyama`, `kyoto-gyoen`, `kyoto-higashi-honganji`, `kyoto-umekoji`) with `id`, `title`, `url` (`https://...`), and `accessedOn` (`YYYY-MM-DD`).
- **`CURATED_PLACES`**: Add each new place with:
  - `id`: kebab-case slug (e.g., `okazaki-canal-promenade`, `heian-otorii`, `ginkakuji-canal-bridge`, `togetsukyo-bridge`, etc.)
  - `name`: `{ en, ja }`
  - `description`: `{ en, ja }` — original short 1-sentence summary (no copied tourism prose)
  - `location`: `[lng, lat]` snapped to the route `LineString`
  - `osmFeatureUrl`: verified OSM node/way URL
  - `sourceIds`: non-empty array of IDs present in `ROUTE_SOURCES` (always include `"osm"`)
  - `accessNotes`: `{ en, ja }` — explicit public-path boundary (e.g., stay on canal path, stop before temple gate/paid area, obey crossings)
  - `accessibilityNotes`: `{ en, ja }` — honest surface/gravel/stairs/crossing notes stating on-site check is needed
  - `communityInputStatus: "not-consulted"`
- **`CURATED_WALKS`**: Add the 6 new `CuratedWalk` entries with:
  - `id`, `name`, `description`, `theme` (`"culture" | "riverside" | "park"`), `placeIds`, `geometry`, `estimatedMeters`, `estimatedMinutes`, `sourceIds` (include `"osm"` and `"osm-foot-router"`), `routingRequestUrl`, `reviewedOn`, `mappedSteps`, `accessibilityNotes`, `residentNotes`, `communityInputStatus: "not-consulted"`.

---

### Step 3: Author Sourced Bilingual Draft Stories (`src/data/place-stories.ts`)

Every new `place.id` in `CURATED_PLACES` **must** have an entry in `PLACE_STORIES`.

**Enforced invariants (`tests/place-content.test.mjs`):**
- `Object.keys(PLACE_STORIES).sort()` must match `CURATED_PLACES.map(p => p.id).sort()` **1-to-1** (no missing keys, no extra keys).
- `status` must be `"draft"`.
- `text.en.length > 40` and `text.ja.length > 20`.
- `sources.length >= 1` and every `source.url` must start with `https://`.
- Every factual claim must be supported by the cited Wikipedia / Kyoto City Tourism / official public source. Include `checkedOn: "YYYY-MM-DD"`.

---

### Step 4: Add Place Themes & Unique Seal SVGs (`src/components/glyphs.tsx`)

Update **two** maps in `src/components/glyphs.tsx` for every new place:

1. **`PLACE_THEMES`**: Map each new `place.id` to `"culture" | "riverside" | "park"`.
   - *Gotcha:* Omitting a place from `PLACE_THEMES` won't fail a test, but `placeTheme(placeId)` silently falls back to `"culture"`, giving riverside/park pins the wrong color!
2. **`PLACE_SEAL_PATHS`**: Add one unique `24 × 24` minimalist line-art SVG path string per place (same 1.5 px stroke aesthetic as existing seals).
   - **Critical test gotcha** (`tests/place-content.test.mjs` line 34):
     ```js
     for (const place of CURATED_PLACES) assert.ok(glyphs.includes(`"${place.id}": '<`), place.id);
     ```
     Each entry **must** use double quotes around the key, a single space after the colon, and a single-quoted SVG string starting with `<` on the same line:
     ```ts
     "togetsukyo-bridge": '<path d="..."/>',
     ```

---

### Step 5: Fetch Vetted Wikimedia Commons Photos (`scripts/fetch_place_photos.py`)

1. For each new place, find a Wikimedia Commons `File:...` photo showing that exact spot under an allowed license (`CC BY`, `CC BY-SA`, `CC0`, or `Public domain`).
2. Add `"<place-id>": "File:..."` entries to `CHOSEN` in `scripts/fetch_place_photos.py`.
   - If a spot has no exact, openly licensed Commons photo, **omit it** from `CHOSEN` so the UI renders the illustrated placeholder instead of a misleading image.
   - **Do NOT add `"chionin-south-gate-path"`** — `tests/place-content.test.mjs` line 30 explicitly asserts `photos['chionin-south-gate-path'] === undefined` to keep the placeholder path tested.
3. Run:
   ```bash
   python3 scripts/fetch_place_photos.py
   ```
   This re-verifies every license against the Commons API, downloads an 800 px thumbnail to `public/places/<place-id>.jpg`, and regenerates `src/data/place-photos.json` with `author`, `license`, `licenseUrl`, and `sourceUrl`.
   - *Note:* The script uses standard-library `urllib` with retry backoff and 0.5 s pacing; if Wikimedia rate-limits a large batch, keep the existing entries intact or increase the sleep interval slightly.

---

### Step 6: Wire Demo Scenarios (`src/config/game.ts`)

Update `DEMO_SCENARIOS` while keeping `DEMO_TRAIL` unchanged:

```ts
export const DEMO_SCENARIOS: readonly { kind: CampaignKind; walkIds: readonly string[]; multiplier: number }[] = [
  { kind: "bus_relief", walkIds: ["shijo-yasaka", "station-umekoji"], multiplier: 2 },
  { kind: "quiet_hour", walkIds: ["yasaka-maruyama", "philosophers-path", "arashiyama-riverside"], multiplier: 2 },
];

export const DEMO_TRAIL = { goal: 5 } as const;
```

- **Why this is safe:** `tests/game.test.mjs` checks `activeBonus` on `shijo-yasaka`, `yasaka-maruyama`, and `kamo-riverside` — adding new walk IDs to `bus_relief` and `quiet_hour` keeps those two concepts separate and passes all existing game tests without modification.

---

### Step 7: Check Route Discovery & Update Unit Tests

1. **Check `src/lib/route-discovery.ts`:**
   - `themeTerms` already matches `culture`/`shrine`/`temple`/`神社`/`寺院`, `river`/`riverside`/`bridge`/`川沿い`/`橋`, and `park`/`garden`/`cherry`/`nature`/`公園`/`桜`/`自然`.
   - Consider adding `"canal"` / `"疎水"` / `"疏水"` to `themeTerms.riverside` and `"forest"` / `"森"` / `"御苑"` to `themeTerms.park` so bilingual queries for Okazaki Canal, Philosopher's Path, Tadasu-no-Mori, and Kyōto Gyoen match by theme as well as by place name.
   - Keep `unverifiedTerms` strict — never claim a walk matches `"quiet"`, `"wheelchair"`, `"step-free"`, `"cafes"`, or `"seasonal"`.
2. **Update hardcoded 3-walk assertions in `tests/route-discovery.test.mjs`:**
   - **Line 25 & Line 58:** Change `assert.equal(result.suggestions.length, 3, query)` → `assert.equal(result.suggestions.length, CURATED_WALKS.length, query)`.
   - **Line 33:** `ids(find('', 'park'))` will now return all `park` walks (`yasaka-maruyama`, `kamogawa-tadasu`, `kyoto-gyoen`) instead of only `['yasaka-maruyama']`.
   - **Line 66:** `ids(find('1005分の川沿い'))` will now return all `riverside` walks (`kamo-riverside`, `philosophers-path`, `arashiyama-riverside`).
   - **Line 71:** `ids(find('1010分'))` will now return `CURATED_WALKS.map(w => w.id)` instead of the hardcoded 3-ID array.
   - **Add targeted assertions** for the new flagship & outer-district walks (e.g., `"Philosopher"`, `"嵐山"`, `"京都駅"`, `"under 20 minutes"` excluding the 30+ min flagship walks).

---

### Step 8: Update Audit Documentation

1. **`docs/ROUTE_DATA.md`**: Add all 6 new walks to the route review table (ordered stops, OSM foot-router estimate, segment match check, `mappedSteps` summary) and add field-review handoff prompts for each new corridor.
2. **`docs/DECISIONS.md`**: Add a short dated entry recording the expansion from 3 → 9 curated walks and the updated `DEMO_SCENARIOS` assignments.

---

## 5. Gotchas & Common Pitfalls

| Pitfall | Why it happens | Prevention |
|---|---|---|
| `route-data.test.mjs` fails with `missing or out of order` | Place `[lng, lat]` is > `0.00002°` (~2 m) from the OSRM `LineString`, or two stops snap to the same vertex index | Always set `CuratedPlace.location` to a distinct vertex on `walk.geometry.coordinates` in itinerary order |
| `place-content.test.mjs` fails on seal check | `glyphs.tsx` check uses literal substring `glyphs.includes(\`"${place.id}": '<\`)` | Format every `PLACE_SEAL_PATHS` entry with double-quoted key + single-quoted `<path...` on one line |
| Wrong pin color on Explore map | New place omitted from `PLACE_THEMES` in `glyphs.tsx` | Always add every new `placeId` to `PLACE_THEMES` |
| `route-discovery.test.mjs` fails on `river under 10 minutes` | A new `riverside` walk has `estimatedMinutes <= 10` | Keep `philosophers-path` and `arashiyama-riverside` at `>= 11 min` |
| `place-content.test.mjs` fails on `chionin-south-gate-path` | Added a photo for `chionin-south-gate-path` | Keep `chionin-south-gate-path` omitted from `CHOSEN` in `fetch_place_photos.py` |
| `place-content.test.mjs` fails on license regex | Wikimedia photo is `CC BY-NC` or `GFDL` or non-standard string | Only choose `CC BY`, `CC BY-SA`, `CC0`, or `Public domain` files; `fetch_place_photos.py` rejects everything else |
| Merge conflicts with UI work on `main` | Editing UI layout/CSS while working on `prototype-engineering` | Keep route expansion changes confined to `src/data/`, `src/config/game.ts`, `src/lib/route-discovery.ts`, `src/components/glyphs.tsx`, `scripts/fetch_place_photos.py`, `public/places/`, `tests/`, and `docs/` |

---

## 6. Verification Checklist (Before Merging)

Run all automated checks:
```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Then verify in a local browser (`npm run dev` at `390 × 800` portrait mobile):
- [ ] **Explore (Map view):** All 9 walks render in the bottom sheet; tapping an outer-district walk (e.g., Arashiyama, Philosopher's Path, Kyoto Station) flies/fits the map to its route line and shows numbered pins with correct theme colors.
- [ ] **Explore (List view):** Every new walk, stop, photo (with Wikimedia author + license credit), draft story, and accessibility/resident note renders with zero broken images.
- [ ] **Search & time budgets:** Searching `"under 15 minutes"` filters out the 30+ min flagship walks; searching `"Arashiyama"` / `"嵐山"` / `"哲学の道"` returns the expected walk.
- [ ] **Missions (Goshuin book & Demo Mode):** All 9 walks appear cleanly; starting a new walk in Demo Mode steps through all 3–5 checkpoints, awards points + completion bonus (and 2× when the matching Demo Scenario is enabled in Me → Demo controls), and stamps the new unique seals.
- [ ] **Bilingual parity:** Switch between English (`en`) and Japanese (`ja`) in Me and confirm zero untranslated keys or layout overflows.
