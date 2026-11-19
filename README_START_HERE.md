# Cursor starter kit — Kyoto AI Lab prototype

Historical starter-kit instructions. The app has since been scaffolded and includes route discovery. Use the [current README](README.md) for setup and testing.

## Contents
- `PROJECT_SPEC.md` — complete baseline PRD and source-of-truth decisions.
- `references/map-tab-reference.png` — actual provided main-screen default and route-selected reference.
- `references/fox-avatar-reference.png` — actual provided avatar inspiration, **not** final original production artwork.
- `.cursor/rules/` — persistent Cursor Agent rules (core / front-end / maps+GPS).
- `docs/` — short implementation guides, roadmap, test checklist, decision log.
- `.cursorignore` and `.gitignore` — reduce context noise and avoid accidental commits of secrets.

## Setup
1. Extract the kit into a new folder, for example `kyoto-ai-lab/`. Open **that folder** as your workspace in Cursor.
2. Verify `.cursor/rules/` and `references/` are present; they may be hidden in some file explorers because `.cursor` begins with a dot.
3. Initialize Git. Commit the kit before code generation.
4. Use **Plan Mode** for Phase 0. Point Cursor to `@PROJECT_SPEC.md`, `@docs/BUILD_PLAN.md`, `@references/map-tab-reference.png` and ask it to scaffold Next.js **in the existing folder**, keeping these files.
5. Switch to **Agent Mode** to implement Phase 0 after reviewing the plan. Verify it runs before moving to Phase 1.
6. Use one task per chat. Review diffs, test locally, and commit after each milestone.

## First prompt (copy into Cursor Plan Mode)
> Read `@PROJECT_SPEC.md`, `@docs/BUILD_PLAN.md`, `@docs/DESIGN_GUIDELINES.md`, and the two images under `@references/`. We are building the Kyoto AI Lab prototype described there, not a generic tourism site. Plan **Phase 0 only**: scaffold Next.js + TypeScript + Tailwind inside this current folder, establish mobile design tokens, a five-tab app shell, English/Japanese dictionaries and nickname welcome. Preserve all existing documents, references and `.cursor` rules. Do not add maps, GPS, accounts, paid services or real rewards yet. Identify the files you will create, verification commands and any risks. Wait for me to approve the plan before implementation.

## To add original fox assets later
Put the team-provided transparent PNG/SVG files in `public/assets/mascot/`, then ask Agent to replace the placeholder components with those original assets without changing their layout.

## Important limitations
- Curated paths should be verified before public use. Demo routes, mock coupons and congestion data must be disclosed.
- GPS needs HTTPS and explicit permission, and does not imply continuous background location tracking.
- Cursor rules instruct Agent, but cannot replace local testing, version control or developer review.
