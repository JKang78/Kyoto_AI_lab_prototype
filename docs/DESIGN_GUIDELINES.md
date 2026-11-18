# Kyoto AI Lab — Design guidelines

## Visual authority
- `references/map-tab-reference.png`: primary example for **default Map** (left) and **selected route** (right). Visual fidelity is **flexible**, not pixel-perfect. Retain hierarchy and recognizable visual language.
- `references/fox-avatar-reference.png`: fox with red scarf. **Original production assets will be provided later**. Use temporary swappable placeholders until then.
- `PROJECT_SPEC.md` §§4–6 contains the detailed interaction specification.

## Visual character
- Friendly illustrated Kyoto exploration game; soft street/river/park colors and rounded cards, not a generic navigation dashboard.
- `#782459` Kyoto Purple as an anchor, warm cream and soft yellow/gold accents. Secondary palette values are proposals, not final team-approved colors.
- Soft shadows, restrained decorative motifs, legible type, consistent icon treatment, good outdoor contrast. Avoid excessive pink/beige saturation.
- Map pins distinguish shrines/temples, culture, nature/parks, cafés/local shops, and quests/rewards. Fox location marker has a cream/gold circle.

## Layout — map is the hero
1. Floating top reward meter, flower progress icon, next coupon indicator.
2. Prominent destination/route search with recenter action.
3. Horizontally scrolling category chips (Culture, Cafés/Local, Bike/Scooter, More).
4. Full interactive Kyoto map with colored dotted routes, contextual pins, illustrative fox marker, demo-labeled congestion cue.
5. Default map: invitation callout and recommended route pill.
6. Route-selected map: highlighted path, walk-time label, checkpoint pins, location detail card with image/tags/distance, etiquette reminder, quest marker, back/route controls.
7. Bottom map/list action and fixed five-tab nav: Home, Map, Rewards, Missions, Settings; Map selected by default.

## Other screens
- Home: nickname greeting, discovery suggestions, mission/reward progress.
- Rewards: demo coin wallet, rewards catalog, coupon unlock/claim flows **clearly not redeemable**.
- Missions: active quests, checkpoint progress/stamps, completed quests.
- Settings: EN/日本語 toggle, GPS status, Demo Mode, motion settings, reset.

## Interaction standards
- Designed first for ~360–430 px phone width, usable on tablet/desktop for showcases.
- No visual overlays that permanently trap the map or cover all navigation. Provide close/back controls.
- Keep active route, wallet, stamps, and language consistent across tabs and refresh.
- Labels and important messages must have both English/Japanese translations; decorative text should not be baked into images.
- Don't fake full-screen GPS, production AI, or verified government/business relationships.
