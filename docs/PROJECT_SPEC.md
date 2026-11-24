# Kyoto AI Lab prototype — Product Requirements Document (PRD)

**Current navigation.** Explore opens on the map. The other tabs are Missions, Rewards and Me. The five-tab descriptions below record the original baseline. [Current product requirements](PRODUCT_REQUIREMENTS.md#7-functional-requirements-and-acceptance-criteria)

**Version:** 1.0 (baseline)  
**Prepared:** 2026-11-18  
**Product name:** Kyoto AI Lab prototype (working name, confirmed by project owner)  
**Format:** Mobile-first Progressive Web App (PWA), accessed by URL and addable to a phone home screen  
**Development mode:** Visual-first interactive prototype; real GPS is the exception to otherwise mostly simulated logic  
**Delivery date:** Not specified  
**Coding platform:** Not selected; this specification is platform-agnostic  
**Budget:** Flexible, but minimize dependencies and costs until needed  
**Status:** Baseline for AI-assisted implementation; not an assertion that external partnerships or data feeds exist

> **Instruction to the coding agent:** Read this entire document and inspect both reference images in `references/` **before** writing UI code. Implement the specified flows, prioritize a beautiful usable mobile presentation, and do **not** substitute a generic travel dashboard for the map-based exploration experience. Do not claim mocked data or rewards are live. If something is unconfirmed, use the marked default and keep it configurable rather than inventing an agreement or public data integration.

## 0. Source of truth and decision hierarchy

1. **Latest confirmed user choices** in this PRD take precedence over earlier brainstorming.
2. **Visual references** in this bundle guide the interface and atmosphere, but the user selected **flexible visual fidelity**: match the concept, hierarchy, and style, **not** pixel-for-pixel recreation.
3. **Team working document:** [Kyoto AI Innovation Lab — Weekly Progress Doc](https://docs.google.com/document/d/1xsKeLv6EpfPP7KjEySfI7U6urZOIDCbRGCTFG83O8g0/edit), especially the **Prototype**, **Overview**, **UI/UX/Design**, and **City Hall 打ち合わせ** tabs. It is an evolving brainstorm, not a list of all approved features.
4. This document clearly labels **CONFIRMED**, **RECOMMENDED IMPLEMENTATION DEFAULT**, **DEMO/SIMULATED**, **FUTURE/OUT OF SCOPE**, and **OPEN** decisions.

### Reference assets included

- `references/map-tab-reference.png`: **primary map-tab reference**, showing (left) default exploration and (right) selected-route / location-card states. Use as a visual guide, **not** as a static map background.
- `references/fox-avatar-reference.png`: user-provided design inspiration showing fox concept and example gamified-map context. The original mascot production files are **not yet supplied**.
- **Assets decision (CONFIRMED):** User will supply original production artwork. **Do not redraw or auto-generate a competing mascot or permanently replace it with AI art**. Until those files arrive, use a clearly swappable temporary mascot graphic or simple marker with the same size/layout; wire an asset path for eventual replacement.

## 1. Product vision

### Pitch (from the team Prototype tab)

> **“Gamify how you explore Kyoto and benefit along the way.”**

A visually engaging, fox-guided exploration experience that encourages tourists and residents to discover Kyoto on foot (and potentially by micro-mobility). Instead of optimizing only for the fastest transit option, it offers interesting themed routes and incentives to **reduce competition with residents for crowded bus capacity**, while directing attention and potential spending toward locally appropriate destinations and businesses.

### Core problem and hypothesis

- Kyoto's tourism-driven bus crowding can interfere with residents' everyday mobility.
- Some visitors may choose walking or other alternatives when routes are convenient, interesting, and rewarding.
- Rewards should ideally benefit local businesses rather than only large chains.
- **Ethical constraint:** Moving people away from famous sights must **not** simply push crowds into quiet residential streets or sensitive areas. Prefer community-approved or well-suited public routes; include etiquette reminders.

The app does **not** claim to have proven that it reduces congestion. The prototype is designed to **demonstrate and test** the behavior-change hypothesis.

### Primary audiences

1. Visitors exploring Kyoto, especially those staying longer than a day trip and willing to walk for discoveries.
2. Kyoto residents interested in themed walks and local rewards.
3. Showcase observers such as city, transit, university, and local-business stakeholders evaluating the concept.

### Prototype success

A first-time tester can open the app, enter a nickname, view the map, select a personalized route, explore interactive checkpoints, complete a simulated or location-verified checkpoint, earn demo coins, see coupon progress, and navigate every bottom tab—all on a phone, with a coherent and attractive look.

## 2. Confirmed scope and boundaries

| Decision | Confirmed choice | Implication |
|---|---|---|
| Prototype level | **A — visual prototype** | Prioritize polish, interactions and demonstration over production backend |
| Map | **C — hybrid** | Real Kyoto geography + soft illustrated/custom-styled interactive map |
| Route engine | **C — curated with personalization** | Use curated/validated sample routes; filters and prompt steer selection |
| Fox avatar | **C — GPS** | Use device GPS with permission for position; demo fallback exists |
| Rewards | **B — interactive** | Demo coins, progress, unlockable demo coupons |
| Missions | **B — gamified** | Multiple quests, stamps, progress and completion animations |
| Login | **B — simulated**, with **simple welcome UX** | Nickname + language onboarding; no password/auth backend |
| Languages | **B — English and Japanese** | Fully working language toggle, not decorative |
| Navigation | **A — all five tabs** | Home, Map, Rewards, Missions, Settings all receive real screen designs |
| Fidelity | **B — flexible** | Follow reference visual language and layout hierarchy; allow usability improvements |
| Initial map | **C — GPS** | Request location appropriately; if unavailable, offer clear Kyoto demo |
| Route UI | **C — categories + prompt** | Chip filters and text search/prompt |
| GPS/demo | **A — both** | Real GPS plus a clearly labeled Kyoto Demo Mode |
| Check-in | **B — proximity + demo** | GPS proximity for real mode; manual/simulated trigger in demo |
| Mascot/assets | **B — originals supplied later** | Asset placeholders only until actual files supplied |
| Name | **Kyoto AI Lab prototype** | Use on welcome screen and PWA install metadata |

**Not committed:** Production AI routing, production walking/step-count rewards, paid coupons, live congestion forecasts, GPS background tracking, business integrations, verified city funding, government endorsement, crowdsourced Wi-Fi tracking, LUUP/ICOCA integration, Google Maps pin import, social features, likes/reviews, user-submitted routes. Keep their possible interfaces or extension points optional where useful; never represent them as active.

## 3. Experience principles

1. **Map-first, game-like—not a generic dashboard.** The map is the signature surface, with routes and story moments happening directly on it.
2. **Warm Kyoto character.** Distinctive purple, cream, pale yellow/gold, gentle linework, lovely location markers, and fox mascot with red accessory.
3. **Relevant, not tourist-spammy.** Surface local history, independent shops, scenery, and public places while respecting residents.
4. **Visible cause and effect.** Route selection changes the map; checkpoint completion changes stamps and coin balance; rewards unlock.
5. **Trustworthy simulation.** Use visible `Demo` or `Sample data` indicators whenever simulating progress, congestion or discounts.
6. **Fast to try.** No mandatory real authentication, payment, long tutorial, or API key to view the main demo.
7. **Phone-native feel.** Rounded controls, readable typography, responsive touch targets, haptic-like animations where possible, stable bottom navigation, installable PWA.

## 4. Visual and interaction design

### 4.1 Visual references

Interpret `references/map-tab-reference.png` as two app states, **not** two separate apps:

- **Left:** default map with progress/coupon bar, destination search, filter chips, multiple colored dotted route ideas, fox location, traffic cues, recommended-route card, `List` button, and fixed bottom navigation.
- **Right:** route-selected map with route title/duration, highlighted pink dotted route, photo-based pins, a location detail card, coupon quest marker, etiquette reminder, fox, `List` button, and same bottom navigation.

Prefer the layout and visual grammar over matching each word or pin coordinate. The reference screenshot's location names and traffic signals are design examples, **not verified live sources**.

### 4.2 Colors and type

**Source-confirmed brand color:** `#782459` (Kyoto Purple). Pair with warm cream and pale yellow. The exact supporting values below are **suggested adjustable tokens**, not team-finalized hex codes.

```css
:root {
  --kyoto-purple: #782459; /* confirmed */
  --plum-medium: #A85B7F; /* proposed */
  --cream: #FFF8F1; /* proposed */
  --warm-white: #FFFCF8; /* proposed */
  --pale-yellow: #F5DEAB; /* proposed */
  --gold: #E5B764; /* proposed */
  --sage-green: #91A777; /* proposed */
  --soft-pink: #E8A3AD; /* proposed */
  --alert-coral: #F37E70; /* proposed */
  --text-primary: #623C4B; /* proposed */
}
```

- Use fewer heavy pink/beige overlays than the screenshot if necessary; the team's notes request a more gender-neutral feel.
- Rounded, cream-filled pill controls with discreet purple borders and soft shadows.
- Distinct colored pin families: shrines/temples, nature/parks, cultural landmarks, cafés/local shops, and rewards.
- Decorative Japanese-inspired accents are subtle, not cluttered.
- Use readable sans-serif interface text (English/Japanese coverage); a tasteful display face for headings is optional.
- Preserve accessible contrast: visual warmth must not make text unreadable.

### 4.3 Main Map tab composition

Top to bottom, overlaid on a **real interactive geographic map**:

1. **Floating progress/reward header:** flower/stamp icon, progress bar, ticket/coupon icon, “Next reward: Coupon!” text. Tap to open Rewards.
2. **Search:** rounded search field: “Search for a destination or route…”; location/recenter icon on the right. Focus opens a compact suggestion/prompt panel.
3. **Horizontally scrollable category chips:** Cultural Landmarks, Cafés & Local Shops, Bike/Scooter Rental, More. Additional categories via More: History, Nature, Hidden Gems, Luggage-friendly, Seasonal.
4. **Map canvas:** softly styled streets, realistic Kyoto geography, river/greenery/buildings where available; pan/zoom; themed marker clusters and route dots; fox as current position; soft red/yellow road congestion highlights labeled as sample/demo.
5. **Contextual overlays:** default invitation (“Explore Kyoto! Collect stamps and get special rewards!”), route chips, traffic labels; after route selection show selected-route pill, etiquette pop-up, checkpoint markers and location-card popup.
6. **Bottom floating actions:** recommended route pill on default screen; route details/back control when selected; `List` control near lower-right to view pins/itinerary in a bottom sheet.
7. **Persistent bottom navigation:** Home, **Map (selected by default)**, Rewards, Missions, Settings. Icon + text, active purple underline/background; respect iOS safe area.

**Important:** Do **not** render the uploaded screenshot as the map itself. It must be a functional map with real geographic pan/zoom. Use overlays and styling to recreate the atmosphere. Avoid hardcoded image-sized coordinates for live locations.

### 4.4 Map interaction states

- `map/default`: fox, several thematic route previews, top controls, intro callout and recommendation card.
- `map/searching`: category suggestions, prompt input, selected tags, empty-state guidance.
- `map/results`: 2–3 curated route suggestions with theme, approximate duration/distance, 1–2 sample attractions, sample coin potential.
- `map/route-selected`: emphasize one route; de-emphasize others; route title and duration; checkpoint markers and quest; `Start Route`, `See Stops`, and `Back to Routes` interactions.
- `map/route-active`: highlight next checkpoint, route progress, fox position, instructions/cultural tips.
- `map/place-selected`: map remains behind a photo/detail card: name, tags, image if supplied/licensed, approximate distance/time, short story, relevant checkpoint action.
- `map/check-in-success`: stamp/coin animation, updated balance/progress, short celebration from the fox.
- `map/reward-unlocked`: celebratory coupon modal with a clear “Demo reward” label.
- `map/location-unavailable`: gentle permission/accuracy explanation and `Try GPS Again` / `Explore Kyoto in Demo Mode` actions.

Use a bottom sheet or compact modal rather than full-page navigation for most location details, to maintain the map-first feel. Provide close/back controls on every overlay.

## 5. Five complete tabs

### 5.1 Home

**Purpose:** friendly entry and overview, not the primary surface.

- Personalized greeting (“Welcome to Kyoto, {nickname}!”) and fox illustration/placeholder.
- Prominent **Explore Kyoto** CTA opens Map.
- Today's featured route; sample walking discovery and local shop/story cards.
- Progress summary: stamps collected, demo coins, route/missions progress.
- “Why walk?” short resident-centered explanation, avoiding unproven impact claims.
- State for first-run vs returning user.

### 5.2 Map (primary)

Implement §4 in full. Map is the default tab immediately after onboarding and whenever returning to the main exploration experience. The route selection, map interactions, GPS recentering, list/map toggle, and checkpoint overlays must work within the prototype.

### 5.3 Rewards

- Demo coin wallet: current balance and reward progress to next coupon.
- Example reward catalog, with clear tags **Demo / Not redeemable**.
- Coin cost, illustrative partner category, locked/unlocked/redeemed-demo states.
- Tap eligible reward to simulate claiming; subtract coins exactly once; add to demo reward history.
- Congestion-based bonus explainer: high simulated congestion offers an illustrative higher reward for choosing to walk.
- No real barcode/QR acceptance, cash value, transferability, or claims of actual Kyoto merchant participation.

### 5.4 Missions

- Active quests, available quests, completed quests.
- Quest cards: title, story, route association, checkpoint count, coin reward, progress ring/stamps.
- Stamp collection grid with illustrated stamps/temporary placeholders.
- `View on Map` to focus the relevant route/checkpoint.
- Completion triggers a short fox celebration and one-time bonus.
- Suggested sample quests (**editable content, not source-mandated**): `Kyoto Culture Walk`, `Local Café Discoveries`, `Hidden Gems Trail`.

### 5.5 Settings

- Nickname/profile edit; no real email/password login.
- English ↔ Japanese language toggle (all essential UI, route content, badges, and demo notices translated).
- GPS permission/status, `Recenter`, and explicit **Kyoto Demo Mode** toggle.
- Reduced motion, optional sound (default off), and reset-demo-data option with confirmation.
- About: purpose, simulated-data disclosure, credits/map attribution, privacy statement, PWA installation help.

## 6. First-time entry and navigation

### Welcome screen (simulated account)

1. Show app name, mascot placeholder, a short pitch, and two choices: **English / 日本語**.
2. Ask for a **nickname** (optional but encouraged); one-button “Start Exploring.”
3. Save nickname and language locally on device; **do not call it verified registration or create a fake email account**.
4. Open the Map tab. Provide a just-in-time location request (`Use My Location`) and a clearly labeled `Explore Kyoto Demo` alternative.
5. On subsequent opens, skip onboarding unless data was reset; return to Map, preserving progress and language.

### Persistent navigation rules

- The bottom bar always contains five tabs in this order: **Home · Map · Rewards · Missions · Settings**.
- `Map` is center-ish/second slot in the reference, **not** literally the middle item. Follow the reference order rather than rearranging to position it in the third slot.
- Switching tabs preserves active route, demo coins, selected language and quest progress.
- All clickable elements must respond; avoid decorative buttons that appear actionable but do nothing.

## 7. Map, GPS, and Kyoto demo behavior

### Production-like GPS (real functionality in this otherwise visual-first build)

- On an explicit location action, use the browser Geolocation API (`watchPosition` while the map session is active, or `getCurrentPosition` for initial fix) over **HTTPS**.
- After permission, position/recenter fox at actual latitude/longitude. Update accurately but smoothly, without jittery screen movements.
- Indicate whether location is live or simulated. Display accuracy/permission issues rather than silently fabricating a location.
- When a user is outside the curated Kyoto demonstration area, **do not teleport them** or pretend local Kyoto routes start at their real coordinates. Offer a clear **Switch to Kyoto Demo** CTA.
- If location is denied/unavailable/inaccurate, map remains usable in Kyoto Demo Mode; user can retry GPS later.
- Do not require continuous background tracking: browser PWAs generally cannot reliably do that, especially on iOS.
- Do not store location history by default or send coordinates to an analytics server.

### Kyoto Demo Mode

- Clearly display `Demo Mode` in the map header or a small persistent chip.
- Start in central Kyoto near the **Kamo River / Gion-Shijo area** (recommended sample stage; not a GPS claim).
- `Start Demo Walk` animates the fox along the selected route, advances checkpoints and displays example UI states. Provide pause/continue/reset controls.
- `Simulate Check-in` appears only in demo. All earned coins and claimed rewards are visibly **virtual**.
- Support desktop demos and phone tests without requiring physical movement.
- Prefer actual mapped pedestrian streets; sample route paths must be curated or sourced from a legitimate routing provider, not drawn through buildings, rivers, private land, or prohibited routes.

### Hybrid map implementation

- Use an actual Kyoto basemap with custom styling; candidate: **MapLibre GL JS** with a licensed vector-tile map style/provider. Another map SDK is acceptable if it achieves the same result.
- Retain required map/data attribution and respect map-tile terms, quotas and rate limits.
- Use real lat/lon for geographic objects. Render fox, pins, route dots and warning overlays as proper map layers/markers.
- Decorative dotted route appearance can be custom, but movement/path geometry must still correspond to walkable public ways if presented as a real route.
- If an exact walking duration/distance is not verified, label it `Demo estimate` rather than asserting it is precise.
- Do not build an independent custom map illustration that cannot pan/zoom or line up with GPS.

## 8. Route discovery and recommendation logic

### Entry points

- Tap category chips or a recommended-route card.
- Search a destination by name.
- Enter a natural-language preference prompt, e.g., “A quiet 30-minute culture walk with cafés.”
- Optional preferences: time budget, walking vs. bike/scooter **discovery** mode, historical/scenic/local themes, luggage-friendly, seasonal.

### Baseline algorithm (NO paid AI service required)

1. Load a small set of **curated, validated Kyoto route fixtures** and places.
2. Parse/category-match prompt terms and category chips (English/Japanese synonyms).
3. Score routes by preference match, duration, location proximity (in Kyoto demo), safety/area suitability, and sample congestion bonus.
4. Show 2–3 alternatives with transparent reason tags like `Cultural stops`, `Less bus-dependent`, `Local shop nearby`.
5. Clicking a route focuses map, shows route details/checkpoints and allows `Start Route`.
6. If no match: show reasonable alternate curated routes, not hallucinated path geometry.

**AI integration policy:** The team envisions AI-personalized recommendations. For this visual-first baseline, personalization may be deterministic behind a `RouteRecommendationService` abstraction. Mark search as `Personalized route preview`, **not** “live AI-generated” unless a real model is connected. Later, an AI model can suggest *which validated stops/routes to use*; actual paths should come from routing data or validated fixtures, not hallucinated coordinates.

### Example route catalog (illustrative categories, NOT verified routing data)

- **Culture Route:** shrines/temples and historical sites.
- **Cafés & Local Shops:** local shops, food culture and relevant streets.
- **Hidden Gems:** locally appropriate, quieter public locations.
- Optional **Nature / Riverside**, **Luggage-friendly Walk** and seasonal routes.

Use verified map coordinates for every place before release. Do **not** copy the reference screenshot's labels (e.g., gallery/shop names) into the app as factual listings without checking that they exist. Do not combine geographically distant destinations into a purported 30-minute walking loop.

### Resident-first guardrails

- Route fixtures may include `residentApproved` / `communityInputStatus` metadata, but don't falsely label locations as community-approved before consultation.
- Respect public access, closing hours if provided, and pedestrian/bike restrictions.
- Add non-intrusive etiquette hints: keep voices down in residential streets; carry trash; respect private property; cycle/park legally.
- Suggesting a less busy route must not equate to directing users into previously unaffected residential streets.

## 9. Checkpoints, missions, and reward mechanics

### Check-in rules

- A selected route must be active to count its checkpoints toward that route's mission.
- **Real mode:** permit checkpoint check-in when user position is within a configurable radius (**recommended default 75 m**) and reported GPS accuracy is sufficiently reliable (**recommended default ≤50 m**). The action can require tapping `Check in` rather than automatically awarding on a single noisy GPS reading.
- **Demo mode:** show `Simulate Check-in`, or automatically advance through sample checkpoints during `Demo Walk`. Clearly label simulation.
- Each checkpoint grants its stamp/coins **once per route completion instance**. Never double-award from rerenders, repeated GPS events, or rapid tapping.
- Disallow fake live-location check-ins when GPS is denied; offer demo instead.
- If a checkpoint is unsuitable for physical access, do not ask user to trespass or approach unsafe/private property.

### Suggested demo economy (CONFIGURABLE; NOT APPROVED PROJECT POLICY)

| Action | Sample points |
|---|---:|
| Complete a checkpoint | +10 demo coins |
| Complete all checkpoints on a route | +30 demo coins |
| Simulated peak-congestion walking bonus | +50% on eligible base award |
| Unlock an example coupon | 100 demo coins required |

- These values exist only to show the experience; define them centrally in `config/game.ts`.
- Congestion multiplier is a **demo scenario toggle**, not an inference from actual Kyoto City transport data. Include clear text such as `Illustrative congestion bonus (+50%)`.
- For readability, the top reward bar displays `current progress / next example coupon cost`.
- Spend/demo-claim transaction should be atomic in app state and saved locally; duplicate clicks must not issue duplicate rewards.
- Use **coins / coupon credits** in the prototype, **not** legal tender or an asserted Kyoto-issued currency.

### Mission model

- One mission contains ordered or unordered checkpoints, its own progress, reward value, status (`available`, `active`, `completed`) and explanatory text.
- On completion: play short skippable celebration, add route-completion bonus once, update stamp book and Home dashboard.
- Include at least three missions with distinct theme and pin style so the Missions screen is meaningful.

## 10. Localization

- All navigation labels, onboarding, search placeholder, route cards, sample POI descriptions, mission text, permission explanations, `Demo` tags, rewards, settings, and warnings must be available in **English and Japanese**.
- Use a straightforward dictionary/localization structure (`locales/en.json`, `locales/ja.json`) and persistent language preference.
- Do not ship a language toggle that changes only a handful of labels.
- Avoid hardcoding English strings within reusable UI components.
- Format distances in metres/kilometres; use locale-appropriate dates where relevant.
- Correctness, natural Japanese, and legibility on narrow screens matter more than elaborate copy.

## 11. PWA and mobile requirements

- Mobile-first viewport, tested at roughly **360px, 390px, and 430px** widths, with responsive desktop demo support.
- Installable via `manifest.webmanifest` with name **Kyoto AI Lab prototype**, short name e.g. **Kyoto Walk**, theme/background colors, and supplied app icons when available (temporary clearly marked icons until then).
- HTTPS in deployed environment; include service worker / offline shell or basic caching as supported. **Do not claim maps or GPS work offline unless tested and actually implemented.**
- The app should open in a standalone window from the home screen when supported.
- Support iPhone Safari's **Share → Add to Home Screen** and Android Chrome's install/add-to-home-screen workflow.
- Use safe-area insets so bottom navigation does not conflict with iPhone home indicator.
- Touch targets ideally >=44×44 CSS px; provide keyboard focus states and descriptive labels.
- Respect `prefers-reduced-motion` and provide a settings override.
- Map must not become obscured by full-screen modal stacks. Maintain a clear close/back path.

## 12. Implementation proposal (adjustable, not a locked platform decision)

The user's coding platform is **undecided**. Use common web technologies that work with major AI coding environments.

**Recommended lean stack:**

- **Framework:** Next.js + React + TypeScript
- **Styling:** Tailwind CSS + modular components, CSS variables for design tokens
- **Map:** MapLibre GL JS + appropriate vector-tile style/provider; or a comparable SDK if necessary
- **Icons:** one consistent icon library; replace prominent theme pins and mascot with supplied artwork later
- **Localization:** lightweight English/Japanese dictionaries
- **State:** React state/context or small state store, persisted to `localStorage` (profile, demo coins, missions, claimed demo coupons, locale, demo toggle)
- **Routing/places data:** versioned local JSON/TypeScript fixtures
- **AI:** interface abstraction only; real model call optional and deferred
- **Backend/auth:** **none required** for baseline; do not create unnecessary database/accounts
- **Hosting:** deploy to an HTTPS host suitable for PWAs (e.g. Vercel)

### Suggested project structure

```text
src/
  app/                     # pages/layout; PWA metadata if supported
  components/
    map/                   # KyotoMap, FoxMarker, DottedRoute, PlacePin, CongestionOverlay
    navigation/            # BottomNav, TopProgress, CategoryChips
    route/                 # RouteCards, RouteDetails, RouteSheet, SearchPrompt
    game/                  # MissionCard, StampGrid, CoinCounter, RewardModal
    common/                # Pill, Modal, BottomSheet, DemoBadge, PermissionNotice
  screens/                 # Home, Map, Rewards, Missions, Settings, Welcome
  data/                    # verified places, curated routes, missions, sample rewards
  config/                  # design tokens, game values, map settings
  lib/
    location/              # geolocation service + demo route movement
    recommendation/        # route scoring interface and curated recommender
    persistence/           # local storage + migrations
    i18n/                  # language dictionaries and helpers
  types/                   # shared types
public/
  assets/
    mascot/                # user-supplied fox originals later
    pins/                  # user-supplied icons later
    locations/             # permissioned photos / fallback thumbnails
  manifest.webmanifest
references/               # provided screenshots for design guidance
```

A different directory organization is acceptable if the same separation of responsibilities is maintained. Do not restructure existing code purely for style if implementation has already begun.

### Data contracts (suggested TypeScript interfaces)

```ts
type Locale = 'en' | 'ja';
type Mode = 'live' | 'demo';
type RouteCategory = 'culture' | 'cafes' | 'hidden-gems' | 'nature' | 'luggage-friendly';
type Status = 'available' | 'active' | 'completed';

type LocalizedText = { en: string; ja: string };

type GeoPoint = { lat: number; lng: number };

interface Place {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  location: GeoPoint;             // verified before release
  category: string;
  image?: string;                  // user-supplied or licensed
  accessNotes?: LocalizedText;
  publicAccessVerified?: boolean;
  communityInputStatus?: 'unreviewed' | 'reviewed';
}

interface Route {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  category: RouteCategory;
  checkpointPlaceIds: string[];
  geometry: GeoPoint[];          // validated walkable sample path
  estimatedMinutes?: number;     // label demo when not measured
  estimatedMeters?: number;
  interestTags: string[];
  mode: 'walk' | 'bike-preview';
  featured?: boolean;
}

interface Mission {
  id: string;
  title: LocalizedText;
  routeId: string;
  checkpointPlaceIds: string[];
  rewardCoins: number;
  status: Status;
}

interface Reward {
  id: string;
  name: LocalizedText;
  costCoins: number;
  partnerLabel: LocalizedText;
  demoOnly: true;
}

interface UserProgress {
  nickname: string;
  locale: Locale;
  mode: Mode;
  coinBalance: number;
  claimedRewardIds: string[];
  checkedInKeys: string[];         // idempotency across route/checkpoint instances
  completedMissionIds: string[];
  activeRouteId?: string;
}
```

Build a central source of truth for user progress and derived reward bar, so Home/Map/Rewards/Missions always show identical balances and mission states.

## 13. Sample data and content integrity

Create a compact fixture dataset sufficient for a convincing demo: **3 routes**, **6–12 validated public POIs**, **3 missions**, **3–5 clearly mock rewards**, and two or three **simulated congestion scenarios**. This is an implementation target, not something promised by the team doc.

- Use geographically coherent routes around a selected Kyoto demo district, initially central Kyoto/Gion-Shijo near the Kamo River.
- Examples of potentially usable, recognizable public attractions for **verification before use**: Yasaka Shrine, Kamo River, Kennin-ji and Gion-area public walking streets. These are not automatically validated fixtures.
- Avoid using photographed properties without rights/permission; placeholders are acceptable until assets provided.
- Sample coupons should say `Example café coupon — demo only`, rather than showing a real business as a participating partner without consent.
- Simulated traffic/congestion highlights should have legend and `Demo congestion data` labeling; a red line in an illustration must not be presented as a live hazard alert.
- For seasonal events, times and venue opening claims: either use verified sources or label them sample/demo.

## 14. Distinguish live, simulated, future features

| Feature | Baseline behavior | Visible disclosure |
|---|---|---|
| Map pan/zoom | **Real interactive map** | Provider attribution |
| Fox location | **Real GPS** with permission; **demo** fallback | `Live location` or `Demo Mode` |
| Search/categories | Working UI with local curated matching | `Personalized preview` if no real AI |
| Walking path | Curated/validated map geometry | `Demo route` if unverified estimate |
| Place/route popups | Interactive with curated content | Flag placeholder photos/sample descriptions |
| Missions/check-ins | Real proximity check-in when eligible, or demo trigger | `Simulate check-in` in demo |
| Coins/stamps | Interactive local app state | `Demo coins` |
| Coupons | Simulated claim and history | `Not redeemable / Demo reward` |
| Congestion | Scenario-based sample overlays | `Illustrative congestion` |
| Peak-hour bonus | Demo multiplier | `Sample bonus` |
| Route personalization | Curated keyword/filter logic | No claim of live AI |
| Actual city/transit integration | **Not implemented** | Do not imply endorsement |
| Real shop partnerships | **Not implemented** | Fictional/example coupons only |

## 15. Empty, error and accessibility states

- GPS permission denied / unsupported / stale accuracy / out-of-Kyoto.
- No matching routes / no selected route / no active mission.
- Missing photos or mascot asset: use intentional placeholders, never broken images.
- Missing tile/API key or offline map: show useful fallback message and a route list; never a blank page.
- Insufficient coins to claim a demo reward: explain how to earn more.
- Duplicate check-in: show `Already collected` rather than adding coins.
- Language change mid-flow must preserve navigation and state.
- Reduced-motion setting should disable unnecessary fox/coin animations while retaining state changes.
- Route detail pop-ups should close with X, Esc/Back when appropriate, and allow keyboard accessibility.

## 16. Build phases — execute in order

### Phase 0 — Setup and design system

- Scaffold a responsive PWA with TypeScript, linting and scripts.
- Implement design tokens, typography, common pills/cards/bottom sheets and fixed bottom navigation.
- Place reference images in `/references`; set replaceable asset paths under `/public/assets`.
- Build bilingual dictionary and locally persisted nickname onboarding.
- **Gate:** app launches on desktop and phone dimensions, all five tabs navigate, no broken UI.

### Phase 1 — Signature map screen

- Add real Kyoto basemap with pastel visual treatment and proper attribution.
- Recreate reference hierarchy (progress banner, search, filters, illustrated-looking pins, dotted routes, fox, bottom list/route card, nav bar).
- Implement GPS permission, recentering, accuracy and demo fallback.
- **Gate:** pan/zoom work, GPS location visibly moves the fox where supported, Demo Mode available everywhere; visual comparison to reference passes.

### Phase 2 — Route selection and discovery

- Curated place/route dataset (verified geographic coherence), filter chips, prompt keyword matching, route suggestions.
- Default → route-selected → place-card → list sheet → back-to-results flows.
- Overlay sample congestion with explicit demo label.
- **Gate:** at least three visibly distinct route options, no dead buttons, route geometry aligned to map.

### Phase 3 — Missions, coin rewards and five-tab coherence

- Check-in rules with duplicate guards; demo walking and simulation.
- Missions/stamps/coin state, example coupon unlock and claim history.
- Finish Home/Rewards/Missions/Settings screens with coherent design and persistence.
- **Gate:** full demo walkthrough succeeds with consistent values across all tabs; reset works.

### Phase 4 — Polish, localization, handoff

- Complete Japanese translations, responsive and accessibility testing, reduced motion.
- Add PWA manifest, install icons/standalone display, offline shell as practical.
- Add demo mode controls and sample-data disclosure; test permission/error states.
- Create basic README with how to run, deploy, replace assets, adjust fixtures and game values.
- **Gate:** one tester can explore the whole experience on phone without explanation; presentation walkthrough works on desktop as well.

## 17. Definition of done / acceptance tests

1. [ ] On first open, user can choose language, enter nickname, and reach Map without real registration.
2. [ ] Map screen contains the reference-inspired top reward progress, search, scrollable category chips, soft Kyoto basemap, fox, routes, pins, overlays, list button and five-item bottom nav.
3. [ ] Real map pans/zooms. No full-screen screenshot pretending to be an interactive map.
4. [ ] Location permission on HTTPS updates fox to real coordinates; denied/outside-Kyoto states are handled honestly.
5. [ ] Kyoto Demo Mode is always available and visibly identified.
6. [ ] Selecting a category or entering a prompt returns curated route suggestions; selecting one displays a highlighted route and stops.
7. [ ] Tapping a location opens a details card with close/back behavior and fallback when no photo exists.
8. [ ] Starting a route and completing a qualifying checkpoint awards a stamp and demo coins once.
9. [ ] A sample mission can be completed and celebrated; mission status is correct on both Map and Missions.
10. [ ] Coin balance and next coupon progress update consistently in Map header, Home and Rewards.
11. [ ] User can unlock and claim a **clearly simulated, not-redeemable** coupon; duplicate claims are prevented.
12. [ ] English/Japanese switch covers all essential surfaces, persists, and doesn't reset progression.
13. [ ] All five tabs have intentional content and working navigation.
14. [ ] Screenshot visual direction is recognizable: playful pastel Kyoto map, purple/cream/gold, fox presence, dotted routes, rounded cards and category pins; but no requirement for pixel-identical output.
15. [ ] 360px–430px smartphone layout is usable, and desktop showcase also works.
16. [ ] PWA manifest and HTTPS deployment support add-to-home-screen; exact behavior tested on target phones.
17. [ ] Every simulated element is labeled; no claim of real congestion feed, verified coupons, business partnership or municipal endorsement.
18. [ ] No blocking errors, broken images, dead buttons, or route geometry obviously cutting through inaccessible areas.
19. [ ] Local progress survives refresh; `Reset Demo` clears it with confirmation.
20. [ ] Project README explains setup, demo mode, editing seed data, map provider, replacing mascot artwork and known limitations.

## 18. Demo script for showcase (2–3 minutes)

1. Open installed PWA; choose English, enter nickname and tap `Start Exploring`.
2. If not in Kyoto, choose `Kyoto Demo Mode` and show fox on a real pastel-styled Kyoto map.
3. Tap **Cafés & Local Shops** or enter `30-minute walk with culture and small shops`.
4. View personalized options and select a route; show dotted trail, landmark pins, example congestion and resident etiquette reminder.
5. Tap a landmark; show its detail card and short local cultural story.
6. Tap `Start Demo Walk`, move the fox to a checkpoint and `Simulate Check-in`.
7. Show stamp animation, demo coin balance increasing and next-coupon progress changing.
8. Open Missions to show progress; finish route and celebrate.
9. Open Rewards and claim a **demo-only** local-shop coupon.
10. Switch to Japanese; return to Map to show the same experience localized. Briefly explain what would require city/shop partnerships to become real.

## 19. Known risks, safeguards and open questions

### Known technical limitations

- Web geolocation is permission-, device-, browser- and HTTPS-dependent. Continuous background tracking/step verification is not assumed.
- Real-time congestion, Wi-Fi crowding and dynamically funded rewards require separate technical, legal, and partner validation.
- The hybrid illustrated look may be limited by available tile styles and map SDK design flexibility.
- Google Maps saved-place importing may be constrained by platform policies/APIs; defer until investigated.
- Route quality and safety require human verification; a generative model must not invent pedestrian access.

### Open inputs (do not block baseline implementation)

- Original fox character asset files, app icon and thematic pin art (**user will supply**).
- Actual app identity/brand name if the team replaces “Kyoto AI Lab prototype.”
- Final approved auxiliary brand colors and fonts.
- Actual locally vetted route stops, photographer permissions, community consultation outcomes.
- Real reward denominations, coupon partners, subsidy model and data feeds.
- Final hosting/deployment platform and any API budgets.
- Field-tested GPS check-in radius based on Kyoto street geometry and phone accuracy.

Use proposed defaults with conspicuous configuration points until these inputs are supplied.

## 20. Strict instructions for subsequent vibe-coding prompts

**Do:**

- Implement the **map tab first**; it is the core value proposition and strongest visual reference.
- Preserve the five-tab structure and single state source for demo coins/missions.
- Keep browser interactions real (click, open, select, GPS request, map pan/zoom), even when content/data is simulated.
- Keep code modular and explain any paid service, provider key, or setup step.
- Compare actual phone viewport screenshots to `references/map-tab-reference.png` after each substantial map UI change.
- Ask for original artwork only when replacing placeholders with final branded assets.
- Ensure demo runs without the user standing in Kyoto.

**Do not:**

- Convert this into a generic itinerary planning dashboard, list-only travel site, or chatbot-only UI.
- Display the reference screenshot as a noninteractive fake map.
- Create real registration, payment system or complex backend without a specific new requirement.
- Claim dynamic live congestion, real AI, redeemable coupons, approved neighborhood guidance or official city/business support without a verified integration.
- Add social feed, friend lists, leaderboards, or user-submitted routes to the baseline scope.
- Treat *optional team brainstorming* in the linked doc as a mandatory feature request.
- Replace the user's planned original mascot art with your own permanent generated artwork.

### Starter instruction to paste into the coding agent

> Build **Kyoto AI Lab prototype** according to `docs/PROJECT_SPEC.md`. Inspect `references/map-tab-reference.png` and `references/fox-avatar-reference.png` before implementing. This is a **mobile-first visual-first PWA** with a **real pastel-styled interactive Kyoto map**, **real GPS with explicit Kyoto Demo Mode**, five fully designed tabs, curated personalized walking routes, a fox location avatar placeholder, bilingual English/Japanese UI, interactive simulated stamps/coins/coupons, and honest sample congestion indicators. Start with **Phase 0 and Phase 1 only**. Do not create a database or pretend demo features are live. Preserve the screenshots' map-first visual language while allowing functional usability improvements. Report setup commands, any map provider/API key needed, and what was implemented versus deferred.

---

**End of baseline PRD.** The document is deliberately specific enough to start coding, while leaving unapproved partnerships, final assets, scoring economics, and live-data integrations configurable and future-facing.
