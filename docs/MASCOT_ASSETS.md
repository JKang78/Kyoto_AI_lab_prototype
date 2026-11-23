# Mascot artwork

Team-provided fox artwork lives in `public/assets/mascot/`, one 2048 × 2048 transparent PNG per `FoxAvatar` state: `fox-idle.png`, `fox-walking.png`, `fox-arrived.png`, `fox-reward.png` and `fox-warning.png`. The paths are set in `src/config/assets.ts`; `next/image` serves resized copies.

`FoxAvatar` (`src/components/ui.tsx`) frames the art in a cream-and-gold ring. It is used as the map location marker (idle, or walking during a walk), in the follow card (walking, then arrived when a check-in is available) and on the walk-complete receipt (reward). The warning state is ready for the planned etiquette toast. Setting `mascot` to `null` restores the neutral placeholder ring.
