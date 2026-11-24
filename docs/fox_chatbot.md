# Grounded "Ask the Fox" — Guided Q&A Spec & Implementation Guide

> **Status:** Approved design blueprint (ready for implementation on `prototype-engineering`).  
> **Summary:** Make the pixel fox location marker on the **Explore** tab tappable to open an interactive, location-aware **Guided Q&A card** (3 context-aware recommended questions + 1 free-text input, showing one answer at a time). Powered by a server-side **Gemini API** Route Handler with **hybrid grounding** (prioritizing verified Kyoto fixtures with citations, allowing general Kyoto trivia only with an explicit unverified badge) and a **deterministic offline / no-key fallback**.  
> **UI prototype plan:** Include a temporary 3-variant visual comparison (`?foxUi=modal | rpg | bubble`) so the team can test all three pop-up styles on mobile before locking in one (current lean: **Option B — Bottom-Anchored Cozy RPG Dialogue Card**).  
> **Related docs:** [DECISIONS.md](./DECISIONS.md), [ROUTE_DATA.md](./ROUTE_DATA.md), [routes.md](./routes.md), [visuals.md](./visuals.md), [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md).

---

## 1. Product Experience & Core Decisions

| Decision | Choice | Reasoning |
|---|---|---|
| **Trigger** | Tapping the fox location marker (`map-fox-figure`) on the Explore tab | Natural, playful entry point tied directly to the user's current position; keeps the existing `fox-bubble` check-in button independent when visible. |
| **Interaction depth** | **Guided Q&A card** (3 recommended question chips + single free-text input, 1 answer at a time, no multi-turn chat thread) | Fast, scannable on 360–430 px portrait phones, zero chat-scroll clutter, low latency & token cost, easy to verify. |
| **LLM provider** | **Gemini API** via server-side Next.js Route Handler (`src/app/api/fox-chat/route.ts`) | Keeps `GEMINI_API_KEY` strictly server-side, supports native JSON schema enforcement (`responseMimeType: "application/json"`), low latency with Flash models. |
| **Offline / no-key fallback** | **Deterministic local fallback** (`src/lib/fox-fallback.ts`) | Guarantees the feature works offline (PWA goal), in CI/Playwright tests, and in demos without an API key, using `PLACE_STORIES`, `CURATED_PLACES`, and `CURATED_WALKS`. |
| **Grounding policy** | **Hybrid** — prioritize verified Kyoto fixtures with citations; allow general Kyoto cultural trivia clearly badged as `AI general knowledge · unverified` | Balances delightful tourist curiosity with Kyoto Ink & Washi honesty rules; hard-refuses fabricated paths, live crowds, step-free claims, or fake shop hours/prices. |
| **Visual surface** | **Build 3 rough prototypes first** (`modal`, `rpg`, `bubble`), defaulting to **Option B (`rpg`)** | Lets the user feel all three pop-up layouts on a 390×800 viewport before choosing one and removing the temporary switch. |
| **Branch / merge safety** | Built on `prototype-engineering` with minimal touches to shared UI files | Keeps `SnapSheet` and core layout untouched so merging with UI work on `main` stays conflict-free. |

---

## 2. Pop-Up Visual Options (Build All 3 Rough Prototypes First)

Implement a lightweight temporary query-param or dev toggle (`?foxUi=rpg` default, `?foxUi=modal`, `?foxUi=bubble`) inside `src/components/fox-guide-dialog.tsx` so the user can compare all three styles side-by-side on `http://localhost:3000` (390×800 mobile viewport) before picking one and deleting the unused two.

All three variants share the **exact same state, API hook, 3 recommended chips, single free-text input, and single-answer card** — only the outer container/layout differs.

### Option A (`?foxUi=modal`) — Centered Kyoto Dialogue Modal
- Reuses the existing native `<dialog className="confirm-dialog">` centered over a soft `rgb(28 25 23 / 40%)` backdrop (`width: min(100% - 32px, 440px)`, `border-radius: 18px`, `--bg-ivory`).
- **Pros:** Native focus trap, `Esc` to close, iOS/Android keyboard-safe, zero map-edge clipping, most consistent with existing confirmation/redemption dialogs.
- **Cons:** Feels more like a standard modal dialog than a map-integrated companion.

```text
┌─────────────────────────────────────┐
│ [🦊 Fox]  Ask the Fox            ✕  │
│           Near Shijō Bridge · 45 m  │
├─────────────────────────────────────┤
│  ╭───────────────────────────────╮  │
│  │ What do most people miss here?│  │
│  ╰───────────────────────────────╯  │
│  ╭───────────────────────────────╮  │
│  │ Any etiquette or access notes?│  │
│  ╰───────────────────────────────╯  │
│  ╭───────────────────────────────╮  │
│  │ Which walks connect nearby?   │  │
│  ╰───────────────────────────────╯  │
├─────────────────────────────────────┤
│  [✓ Verified Kyoto fixture]         │
│  "Today's bridge was built in 1942…"│
│  Source: 四条大橋 – Wikipedia ↗      │
├─────────────────────────────────────┤
│ [ Ask something else…      ] [Ask]  │
└─────────────────────────────────────┘
```

### Option B (`?foxUi=rpg`) — Bottom-Anchored Cozy RPG Dialogue Card *(Preferred Lean / Default)*
- Uses a native `<dialog>` styled as a **bottom-anchored RPG dialogue box** (`position: fixed; bottom: calc(16px + env(safe-area-inset-bottom))`, `width: min(100% - 24px, 460px)`) with a lighter backdrop (`rgb(28 25 23 / 22%)`) so the Kyoto map remains visible above it.
- The **64 px pixel `FoxAvatar`** sits partially overlapping the top-left border inside a Kyoto-purple/antique-gold circular frame (like an RPG character portrait box).
- Uses `--bg-washi` with a crisp `2px solid var(--kyoto-purple)` or `--antique-gold` border, `DotGothic16` heading (`Ask the Fox` / `きつねに聞く`), and compact tactile chips.
- **Pros:** Strongest match for the Cozy Kyoto RPG identity; feels native to the map while keeping native `<dialog>` accessibility, focus management, and mobile keyboard safety.

### Option C (`?foxUi=bubble`) — Floating Map Speech Bubble (Anchored to the Fox)
- Auto-pans the map gently (`mapRef.current.easeTo(...)`) so the fox marker sits in the lower-middle third of the viewport, then renders an expanded speech bubble (`max-width: min(calc(100vw - 32px), 340px)`) **in `KyotoMap`'s main React tree** positioned via `mapRef.current.project(foxCoordinates)` (clamped inside the viewport, with a downward tail pointing to the fox). **Do not** render the interactive Q&A form inside `markerRootRef` (where MapLibre transforms and z-index layers will clip it).
- Dismisses on tapping the map backdrop, pressing `Esc`, or tapping `✕`.
- **Pros:** Most literal "tap the fox → speech bubble pops up" delight.
- **Cons / edge cases to test in the prototype:** Tight vertical space on 360×667 screens when the mobile virtual keyboard opens for free-text input; needs viewport clamping so it never clips off the left/right edges when the user pans.

> **Cleanup rule once chosen:** After the user picks Option A, B, or C, delete the `?foxUi=` switch and the two unchosen layout branches so only the winning component styling ships.

---

## 3. Location Context Resolution (`src/lib/fox-context.ts`)

Create a pure, side-effect-free TypeScript module that resolves what the fox knows about "here":

```ts
export type FoxLocationSource = "live" | "demo" | "sample";

export interface FoxContext {
  locationSource: FoxLocationSource;
  placeId: string | null;
  placeDistanceMeters: number | null;
  walkId: string | null;
  contextLabel: { en: string; ja: string };
  recommendedQuestions: readonly { id: string; en: string; ja: string }[]; // Always length 3
}
```

### Resolution Priority
1. **Nearest `CuratedPlace` within `250 m`** of the current fox coordinate (`location.fix` when `mode === "live"`, `demoPoint` when playing Demo Mode, or `DEMO_POSITION` otherwise), using `distanceMeters([lng, lat], [lng2, lat2])` from `src/lib/game.ts`.
   - If the user is actively on a walk (`activeRun`), break ties in favor of the current/next stop on `activeRun.walkId`.
2. **Selected walk fallback:** If no `CuratedPlace` is within `250 m` but `selectedWalkId` is active, bind `walkId = selectedWalkId` (`placeId = null`).
3. **General Kyoto fallback:** If outside `250 m` of any curated place and no walk is selected, set `placeId = null, walkId = null` (general Kyoto walking & etiquette context).

### Context Labels (Aligned with `docs/refinement.md`)
Keep the location pill clean and uncluttered for the showcase demo (avoid `"Demo Mode ·"` / `"Sample spot ·"` boilerplate):
- `locationSource === "live"` (within 250 m): *"Near Shijō Bridge · 45 m"* / *"四条大橋の近く · 45 m"*
- `locationSource === "demo"` or `"sample"` (within 250 m): *"Near Shijō Bridge"* / *"四条大橋の近く"*
- Walk selected (>250 m away): *"Kamo riverside sidewalk"* / *"鴨川沿いの歩道"*
- General Kyoto fallback: *"Kyoto Walk Guide"* / *"京都おさんぽガイド"*

### 3 Context-Aware Recommended Questions
Always return exactly **3** bilingual chips tailored to the resolved context:

- **When `placeId` is resolved (near a curated stop):**
  1. `hidden_detail`: *"What is something most people don't know about this place?"* / *「この場所について、あまり知られていないことは？」*
  2. `etiquette_access`: *"What local etiquette or access notes should I know here?"* / *「ここで気をつけたいマナーや通行の注意点は？」*
  3. `connected_walks`: *"Which curated walks pass through or near here?"* / *「ここを通るおすすめ散歩ルートは？」*
- **When only `walkId` is resolved (viewing a walk, >250 m away):**
  1. `walk_highlights`: *"What are the highlights along this walk?"* / *「この散歩ルートの見どころは？」*
  2. `walk_access`: *"Are there stairs, crossings, or etiquette notes on this route?"* / *「階段やマナーなど、歩く前の注意点は？」*
  3. `walk_rewards`: *"How many seals and points can I earn on this walk?"* / *「このルートでスタンプやポイントはどのくらい貯まる？」*
- **When neither is resolved (general Kyoto / outside Kyoto):**
  1. `kyoto_etiquette`: *"What are the most important Kyoto walking etiquette tips?"* / *「京都を歩くときに大切なマナーは？」*
  2. `start_walk`: *"Which curated walk is best for a quick 10-minute stroll?"* / *「10分くらいで歩けるおすすめルートは？」*
  3. `how_seals_work`: *"How do Goshuin seals and demo rewards work?"* / *「御朱印スタンプとデモ特典の仕組みは？」*

---

## 4. Hybrid Grounding & Safety Contract (`src/lib/fox-grounding.ts`)

### Grounding Packet (Sent to Gemini as System Context)
Build a compact JSON/text packet strictly from local fixtures for the resolved `placeId` / `walkId`:
- `place`: `name`, `description`, `accessNotes`, `accessibilityNotes`, `communityInputStatus`, `osmFeatureUrl`
- `story`: `PLACE_STORIES[placeId]` (`text`, `sources`, `status: "draft"`)
- `connectedWalks`: matching `CURATED_WALKS` (`name`, `description`, `theme`, `estimatedMeters`, `estimatedMinutes`, `mappedSteps`, `accessibilityNotes`, `residentNotes`)
- `etiquette`: matching `ETIQUETTE_ZONES` / `etiquetteZoneAt` from `src/lib/etiquette.ts` plus general Kyoto visitor manner rules (keep corridors clear, respect private alleys/property, no intrusive photography, follow shrine/temple signs)
- `gameRules`: `GAME.checkpointPoints` (10), `GAME.completionPoints` (30), `DEMO_TRAIL.goal` (5), and `COUPONS` costs/offers from `src/config/game.ts` (keep copy clean per `docs/refinement.md`; never invent real shop hours or prices).

### Strict Response Schema (`FoxAnswer`)
Both Gemini (`responseMimeType: "application/json"`) and the offline fallback must return this exact TypeScript shape:

```ts
export type FoxGroundingKind =
  | "verified_fixture"   // Answered strictly from our curated Kyoto fixtures & cited sources
  | "hybrid_general_ai"  // Includes general Kyoto cultural trivia beyond our fixtures
  | "offline_fixture";   // Answered deterministically offline / without API key

export interface FoxCitation {
  title: string;
  url: string; // Must start with https://
}

export interface FoxAnswer {
  answer: string;                      // 2–4 concise sentences in requested locale (en | ja)
  grounding: FoxGroundingKind;
  citations: readonly FoxCitation[];   // Required (non-empty) when place story/sources were used
  safetyNote?: string;                 // Optional caveat (e.g., stairs, draft status, or unverified trivia note)
}
```

### Prompt & Post-Validation Rules
1. **Priority order:** Answer from the Grounding Packet first. If the Grounding Packet completely answers the question, set `grounding: "verified_fixture"` and copy only the relevant `citations` from the Grounding Packet (never invent URLs).
2. **Hybrid general trivia:** If the user asks a broader Kyoto cultural/historical question not covered by the packet, you may answer concisely using general knowledge, **must** set `grounding: "hybrid_general_ai"`, and **must not** invent citation URLs. The UI renders an unmissable badge: `AI general knowledge · unverified` / `AIの一般知識・未確認`.
3. **Hard refusals (never violate):**
   - Never invent walking routes, street-by-street directions, or coordinates.
   - Never claim live crowd levels, "quiet" streets, or bus congestion status.
   - Never certify wheelchair/stroller step-free access (`accessibilityNotes` always require on-site verification).
   - Never invent shop opening hours, prices, or claim demo vouchers are redeemable at real shops.
4. **Server-side citation sanitization:** Strip any `citation.url` returned by Gemini that is not present in the Grounding Packet's allowed URL set (prevents hallucinated links).

---

## 5. Backend API & Deterministic Fallback

### Server Route Handler (`src/app/api/fox-chat/route.ts`)
- **Method:** `POST /api/fox-chat`
- **Request body:**
  ```ts
  {
    question: string;          // Trimmed, 1..160 chars
    questionId?: string;       // Optional ID when user tapped one of the 3 recommended chips
    locale: "en" | "ja";
    placeId: string | null;    // Validated against CURATED_PLACES
    walkId: string | null;     // Validated against CURATED_WALKS
    locationSource: "live" | "demo" | "sample";
  }
  ```
  - **Privacy invariant:** Raw GPS coordinates are **never** sent to the server or logged; the client resolves `placeId` locally and sends only the curated `placeId` / `walkId`.
- **Environment variables (`.env.local`, server-only):**
  - `GEMINI_API_KEY` — **never** prefix with `NEXT_PUBLIC_`.
  - `GEMINI_MODEL` — optional override, defaults to `"gemini-2.5-flash"`.
- **Zero-dependency Gemini REST call (no new npm package needed):**
  - `POST https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
  - Header: `"x-goog-api-key": process.env.GEMINI_API_KEY`, `"Content-Type": "application/json"`
  - Timeout: `signal: AbortSignal.timeout(8000)`
  - Request payload uses `systemInstruction` (Grounding Packet + rules), `contents` (user question + locale), and `generationConfig`:
    ```json
    {
      "responseMimeType": "application/json",
      "responseSchema": {
        "type": "OBJECT",
        "required": ["answer", "grounding", "citations"],
        "properties": {
          "answer": { "type": "STRING" },
          "grounding": { "type": "STRING", "enum": ["verified_fixture", "hybrid_general_ai"] },
          "citations": {
            "type": "ARRAY",
            "items": {
              "type": "OBJECT",
              "required": ["title", "url"],
              "properties": { "title": { "type": "STRING" }, "url": { "type": "STRING" } }
            }
          },
          "safetyNote": { "type": "STRING" }
        }
      }
    }
    ```
  - Parse `data.candidates?.[0]?.content?.parts?.[0]?.text` with `JSON.parse`, then run post-validation & citation sanitization.
- **Execution flow:**
  1. Validate request body (reject invalid `locale`, empty or `> 160` char `question`, unknown `placeId`/`walkId`).
  2. Build the Grounding Packet via `src/lib/fox-grounding.ts`.
  3. If `GEMINI_API_KEY` is missing, immediately return `buildOfflineFoxAnswer(...)` (`200 OK`, `grounding: "offline_fixture"`).
  4. Otherwise call Gemini via `fetch` as above.
  5. Validate and sanitize the JSON response (verify `grounding` enum, strip any URL not in the Grounding Packet, ensure `answer` is non-empty).
  6. On timeout, network failure, quota error, or malformed JSON, catch and return `buildOfflineFoxAnswer(...)` gracefully so the user never hits a dead error screen.

### Deterministic Offline / No-Key Fallback (`src/lib/fox-fallback.ts`)
- Pure TypeScript module usable on **both server and client** (if the browser is offline, the client calls `buildOfflineFoxAnswer` directly without even making a network request).
- Handles:
  - All 9 `questionId` chip IDs (`hidden_detail`, `etiquette_access`, `connected_walks`, `walk_highlights`, `walk_access`, `walk_rewards`, `kyoto_etiquette`, `start_walk`, `how_seals_work`) directly from `PLACE_STORIES`, `CURATED_PLACES`, `CURATED_WALKS`, and `GAME`.
  - Free-text keyword fallback (matching stairs/accessibility, etiquette/rules, history/story, walks/routes, points/seals/vouchers) + honest fallback message when a custom question requires online AI.

---

## 6. Merge-Safe File Map (`prototype-engineering` vs. `main`)

To keep merging with your friend's UI work on `main` effortless, isolate almost all code in new files:

| Action | File | Responsibility |
|---|---|---|
| `[NEW]` | `src/lib/fox-context.ts` | Resolve nearest curated place (≤250 m), active walk, location source label, and 3 bilingual recommended questions |
| `[NEW]` | `src/lib/fox-grounding.ts` | Build Grounding Packet from `kyoto-walks.ts`, `place-stories.ts`, and `game.ts`; validate & sanitize `FoxAnswer` |
| `[NEW]` | `src/lib/fox-fallback.ts` | Deterministic offline / no-key answer generator with citations |
| `[NEW]` | `src/app/api/fox-chat/route.ts` | Server-side Gemini API Route Handler + timeout + fallback |
| `[NEW]` | `src/components/fox-guide-dialog.tsx` | Self-contained Guided Q&A UI with temporary 3-variant prototype switcher (`modal` / `rpg` / `bubble`) |
| `[NEW]` | `tests/fox-guide.test.mjs` | Unit tests for context resolution, 3-chip generation, grounding packet, citation sanitization, and offline fallback |
| `[MODIFY]` | `src/components/map/kyoto-map.tsx` | Minimal hook: turn `map-fox-figure` (inside `markerRootRef.current.render(...)`, lines 557–561) into a 44×44 `<button>` calling `foxActionRef.current()` with `event.stopPropagation()` (mirroring `bubbleActionRef`); render `<FoxGuideDialog />` in `KyotoMap`'s main tree so `fox-bubble` stays independent |
| `[MODIFY]` | `src/locales/en.json`, `src/locales/ja.json` | Add bilingual `foxGuide*` strings (labels, badges, placeholders, offline note) — `MessageKey` in `src/lib/i18n.ts` updates automatically from `en.json` |
| `[MODIFY]` | `src/app/globals.css` | Append a clearly fenced `/* Ask the Fox guided Q&A */` block at the bottom (easy to resolve if `main` also edits CSS) |

### Critical Codebase Gotcha (Node Unit Test Imports)
- `npm test` runs `node --test tests/*.test.mjs` directly on `.ts` files using Node 22+ native type stripping, which **does not resolve `@/` path aliases**.
- Inside `src/lib/fox-context.ts`, `src/lib/fox-grounding.ts`, and `src/lib/fox-fallback.ts`, **always use relative `.ts` imports** (e.g., `../data/kyoto-walks.ts`, `../data/place-stories.ts`, `./game.ts`, `./etiquette.ts`, `../config/game.ts`), matching `src/lib/game.ts` and `src/lib/place-walk-time.ts`. (Next.js components like `src/components/fox-guide-dialog.tsx` and `src/app/api/fox-chat/route.ts` can use `@/` normally.)

---

## 7. Verification Plan (When Implementing)

### Automated Tests
```bash
npm run typecheck
npm run lint
npm test
npm run build
```
`tests/fox-guide.test.mjs` must verify:
1. Context resolution within 250 m, outside 250 m, active walk tie-breaking, and `live` / `demo` / `sample` labels.
2. All 3 contexts emit exactly 3 non-empty EN + JA recommended question chips.
3. Offline fallback returns valid `FoxAnswer` (`grounding: "offline_fixture"`) with verified `https://` citations for every chip and never invents facts.
4. Citation sanitizer strips any hallucinated URL not present in the Grounding Packet.

### Browser / Mobile Verification (`390 × 800`)
- [ ] Tapping the fox marker on Explore opens the Q&A pop-up; when a check-in `fox-bubble` is visible, tapping `fox-bubble` still triggers check-in while tapping the fox opens Ask the Fox.
- [ ] Compare all 3 visual prototypes (`?foxUi=rpg`, `?foxUi=modal`, `?foxUi=bubble`) at `360 × 800` and `390 × 800` in both `en` and `ja`.
- [ ] Test with `GEMINI_API_KEY` set (verify `verified_fixture` with citations AND `hybrid_general_ai` with unverified badge) and without `GEMINI_API_KEY` / offline (verify seamless `offline_fixture` fallback).
- [ ] Confirm mobile keyboard input, `Esc` key, and close button work cleanly with zero horizontal overflow.
