# Open Product Decisions (TODOs)

Decisions deferred for human product/team review before locking Phase 4 polish, public showcase pacing, or real-world field rollout.
For known technical bugs to fix in code, see [docs/BUGS.md](BUGS.md).

## 1. Game Economy & Showcase Pacing
> Configurable centrally in `src/config/game.ts`. See also `docs/done/REVIEW_PHASE_3.md`, `docs/done/PHASE_3_PLAN.md`, and `docs/PROJECT_SPEC.md` §9.

- [ ] **First coupon unlock threshold (60 vs. 100 coins):**
  - *Current default:* 10 coins/stop + 30 completion bonus = **60 coins** per 3-stop walk, unlocking *Kyoto postcard* (60 coins) immediately after one ordinary walk.
  - *Decision needed:* Keep the 60-coin introductory reward for a fast single-walk demo, or raise the first reward threshold to 100 coins (2 walks) to match the PRD example?
- [ ] **Replay & early-exit incentives:**
  - *Current default:* Starting a fresh replay of an already-completed walk earns full checkpoint + completion coins again; ending a walk early keeps earned stamps/coins and allows restarting to earn Stop 1 again.
  - *Decision needed:* Should repeat walks pay full coins again, pay checkpoint coins only (no repeat completion bonus), or incentivize discovering distinct walks/places instead?
- [ ] **Busy-period sample bonus (+50%) scope:**
  - *Current default:* Settings toggle adds +50% to **Demo Mode checkpoint stamps only** (10 → 15 coins; 75 coins/walk), not to live GPS check-ins and not to the 30-coin completion bonus.
  - *Decision needed:* Should the illustrative congestion bonus also apply to live GPS check-ins and/or the route completion bonus?
- [ ] **Fictional coupon catalog & partner framing:**
  - *Current default:* 3 fictional coupons (*Kyoto postcard* 60, *Tea break* 100, *Walking journal* 120), each claimable once per browser until reset.
  - *Decision needed:* Keep these 3 items, or expand to 3–5 fictional rewards with illustrative local-business categories (`docs/PROJECT_SPEC.md` §5.3 & §13)? *(Note: any real merchant offer or partner name requires explicit merchant agreement.)*

## 2. Brand, Artwork & Localization
> See `docs/PROJECT_SPEC.md` §0, §5.5, §10, §11, and §19.

- [ ] **Original mascot, pin, and PWA icon artwork:**
  - *Current default:* Temporary `京` avatar placeholder, simple circle/star CSS pins, and temporary flower `src/app/icon.svg` (no `icons` array yet in `public/manifest.webmanifest`).
  - *Decision needed:* Supply team-owned fox mascot art (`public/assets/mascot/`), themed pin art (`public/assets/pins/`), and full PWA install icon set.
- [ ] **Final product name & visual tokens:**
  - *Current default:* Working name **Kyoto AI Lab prototype** (short name *Kyoto Walk*); confirmed brand color `#782459` (Kyoto Purple) with proposed supporting palette.
  - *Decision needed:* Confirm whether to keep the working name or adopt a final team name, and lock auxiliary palette/typography choices.
- [ ] **Fluent Japanese copy & UX review:**
  - *Current default:* All 173 EN/JA keys are in place and tested for overflow in Chromium, but have not been reviewed by a native/fluent Japanese speaker in context.
  - *Decision needed:* Review phrasing, naturalness, and clarity of active-walk controls, mission stories, and fictional-reward disclosures in Japanese.
- [ ] **Phase 4 Settings & About additions:**
  - *Current default:* Respects OS `prefers-reduced-motion`; no in-app reduced-motion override, no sound setting, and brief About sheet without PWA Add-to-Home-Screen help.
  - *Decision needed:* Decide which PRD §5.5 / §11 Settings extras to include in Phase 4 (in-app reduced-motion toggle, optional sound toggle defaulting off, fuller privacy/credits/install guide).

## 3. Field Validation, GPS & Community Consultation
> See `docs/ROUTE_DATA.md#field-review-handoff`, `docs/done/REVIEW_PHASE_2.md`, `docs/done/REVIEW_PHASE_3.md`, and `docs/PROJECT_SPEC.md` §8 & §19.

- [ ] **Real-device GPS check-in thresholds:**
  - *Current default:* Provisional 75 m check-in radius, <=50 m reported accuracy, <=30 s fix age (`src/config/game.ts`). Tested only via controlled Chromium geolocation injection.
  - *Decision needed:* Test on physical iPhones (Safari) and Android phones (Chrome) at each intended public stopping point and from across the street; record false accepts/rejects and tune thresholds.
- [ ] **On-site walkability & accessibility audit (3 routes):**
  - *Current default:* All 3 routes are map-checked fixtures only; not field-audited.
  - *Decision needed:* Walk and log conditions for **Shijō to Yasaka** (crossings, curb ramps, stopping point before west-gate stairs), **Kamo riverside sidewalk** (Kawabata sidewalk surface, crossings, staying off the lower riverbed), and **Yasaka and Maruyama Park** (stairs signage, park service path access, whether a separate step-free alternative is needed).
- [ ] **Local / resident community consultation:**
  - *Current default:* All routes/places carry `communityInputStatus: "not-consulted"`.
  - *Decision needed:* Gather and document local/resident input before changing consultation labels or presenting routes as publicly endorsed guidance.

## 4. Hosting, Map Provider & Repo Housekeeping
> See `docs/DECISIONS.md` and `docs/PROJECT_SPEC.md` §11 & §19.

- [ ] **HTTPS hosting target for PWA & phone GPS QA:**
  - *Decision needed:* Choose a deployment host (e.g., Vercel) so testers can install the PWA to iOS/Android home screens and verify live GPS over HTTPS.
- [ ] **Long-term map tile/style provider:**
  - *Current default:* OpenFreeMap public Liberty vector tiles (free, no API key, no SLA).
  - *Decision needed:* Keep OpenFreeMap for prototype/showcase, or plan a contracted/self-hosted vector tile provider before broader public traffic?
- [ ] **Offline PWA caching scope (Phase 4):**
  - *Decision needed:* Define what the service worker should cache (app shell + local route catalog only, clearly disclosing that live basemap tiles and GPS require connectivity).
- [ ] **Repository housekeeping:**
  - [ ] Push merged `main` (`1dca433` + new docs) to `origin` when ready.
  - [ ] Delete the merged `phase-2-review` branch (locally and/or on `origin`) once no longer needed for review.
  - [x] Archived the pre-Phase-3 [baseline audit](done/UPTOSPEED.md).
