# Typography Exploration & Font Handoff

> **Status:** Temporary local comparison in progress (uncommitted).  
> **Decision pending:** User has shortlisted **Option 1 (`rpg-pixel`)** and **Option 3 (`pixel-numbers`)** and discarded all other candidates. Default production fonts remain unchanged until one finalist is approved and self-hosted.

---

## 1. Design Philosophy & Hard Constraints

From `docs/design_system.md` (§3.2) and `docs/visuals.md`:

- **Brand personality ("Kyoto Ink & Washi"):** Curious, tranquil, considerate, gently playful — inspired by hand-drawn guidebooks, ink stamps (*goshuin*), washi paper (`#FAF8F4`), quiet canals, Kyoto Purple (`#782459`), Antique Gold (`#C69C4D`), a **64px pixel-art fox** companion (`FoxAvatar`), and the experimental **16×16 pixel-textured map** (`?look=pixel`).
- **Tactile & playful depth:** Physical press feedback and visible progress (Macadam / Duolingo warmth), never loud neon arcade or cold European fintech.
- **Bilingual EN + JA requirement:** Must handle English and Japanese (`lang="en"` and `lang="ja"`) seamlessly, including Kanji + Kana coverage and clean mixed-script headings (e.g., `鴨川リバーサイド散歩 · 120 pt`).
- **Mobile legibility:** Primary target is 360–430 CSS px portrait phones; no text smaller than 12px; WCAG 2.2 AA contrast. Full-pixel body paragraphs hurt readability on route instructions and voucher terms, so **pixel typefaces belong on display headings, hero numbers, and/or compact telemetry badges**, paired with a warm, legible EN+JA sans for UI/body copy.
- **Numeric telemetry:** `font-variant-numeric: tabular-nums;` for points, distances, countdowns, and voucher codes.
- **Offline / self-hosted invariant:** Production builds must self-host all fonts under `public/fonts/` via `scripts/fetch_fonts.py` (all chosen families are SIL OFL 1.1 on Google Fonts). In the temporary preview, Google Fonts CSS is only injected when `?font=<preset>` or `/font-compare` is active — the default app makes zero external font requests.

---

## 2. Current Baseline Fonts (Production Default)

Active whenever `?font=...` is omitted:

| Role | Font Family | Weights | Source |
|---|---|---|---|
| Display / Headings (`--font-display` / `--font-title`) | `Shippori Mincho` | `700` | Self-hosted (`public/fonts/shippori-mincho/`) |
| Latin UI / Body (`--font-ui` / `--font-body`) | `Plus Jakarta Sans` | `400..800` | Self-hosted (`public/fonts/plus-jakarta-sans/`) |
| Japanese UI / Body (`--font-ui-ja`) | `Noto Sans JP` | `400..700` | Self-hosted (`public/fonts/noto-sans-jp/`) |

---

## 3. Shortlisted Finalists (Active in `/font-compare`)

Both finalists are currently wired into `src/lib/font-presets.ts`, `src/components/font-preview.tsx`, `src/app/globals.css`, and `src/app/font-compare/page.tsx`.

### Option 1 — Cozy Kyoto RPG (`?font=rpg-pixel`)

- **Vibe:** Warm handheld Japanese RPG / indie travel guidebook. Pairs directly with the 64px pixel fox sprite and the `?look=pixel` map while staying calm and easy to read on small phone screens.
- **Fonts & Roles:**
  - **Display / Headings / Hero Numbers (`--font-display` / `--font-title`):** **`DotGothic16`** (weight `400`, `font-synthesis-weight: none`)
    - Authentic Japanese 16×16 dot-matrix pixel typeface with **full Kanji, Kana, and Latin** coverage — English and Japanese headings share the exact same pixel craft.
    - Applied to all `--font-title` elements (`h1`, `h2`, `h3`, `.sheet-title`, `.route-card h3`, `.quest-card h2`, `.goshuin-book h2`, `.goshuin-page h3`, `.ticket-main h3`, `.activity-log h2`, `.passport-name`, `.trail-head h2`, `.mission-hero h2`, `.celebration h2`, `.celebration-points strong`, `.surge-rate strong`, `.rewards-points`, `.walk-hud-text strong`, `.follow-title`, `.brand-seal`, `.home-coin-mark`, `.confirm-heading h2`, `.walk-cover h1`, `.walk-list-head h2`, `.walk-list-item h3`) **plus** `.home-hero-number strong`, `.home-status-copy`, `.settings-section h2`, `.sheet-subtitle`, `.walk-list-item h4`, and `.redeem-code`.
    - `letter-spacing: 0.01em` and `font-weight: 400` on `.home-hero-number strong` and `.home-status-copy` to prevent synthetic bolding.
  - **UI / Body / Controls (`--font-ui` / `--font-body`):** **`Zen Maru Gothic`** (weights `400;500;700`, fallback `Noto Sans JP`)
    - Soft, rounded Japanese + Latin sans with friendly tactile warmth (closer to Nintendo / Duolingo than geometric corporate sans).
    - Applied to body text, descriptions, buttons, pills, chips, bottom dock, map overlays, and form controls.
- **Key lesson learned:** Do **not** put `DotGothic16` on every button, dock tab, pill, or form label — keeping `DotGothic16` focused on headings and hero numbers while `Zen Maru Gothic` handles UI controls and body copy is what makes this pairing feel balanced and polished.
- **Google Fonts query & OFL paths (for `scripts/fetch_fonts.py`):**
  - `("dotgothic16", "DotGothic16", "ofl/dotgothic16/OFL.txt")`
  - `("zen-maru-gothic", "Zen+Maru+Gothic:wght@400;500;700", "ofl/zenmarugothic/OFL.txt")`

---

### Option 3 — Pixel Numbers & Badges (`?font=pixel-numbers`)

- **Vibe:** Artisanal Kyoto ink-craft editorial titles combined with playful pixel-game telemetry for points, multipliers, stop numbers, and badges. Keeps Kyoto's tranquil guidebook feel on titles while echoing the pixel fox on every game-progress number.
- **Fonts & Roles:**
  - **Display / Headings (`--font-display` / `--font-title`):** **`Kaisei Decol`** (weights `500;700`, fallback `Hiragino Mincho ProN, serif`)
    - Japanese serif with gentle woodblock/brush-stroke terminals — warmer and more handcrafted than `Shippori Mincho`, with full EN + JA coverage.
    - Applied to all `--font-title` elements plus `.home-status-copy`, `.settings-section h2`, `.sheet-subtitle`, and `.walk-list-item h4`.
  - **Pixel Numbers & Game Badges (`--font-pixel`):** **`Jersey 15`** (weight `400`, fallback `DotGothic16, monospace` for any Japanese glyphs)
    - Charming chunky pixel display font with much more warmth than classic arcade fonts.
    - Applied strictly to numeric/badge telemetry:
      - `.home-hero-number strong` (`font-size: clamp(68px, 18vw, 88px)`)
      - `.home-points-pill-value`, `.home-status-badge`, `.home-track-badge`, `.home-track-label`, `.home-track-origin`
      - `.surge-rate strong`, `.rewards-points` (`font-size: 34px !important`), `.celebration-points strong`
      - `.map-place-pin-number`, `.stop-number`, `.follow-itinerary-index`
      - `.redeem-code`, `.ticket-cost`, `.log-points`, `.demo-badge`, `.reward-pill`
    - Uses `font-weight: 400 !important; letter-spacing: 0.03em;` so `Jersey 15` renders crisply without faux-bolding.
  - **UI / Body / Controls (`--font-ui` / `--font-body`):** **`Zen Kaku Gothic New`** (weights `400;500;700`, fallback `Noto Sans JP`)
    - Calm, crisp Japanese + Latin sans designed for clean small-screen guidebook readability.
    - Applied to body text, buttons, dock, pills, map labels, and form controls.
- **Key lesson learned:** Keep `Jersey 15` strictly on numbers and compact badges (not on dock tabs, category chips, or body-sized buttons) and keep `Kaisei Decol` on titles (not on switches or form labels). That restraint is what makes Option 3 feel cohesive instead of cluttered.
- **Google Fonts query & OFL paths (for `scripts/fetch_fonts.py`):**
  - `("jersey-15", "Jersey+15", "ofl/jersey15/OFL.txt")`
  - `("kaisei-decol", "Kaisei+Decol:wght@500;700", "ofl/kaiseidecol/OFL.txt")`
  - `("zen-kaku-gothic-new", "Zen+Kaku+Gothic+New:wght@400;500;700", "ofl/zenkakugothicnew/OFL.txt")`
  - *(Optionally keep `DotGothic16` if Japanese characters appear inside `--font-pixel` badges.)*

---

## 4. Discarded Candidates (Evaluated & Rejected)

All of the following were tested in `/font-compare` and discarded by the user:

1. **Macadam (`Satoshi Variable` + `Yalla`)**
   - Local files still sit uncommitted in `public/fonts/macadam-preview/` (`satoshi.woff2`, `yalla.woff2`) and can be deleted once font selection is finalized.
   - **Why rejected:** Clashed with Kyoto Ink & Washi — Satoshi felt like sleek European fintech and Yalla felt like loud sports-poster display.
   - *(Note: Earlier unevenness in the Macadam preview was also caused by `satoshi.woff2` being `Satoshi Variable` (`wght 300..900`) declared without `font-weight: 300 900`, `yalla.woff2` being `OS/2 usWeightClass: 400` declared as `900`, and MapLibre GL overriding `font-family` inside `.maplibregl-map`.)*
2. **Option 2 — Variable Pixel + Guidebook (`Pixelify Sans` + `DotGothic16` + `Zen Kaku Gothic New`)**
   - **Why rejected:** User preferred the cleaner unified Japanese pixel aesthetic of Option 1 and the serif+pixel-telemetry contrast of Option 3.
3. **Option 4 — Hand-Drawn Kyoto Guidebook (`Klee One` + `Zen Maru Gothic`)**
   - **Why rejected:** User preferred pixel-inflected directions (1 and 3).
4. **Option 5 — Woodblock Craft (`Kaisei Decol` + `BIZ UDPGothic`)**
   - **Why rejected:** Pure non-pixel craft; user preferred `Kaisei Decol` paired with `Jersey 15` pixel telemetry (Option 3) instead.

---

## 5. Temporary Preview Architecture (Files Touched)

| File | Purpose |
|---|---|
| `src/lib/font-presets.ts` | Defines `FONT_PRESETS` (`rpg-pixel`, `pixel-numbers`, `default`), `VALID_PREVIEW_IDS`, `presetById`, and `GOOGLE_PREVIEW_FONTS_URL`. |
| `src/components/font-preview.tsx` | Client component mounted in `src/app/layout.tsx`. Uses `useLayoutEffect` + `popstate` to set `document.documentElement.dataset.fontPreview` when `?font=rpg-pixel` or `?font=pixel-numbers` is present, and lazily injects `GOOGLE_PREVIEW_FONTS_URL` into `<head>` only when a Google-hosted preview preset is active. |
| `src/app/globals.css` | Universal fixes (kept for production): `button, input, select, textarea { font: inherit; color: inherit; }` (line 47) and `.kyoto-map .maplibregl-map { font-family: var(--font-body); }` (line 111) so MapLibre DOM overlays inherit the app font instead of `Helvetica Neue / Arial`. Temporary preview blocks sit at the bottom (`html[data-font-preview="rpg-pixel"]` and `html[data-font-preview="pixel-numbers"]`). |
| `src/app/font-compare/page.tsx` | Temporary comparison route at `http://localhost:3000/font-compare`. Defaults to **Option 1 (left)** vs **Option 3 (right)** in synced 390×800 mobile iframes, with dropdowns (including `Current`), a **Sync tab** bar (`Home / Explore / Missions / Rewards / Me`), a **`?look=pixel`** toggle, and a **Type specimen** view. |

### Preview URLs
- Side-by-side compare: `http://localhost:3000/font-compare`
- Option 1 full app: `http://localhost:3000/?route=kamo-riverside&font=rpg-pixel`
- Option 3 full app: `http://localhost:3000/?route=kamo-riverside&font=pixel-numbers`
- Current baseline: `http://localhost:3000/?route=kamo-riverside`

---

## 6. Gotchas & Next Steps for Finalizing

### Gotchas discovered during development
- **Next.js 16 Turbopack CSS cache:** Editing `src/app/globals.css` while `next dev` is running can occasionally serve a stale compiled stylesheet or hit a `.sst` `TurbopackInternalError`. If font CSS changes don't appear in DevTools, stop `next dev`, run `rm -rf .next/dev`, and restart `npm run dev`.
- **Keep `Zen Maru Gothic` / `Zen Kaku Gothic New` at `400;500;700`:** Adding `900` makes `font-weight: 800` UI elements jump to ultra-heavy weight and look noticeably heavier than the showcase.
- **MapLibre GL font override:** `maplibre-gl/dist/maplibre-gl.css` sets `.maplibregl-map { font: 12px/20px Helvetica Neue, Arial, Helvetica, sans-serif; }`. Keep `.kyoto-map .maplibregl-map { font-family: var(--font-body); }` in `src/app/globals.css` permanently so map DOM markers (`map-route-label`, `map-place-pin-number`, `map-fox-label`, `fox-bubble`, `map-goal-text`) always inherit the app font.

### Checklist once the user picks Option 1 or Option 3
1. Update `FAMILIES` in `scripts/fetch_fonts.py` with the winning option's Google Fonts queries & `OFL.txt` paths (see §3) and run `python3 scripts/fetch_fonts.py` to self-host the woff2 slices into `public/fonts/` and regenerate `src/app/fonts.css`.
2. Promote the winning CSS custom properties (`--font-display`, `--font-ui`, `--font-body`, `--font-title`, and `--font-pixel` if Option 3) into `:root` in `src/app/globals.css`, along with the display-heading assignments (`.home-hero-number strong`, `.home-status-copy`, `.settings-section h2`, `.sheet-subtitle`, `.walk-list-item h4`, `.redeem-code`).
3. Remove temporary preview files:
   - `src/app/font-compare/page.tsx`
   - `src/components/font-preview.tsx` (and its import/render in `src/app/layout.tsx`)
   - `src/lib/font-presets.ts`
   - `public/fonts/macadam-preview/`
   - Temporary `html[data-font-preview...]` blocks at the bottom of `src/app/globals.css`
4. Remove unused old font folders in `public/fonts/` if they are no longer referenced by `src/app/fonts.css`.
5. Update `docs/design_system.md` §3.2 and `docs/DECISIONS.md` with the final typography decision.
6. Run `npm run typecheck && npm run lint && npm test` and verify in Playwright across both `en` and `ja` locales.
