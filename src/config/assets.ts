import type { FoxState } from "@/components/ui";

// Team-provided artwork in public/assets. Set a value to null to fall back to the neutral placeholder.
// `mascotAnimated` holds looping GIFs on the same 64 px pixel grid and palette as the static sprites.
// FoxAvatar uses them only when asked to animate and the viewer does not prefer reduced motion.
export const assetPaths: {
  mascot: Record<FoxState, string> | null;
  mascotAnimated: Record<FoxState, string> | null;
  pins: string | null;
} = {
  mascot: {
    idle: "/assets/mascot/pixel/idle.png",
    walking: "/assets/mascot/pixel/walking.png",
    arrived: "/assets/mascot/pixel/arrived.png",
    reward: "/assets/mascot/pixel/reward.png",
    warning: "/assets/mascot/pixel/warning.png",
  },
  mascotAnimated: {
    idle: "/assets/mascot/pixel/animated/idle.gif",
    walking: "/assets/mascot/pixel/animated/walking.gif",
    arrived: "/assets/mascot/pixel/animated/arrived.gif",
    reward: "/assets/mascot/pixel/animated/reward.gif",
    warning: "/assets/mascot/pixel/animated/warning.gif",
  },
  pins: null, // Example: "/assets/pins/"
};
