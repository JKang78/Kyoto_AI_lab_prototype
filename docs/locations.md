# Famous Kyoto Landmark Icons — Feature Plan

> **Status:** Design & implementation plan (ready for review before coding).  
> **Summary:** Render recognizable, Kyoto-styled icons directly on the **Explore** map for famous Kyoto tourist places (e.g., **Nijō Castle** shows a castle keep icon, **Kiyomizu-dera** shows its wooden stage/pagoda, **Fushimi Inari** shows vermilion torii gates, **Kinkaku-ji** shows the Golden Pavilion, **Kyoto Tower** shows its spire). Uses a GPU-accelerated MapLibre `symbol` layer with built-in collision avoidance, crisp Ink & Washi SVG icons (upgradeable to pixel-art PNG sprites), and clean tap-to-preview integration with **Ask the Fox** and curated walks.  
> **Related docs:** [visuals.md](./visuals.md), [ROUTE_DATA.md](./ROUTE_DATA.md), [PINS_ASSETS.md](./PINS_ASSETS.md), [MASCOT_ASSETS.md](./MASCOT_ASSETS.md), [fox_chatbot.md](./fox_chatbot.md).

---

## 1. Goals & Product Experience

Right now, the Explore map renders generic themed pins (`culture` torii, `riverside` waves, `park` leaf) for the 33 stops in `CURATED_PLACES`, while famous Kyoto sights outside those stops appear only as plain OpenFreeMap text labels. Adding iconic landmark illustrations makes the map immediately scannable and gives visitors an intuitive sense of Kyoto's geography at a glance.

### Core Principles
1. **Instant visual orientation:** Famous sights like Nijō Castle, Kiyomizu-dera, Kinkaku-ji, Fushimi Inari, Tō-ji, and Kyoto Tower are recognizable even before reading a label.
2. **Clear visual hierarchy (landmarks ≠ check-in stops):**
   - **Curated walk stops (`CURATED_PLACES`)** stay solid teardrop pins (`34 px`, vermilion/indigo/matcha, numbered during walks) — these are where stamps and points are earned.
   - **Famous landmark icons (`KYOTO_LANDMARKS`)** use a distinct illustrated medallion / soft-washi halo (`36–44 px`), sitting below active walk pins and the fox marker so they enrich the map without competing with check-in targets.
3. **Zero clutter during active walks:** When a user previews a walk (`selectedWalk !== null`) or is actively walking (`playing === true`), unrelated standalone landmarks fade out or hide so the route line, numbered stops, and fox remain the hero.
4. **Honest & grounded:** Landmark coordinates and links come strictly from verified OpenStreetMap features. Standalone landmarks not yet on a curated walk never show fake check-in buttons, fake points, or unverified opening hours/admission fees.

---

## 2. Famous Kyoto Landmarks Roster (`src/data/kyoto-landmarks.ts`)

Start with **15 iconic Kyoto tourist places** spanning central, east, north, west, and south Kyoto, organized into two zoom tiers so the map stays clean at city scale and reveals more detail as you zoom in:

| ID | English Name | Japanese Name | Icon Motif (`iconId`) | Zoom Tier | Linked Curated Stop (`linkedPlaceId`) |
|---|---|---|---|---|---|
| `nijo-castle` | Nijō Castle | 二条城 | `castle` (tiered castle keep & stone wall) | Tier 1 (`>= 11.5`) | — (standalone) |
| `kiyomizu-dera` | Kiyomizu-dera | 清水寺 | `temple-stage` (wooden hillside stage & roof) | Tier 1 (`>= 11.5`) | — (standalone) |
| `kinkaku-ji` | Kinkaku-ji (Golden Pavilion) | 金閣寺 | `golden-pavilion` (gold-accented 3-tier pavilion) | Tier 1 (`>= 11.5`) | — (standalone) |
| `fushimi-inari` | Fushimi Inari-taisha | 伏見稲荷大社 | `torii-tunnel` (vermilion stacked torii gates) | Tier 1 (`>= 11.5`) | — (standalone) |
| `kyoto-imperial-palace` | Kyoto Imperial Palace | 京都御所 | `imperial-palace` (walled palace roof & gate) | Tier 1 (`>= 11.5`) | `kenreimon-avenue` |
| `heian-shrine` | Heian Shrine | 平安神宮 | `grand-torii` (giant vermilion Ōtorii) | Tier 1 (`>= 11.5`) | `heian-otorii` |
| `yasaka-shrine` | Yasaka Shrine | 八坂神社 | `tower-gate` (vermilion two-storey Nishirōmon) | Tier 1 (`>= 11.5`) | `yasaka-west-view` |
| `togetsukyo` | Togetsukyō Bridge (Arashiyama) | 渡月橋（嵐山） | `bridge-moon` (arched timber bridge & mountain) | Tier 1 (`>= 11.5`) | `togetsukyo-bridge` |
| `kyoto-tower` | Kyoto Tower & Station | 京都タワー・京都駅 | `tower` (white spire & observation deck) | Tier 1 (`>= 11.5`) | `kyoto-station-plaza` |
| `to-ji` | Tō-ji Five-Storey Pagoda | 東寺 五重塔 | `pagoda` (five-storey wooden pagoda) | Tier 1 (`>= 11.5`) | — (standalone) |
| `ginkaku-ji` | Ginkaku-ji (Silver Pavilion) | 銀閣寺 | `silver-pavilion` (two-tier pavilion & sand cone) | Tier 2 (`>= 12.8`) | `ginkakuji-bridge` |
| `nanzen-ji` | Nanzen-ji Temple | 南禅寺 | `sanmon-gate` (monumental wooden Sanmon) | Tier 2 (`>= 12.8`) | `nanzenji-sanmon-approach` |
| `shimogamo-shrine` | Shimogamo Shrine | 下鴨神社 | `forest-shrine` (shrine gate framed by forest) | Tier 2 (`>= 12.8`) | `shimogamo-romon` |
| `nishiki-market` | Nishiki Market | 錦市場 | `market-lantern` (covered arcade & noren/lantern) | Tier 2 (`>= 13.2`) | — (standalone) |
| `nishi-honganji` | Nishi Hongan-ji | 西本願寺 | `temple-hall` (grand temple roof & ginkgo) | Tier 2 (`>= 13.2`) | `nishi-honganji-gate` |

### Data Schema (`src/types/routes.ts` or `src/data/kyoto-landmarks.ts`)
```ts
export type LandmarkIconId =
  | "castle"
  | "temple-stage"
  | "golden-pavilion"
  | "torii-tunnel"
  | "imperial-palace"
  | "grand-torii"
  | "tower-gate"
  | "bridge-moon"
  | "tower"
  | "pagoda"
  | "silver-pavilion"
  | "sanmon-gate"
  | "forest-shrine"
  | "market-lantern"
  | "temple-hall";

export type KyotoLandmark = Readonly<{
  id: string;
  name: LocalizedText;
  iconId: LandmarkIconId;
  location: LngLat;          // Verified OSM [lng, lat]
  osmFeatureUrl: string;     // https://www.openstreetmap.org/...
  summary: LocalizedText;    // 1–2 concise orientation sentences
  minZoom: number;           // Tier 1: 11.5, Tier 2: 12.8–13.2
  linkedPlaceId?: string;    // Optional link to an existing CURATED_PLACES stop
  nearbyWalkIds: readonly string[];
}>;
```

### Deduplication Rule (No Overlapping Icons & Stop Pins)
- If a landmark has a `linkedPlaceId` whose `CURATED_PLACES` stop pin is currently visible at the same location, either:
  - **Option 1 (Cleanest):** Render the landmark icon *only* for standalone landmarks (or when zoomed out below `13.8`), and let the stop pin take over when zoomed in on a walk; **or**
  - **Option 2 (Unified):** Upgrade the `CURATED_PLACES` stop pin itself to show the landmark silhouette instead of the generic theme icon (`glyphSvg`) when not numbered!
- **Recommendation:** Combine both — show standalone famous landmarks (Nijō Castle, Kiyomizu-dera, Kinkaku-ji, Fushimi Inari, Tō-ji, Nishiki Market, etc.) on the new `kyoto-landmarks` map layer, AND upgrade `pinMarkup()` in `kyoto-map.tsx` to optionally use `placeSealSvg()` / landmark icons for curated stops when browsing (`number === null`), keeping numbered pins (`1`, `2`, `3`) when a walk is active.

---

## 3. Visual Style & Artwork Pipeline

To match Kyoto Ink & Washi + the pixel-art fox mascot without blocking implementation on external art commissions:

### Phase 1 — Built-in Kyoto Illustrated SVG Badges (Ships Immediately)
- Create `src/lib/landmark-icons.ts` with a registry of crisp, multi-tone `40 × 40` SVG illustrations (e.g., sumi-ink roof lines `#1c1917`, torii vermilion `#c83e37`, antique gold `#c69c4d` for Kinkaku-ji, washi ivory `#faf8f4` circular/crest backing with a `1.5 px` hairline border and soft drop shadow).
- Zero network requests, works 100% offline, sharp on Retina displays (`pixelRatio: 2`).
- Reuse & enrich motifs already started in `PLACE_SEAL_PATHS` (`src/components/glyphs.tsx`).

### Phase 2 — Optional Pixel-Art PNG Drop-In (`public/assets/landmarks/`)
- Extend `src/config/assets.ts`:
  ```ts
  landmarks: "/assets/landmarks/" as string | null, // e.g. /assets/landmarks/castle.png (64×64 pixel art)
  ```
- Mirror `public/assets/mascot/pixel/` (`64 × 64` transparent RGBA PNGs, `image-rendering: pixelated`).
- `src/lib/landmark-icons.ts` checks for a configured PNG first and automatically falls back to the built-in SVG badge if missing — so the team can drop in custom pixel art landmark by landmark without breaking the map.

---

## 4. MapLibre Rendering Architecture (`src/components/map/kyoto-map.tsx`)

### Why Native MapLibre `symbol` Layer (Not DOM Markers)
Unlike the single fox marker, rendering 15+ landmark icons as DOM `maplibregl.Marker` nodes causes layout thrashing during pan/zoom and manual collision math. Instead, render `KYOTO_LANDMARKS` as a **native MapLibre GeoJSON `source` + `symbol` layer**:

1. **Image registration on `map.once("load")`:**
   - Rasterize each `LandmarkIconId` SVG (or load its PNG from `assetPaths.landmarks`) into an `HTMLImageElement` at `2×` resolution (`80 × 80 px`) and call `map.addImage(`landmark-${iconId}`, img, { pixelRatio: 2 })`.
2. **GeoJSON source (`kyoto-landmarks`):**
   - One `FeatureCollection` of `Point` features with properties `{ id, iconId, nameEn, nameJa, minZoom, linkedPlaceId }`.
3. **Symbol layer (`kyoto-landmarks-layer`):**
   - Placed **below** `fox-halo` and DOM stop pins so check-in pins and the fox always sit on top.
   - Layout properties:
     - `"icon-image": ["concat", "landmark-", ["get", "iconId"]]`
     - `"icon-size": ["interpolate", ["linear"], ["zoom"], 11.5, 0.72, 13.5, 0.92, 15.5, 1.05]`
     - `"icon-allow-overlap": false` (automatic collision avoidance!)
     - `"icon-padding": 6`
     - `"text-field": ["get", locale === "ja" ? "nameJa" : "nameEn"]` (compact caption beneath icon at `zoom >= 13.2`, dynamically updated when `locale` switches)
     - `"text-optional": true` (icon stays visible even if its caption collides with another label!)
   - Filter expression: `["<=", ["get", "minZoom"], ["zoom"]]` (or via `step` on opacity/size) so Tier 2 landmarks smoothly appear as the user zooms in.
4. **Route & Walk Mode Visibility:**
   - When `playing === true` or `selectedWalk !== null`, dim unrelated standalone landmarks (`icon-opacity: 0.35`, `text-opacity: 0`) or hide them so the selected walk's stops stay crystal clear.
5. **Map Look Integration (`src/lib/map-looks.ts`):**
   - Keep `kyoto-landmarks-layer` visible when **Landmark names only** (`prefs.landmarkLabelsOnly`) is enabled in **Account → Map look**; scale its text label when **Larger map labels** (`prefs.largerLabels`) is enabled.
6. **Interaction (`click` + hover):**
   - `map.on("click", "kyoto-landmarks-layer", (event) => ...)` opens the tapped landmark.
   - `mouseenter` / `mouseleave` toggles `map.getCanvas().style.cursor = "pointer"`.

---

## 5. Tap Interaction & Integration with Existing Features

When a user taps a landmark icon on the Explore map:
- **If `linkedPlaceId` is set** (e.g., Yasaka Shrine → `yasaka-west-view`, Heian Shrine → `heian-otorii`, Togetsukyō → `togetsukyo-bridge`):
  - Calls existing `openPlace(placeById(linkedPlaceId))`, opening the rich Place view with photo, unlocked story, walk time, and accessibility notes.
- **If standalone** (e.g., **Nijō Castle**, **Kiyomizu-dera**, **Kinkaku-ji**, **Fushimi Inari**, **Tō-ji**, **Nishiki Market**):
  - Opens a clean **Landmark view** (`view === "landmark"`) in `SnapSheet` (at `"half"` snap) — no new modal or overlay needed:
    1. Landmark icon badge + bilingual title (`Nijō Castle` / `二条城`)
    2. Short factual orientation summary (`landmark.summary[locale]`)
    3. **"Ask the Fox about this place"** button → opens `FoxGuideDialog` directly so the user can ask about Nijō Castle's history or etiquette!
    4. **Nearby curated walks** (if `nearbyWalkIds.length > 0`) with one-tap `Preview route` links.
    5. **OpenStreetMap source link** (`landmark.osmFeatureUrl`) + **"Open in Google Maps"** walking handoff link.

---

## 6. Proposed File Map

| Action | File | Responsibility |
|---|---|---|
| `[NEW]` | `src/data/kyoto-landmarks.ts` | Verified roster of 15 famous Kyoto landmarks (`KYOTO_LANDMARKS`) with OSM URLs, coordinates, bilingual names/summaries, `iconId`, and zoom tiers |
| `[NEW]` | `src/lib/landmark-icons.ts` | Crisp Ink & Washi SVG icon registry for all `LandmarkIconId` motifs + `loadLandmarkMapImages(map)` helper (with optional PNG override from `public/assets/landmarks/`) |
| `[NEW]` | `tests/landmarks.test.mjs` | Unit tests verifying Kyoto bounds, unique IDs, `https://` OSM URLs, complete EN/JA strings, valid `iconId` mappings, and valid `linkedPlaceId` / `nearbyWalkIds` references |
| `[MODIFY]` | `src/config/assets.ts` | Add `landmarks: string | null` slot (defaults to `null` to use built-in SVGs until pixel-art PNGs are added) |
| `[MODIFY]` | `src/components/map/kyoto-map.tsx` | Register landmark images, add `kyoto-landmarks` GeoJSON source & `symbol` layer, handle click/locale/walk-mode visibility, and render the `view === "landmark"` panel in `SnapSheet` |
| `[MODIFY]` | `src/lib/map-looks.ts` | Respect `largerLabels` and keep `kyoto-landmarks-layer` visible in `landmarkLabelsOnly` mode |
| `[MODIFY]` | `src/locales/en.json`, `src/locales/ja.json` | Add bilingual `landmark*` UI labels (e.g., `landmarkBadge`, `landmarkAskFox`, `landmarkNearbyWalks`, `landmarkDirections`) |
| `[MODIFY]` | `src/app/globals.css` | Append styles for the landmark icon header and compact card inside `SnapSheet` |

### Node Test Gotcha Reminder
- Keep `src/data/kyoto-landmarks.ts` and `src/lib/landmark-icons.ts` free of `@/` imports (use relative `.ts` imports) so `npm test` (`node --test tests/*.test.mjs`) can import them directly.

---

## 7. Verification Plan

### Automated Unit Tests (`tests/landmarks.test.mjs`)
- Every landmark has a unique `id`, non-empty EN & JA `name` and `summary`, and coordinates inside Kyoto (`34.93–35.12` lat, `135.67–135.84` lng).
- Every `osmFeatureUrl` starts with `https://www.openstreetmap.org/`.
- Every `iconId` exists in `LANDMARK_ICON_SVGS` and produces valid SVG markup.
- Every `linkedPlaceId` resolves in `CURATED_PLACES`, and every `nearbyWalkIds` entry resolves in `CURATED_WALKS`.
- `npm run typecheck`, `npm run lint`, and `npm test` all pass.

### Browser / Mobile QA (`360 × 800`, `390 × 800`, `430 × 800` in EN & JA)
- [ ] Iconic badges render visibly on the Explore map (verify Nijō Castle, Kiyomizu-dera, Kinkaku-ji, Fushimi Inari, Kyoto Tower) with zero overlapping labels or clipped icons.
- [ ] Switching language between EN and JA updates landmark captions on the map immediately.
- [ ] Tapping **Nijō Castle** opens the Landmark sheet with its icon, summary, OSM link, Google Maps link, and working **Ask the Fox** button.
- [ ] Tapping a linked landmark (e.g., **Yasaka Shrine**) opens the existing Place view without duplicating pins.
- [ ] Starting a walk dims/hides unrelated landmarks so numbered walk stops and the fox marker remain unobstructed.
- [ ] Zero console errors, zero uncaught page errors, zero horizontal overflow.

---

## 8. Open Decisions Before Implementation

1. **Artwork style for v1:** Ship crisp multi-tone Ink & Washi SVG badges first (fast, zero-asset-pipeline, pixel-art PNG drop-in ready), or generate/draw 64×64 pixel-art PNG sprites for all 15 landmarks up front?
2. **Curated stop pins:** Should we also swap the generic theme icon on non-numbered `CURATED_PLACES` pins to their place-specific `PLACE_SEAL_PATHS` / landmark icons, or keep curated stop pins distinct?
3. **Standalone landmark tap action:** Confirm whether tapping Nijō Castle / Kiyomizu-dera should open a compact Landmark info sheet with an **"Ask the Fox"** button (recommended) or remain orientation-only (non-tappable).
