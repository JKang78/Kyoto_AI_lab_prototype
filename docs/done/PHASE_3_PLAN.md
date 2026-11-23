# Phase 3 — from a selected walk to a claimed demo coupon

The first walkthrough should let a tester select an existing Kyoto walk, start it, collect each stop, see the same balance on Home and Map, and claim a clearly labelled demo coupon in Rewards. Use the three walks and their ordered places as the basis for three missions. The current route selection and GPS lifecycle provide the starting point. [Build plan](../BUILD_PLAN.md) · [Product specification, sections 7–9 and 13](../PROJECT_SPEC.md)

## Work that can proceed from the specification

| Order | Implementation | How to verify it |
| --- | --- | --- |
| 1 | Add one versioned, browser-local progress record for the active walk instance, collected stops, completed missions, balance and claimed rewards. Keep the existing profile and transient GPS fix separate. | Start with a Phase 2 profile. Switching tabs or languages and refreshing restores game progress. Confirmed reset clears game progress and preserves nickname and locale. |
| 2 | Implement Start Route, next stop, and a demo walk that moves the marker along stored geometry with pause, continue, reset and simulated check-in. | Run from outside Kyoto with GPS permission denied. The demo still reaches each stop and visibly identifies simulation. |
| 3 | Award each checkpoint once per route instance and grant the completion bonus once. Use the same balances and stamp records in Map, Home and Missions. | Double-tap, repeat a location callback, leave Map and refresh after an award. A repeat event cannot increase the balance. A deliberately started new instance follows the replay rules. |
| 4 | Build three bilingual missions and three to five fictional coupons. Show eligibility, insufficient balance, claim and claim history. Save spending and the claim together. Add the labelled sample congestion scenario as a configurable bonus. | Try claiming while locked, at the exact threshold and after a successful claim. Two rapid clicks must spend once. Check the wallet and Map header after reloading. |
| 5 | Gate live check-in on an active route, an explicit tap, proximity to the intended checkpoint and sufficiently accurate live GPS. | Inject fixes inside and outside each threshold, including denied, paused and imprecise states. Switching to demo must never record a simulated action as a live fix. |
| 6 | Run the full walkthrough in English and Japanese and verify reset, repeat completion, narrow layouts and reduced motion. | Extend the existing Chromium suite and repeat the walkthrough after reload. Record physical-phone observations separately. |

## A showcase decision worth making early

The PRD proposes 10 demo coins per checkpoint, 30 for completing a route, and a 100-coin coupon. Each current route has three stops. At those defaults, one ordinary walk earns 60 coins and two earn 120. An automated two-walk demo can use the proposed values immediately. If the presentation needs a claim after one ordinary walk, a 60-coin introductory coupon is a straightforward alternative. Keep thresholds and awards configurable. [Economy defaults](../PROJECT_SPEC.md) · [Current walks](../ROUTE_DATA.md)

## Where people add evidence or make a choice

- **Field GPS and access.** Start software tests with the suggested 75 m proximity and at most 50 m reported error. Someone with a target phone must try the actual approaches, check whether a stamp can be collected from the intended public spot and record false accepts and rejects. Field access and community review are tracked in the [route handoff](../ROUTE_DATA.md#field-review-handoff).
- **Game pacing.** A short playtest can show whether the next stop is obvious, stamps feel rewarding and a coupon arrives at a satisfying point. Decide whether repeat walks should earn a fresh completion bonus and how long the showcase should take.
- **Copy, artwork and public offers.** Draft bilingual mission text and fictional coupons in code. Have a fluent reviewer read the Japanese in context and the team approve any final branded art. Actual merchant offers, redemption terms or partner claims require the merchant's agreement. Fictional rewards allow the prototype to proceed independently.
