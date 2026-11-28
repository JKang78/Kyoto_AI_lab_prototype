# Kitsune Walk — Kyoto AI Lab Prototype

**Live demo:** https://kitsunewalk.vercel.app/ // **Demo Slide Deck (Canva):** https://canva.link/fixvjuttsu1b8md

### Demo Video

<video src="public/demo_video.mp4" controls width="360">
  Your browser does not support embedded video. <a href="public/demo_video.mp4">Watch the Kitsune Walk demo video (MP4)</a>.
</video>

[Watch / download the Kitsune Walk demo video (`public/demo_video.mp4`)](public/demo_video.mp4)

---

### Why Kitsune Walk?

Kyoto is experiencing a historic inbound tourism boom—reaching a record **62.7M total tourists in 2025**, including a **17% year-over-year increase in foreign visitors**. That surge has placed heavy strain on city transit infrastructure, especially around major sightseeing corridors: **63.8% of residents report inconvenience from crowded public transport**, a concern echoed in our interviews with Kyoto residents.

**Kitsune Walk** addresses this by gamifying walking in Kyoto as a **progressive web application (PWA)**. Because it runs directly in mobile browsers like Chrome or Safari with no app-store download required, it lowers adoption friction for both visitors and residents.

The goal is to disperse foot traffic off crowded public buses by incentivizing people to walk: earning location-verified stamps, discovering personalized routes and lesser-known neighborhood spots, and—as the end-state vision—unlocking real coupons and local currency redeemable exclusively at local shops. By guiding visitors onto less congested walking routes and rewarding them with local spending incentives, Kitsune Walk aims to ease pressure on major hotspots while revitalizing neighborhood businesses.

> **About this prototype:** Built with **Next.js 16**, **React 19**, **MapLibre GL**, and **Gemini**, this bilingual (**English / Japanese**) prototype lets visitors explore **9 curated pedestrian walks**, **33 stops**, and **15 Kyoto orientation landmarks** with an animated pixel-fox companion, stamp-collecting missions, grounded AI Q&A, and demo reward previews.

---

## Features

- **5-tab mobile shell:**
  - **Home:** Pixel-art Kyoto landscape hero with the animated fox, live points counter, active/suggested quest card with progress bar, quick links to Seals / Walks done / Vouchers, and recent check-in activity.
  - **Explore:** Interactive MapLibre GL map over OpenFreeMap vector tiles with tappable route lines, 33 check-in stops, 15 Kyoto orientation landmarks with custom ink-and-washi medallion icons, natural-language search (e.g., *"river within 9 minutes"* or *"9分以内の川沿い"*), theme filters, and a draggable bottom sheet.
  - **Missions:** Curated walk catalog, seasonal trail progress, and stamp passport (印 seals).
  - **Rewards:** Fictional demo voucher catalog with points tracking and a clearly labelled `DEMO — NOT REDEEMABLE` redemption preview.
  - **Account (Me):** Nickname, EN/JA language switcher, saved walks & places, background music mute toggle, map appearance preferences (seasonal park colors, larger labels, landmark-only labels, flat map), and presenter Demo controls (in dev/preview builds).
- **Grounded AI guide (*What Does the Fox Say* / *Ask the Fox*):** Tap the fox on the Explore map or inside a landmark sheet to ask about nearby stops, walks, or Kyoto etiquette. Powered by Gemini via [`src/app/api/fox-chat/route.ts`](src/app/api/fox-chat/route.ts) with strict grounding, refusal guardrails, IP rate limiting, and an offline fixture fallback when no API key is configured.
- **Walks, check-ins, and demo scenarios:** Each stop awards 10 points and completing a 3-stop walk awards a 30-point completion bonus (60 points total). In dev/preview builds, presenters can test simulated walks (**Demo Mode** / **体験モード**) and two hypothetical 2× bonus scenarios (*bus-relief* and *quiet-hour*).
- **QR deep links:** `/?route=<walk-id>` (e.g., `/?route=kamo-riverside`) opens that walk directly on Explore without the onboarding form.
- **PWA & mobile polish:** Standalone web manifest (`public/manifest.webmanifest`), offline shell service worker (`public/sw.js`), portrait orientation prompt, looping background music (`public/audio/`), and automatic build-commit versioning in Account (`next.config.ts`).

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack), React 19, TypeScript 5
- **Mapping:** MapLibre GL 6.19 + OpenFreeMap (`tiles.openfreemap.org/styles/liberty`, no API key required)
- **AI Guide:** Gemini REST API via server route (`/api/fox-chat`) with grounding & guardrails (`src/lib/fox-grounding.ts`, `src/lib/rate-limit.ts`)
- **Styling & Motion:** Tailwind CSS 4, custom CSS, `motion`, `lucide-react`, self-hosted fonts (`DotGothic16`, `Zen Maru Gothic`)
- **Persistence:** Client-side `localStorage` (no external database required)
- **Testing:** Node built-in test runner (`node --test`) + Playwright browser tests

---

## Run Locally

Requires **Node.js >= 22.18.0**.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

### Optional environment variables (`.env.local`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | Optional | Enables live Gemini responses in `/api/fox-chat`. Without it, Ask the Fox uses offline grounded fixtures. |
| `GEMINI_MODEL` | Optional | Overrides the default Gemini model used by `/api/fox-chat`. |
| `NEXT_PUBLIC_KYOTO_FLOW_PREVIEW` | Optional | Set to `1` in production builds to enable presenter Demo Mode, simulated check-ins, and bonus scenarios. Always on in `npm run dev`. |

### Map & location notes

- The map loads OpenFreeMap vector tiles over HTTPS (no API key required; keep the on-map attribution visible). If a browser's built-in ad/tracker blocker blocks third-party `.pbf` tiles on HTTPS, disable the blocker for the site or use **List** view to browse all walks offline.
- Real browser GPS requires **HTTPS** or `localhost`, and is only requested after tapping **Use My Location** or **Start GPS walk**. GPS pauses when leaving the Explore tab and location history is never stored.
- The MapLibre worker is self-hosted in `public/vendor/maplibre-gl-worker-6.19.0.mjs` for reliable Next.js loading. Keep it in sync with the `maplibre-gl` version in `package.json`.

---

## Test on a Phone (HTTPS Tunnel)

```bash
# Terminal 1: start the dev server
npm run dev

# Terminal 2: start a temporary HTTPS tunnel
npx cloudflared tunnel --url http://localhost:3000
```

Open the printed `https://<random>.trycloudflare.com` URL on your phone to test real GPS, touch gestures, and PWA installation. `next.config.ts` already allows `*.trycloudflare.com` in dev (`allowedDevOrigins`).

---

## Deploy on Vercel

This app requires a Next.js server runtime (for `/api/fox-chat`) and works out of the box on **Vercel**:

1. Import the repository in Vercel (or deploy via `npx vercel --prod`).
2. In **Project Settings → Environment Variables**, configure:
   - `GEMINI_API_KEY` *(Secret)* — for live Fox guide answers.
   - `NEXT_PUBLIC_KYOTO_FLOW_PREVIEW` *(Config, value `1`)* — if you want presenter Demo Mode enabled on the deployed URL.
3. Redeploy after changing any `NEXT_PUBLIC_*` variable (Next.js inlines them at build time).

### Presenter vs. public builds

Demo Mode, simulated check-ins, and bonus-scenario switches are governed by [`src/config/environment.ts`](src/config/environment.ts):

```bash
NEXT_PUBLIC_KYOTO_FLOW_PREVIEW=1 npm run build   # presenter / demo deployment
npm run build                                    # public build: GPS walking only
```

All points, merchants, and vouchers remain fictional demo content in both modes.

---

## Quality Checks

```bash
npm test            # unit tests (game logic, landmarks, fox guardrails, release checks)
npm run typecheck   # TypeScript check (tsc --noEmit)
npm run lint        # ESLint
npm run build       # production Next.js build
```

Browser tests (requires the app running on `http://localhost:3000`, or set `PHASE3_URL`):

```bash
npx playwright install chromium
npm run test:browser
```

---

## Project Structure

- `src/app/` — Next.js App Router entry, global styles (`globals.css`), metadata, and `/api/fox-chat` route
- `src/components/` — 5-tab shell & dock (`prototype-app.tsx`), Home (`home-screen.tsx`), Explore map (`map/kyoto-map.tsx`), Missions, Rewards, Fox guide dialog, and shared UI primitives
- `src/config/` — game thresholds & demo vouchers (`game.ts`), presenter/public boundary (`environment.ts`), asset paths (`assets.ts`)
- `src/data/` — 9 curated walks & 33 places (`kyoto-walks.ts`), 15 Kyoto landmarks (`kyoto-landmarks.ts`), place stories, photo credits, and sample congestion cues
- `src/lib/` — game state & `localStorage` persistence, route search/matching, Fox grounding & guardrails, rate limiting, landmark SVG icons, map looks, and i18n helpers
- `src/locales/` — English (`en.json`) and Japanese (`ja.json`) UI dictionaries
- `public/` — PWA manifest, service worker (`sw.js`), place photos, pixel/mascot art, audio, fonts, and MapLibre worker
- `tests/` — unit tests (`tests/*.test.mjs`) and Playwright browser checks (`tests/browser/*.mjs`)

---

## Documentation

- **Specs & architecture:** [Project Spec](docs/PROJECT_SPEC.md), [Product Requirements](docs/PRODUCT_REQUIREMENTS.md), [Engineering Spec](docs/ENGINEERING_SPEC.md), [Architecture](docs/ARCHITECTURE.md), [Decision Log](docs/DECISIONS.md)
- **Feature notes:** [Fox Chatbot](docs/fox_chatbot.md), [Kyoto Landmarks](docs/locations.md), [Route Data & Field Checks](docs/ROUTE_DATA.md), [Background Music](docs/music.md), [Design System](docs/design_system.md), [UI Backlog](docs/visuals.md)
- **QA & tasks:** [Open Tasks](TODO.md), [Test Checklist](docs/TEST_CHECKLIST.md), [Japanese Translation Notes](docs/Japanese_Translation.md)
- **Archive:** [Completed plans, reviews, and handoffs](docs/done/)
