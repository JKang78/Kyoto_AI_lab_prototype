# Kyoto Flow — Design System

**Status:** Implementation-ready design direction, v1.0  
**Platform:** Mobile-first Progressive Web App (PWA)  
**Companion documents:** [`PRODUCT_REQUIREMENTS.md`](./PRODUCT_REQUIREMENTS.md) · [`ENGINEERING_SPEC.md`](./ENGINEERING_SPEC.md)  
**Source basis:** Team's *Kyoto Flow — Comprehensive UI/UX & Experience Engineering Specification* (November 2026), the Prototype/UI/UX/App Reviews research, and the subsequent product critique.  
**Owner:** Product/design team; implementation details are proposed defaults, not approved government or merchant arrangements.

> **North star:** Turn a *verified, resident-considerate alternative journey* into a delightful Kyoto experience. The app should look like a crafted walking adventure while remaining an honest, accessible navigation and rewards interface.

## 1. Design principles and non-negotiable truthfulness

1. **The map is home.** Do not create a redundant dashboard. Opening the app should reveal a useful map or accessible list immediately.
2. **Experience before incentive.** Sell the story of the walk first; display the reward clearly as an additional reason to choose it.
3. **Real geography outranks illustration.** A stylized layer may decorate streets, parks, and points of interest (POIs), but it must not hide crossings, dead ends, stairs, restricted paths, or road safety information. Offer a standard cartographic map and accessible route list.
4. **Resident benefit is not a decorative badge.** Only use “resident-reviewed” or “resident-approved” when a defined human review process and consent actually support that statement. Otherwise use “curated route” or “pilot proposal.”
5. **Never fake certainty.** Do not display invented crowd readings, bus timings, shop opening hours, reward partnerships, precise arrival estimates, or confirmed transport avoidance. Always show source, observation type, and freshness for congestion data.
6. **Be useful without registration.** Let users preview routes and browse venues with no account or location permission. Ask for location only at a location-dependent action.
7. **Accessible by default.** Dynamic type, reduced motion, keyboard/screen-reader controls, color-independent status labels, and a genuine map-to-list alternative.
8. **One clear primary action at a time.** Prevent coupon, mission, and promotional UI from competing with live navigation instructions.

### Strict interface exclusions for v1

No ad-watching loops, public ratings, social feed, global leaderboards, crypto or cash-out UX, casino-style reward mechanics, fake counters, default autoplay onboarding, decorative KPI dashboards, or blocking etiquette popups. Use **Save** (heart) instead of public reviews. Do not imply location tracking continues when the PWA is backgrounded.

## 2. Brand personality and editorial voice

**Personality:** Curious, tranquil, considerate, gently playful. Kyoto should feel welcoming but not commodified. Inspiration comes from hand-drawn guidebooks, ink stamps, washi paper, quiet canals, and a small fox traveling companion—not an imitation of any existing game or protected character.

**Voice:** Short, concrete, respectful; useful to tourists unfamiliar with Kyoto. Avoid declaring neighborhoods “hidden” when they are already crowded or implying residents universally welcome extra visitors. Bilingual EN/JA content must be edited for naturalness rather than machine-translated literally.

| Context | Prefer | Avoid |
|---|---|---|
| Route recommendation | “A riverside walk with two locally featured craft stops” | “The secret route locals don't want you to know” |
| Congestion | “Busy forecast for this corridor • source and timestamp” | “Live congestion: 92%” without live data |
| Mission reward | “Complete 2 check-ins to unlock a café offer” | “Walk 2 km, guaranteed ¥150” unless independently verified |
| Safety | “Bicycles must be walked through this section” | “Shortcut through the neighborhood” |
| Eligibility | “Available while the partner's offer is active” | “Free subway ticket” without a signed transit agreement |
| Resident provenance | “Reviewed with the [named] association on [date]” | “Resident-approved” based on an internal assumption |

## 3. Visual tokens: “Kyoto Ink & Washi”

### 3.1 Color palette

Use Kyoto Purple as an action/brand accent, not as a blanket pink overlay. White/ivory carries forms and sheets; warm stone separates secondary content. Gold denotes achievement but **does not replace text** explaining a reward.

```css
:root {
  /* Surfaces */
  --surface-washi: #FAF8F4;
  --surface-ivory: #FFFFFF;
  --surface-stone: #F2EFE9;
  --surface-elevated: #FFFFFF;
  --border-subtle: rgba(28, 25, 23, 0.12);

  /* Text */
  --ink-sumi: #1C1917;
  --ink-secondary: #57534E;
  --ink-muted: #706A62; /* deliberately darker than original #8C857B */

  /* Brand */
  --kyoto-purple: #782459;
  --kyoto-purple-hover: #632047;
  --kyoto-purple-soft: #F6ECF2;
  --antique-gold: #C69C4D;
  --torii-vermilion: #C83E37;
  --river-indigo: #486B88;
  --matcha: #2F7D57;

  /* Status: always combine color + label + distinct glyph */
  --crowd-calm: #2F7D57;
  --crowd-moderate: #B56417;
  --crowd-busy: #B92C27;
  --status-information: #385F87;
  --status-error: #B92C27;
  --focus-outline: #782459;

  /* Dimensions */
  --touch-target: 44px;
  --content-max: 560px;
  --dock-height: 68px;
  --radius-control: 12px;
  --radius-card: 16px;
  --radius-sheet: 22px;
  --shadow-sheet: 0 8px 32px rgba(28, 25, 23, 0.12);
}
```

**Contrast requirements:** WCAG 2.2 AA as the minimum target (normal text ≥ 4.5:1, large text ≥ 3:1, meaningful non-text boundaries/graphics ≥ 3:1 against adjacent colors where applicable). Do not use pale gold on white for small text. The original `#8C857B` muted text on `#FAF8F4` is too faint for normal-sized captions, so use a darker accessible token. Check all status and hover variants automatically.

**Textures:** Optional fine washi-like SVG noise ≤ 2% visual intensity in noninteractive backgrounds. Turn off where contrast or performance suffers; never overlay map labels or coupon QR codes.

### 3.2 Type, hierarchy, numbers

- **Editorial titles:** `Shippori Mincho`, with tested Japanese glyph coverage; fallback to a Japanese serif and generic `serif`.
- **UI, navigation, form controls:** `Plus Jakarta Sans` for Latin scripts, `Noto Sans JP` for Japanese; system fallbacks.
- **Numeric telemetry:** `font-variant-numeric: tabular-nums;` for countdowns, fares, distances, ratios, and quotas.
- Type scale (rem): display `1.75–2.0`; screen heading `1.4`; section heading `1.1`; body `1.0`; secondary `0.875`; caption never smaller than `0.8125` unless tested for readability.
- Use line-height ≥ 1.4 for body and generous line breaking for Japanese. Avoid all-caps microcopy.
- A user's operating-system font scaling must not hide check-in controls or truncate price terms.

### 3.3 Spatial and responsive rules

- **Primary target:** 360–430 CSS px portrait phones. Test 320 px, 768 px tablet, landscape, and browser text scaling to 200%.
- Respect `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` and mobile `100dvh`/stable fallback. Bottom dock may not obscure the map attribution, safety notices, or current route instruction.
- Minimum target size 44 × 44 CSS px; 8 px separation between nearby destructive and confirm actions where possible.
- Screen-level map padding: 12–16 px; card padding: 16 px; related row gap: 8–12 px; major group gap: 20–24 px.
- Distinct radii and soft separators are fine; avoid repetitive identical “AI-generated dashboard cards.”
- On large screens, keep primary app content in a readable column; allow map to expand with a route-detail panel to the side.

## 4. Navigation architecture

**Four destinations, in this order:** **Explore** (default map) · **Missions** · **Rewards** · **Me**. Settings is a section inside Me. Do not add Home unless usability testing establishes an unmet need.

| Destination | Purpose | Persistent entry point |
|---|---|---|
| Explore | Choose or continue an appropriate route | Fox locator, Search, map/list toggle, active route summary |
| Missions | See available, active, and completed quests | Current quest and stamp-book progress |
| Rewards | Understand and redeem earned merchant offers | Available offers and claimed vouchers |
| Me | Language, preferences, saved routes, privacy, safety/help | Profile optional, Settings always accessible |

The dock has readable text labels, programmatic selected state (`aria-current="page"` or equivalent), safe-area spacing, and no critical action hidden behind gestures. During navigation, the compact next-step/follow card takes precedence and the dock remains reachable.

## 5. First-run onboarding and entry

**Constraint:** Up to three **skippable** screens; never force an account. Users arriving via a QR code with a specific route should land on that route, not be bounced through a promotional introduction.

1. **Language and mode (optional):** English/日本語; Visiting Kyoto vs Living in Kyoto. A resident option changes wording and relevant challenges, not eligibility unless confirmed server-side.
2. **Interests and constraints (optional):** History, Local Shops, Nature, Seasonal, Less-Busy Places; luggage, verified step-free, shade preference, rail + walk accepted. Do not use “Luggage-Friendly” as shorthand for step-free accessibility.
3. **Location consent in context:** Explain why foreground GPS helps; offer `Use location` and `Choose starting point`. Show how to change permission later.

If denied, the user can browse from a manually selected Kyoto starting place. The app may request account/email verification **only when necessary to persist a reward or prevent abuse**, after explaining why.

## 6. Screen specifications

### 6.1 Explore (map): primary view

**Layer 1 — Floating utility chrome**

- Search (`Where would you like to explore?`), manual starting point, travel mode: `Walk` | `Rail + Walk`. `Bike` is absent or labeled “Pilot planned” until legally and operationally validated corridors exist; never offer a clickable mode that cannot route safely.
- Filter rail: History, Local Shops, Nature, Seasonal, Quiet/Low-Crowd, Shade, Verified Step-Free, Amenities. Filters may be reset in one tap. If few routes match, show why, not an empty map.
- Map style switch: `Illustrated` / `Standard` / `List`. Maintain route selection, filters, and viewport when switching.
- Amenities overlay available **during active routing**: bathrooms, lockers, luggage services, verified drinking water or disposal facilities. Do not suggest public trash bins are plentiful; mark only verified amenities.

**Layer 2 — Map and character**

- MapLibre vector map with stable geography. Illustrated style = changed linework, palette, iconography, textures; not hand-drawn geometry that alters street topology.
- Fox avatar marker at *measured* location; heading and accuracy ring optional. If GPS is poor, show location uncertainty and do not snap the avatar falsely to a path.
- Five icon classes: shrine/temple, nature, cultural/historic, partner shop, mission/reward checkpoint; amenities can be secondary layers.
- Route polyline + start/end/stop markers; direction arrow where useful. Never route across blocked paths or restricted roads.
- Crowd labels: `Calm`, `Moderate`, `Busy`, and `Unknown`; each contains icon/text, type (`Live`, `Forecast`, `Pilot Schedule`), source, observed/updated timestamp, and stale-data treatment. No fabricated animated congestion beams.

**Layer 3 — Bottom sheet**

- `Peek` (~18%): most relevant route suggestion or resume active route; show an honest short crowd summary and campaign bonus **only if an actual offer is eligible now**.
- `Half` (~52%): max three curated route cards, optionally paginated. Each: story hook, estimated time, distance, verified accessibility, trade-off vs alternative where grounded, route-review provenance, reward terms, preview CTA.
- `Full` (~90%): ordered stops (3–5 in expanded version), local narrative, opening-hour freshness, amenities, Save, Add Stop (P1), and **Start Guided Walk** / **Open Standard Navigation**. Deep-link fallback if external map app unavailable.
- Sheet snapping is an enhancement, not a requirement: users must be able to activate a button to expand/collapse, and switch to an equivalent scrollable list.

**Navigation follow mode**

- Compact next-stop distance and route instruction; `Check in` button appears when server rules permit it and GPS measurement is sufficiently accurate. Prominent exit and pause.
- Foreground tracking indicator. If the app is backgrounded/locked, do not claim movement is being tracked. Refresh position on return.
- Safety notices take priority over celebration animations and do not obscure directions.

### 6.2 Missions

- Segments: **Available / Active / Completed**; clear expiration and reward eligibility.
- Mission types: `Alternative Journey`, `Local Discovery`, `Hands-Free Kyoto` (luggage program only after partner agreement), and `Quiet-Hour Visit` (future).
- Each card: exact behavior requested, route link, step/checkpoint progress, timeframe, offer preview, and clear statement of **what is actually verified**.
- Time-limited bonus uses a meaningful label: `Bus-relief bonus` when active during a **crowded bus period**; `Quiet-hour bonus` when moving visits outside an **attraction's** busy period. Never call the same incentive both off-peak and rush-hour without qualification.
- Digital stamp book inspired by a *goshuinchō*: themed by district/season; **do not imitate official temple goshuin or imply spiritual certification**. Label them “Kyoto Flow adventure stamps.”
- Optional celebrations: fox reaction, illustrated stamp, progress arc; not an interruptive ad or reward roulette.

### 6.3 Rewards

- Sections: **Unlocked / My Coupons / Used & Expired**. Add a transit/luggage filter only when actual partners exist.
- Each offer shows exact merchant, benefit, minimum spend, limits, eligibility, expiry **in JST**, and whether the offer is available to guests.
- Voucher look: perforated ticket inspired by Kyoto rail/stamp culture; primary redemption proof must remain high contrast and scannable.
- Redemption flow: user opens single-use token; **merchant's authenticated device/system verifies and confirms**. User-only animation or “staff tap on customer screen” is not sufficient fraud prevention. Display pending, confirmed, expired, and network-error states explicitly.
- No token/coupon should appear valid after the backend rejects it; offline cache can show its terms, never guarantee offline redemption.
- Reward activity: ledger-style human-readable explanation (`Unlocked through 2 verified stops; bonus campaign: ...`) without implying a bus journey was verified if it wasn't.

### 6.4 Me (settings, saved, help)

- English/日本語 switch with continuity of active route; display bilingual proper nouns.
- Visitor/Resident preference; interests; verified accessibility preference; shade, rail + walk.
- Saved routes/spots; optional data portability and itinerary import in P1 (KML/CSV supported only once validated).
- GPS permission explanation, privacy controls, `Delete local data`, account deletion if accounts exist, and contact/report issue form.
- Safety/help: official emergency information links and simple bilingual guidance; **do not imply a shelter is currently safe/open without verified source**.
- Demo/simulated movement UI must exist **only** in a clearly labeled, isolated development/preview environment; never as a way to earn real vouchers.

## 7. Fox mascot and micro-interactions

The fox is a small companion, not a full-blown character progression system. It wears a restrained vermilion scarf/accessory and a cream-and-gold marker ring. Create original artwork; do not copy Pokémon, Orna, or copyrighted fox mascots.

| State | Trigger | Visual behavior | Accessible equivalent |
|---|---|---|---|
| `idle` | Map visible, no active movement | Calm pose/blink | `Your location` marker text |
| `walking` | Valid foreground movement in follow mode | Gentle stride/bob | Progress text updates |
| `arrived` | Accepted arrival near eligible checkpoint | Ears perk; small lantern/scroll | “Checkpoint available” status |
| `reward` | Server confirms mission/reward | Brief jump and ink-stamp effect | Live region: “Coupon unlocked” |
| `warning` | Contextual etiquette advisory | Polite bow/shush | Readable nonblocking text |

**Animation defaults:** 120–250 ms for basic controls, ~300–450 ms for deliberate sheet movement, ≤ 800 ms for a reward sequence. These are design starting values, not mandates. Test on low-end Android. Respect `prefers-reduced-motion: reduce` and allow instant completion of celebratory UI. `navigator.vibrate()` is optional and unavailable on some platforms; never make feedback depend on it.

## 8. Reusable components and contracts

| Component | Essential states | Responsibilities |
|---|---|---|
| `AppDock` | selected, disabled route overlay | Navigation, screen-reader labels, safe areas |
| `MapCanvas` | loading, ready, denied GPS, offline, error | Correct cartography, POI layers, attribution |
| `MapModeSwitcher` | illustrated, standard, list | Equivalence of route data across views |
| `FoxAvatar` | five states, low-accuracy | Visual identity, no misleading position |
| `CrowdIndicator` | calm, moderate, busy, unknown, stale | Status + data type/source/time |
| `RouteCard` | default, selected, unavailable | Story, trade-offs, verified accessibility, reward eligibility |
| `RouteDetailSheet` | peek, half, full | Route detail without obscuring map/controls |
| `CheckpointAction` | far, nearby, checking, passed, rejected | Accessible check-in with useful feedback |
| `MissionCard` | available, active, complete, expired | Terms, progress, navigate to route |
| `StampBook` | locked, earned | Optional motivational record, no sacred implication |
| `CouponTicket` | locked, available, pending, redeemed, expired | Exact terms, safe redemption interface |
| `MerchantRedeemView` | scanning, confirmed, rejected | Authenticated merchant verification, bilingual |
| `EtiquetteToast` | shown, dismissed, suppressed | Nonblocking advisory, once per zone/day cap |
| `ErrorAndOfflineState` | offline, stale, retrying | Preserve user trust and route access |
| `LanguageSwitcher` | EN, JA | Runtime change without route reset |

## 9. Content and information density

- Default map: no more than three suggested route cards at once. Use “See more” to browse additional approved candidates.
- Show duration and distance as estimates, not guarantees. Display the calculation/source when decision-relevant.
- Never show an offer from an uncontracted business as redeemable. Use explicit `DEMO` labels on prototypes and screenshots.
- Likes/Saves are private user actions in v1; no public like counts unless seeded from real, audited data.
- Cultural stories require a source and editorial review; avoid fabricated historical claims.
- Route review badges require stored reviewer identity/organization, review date, approved geometry/version, and expiry/review schedule.
- Source/terms labels stay visible on promotion and are reachable by keyboard/screen reader.

## 10. Accessibility and quality gate

Required for signoff:

- All functionality possible without drag gestures, and route/list browseable without GPS.
- Keyboard operation and visible focus; semantic labels for icons, pin filters, sheets, QR redemption and dismiss controls.
- Screen reader speaks ordered stop list and next-step instruction; map controls have list equivalents.
- Color not sole signal; accessible contrast for all normal text and essential iconography.
- Touch targets, screen zoom, large text, reduced motion, lower bandwidth, and orientation changes tested.
- No unsafe routing represented by an attractive cartoon; standard-map handoff always visible.
- `Loading`, `Empty`, `Denied Permission`, `Stale Data`, `Offline`, `Invalid Reward`, `Expired Offer`, and `Merchant Network Error` designed for every applicable screen.
- English and Japanese labels, overflow, cultural tone, dates, and currency formatting tested with native/proficient reviewers.

## 11. Sample screen copy (illustrative, not live offers)

> **Explore Kyoto differently**  
> A calm canal walk with two featured local craft stops.  
> **25 min estimated · 1.7 km · route conditions to verify**  
> **Demo reward:** A café coupon after two checkpoints.  
> *Busy bus period: modeled pilot schedule, not live telemetry.*

> **Checkpoint reached**  
> You are near the next stop. Verify your visit to continue.  
> *This confirms a location visit, not the transport mode you used.*

> **Offer ready**  
> Show this voucher to participating staff. Redemption requires an online verification.  
> *Demo voucher — not valid at a real store.*

## 12. Design delivery and review process

For each screen/component: provide mobile and desktop frames, interaction state matrix, EN/JA copy, accessibility labels, design token mapping, empty/error screens, and a short acceptance checklist. Review implementation on **actual iOS Safari and Android Chrome** before calling the design complete.

### Priority order

- **P0:** Four-tab shell, standard/illustrated/list map modes, accessible route cards, first-run guest entry, 3 fox states, mission/checkpoint UI, demo coupon flow, route/crowd source labels, EN/JA, all critical error states.
- **P1:** Two additional fox states, stamp book, richer filters, saved itinerary import, sponsor branding, verified amenity overlays, richer merchant UI.
- **P2:** Full pixel-world embellishments, character customization, advanced animations, community feeds (only if justified), cycling/e-bike integration once safe routing and operator agreements exist.

---

**Cross-document contract:** This file controls *how the product looks and behaves*. [`PRODUCT_REQUIREMENTS.md`](./PRODUCT_REQUIREMENTS.md) controls *what must be true*. [`ENGINEERING_SPEC.md`](./ENGINEERING_SPEC.md) controls *how correctness and security are implemented*. When they differ, the stricter factual, safety, accessibility, or reward-security requirement wins.
