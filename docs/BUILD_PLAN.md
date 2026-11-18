# Kyoto AI Lab — Build plan for Cursor

**Rule:** one phase, then one scoped feature at a time. Finish each feature with a running preview, a diff review, and a Git commit. Do not ask Cursor to build the full PRD in a single prompt.

## Phase 0 — Scaffold and design system
- Create Next.js + TypeScript + Tailwind project **in this repository**, without moving or deleting `PROJECT_SPEC.md`, `references/`, `.cursor/rules/`, or `docs/`.
- Add shared design tokens, 5-tab navigation, mobile shell, bilingual message dictionaries, nickname onboarding.
- Gate: `npm run dev` works, tabs respond, 360px/430px screens look intentional.

## Phase 1 — Map proof of concept, visual foundation, and location behavior
- Prototype and compare MapLibre (+ legitimate provider) vs Google Maps, then explicitly choose a map SDK. Record the choice and rationale in `docs/DECISIONS.md`.
- Implement a real, pannable, styled Kyoto map; preserve map provider attribution.
- Add custom pin placeholders, fox marker, search/category chips, top progress banner, bottom map controls.
- Add opt-in browser GPS with accuracy/error/outside-Kyoto status and a clearly separate Kyoto Demo Mode. Stop the watcher on mode change or Map exit; keep live fixes at their actual coordinates.
- Gate: screenshot layout recognizably matches reference and map is genuinely interactive.

## Phase 2 — Route discovery
- Add 3+ validated curated route fixtures; text/category selection and route-selected detail states.
- Validate licensed route fixtures and walking path coordinates before drawing dotted route geometry. Do not infer a route from map endpoints.
- Add place detail cards, sample congestion cues, bilingual descriptions.
- Gate: demonstrated route geometry is walkable, no ghost buttons, and place content is verified.

## Phase 3 — Missions, virtual rewards, and all tabs
- Add simulated route walk, GPS/demo check-in, idempotent stamps/coins, coupon unlock + mock claim.
- Make Home, Rewards, Missions, Settings reflect a single persisted state.
- Gate: run an end-to-end demo twice without duplicate reward awards.

## Phase 4 — PWA, QA, handoff
- Add manifest and suitable icons after original assets arrive, cache shell responsibly, deploy on HTTPS.
- Test English/Japanese, mobile safe areas, motion reduction, PWA install, and error/empty states.
- Gate: complete `docs/TEST_CHECKLIST.md`, write setup instructions, note known limits.

## Repeatable Cursor prompt pattern
> Read `PROJECT_SPEC.md` and the relevant project rule/doc. Implement **only [FEATURE]** from Phase [N]. Before coding, list expected files and approach. Reuse existing components; do not change unrelated UI or install dependencies without explanation. After coding, run available typecheck/lint/tests, inspect the mobile layout if browser tools are available, list changed files and known limitations, and stop.
