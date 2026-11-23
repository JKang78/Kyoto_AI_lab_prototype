# Kyoto Flow — Comprehensive UI/UX & Experience Engineering Specification
**Target Consumer:** Autonomous Coding Agent / Frontend Engineer  
**Target Platform:** Mobile-First Progressive Web App (PWA) — 2026 Production Standard  
**Core Pitch:** *"The only app that picks your route, pays you for taking the off-peak version, and lets residents shape where you walk."*

---

## 1. Non-Negotiable Product Truths (Read Before Writing Any Code)

Before generating a single component, internalize these six evidence-backed constraints from Kyoto's 2025–2026 field pilots. Violating any of these breaks the product's credibility:

1. **No Fake Step-Counting Rewards (PWA Reality):** Web apps cannot access Apple HealthKit, Android Health Connect, or reliable background iOS GPS. All rewards and mission completions **must** be triggered by **foreground geofenced check-ins (50–80m radius), route completion, and partner QR scans**—never passive step counts. Show estimated steps/distance as helpful metadata only.
2. **Make the Time-Window Incentive Unmistakable (Lesson from Kyoto 2025 Pilot):** Kyoto's 2025 *Kyo-Suma* pilot tested time-varying points and saw weak behavior change because users barely noticed the multiplier. Therefore, the active bonus window (e.g., `2x Off-Peak Bonus • Until 10:00`) must be **visually unmissable** on the Map peek sheet, on every route card, and inside the earnings breakdown (explicitly showing what the user earned vs. standard peak rate).
3. **Lead with Cultural Experience, Seal with the Coupon (Lesson from CopenPay):** CopenPay's 2026 survey showed 48% of participants were motivated by a meaningful local experience vs. 23% by the perk alone. Never design this like a cheap coupon-clipper or ad-grind app. Lead every route card with *why the walk is special* (resident-approved quiet alley, hidden stone monument, riverside shade), and let the local coupon seal the decision.
4. **Local Merchant Coupons Over Fake Currency (Legal & Kyoto Reality):** Official *Kyoto Points* are resident-only (My Number card required) and transferable stored-value coins trigger Japan's Payment Services Act. Frame rewards as **direct, single-use local merchant vouchers & transit perks** (e.g., `¥150 off artisan matcha`, `Free Fushimi sake-soap sento kit`, `Subway transfer ticket`) backed by transparent quest progress—never crypto, gacha, or cash-out claims.
5. **Geographical & Data Honesty:** The map must look like a warm, crafted Kyoto illustration, **never** a misleading cartoon that hides real street crossings. Always include an `Illustrated / Standard` map style toggle, a `Map / List` accessibility switch, and explicit provenance labels on crowd data (`Forecast • Kyoto Smart Navi` or `Pilot Schedule • Peak Corridor`)—never fabricate fake "live" road telemetry.
6. **Zero-Friction Guest Entry:** 70.9% of Kyoto visitors are short-stay/day-trippers who suffer from app-download fatigue. The PWA must launch directly into usable exploration via QR code with **no forced login** and a **3-screen max, skippable** onboarding.

---

## 2. The "Anti-Vibe-Code" Design System & Strict Agent Bans

Most AI-generated UIs look generic: `#F3F4F6` gray backgrounds, repetitive white cards, `rounded-2xl` everywhere, generic Lucide icons, and redundant dashboard grids. This app must feel **tactile, editorial, fluid, and unmistakably Kyoto in 2026**—elaborate and full of character, yet effortless for a jet-lagged traveler.

### 2.1 Color & Material Tokens ("Kyoto Ink & Washi")
Use Kyoto Purple (`#782459`) strictly as a **high-contrast primary action and brand ink**—do *not* wash the whole screen in pink/beige tints (keep the palette balanced and gender-neutral).

```css
:root {
  /* Surfaces */
  --bg-washi: #FAF8F4;          /* Primary canvas; apply subtle 2% SVG fractal noise grain */
  --bg-ivory: #FFFFFF;          /* Elevated sheets & cards */
  --bg-stone: #F2EFE9;          /* Recessed pills, inactive chips, segmented tracks */
  --border-hairline: rgba(28, 25, 23, 0.09);

  /* Ink & Typography */
  --ink-sumi: #1C1917;          /* Primary text & headings */
  --ink-slate: #57534E;         /* Secondary metadata */
  --ink-muted: #8C857B;         /* Captions, timestamps, provenance */

  /* Brand & Character Accents */
  --kyoto-purple: #782459;      /* Primary CTAs, active nav, active route polyline */
  --kyoto-purple-soft: #F6ECF2; /* Subtle active chip tint */
  --antique-gold: #C69C4D;      /* Reward progress, bonus multiplier, fox frame */
  --torii-vermilion: #C83E37;   /* Fox scarf/accent, goshuin stamp ink, high-crowd alert */

  /* Color-Blind Safe Congestion Trio (ALWAYS pair with icon + text label) */
  --crowd-calm: #2F7D57;        /* Muted Matcha Green */
  --crowd-moderate: #D9822B;    /* Persimmon Amber */
  --crowd-busy: #C83E37;        /* Torii Vermilion */
}
```

### 2.2 Typography & Motion Physics
* **Editorial Pairing:**
  * **Display / Route & Spot Titles:** `Shippori Mincho` (supports EN + JP gracefully, brings Kyoto cultural gravitas).
  * **UI Chrome & Telemetry:** `Plus Jakarta Sans` (EN) + `Noto Sans JP` (JP).
  * **Tabular Numerals:** Enforce `font-variant-numeric: tabular-nums` on **all** timers, distances, multipliers, coin/point values, and countdowns so numbers never jitter.
* **Motion & Tactility:**
  * Use spring physics (`motion/react` with `stiffness: 380, damping: 32, mass: 0.9`) for bottom sheets, card expansions, and check-in stamps. Never use robotic `linear` or sluggish `ease-in-out` transitions.
  * Respect `prefers-reduced-motion` globally.
  * Fire subtle haptics (`navigator.vibrate?.(12)`) on check-in stamp slams, mode toggles, and coupon redemptions.

### 2.3 The Kyoto Fox Mascot (5-State System)
The Fox (wearing a subtle vermilion red accessory, framed in a circular cream-and-gold ring) is the soul of the app—carrying warmth without turning the interface into a cluttered RPG. Implement a reusable `<FoxAvatar state={...} />` component with **5 distinct states**:
1. `idle` — Calm, alert posture (map marker when stationary).
2. `walking` — Subtle lively bob/stride animation when active route follow-mode is running.
3. `arrived` — Ears perked, holding a small lantern/scroll when within a 50–80m checkpoint geofence.
4. `reward` — Celebratory jump/smile with subtle gold sparkle on check-in or coupon unlock.
5. `warning` — Gentle, polite bowing/shushing posture for etiquette nudges (makes reminders feel kind, never scolding).

### 2.4 Explicit Agent Bans (Zero Tolerance)
* **NO redundant "Home" dashboard tab.** A Home screen that repeats your map, your active quest, and 3 stat cards is the #1 hallmark of a vibe-coded prototype. **The Map IS the Home screen**, with the crowd snapshot and bonus window integrated cleanly into its floating chrome and Peek Bottom Sheet.
* **NO 3-column KPI stat grids** (`[Steps] [Calories] [CO2 Saved]`) slapped onto headers.
* **NO raw emojis as UI icons.** Use thin-stroke custom SVGs (`1.5px` stroke) for chrome and bespoke illustrated SVG badges for map pins.
* **NO blocking modals for etiquette tips.** Etiquette notices must be non-blocking, geofenced floating toasts that auto-dismiss (max once per zone per day).
* **NO public star-rating/review forms, friend feeds, global leaderboards, or ad-watching loops.** Use a simple tactile Heart/Save toggle only.
* **NO manual "claim your steps before midnight" grind.** Check-ins and mission completions auto-credit or use a single satisfying tap.

---

## 3. Technical Stack & State Architecture

* **Framework:** Next.js (App Router) or Vite + React 19, TypeScript strict mode, Tailwind CSS v4.
* **Mapping:** `maplibre-gl` (`100dvh`, `viewport-fit=cover`) with a custom illustrated vector style (warm parchment roads, matcha parks, indigo Kamo River, stripped commercial clutter, subtle 3D buildings at `zoom > 15`). Include a 1-tap toggle to a clean Standard cartographic style and a full List View fallback.
* **Bottom Sheet:** `vaul` or `@use-gesture/react` supporting smooth 3-snap-point dragging (`18% Peek` / `52% Half` / `90% Full`) with proper scroll handoff.
* **State Management:** `zustand` with `persist` (localStorage/IndexedDB) so **search query, active filters, selected transport mode, language (EN/JA), and active mission state never reset** when switching tabs or opening route details.
* **i18n:** Full EN/JA parity (`next-intl` or `i18next`). Keep Japanese proper nouns alongside English titles (e.g., `Fushimi Sake District · 伏見酒蔵`) so users can match real street signs.
* **GPS Smoothing:** Run incoming `navigator.geolocation.watchPosition` through a lightweight 1D Kalman filter (to tame multipath jitter in narrow Kyoto *machiya* alleys) and provide a **Demo / Simulated Walk Mode** toggle in Settings so reviewers can test geofence check-ins indoors.

---

## 4. Pre-Tab Flow: Zero-Friction Onboarding (< 60 Seconds)

Triggered only on first visit (or via `?reset=1`). **Max 3 screens, skippable at any time, no account creation.**
1. **Screen 1 — Language & Mode:** Instant `English` / `日本語` toggle at top. One-line value prop with Fox illustration. Two tactile selection cards: `Visiting Kyoto` (Tourist) vs. `Living in Kyoto` (Resident).
2. **Screen 2 — Mobility & Interests:** Quick multi-select chips:
   * *Vibe:* `History & Stone Monuments`, `Local Shops & Cafés`, `Quiet Nature`, `Hidden Gems`, `Seasonal`.
   * *Constraints:* `With Luggage (Step-Free)`, `Prefer Shade`, `Rail + Walk OK`.
3. **Screen 3 — Contextual Entry:** Explains *why* location helps ("See nearby quiet routes and unlock check-ins") with two buttons: `Enable Location & Explore` and `Pick a Station Manually` (e.g., Kyoto Station, Gion-Shijo, Kawaramachi).

---

## 5. Tab-by-Tab UI & Interaction Blueprint (4-Tab Floating Dock)

Render a **floating frosted-glass bottom dock** (`backdrop-filter: blur(18px)`, `bg-[#FAF8F4]/90`, `1px solid var(--border-hairline)`, safe-area bottom padding) with 4 crisp destinations:

`[ 1. Explore (Map) *Default* ]` · `[ 2. Missions ]` · `[ 3. Rewards ]` · `[ 4. Me ]`

---

### Tab 1: Explore (Map) — *Default Landing View*

The spatial heart of the app. Must remain fluid at 60fps and never force users into a separate tab just to toggle amenities while navigating.

#### A. Top Floating Chrome (`pointer-events-none` container, `pointer-events-auto` children)
1. **Unified Search & Mode Bar:**
   * Search pill (`"Where to? e.g. Kiyomizu, Fushimi..."`) with right-aligned **Mode Pill**: `Walk` | `Rail + Walk` *(Show `Bike / LUUP` with a subtle "Pilot Soon" or validated-corridor lock badge so users aren't routed onto bike-banned main streets).*
   * Right-edge **Map Style / List Toggle** button (switches between `Illustrated Map`, `Standard Map`, and `Accessible List View`).
2. **Persistent Horizontal Filter Rail (Snap-Scrolling):**
   * *Themes:* `Hidden Gems`, `History`, `Local Shops`, `Luggage-Friendly`, `Shady`.
   * *Amenities Toggle Chip (Crucial Fix from Kyoto Kankou Map):* Expanding/toggling `Amenities` overlays **Restrooms, Public Trash Bins, Coin Lockers, and Baggage Delivery** directly on top of the active route without leaving navigation.

#### B. Live Map Canvas & Layers
* **Fox Live-Location Marker:** Circular cream-and-gold ring (`44px`) with directional heading cone and subtle GPS accuracy halo.
* **5 Color-Coded Custom SVG Pin Classes:**
  1. Shrines & Temples (Vermilion/Gold torii glyph)
  2. Nature & Parks (Matcha leaf glyph)
  3. Cultural & Historical Landmarks / *Ishibumi* (Indigo scroll glyph)
  4. Independent Cafés & Local Shops (Warm terracotta cup/lantern glyph)
  5. Special Coupon / Check-in Bonus Zones (Pulsing Antique Gold star/ticket glyph)
* **Congestion Overlay (Source-Labeled & Color-Blind Safe):**
  * Glowing semi-transparent road bands along busy bus corridors (e.g., Bus 205/206/207 corridors) using the 3-level trio (`Calm` / `Moderate` / `Busy`).
  * Tapping the small floating **Legend Pill** (`Crowd Info`) opens a compact popover showing the 3 levels (color + icon + text) and exact provenance (`Forecast • Kyoto Smart Navi / Pilot Schedule • Updated 08:30`).

#### C. Draggable 3-State Bottom Sheet
* **State 1 — Peek (`18%` height):**
  * **Unmistakable Off-Peak Multiplier Banner:** High-contrast Kyoto Purple (`#782459`) or Antique Gold bar: `⚡ 2.0x Off-Peak Bonus Active (Until 10:00) — Avoid Bus 206 Rush`.
  * Compact **Crowd Snapshot Strip:** `Busy: Higashiyama Bus` · `Calm: Kamo Riverside & Fushimi`.
  * Primary CTA or Active Route Resume bar.
* **State 2 — Half (`52%` height — Route Comparison Carousel):**
  * Displays **max 3 curated route cards** (never overwhelming) with horizontal snap scrolling.
  * Each card contains:
    * **Header:** Route Title (in *Shippori Mincho*) + `Resident-Approved` badge (when applicable).
    * **The Hook ("Why this route?"):** 1 crisp editorial sentence (e.g., *"Follows the quiet Takasegawa canal past 3 family-run craft shops; skips the 206 bus queue."*).
    * **Honest Metadata Row (Tabular Nums):** `24 min walk` · `1.8 km` · `Flat / Luggage OK` · `Avoids Busy Corridor`.
    * **Visible Reward Comparison:** `Earn ¥150 Matcha Coupon (2x Off-Peak)` with subtle strikethrough of standard peak reward so the time incentive is unmistakable.
    * **Action:** `Preview Route` button.
* **State 3 — Full (`90%` height — Route Detail & Active Follow Mode):**
  * Ordered vertical timeline of **3–5 vetted stops** with bilingual names, opening hours, short cultural story, amenity badges (`Toilet`, `Card OK / Cash Only`), a tactile **Heart/Save** button with count, and a **`+` Add Stop** action.
  * Trade-off transparency callout (e.g., *"6 min longer than bus, but 0 min wait and shaded"*).
  * Sticky Footer: `Start Guided Walk` (enters **Follow Mode**) + secondary `Open in Google Maps` safety handoff.
* **Active Follow Mode (Replaces Sheet when Walking):**
  * Compact bottom card showing: Next Stop name, distance remaining (`180m`), a **1-tap `Check In` button** (activates with pulsing gold border when within `80m`, or opens lightweight QR scanner for partner shops), and a `Pause / Exit` button.
  * **Check-In Celebration:** Triggers `<FoxAvatar state="reward" />`, haptic tap, vermilion stamp animation, and a transparent **"Why you earned this"** receipt (`Base Route + 2.0x Off-Peak Window`).

#### D. Non-Blocking Geofenced Etiquette Toast
* Floats cleanly above the bottom sheet (never blocks the map).
* Displays `<FoxAvatar state="warning" />` + concise bilingual reminder (e.g., *"Quiet residential lane ahead — please keep voices low and hold onto trash."*). Auto-dismisses after 6 seconds and triggers at most once per zone per day.

---

### Tab 2: Missions (Quests & Digital *Goshuin*)

Replaces boring step-count lists with spatially anchored, culturally rewarding missions.

* **Top Module — Live Surge Window Card:**
  * Shows current multiplier (`2.0x Active` vs. `1.0x Standard`), a live countdown bar to the next window shift, and a quick explanation of *why* walking now helps Kyoto residents.
* **Segmented Control:** `Available` | `Active` | `Completed`
* **Spatial Mission Cards (Max 3–4 visible at once):**
  * Anchored to real corridors and behaviors:
    1. *Corridor Buster:* "Take the canal walk or Keihan rail instead of Bus 205/206 before 10:00 AM."
    2. *Local Discovery:* "Check in at 2 resident-recommended craft spots in Shimogyo."
    3. *Hands-Free Kyoto:* "Store luggage at Kyoto Station or take a flat luggage-friendly route."
  * Each card shows: clear visual progress bar (inspired by Macadam's next-reward arc), explicit reward preview, and a 1-tap **`View on Map`** button that jumps directly to Tab 1 with the route plotted.
* **Digital *Goshuin* (Stamp Rally) Book:**
  * Styled like a tactile Japanese accordion stamp book (*goshuincho*) with subtle washi paper texture.
  * Grouped by **Ward** (Fushimi, Higashiyama, Shimogyo) or **Season** (Sakura, Autumn Leaves).
  * Uncollected stamps show a delicate ghosted ink outline; collected stamps display a crisp **Torii Vermilion ink seal** with date and location name.

---

### Tab 3: Rewards (Wallet & Zero-Friction Redemption)

Modeled on Apple Wallet + CopenPay's shopkeeper-friendly flow. Value must be transparent at a glance.

* **Top Summary — Next Reward Progress Arc:**
  * Displays current Quest Progress / Points with plain-language framing (e.g., *"1 more check-in to unlock: Free Subway Transfer Ticket"*), avoiding ambiguous "coins with no cash value."
* **Segmented Filter:** `Available` | `My Coupons (N)` | `Transit & Luggage`
  * *Transit & Luggage* highlights high-impact bus-relief perks (Subway single-ride voucher, Station baggage delivery discount, LUUP unlock credit).
* **Tactile Perforated Ticket Cards:**
  * Styled like physical Japanese tickets with subtle left/right semicircular notch cutouts (`radial-gradient` masks), merchant name in **EN + JA**, exact offer (`¥150 OFF Matcha Latte`), distance from user, validity hours, remaining quota, and clear terms (`Min. spend ¥500 • 1 per visit`).
* **Anti-Screenshot Bilingual Redemption Modal (Staff-Friendly):**
  * Tapping **`Redeem at Store`** opens a high-contrast, full-brightness modal designed so a small Kyoto shopkeeper with no POS integration can verify it in 3 seconds:
    1. Large **Japanese & English** offer header (`抹茶ラテ 150円引き` / `¥150 OFF Matcha Latte`).
    2. Unique single-use QR / 6-digit code.
    3. **Live Animated Anti-Screenshot Background:** A continuously moving subtle wave/shimmer + real-time ticking **5:00 countdown timer** (proves it's not a static screenshot).
    4. **`Staff: Tap to Confirm Redemption`** slide/hold button that atomically marks the coupon `Redeemed` and shows a green verified stamp.
* **Transparent Activity Log:** Shows earned rewards with exact attribution (`+2x Off-Peak Bonus • Kamo Canal Walk • 08:45`).

---

### Tab 4: Me / Settings & Accessibility

Clean, utility-first, APPI-compliant, zero bloat.

* **Instant Language Toggle (Top Card):** `English` / `日本語` (updates entire app state live without losing active route).
* **Persona & Routing Preferences:**
  * `Visitor` vs. `Kyoto Resident` switch (adjusts route copy and etiquette frequency).
  * `Luggage-Friendly / Step-Free Default` toggle (honored only on verified flat routes).
  * `Prefer Shaded Routes` (summer heat) toggle.
  * `Demo / Simulated Walk Mode` toggle (for testing check-ins and etiquette toasts off-site).
* **Saved Routes & Itinerary Import:**
  * List of Hearted/Saved spots and routes.
  * **Paste Address / Import Pins (P1):** Input box to paste a destination or upload exported Google Maps `.kml`/`.csv` pins to plot them on the map.
* **Privacy, Safety & Offline Controls:**
  * **Emergency & Evacuation Guide (P0 Basic):** One-tap access to nearest Kyoto emergency evacuation shelters and bilingual disaster info.
  * **Offline Cache:** Button to cache current active route and coupons for spotty subway/station reception.
  * **APPI Privacy Dashboard:** Plain-language disclosure of foreground-only GPS usage, retention limits, and a working **`Delete My Local Data`** button.
  * **Report a Path Issue:** Quick form to flag a blocked path, private road, or overcrowded spot (feeds the resident *machizukuri* loop).

---

## 6. Cross-Tab Edge Cases & Accessibility Checklist

Every screen must handle these states gracefully without dead ends:
* **GPS Denied / Unavailable:** Never show a broken blank map. Prompt user to pick a starting landmark (`Kyoto Station`, `Gion-Shijo`, `Karasuma`) and allow browsing/planning seamlessly.
* **Offline / Weak Signal:** Display a subtle top amber pill (`Offline — Showing cached route & coupons`). Active coupons and route stop lists must remain readable.
* **Color-Blind Safety:** Never use red/yellow/green alone for congestion; always pair with distinct icons (`● Calm`, `▲ Moderate`, `■ Busy`) and text.
* **Map-to-List Switch:** Every map view and route detail must be 100% navigable in a structured List View for screen-reader and low-mobility users.

---

## 7. Seed Data TypeScript Interfaces (For Prototype Build)

Use these exact schemas so mock data for the pilot/demo feels authentic to Kyoto rather than generic placeholders:

```typescript
export type FoxState = 'idle' | 'walking' | 'arrived' | 'reward' | 'warning';
export type CrowdLevel = 'calm' | 'moderate' | 'busy';
export type TransportMode = 'walk' | 'rail_walk' | 'bike_locked';

export interface CrowdProvenance {
  level: CrowdLevel;
  sourceLabel: string;        // e.g. "Kyoto Smart Navi Forecast" | "Pilot Schedule"
  type: 'live' | 'forecast' | 'manual';
  updatedAt: string;          // ISO timestamp or "08:30 JST"
}

export interface POI {
  id: string;
  nameEn: string;
  nameJa: string;
  category: 'shrine' | 'nature' | 'culture' | 'local_shop' | 'reward' | 'amenity';
  amenityType?: 'toilet' | 'trash' | 'locker' | 'baggage_delivery';
  coords: [number, number];   // [lng, lat]
  storyEn: string;            // Short cultural/resident narrative (experience-first)
  storyJa: string;
  hours: string;
  payment: 'cash_only' | 'card_ok' | 'free';
  etiquetteNotice?: { en: string; ja: string };
  likesCount: number;
  isResidentApproved: boolean;
}

export interface CuratedRoute {
  id: string;
  titleEn: string;
  titleJa: string;
  theme: 'history' | 'local_shops' | 'luggage_friendly' | 'scenic' | 'shaded';
  mode: TransportMode;
  whyThisRouteEn: string;     // Editorial hook explaining cultural + crowd value
  whyThisRouteJa: string;
  tradeoffNoteEn: string;     // Honest disclosure, e.g. "6 min longer than Bus 206, 0 min wait"
  durationMin: number;
  distanceKm: number;
  estimatedSteps: number;     // Metadata only, NOT a reward trigger
  isStepFreeVerified: boolean;
  isResidentApproved: boolean;
  avoidsCorridor: string;     // e.g. "Bus 206 (Higashiyama)"
  crowd: CrowdProvenance;
  baseRewardPoints: number;
  activeMultiplier: number;   // e.g. 2.0 during off-peak window
  multiplierEndsAt?: string;  // e.g. "10:00"
  stops: POI[];
  coordinates: [number, number][]; // Polyline
}

export interface Coupon {
  id: string;
  merchantNameEn: string;
  merchantNameJa: string;
  offerTitleEn: string;       // e.g. "¥150 OFF Artisan Matcha"
  offerTitleJa: string;       // e.g. "宇治抹茶ラテ 150円引き"
  category: 'cafe' | 'transit' | 'experience' | 'luggage';
  termsEn: string;
  termsJa: string;
  remainingQuota: number;
  status: 'locked' | 'available' | 'redeemed' | 'expired';
  unlockRequirementEn: string;
  earnedReason?: string;      // e.g. "2.0x Off-Peak Bonus • Kamo Canal Walk (08:45)"
  expiresAt: string;
}
```

### Recommended Prototype Vertical Slice (Build This First)
Seed **3 real Kyoto corridors** (e.g., *1. Takasegawa Canal & Craft Walk avoiding Bus 205/206*, *2. Fushimi Sake & Sento Discovery*, *3. Luggage-Friendly Flat Kamo River Path from Kyoto Station*) with **12 bilingual POIs**, **1 active 2.0x Off-Peak Bonus window**, **1 geofenced residential etiquette toast**, and **3 redeemable coupons** (1 local café, 1 Fushimi sento sake-soap perk, 1 Kyoto Subway transfer voucher) so the entire QR-to-Redemption loop works end-to-end on mobile.