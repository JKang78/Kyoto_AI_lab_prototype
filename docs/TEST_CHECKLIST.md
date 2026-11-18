# Kyoto AI Lab — Test checklist

## Development quality
- [ ] App starts from a clean install with documented commands.
- [ ] Existing lint, TypeScript/typecheck, tests, and production build pass (report missing scripts rather than claiming they ran).
- [ ] No console errors, broken image requests, or unnecessarily downloaded dependencies.
- [ ] Scope of each change stays within agreed feature; no unrelated redesign.
- [ ] Map attribution and geographic data license requirements are met.

## UI and flows
- [ ] At widths 360, 390, 430px, all five tabs usable with safe-area spacing.
- [ ] Main Map follows provided visual reference: reward header, search, chips, real map, custom pins, fox, routes, floating overlays, bottom nav.
- [ ] Default -> search -> route list -> selected route -> place card -> back works.
- [ ] All visible buttons respond; user can exit every popover/sheet.
- [ ] English/Japanese UI works without overflow; selected locale persists.
- [ ] Motion respects reduced-motion preferences; content has accessible contrast and touch targets.

## GPS, demo, data honesty
- [ ] GPS is requested only when explicitly selected; working on HTTPS on supported browser.
- [ ] Permission denied, timeout, no signal, and outside-Kyoto state handled gracefully.
- [ ] GPS watch is stopped when leaving/replacing real tracking.
- [ ] Demo mode is clearly labeled and works without actual Kyoto travel.
- [ ] Real GPS location is not spoofed as Kyoto or falsely claimed as background tracking.
- [ ] Curated routes follow public pedestrian geometry; no path straight through water/buildings.
- [ ] Congestion, reward redemptions, and route personalization are honestly described as simulated/deterministic when applicable.

## Rewards and persistence
- [ ] Each checkpoint award counts exactly once per completion instance, even after GPS rerenders.
- [ ] Coins and missions sync across Map/Home/Rewards/Missions and survive refresh.
- [ ] Claimed mock coupon cannot be redeemed a second time.
- [ ] Reset Demo requires confirmation and resets the demo-only state.
- [ ] PWA can be added to a target phone home screen on HTTPS; GPS still tested on device in that mode.
