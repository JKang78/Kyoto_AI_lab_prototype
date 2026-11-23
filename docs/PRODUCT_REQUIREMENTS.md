# Kyoto Flow — Product Requirements Document (PRD)

**Version:** 1.0 (proposal)  
**Status:** Ready for prototype planning; not yet approved for a live public pilot  
**Target:** Kyoto visitors and residents · Mobile-first PWA · English/Japanese  
**Related:** [`design_system.md`](./design_system.md) · [`ENGINEERING_SPEC.md`](./ENGINEERING_SPEC.md)

## 0. Purpose and reading rules

Kyoto Flow is a *resident-considerate exploration platform*. It helps visitors discover enjoyable **verified alternatives to specific congested journeys**, motivates those choices with appropriate local offers, and gives local stakeholders control over which routes and destinations are promoted.

**Product promise (aspirational):** “Discover a different Kyoto, help keep journeys comfortable for residents, and unlock local experiences along the way.”

**Do not claim:** “We prove that you did not take a bus,” “All promoted routes are safe and resident-approved,” “Congestion is live,” “Kyoto City funds our rewards,” or “This coupon is valid in a real store” without direct, current evidence and authorization.

### Evidence labels

Throughout the product, distinguish:

- **Confirmed:** Verified from an authorized source or partner, with provenance and time.
- **Editorial/approved:** Reviewed route or venue under an explicit documented workflow.
- **Forecast:** Model- or publisher-based congestion estimate, clearly identified.
- **Pilot schedule:** A proposed targeting window, *not* a live congestion measurement.
- **Demo:** Seeded synthetic/incomplete data, nonredeemable, not available in production rewards.
- **Hypothesis:** Behavioral expectation to test, not an observed impact.

The prior draft's claim about the cause of weak 2025 Kyoto campaign uptake and its 70.9% short-stay statistic are **not accepted as product truths without independent source verification**. A strong experience-first UI and PWA-first onboarding do not depend on those numbers.

## 1. Problem, opportunity, and theory of change

Kyoto residents experience crowding on certain tourist-heavy transport corridors and in destination neighborhoods. Tourists often choose familiar routes without knowing attractive alternatives. Simple “walk more” rewards can increase engagement without reducing a single crowded bus journey. And redistributing visitors to sensitive residential streets can create a new harm.

**Theory of change:**

1. Identify a particular origin–destination journey where a walking or rail-plus-walking alternative is **feasible, attractive, safe, and appropriate for additional visitors**.
2. Show that alternative at the moment a visitor is deciding how to travel; clearly disclose time, accessibility, weather/comfort implications and any congestion uncertainty.
3. Offer a locally meaningful reward only when eligibility, budget and partner terms are confirmed.
4. Track participation and verifiable checkpoints; collect separate, consented evidence on intended/actual mode choices.
5. Evaluate whether the intervention **incrementally** reduces demand on the targeted bus corridor without displacing harm to another neighborhood.

The product is **not a general-purpose fitness tracker**. It is also **not an official transport planner** and should hand off to trusted turn-by-turn navigation where needed.

## 2. Users and jobs to be done

| Role | Goal | Important constraints |
|---|---|---|
| Short-stay visitor | Find an appealing alternative without installing an app | Unfamiliar streets/language, limited mobile data, low tolerance for signup |
| Longer-stay visitor | Discover quieter culture and shops over several days | Wants saved plans, meaningful rewards and confidence in opening hours |
| Kyoto resident | Enjoy the city without having visitors routed through sensitive streets | Control, transparency, reporting, review process |
| Local merchant / association | Receive suitable visitors and administer capped promotions | No specialized POS required, understandable offer terms, fraud controls |
| City/transport stakeholder | Reduce harmful demand on target routes and evaluate impact | Evidence, equity, safety, privacy, measurable cost effectiveness |
| Pilot administrator | Manage routes, campaigns and incidents | Auditable permissions, approval workflows, revocation powers |

**Accessibility:** Visitors with wheelchairs, strollers, mobility limits, large luggage, or sensory needs must never be given unsupported “step-free” assurances. Unverified accessibility is **unknown**, not “yes.”

## 3. Objectives, metrics, and guardrails

### Primary outcome (pilot, not necessarily observable from app events alone)

**Incremental reduction in use of a targeted congested bus journey attributable to the program**, compared with a contemporaneous control/appropriate counterfactual. Pre-register the method and decision thresholds before collecting results.

**Cost per incremental avoided crowded-bus trip:** pilot operating cost / estimated incremental avoided journeys; report confidence/uncertainty. Avoid treating all completed missions as bus trips avoided.

### Supporting metrics

- **Adoption:** QR landing → route preview → route selected; permission and language funnel.
- **Participation:** started routes, valid waypoint/checkpoint visits, mission completion, reasons for drop-off.
- **Merchant value:** eligible vouchers issued, validated redemptions, participating merchant satisfaction, optional incremental purchase indicators.
- **Resident safeguards:** reports, complaints, observed pedestrian pressure on pilot streets, participating community approval status.
- **Operational safety:** route incident response time, invalid/duplicate redemption attempts, error rates, data freshness, stale feed fallback.
- **Equity:** access without a smartphone app install, Japanese/English availability, mobility constraints, no misleading claims.

**Anti-goals:** maximizing raw steps, daily active users, voucher issuance, or tourist footfall *without* independent resident-benefit evidence.

## 4. Product scope and releases

### R0 — Designable interactive prototype (P0)

Purpose: demonstrate a complete, credible experience to the team, merchants, and city stakeholders. **No actual financial reward** and no public claims of live congestion.

- Four-tab shell; guest entry; EN/JA; illustrated + standard map + list.
- **One** example Kyoto corridor *only after validating its geometry and pedestrian safety*; alternatively a clearly marked demo corridor until validated.
- 2–3 check-in points, 1 mission, 1 clearly labeled nonredeemable demo voucher.
- Fox states `idle`, `arrived`, `reward`; polished but nonintrusive.
- A schedule-based example multiplier clearly marked as **Demo**; no assumption that a real bus is crowded.
- Error states, permission-denied/manual starting point, accessibility, and admin seed controls.

### R1 — Limited field pilot (P0 for operations, requires partners)

Prerequisites: field-verified route, merchant contract and offer terms, resident/community route review, completed privacy notice, functioning redemption backend, approval of measurement protocol, and permissions for any external data.

- One real, reviewed corridor; optional rail + walking alternative.
- At least one contracted merchant, capped and time-limited offer.
- Online server-side geofenced check-ins, voucher issuance, authenticated merchant redemption.
- Explicit congestion-data source or honestly labeled pilot schedule.
- Admin safety takedown and event logging.
- Pilot outcome surveys and consented participation analysis.

### R2 — Expansion (P1)

- 2–3 additional verified corridors; 10–15 vetted POIs across approved areas.
- Richer seasonal themes, digital adventure stamp book, more merchants, curated resident stories.
- Saved route itinerary import and safe amenity overlays.
- Better route rankings and dynamic campaign eligibility when data is reliable.
- Accessibility audits, merchant analytics and resident feedback workflows at greater scale.

### R3 — Later / conditional (P2)

- Bike/e-bike routing after validated street restrictions, bicycle parking, and operator agreements.
- Native companion app only if background tracking or health-data integration is proven necessary.
- Deep local-points integration, partner-funded transit tickets, automated personalization/AI only with verified route constraints.
- Open APIs or city data-sharing agreements, contingent on signed terms.

## 5. Canonical navigation and information architecture

**Bottom tabs:** `Explore` | `Missions` | `Rewards` | `Me` (Settings inside Me). The Explore map is the initial home; the user may switch to List View. Screen visual details live in `design_system.md`.

### Explore

Search, travel mode (Walk / Rail + Walk), filters, vetted map geometry, fox avatar/foreground location, selectable route cards, route detail, optional congestion overlay with provenance, and active-follow checkpoint action. Always provide a conventional navigation handoff.

### Missions

Available/Active/Completed; corridor-specific travel alternatives, local discovery check-ins, stamp-book progress, and explicit reward eligibility. A mission is an instruction with objective completion criteria, not merely a points counter.

### Rewards

Locked/unlocked/used/expired offers; merchant terms, validity, source of reward, and safe verification state. **No invented cash-value coin balance**, no redemption at uncontracted merchants, and no real transit ticket unless a transit partner has agreed.

### Me

EN/JA, tourist/resident preference, mobility and shade preferences, saved routes, privacy/location permissions, clear-data actions, reporting, help and safety links. No account requirement for browsing.

## 6. Core user journeys

### J-01: QR → route preview (guest)

1. Open a QR deep link, e.g., `/explore?route=<approved-id>`.
2. Show route summary immediately; do not gate behind an onboarding carousel or account creation.
3. Let user switch languages, understand walking time and accessibility status, and compare with alternative transport.
4. Ask permission only when starting follow mode/check-in; permit manual start and browsing without it.
5. Preserve route state when switching map/list view or backgrounding and resuming.

**Successful outcome:** User sees an accurate actionable route without a login and knows whether reward eligibility exists.

### J-02: Choose an alternative to a crowded bus

1. User enters origin/destination or selects a curated starting point.
2. App returns up to three safe, reviewed options, clearly showing distance, estimated time, terrain/step-free verification, what might be gained/lost, and crowd data type/time if available.
3. User starts a route; the app may show **a bus-relief bonus** if the current promotion targets an actually supported crowded interval.
4. Foreground location guides the user; the system does not assert passive tracking while the app is closed.
5. User checks in at eligible stops. Completion status indicates only what is verified.

**Successful outcome:** The user understands the alternative and can traverse it without an unsafe map illusion.

### J-03: Complete mission → receive voucher

1. See exact mission rules and offer terms before committing.
2. Submit valid checkpoint visits; retry safely on transient errors.
3. Backend evaluates mission, current campaign eligibility, rate limits, quota and deduplication.
4. If successful, issue **one** server-backed voucher and show an accessible confirmation.
5. If campaign exhausted or expired, show why and a nonreward outcome where appropriate.

**Successful outcome:** No double issuance, no hidden rules, no reward from simulated movement.

### J-04: Merchant redemption

1. Visitor presents eligible voucher or code.
2. Authenticated merchant interface verifies it online and shows offer terms in Japanese and English.
3. Staff confirms; server atomically transitions it to redeemed.
4. Both sides receive outcome. Repeating the request returns existing result rather than a second benefit.
5. If offline, show “Cannot confirm redemption yet”; never present an animated screen as proof of validity.

### J-05: Resident issue report and takedown

1. Resident or visitor reports an issue: private road, unsafe crossing, overcrowding, closed business, inappropriate etiquette messaging.
2. Admin triages severity and can instantly suspend route/campaign publication.
3. Route owner reviews and documents disposition; affected map and mission visibility update without client reinstallation.

### J-06: Research/measurement enrollment

1. If pilot participants are being studied, present a separate, plain-language, opt-in consent flow where required.
2. Keep randomized assignment, survey answers, and analysis identifiers separate from merchant/customer-facing profiles.
3. Permit nonresearch browsing without pressure; define withdrawal and retention policies before pilot.

## 7. Functional requirements and acceptance criteria

P0 = must be met for relevant release; P1 = planned expansion; P2 = future only. “R0” means prototype, “R1” means operational pilot.

| ID | Priority | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-01 | P0 R0 | Anonymous access | Route details visible without auth, location consent, or app install |
| FR-02 | P0 R0 | EN/JA parity | All core navigation, terms, and errors bilingual; no untranslated blockers |
| FR-03 | P0 R0 | Four-tab shell | Explore initial view; tabs preserve selected route and mission |
| FR-04 | P0 R0 | Map / List equivalence | Same route/POI facts and actions in both representations |
| FR-05 | P0 R0 | Standard map safety | Real street topology, crossings/route geometry and attribution visible |
| FR-06 | P0 R0 | Illustrated map | Stylistic layer does not change route geometry or hide critical hazards |
| FR-07 | P0 R0 | Source-aware crowd display | No level shown without type, source and timestamp; unknown/stale state exists |
| FR-08 | P0 R0 | Route comparison | Up to 3 results; duration, distance, route rationale and data certainty |
| FR-09 | P0 R0 | Accessibility status | Step-free badge only after evidence-based verification; otherwise Unknown |
| FR-10 | P0 R0 | Location opt-in | Browsing works when GPS denied; manual starting-point flow exists |
| FR-11 | P0 R0 | Foreground navigation | UI says foreground-only; accuracy uncertainty visible and handled |
| FR-12 | P0 R0 | Missions | Clear criteria, progress, timestamps, route link and expiry |
| FR-13 | P0 R0 | Checkpoint UX | Explicit near/not-near/error states; no falsely credited remote visits |
| FR-14 | P0 R0 | Reward labels | All demonstration rewards unmistakably marked `DEMO — NOT REDEEMABLE` |
| FR-15 | P0 R0 | Fox/celebration | Core states accessible and disabled by reduced-motion preference |
| FR-16 | P0 R0 | Save + return | Saved route persists across tab changes/refresh, subject to local data deletion |
| FR-17 | P0 R0 | Etiquette reminders | Location/context relevant, nonblocking, deduplicated and dismissible |
| FR-18 | P0 R0 | Failure states | GPS denied, network loss, unknown crowd data, invalid/expired offer handled |
| FR-19 | P0 R1 | Route publishing approval | No public route without safe geometry, review record, current version and status |
| FR-20 | P0 R1 | Merchant contract | No redeemable offer without active participating merchant and agreed funding |
| FR-21 | P0 R1 | Server check-in validation | Location/accuracy/time/mission eligibility checked server-side; replay limited |
| FR-22 | P0 R1 | Voucher uniqueness | One eligible grant per entitlement; expiry/quota respected under concurrency |
| FR-23 | P0 R1 | Merchant validation | Staff-authenticated online redemption; atomic confirmation and audit trail |
| FR-24 | P0 R1 | Admin suspension | Operator can disable unsafe routes or offers with immediate effect |
| FR-25 | P0 R1 | Consent/retention | Location use disclosed; raw location minimized; deletion process tested |
| FR-26 | P0 R1 | Pilot evaluation | Control/comparison, predeclared outcome definitions and limitations |
| FR-27 | P1 | Resident content workflow | Contributor review, moderation, provenance, route approval, correction |
| FR-28 | P1 | Merchant analytics | Aggregated claim/redemption counts without exposing visitor trail |
| FR-29 | P1 | Season/ward stamp book | Earned based on valid mission evidence; not a temple-certified goshuin |
| FR-30 | P1 | Itinerary import | Valid KML/CSV with validation, duplicate detection and privacy controls |
| FR-31 | P1 | Advanced route constraints | Shade, luggage and amenity suggestions only with supporting data |
| FR-32 | P2 | Cycling/e-bike | Only allowed on validated legal routes with partner/offline caveats |
| FR-33 | P2 | Points/transit integrations | Require formal agreements, documented APIs and legal review |

## 8. Routing and personalization rules

**Hard constraints first:** safe/public traversable paths, closures, verified accessibility requirements, area capacity/review restrictions, travel-mode legality, and quality of geometry. **Never trade safety for rewards or engagement**.

Among valid routes, rank by a transparent weighted blend of travel time, user interests, comfort, crowd-risk evidence, and opportunity to support participating local venues. Treat “crowd unknown” as unknown, not calm. Begin with **editor-curated** alternatives; do not permit a generative model to invent route geometry or opening hours.

**Route detail must disclose:** why recommended; estimated duration and distance; accessibility confidence; crowd information source and timestamp; review/provenance; how to use standard navigation; and exact mission/reward eligibility.

**Geographic spillover:** Route approval must consider pedestrian footfall, sensitive residential streets, narrow lanes, private access, school routes, bicycle conflicts, and commercial consent. A route designed to avoid a bus can still be rejected on resident-impact grounds.

## 9. Incentive and campaign policy

Two distinct campaign types:

1. **Bus-relief reward:** Encourages a suitable alternative during a **crowded-bus time/corridor**. The bonus may occur during rush/busy hours, not necessarily off-peak.
2. **Quiet-hour destination reward:** Encourages visits outside a **destination's** busiest periods. Requires destination-specific evidence and approved capacity.

**Baseline pilot policy (proposed):** Only campaigns with an owner, eligibility rules, budget cap, start/end in `Asia/Tokyo`, quota and merchant terms may be published. Display multiplier and example value only if actual campaign policy supports it; 2× is an experiment variable, not a guaranteed standard. A time window ending at 10:00 does not imply that the road or bus is busy unless verified.

**Preferred reward instrument:** A partner-funded or pilot-funded **single-use coupon**, not a transferable stored-value currency. No value may be advertised at an uncontracted shop. A visual “quest point” score may exist as a game metric with **no cash value, transferability or stored-value promise**. Review the exact mechanics with counsel before launch under Japanese payment, consumer, tax and privacy rules; avoid categorical legal claims in UI.

**Merchant economics:** Offer value/discount, minimum purchase, maximum redemptions, reimbursement split, refund/chargeback approach, cancellation process and fraud response defined before publication.

**Fairness:** Do not penalize users who cannot walk because of disability or luggage; provide suitable accessible nonwalking alternatives where verified. Do not claim all users are reward-eligible if participation terms differ.

## 10. Data integrity and community governance

### Route governance

Every public route has a named editor, approving reviewer/organization, reviewed map geometry/version, accessibility evidence, allowed time windows, capacity/impact notes, and re-review deadline. `Resident-approved` requires actual documented review by representative local stakeholders; otherwise use `curated`.

### Place governance

Each POI has bilingual verified name, coordinates, category, optional description, content-source notes, operating-hours last verified, legal/public access status, and merchant agreement if promotional. Do not publish user-submitted POIs directly to public routes.

### Congestion governance

Use authorized official or partner data, or a labeled schedule/forecast with no claim of real-time precision. On missing or stale feeds: remove/qualify the recommendation and never fabricate telemetry. A congestion source does not implicitly authorize API scraping or redistribution.

### Report and incident governance

Admin can unpublish unsafe routes instantly, then investigate, revise and republish only after review. Maintain an immutable event/audit history for issuance, redemption and route changes while respecting retention controls.

## 11. Research plan and test design

**Hypothesis H1:** Offering a culturally appealing, verified alternative plus a locally relevant reward increases the share of eligible travelers choosing the alternative over a target bus journey.

**Hypothesis H2:** This change does not cause unacceptable nuisance on the promoted walking path.

**Evaluation example:** Randomize consenting, eligible visitors to (A) alternative route information alone or (B) the same information + clear reward. Compare stated mode choice, actual self-reported behavior, optional consented field observations and, if authorized, corridor-level aggregate ridership signals. Do not describe a GPS check-in as proof a bus was avoided. Analyze by corridor/time and consider weather, holidays, user selection and repeat exposures.

**Minimum pilot dashboard:** eligible users; views/starts/completions; voucher grants and redemption; survey response/attrition; adverse incidents; merchant satisfaction; estimated incremental modal shift with uncertainty. Avoid public-facing “X buses saved” metrics without a defensible design.

**Success thresholds:** Team and stakeholder must **pre-register** numerical thresholds for modal shift, maximum cost per incremental avoided trip, safety complaints, engagement and merchant burden before running R1. Do not retrospectively define success based on whichever metric improves.

## 12. Partnership dependencies

| Partner | Needed for | Prerequisite/permission |
|---|---|---|
| Local merchant | Real coupon | Signed offer terms, capacity, staff validation process |
| Shopping-street association | Venue recruitment, suitable destinations | Participation consent; no assumptions about resident acceptance |
| Neighborhood/resident group | Route impact and appropriateness | Documented review, escalation and right to withdraw recommendation |
| Tourism/city body | Potential dissemination, pilot alignment, congestion data | Explicit approval; never display municipal endorsement by default |
| Map/data provider | Routing and congestion info | API license, attribution and use conditions |
| Transit or bike operator | Transit perks or e-bike offers | Commercial agreement and legal/safety integration |

**Default commercialization path:** merchant coupons + lightweight redemption technology; seek government research/pilot support separately. Do not promise ICOCA, Kyoto Points, LUUP, subway tickets or city funds in the initial MVP.

## 13. Product acceptance scenarios (Given / When / Then)

**AC-01 Guest access:** Given first visit with location blocked, when the user opens a QR link, then the route summary and a manual start selector are usable without auth.

**AC-02 Route safety:** Given a route lacks verified step-free evidence, when accessibility filters are enabled, then the route is excluded or explicitly marked unknown, never shown as verified accessible.

**AC-03 Honest crowds:** Given a congestion feed expires or fails, when the user opens the map, then the system displays an unknown/stale state rather than showing live green/yellow/red bands.

**AC-04 Distinct bonuses:** Given a target bus corridor is busy, when a bus-relief campaign is active, then its label describes **bus relief**, not generic off-peak travel. Quiet-hour campaigns use separate language.

**AC-05 Valid mission:** Given a valid eligible check-in, when submitted once or retried, then the backend records no more than one accepted event and correctly updates mission progress.

**AC-06 Fraud attempt:** Given a simulated check-in or tampered client timestamp in public production, when submitted, then the system does not issue a real reward.

**AC-07 Concurrent redemption:** Given two merchant devices attempt the same voucher, when both redeem, then exactly one succeeds and the other sees an already-redeemed state.

**AC-08 Route takedown:** Given an admin suspends an unsafe route, when a user opens or continues it, then the app clearly warns, stops reward eligibility, and offers a safe alternative or standard navigation.

**AC-09 Localization:** Given a user switches from EN to JA during active navigation, when the screen re-renders, then mission, instructions and offer terms translate without losing route state.

**AC-10 Prototype honesty:** Given an R0 nonredeemable sample coupon, when anyone opens it, then all presentation states visibly say **DEMO — NOT REDEEMABLE**; no real merchant could interpret it as valid.

## 14. Decisions to resolve before first real-world trial

| Question | Working default | Owner / evidence needed |
|---|---|---|
| Which bus corridor? | One field-surveyed candidate | Field team + municipal/transport context |
| Which exact path? | Editor-curated, legally traversable | Mapping + local reviewers |
| Who can claim a voucher? | One guest/session subject to abuse controls | Product + merchant + legal |
| What proves completion? | Foreground location checkpoints; **not** avoided-bus proof | Engineering + research |
| Which local offer? | One capped merchant coupon | Merchant agreement |
| Who funds it? | Merchant promotion or ring-fenced pilot budget | Partnerships |
| What crowd data exists? | Forecast/schedule until authorized feed exists | Data owner |
| What constitutes resident approval? | Documented review and withdrawal pathway | Community partners |
| How will impact be measured? | Predeclared controlled comparison | Research lead |
| What must be accessible? | Equivalent list, honest step-free status, alternative experience | Accessibility lead |

## 15. Explicit exclusions and hand-off

**Do not build for R0:** New transferable Kyoto currency, real subway ticket issuing, ICOCA wallet integration, live Wi-Fi crowd sensors, background iOS step tracking, autonomous AI routing, public reviews, or live merchant settlement.

**Do build first:** One honest, delightful **QR → route preview → safe map/list guidance → location check-ins → demo/contracted reward → redemption confirmation** experience.

The design details for every visual state are defined in [`design_system.md`](./design_system.md). The enforceable backend contracts and rollout controls are defined in [`ENGINEERING_SPEC.md`](./ENGINEERING_SPEC.md). If an implementation cannot satisfy a product truth or safety requirement, **remove or label the feature rather than faking it**.
